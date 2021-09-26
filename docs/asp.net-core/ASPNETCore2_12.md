---
title: 十二.内置日志与Nlog
date: 2018-07-02
tags:
 - ASP.NET Core
categories:
 -  .NET
---

 应用离不开日志，虽然现在使用VS有强大的调试功能，开发过程中不复杂的情况懒得输出日志了（想起print和echo的有木有），但在一些复杂的过程中以及应用日常运行中的日志还是非常有用。

 ASP.NET Core提供了内置的日志，但没弄明白这么把它输出到文件， 只能在VS的输出中查看， 谁知道怎么弄告诉我一下。 本例 [GitHub](https://github.com/FlyLolo/BackgroundServiceAndNlog)

## 1. 内置日志的使用

 上一篇：如何在后台运行一个任务  中使用到了内置的日志，直接在构造中注入一下，然后直接使用即可, 非常方便

```csharp
public TokenRefreshService(ILogger<TokenRefreshService> logger)
{
    _logger = logger;
}

protected override async Task ExecuteAsync(CancellationToken stoppingToken)
{
    _logger.LogInformation("Service starting");
    //************
}
```

然后在【输出】窗口中就可以看到输出的日志了：

![](/blogimages/ASPNETCore2_12/548134-20180629091956621-2138526947.png)

想把它输出到txt中， 没找到相应的方法，试试常见的Nlog吧

## 2. 使用Nlog将日志输出到文件

### A.安装Nlog

在NuGet中搜索并安装 NLog.Web.AspNetCore ， 当前版本是4.5.4

![](/blogimages/ASPNETCore2_12/548134-20180629092653519-1895631736.png)

###  B.添加配置文件

新建一个文件nlog.config， 并右键点击其属性，将其“复制到输出目录”设置为“始终复制”。文件内容如下

```csharp
<?xml version="1.0" encoding="utf-8" ?>
<nlog xmlns="http://www.nlog-project.org/schemas/NLog.xsd"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        autoReload="true"
        throwConfigExceptions="true"
        internalLogLevel="info"
        internalLogFile="d:\log\internal-nlog.txt">

    <!-- the targets to write to -->
    <targets>
    <!-- write logs to file  -->
    <target xsi:type="File" name="allfile" fileName="d:\log\nlog-all-${shortdate}.log"
            layout="${longdate}|${event-properties:item=EventId_Id:whenEmpty=0}|${uppercase:${level}}|${logger}|${message} ${exception:format=tostring}" />

    <!-- another file log, only own logs. Uses some ASP.NET core renderers -->
    <target xsi:type="File" name="ownFile-web" fileName="d:\log\nlog-own-${shortdate}.log"
            layout="${longdate}|${event-properties:item=EventId_Id:whenEmpty=0}|${uppercase:${level}}|${logger}|${message} ${exception:format=tostring}|url: ${aspnet-request-url}|action: ${aspnet-mvc-action}|${callsite}" />
    </targets>

    <!-- rules to map from logger name to target -->
    <rules>
    <!--All logs, including from Microsoft-->
    <logger name="*" minlevel="Trace" writeTo="allfile" />

    <!--Skip non-critical Microsoft logs and so log only own logs-->
    <logger name="Microsoft.*" maxlevel="Info" final="true" />
    <!-- BlackHole -->
    <logger name="*" minlevel="Trace" writeTo="ownFile-web" />
    </rules>
</nlog>
```

### C.修改Program.cs文件

 在 `.UseStartup<Startup>()` 后添加一句 `.UseNLog()` 

## 3. 注意事项

按照第二节的描述，NLog已经可以正常使用了，有些细节做一下简要说明：

1. 文件nlog.config的这个名字应该是默认读取的文件名（官方建议全部小写，linux系统中要注意），如果用了别的名字，可以在Program.cs文件中通过 `ConfigureNLog` 方法设置，见下面代码示例。

2. 现在如第一节内置的例子中一样， VS的输出框仍然在输入日志，也就是二者都在生效状态，想只用Nlog，可以调用 `logging.ClearProviders();` 

3. 注意输出目录的权限问题。

代码示例：

```csharp
1     public class Program
2     {
3         public static void Main(string[] args)
4         {
5             NLog.Web.NLogBuilder.ConfigureNLog("nlog1.config");  //假如没有用默认的名字，多写了一个1
6             CreateWebHostBuilder(args).Build().Run();
7         }
8 
9         public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
10             WebHost.CreateDefaultBuilder(args)
11                 .UseStartup<Startup>()
12                 .ConfigureLogging(logging =>
13                 {
14                     logging.ClearProviders(); //移除已经注册的其他日志处理程序
15                     logging.SetMinimumLevel(Microsoft.Extensions.Logging.LogLevel.Trace); //设置最小的日志级别
16                 })
17                 .UseNLog();  
18     }
```

## 4. NLog配置简要说明

    “简要”的说一下NLog的配置：

1.上文提到了一个日志级别，这个级别大概分为6个，由低到高如下：

```csharp
1 logger.LogTrace();
2 logger.LogDebug();
3 logger.LogInformation();
4 logger.LogWarning();
5 logger.LogError();
6 logger.LogCritical();
```

2. 通过上面的例子，看输出的日志文件有3个， 这是在nlog.config中配置的， 通过文件名可以找到对应的配置。

*     internal-nlog 记录了NLog的启动及加载config的信息。

*     nlog-all 记录了所有日志

*    nlog-own 记录了我们自定义的日志

这是为什么呢？config中有两个关键标签`<targets>`和 `<rules>`

* `<targets> `  用于配置输出相关内容，比如 type 属性可选项为File、Mail、Console等，用于设置输出目标，layout属性用于设置输出信息的组成元素及格式。
* `<rules>` ： 这里有个坑，一看这个标签，简单理解成了“规则”，而恰好例子中的两个`<rule>`正好对应了上面的两个`<target>`，writeTo属性指定了对应的`<target>`。可仔细一看，两个的`<rule>`配置差不多，为什么下面的一个就只输出了我们自定义的log呢？看帮助才知道这是一个“路由表”，日志是从上到下匹配的。 `<logger name="Microsoft.*" maxlevel="Info" final="true" /> `一句话的 final="true" 过滤掉了"Microsoft.*"的日志。