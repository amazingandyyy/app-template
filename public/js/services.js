'use strict';

var app = angular.module('lazyApp');

app.service('Users', function($http) {

  this.getCurrentUser = (email) => $http.get(`/users/getCurrentUser/${email}`);

  this.accessAdminPage = (token) => $http.get(`/admin/${token}`);

});
