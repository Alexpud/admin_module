angular
  .module('headerArea')
    .component('headerArea',
    {
      templateUrl: "/js/angular/header-area/header-area-template.html",
      controller: ('headerCtrl',
      ['$http', '$routeParams',
        function HeaderAreaController($scope)
        {
          var self = this;

          /*
           Gets a list of containers from backend
           */
        }
      ]),
      controllerAs: 'headerCtrl'
    });