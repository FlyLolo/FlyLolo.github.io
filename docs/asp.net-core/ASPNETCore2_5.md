---
title: 五.服务的加载与运行
date: 2018-02-27
tags:
 - ASP.NET Core
categories:
 -  .NET
---

"跨平台"后的ASP.Net Core是如何接收并处理请求的呢? 它的运行和处理机制和之前有什么不同?

本章从"宏观"到"微观"地看一下它的结构以及不同时期都干了些什么.

 [<span data-ttu-id="4542a-111">ASP.NET Core 系列目录</span>](http://www.cnblogs.com/FlyLolo/p/ASPNETCore2_0.html)

**本章主要内容如下:**

ASP.NET Core 的运行机制: "宏观"的看一下Http请求的处理流程. 

ASP.NET Core 的配置与运行: 2倍放大后的ASP.NET Core Application, Kestrel服务器、启动与配置

ASP.NET Core 的环境变量.

## 1. ASP.NET Core 的运行机制

![](/blogimages/ASPNETCore2_5/548134-20180220195943455-548897477.jpg)

                                                                   图1

ASP.NET Core 的运行机制如上图所示, 现在做一下详细说明.

 ASP.NET Core提供两种服务器可用, 分别是Kestrel和HTTP.sys(Core 1.x 中被命名为 WebListener), 

A. Kestrel是一个跨平台的Web服务器;

B. HTTP.sys只能用在Windows系统中. 

②Internet:当需要部署在Internal Network 中并需要 Kestrel 中没有的功能（如 Windows 身份验证）时，可以选择HTTP.sys。

③IIS、Apache、Nginx: Kestrel 可以单独使用 ，也可以将其与反向代理服务器（如 IIS、Nginx 或 Apache）结合使用。 请求经这些服务器进行初步处理后转发给Kestrel(即图中虚线的可选流程).

大概的运行机制就是这样, 那么具体到ASP.NET Core Application是如何运行的呢? 我们将图1中ASP.NET Core Application这个红框框放大一下,看下一节.

## 2. ASP.NET Core 的启动

看一下将图1的ASP.NET Core Application放大后的样子:

![](/blogimages/ASPNETCore2_5/548134-20180227224819998-776243394.png)

                                                                    图2

④Main方法, 程序的起点.

⑤创建并配置WebHostBuilder: 首先调用Create­DefaultBuilder( 如图所示, 它是一系列配置的大综合,下文做详细介绍), 进行一系列配置之后, 调用` UseStartup<T>()`, 

指定为启动配置文件. 在Startup中, 将进行两个比较重要的工作, ⑧服务的依赖注入⑨配置管道, 后文将对这一部分详细的介绍.

⑥生成WebHostBuilder并进行了一系列配置之后, 通过这个WebHostBuilder来Build出一个IWebHost.

⑦调用IWebHost的Run方法使之开始运行.

ASP.NET Core 应用程序本质上是控制台应用程序，所以它也是以一个我们熟悉的Main方法作为程序的起点.

打开Program.cs文件, 默认是如下代码

```csharp
public class Program
{
    public static void Main(string[] args)
    {
        BuildWebHost(args).Run();
    }

    public static IWebHost BuildWebHost(string[] args) =>
        WebHost.CreateDefaultBuilder(args)
            .UseStartup<Startup>()
            .Build();
}
```

定义了一个BuildWebHost方法, 在Main中调用它返回一个IWebHost, 并使这个IWebHost"Run起来". 再看BuildWebHost方法内部, 通过调用CreateDefaultBuilder

创建了一个IWebHostBuilder, 然后用这个Builder来Build出一个IWebHost.

简单来说就是 创建`IWebHostBuilder=>Builder=>Build()=>IWebHost=>Run()`.

## 3. WebHostBuilder的一系列配置

系统离不开各种各样的配置, 比如常见的读取配置文件, 指定日志处理程序等, 我们详细的看一下.

### Create­DefaultBuilder

CreateDefaultBuilder, 顾名思义, 它是一个默认配置 . 如图2所示, 它主要是调用了各种ConfigureXXX和UseXXX, 首先看一下它的源码

```csharp
1 public static IWebHostBuilder CreateDefaultBuilder(string[] args)
2 {
3     var builder = new WebHostBuilder()
4         .UseKestrel()
5         .UseContentRoot(Directory.GetCurrentDirectory())
6         .ConfigureAppConfiguration((hostingContext, config) =>
7         {
8             var env = hostingContext.HostingEnvironment;
9 
10             config.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
11                   .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true, reloadOnChange: true);
12 
13             if (env.IsDevelopment())
14             {
15                 var appAssembly = Assembly.Load(new AssemblyName(env.ApplicationName));
16                 if (appAssembly != null)
17                 {
18                     config.AddUserSecrets(appAssembly, optional: true);
19                 }
20             }
21 
22             config.AddEnvironmentVariables();
23 
24             if (args != null)
25             {
26                 config.AddCommandLine(args);
27             }
28         })
29         .ConfigureLogging((hostingContext, logging) =>
30         {
31             logging.AddConfiguration(hostingContext.Configuration.GetSection("Logging"));
32             logging.AddConsole();
33             logging.AddDebug();
34         })
35         .UseIISIntegration()
36         .UseDefaultServiceProvider((context, options) =>
37         {
38             options.ValidateScopes = context.HostingEnvironment.IsDevelopment();
39         });
40 
41     return builder;
42 }
```

上面的源码中我们看到它这些ConfigureXXX和UseXXX的过程, 而在Core 1.0版本中是没有CreateDefaultBuilder这个方法的,

系统默认是逐个调用这些ConfigureXXX和UseXXX的,在Core 2.0中, 为了代码简洁和使用方便, 将这些常规情况下需要调用的方法放到了这个名为CreateDefaultBuilder的方法中.

一般情况下，调用Create­DefaultBuilder 执行其中的这些的默认配置足够用了。但既然这是默认配置,  我们就可以根据自身情况自定义.

因为这些配置都是对 WebHostBuilder进行修改, 而修改后再次返回修改后的 WebHostBuilder, 所以在Create­DefaultBuilder不符合现实需求的情况下可以通过如下的方法进行自定义.

1)不调用Create­DefaultBuilder, 将上面讲到的这些配置选择性的执行, 甚至可以添加、替换里面的某些配置, 如将UseKestrel改为UseHttpSys.

