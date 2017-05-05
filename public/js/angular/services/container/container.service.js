'use strict';
angular
    .module('service.container')
    .service('Container', ['$resource', '$http', '$q', 'responseInterceptor', function($resource, $http, $q, responseInterceptor) {
        var self = this;
        var defer = $q.defer();

        self.Container = $resource('http://ec2-54-218-7-198.us-west-2.compute.amazonaws.com:3000/api/containers/:containerName/:action', null, {
            'create': { method: 'POST', interceptor: responseInterceptor },
            'getContainer': { method: 'GET', interceptor: responseInterceptor },
            'start': { method: 'POST', interceptor: responseInterceptor },
            'stop': { method: 'DELETE', interceptor: responseInterceptor },
            'delete': { method: 'DELETE', interceptor: responseInterceptor }
        });
        /*
          Uses $q and promises to wait for the API response so that it can return an accurate response and status.
        */
        self.executeContainerAction = (action, containerName) => {
            switch (action) {
                case 'create':
                    return $http({
                        method: 'POST',
                        url: 'http://ec2-54-218-7-198.us-west-2.compute.amazonaws.com:3000/api/containers/' + containerName
                    }).then((response) => {
                        return { response: response };
                    });
                    break;

                case 'start':
                    return $http({
                        method: 'POST',
                        url: 'http://ec2-54-218-7-198.us-west-2.compute.amazonaws.com:3000/api/containers/' + containerName + '/start'
                    }).then((response) => {
                        return { response: response };
                    });
                    break;
                    /*  
                    case 'create':
                      var result = self.Container.create({
                        containerName: containerName,
                      },{})
                      .$promise.then(function (response) {
                        defer.resolve(result);
                        return response;
                      });
                      return defer.promise;
                      break;

                    case "start":
                      var result = self.Container.start({ 
                        containerName: containerName, 
                        action: 'start' 
                      },{}).$promise.then(function(response){
                        defer.resolve(result);
                        return response;
                      });
                      return defer.promise;
                      break;
                    */
                case "stop":
                    var result = self.Container.stop({
                            containerName: containerName,
                            action: 'stop'
                        }, {})
                        .$promise.then((response) => {
                            defer.resolve(result);
                            return response;
                        });
                    return defer.promise;
                    break;

                case "delete":
                    var result = self.Container.delete({
                            containerName: containerName,
                            action: 'delete'
                        }, {})
                        .$promise.then(function(response) {
                            defer.resolve(result);
                            return response;
                        });
                    break;

                case "getContainer":
                    var result = self.Container.getContainer({
                            containerName: containerName
                        }, {})
                        .$promise.then((response) => {
                            defer.resolve(result);
                            return response;
                        });

                    return defer.promise;
                    break;
            }
        };

        self.getAllContainers = function() {
            var currentUser = JSON.parse(localStorage.getItem('user')),
                result = [];

            if (currentUser.admin)
                result = self.Container.query();
            else
                result.push(self.Container.get({ containerName: currentUser.name }, {}));
            return result;
        };
    }]);