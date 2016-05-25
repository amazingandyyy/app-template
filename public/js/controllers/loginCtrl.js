'use strict';

var app = angular.module('lazyApp');

app.controller('loginCtrl', function($scope, $auth, $sessionStorage, $http, $state, $stateParams, Users) {

  $scope.dismissAlert = () => {
    $scope.showAlert = false;
    $scope.loginUser = null;
  };

  $scope.login = function() {

    $auth.login($scope.loginUser)
      .then(res => {
        var email = res.config.data.email;
        Users.getCurrentUser(email)
          .then(res => {
            $sessionStorage.currentUser = res.data;
            $state.go('profile');
          })
      })
      .catch(err => {
        $scope.error = err.data.message;
        $scope.showAlert = true;
      });


  };

  $scope.authenticate = function(provider) {
      $auth.authenticate(provider)
        .then(res => {
          var email = res.data.profile.email;
          Users.getCurrentUser(email)
            .then(res => {
              $sessionStorage.currentUser = res.data;
              $state.go('profile');
            });
        })
        .catch(err => {
          console.log('error for authenticate', err);
        });
    };




});
