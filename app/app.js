// -----------------------------------------------------
// Here is the starting point for your own code.
// All stuff below is just to show you how it works.
// -----------------------------------------------------

// Browser modules are imported through new ES6 syntax.
// import { greet } from './hello_world/hello_world';

// Node modules are required the same way as always.
var os = require('os');

// window.env contains data from config/env_XXX.json file.
var envName = window.env.name;

var App = angular.module('MyApp', [
  'ngMaterial', 'ionic',
  'ngSanitize', 'ui.router', 'ngAnimate'
]);

import $api from './components/services/$api';
App.factory('$api', $api);
import $constant from './components/services/$constant';
App.factory('$constant', $constant);
import $indicator from './components/services/$indicator';
App.factory('$indicator', $indicator);
import $notice from './components/services/$notice';
App.factory('$notice', $notice);
import $temp from './components/services/$temp';
App.factory('$temp', $temp);
import $validator from './components/services/$validator';
App.factory('$validator', $validator);

App.config(($httpProvider)=>{
  // $httpProvider.defaults.timeout = 5000;
  $httpProvider.interceptors.push('$indicator');
});

App.run(($rootScope, $api)=>{
  $rootScope.APIHOST = 'http://x.is26.com:8011';
  $api.config({
    getFacehubEmotions: 'GET /lists/hot',
    getPackages: 'GET /lists/getSection',
    getPackage: 'GET /showPackage/:id'
  }, {
    urlPrefix: $rootScope.APIHOST + '/facehub'
  });
});

App
  .controller('AppCtrl', function ($scope, $timeout, $mdSidenav, $mdUtil, $log, $notice, $api) {

    $api('getFacehubEmotions', null, {
      indicator: 'global'
    }).then((r)=>{
      $scope.emotionList = r.data.list.contents;
      $scope.emotionMap = r.data.list.details;
    });

    $scope.toggleLeft = buildToggler('left');
    $scope.toggleRight = buildToggler('right');
    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildToggler(navID) {
      var debounceFn =  $mdUtil.debounce(function(){
            $mdSidenav(navID)
              .toggle()
              .then(function () {
                $log.debug("toggle " + navID + " is done");
              });
          },200);
      return debounceFn;
    }
  })
  .controller('LeftCtrl', function ($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function () {
      $mdSidenav('left').close()
        .then(function () {
          $log.debug("close LEFT is done");
        });
    };
  })
  .controller('RightCtrl', function ($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function () {
      $mdSidenav('right').close()
        .then(function () {
          $log.debug("close RIGHT is done");
        });
    };
  });
