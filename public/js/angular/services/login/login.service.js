angular
  .module('service.login')
  .factory('Login',
    ['$resource','$http',function($resource,$http)
    {
      var self = this;
      self.user = "";

      self.isAuthenticated = function()
      {
        return localStorage.getItem('token') == "";
      };

      self.signIn = function(user)
      {
        $http.post('http://localhost:3000/api/users/:login/authenticate',user)
        .then(function(response)
          {
            console.log(response);
            localStorage.setItem('token',response.data.token);
            User.user = user.userName;
            User.admin = response.data.admin;
            console.log(User);
          },function(argument) {
            if(argument.data.erro) //redirect ?
            {
              alert("Erro de autenticação");
            }
          });
      };

      return self;

    }]);