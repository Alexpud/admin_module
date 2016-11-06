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
			
			reponse:function(response){
				if(response.status === 403 || response.status === 401){
					console.log('Proibido');
				}
				return response;
			}
		};
	}
})();