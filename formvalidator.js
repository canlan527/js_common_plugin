// 表单验证插件

if(!window.myPlugin) {
  window.myPlugin = {}
}

/* 
  表单验证的构造函数
  通过该构造函数， 创建一个表单验证对象
*/
window.myPlugin.FormValidator = function(option){
  // 表单配置的默认值
  var defaultOption = {
    formDOM: document.forms[0], // form 元素
    formRule: {} // 表单规则
  };
  this.option = Object.assign({}, defaultOption, option); // 混合形成最终配置

}