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
          self.currentUser = User.user;


          self.hide = function()
          {
            console.log("lol");
            var menuArea = angular.element(document.querySelector('#drawer'));
            menuArea.toggleClass("open");
          };
          console.log(User.user);
        }
      ]),
      controllerAs: 'headerCtrl'
    });
