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
  console.log(this.option);
};
/**
 * 自定义属性的名字
 */
window.myPlugin.FormValidator.dataConfig = {
  fieldContainer: 'data-field-container', // 表单字段容器的自定义属性名
  dataField: 'data-field', // 表单字段的自定义属性名
  dataFieldProp: 'fieldProp', // 要验证的表单字段自定义属性名
  dataFieldDefaultProp: 'value', // 要验证的表单字段默认属性名
  dataFieldListener: 'data-field-listener', // 要监听的事件的自定义属性名
  dataFieldDefaultListener: 'change', // 要监听的事件的默认属性名
  dataFieldTrigger: 'data-field-trigger', // 要额外触发的验证字段
  dataFieldDefaultTrigger: '', //要额外触发的验证字段，默认不触发
  dataFieldError: 'data-field-error', // 错误消息的元素
  dataFieldDefaultError: 'error', //错误消息的元素的默认类名
};
/**
 * 得到一个表单字段的数据
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
    if(propName in ele.dataset) {
      propName = ele.dataset[propName]; // 取属性名字
    }else {
      propName = myPlugin.FormValidator.dataConfig.dataFieldDefaultProp; // 使用默认属性名
    }
    var val = ele[propName]; // 通过元素属性名 取出属性值
    datas.push(val);

  });
  console.log(datas);
};
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

