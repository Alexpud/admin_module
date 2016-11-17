
(function(){
	'use strict';
	
	angular
	.module('adminApp')
	
	.config(interceptorPush);
	
	interceptorPush.$inject = ['$httpProvider'];
	
	function interceptorPush($httpProvider){
		$httpProvider.interceptors.push('authInterceptor');
	}
})();