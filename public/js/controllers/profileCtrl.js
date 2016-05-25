'use strict';

var app = angular.module('lazyApp');

app.controller('profileCtrl', function($sessionStorage, $scope) {

  $scope.$storage = $sessionStorage;

});
