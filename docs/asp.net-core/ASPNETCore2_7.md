---
title: 七.启动背后的秘密
date: 2018-03-27
tags:
 - ASP.NET Core
categories:
 -  .NET
---

 为什么我们可以在Startup这个 “孤零零的” 类中配置依赖注入和管道？

 它是什么时候被实例化并且调用的？

 参数中的IServiceCollection services是怎么来的?

 处理管道是怎么构建起来的？

 启动过程中，系统“默默的”做了哪些准备工作？

 上一篇文章讲了ASP.NET Core中的依赖注入， 而它的配置是在Startup这个文件中的 `ConfigureServices(IServiceCollection services)` 方法，而且Startup这个类也没有继承任何类或者接口。 深入的想一想，可能会冒出类似上面列出的好多问题，下面用一幅图来看透它。

## 1. 整体流程图

先上图， 觉得看不清可以点击看大图或者下载后放大查看。

[![](/blogimages/ASPNETCore2_7/548134-20180321160719074-1992689731.png)](/blogimages/ASPNETCore2_7/548134-20180321160719074-1992689731.png)

图一  （[点击放大](/blogimages/ASPNETCore2_7/548134-20180321160719074-1992689731.png)）

## 2. WebHostBuilder

 应用程序在Main方法之后通过调用Create­DefaultBuilder方法创建并配置WebHostBuilder， 

```csharp
1     public class WebHostBuilder : IWebHostBuilder
2     {
3         private readonly List<Action<WebHostBuilderContext, IServiceCollection>> _configureServicesDelegates;
4 
5         private IConfiguration _config;
6         public IWebHostBuilder UseSetting(string key, string value)
7         {
8             _config[key] = value;
9             return this;
10         }
22         public IWebHostBuilder ConfigureServices(Action<WebHostBuilderContext, IServiceCollection> configureServices)
23         {
24             if (configureServices == null)
25             {
26                 throw new ArgumentNullException(nameof(configureServices));
27             }
29             _configureServicesDelegates.Add(configureServices);
30             return this;
31         }
32     }
```

WebHostBuilder存在一个重要的集合<span style="color: #ff6600;">①</span> `<span style="color: #0000ff;">private` <span style="color: #0000ff;">readonly</span> List<Action<WebHostBuilderContext, IServiceCollection>> _configureServicesDelegates;</span> ， 通过 `ConfigureServices` 方法将需要的Action加入进来。

UseSetting是一个用于设置Key-Value的方法， 一些常用的配置均会通过此方法写入_config中。

## 3. `UseStartup<Startup>()`

 Create­DefaultBuilder之后调用`UseStartup<Startup>()`，指定Startup为启动类。

```csharp
public static IWebHostBuilder UseStartup(this IWebHostBuilder hostBuilder, Type startupType)
{
    var startupAssemblyName = startupType.GetTypeInfo().Assembly.GetName().Name;

    return hostBuilder
        .UseSetting(WebHostDefaults.ApplicationKey, startupAssemblyName)
        .ConfigureServices(services =>
        {
            if (typeof(IStartup).GetTypeInfo().IsAssignableFrom(startupType.GetTypeInfo()))
            {
                services.AddSingleton(typeof(IStartup), startupType);
            }
            else
            {
                services.AddSingleton(typeof(IStartup), sp =>
                {
                    var hostingEnvironment = sp.GetRequiredService<IHostingEnvironment>();
                    return new ConventionBasedStartup(StartupLoader.LoadMethods(sp, startupType, hostingEnvironment.EnvironmentName));
                });
            }
        });
}
```

首先获取Startup类对应的AssemblyName， 调用UseSetting方法将其设置为WebHostDefaults.ApplicationKey（“applicationName”）的值。

然后调用WebHostBuilder的<span style="color: #ff6600;">②</span><span style="color: #ff6600;">ConfigureServices</span>方法，将一个Action写入WebHostBuilder 的 configureServicesDelegates中。

这个Action的意思就是说，如果这个被指定的类startupType是一个实现了IStartup的类， 那么将其通过AddSingleton注册到services 这个ServiceCollection中， 如果不是， 那么将其“转换”成 ConventionBasedStartup 这个实现了 IStartup的类后再进行注册。这里涉及到一个StartupLoader的LoadMethods()方法，会通过字符串的方式查找“ConfigureServices”、“Configure{<span style="font-family: Menlo;"> environmentName</span>}Services”这样的方法。

<span style="color: #ff6600;">注意：这里只是将一个Action写入了configureServicesDelegates， 而不是已经执行了对IStartup的注册， 因为这个Action尚未执行，services也还不存在。<span style="color: #000000;">就像菩萨对八戒说： 八戒（Startup）你先在高老庄等着吧， 将来有个和尚带领一个取经小分队（ServiceCollection <span data-mce-="">services </span>）过来的时候你加入他们。</span></span>

<span style="color: #ff6600;"><span style="color: #000000;">其实在Create­DefaultBuilder方法中的几个UseXXX的方法也是这样通过ConfigureServices将对应的Action写入了configureServicesDelegates， 等待唐僧的到来。</span></span>

## 4. WebHostBuilder.Build()

<span style="color: #ff6600;"><span style="color: #000000;">创建并配置好的WebHostBuilder开始通过Build方法创建WebHost了， 首先是BuildCommonServices， </span></span>

```csharp
1 private IServiceCollection BuildCommonServices(out AggregateException hostingStartupErrors)
2 {
3     //...省略...
4     var services = new ServiceCollection();
5     services.AddSingleton(_hostingEnvironment);
6     services.AddSingleton(_context);
7     //....各种Add....
9     foreach (var configureServices in _configureServicesDelegates)
10     {
11         configureServices(_context, services);
12     }
14     return services;
15 }
```

