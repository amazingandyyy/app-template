'use strict';

var app = angular.module('lazyApp', ['ui.router', 'ngStorage', 'satellizer']);

app.config(function($stateProvider, $urlRouterProvider, $authProvider) {

  $authProvider.facebook({
    clientId: '988598757914436' // get facebook id
  });

  $authProvider.github({
      clientId: 'd186a3d75a4023269f1e'
    });

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: '/html/home.html',
      controller: 'homeCtrl'
    })
    .state('login', {
      url: '/login',
      templateUrl: '/html/login.html',
      controller: 'loginCtrl'
    })
    .state('register', {
      url: '/register',
      templateUrl: '/html/register.html',
      controller: 'registerCtrl'
    })
    .state('profile', {
      url: '/profile/:email',
      templateUrl: '/html/profile.html',
      controller: 'profileCtrl'
    });


    $urlRouterProvider.otherwise('/');
});


app.filter('titlecase', function() {
  return function(input) {
    console.log("input", input);
    return input.split(' ').map(word => word[0].toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };
});
