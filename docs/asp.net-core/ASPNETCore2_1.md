---
title: 一. 概述
date: 2018-02-07
tags:
 - ASP.NET Core
categories:
 -  .NET
---

## 1. 为什么要使用 ASP.NET Core？

.NET Core 刚发布的时候根据介绍就有点心里痒痒, 大概看了一下没敢付诸于行动,  现在2.0发布了一段时间了, 之前对其"不稳定"的顾虑也打消的差不多了,

至于为什么要使用core, 官方是这样说的:

ASP.NET Core 是重新设计的 ASP.NET，更改了体系结构，形成了更精简的模块化框架。

ASP.NET Core 具有如下优点：

*   生成 Web UI 和 Web API 的统一场景。

*   集成[新式客户端框架](https://docs.microsoft.com/zh-cn/aspnet/core/client-side/index)和开发工作流。

*   基于环境的云就绪[配置系统](https://docs.microsoft.com/zh-cn/aspnet/core/fundamentals/configuration/index)。

*   内置[依赖项注入](https://docs.microsoft.com/zh-cn/aspnet/core/fundamentals/dependency-injection)。

*   轻型的[高性能](https://github.com/aspnet/benchmarks)模块化 HTTP 请求管道。

*   能够在 [IIS](https://docs.microsoft.com/zh-cn/aspnet/core/host-and-deploy/iis/index)、[Nginx](https://docs.microsoft.com/zh-cn/aspnet/core/host-and-deploy/linux-nginx)、[Apache](https://docs.microsoft.com/zh-cn/aspnet/core/host-and-deploy/linux-apache)、[Docker](https://docs.microsoft.com/zh-cn/aspnet/core/host-and-deploy/docker/index) 上进行托管或在自己的进程中进行自托管。

*   定目标到 [.NET Core](https://docs.microsoft.com/dotnet/articles/standard/choosing-core-framework-server) 时，可以使用并行应用版本控制。

*   简化新式 Web 开发的工具。

*   能够在 Windows、macOS 和 Linux 进行生成和运行。

*   开放源代码和[以社区为中心](https://live.asp.net/)。

ASP.NET Core 完全作为 [NuGet](https://www.nuget.org/) 包的一部分提供。 这样一来，可以将应用优化为只包含必需 NuGet 包。 

**总结一下: 主要吸引我的是跨平台、高性能.**

## 2. 如何跨平台?

先来看一下.NET Framework和Core的大体结构.

![](/blogimages/ASPNETCore2_1/548134-20180206153842404-1022691587.png)

 .NET Framework本身是个"跨Windows"的平台, 而在这个基础上, 又支持C#和VB等语言进行 "跨语言", 

这些语言都遵守CLS, 编译成CIL执行. 从我们多层架构设计的角度来看, 只换最底层, 还是很可行的.

.NET Core 重做了一个CoreCLR的运行时,以及一个叫做CoreFX的BCL. 这里要说一下, ASP.NET Core 完全作为 [NuGet](https://www.nuget.org/) 包的一部分提供。 

这样一来，可以将应用优化为只包含必需 NuGet 包, 使应用更加灵活、模块化的同时提高性能.

文中将.NET Standard放在这里可能有点不合适, .NET Standard不是包含在.NET Core中的, 它是一组API规范, 

![](/blogimages/ASPNETCore2_1/548134-20180206161637841-286258979.png)

.NET Core通过实现.NET Standard与 .NET Framework做兼容.

至于跨平台, 因为90%的CoreFX代码都是与平台无关的, 如下图

![](/blogimages/ASPNETCore2_1/548134-20180206162058904-32283994.png)

这一切使我们可以放心的一起"跨平台"啦.