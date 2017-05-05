angular
    .module('service.login')
    .factory('Login', ['$resource', '$http', ($resource, $http) => {
        var self = this;
        self.user = "";

        self.isAuthenticated = () => {
            return localStorage.getItem('token') == "";
        };

        self.signIn = (user) => {
            $http.post('http://ec2-54-218-7-198.us-west-2.compute.amazonaws.com:3000/api/users/:login/authenticate', user)
                .then((response) => {
                    console.log(response);
                    localStorage.setItem('token', response.data.token);
                    User.user = user.userName;
                    User.admin = response.data.admin;
                    console.log(User);
                }, (argument) => {
                    if (argument.data.erro) {
                        alert("Erro de autenticação");
                    }
                });
        };

        return self;

    }]);