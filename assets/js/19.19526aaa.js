(window.webpackJsonp=window.webpackJsonp||[]).push([[19],{313:function(t,e,n){"use strict";function r(t,e,n,r,o,a,s,_){var u,i="function"==typeof t?t.options:t;if(e&&(i.render=e,i.staticRenderFns=n,i._compiled=!0),r&&(i.functional=!0),a&&(i._scopeId="data-v-"+a),s?(u=function(t){(t=t||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(t=__VUE_SSR_CONTEXT__),o&&o.call(this,t),t&&t._registeredComponents&&t._registeredComponents.add(s)},i._ssrRegister=u):o&&(u=_?function(){o.call(this,(i.functional?this.parent:this).$root.$options.shadowRoot)}:o),u)if(i.functional){i._injectStyles=u;var p=i.render;i.render=function(t,e){return u.call(e),p(t,e)}}else{var l=i.beforeCreate;i.beforeCreate=l?[].concat(l,u):[u]}return{exports:t,options:i}}n.d(e,"a",(function(){return r}))},383:function(t,e,n){"use strict";n.r(e);var r=n(313),o=Object(r.a)({},(function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[n("p",[t._v("最近因为工作需要研究一下QuartZ .net , 之前也用过不过但没有深入了解,  现想深入研究一下")]),t._v(" "),n("p",[t._v("网上相关QuartZ .net 的文章不少, 但大部分都是源于张善友的博客"),n("a",{attrs:{href:"http://www.cnblogs.com/shanyou/category/102991.html",target:"_blank",rel:"noopener noreferrer"}},[t._v("http://www.cnblogs.com/shanyou/category/102991.html"),n("OutboundLink")],1),t._v(". 写的很全面,看了之后受益匪浅.")]),t._v(" "),n("p",[t._v("在这里将学习的一些收获记录一下, 方便将来查看")]),t._v(" "),n("p",[t._v("Quartz.net 是Quartz的移植版本, 历史来源不做过多介绍")]),t._v(" "),n("p",[t._v("网上几乎所有相关介绍都是写到"),n("a",{attrs:{href:"http://quartznet.sourceforge.net/download.html",target:"_blank",rel:"noopener noreferrer"}},[t._v("http://quartznet.sourceforge.net/download.html"),n("OutboundLink")],1),t._v("去下载, 结果打不开,")]),t._v(" "),n("p",[t._v("应该是网站地址有修改, 现在是: "),n("a",{attrs:{href:"http://sourceforge.net/projects/quartznet",target:"_blank",rel:"noopener noreferrer"}},[t._v("http://sourceforge.net/projects/quartznet"),n("OutboundLink")],1)]),t._v(" "),n("p",[t._v("目前最新版本为2.1.2")]),t._v(" "),n("p",[n("img",{attrs:{src:"http://images.cnitblog.com/blog/548134/201308/30144704-8841e40603f34ff0856e39409b423014.jpg",alt:""}})]),t._v(" "),n("p",[t._v('打开Quartz.2010.sln, 可能会提示"未能正确加载解决方案中的一个或多个项目......"')]),t._v(" "),n("p",[t._v("查看解决方案中的Quartz.2010和Quartz.Examples.2010等项目加载失败")]),t._v(" "),n("p",[t._v("主要是.nuget的原因, 有两种方法解决")]),t._v(" "),n("ol",[n("li",[n("p",[t._v('右键解决方案选择"启用Nuget还原".')])]),t._v(" "),n("li",[n("p",[t._v('右键加载失败的项目,选择"编辑Quartz.2010.csproj",删除倒数第二行的  '),n("Import",{attrs:{Project:"$(SolutionDir)\\.nuget\\nuget.targets"}}),t._v(",保存,")],1)])]),t._v(" "),n("p",[t._v("然后右键重新加载.   其他加载失败的项目也如此操作即可.")]),t._v(" "),n("p",[t._v("若编译不成功, 查看项目的引用中是否有引用失败的例如Common.logging, bin文件夹中存在相关的dll文件, 重新引用即可")])])}),[],!1,null,null,null);e.default=o.exports}}]);