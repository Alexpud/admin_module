angular.module('loginForm').
    component('loginForm',
    {
      templateUrl: "/js/angular/login-form/login-form.template.html",
      controller:
        ['$http', '$routeParams',
          function LoginFormController($http,$localStorage)
          {
            var self = this;
            self.login = function(user)
            {
              var data =
              {
                  login: user.username,
                  password:user.password
              };

              var config = [{'params': user.username}];

              // console.log(user.username);
              $http.post('http://localhost:3000/api/login',data,config).
                then(function(response)
                {
                  console.log(response.data.token);
                  localStorage.setItem('token',response.data.token);
                },function(argument) {
                  if(argument.data.erro) //redirect ?
                  {
                    alert("Erro de autenticação");
                  }
                });
            };
          }
        ]
    });
