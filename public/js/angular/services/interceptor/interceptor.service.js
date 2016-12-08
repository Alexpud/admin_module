angular
  .module('service.interceptor')
  .factory('responseInterceptor',function()
  {
    return {
      response: function(response){
        return response;
      },
      responseError: function(response){
        return response;
      }
    }
  });