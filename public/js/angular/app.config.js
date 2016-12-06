angular
  .module('adminApp')
    .config(['$locationProvider', '$routeProvider',
      function config($locationProvider, $routeProvider)
      {

        $routeProvider
          .when('/', {
            template: function()
            {
             // If there is a token on the browser
              if (localStorage.getItem('token'))
              {
                var user = JSON.parse(localStorage.getItem('user'));
                if(user.admin)
                  return '<admin-management-area></admin-management-area>';
                else
                  return '<user-management-area></user-management-area>'
              }
              else
              {
                return '<login-form></login-form>';
              }
           }
          })
          .when('/management',
          {
            template: function() {
              if (localStorage.getItem('token')) {
                var user = JSON.parse(localStorage.getItem('user'));
                console.log("asddasd" + user.admin);
                if (user.admin)
                  return '<admin-management-area></admin-management-area>';
                else
                  return '<user-management-area></user-management-area>'
              }
            }
          })
          .when('/management/creation',
            {
              template: function()
              {
                if(localStorage.getItem('token'))
                {
                  console.log("asdasd");
                  return '<workspace-form></workspace-form>';
                }
                else
                {
                  alert("Please sign in");
                  return '<login-form></login-form>';
                }
              }
            });
      }
    ]);
