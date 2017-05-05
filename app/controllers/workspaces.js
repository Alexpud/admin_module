"use strict";
var workspaceHelper = require('../helpers/workspaceHelper');
var db = require('../models'),
    exec = require('child_process').exec,
    express = require('express'),
    helpers = require('../helpers'),
    http = require('http'),
    messages = helpers.messages,
    request = require('request'),
    requestHelper = helpers.requestHelper,
    workspaceHelper = helpers.workspaceHelper,
    router = express.Router();

module.exports = function(app) {
    app.use('/api', router);
};

//Returns an array of jsons containing the tuples of workspace table
router.get('/containers/workspaces', (req, res, next) => {
    var newWorkspaceList = [],
        promises = [];

    db.Workspace.findAll()
        .then((workspaceList) => {
            for (var i = 0; i < workspaceList.length; i++) {
                promises.push(new Promise(function(resolve, reject) {
                    exec("./app/helpers/che_helper_functions.sh workspace_status " + workspaceList[i].workspaceID,
                        function(err, stdout, stderr) {
                            resolve({ status: stdout });
                        });
                }));
            }

            Promise.all(promises)
                .then((allData) => {
                    for (var i = 0; i < workspaceList.length; i++) {
                        var workspace_status = allData[i].status.replace('\n', "");
                        workspaceList[i].setDataValue("status", workspace_status);
                    }
                    return workspaceList;
                })
                .then((workspaceList) => {
                    requestHelper.sendAnswer(res, workspaceList, 200)
                });
        });
});

router.get('/containers/:containerName/workspaces', function(req, res, next) {
    var newWorkspaceList = [],
        promises = [];

    db.Workspace.all({
            where: { containerName: req.params.containerName }
        })
        .then((workspaceList) => {
            for (var i = 0; i < workspaceList.length; i++) {
                promises.push(new Promise(function(resolve, reject) {
                    exec("./app/helpers/che_helper_functions.sh workspace_status " + workspaceList[i].workspaceID,
                        function(err, stdout, stderr) {
                            resolve({ status: stdout });
                        });
                }));
            }

            Promise.all(promises)
                .then((allData) => {
                    for (var i = 0; i < workspaceList.length; i++) {
                        var workspace_status = allData[i].status.replace('\n', "");
                        workspaceList[i].setDataValue("status", workspace_status);
                    }
                    return workspaceList;
                })
                .then((workspaceList) => {
                    requestHelper.sendAnswer(res, workspaceList, 200);
                });
        });
});

//Creates a workspace
router.post('/containers/:containerName/workspaces/:workspaceName', (req, res, next) => {
    var workspaceName = req.params.workspaceName,
        workspaceStack = req.body.workspaceStack,
        containerName = req.params.containerName;
    console.log("backend");
    console.log(workspaceName);
    console.log(workspaceStack);
    db.Container.findOne({
            where: { name: containerName },
            include: [{ model: db.Workspace }]
        })
        .then((container) => {

            //If the container which will have the workspace exists
            if (container != null) {

                //Checks if the user already have a workspace. If he has, he can't create another workspace.
                if (container.Workspaces.length != 0) {
                    res.send({ error: "Can't have more than one workspace per user" });
                }

                //Makes a get request to the API to check if the container is running
                var promise = new Promise(function(resolve, reject) {
                        exec('curl  -H "Accept: application/json" -X GET http://localhost:3000/api/containers/' + container.name + '/',
                            function(err, stdout, stderr) {
                                resolve({ response: stdout });
                            });
                    })
                    .then((data) => {
                        //It returns a container JSON with it's workspaces.
                        var response = (JSON.parse(data.response));
                        console.log(response.status == "Running");
                        if (response.status == "Running") {
                            var promise = new Promise((resolve, reject) => {

                                    var workspaceHelpers = new workspaceHelper(workspaceStack);
                                    workspaceHelpers.setWorkspaceName(workspaceName);

                                    request({
                                        url: 'http://localhost:' + container.port + '/api/workspace?attribute=stackId:' + workspaceStack + '&Password=password',
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        json: workspaceHelpers.model
                                    }, function(error, response, body) {
                                        console.log(response.body);
                                        resolve({ data: response.body.id });
                                    });
                                })
                                .then((response) => {
                                    console.log(response);
                                    let workspaceID = response.data;

                                    if (workspaceID == "") {
                                        requestHelper.sendAnswer(res, message.WORKSPACE_CREATION_FAILED, 500);
                                    } else {
                                        db.Workspace.create({
                                                containerName: containerName,
                                                workspaceName: workspaceName,
                                                workspaceID: workspaceID,
                                                stack: workspaceStack
                                            })
                                            .then(() => {
                                                requestHelper.sendAnswer(res, {}, 201);
                                            })
                                            .catch((error) => {
                                                requestHelper.sendAnswer(res, messages.WORKSPACE_ALREADY_EXISTS, 409);
                                            });
                                    }
                                });
                        } else {
                            requestHelper.sendAnswer(res, messages.CONTAINER_MUST_BE_RUNNING, 500);
                        }
                    });
            } else {
                requestHelper.sendAnswer(res, messages.CONTAINER_MUST_BE_RUNNING, 404);
            }
        });
});


