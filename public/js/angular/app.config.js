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
                window.location.replace('/#/management');
              else
                return '<login-form></login-form>';
            }
          })
          .when('/management',
          {
            template: function()
            {
              //If user is signedIn
              if (localStorage.getItem('token'))
              {
                var user = JSON.parse(localStorage.getItem('user'));
                if (user.admin)
                  return '<admin-management-area></admin-management-area>';
                else
                  return '<user-management-area></user-management-area>'
              }
              else
              {
                alert("Please sign in");
                window.location.replace('/#/');
              }
            }
          })
          .when('/management/creation',
            {
              template: function()
              {
                // If user is signedIn
                if(localStorage.getItem('token'))
                  return '<workspace-form></workspace-form>';
                else
                {
                  alert("Please sign in");
                  window.location.replace('/#/');
                }
              }
            });
      }
    ]);
