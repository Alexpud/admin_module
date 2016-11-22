angular.module('loginForm').
    component('loginForm',
    {
      templateUrl: "/js/angular/login-form/login-form.template.html",
      controller:
        ['$http', '$routeParams','$timeout',
          function LoginFormController($http,$localStorage,$timeout)
          {
            var self = this;
            
            self.error = false;

            self.resetError = function () {
              self.error = false;
            }

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
                  
                  
                  if(response.status === 400 || response.status === 500 || response.status === 401)
                  {
                    self.error = true;
                    $timeout(function(){
                      self.error = false;
                    },2000);
                  }

                  if(response.status === 200)
                  {
                    console.log(response.data.token);
                    localStorage.setItem('token',response.data.token);
                  }

                  //Test get, remove later.
                 // $http.get('http://localhost:3000/api/users', [{}]).then(function(success){
                 //    console.log("Usuário: "+success.data.login);
                 //    console.log("Admin: "+success.data.isAdmin);
                 //  }, function(fail){console.log(fail);});

                },function(argument) {
                  if(argument.data) 
                  {
                    console.log("Entrou ?")
                    self.error = true;
                     $timeout(function(){
                      self.error = false;
                     },4000);
                  }
                });
            };
          }
        ]
    });