/*
  It receives a workspaceName, it will search for it in the database. If it is found, it will attempt
  to start the workspace
 */
router.post('/containers/:containerName/workspaces/:workspaceName/start', (req, res, next) => {
    db.Workspace.findOne({
            where: { workspaceName: req.params.workspaceName },
            include: [{
                model: db.Container,
                where: { name: req.params.containerName }
            }]
        })
        .then((workspace) => {
            if (workspace != null) {
                let containerPort = workspace.Container.port;
                var promise = new Promise(function(resolve, reject) {
                        request({
                            url: 'http://ec2-54-218-7-198.us-west-2.compute.amazonaws.com:' + containerPort + '/api/workspace/' + workspace.workspaceID + '/runtime',
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            json: { 'password': 'password' }
                        }, (error, response, body) => {
                            resolve({ data: response.body.id });
                        });
                    })
                    .then((response) => {

                        //When the operation is successful, CHE api returns a message with an empty body.
                        if (response.data.status != "") {
                            requestHelper.sendAnswer(res, {}, 204);
                        }

                        //When it fails, the message body contains the error message.
                        else {
                            requestHelper.sendAnswer(res, { error: response.data }, 500);
                        }
                    });
            } else {
                requestHelper.sendAnswer(res, messages.WORKSPACE_NOT_FOUND, 404);
            }
        });
});


router.delete('/containers/:containerName/workspaces/:workspaceName/stop', (req, res, next) => {
    db.Workspace.findOne({
            where: { workspaceName: req.params.workspaceName },
            include: [{
                model: db.Container,
                where: { name: req.params.containerName }
            }]
        })
        .then((workspace) => {
            var promise = new Promise((resolve, reject) => {
                    let containerPort = workspace.Container.port;
                    exec('curl -H "Content-Type: application/json" -X "DELETE" http://ec2-54-218-7-198.us-west-2.compute.amazonaws.com:' + containerPort + '/api/workspace/' + workspace.workspaceID + '/runtime?Password=password',
                        function(err, stdout, stderr) {
                            resolve({ response: stdout });
                        });
                })
                .then((data) => {

                    if (data.response.length == 0 || data.response.indexOf('STOPPED') != -1) {
                        requestHelper.sendAnswer(res, messages.WORKSPACE_STOP_SUCCESS, 200);
                    } else {
                        requestHelper.sendAnswer(res, { error: data.response }, 500);
                    }
                });
        })
        .catch((error) => {
            requestHelper.sendAnswer(res, { error: error }, 500);
        });
});

/*
  It searches in the database for the the workspace, checks if the container that hosts the workspace
   is on, if it is it will send a request do deleete the workspace. If it isn't, it will do nothing.
 */

router.delete('/containers/:containerName/workspaces/:workspaceName/delete', (req, res, next) => {
    db.Workspace.findOne({
            where: { workspaceName: req.params.workspaceName },
            include: [{
                model: db.Container,
                where: { name: req.params.containerName }
            }]
        })
        .then((workspace) => {

            if (workspace != null) {
                var promise = new Promise((resolve, reject) => {
                        exec("./app/helpers/che_helper_functions.sh container_status " + workspace.Container.name,
                            function(err, stdout, stderr) {
                                resolve({ status: stdout });
                            });
                    })
                    .then((data) => {

                        //The message retrieved from the bash script comes with \n in the the message, the operation bellow removes it
                        var status = data.status.replace('\n', "");
                        if (status == "Running") {

                            // If a workspace with the data passed was found.
                            if (workspace != null) {
                                var promise = new Promise((resolve, reject) => {
                                        let containerPort = workspace.Container.port;
                                        //exec('curl -H "Content-Type: application/json" -X "DELETE" http://localhost:' + containerPort + '/api/workspace/' + workspace.workspaceID + '?Password=password',
                                        exec('curl -H "Content-Type: application/json" -X "DELETE" http://ec2-54-218-7-198.us-west-2.compute.amazonaws.com:' + containerPort + '/api/workspace/' + workspace.workspaceID + '?Password=password',
                                            function(err, stdout, stderr) {
                                                resolve({ response: stdout });
                                            });
                                    })
                                    .then((data) => {
                                        //If the response length is zero, it means the DELETE action was successful
                                        if (data.response.length == 0) {
                                            workspace.destroy();
                                            requestHelper.sendAnswer(res, {}, 204);
                                        } else {
                                            requestHelper.sendAnswer(res, { error: data.response }, 500);
                                        }
                                    });
                            } else {
                                requestHelper.sendAnswer(res, messages.WORKSPACE_NOT_FOUND, 409);
                            }
                        }

                        //Container is not running
                        else {
                            requestHelper.sendAnswer(res, { error: data.status }, 500);
                        }
                    });
            } else {
                requestHelper.sendAnswer(res, messages.WORKSPACE_NOT_FOUND, 409);
            }
        })
        .catch((error) => {
            requestHelper.sendAnswer(res, { error: error }, 500);
        });
});