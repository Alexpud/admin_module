'use strict';

var db = require('../models'),
    exec = require('child_process').exec,
    express = require('express'),
    helpers = require('../helpers'),
    http = require('http'),
    jwt = require('jsonwebtoken'),
    messages = helpers.messages,
    passport = require('passport'),
    requestHelper = helpers.requestHelper,
    router = express.Router();


module.exports = function(app) {
    app.use('/api', router);
};

router.get('/test', (req, res) => {
    db.Container.all({
            where: {
                name: "201110005302"
            },
            include: [{ model: db.Workspace }]
        })
        .then((containerList) => {
            res.send(containerList);
        });
});


/*
 First, it retrieves the containers list from the database then, it uses promises to execute the bash script
 responsible for OS operations with docker, actions like: start, stop, status and create.

 I am using promises because it allows me to wait for all the requests inside the list promises to finish,
 then it executes an action on Promises.all.
 */
router.get('/containers', (req, res, next) => {
    var newContainerList = [],
        promises = [],
        containerStatus = "",
        workspaceStatus = "",
        temp = 0;

    db.Container.all({
            include: [{ model: db.Workspace }]
        })
        .then((containerList) => {
            for (var i = 0; i < containerList.length; i++) {
                promises.push(new Promise((resolve, reject) => {
                    exec("./app/helpers/che_helper_functions.sh container_status " + containerList[i].name,
                        function(err, stdout, stderr) {
                            resolve({ containerStatus: stdout });
                        });
                }));

                if (containerList[i].Workspaces.length > 0) {

                    //For each workspace belonging to the container, get it's status
                    for (var j = 0; j < containerList[i].Workspaces.length; j++) {
                        promises.push(new Promise((resolve, reject) => {
                            exec("./app/helpers/che_helper_functions.sh workspace_status " + containerList[i].Workspaces[j].workspaceID,
                                function(err, stdout, stderr) {
                                    resolve({ workspaceStatus: stdout });
                                });
                        }));
                    }
                }
            }
            Promise.all(promises)
                .then((allData) => {
                    for (var i = 0; i < containerList.length; i++) {
                        containerStatus = allData[temp++].containerStatus.replace('\n', "");
                        containerList[i].setDataValue("status", containerStatus);

                        if (containerList[i].Workspaces.length > 0) {

                            //Add the workspace status to all workspaces belonging to each container
                            for (var j = 0; j < containerList[i].Workspaces.length; j++) {
                                workspaceStatus = allData[temp++].workspaceStatus.replace('\n', "");
                                containerList[i].Workspaces[j].setDataValue("status", workspaceStatus);
                            }
                        }
                    }
                    return containerList;
                })
                .then((containerList) => {
                    requestHelper.sendAnswer(res, containerList, 200);
                });
        })
        .catch((error) => {
            requestHelper.sendAnswer(res, { error: error }, 500);
        });
});

//Gets all the workspaces belonging to a container
router.get("/containers/:name/", (req, res, next) => {
    var promises = [],
        promise;

    db.Container.findOne({
            where: { name: req.params.name },
            include: [{ model: db.Workspace }]
        })
        .then((container) => {
            if (container != null) {
                promise = (new Promise((resolve, reject) => {
                        exec("./app/helpers/che_helper_functions.sh container_status " + container.name, (err, stdout, stderr) => {
                            resolve({ status: stdout });
                        });
                    }))
                    .then((data) => {
                        let response = data.status.replace('\n', "");
                        container.setDataValue("status", response); //.status = data.status;
                    })
                    .then(() => {
                        for (var i = 0; i < container.Workspaces.length; i++) {
                            promises.push(new Promise((resolve, reject) => {
                                exec("./app/helpers/che_helper_functions.sh workspace_status " + container.Workspaces[i].workspaceID, (err, stdout, stderr) => {
                                    resolve({ workspaceStatus: stdout });
                                });
                            }));
                        }

                        Promise.all(promises)
                            .then((allData) => {
                                for (var i = 0; i < container.Workspaces.length; i++) {
                                    var workspaceStatus = allData[i].workspaceStatus.replace('\n', "");
                                    container.Workspaces[i].setDataValue("status", workspaceStatus);
                                }
                                return container;
                            })
                            .then((container) => {
                                requestHelper.sendAnswer(res, container, 200);
                            });
                    });
            } else {
                requestHelper.sendAnswer(res, messages.CONTAINER_DOES_NOT_HAVE_WORKSPACES, 404);
            }
        })
        .catch((error) => {
            requestHelper.sendAnswer(res, messages.CONTAINER_DOES_NOT_EXIST, 404);
        });
});

