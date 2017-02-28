angular
  .module('app.headerArea')
  .component('headerArea',
    {
      templateUrl: "/js/angular/header/header-template.html",
      controller: ('headerCtrl',
        ['$q', 'User','Container','$location','$window',
        function HeaderAreaController($q,User,Container,$location,$window)
        {
          var self = this;
          self.user = User;

          self.hide = function()
          {
            var menuArea = angular.element(document.querySelector('#drawer'));
            menuArea.toggleClass("open");
          };

          self.logOut = function()
          {
            var currentUser = JSON.parse(localStorage.getItem('user'));
            User.signOut();
            $q.resolve(Container.executeContainerAction("stop",currentUser.name))
            .then((response) => {
              if(response.status != 204) {
                alert("error");
              }
              else{
                $window.location.reload();
              }
            });
          };
        }
      ]),
      controllerAs: 'headerCtrl'
    });
