angular
  .module('app.loginForm')
    .component('loginForm',
    {
      templateUrl: "/js/angular/login/login.template.html",
      controller:
        ['$http', '$routeParams','User',
          function LoginFormController($http,$localStorage,User)
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

              $http.post('http://localhost:3000/api/users/:login/authenticate',data,config).
                then(function(response)
                {
                    console.log(response.data.token);
                    localStorage.setItem('token',response.data.token);
                    User.user = user.userName;
                },function(argument) {
                  if(argument.data.erro) //redirect ?
                  {
                    alert("Erro de autenticação");
                  }
                });
            };
          }
        ],
        controllerAs: 'loginCtrl'
    });
