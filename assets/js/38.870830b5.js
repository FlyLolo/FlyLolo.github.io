(window.webpackJsonp=window.webpackJsonp||[]).push([[38],{313:function(t,n,s){"use strict";function a(t,n,s,a,e,r,p,o){var c,u="function"==typeof t?t.options:t;if(n&&(u.render=n,u.staticRenderFns=s,u._compiled=!0),a&&(u.functional=!0),r&&(u._scopeId="data-v-"+r),p?(c=function(t){(t=t||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(t=__VUE_SSR_CONTEXT__),e&&e.call(this,t),t&&t._registeredComponents&&t._registeredComponents.add(p)},u._ssrRegister=c):e&&(c=o?function(){e.call(this,(u.functional?this.parent:this).$root.$options.shadowRoot)}:e),c)if(u.functional){u._injectStyles=c;var _=u.render;u.render=function(t,n){return c.call(n),_(t,n)}}else{var v=u.beforeCreate;u.beforeCreate=v?[].concat(v,c):[c]}return{exports:t,options:u}}s.d(n,"a",(function(){return a}))},403:function(t,n,s){"use strict";s.r(n);var a=s(313),e=Object(a.a)({},(function(){var t=this,n=t.$createElement,s=t._self._c||n;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("div",{staticClass:"language-csharp extra-class"},[s("pre",{pre:!0,attrs:{class:"language-csharp"}},[s("code",[t._v("@"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("interface")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("User")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token return-type class-name"}},[t._v("NSObject")]),t._v("  \n\n    @property "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("nonatomic"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("retain"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" NSString"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v(" tRetain"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  \n    @property "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("nonatomic"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("assign"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" NSString"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v(" tAssign"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  \n    @property "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("nonatomic"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("copy"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" NSString"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v(" tcopy"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  \n\n    @end\n")])])]),s("p",[t._v("类User有个属性tRetain, 只是"),s("a",{attrs:{href:"http://lib.csdn.net/base/softwaretest",title:"软件测试知识库",target:"_blank",rel:"noopener noreferrer"}},[t._v("测试"),s("OutboundLink")],1),t._v("就用NSString类型了（此类型一般用copy, 因为可能是个NSMutableString,不希望在赋值后被其他地方修改内容）。")]),t._v(" "),s("div",{staticClass:"language-csharp extra-class"},[s("pre",{pre:!0,attrs:{class:"language-csharp"}},[s("code",[t._v("User"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v(" user "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("User")]),t._v(" alloc"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v("init"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  \n\n    NSString"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v(" testRetain "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("NSString")]),t._v(" stringWithFormat"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('@"retain"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  \n    "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("NSLog")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('@"testRetain.retainCount=%lu"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("unsigned "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("long")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("testRetain"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("retainCount"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//1  ")]),t._v("\n      \n    user"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("tRetain "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" testRetain"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  \n    "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("NSLog")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('@"testRetain.retainCount=%lu"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("unsigned "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("long")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("testRetain"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("retainCount"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("   "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//2  ")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("NSLog")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('@"user.tRetain.retainCount=%lu"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("unsigned "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("long")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("user"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("tRetain"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("retainCount"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//2  ")]),t._v("\n      \n    NSString"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v(" testRetain2 "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('@"retain2"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  \n    "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("NSLog")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('@"testRetain2.retainCount=%lu"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("unsigned "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("long")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("testRetain2"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("retainCount"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//4294967295 自动释放对象  返回max unsigned long  ")]),t._v("\n      \n\n    user"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("tRetain "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" testRetain2"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  \n    "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("NSLog")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('@"testRetain.retainCount=%lu"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("unsigned "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("long")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("testRetain"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("retainCount"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("   "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//1  ")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("NSLog")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('@"testRetain2.retainCount=%lu"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("unsigned "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("long")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("testRetain2"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("retainCount"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//4294967295  ")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("NSLog")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('@"user.RetainValue.retainCount=%lu"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("unsigned "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("long")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("user"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("tRetain"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("retainCount"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//4294967295  ")]),t._v("\n      \n\n    NSString"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v(" testRetain3 "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("NSString")]),t._v(" stringWithFormat"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('@"retain3"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  \n    "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("NSLog")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('@"testRetain3.retainCount=%lu"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("unsigned "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("long")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("testRetain3"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("retainCount"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//1  ")]),t._v("\n      \n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("testRetain3")]),t._v(" retain"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  \n    "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("NSLog")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('@"testRetain3.retainCount=%lu"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("unsigned "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("long")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("testRetain3"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("retainCount"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//2  ")]),t._v("\n      \n    NSString"),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v(" testRetain4 "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("NSString")]),t._v(" stringWithString"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("testRetain3"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("  \n    "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("NSLog")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('@"testRetain3.retainCount=%lu"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("unsigned "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("long")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("testRetain3"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("retainCount"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//3  ")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("NSLog")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('@"testRetain4.retainCount=%lu"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("unsigned "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("long")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("testRetain4"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("retainCount"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//3")]),t._v("\n")])])]),s("p",[t._v("strong是ARC后引入的关键字， 在ARC环境中等同于Retain。")]),t._v(" "),s("p",[t._v("NSSring* str = [NSString stringWithString:字符串]；   此方法相当于上文对一个retain属性赋值。   若后面的字符串参数的计数为4294967295，则str的计数也是。   若字符串参数可计数， 例如1， 则执行后计数加1.")])])}),[],!1,null,null,null);n.default=e.exports}}]);