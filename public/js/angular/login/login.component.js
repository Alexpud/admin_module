angular
  .module('app.loginForm')
  .component('loginForm',
    {
      templateUrl: "/js/angular/login/login.template.html",
      controller:
        ['$http', '$routeParams','User','$location',
          function UserFormController($http,$localStorage,User,$location)
          {
            var self = this;

            self.login = function(user)
            {
              var data =
              {
                login: user.userName,
                password: user.password
              };
              var config = [{'params': user.userName}];
              User.signIn(data,config).then(function(response)
              {
                console.log(response);
                if(response.status == 'success')
                {
                  localStorage.setItem('user',user.userName);
                  $location.path('/management');
                }
              });
            };
          }
        ],
        controllerAs: 'loginCtrl'
    });
