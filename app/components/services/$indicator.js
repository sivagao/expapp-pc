'use strict';

// ngInject
var indicator = ($injector, $timeout, $q, $rootScope) => {
  var $ionicLoading, $notice, $compile;

  var toggleGlobalIndicator = tplMethod(()=> {
    $ionicLoading.show({
      template: '<ion-spinner icon="ios"></ion-spinner>',
      animation: 'fade-in',
      showBackdrop: true // 通过黑透明遮罩，来模态
      // showDelay: 100
    });
  }, ()=>{
    $ionicLoading.hide()
  }, 800);

  var toggleBtnIndicator = tplMethod((target)=>{
    $compile = $injector.get('$compile');
    // avoid chain indicator
    if($(target).find('ion-spinner').length) return;
    $(target).prepend(
      $compile('<ion-spinner icon="ios-small"></ion-spinner>'
    )($rootScope));
    target.disabled = true;
  }, (target)=>{
    if(!target) return;
    target.disabled = false;
    $(target).find('ion-spinner').remove();
  }, 3000); // 至少3s的显示

  function handleRequest(conf) {
    if(!_.isUndefined(conf.indicator)) {
      conf.timeout = 10000; // default timeout
    }
    if(!conf.indicator) return;
    conf.indicator === 'global'
      ? toggleGlobalIndicator(true)
      : toggleBtnIndicator(true, conf.indicator);
    // whether post/delete auto set global indicator
    // check conf.method POST DELETE
  }

  function handleResponse(r) {
    if (!r.config) return;
    if(_.isUndefined(r.config.indicator)) return;
    r.config.indicator === 'global'
      ? toggleGlobalIndicator(false)
      : toggleBtnIndicator(false, r.config.indicator);
  }

  return {
    request: function(conf) {
      // $ionicLoading 依赖需要动态的插入，避免循环引用
      $ionicLoading = $injector.get('$ionicLoading');
      handleRequest(conf);
      return conf || $q.when(conf);
    },
    response: function(response) {
      $ionicLoading = $injector.get('$ionicLoading');
      handleResponse(response);
      return response;
    },
    responseError: function(rejection) {
      handleResponse(rejection);
      // check rejection.config.ignoreErr
      if(rejection.status === 403) {
        $rootScope.$storage.userData = null;
        // auto redirect to login?!
      }
      if(rejection.data && !_.isUndefined(rejection.data.error)) {
        // ignoreErr 来允许HTTP API 使用方直接定制错误处理
        if(!rejection.config.ignoreErr) {
          $notice = $injector.get('$notice');
          $timeout(()=>{
            $notice.error(rejection.data.error);
          }, 100);
        }
      }
      return $q.reject(rejection);
    }
  }

  function tplMethod(yes, no, span) {
    var time, delta
    return function(bool) {
      var args = _.toArray(arguments)
      args.shift();
      if(bool) {
        time = new Date().getTime();
        yes.apply(null, args);
      } else {
        delta = new Date().getTime() - time;
        $timeout(()=>{
          no.apply(null, args); // why not Fn.bind
        }, 0); // span - delta
      }
    }
  }
};
export default indicator;