/*
 It creates a container, both in the database and a container named after the user registration_ID.
 The creation of the container on the system is made using a bash script placed on public.
 */

router.post('/containers/:name', function(req, res, next) {
    var new_container_port_value = 0;

    // Returns a list ordered by the container port in descending order.
    db.Container.findAll({
            limit: 1,
            order: [
                ['port', 'DESC']
            ]
        })
        .then((containerList) => {
            if (containerList.length == 0) {
                new_container_port_value = 8090;
            } else { //Grabs the biggest value, increase it by one
                new_container_port_value = containerList[0].port + 1;
            }

        })
        .then(() => {
            var promise = new Promise((resolve, reject) => {
                    exec("./app/helpers/che_helper_functions.sh create " + req.params.name + " " + new_container_port_value,
                        function(err, stdout, stderr) {
                            resolve({ response: stdout });
                        });
                })
                .then((data) => {
                    var response = data.response.replace('\n', "");

                    if (response == "Success") {
                        db.Container.create({
                                port: new_container_port_value,
                                name: req.params.name,
                                UserLogin: req.params.name
                            })
                            // Container created
                            .then(() => {
                                requestHelper.sendAnswer(res, {}, 201);
                            })
                            // Failed to create the container, failed on some restraint
                            .catch((err) => {
                                requestHelper.sendAnswer(res, { error: err.errors }, 409);
                            });
                    } else if (response == "Error: Container already exists") {
                        requestHelper.sendAnswer(res, messages.CONTAINER_ALREADY_EXISTS, 409);
                    } else {
                        requestHelper.sendAnswer(res, { error: response }, 500);
                    }
                })
                .catch((error) => {
                    requestHelper.sendAnswer(res, { error: error }, 500);
                });
        });

});


// Starts a containers
router.post('/containers/:name/start', (req, res, next) => {
    db.Container.findOne({
            where: { name: req.params.name }
        })
        .then((container) => {

            // No container with the description passed on the request exists
            if (container != null) {
                var promise = new Promise((resolve, reject) => {
                        exec("./app/helpers/che_helper_functions.sh start " + container.name,
                            (err, stdout, stderr) => {
                                resolve({ response: stdout });
                            });
                    })
                    .then((data) => {
                        let response = data.response.replace('\n', "");

                        //If it is an error messages, docker error messages will begin with Error, so the first letter is E
                        if (response == "Success") {
                            requestHelper.sendAnswer(res, {}, 204);
                        } else {
                            requestHelper.sendAnswer(res, { error: response }, 404);
                        }
                    })
                    .catch((error) => {
                        requestHelper.sendAnswer(res, { error: error }, 500);
                    });
            } else {
                requestHelper.sendAnswer(res, messages.CONTAINER_DOES_NOT_EXIST, 404);
            }
        })
        .catch((error) => {
            requestHelper.sendAnswer(res, error, 404);
        });
});

router.delete('/containers/:name/stop', (req, res, next) => {
    db.Container.findOne({
            where: { name: req.params.name }
        })
        .then((container) => {
            if (container != null) {
                var promise = new Promise((resolve, reject) => {
                        exec("./app/helpers/che_helper_functions.sh stop " + container.name,
                            (err, stdout, stderr) => {
                                resolve({ response: stdout });
                            });
                    })
                    .then((data) => {
                        let response = data.response.replace('\n', "");
                        if (response == "Success") {
                            requestHelper.sendAnswer(res, {}, 204);
                        } else {
                            requestHelper.sendAnswer(res, { error: response }, 500);
                        }
                    });
            } else {
                requestHelper.sendAnswer(res, messages.CONTAINER_DOES_NOT_EXIST, 404);
            }
        });
});

router.delete('/containers/:name/delete', (req, res, next) => {
    db.Container.findOne({
            where: { name: req.params.name }
        })
        .then((container) => {
            container.destroy({ force: true }).on('success', function(msg) {
                var promise = new Promise((resolve, reject) => {
                        exec("./app/helpers/che_helper_functions.sh delete " + container.name,
                            (err, stdout, stderr) => {
                                resolve({ response: stdout });
                            });
                    })
                    .then((data) => {

                        let response = data.response.replace('\n', "");
                        console.log(response);
                        if (response == "Success") {
                            requestHelper.sendAnswer(res, {}, 204);
                        } else {
                            requestHelper.sendAnswer(res, { error: response }, 500);
                        }
                    });
            });
        });
});