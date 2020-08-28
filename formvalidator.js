// 表单验证插件

if(!window.myPlugin) {
  window.myPlugin = {};
}

/* 
  表单验证的构造函数
  通过该构造函数， 创建一个表单验证对象
*/
window.myPlugin.FormValidator = function(option){
  // 表单配置的默认值
  var defaultOption = {
    formDOM: document.forms[0], // form 元素
    formRule: {}, // 表单规则
    errorClass: 'field-erroro' // 错误的类名
  };
  this.option = Object.assign({}, defaultOption, option); // 混合形成最终配置
  // console.log(this.option);
};
/**
 * 自定义属性的名字
 */
window.myPlugin.FormValidator.dataConfig = {
  fieldContainer: 'data-field-container', // 表单字段容器的自定义属性名
  dataField: 'data-field', // 表单字段的自定义属性名
  dataFieldProp: 'data-field-prop', // 要验证的表单字段自定义属性名
  dataFieldDefaultProp: 'value', // 要验证的表单字段默认属性名
  dataFieldListener: 'data-field-listener', // 要监听的事件的自定义属性名
  dataFieldDefaultListener: 'change', // 要监听的事件的默认属性名
  dataFieldTrigger: 'data-field-trigger', // 要额外触发的验证字段
  dataFieldDefaultTrigger: '', //要额外触发的验证字段，默认不触发
  dataFieldError: 'data-field-error', // 错误消息的元素
  dataFieldDefaultError: 'error', //错误消息的元素的默认类名
};
/**
 * 得到一个表单字段的数据 如果没有拿到任何数据 则返回 null
 * 写道原型上，到处都可以用
 * @param {string} field 表单字段名
 */
myPlugin.FormValidator.prototype.getFieldData = function (field) {
  var fieldContainer = this.getFieldContainer(field); // 得到表单字段容器
  if(!fieldContainer) { // 如果拿不到容器就返回 undefined
    return; 
  }
  var eles = this.getFieldElement(fieldContainer); // 得到表单字段元素
  // 组合数据
  var datas = [];// 数据数组
  eles.forEach(function(ele) {
    var propName = myPlugin.FormValidator.dataConfig.dataFieldProp; // 得到自定义属性名
    propName = ele.getAttribute(propName);
    if(!propName) {
      propName = myPlugin.FormValidator.dataConfig.dataFieldDefaultProp; // 使用默认属性名
    }
    var val = ele[propName]; // 通过元素属性名 取出属性值
    // 单独处理单选和复选的情况  没有选中的 一般不加进 datas 里
    if(ele.type === 'checkbox' || ele.type === 'radio') {
      if(ele.checked) {
        datas.push(val);
      }
    } else {
      datas.push(val);
    }
  });
  // 判断空数组 返回null / undefined
  if(datas.length === 0) {
    return null;
  }
  // 判断数组长度如果是1，直接返回该元素，不返回数组格式
  if(eles.length === 1) {
    return datas[0]
  }
  return datas; 
};

/**
 * 得到整个表单数据
 */
myPlugin.FormValidator.prototype.getFormData = function () {
  var dataName = myPlugin.FormValidator.dataConfig.fieldContainer;
  // 拿到所有表单域容器
  var container = this.option.formDOM.querySelectorAll(`[${dataName}]`);
  var that = this;
  var formData = {};
  // 拿到各个表单域的字段名
  container.forEach(function(con) {
    // console.log(con)
    var field = con.getAttribute(dataName);// 字段名
    var data = that.getFieldData(field); // 字段值
    formData[field] = data; // 把拿到的属性名属性值放到 formData 对象里
  })
  return formData;
}
/**
 * 得到表单字段容器
 * @param {string} field 表单字段名
 * 通过表单的 DOM 对象寻找
 */
myPlugin.FormValidator.prototype.getFieldContainer = function (field) {
  return this.option.formDOM.querySelector(`[${myPlugin.FormValidator.dataConfig.fieldContainer}="${field}"]`);
};

/**
 * 得到表单字段元素
 * @param {object} fieldContainer 表单域容器 
 * 把容器给我 我通过容器找里面的表单字段元素，有可能出现多个，所以用 querySelectorAll
 */
myPlugin.FormValidator.prototype.getFieldElement = function (fieldContainer) {
   var eles = fieldContainer.querySelectorAll(`[${myPlugin.FormValidator.dataConfig.dataField}]`);
   return eles;
};

/**
 * 验证一个数据
 * @param {array | string | null} data  要验证的数据
 * @param {object} ruleObj 验证规则对象
 * @param {object} formData 整个表单数据对象
 * @returns 返回验证结果 如果通过验证 返回 true  如果没有通过 返回一个错误信息  不论结果如何  不对页面进行处理
 */
