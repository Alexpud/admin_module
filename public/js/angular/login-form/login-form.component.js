angular.module('loginForm').
	component('loginForm',
	{
		templateUrl: 'js/angular/login-form/login-form.template.html',
		controller: ['$http','$routeParams'
		]
	});