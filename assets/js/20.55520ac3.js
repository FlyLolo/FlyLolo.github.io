(window.webpackJsonp=window.webpackJsonp||[]).push([[20],{313:function(t,e,n){"use strict";function o(t,e,n,o,r,s,i,a){var _,v="function"==typeof t?t.options:t;if(e&&(v.render=e,v.staticRenderFns=n,v._compiled=!0),o&&(v.functional=!0),s&&(v._scopeId="data-v-"+s),i?(_=function(t){(t=t||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(t=__VUE_SSR_CONTEXT__),r&&r.call(this,t),t&&t._registeredComponents&&t._registeredComponents.add(i)},v._ssrRegister=_):r&&(_=a?function(){r.call(this,(v.functional?this.parent:this).$root.$options.shadowRoot)}:r),_)if(v.functional){v._injectStyles=_;var c=v.render;v.render=function(t,e){return _.call(e),c(t,e)}}else{var l=v.beforeCreate;v.beforeCreate=l?[].concat(l,_):[_]}return{exports:t,options:v}}n.d(e,"a",(function(){return o}))},384:function(t,e,n){"use strict";n.r(e);var o=n(313),r=Object(o.a)({},(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[n("ol",[n("li",[t._v("安装域，")])]),t._v(" "),n("p",[t._v("安装后创建一个用户用于之后的安装配置， 例如 SPAdmin@XXXXX.com")]),t._v(" "),n("ol",{attrs:{start:"2"}},[n("li",[t._v("安装sql server 2016")])]),t._v(" "),n("p",[t._v("将要安装sql server 的服务器加入域，   并将域账号SPAdmin@XXXXX.com添加至此服务器的本地administrator组。")]),t._v(" "),n("p",[t._v("安装sql server， 将域账号SPAdmin@XXXXX.com添加至sql的管理员账号。")]),t._v(" "),n("ol",{attrs:{start:"3"}},[n("li",[t._v("安装SharePoint 2016")])]),t._v(" "),n("p",[t._v("将要安装SharePoint 的服务器加入域，   并将域账号SPAdmin@XXXXX.com添加至此服务器的本地administrator组。")]),t._v(" "),n("p",[t._v("根据安装向导安装必要文件， 此处为在线安装， 需要连外网， 也可以都提前下载好了安装。")]),t._v(" "),n("p",[t._v("安装SharePoint 2016， 安装后进行配置，连接服务器账号采用此域账号")]),t._v(" "),n("p",[t._v("需要注意的问题： 安装SharePoint 时需要用该域账号登录安装，")]),t._v(" "),n("p",[t._v("此处仍然出现了一个问题， 提示创建数据库失败，RPC服务出错，网上找了好多解决方案都是说未用域账号登录。")]),t._v(" "),n("p",[t._v("后发现域XXXXX.com 与单位域名重名， 安装必要文件文件是开启了外网， 导致在XXXXX.com中查找此域账号失败， 禁用外网后安装成功。")])])}),[],!1,null,null,null);e.default=r.exports}}]);