(window.webpackJsonp=window.webpackJsonp||[]).push([[21],{528:function(e,r,t){"use strict";t.r(r);var o=t(7),n=Object(o.a)({},(function(){var e=this,r=e.$createElement,t=e._self._c||r;return t("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[t("h2",{attrs:{id:"_1-为什么要使用-asp-net-core"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_1-为什么要使用-asp-net-core"}},[e._v("#")]),e._v(" 1. 为什么要使用 ASP.NET Core？")]),e._v(" "),t("p",[e._v('.NET Core 刚发布的时候根据介绍就有点心里痒痒, 大概看了一下没敢付诸于行动,  现在2.0发布了一段时间了, 之前对其"不稳定"的顾虑也打消的差不多了,')]),e._v(" "),t("p",[e._v("至于为什么要使用core, 官方是这样说的:")]),e._v(" "),t("p",[e._v("ASP.NET Core 是重新设计的 ASP.NET，更改了体系结构，形成了更精简的模块化框架。")]),e._v(" "),t("p",[e._v("ASP.NET Core 具有如下优点：")]),e._v(" "),t("ul",[t("li",[t("p",[e._v("生成 Web UI 和 Web API 的统一场景。")])]),e._v(" "),t("li",[t("p",[e._v("集成"),t("a",{attrs:{href:"https://docs.microsoft.com/zh-cn/aspnet/core/client-side/index",target:"_blank",rel:"noopener noreferrer"}},[e._v("新式客户端框架"),t("OutboundLink")],1),e._v("和开发工作流。")])]),e._v(" "),t("li",[t("p",[e._v("基于环境的云就绪"),t("a",{attrs:{href:"https://docs.microsoft.com/zh-cn/aspnet/core/fundamentals/configuration/index",target:"_blank",rel:"noopener noreferrer"}},[e._v("配置系统"),t("OutboundLink")],1),e._v("。")])]),e._v(" "),t("li",[t("p",[e._v("内置"),t("a",{attrs:{href:"https://docs.microsoft.com/zh-cn/aspnet/core/fundamentals/dependency-injection",target:"_blank",rel:"noopener noreferrer"}},[e._v("依赖项注入"),t("OutboundLink")],1),e._v("。")])]),e._v(" "),t("li",[t("p",[e._v("轻型的"),t("a",{attrs:{href:"https://github.com/aspnet/benchmarks",target:"_blank",rel:"noopener noreferrer"}},[e._v("高性能"),t("OutboundLink")],1),e._v("模块化 HTTP 请求管道。")])]),e._v(" "),t("li",[t("p",[e._v("能够在 "),t("a",{attrs:{href:"https://docs.microsoft.com/zh-cn/aspnet/core/host-and-deploy/iis/index",target:"_blank",rel:"noopener noreferrer"}},[e._v("IIS"),t("OutboundLink")],1),e._v("、"),t("a",{attrs:{href:"https://docs.microsoft.com/zh-cn/aspnet/core/host-and-deploy/linux-nginx",target:"_blank",rel:"noopener noreferrer"}},[e._v("Nginx"),t("OutboundLink")],1),e._v("、"),t("a",{attrs:{href:"https://docs.microsoft.com/zh-cn/aspnet/core/host-and-deploy/linux-apache",target:"_blank",rel:"noopener noreferrer"}},[e._v("Apache"),t("OutboundLink")],1),e._v("、"),t("a",{attrs:{href:"https://docs.microsoft.com/zh-cn/aspnet/core/host-and-deploy/docker/index",target:"_blank",rel:"noopener noreferrer"}},[e._v("Docker"),t("OutboundLink")],1),e._v(" 上进行托管或在自己的进程中进行自托管。")])]),e._v(" "),t("li",[t("p",[e._v("定目标到 "),t("a",{attrs:{href:"https://docs.microsoft.com/dotnet/articles/standard/choosing-core-framework-server",target:"_blank",rel:"noopener noreferrer"}},[e._v(".NET Core"),t("OutboundLink")],1),e._v(" 时，可以使用并行应用版本控制。")])]),e._v(" "),t("li",[t("p",[e._v("简化新式 Web 开发的工具。")])]),e._v(" "),t("li",[t("p",[e._v("能够在 Windows、macOS 和 Linux 进行生成和运行。")])]),e._v(" "),t("li",[t("p",[e._v("开放源代码和"),t("a",{attrs:{href:"https://live.asp.net/",target:"_blank",rel:"noopener noreferrer"}},[e._v("以社区为中心"),t("OutboundLink")],1),e._v("。")])])]),e._v(" "),t("p",[e._v("ASP.NET Core 完全作为 "),t("a",{attrs:{href:"https://www.nuget.org/",target:"_blank",rel:"noopener noreferrer"}},[e._v("NuGet"),t("OutboundLink")],1),e._v(" 包的一部分提供。 这样一来，可以将应用优化为只包含必需 NuGet 包。")]),e._v(" "),t("p",[t("strong",[e._v("总结一下: 主要吸引我的是跨平台、高性能.")])]),e._v(" "),t("h2",{attrs:{id:"_2-如何跨平台"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_2-如何跨平台"}},[e._v("#")]),e._v(" 2. 如何跨平台?")]),e._v(" "),t("p",[e._v("先来看一下.NET Framework和Core的大体结构.")]),e._v(" "),t("p",[t("img",{attrs:{src:"/blogimages/ASPNETCore2_1/548134-20180206153842404-1022691587.png",alt:""}})]),e._v(" "),t("p",[e._v('.NET Framework本身是个"跨Windows"的平台, 而在这个基础上, 又支持C#和VB等语言进行 "跨语言",')]),e._v(" "),t("p",[e._v("这些语言都遵守CLS, 编译成CIL执行. 从我们多层架构设计的角度来看, 只换最底层, 还是很可行的.")]),e._v(" "),t("p",[e._v(".NET Core 重做了一个CoreCLR的运行时,以及一个叫做CoreFX的BCL. 这里要说一下, ASP.NET Core 完全作为 "),t("a",{attrs:{href:"https://www.nuget.org/",target:"_blank",rel:"noopener noreferrer"}},[e._v("NuGet"),t("OutboundLink")],1),e._v(" 包的一部分提供。")]),e._v(" "),t("p",[e._v("这样一来，可以将应用优化为只包含必需 NuGet 包, 使应用更加灵活、模块化的同时提高性能.")]),e._v(" "),t("p",[e._v("文中将.NET Standard放在这里可能有点不合适, .NET Standard不是包含在.NET Core中的, 它是一组API规范,")]),e._v(" "),t("p",[t("img",{attrs:{src:"/blogimages/ASPNETCore2_1/548134-20180206161637841-286258979.png",alt:""}})]),e._v(" "),t("p",[e._v(".NET Core通过实现.NET Standard与 .NET Framework做兼容.")]),e._v(" "),t("p",[e._v("至于跨平台, 因为90%的CoreFX代码都是与平台无关的, 如下图")]),e._v(" "),t("p",[t("img",{attrs:{src:"/blogimages/ASPNETCore2_1/548134-20180206162058904-32283994.png",alt:""}})]),e._v(" "),t("p",[e._v('这一切使我们可以放心的一起"跨平台"啦.')])])}),[],!1,null,null,null);r.default=n.exports}}]);