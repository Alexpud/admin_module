angular
    .module('service.user')
    .factory('User', ['$http', function($http) {
        var self = this;

        self.isAuthenticated = () => {
            return localStorage.getItem('token') != "";
        };

        self.signIn = (user, config) => {
            //return $http.post('http://localhost:3000/api/users/' + user.login + '/authenticate', user, config)
            return $http.post('http://ec2-54-218-7-198.us-west-2.compute.amazonaws.com:3000/api/users/' + user.login + '/authenticate', user, config)
                .then((response) => {
                    console.log(user);
                    console.log(response);
                    console.log('loasdasda');
                    var currentUser = {};
                    currentUser.name = response.data.name;
                    currentUser.admin = response.data.admin;
                    console.log(currentUser);
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(currentUser));
                    return { status: 'success' };
                }, (argument) => {
                    console.log(argument);
                    return { status: 'Error', content: 'Unauthorized' };
                });
        };

        self.signOut = () => {
            localStorage.setItem('user', "");
            localStorage.setItem('token', "");
        };

        return self;
    }]);