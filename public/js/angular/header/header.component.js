'use strict';
angular
  .module('app.headerArea')
  .component('headerArea',
    {
      templateUrl: "/js/angular/header/header-template.html",
      controller: ('headerCtrl',
      ['$http', '$routeParams', 'User',
        function HeaderAreaController($scope,$localStorage,User)
        {
          var self = this;
          self.currentUser = User;

          self.hide = function()
          {
            var menuArea = angular.element(document.querySelector('#drawer'));
            menuArea.toggleClass("open");
          };

          self.logOut = function()
          {
            User.signOut();
          };
        }
      ]),
      controllerAs: 'headerCtrl'
    });
