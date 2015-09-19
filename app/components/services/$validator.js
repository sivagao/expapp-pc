'use strict';

export default ($q, $notice) => {
  var ruleMsgMap = {
    },
    rulesMap = {
      mobile: function(val) {
        return $q((resolve, reject)=>{
          if(!val) reject('不能为空');
          if(/^1[0-9]{10,10}$/i.test(val)) {
            resolve();
          } else {
            resolve(); // temp
            // reject('手机号码格式不正确');
          }
        });
      }
    };
  var Rules = {
    // Todo: 移入 $validator 中
     required: (val)=>{
      if(!!val) return true;
      return '请补全未填项';
    },
    idcard: (val)=>{
      if(verifyIdCard(val)) return true;
      return '身份证号码格式不正确';
    },
    mobile: (val)=>{
      if(/000088\d{4}/.test(val)) return true;
      if (!(/^1[0-9]{10,10}$/i.test(val))) return '手机格式不正确';
      return true;
    },
    bankcard: (val)=>{
      if(/[\d]{16}/) return true;
      if(/[\d]{19}/) return true;
      return '银行卡格式不正确';
    },
    paypwd: (pass='')=>{
      // 支付密码为6~10个字符，可包含字母、数字、符号
      if(/[\w]{6,10}/.test(pass)) return true;
      return '理财密码格式不正确';
    },
    gftPwd: (pass='')=>{
      // 长度判断
      if(pass.length < 6 || pass.length > 16) return '密码格式为 6-12 个字符';
      // 判断某一字符出现的次数
      for (var i = 0; i < pass.length; i++) {
          var oneChar = pass.charAt(i);
          var count = 0;
          var firstPosition = 0;
          for (var j = 0; j < pass.length; j++) {
              if (oneChar == pass.charAt(j)) {
                  count++;
              }
          }
          if (count >= 3) {
              return '密码中‘' + oneChar + '’出现的次数超过了三次';
          }
      }

      // 判断顺序递增或者递减
      var orderArray = ['012345', '123456', '234567', '345678', '456789', '987654', '876543', '765432', '654321', '543210'];
      if (orderArray.indexOf(pass) != -1) {
          return '密码设置不能是顺序递增或者递减';
      }
      return true;
    },
    smsVcode: (val)=>{
      return true; // for *fg%1q special code
      if((/\d{6}/.test(val))) return true;
      return '验证码格式不正确';
    }
  };
  var validator = {
    validate(type, val) {
      return rulesMap[type](val);
    },
    validateForm(id) {
      // default scan current ion-content
      var deferred = $q.defer()
        , $form = $('#'+id)
        , formScope = angular.element($form).scope()
        , $elem, validates, messages, fieldVal, vResult
        , msgMap = {
          required: '请补全未填项'
        };
      if(_.every($form.find('[validate]'), (elem)=> {
        $elem = $(elem);
        validates = $elem.attr('validate').split(',');
        fieldVal = eval('formScope.'+$elem.attr('ng-model'));
        messages = $elem.attr('message');
        _.extend(msgMap, messages ? JSON.parse(messages) : {});
        return _.every(validates, (v)=>{
          vResult = Rules[v](fieldVal);
          if(_.isBoolean(vResult) && vResult) {
            console.log('Validate Field Ok');
            return true;
          } else {
            $notice.error(msgMap[v] || vResult);
            // elem add error css
            console.log('Validate Field, broken');
            return false;
          }
        });
      })){
        deferred.resolve();
      };
      return deferred.promise;
    }
  };
  return validator;
};


// Copy from pc code
var verifyBirthday = function(idCardB){
  var year =  parseInt(idCardB.substring(6, 10)) + 18, //加18岁
    month = parseInt(idCardB.substring(10, 12)) - 1,
    day = parseInt(idCardB.substring(12, 14)),
    //第一天有效的时间
    validDay = new Date(year, month, day);

  var now = new Date();

  return now >= validDay;
};
var verifyCodeX = function(idCardX) {
  var weight_factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1 ];    // 加权因子
  var valide_Code = [ 1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2 ];            // 身份证验证位值.10代表X
  var sum = 0;
  if (idCardX[17].toLowerCase() == 'x') {
    idCardX[17] = 10;
  }
  for ( var i = 0; i < 17; i++) {
    sum += weight_factor[i] * idCardX[i];
  }
  var valCodePos = sum % 11;
  if (idCardX[17] == valide_Code[valCodePos]) {
    return true;
  } else {
    return false;
  }
};
var verifyIdCard = function(idCard){
  if (idCard.length == 18) {
    var a_idCard = idCard.split("");
    if(verifyBirthday(idCard)&&verifyCodeX(a_idCard)){
        return true;
    }else {
        return false;
    }
  } else {
    return false;
  }
};
