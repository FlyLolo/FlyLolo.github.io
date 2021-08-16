(window.webpackJsonp=window.webpackJsonp||[]).push([[84],{313:function(t,e,s){"use strict";function n(t,e,s,n,a,r,o,_){var c,p="function"==typeof t?t.options:t;if(e&&(p.render=e,p.staticRenderFns=s,p._compiled=!0),n&&(p.functional=!0),r&&(p._scopeId="data-v-"+r),o?(c=function(t){(t=t||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(t=__VUE_SSR_CONTEXT__),a&&a.call(this,t),t&&t._registeredComponents&&t._registeredComponents.add(o)},p._ssrRegister=c):a&&(c=_?function(){a.call(this,(p.functional?this.parent:this).$root.$options.shadowRoot)}:a),c)if(p.functional){p._injectStyles=c;var v=p.render;p.render=function(t,e){return c.call(e),v(t,e)}}else{var i=p.beforeCreate;p.beforeCreate=i?[].concat(i,c):[c]}return{exports:t,options:p}}s.d(e,"a",(function(){return n}))},449:function(t,e,s){"use strict";s.r(e);var n=s(313),a=Object(n.a)({},(function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("p",[t._v("本文通过一个维修工与工具库的例子形象的描述一下为什么要用依赖注入、它的工作原理是什么样的, 然后根据这个类比一下ASP.NET Core 中的依赖注入, 从而深刻了解它的使用方法、注意事项以及回收机制等.")]),t._v(" "),s("p",[s("a",{attrs:{href:"http://www.cnblogs.com/FlyLolo/p/ASPNETCore2_0.html",target:"_blank",rel:"noopener noreferrer"}},[s("span",{attrs:{"data-ttu-id":"4542a-111"}},[t._v("ASP.NET Core 系列目录")]),s("OutboundLink")],1)]),t._v(" "),s("p",[t._v("本文主要内容:")]),t._v(" "),s("p",[t._v("1.为什么要用依赖注入(DI)")]),t._v(" "),s("p",[t._v("2.容器的构建和规则")]),t._v(" "),s("p",[t._v("3.ASP.NET Core 2.0中的依赖注入")]),t._v(" "),s("p",[t._v("4.使用方法及需要注意的问题")]),t._v(" "),s("p",[t._v("5.服务的Dispose")]),t._v(" "),s("p",[t._v("6.我想换个容器")]),t._v(" "),s("h1",{attrs:{id:"_1-为什么要用依赖注入-di"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1-为什么要用依赖注入-di"}},[t._v("#")]),t._v(" 1.为什么要用依赖注入(DI)")]),t._v(" "),s("p",[t._v("什么是依赖注入就不说了, 为什么要使用呢?")]),t._v(" "),s("p",[t._v("软件设计原则中有一个依赖倒置原则（DIP）讲的是要依赖于抽象，不要依赖于具体,高层模块不应该依赖于低层模块, 二者应该依赖于抽象。简单的说就是为了更好的解耦。而控制反转(Ioc)就是这样的原则的其中一个实现思路, 这个思路的其中一种实现方式就是依赖注入(DI)。")]),t._v(" "),s("p",[t._v("感觉有点绕, 举个栗子:老李是一个维修工, 现在要出任务去维修, 得先去申领个扳手。")]),t._v(" "),s("p",[s("img",{attrs:{src:"/blogimages/3291463/30144704-8841e40603f34ff0856e39409b423014.jpg",alt:"An image"}})]),t._v(" "),s("p",[t._v("图一")]),t._v(" "),s("p",[t._v('老李: "请给我一把可以可以拧7mm大小的六角螺丝的扳手.", 然后库管老张就从仓库里拿了一把这样的'),s("img",{attrs:{src:"https://images2018.cnblogs.com/blog/548134/201803/548134-20180303113142362-236256002.png",alt:""}}),t._v("大力牌扳手给老李。")]),t._v(" "),s("p",[t._v('在这个例子中, 维修工老李只要告诉库管我要一个 "可以拧7mm大小的六角螺丝"的扳手即可, 他不用关心扳手的品牌和样式, 也不用采购扳手,更不用关心这个扳手是怎么来的.而对于库管, 他只需提供满足这样规则的一个扳手即可, 不用去关心老李拿着这个扳手之后去干什么。所以老李和老张都只是关心"可以拧7mm大小的六角螺丝的"这个规则即可, 也就是说, 如果后期仓库里不再提供'),s("img",{attrs:{src:"https://images2018.cnblogs.com/blog/548134/201803/548134-20180303113142362-236256002.png",alt:""}}),t._v("大力牌扳手, 而是提供了"),s("img",{attrs:{src:"https://images2018.cnblogs.com/blog/548134/201803/548134-20180303114221147-722038305.png",alt:""}}),t._v("这样的大牛牌扳手, 无论换了什么牌子和样式, 只要仍满足这个规则, 老李仍然可以正常工作.它们定义了一个规则(比如接口IWrench7mm), 二者都依赖于这个规则, 然后仓库无论提供大力牌(WrenchDaLi : IWrench7mm)还是大牛牌(WrenchDaNiu : IWrench7mm), 都不影响正常工作.")]),t._v(" "),s("p",[t._v("这就是依赖倒置原则(DIP),  不依赖于具体(牌子),  高层模块(老李)不应该依赖于低层模块(大力牌扳手), 二者应该依赖于抽象(IWrench7mm:可以拧7mm大小的六角螺丝)。如果直接由老李去获取(new)大力牌扳手, 那么当业务改变要求采用大牛牌的时候, 我们就要去修改老李的代码.为了解耦, 在本例中我们只要在配置中让仓库由原来的提供大力牌改为提供大牛牌即可。老李要使用的时候, 可以通过注入(构造器、属性、方法)的方式, 将仓库提供的扳手实例提供给老李使用。")]),t._v(" "),s("h1",{attrs:{id:"_2-容器的构建和规则"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_2-容器的构建和规则"}},[t._v("#")]),t._v(" 2.容器的构建和规则")]),t._v(" "),s("p",[t._v("继续上面的例子, 库管老张为什么会提供给老李大力牌而不是大牛牌的扳手呢? 那是因为领导给了他一份构建仓库的物品购置及发放清单:")]),t._v(" "),s("p",[t._v("A. 当有人要7mm的六角扳手的时候,给他一个大力牌的扳手, 当再有人来要的时候就再给另一把。")]),t._v(" "),s("p",[t._v("B. 但对于相机, 每个小组只能给一台, 小组内所有人共用这一台。")]),t._v(" "),s("p",[t._v("C. 卡车更是全单位只有一辆, 谁申请都是同一辆。")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://images2018.cnblogs.com/blog/548134/201803/548134-20180304222201242-1577523357.png",alt:"An image"}})]),t._v(" "),s("p",[t._v("图二")]),t._v(" "),s("h1",{attrs:{id:"_3-asp-net-core-2-0中的依赖注入"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_3-asp-net-core-2-0中的依赖注入"}},[t._v("#")]),t._v(" 3.ASP.NET Core 2.0中的依赖注入")]),t._v(" "),s("p",[t._v("首先看一下下面的图三")]),t._v(" "),s("p",[s("img",{attrs:{src:"https://images2018.cnblogs.com/blog/548134/201803/548134-20180304223315637-868568123.png",alt:""}})]),t._v(" "),s("p",[t._v("图三")]),t._v(" "),s("p",[t._v("这就是ASP.NET Core 中默认的依赖注入方式,  对比一下图二是不是很像?")]),t._v(" "),s("p",[t._v("上篇文章说要将Startup放大介绍一下,  那么打开Startup这个文件,  看一下里面的ConfigureServices方法。顾名思义,  这个方法是用来配置服务,")]),t._v(" "),s("div",{staticClass:"language-csharp extra-class"},[s("pre",{pre:!0,attrs:{class:"language-csharp"}},[s("code",[t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token return-type class-name"}},[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("void")])]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("ConfigureServices")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("IServiceCollection")]),t._v(" services"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        services"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("AddMvc")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n\n")])])]),s("p",[t._v("此方法接收一个IServiceCollection类型的参数,  查看它的定义, 被定义在"),s("a",{attrs:{href:"https://github.com/aspnet/DependencyInjection",target:"_blank",rel:"noopener noreferrer"}},[t._v("Microsoft.Extensions.DependencyInjection"),s("OutboundLink")],1),t._v("这个NuGet包中, 功能就是依赖注入, 在ASP.NET Core中被广泛使用.")]),t._v(" "),s("h2",{attrs:{id:"_1iservicecollection"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#_1iservicecollection"}},[t._v("#")]),t._v(" ①IServiceCollection")])])}),[],!1,null,null,null);e.default=a.exports}}]);