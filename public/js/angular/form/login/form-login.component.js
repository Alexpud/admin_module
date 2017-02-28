angular
  .module('app.loginForm')
  .component('loginForm',
    {
      templateUrl: "/js/angular/form/login/form-login.template.html",
      controller:
        ['$http','$q','$routeParams','User','Container','$location',
          function UserFormController($http,$q,$localStorage,User,Container,$location) {
            var self = this;

            self.login = function(user) {
              var data = {
                login: user.userName,
                password: user.password
              };

              var config = [{'params': user.userName}];
              User.signIn(data,config)
                .then((response) => {
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
            };
          }
        ],
        controllerAs: 'loginCtrl'
    });