myPlugin.FormValidator.prototype.validateData = function (data, ruleObj, formData) {
  if(typeof ruleObj.rule === 'string') { // 规则为预设指
    // 必填 + 扩展
    var func = myPlugin.FormValidator.validators[ruleObj.rule]
    if(!func) { // 预设值无效
      throw TypeError('验证规则不正确');
    }
    if(func(data, formData)) {
      return true;
    }
    return ruleObj.msg;
  } else if(ruleObj.rule instanceof RegExp) { // 规则为正则
    if(data === null) {
      return ruleObj.msg;
    }
    if(ruleObj.rule.test(data)) {
      return true;
    }
    return ruleObj.msg;
  } else if (typeof ruleObj.rule === 'function') { //自定义函数
    return ruleObj.rule();
  }
  throw new TypeError('验证规则不正确')
}
/**
 * 验证某个字段，返回一个验证结果，如果验证通过，返回 true，如果验证没有通过，返回验证信息
 * 验证信息： 字段名， 数据， 规则对象， 错误消息
 */
myPlugin.FormValidator.prototype.validateField = function(field, formData) {
  var data = formData[field];// 要验证的数据
  // console.log(data)
  var ruleObjs = this.option.formRule[field];// 验证规则数组
  if(!ruleObjs) {
    return true;
  }
  for(var i = 0; i< ruleObjs.length; i ++) {
    var ruleObj =  ruleObjs[i];
    var result = this.validateData(data, ruleObj, formData);
    // console.log(result)
    if(result !== true) {
      // 有错误， result 是错误信息
      return {//验证错误的各种信息
        field,
        data,
        ruleObj,
        msg: result
      }
    }
  }
  return true;
}
/**
 * 验证表单 分为有参与无参的两种情况  得到验证结果
 */
myPlugin.FormValidator.prototype.validate = function() {
  var formData = this.getFormData(); // 得到所有的表单数据
  if(arguments.length === 0) { // 无参的情况
    var fields = Object.getOwnPropertyNames(formData);// 得到表单项的所有属性名
  } else {
    var fields = Array.from(arguments); // 参数变为数组
  }
  var that = this;
  var results = fields.map(function(field) {
    return that.validateField(field, formData);
  }).filter(function(item) {
    return item !== true;
  });
  return results;
}
/**
 * 根据验证结果 设置某个表单项的状态
 * @param {*} validataResult 该表单项的错误信息， 如果是 undefined，表示没有错误
 * @param {*} field 验证的表单项的名称
 */
myPlugin.FormValidator.prototype.setFieldStatus = function (validataResult, field) {
  var fieldContainer = this.getFieldContainer(field); // 表单字段容器
  var errorEle = fieldContainer.querySelector[`${myPlugin.FormValidator.dataConfig.dataFieldError}`]; // 错误消息元素
  if(!errorEle) {
    errorEle = fieldContainer.querySelector(`.${myPlugin.FormValidator.dataConfig.dataFieldDefaultError}`);
  }
  if(validataResult) { // 有错误
    if(errorEle) {
      errorEle.innerHTML = validataResult.msg;
    }
    fieldContainer.classList.add(this.option.errorClass);
  } else { // 无错误
    fieldContainer.classList.remove(this.option.errorClass);
    if(errorEle) {
      errorEle.innerHTML = ''
    }
  }
}
/**
 * 设置整个表单的状态
 * 无参：整个表单
 * 有参：根据参数设置具体的表单项
 */
myPlugin.FormValidator.prototype.setStatus = function() {
  if(arguments.length === 0) {
    var formData = this.getFormData(); // 得到整个表单数据
    var fields = Object.getOwnPropertyNames(formData); // 得到表单中的所有字段
  } else {
    var fields = Array.from(arguments);// 字段来自参数的传递
  }
  var results =  this.validate.apply(this, fields) // 得到验证结果
  var that = this;
  fields.forEach(function(field) {
    var res = results.find(function(item) {
      return item.field == field; // 从验证结果中，寻找某个字段验证结果，没有找到为 undefined
    });
    that.setFieldStatus(res, field);
  })
}
/**
 * 预设的验证规则 ,通过 true， 没通过 false
 * require 非空验证
 */
myPlugin.FormValidator.validators = {
  required: function(data) {
    if(!data) {
      return false;
    }
    if(Array.isArray(data) && data.length === 0) {
      return false;
    }
    return true;
  },
  mail: function(data) {
    if(data === null) {
      return false;
    }
    var reg = /^\w+@\w+(\.\w+){1,2}$/;
    return reg.test(data);
  },
  number: function(data) {
    if(data === null) {
      return false;
    }
    var reg = /^\d+(\.?\d+)$/;
    return reg.test(data);
  }
}