<span data-mce-=""><span data-mce-=""> 在这个方法里创建了ServiceCollection <span data-mce-="">services（以唐僧为首的取经小分队）， 然后通过各种Add方法注册了好多内容进去（收了悟空），然后<span style="color: #ff6600;">③<span data-mce-="">foreach </span></span>之前暂存在configureServicesDelegates中的各个Action，传入services逐一执行， 将之前需要注册的内容注册到services中， 这里就包括Startup（八戒），注意这里仅是进行了注册，而未执行Startup的方法。</span></span></span>

 处理好的这个services被BuildCommonServices返回后赋值给<span style="font-family: Menlo;"> hostingServices,然后<span style="font-family: Menlo;"><span style="font-family: Menlo;"> hostingServices经过Clone()生成<span style="font-family: Menlo;"> applicationServices,再由这个<span style="font-family: Menlo;"> applicationServices进行<span style="font-family: Menlo;"> GetProviderFromFactory(hostingServices)生成一个<span style="font-family: Menlo; color: #0000ff;"> IServiceProvider</span><span style="font-family: Menlo;"> hostingServiceProvider.经过一系列的处理后,可以创建WebHost了。</span></span></span></span></span></span></span>

```csharp
var host = new WebHost(
    applicationServices,
    hostingServiceProvider,
    _options,
    _config,
    hostingStartupErrors);

host.Initialize();
```

 将生成的applicationServices 和 hostingServiceProvider作为参数传递给新生成的WebHost。接下来就是这个WebHost的 Initialize()。

##  5. WebHost.Initialize()

WebHost的 Initialize()的主要工作就是BuildApplication()。

**EnsureApplicationServices()：** 用来处理WebHost的 `<span style="color: #0000ff;">private` IServiceProvider _applicationServices</span> ，<span style="color: #ff6600;">④Startup的ConfigureServices方法在这里被调用</span>。

```csharp
_startup = _hostingServiceProvider.GetRequiredService<IStartup>();
_applicationServices = _startup.ConfigureServices(_applicationServiceCollection);
```

通过 `GetRequiredService<IStartup>()` 获取到我们的_startup， 然后调用这个_startup的 <span style="color: #ff6600;">⑤ConfigureServices</span> 方法，这就是我们用于依赖注入的startup类的ConfigureServices方法了。

<span style="color: #ff6600;">所以，</span>_applicationServices是根据_applicationServiceCollection 加上我们在_startup中注册的内容之后重新生成的<span style="font-family: Menlo;"> IServiceProvider。</span>

**EnsureServer()<span style="color: #ff6600;">⑥</span>：**通过<span style="font-family: Menlo;"> `GetRequiredService<IServer>()`获取Server并配置监听地址。</span>

```csharp
var builderFactory = _applicationServices.GetRequiredService<IApplicationBuilderFactory>();
var builder = builderFactory.CreateBuilder(Server.Features);
builder.ApplicationServices = _applicationServices;
```

获取到 IApplicationBuilderFactory并通过它<span style="color: #ff6600;">⑦</span>创建<span style="font-family: Menlo;"> IApplicationBuilder,并将上面创建的</span>_applicationServices赋值给它的ApplicationServices，它还有个重要的集合_components

```csharp
private readonly IList<Func<RequestDelegate, RequestDelegate>> _components = new List<Func<RequestDelegate, RequestDelegate>>();
```

 从_components的类型可以看出它其实是中间件的集合，是该调用我们的_startup的Configure方法的时候了。

先获取定义的IStartupFilter， <span style="color: #ff6600;">⑧</span>foreach这些IStartupFilter并与_startup的Configure方法一起将配置的中间件写入_components，然后通过 Build()创建RequestDelegate _application，

在Build()中对_components进行处理生成请求处理管道，<span style="color: #ff6600;">关于IStartupFilter和生成管道这部分将在下篇文章进行详细说明。</span>

## 6. WebHost.Run()

 WebHost创建完毕， 最后一步就是Run起来了，WebHost的Run()会调用它的方法StartAsync()

```csharp
public virtual async Task StartAsync(CancellationToken cancellationToken = default(CancellationToken))
{
    //......var hostingApp = new HostingApplication(_application, _logger, diagnosticSource, httpContextFactory);
    await Server.StartAsync(hostingApp, cancellationToken).ConfigureAwait(false);
    _hostedServiceExecutor.StartAsync(cancellationToken).ConfigureAwait(false);
    //.....
}
```

 在之前的文章中我们知道，请求是经过 Server监听=>处理成httpContext=>Application处理，所以这里首先传入上面创建的_application和一个httpContextFactory来<span style="color: #ff6600;">⑨生成一个HostingApplication</span>，并将这个HostingApplication传入Server的StartAsync(), 当Server监听到请求之后， 后面的工作由HostingApplication来完成。

 <span style="color: #ff6600;">⑩hostedServiceExecutor.StartAsync()</span>方法用来开启一个后台运行的服务，一些需要后台运行的操作比如定期刷新缓存等可以放到这里来。

## 7. 更新

 感谢dudu的留言，去github上看了一下WebHost的最新源码，BuildApplication()不再包含EnsureApplicationServices()的调用，并且转移到了WebHost.StartAsync() 中进行； WebHost.Initialize() 中由原本调用BuildApplication()改为调用原本放在BuildApplication()中调用的EnsureApplicationServices()。

 通过VS加载符号的方式调试获取到的WebHost仍是原来的版本，即使删除下载的文件后再次重新获取也一样， 应该是和新建项目默认引用的依赖版本有关。