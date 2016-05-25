'use strict';

var app = angular.module('lazyApp');

app.controller('homeCtrl', function($scope, $auth, $sessionStorage) {

  $scope.$storage = $sessionStorage;
  // console.log('currentUser in homeCtrl', currentUser);

  $scope.isAuthenticated = function() {
    return $auth.isAuthenticated();
  };


});
