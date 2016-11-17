(function(){
	'use strict';
	
	angular
	.module('adminApp')
	.factory('authInterceptor',authInterceptor);
	
	authInterceptor.$inject = ['$rootScope','$q'];
	
	function authInterceptor($rootScope,$q){
		
		return{
			request : function(config){
				config.headers = config.headers ||{};
				if(localStorage.token){
					config.headers.authorization = localStorage.token;
				}
				return config;
			},
			
			responseError:function(response){
				console.log("Resposta "+response.status);
				if(response.status === 400 || response.status === 401 || response.status === 500){
					console.log('Acesso Proibido!');
				}
				return response;
			}
		};
	}
})();