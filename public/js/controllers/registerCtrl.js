'use strict';

var app = angular.module('lazyApp');

app.controller('registerCtrl', function($scope, $auth) {
  console.log('registerCtrl');

  $scope.dismissAlert = () => {
    $scope.showAlert = false;
    $scope.newUser.password = '';
    $scope.newUser.password2 = '';
  };

  $scope.register = () => {

    if($scope.newUser.password !== $scope.newUser.password2) {
      $scope.error = "Password mismatch"
      $scope.showAlert = true;
    } else {

      console.log('$scope.newUser', $scope.newUser);

      var newUser = {
        email: $scope.newUser.email,
        displayName: $scope.newUser.displayName,
        password: $scope.newUser.password,
      }

      $auth.signup(newUser)
        .then(res => {
          $scope.showSuccess = true;
        })
        .catch(err => {
          $scope.showAlert = true;
          $scope.error = err.data.message;
        });

    }


  };



});
