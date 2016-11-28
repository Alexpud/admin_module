angular
  .module('service.user')
  .factory('User', function()
  {
    var self =this;
    self.user = "";

    return self;
  });