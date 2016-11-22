angular.
  module('containerService',[]).
    factory('container', [function()
    {
      console.log("my balls");
      return {
        print: function() {
          return {"nome":"asdasd"};
        }
      }
    }]);