2)小幅改动, 即调用Create­DefaultBuilder之后再对其返回的WebHostBuilder调用自定义的其他配置方法. 例如可以再次调用 ConfigureAppConfiguration，从而添加更多的配置源.

下面来介绍一下这些ConfigureXXX和UseXXX.

### A. UseKestrel

用于指定服务器使用 Kestrel, 若使用HttpSys, 需使用UseHttpSys。

<span data-ttu-id="24e91-105">Kestrel 是跨平台 ASP.NET Core Web 服务器，它基于 libuv（一个跨平台异步 I/O 库）。 <span data-ttu-id="24e91-106">Kestrel 是 Web 服务器，默认包括在 ASP.NET Core 项目模板中。 </span></span>

<span data-ttu-id="24e91-107">Kestrel 支持以下功能：</span>

*   <span data-ttu-id="24e91-108">HTTPS</span>

*   <span data-ttu-id="24e91-109">用于启用 WebSocket 的不透明升级</span>

*   <span data-ttu-id="24e91-110">用于获得 Nginx 高性能的 Unix 套接字.</span>

<span data-ttu-id="24e91-110"><span data-ttu-id="24e91-145">默认情况下，ASP.NET Core 项目模板使用的是 Kestrel。</span></span>

<span data-ttu-id="24e91-110"><span data-ttu-id="24e91-145">我们可以再次调用UseKestrel来修改Kestrel的配置, 例如限制请求正文的最大值</span></span>

