'use strict';
angular
    .module('service.workspace')
    .service('Workspace', ['$resource', '$log', '$q', 'responseInterceptor', function($resource, $log, $q, responseInterceptor) {

        var self = this,
            defer = $q.defer();

        self.Workspace = $resource('http://ec2-54-218-7-198.us-west-2.compute.amazonaws.com:3000/api/containers/:containerName/workspaces/:workspaceName/:action', null, {
            'start': { method: 'POST', interceptor: responseInterceptor },
            'stop': { method: 'DELETE', interceptor: responseInterceptor },
            'delete': { method: 'DELETE', interceptor: responseInterceptor },
            'create': { method: 'POST', interceptor: responseInterceptor },
            'workspaces': { method: 'GET', isArray: true, interceptor: responseInterceptor }
        });

        /*
         Executes a action for one of the given workspaces
         */
        self.executeWorkspaceAction = (action, workspaceName, containerName, workspaceStack) => {
            switch (action) {
                case "start":
                    var result = self.Workspace.start({
                            containerName: containerName,
                            workspaceName: workspaceName,
                            action: 'start'
                        }, {})
                        .$promise.then((response) => {
                            defer.resolve(result);
                            return response;
                        });
                    return defer.promise;
                    break;

                case "create":
                    var result = self.Workspace.create({
                            containerName: containerName,
                            workspaceName: workspaceName
                        }, {
                            workspaceStack: workspaceStack
                        })
                        .$promise.then((response) => {
                            defer.resolve(result);
                            return response;
                        });
                    return defer.promise;
                    break;

                case "stop":
                    var result = self.Workspace.stop({
                            containerName: containerName,
                            workspaceName: workspaceName,
                            action: 'stop'
                        }, {})
                        .$promise.then((response) => {
                            defer.resolve(result);
                            return response;
                        });
                    return defer.promise;
                    break;

                case "delete":
                    var result = self.Workspace.delete({
                            containerName: containerName,
                            workspaceName: workspaceName,
                            action: 'delete'
                        }, {})
                        .$promise.then((response) => {
                            console.log(response);
                            defer.resolve(result);
                            return response;
                        });
                    return defer.promise;
                    break;
            }
        };

        self.getWorkspace = (containerName) => {
            return self.Workspace.workspaces({ containerName: containerName }, {});
        };

        self.workspacesEmpty = (id) => {
            /*
             Workaround for the moment. This method was being executed several times, without the loading
             of data. So....
             */
            if (self.containers[id].Workspaces == undefined)
                return true;
            return self.containers[id].Workspaces.length == 0;
        };

    }]);