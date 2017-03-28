angular
  .module('app.loginForm')
  .component('loginForm',
    {
      templateUrl: "/js/angular/form/login/form-login.template.html",
      controller:
        ['$http','$q','$routeParams','User','Container','$location',
          function UserFormController($http,$q,$localStorage,User,Container,$location) {
            var self = this;

            self.creatingContainer = false;

            self.login = function(user) {
              var data = {
                login: user.userName,
                password: user.password
              };

              var config = [{'params': user.userName}];
              var promises = [];
              User.signIn(data, config)
                .then((signInResponse) =>{
                  var containerExists = false,
                    createSuccess = false;

                  if(signInResponse.status == 'success'){

                    Container.executeContainerAction("getContainer", user.userName)
                      .then((getResponse) => {

                        //Container exists, so it can be started
                        if(getResponse.status == 200){
                          containerExists = true;

                          Container.executeContainerAction("start",user.userName)
                            .then((startResponse) => {
                              if(startResponse.response.status != 204){
                                containerStart = 'Failed'
                              }
                              else{
                                var user = JSON.parse(localStorage.getItem('user'));
                                console.log(user);
                                $location.path('/management');
                              }
                            });
                        }

                        else{
                          self.creatingContainer = true;
                          Container.executeContainerAction("create", user.userName)
                            .then((createResponse) => {

                              if(createResponse.response.status == 201){
                                self.creatingContainer = false;

                                Container.executeContainerAction("start",user.userName)
                                  .then((startResponse) => {
                                    if(startResponse.response.status != 204){
                                      containerStart = 'Failed'
                                    }
                                    else{
                                      var user = JSON.parse(localStorage.getItem('user'));
                                      $location.path('/management');
                                    }
                                  });
                              }
                              else{
                                self.creatingContainer = false;
                                console.log("Error when creating container");
                              }
                            });
                        }
                      });
                  }
                });
                  // Checks if the user container exists
                 /*   promises.push(new Promise((resolve,reject) => {
                      Container.executeContainerAction("getContainer", user.userName)
                        .then((getResponse) => {
                          if(getResponse.data.error){
                            resolve({"containerExists": false});
                          }
                          containerExists = true;
                          resolve({"containerExists": true });
                        });
                      }));

                    // Tries to create the user container if it doesn't exits
                    promises.push(new Promise((resolve, reject) =>{
                      Container.executeContainerAction("create2", user.userName)
                        .then((createResponse) => {
                          console.log(createResponse);
                          if(createResponse.status == 201){
                            resolve({"containerCreated": true});
                          }
                          console.log("Failed to create a container");
                          resolve({"containerCreated": false, "error": true});
                        });
                      }));
                  }

                  // If the container didn't start,
                  promises.push(new Promise((resolve, reject) => {
                    Container.executeContainerAction("start2",user.userName)
                      .then((startResponse) => {
                        console.log(startResponse);
                        if(startResponse.status != 204){
                          resolve({"startResult": 'Failed'});
                        }
                        else{
                          var user = JSON.parse(localStorage.getItem('user'));
                          $location.path('/management');
                        }
                    });
                  }));

                  Promise.all(promises).then((data) =>{
                    console.log(data);
                  });
                });*/
              /*
              User.signIn(data, config)
                .then((signInResponse) =>{
                  var container = "";
                  if(signInResponse.status == 'success'){
                    $q.resolve(Container.executeContainerAction("getContainer", user.userName))
                      .then((getResponse) =>{
                        console.log(getResponse);
                        if(getResponse.data.error){
                          $q.resolve(Container.executeContainerAction("create", user.userName))
                            .then((createResponse) =>{
                              console.log(createResponse);
                              console.log("teste");
                            });
                        }
                        $q.resolve(Container.executeContainerAction("start",user.userName))
                          .then((startResponse) => {
                            console.log(startResponse);
                            if(startResponse.status != 204){

                            }
                            else{
                              console.log("lol");
                              var user = JSON.parse(localStorage.getItem('user'));
                              $location.path('/management');
                            }
                          });
                      });
                  }
                });
              /*
              $q.resolve(Container.executeContainerAction("getContainer", user.userName))
                .then((responseS) =>{
                  console.log(responseS);

                var config = [{'params': user.userName}];
                User.signIn(data,config)
                  .then((response) => {
                    console.log(user);
                    if(response.status == 'success') {
                      $q.resolve(Container.executeContainerAction("start",user.userName))
                      .then((response) => {

                        if(response.status != 204){

                        }
                        else{
                          var user = JSON.parse(localStorage.getItem('user'));
                          $location.path('/management');
                        }
                        console.log(response);
                      });
                    }
                });
              });*/
          }
        }
        ],
        controllerAs: 'loginCtrl'
    });
