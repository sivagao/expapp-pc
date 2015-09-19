// Browser modules are imported through new ES6 syntax.
// import { greet } from './hello_world/hello_world';

// Node modules are required the same way as always.
var os = require('os');

// window.env contains data from config/env_XXX.json file.
var envName = window.env.name;

var App = angular.module('MyApp', [
  'ngMaterial', 'ionic',
  'ngSanitize', 'ui.router', 'ngAnimate',
  'ionicLazyLoad'
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

App.config(($httpProvider, $ionicConfigProvider)=>{
  $ionicConfigProvider.views.forwardCache(true);
  // $httpProvider.defaults.timeout = 5000;
  $httpProvider.interceptors.push('$indicator');
});

/* Routes */
App.config(($stateProvider, $urlRouterProvider)=>{

  $stateProvider
    .state('exp-hot', {
      url: '/exp/hot',
      templateUrl: 'partials/hot.html'
    })
    .state('exp-latest', {
      url: '/exp/latest',
      templateUrl: 'partials/latest.html'
    })
    .state('exp-plaza', {
      url: '/exp/plaza',
      templateUrl: 'partials/plaza.html'
    })
    .state('exp-pack', {
      url: '/exp/pack/:id',
      templateUrl: 'partials/pack.html'
    });

  $urlRouterProvider.otherwise('/exp/hot');
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
  .controller('expHotCtrl', ($api, $scope)=>{
    $api('getFacehubEmotions', null, {
      indicator: 'global'
    }).then((r)=>{
      $scope.emotionList = r.data.list.contents;
      $scope.emotionMap = r.data.list.details;
    });
  })
  .controller('expPlazaCtrl', ($api, $scope, $ionicScrollDelegate, $timeout)=>{
    var page = 1, isAjaxing = false;
    $scope.hasMoreItems = true;
    $scope.packageList = [];
    $scope.coverList = [];
    function fetchItems(page) {
      var isAjaxing = true;
      $api('getPackages', {
        number: 20,
        section: 2,
        page: page
      }, {
        indicator: 'global'
      }).then((r)=>{
        if(!r.data.packages.length) {
          hasMoreItems = false;
        }
        $scope.packageList = $scope.packageList.concat(r.data.packages);
        $scope.coverList = $scope.coverList.concat(r.data.cover_detail);
        isAjaxing = false;
        $timeout(()=>{
          $scope.$broadcast('scroll.infiniteScrollComplete');
          $ionicScrollDelegate.$getByHandle('listView').resize();
        }, 100);
      });
    }
    fetchItems(page);
    $scope.loadMoreItems = ()=>{
      if(isAjaxing) return;
      if(!$scope.hasMoreItems) return;
      ++page;
      fetchItems(page);
    }
  })
  .controller('expPackCtrl', ($scope, $api, $state)=>{
    $api('getPackage', {
      __embed: {
        id: $state.params.id
      }
    }, {
      indicator: 'global'
    }).then((r)=>{
      $scope.detailList = r.data.details;
    });
    $scope.$on('$ionicView.leave', ()=>{

    });
  })
  .controller('AppCtrl', function ($scope, $timeout, $mdSidenav, $mdUtil, $log, $state) {

    $scope.goPack = (i, more)=>{
      if(more) {
        i = _.extend(_.clone(i), _.pick(more, 'full_url', 'small_url'));
      }
      $scope.$root.Pack = i;
      $state.go('exp-pack', {
        id: i.id
      });
    };

    $scope.openEmotion = (i)=>{
      $scope.$root.Emotion = i;
      $scope.toggleRight();
    };

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
