angular.
  module('services',[]).
    service('ContainerService', function()
    {
      console.log("my balls");
      this.print = function() {
          return {"nome":"asdasd"};
        };
      }
    );