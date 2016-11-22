'use strict';
angular
  .module('core.management')
  .service('Management',['$resource',
    function($resource) {
      console.log("test");

      this.get = function()
      {
        console.log('lol');
      }
    }
  ]);
