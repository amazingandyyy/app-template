'use strict';

var app = angular.module('lazyApp');

app.controller('mainCtrl', function($scope, $auth, $state, $sessionStorage) {
  $scope.isAuthenticated = function() {
    return $auth.isAuthenticated();
  };

  $scope.logout = function() {
    $auth.logout()
      .then(() => {
        console.log('youre logged out');
        $sessionStorage.currentUser = null;
        $state.go('home');
      });
  };


});
