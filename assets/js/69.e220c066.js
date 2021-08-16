(window.webpackJsonp=window.webpackJsonp||[]).push([[69],{313:function(t,s,a){"use strict";function e(t,s,a,e,n,r,p,o){var v,c="function"==typeof t?t.options:t;if(s&&(c.render=s,c.staticRenderFns=a,c._compiled=!0),e&&(c.functional=!0),r&&(c._scopeId="data-v-"+r),p?(v=function(t){(t=t||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(t=__VUE_SSR_CONTEXT__),n&&n.call(this,t),t&&t._registeredComponents&&t._registeredComponents.add(p)},c._ssrRegister=v):n&&(v=o?function(){n.call(this,(c.functional?this.parent:this).$root.$options.shadowRoot)}:n),v)if(c.functional){c._injectStyles=v;var _=c.render;c.render=function(t,s){return v.call(s),_(t,s)}}else{var i=c.beforeCreate;c.beforeCreate=i?[].concat(i,v):[v]}return{exports:t,options:c}}a.d(s,"a",(function(){return e}))},433:function(t,s,a){"use strict";a.r(s);var e=a(313),n=Object(e.a)({},(function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("h1",{attrs:{id:"六-聊聊依赖注入"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#六-聊聊依赖注入"}},[t._v("#")]),t._v(" 六. 聊聊依赖注入")]),t._v(" "),a("hr"),t._v(" "),a("p",[t._v("本文通过一个维修工与工具库的例子形象的描述一下为什么要用依赖注入、它的工作原理是什么样的, 然后根据这个类比一下ASP.NET Core 中的依赖注入, 从而深刻了解它的使用方法、注意事项以及回收机制等.")]),t._v(" "),a("p",[t._v("本文主要内容:")]),t._v(" "),a("p",[t._v("1.为什么要用依赖注入(DI)")]),t._v(" "),a("p",[t._v("2.容器的构建和规则")]),t._v(" "),a("p",[t._v("3.ASP.NET Core 2.0中的依赖注入")]),t._v(" "),a("p",[t._v("4.使用方法及需要注意的问题")]),t._v(" "),a("p",[t._v("5.服务的Dispose")]),t._v(" "),a("p",[t._v("6.我想换个容器")]),t._v(" "),a("h2",{attrs:{id:"_1-为什么要用依赖注入-di"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1-为什么要用依赖注入-di"}},[t._v("#")]),t._v(" 1.为什么要用依赖注入(DI)")]),t._v(" "),a("p",[t._v("什么是依赖注入就不说了, 为什么要使用呢?")]),t._v(" "),a("p",[t._v("软件设计原则中有一个依赖倒置原则（DIP）讲的是要依赖于抽象，不要依赖于具体,高层模块不应该依赖于低层模块, 二者应该依赖于抽象。简单的说就是为了更好的解耦。而控制反转(Ioc)就是这样的原则的其中一个实现思路, 这个思路的其中一种实现方式就是依赖注入(DI)。")]),t._v(" "),a("p",[t._v("感觉有点绕, 举个栗子:老李是一个维修工, 现在要出任务去维修, 得先去申领个扳手。")]),t._v(" "),a("p",[a("img",{attrs:{src:"/blogimages/ASPNETCore2_6/548134-20180303112615300-529479844.png",alt:""}})]),t._v(" "),a("p",[t._v("图一")]),t._v(" "),a("p",[t._v('老李: "请给我一把可以可以拧7mm大小的六角螺丝的扳手.", 然后库管老张就从仓库里拿了一把这样的'),a("img",{attrs:{src:"/blogimages/ASPNETCore2_6/548134-20180303113142362-236256002.png",alt:""}}),t._v("大力牌扳手给老李。")]),t._v(" "),a("p",[t._v('在这个例子中, 维修工老李只要告诉库管我要一个 "'),a("span",{staticStyle:{color:"#ff0000"}},[t._v("可以拧7mm大小的六角螺丝")]),t._v('"的扳手即可, 他不用关心扳手的品牌和样式, 也不用采购扳手,更不用关心这个扳手是怎么来的.而对于库管, 他只需提供满足这样规则的一个扳手即可, 不用去关心老李拿着这个扳手之后去干什么。所以老李和老张都只是关心"可以拧7mm大小的六角螺丝的"这个规则即可, 也就是说, 如果后期仓库里不再提供'),a("img",{attrs:{src:"/blogimages/ASPNETCore2_6/548134-20180303113142362-236256002.png",alt:""}}),t._v("大力牌扳手, 而是提供了"),a("img",{attrs:{src:"/blogimages/ASPNETCore2_6/548134-20180303114221147-722038305.png",alt:""}}),t._v("这样的大牛牌扳手, 无论换了什么牌子和样式, 只要仍满足这个规则, 老李仍然可以正常工作.它们定义了一个规则(比如接口IWrench7mm), 二者都依赖于这个规则, 然后仓库无论提供大力牌(WrenchDaLi : IWrench7mm)还是大牛牌(WrenchDaNiu : IWrench7mm), 都不影响正常工作.")]),t._v(" "),a("p",[t._v("这就是依赖倒置原则(DIP),  不依赖于具体(牌子),  高层模块(老李)不应该依赖于低层模块(大力牌扳手), 二者应该依赖于抽象(IWrench7mm:可以拧7mm大小的六角螺丝)。如果直接由老李去获取(new)大力牌扳手, 那么当业务改变要求采用大牛牌的时候, 我们就要去修改老李的代码.为了解耦, 在本例中我们只要在配置中让仓库由原来的提供大力牌改为提供大牛牌即可。老李要使用的时候, 可以通过注入(构造器、属性、方法)的方式, 将仓库提供的扳手实例提供给老李使用。")]),t._v(" "),a("h2",{attrs:{id:"_2-容器的构建和规则"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_2-容器的构建和规则"}},[t._v("#")]),t._v(" 2.容器的构建和规则")]),t._v(" "),a("p",[t._v("继续上面的例子, 库管老张为什么会提供给老李大力牌而不是大牛牌的扳手呢? 那是因为领导给了他一份构建仓库的"),a("span",{staticStyle:{color:"#ff6600"}},[t._v("物品购置及发放清单")]),t._v(":")]),t._v(" "),a("p",[t._v("A. 当有人要7mm的六角扳手的时候,给他一个大力牌的扳手, 当再有人来要的时候就再给另一把。")]),t._v(" "),a("p",[t._v("B. 但对于相机, 每个小组只能给一台, 小组内所有人共用这一台。")]),t._v(" "),a("p",[t._v("C. 卡车更是全单位只有一辆, 谁申请都是同一辆。")]),t._v(" "),a("p",[a("img",{attrs:{src:"/blogimages/ASPNETCore2_6/548134-20180304222201242-1577523357.png",alt:""}})]),t._v(" "),a("p",[t._v("图二")]),t._v(" "),a("h2",{attrs:{id:"_3-asp-net-core-2-0中的依赖注入"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_3-asp-net-core-2-0中的依赖注入"}},[t._v("#")]),t._v(" 3.ASP.NET Core 2.0中的依赖注入")]),t._v(" "),a("p",[t._v("首先看一下下面的图三")]),t._v(" "),a("p",[a("img",{attrs:{src:"/blogimages/ASPNETCore2_6/548134-20180304223315637-868568123.png",alt:""}})]),t._v(" "),a("p",[t._v("图三")]),t._v(" "),a("p",[t._v("这就是ASP.NET Core 中默认的依赖注入方式,  对比一下图二是不是很像?")]),t._v(" "),a("p",[t._v("上篇文章说要将Startup放大介绍一下,  那么打开Startup这个文件,  看一下里面的"),a("span",{staticStyle:{"font-family":"Menlo"}},[t._v("ConfigureServices方法。")]),t._v("顾名思义,  这个方法是用来配置服务,")]),t._v(" "),a("div",{staticClass:"language-csharp extra-class"},[a("pre",{pre:!0,attrs:{class:"language-csharp"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token return-type class-name"}},[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("void")])]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("ConfigureServices")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("IServiceCollection")]),t._v(" services"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    services"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("AddMvc")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),a("p",[t._v("此方法接收一个IServiceCollection类型的参数,  查看它的定义, 被定义在"),a("a",{attrs:{href:"https://github.com/aspnet/DependencyInjection",target:"_blank",rel:"noopener noreferrer"}},[t._v("Microsoft.Extensions.DependencyInjection"),a("OutboundLink")],1),t._v("这个NuGet包中, 功能就是依赖注入, 在ASP.NET Core中被广泛使用.")]),t._v(" "),a("h3",{attrs:{id:"_1iservicecollection"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1iservicecollection"}},[t._v("#")]),t._v(" ①IServiceCollection")]),t._v(" "),a("p",[t._v("它正是图三中的"),a("span",{staticStyle:{color:"#ff6600"}},[t._v("①IServiceCollection, ")]),t._v("它是一个"),a("code",[t._v("IList<ServiceDescriptor>")]),t._v("类型的集合。也就是上门的维修工的例子中领导制定的清单"),a("span",{attrs:{"data-mce-":""}},[t._v(',  而Startup中的ConfigureServices这个方法的作用就是让我们作为"领导"来配置这个清单。')]),t._v("方法中默认调用的services.AddMvc(),  是IServiceCollection的一个扩展方法 "),a("span",{staticStyle:{color:"#0000ff"}},[t._v("public` "),a("span",{staticStyle:{color:"#0000ff"}},[t._v("static")]),t._v(" IMvcBuilder AddMvc("),a("span",{staticStyle:{color:"#0000ff"}},[t._v("this")]),t._v(" IServiceCollection services);")]),t._v(" , 作用就是向这个清单中添加了一些MVC需要的服务,例如Authorization、RazorViewEngin、DataAnnotations等。")]),t._v(" "),a("p",[t._v("系统需要的添加好了, 剩下的就是我们把自己需要的用的添加进去了。  这里我们可以创建一个ServiceDescriptor然后把它添加到这个集合里,  系统"),a("span",{attrs:{"data-mce-":""}},[t._v("①IServiceCollection")]),t._v("也提供了AddSingleton、AddScoped和AddTransient这样的方法, 三种方法定义了所添加服务的生命周期, 具体见"),a("span",{staticStyle:{color:"#ff6600"}},[t._v("②ServiceDescriptor")]),t._v(".")]),t._v(" "),a("p",[t._v("当然我们可以在ConfigureServices中通过一堆AddXXX将服务添加到"),a("span",{attrs:{"data-mce-":""}},[t._v("IServiceCollection")]),t._v(",  但这样好多堆在一起不易于修改和阅读,  特别还有一些功能会包含好几个服务的添加,  所以推荐像系统默认的 "),a("code",[t._v("AddMvc()")]),t._v(" 这样封装到一个扩展方法中去。")]),t._v(" "),a("p",[t._v("现在来看一下清单中的内容。")]),t._v(" "),a("h3",{attrs:{id:"_2servicedescriptor"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_2servicedescriptor"}},[t._v("#")]),t._v(" ②ServiceDescriptor")]),t._v(" "),a("p",[t._v("既然"),a("span",{staticStyle:{color:"#ff6600"}},[t._v("①IServiceCollection")]),t._v(" 是一个"),a("code",[t._v("IList<ServiceDescriptor>")]),t._v(",  那么ServiceDescriptor也就是这个集合中的内容了,  也就是仓库中物品的描述.对照图三中的"),a("span",{staticStyle:{color:"#ff6600"}},[t._v("②ServiceDescriptor")]),t._v("看一下它的各个属性。")]),t._v(" "),a("p",[a("strong",[t._v("A. Type ServiceType:")]),t._v(" 服务的类型    "),a("span",{staticStyle:{color:"#ff6600"}},[t._v("--7mm六角扳手")])]),t._v(" "),a("p",[a("strong",[t._v("B. Type ImplementationType:")]),t._v(" 实现的类型  "),a("span",{staticStyle:{color:"#ff6600"}},[t._v("--大力牌扳手")])]),t._v(" "),a("p",[a("strong",[t._v("C. ServiceLifetime Lifetime:")]),t._v(" 服务的生命周期  "),a("span",{staticStyle:{color:"#ff6600"}},[t._v("--若干(谁要都给一把新的)    ")])]),t._v(" "),a("p",[a("strong",[t._v("D. object ImplementationInstance:")]),t._v(" 实现服务的实例")]),t._v(" "),a("p",[a("strong",[t._v("E: Func<IServiceProvider, object> ImplementationFactory:")]),t._v(" 创建服务实例的工厂")]),t._v(" "),a("p",[a("strong",[t._v("ServiceLifetime")]),t._v("是一个枚举, 上文说的AddSingleton、AddScoped和AddTransient就是对应这个枚举, 分别为:")]),t._v(" "),a("p",[a("strong",[t._v("Singleton")]),t._v(": 单例, 例子中的卡车, 全单位只有一辆, 谁调用都是返回这个实例。")]),t._v(" "),a("p",[a("strong",[t._v("Scoped")]),t._v(": 区域内单例, 例子中的傻瓜相机, 每小组一台, 小组内谁要都是同一台, 不同小组的相机不同。")]),t._v(" "),a("p",[a("strong",[t._v("Transient")]),t._v(": 临时的   例子中的扳手和锤子, 谁要都给一把新的, 所有人的都不是同一把。")]),t._v(" "),a("p",[t._v("从这些属性的介绍来看, ServiceDescriptor规定了当有人需要ServiceType这个类型服务的时候, 提供给他一个ImplementationType类型的实例,  其他几个属性规定了提供的方法和生命周期.")]),t._v(" "),a("h3",{attrs:{id:"_3iserviceprovider"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_3iserviceprovider"}},[t._v("#")]),t._v(" ③IServiceProvider")]),t._v(" "),a("p",[a("span",{staticStyle:{color:"#ff6600"}},[t._v(" ③IServiceProvider ")]),t._v("服务提供者,由"),a("span",{staticStyle:{color:"#ff6600"}},[t._v("①IServiceCollection")]),t._v("的扩展方法BuildServiceProvider创建, 当需要它提供某个服务的时候,  它会根据创建它的"),a("span",{staticStyle:{color:"#ff6600"}},[t._v("①IServiceCollection")]),t._v("中的对应的"),a("span",{staticStyle:{color:"#ff6600"}},[t._v("②ServiceDescriptor")]),t._v("提供相应的服务实例.。它提供了"),a("span",{staticStyle:{color:"#ff6600"}},[t._v("⑤GetService、GetRequiredService、GetServices、GetRequiredServices")]),t._v("这样的几个用于提供服务实例的方法,就像库管老张一样,  告诉他你需要什么服务的实例, 他会根据清单规定给你对应的工具。")]),t._v(" "),a("p",[t._v("**GetService和GetRequiredService的区别: **")]),t._v(" "),a("p",[t._v('维修工老李: "老张, 给我一架空客A380."  -- '),a("code",[t._v("GetService<IA380>()")]),t._v(";")]),t._v(" "),a("p",[t._v('老张: "这个没有."   -- return null;')]),t._v(" "),a("p",[t._v('维修工老李: "老张, '),a("span",{staticStyle:{color:"#ff6600"}},[t._v("必须")]),t._v('给我一架空客A380!"  -- '),a("code",[t._v("GetRequiredService<IA380>()")]),t._v(";")]),t._v(" "),a("p",[t._v("老张: \"这个真TMD没有.\"   -- System.InvalidOperationException:“No service for type 'IA380' has been registered.”;")]),t._v(" "),a("p",[t._v('GetServices和GetRequiredServices这两个加了"s"的方法返回对应的集合。')]),t._v(" "),a("h3",{attrs:{id:"_4iservicescope"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_4iservicescope"}},[t._v("#")]),t._v(" ④IServiceScope")]),t._v(" "),a("p",[t._v("上文中的ServiceDescriptor的Lifetime属性为Scoped的时候, IServiceProvider会为其创建一个新的区域"),a("span",{staticStyle:{color:"#ff6600"}},[t._v("④IServiceScope")]),t._v(",")]),t._v(" "),a("div",{staticClass:"language-csharp extra-class"},[a("pre",{pre:!0,attrs:{class:"language-csharp"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("interface")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("IServiceScope")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token type-list"}},[a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("IDisposable")])]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token return-type class-name"}},[t._v("IServiceProvider")]),t._v(" ServiceProvider "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("get")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),a("p",[t._v('从上面的代码可以看出它只是对IServiceProvider进行了一个简单的封装, 原始的IServiceProvider通过CreateScope()创建了一个IServiceScope, 而这个IServiceScope的ServiceProvider属性将负责这个区域内的服务提供, 而Lifetime为Scoped的ServiceDescriptor创建的实例在本区域内是以"单例"的形式存在的.')]),t._v(" "),a("p",[t._v("在ASP.NET Core中, Lifetime为Scoped的实例在每次请求中只创建一次.")]),t._v(" "),a("h2",{attrs:{id:"_4-使用方法及需要注意的问题"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_4-使用方法及需要注意的问题"}},[t._v("#")]),t._v(" 4.使用方法及需要注意的问题")]),t._v(" "),a("p",[t._v("对于上面的维修工的例子, ASP.NET Core的依赖注入还是有一些"),a("span",{staticStyle:{color:"#ff6600"}},[t._v("不一样")]),t._v("的地方,  比如用卡车 (全单位只有一辆, 谁借都是这一辆) 来类比单例， 只有一个确实没问题， 但对于卡车， A把它借走了， B只有等他被还回来才能去借。 同样标记为Scoped的傻瓜相机即使在小组内也是需要轮换使用的。 没错， 就是"),a("span",{staticStyle:{color:"#ff6600"}},[t._v("并发")]),t._v("问题，对于ASP.NET Core的依赖注入提供的"),a("strong",[t._v("Singleton")]),t._v("和"),a("strong",[t._v("Scoped")]),t._v("的实例来说， 它是很有可能同时被多个地方获取并调用的。通过下面的例子看一下这个问题， 顺便巩固一下上面的内容。")]),t._v(" "),a("div",{staticClass:"language-csharp extra-class"},[a("pre",{pre:!0,attrs:{class:"language-csharp"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("interface")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("ITest")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token return-type class-name"}},[t._v("Guid")]),t._v(" Guid "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("get")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token return-type class-name"}},[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("string")])]),t._v(" Name "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("get")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("set")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("class")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Test")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token type-list"}},[a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("ITest")])]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("Test")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("this")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("Guid "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" Guid"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("NewGuid")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token return-type class-name"}},[t._v("Guid")]),t._v(" Guid "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("get")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token return-type class-name"}},[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("string")])]),t._v(" Name "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("get")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("set")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),a("p",[t._v("一个Test类继承自ITest, 为了方便比较是不是同一个实例, 在构造方法里对它的Guid属性赋一个新值, 然后将其注册一下")]),t._v(" "),a("div",{staticClass:"language-csharp extra-class"},[a("pre",{pre:!0,attrs:{class:"language-csharp"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token return-type class-name"}},[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("void")])]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("ConfigureServices")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("IServiceCollection")]),t._v(" services"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    services"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("AddMvc")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    services"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token generic-method"}},[a("span",{pre:!0,attrs:{class:"token function"}},[t._v("AddTransient")]),a("span",{pre:!0,attrs:{class:"token generic class-name"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("ITest"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("Test"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),a("p",[t._v("现在通过三种方法来获取这个Test, Controller中如下")]),t._v(" "),a("div",{staticClass:"language-csharp extra-class"},[a("pre",{pre:!0,attrs:{class:"language-csharp"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("class")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("HomeController")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token type-list"}},[a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Controller")])]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("private")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("ITest")]),t._v(" _test"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("HomeController")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("ITest")]),t._v(" test"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("this")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_test "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" test"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token return-type class-name"}},[t._v("IActionResult")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("Index")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        ViewBag"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("Test "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("this")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("_test"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//构造方法获取")]),t._v("\n        ViewBag"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("TestFromContext "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" HttpContext"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("RequestServices"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token generic-method"}},[a("span",{pre:!0,attrs:{class:"token function"}},[t._v("GetService")]),a("span",{pre:!0,attrs:{class:"token generic class-name"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("ITest"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//通过HttpContext获取 需要using Microsoft.Extensions.DependencyInjection")]),t._v("\n        "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("View")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),a("p",[t._v("View中通过@inject ITest  viewITest的方式获取, 然后把他们的Guid值显示出来:")]),t._v(" "),a("div",{staticClass:"language-csharp extra-class"},[a("pre",{pre:!0,attrs:{class:"language-csharp"}},[a("code",[t._v("@inject ITest  viewITest\n"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),t._v("ul"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(">")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),t._v("li"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(">")]),t._v("@ViewBag"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("Test"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("Guid"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v("li"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(">")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),t._v("li"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(">")]),t._v("@ViewBag"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("TestFromContext"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("Guid"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v("li"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(">")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),t._v("li"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(">")]),t._v("@viewITest"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("Guid"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v("li"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(">")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v("ul"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(">")]),t._v("\n")])])]),a("p",[t._v("结果如下")]),t._v(" "),a("div",{staticClass:"language-csharp extra-class"},[a("pre",{pre:!0,attrs:{class:"language-csharp"}},[a("code",[t._v("ad79690e"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("1ee2"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("41bd"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("82f1"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("062de4c124b2\n92cd97fc"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("7083")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("4b10"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("99e4")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("13b6b6926c16\ncd0105f4"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("fa9d"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("4221")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("b395"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("af06798d96a2\n")])])]),a("p",[t._v("说明三种方式获取了三个不同的实例, 刷新一下页面, 又变成了另外三个不同的值.")]),t._v(" "),a("p",[t._v("现在在startup文件中将原来的 "),a("code",[t._v("services.AddTransient<ITest,Test>()")]),t._v(" 改为 "),a("code",[t._v("services.AddSingleton<ITest,Test>()")]),t._v(" , 其他不变, 重新运行一下, 结果如下")]),t._v(" "),a("div",{staticClass:"language-csharp extra-class"},[a("pre",{pre:!0,attrs:{class:"language-csharp"}},[a("code",[t._v("dd4c952e"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("b64c"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("4dc8"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("af01"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("2b9d667cf190\ndd4c952e"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("b64c"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("4dc8"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("af01"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("2b9d667cf190\ndd4c952e"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("b64c"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("4dc8"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("af01"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("2b9d667cf190\n")])])]),a("p",[t._v("发现三组值是一样的, 说明获得的是同一个实例, 在刷新一下页面, 仍然是这三组值, 说明多次请求获得的结果也是同一个实例.")]),t._v(" "),a("p",[t._v("再将 "),a("code",[t._v("services.AddSingleton<ITest,Test>()")]),t._v(" 改为 "),a("code",[t._v("services.AddScoped<ITest,Test>()")]),t._v(" , 重新运行, 这次结果是")]),t._v(" "),a("div",{staticClass:"language-csharp extra-class"},[a("pre",{pre:!0,attrs:{class:"language-csharp"}},[a("code",[t._v("ad5a600b"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("75fb"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("43c0"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("aee9"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("e90231fd510c\nad5a600b"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("75fb"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("43c0"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("aee9"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("e90231fd510c\nad5a600b"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("75fb"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("43c0"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("aee9"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("-")]),t._v("e90231fd510c\n")])])]),a("p",[t._v("三组数字相同, 刷新一下, 又变成了另外三组一样的值, 这说明在同一次请求里, 获取的实例是同一个。")]),t._v(" "),a("p",[t._v("因为无论在Singleton还是Scoped的情况下, 可能在应用的多个地方同时使用同一个实例, 所以在程序设置的时候就要注意了, 如果存在像在上面的Test有个Name属性提供了 "),a("code",[t._v("{ get; set; }")]),t._v("的时候,多个引用者处理它的值, 会造成一些不可预料的错误。")]),t._v(" "),a("h2",{attrs:{id:"_5-服务的dispose"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_5-服务的dispose"}},[t._v("#")]),t._v(" 5.服务的Dispose")]),t._v(" "),a("p",[t._v("对于每次请求, 我们最初配置的根IServiceProvider通过CreateScope()创建了一个新的IServiceScope, 而这个IServiceScope的ServiceProvider属性将负责本次该次请求的服务提供, 当请求结束, 这个ServiceProvider的dispose会被调用, 同时它负责由它创建的各个服务。")]),t._v(" "),a("p",[t._v("在 1.0 版中，ServiceProvider将对"),a("em",[t._v("所有")]),t._v(" "),a("code",[t._v("IDisposable")]),t._v(" 对象调用 dispose，包括那些并非由它创建的对象。")]),t._v(" "),a("p",[t._v("而在2.0中, ServiceProvider只调用由"),a("span",{attrs:{"data-ttu-id":"ca47b-268"}},[t._v("它创建的 "),a("code",[t._v("IDisposable")]),t._v(" 类型的 "),a("code",[t._v("Dispose")]),t._v("。 "),a("span",{attrs:{"data-ttu-id":"ca47b-269"}},[t._v("如果将一个实例添加到容器，它将不会被释放。 ")])])]),t._v(" "),a("p",[a("span",{attrs:{"data-ttu-id":"ca47b-268"}},[a("span",{attrs:{"data-ttu-id":"ca47b-269"}},[t._v(" 例如:")])]),a("span",{attrs:{"data-ttu-id":"ca47b-268"}},[a("span",{attrs:{"data-ttu-id":"ca47b-269"}},[a("code",[t._v('services.AddSingleton<ITest>(<span style="color: #0000ff;">new Test())')]),t._v(";")])])]),t._v(" "),a("h2",{attrs:{id:"_6-我想换个容器"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_6-我想换个容器"}},[t._v("#")]),t._v(" 6.我想换个容器")]),t._v(" "),a("p",[t._v("可以将默认的容器改为其他的容器, 比如"),a("code",[t._v("Autofac")]),t._v(",这需要将"),a("code",[t._v("ConfigureServices")]),t._v("方法由返回"),a("code",[t._v("void")]),t._v("改为"),a("code",[t._v("IServiceProvider")]),t._v("。")]),t._v(" "),a("div",{staticClass:"language-csharp extra-class"},[a("pre",{pre:!0,attrs:{class:"language-csharp"}},[a("code",[a("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("public")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token return-type class-name"}},[t._v("IServiceProvider")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("ConfigureServices")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("IServiceCollection")]),t._v(" services"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("3")]),t._v("     services"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("AddMvc")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("4")]),t._v("     "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// Add other framework services")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("5")]),t._v(" \n"),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("6")]),t._v("     "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// Add Autofac")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("7")]),t._v("     "),a("span",{pre:!0,attrs:{class:"token class-name"}},[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")])]),t._v(" containerBuilder "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token constructor-invocation class-name"}},[t._v("ContainerBuilder")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("8")]),t._v("     containerBuilder"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token generic-method"}},[a("span",{pre:!0,attrs:{class:"token function"}},[t._v("RegisterModule")]),a("span",{pre:!0,attrs:{class:"token generic class-name"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("DefaultModule"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("9")]),t._v("     containerBuilder"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("Populate")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("services"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("10")]),t._v("     "),a("span",{pre:!0,attrs:{class:"token class-name"}},[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")])]),t._v(" container "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" containerBuilder"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("Build")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("11")]),t._v("     "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token constructor-invocation class-name"}},[t._v("AutofacServiceProvider")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("container"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("12")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])])])}),[],!1,null,null,null);s.default=n.exports}}]);