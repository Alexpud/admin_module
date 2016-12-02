angular
  .module('service.user')
  .factory('User',['$http', function($http)
  {
    var self =this;
    self.user = "";

    self.isAuthenticated = function()
    {
      console.log(localStorage.getItem('token') != "");
      return localStorage.getItem('token') != "";
    };

    self.signIn = function(user,config)
    {
      return $http.post('http://localhost:3000/api/users/:login/authenticate',user,config)
      .then(function(response)
      {
        console.log(response);
        localStorage.setItem('token',response.data.token);
        self.user = user.userName;
        self.admin = false;
        return {status:'success'};
      },function(argument) {
        if(argument.data.erro) //redirect ?
        {
          alert("Erro de autenticação");
          return {status: 'error', content: argument};
        }
      });
    };

    self.signOut = function()
    {
      localStorage.setItem('user',"");
      localStorage.setItem('token',"");
    };

    return self;
  }]);