```csharp
public static IWebHost BuildWebHost(string[] args) =>
    WebHost.CreateDefaultBuilder(args)
        .UseStartup<Startup>()
        .UseKestrel(options =>
        {
            options.Limits.MaxRequestBodySize = 10 * 1024;  
    }).Build();
```

### B. UseContentRoot

为应用程序指定根目录。需注意这和 StaticFiles的根<span style="font-family: Menlo;">是不同的, 虽然</span>默认情况下StaticFiles的根是以ContentRoot为依据 ([ContentRoot]/wwwroot)。

### C. ConfigureAppConfiguration

读取配置。如上代码会读取 `appsettings.json` 和 `appsettings.{env.EnvironmentName}.json` , env.EnvironmentName指的是环境, 例如Development. 当在Development环境的时候, 还会读取<span style="font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px;">用户密钥。</span>

<span style="font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px;">这部分在学习系统配置的时候详细介绍.</span>

### D. ConfigureLogging

配置日志处理程序,控制台和调试日志提供程序, 学习日志的时候再详讲.

### E. UseIISIntegration

将应用程序配置为在 IIS 中运行。上面已经讲过, 这里仍需要使用 UseKestrel, 而IIS 起到反向代理的作用，而 Kestrel 仍用作主机。

如果应用程序没有使用 IIS 作为反向代理，那么 UseIISIntegration 不会有任何效果。因此，即使应用程序在非 IIS 方案中运行，也可以安全调用这种方法。

### F.UseDefaultServiceProvider

 设置默认的依赖注入容器, 这部分在后面学习依赖注入的时候再详讲.

## 4. ASP.NET Core 的环境

在 ASP.NET Core 中，有个非常重要而且常用的东西叫环境变量, 它由 ASPNETCORE_ENVIRONMENT 环境变量指定。

我们可以根据需要将此变量设置为任意值，但通常使用的是值 Development、Staging 和 Production。它定义了当前应用程序的运行环境, 我们经常会根据这个变量来让应用采用不同的处理方式.

在上面的例子中, 就有这样的用法

```csharp
if (env.IsDevelopment())
    {
         var appAssembly = Assembly.Load(new AssemblyName(env.ApplicationName));
         if (appAssembly != null)
         {
              config.AddUserSecrets(appAssembly, optional: true);
         }
    }
}
```

_Layout  View  中

```csharp
<environment include="Development">
    <link rel="stylesheet" href="~/lib/bootstrap/dist/css/bootstrap.css" />
    <link rel="stylesheet" href="~/css/site.css" />
</environment>
```

因此，如果在run 之前将 ASPNETCORE_ENVIRONMENT 变量设置为 Development（或在 launchSettings.json 文件中设置此环境变量），

应用程序会在 Development 模式下运行，而不是 Production 模式（这是不设置任何变量时的默认模式）。

<span data-ttu-id="0627d-115">注意：在 Windows 和 macOS 上，环境变量和值不区分大小写。<span class="sxs-lookup"><span data-stu-id="0627d-115"><span data-ttu-id="0627d-116">Linux 环境变量和值区分大小写。</span></span></span></span>

## 5. 小结

 通过上面的内容大概对ASP.NET Core 2.0 的服务启动、配置与运行, 运行环境等做了大概的了解, 其中涉及的部分内容如读取配置、日志等, 将在后期单独介绍.

除了上述内容, ASP.NET Core留给我们作为扩展的地方主要放在了Startup文件中, 即图2中的<span style="color: #ff6600;">⑩Startup, </span>这里进行了两个比较重要的工作, <span style="color: #ff6600;">⑧服务的依赖注入</span>和<span style="color: #ff6600;">⑨配置管道</span>,

下文我们将图2的<span style="color: #ff6600;">⑩Startu</span><span style="color: #ff6600;">p这个红框框放大一些, 看看这里都做了些什么.</span>