'use strict';
angular
  .module('app.headerArea')
    .component('headerArea',
    {
      templateUrl: "/js/angular/header/header-template.html",
      controller: ('headerCtrl',
      ['$http', '$routeParams',
        function HeaderAreaController($scope,$localStorage)
        {
          var self = this;

          self.token = localStorage.getItem('token');
          /*
           Gets a list of containers from backend
           */
        }
      ]),
      controllerAs: 'headerCtrl'
    });
