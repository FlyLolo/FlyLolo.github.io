---
title: 十一.运行后台任务
date: 2018-06-27
tags:
 - ASP.NET Core
categories:
 -  .NET
---

 在大部分程序中一般都会需要用到后台任务， 比如定时更新缓存或更新某些状态。

## 1. 应用场景

 以调用微信公众号的Api为例， 经常会用到access_token，官方文档这样描述：“是公众号的全局唯一接口调用凭据，有效期目前为2个小时，需定时刷新，重复获取将导致上次获取的access_token失效，建议公众号开发者使用中控服务器统一获取和刷新Access_token，其他业务逻辑服务器所使用的access_token均来自于该中控服务器，不应该各自去刷新，否则容易造成冲突，导致access_token覆盖而影响业务。”

 在这个场景中我们可以创建一个后台运行的服务，按照access_token的有效期定时执行去请求获取新的access_token并存储，其他所有需要用到这个access_token的都到这个共有的access_token。

## 2. 实现方式（一）

 ASP.NET Core 在2.0的时候就提供了一个名为IHostedService的接口，我们要做的只有两件事：

 1. 实现它。

 <span style="color: #ff6600;">2. 将这个接口实现注册到依赖注入服务中。</span>

 A. 实现IHostedService的接口

            首先看一下这个IHostedService：

```csharp
public interface IHostedService
{
    Task StartAsync(CancellationToken cancellationToken);
    Task StopAsync(CancellationToken cancellationToken);
}
```

通过名字就可以看出来，一个是这个服务启动的时候做的操作，另一个则是停止的时候。

新建一个类 `TokenRefreshService ` 实现 `IHostedService` ，如下面代码所示：

```csharp
1     internal class TokenRefreshService : IHostedService, IDisposable
2     {
3         private readonly ILogger _logger;
4         private Timer _timer;
5 
6         public TokenRefreshService(ILogger<TokenRefreshService> logger)
7         {
8             _logger = logger;
9         }
10 
11         public Task StartAsync(CancellationToken cancellationToken)
12         {
13             _logger.LogInformation("Service starting");
14             _timer = new Timer(Refresh, null, TimeSpan.Zero,TimeSpan.FromSeconds(5));
15             return Task.CompletedTask;
16         }
17 
18         private void Refresh(object state)
19         {
20             _logger.LogInformation(DateTime.Now.ToLongTimeString() + ": Refresh Token!"); //在此写需要执行的任务
21             
22         }
23 
24         public Task StopAsync(CancellationToken cancellationToken)
25         {
26             _logger.LogInformation("Service stopping");
27             _timer?.Change(Timeout.Infinite, 0);
28             return Task.CompletedTask;
29         }
30 
31         public void Dispose()
32         {
33             _timer?.Dispose();
34         }
35     }
```

既然是定时刷新任务，那么就用了一个timer， 当服务启动的时候启动它，由它定时执行Refresh方法来获取新的Token。

<span style="color: #ff6600;">这里为了方便测试写了5秒执行一次， 实际应用还是读取配置文件比较好</span>， 结果如下：

```csharp
BackService.TokenRefreshService:Information: 17:23:30: Refresh Token!
BackService.TokenRefreshService:Information: 17:23:35: Refresh Token!
BackService.TokenRefreshService:Information: 17:23:40: Refresh Token!
BackService.TokenRefreshService:Information: 17:23:45: Refresh Token!
BackService.TokenRefreshService:Information: 17:23:50: Refresh Token!
```

 B. 在依赖注入中注册这个服务。

在Startup的ConfigureServices中注册这个服务，如下代码所示：

```csharp
services.AddSingleton<IHostedService, TokenRefreshService>();
```

## 3. 实现方式（二）

 在 ASP.NET Core 2.1中， 提供了一个名为 `BackgroundService ` 的类，它在 `Microsoft.Extensions.Hosting` 命名空间中，查看一下它的源码：

```csharp
1 using System;
2 using System.Threading;
3 using System.Threading.Tasks;
4 
5 namespace Microsoft.Extensions.Hosting
6 {
7     /// <summary>
8     /// Base class for implementing a long running <see cref="IHostedService"/>.
9     /// </summary>
10     public abstract class BackgroundService : IHostedService, IDisposable
11     {
12         private Task _executingTask;
13         private readonly CancellationTokenSource _stoppingCts = new CancellationTokenSource();
14 
15         /// <summary>
16         /// This method is called when the <see cref="IHostedService"/> starts. The implementation should return a task that represents
17         /// the lifetime of the long running operation(s) being performed.
18         /// </summary>
19         /// <param name="stoppingToken">Triggered when <see cref="IHostedService.StopAsync(CancellationToken)"/> is called.</param>
20         /// <returns>A <see cref="Task"/> that represents the long running operations.</returns>
21         protected abstract Task ExecuteAsync(CancellationToken stoppingToken);
22 
23         /// <summary>
24         /// Triggered when the application host is ready to start the service.
25         /// </summary>
26         /// <param name="cancellationToken">Indicates that the start process has been aborted.</param>
27         public virtual Task StartAsync(CancellationToken cancellationToken)
28         {
29             // Store the task we're executing
30             _executingTask = ExecuteAsync(_stoppingCts.Token);
31 
32             // If the task is completed then return it, this will bubble cancellation and failure to the caller
33             if (_executingTask.IsCompleted)
34             {
35                 return _executingTask;
36             }
37 
38             // Otherwise it's running
39             return Task.CompletedTask;
40         }
41 
42         /// <summary>
43         /// Triggered when the application host is performing a graceful shutdown.
44         /// </summary>
45         /// <param name="cancellationToken">Indicates that the shutdown process should no longer be graceful.</param>
46         public virtual async Task StopAsync(CancellationToken cancellationToken)
47         {
48             // Stop called without start
49             if (_executingTask == null)
50             {
51                 return;
52             }
53 
54             try
55             {
56                 // Signal cancellation to the executing method
57                 _stoppingCts.Cancel();
58             }
59             finally
60             {
61                 // Wait until the task completes or the stop token triggers
62                 await Task.WhenAny(_executingTask, Task.Delay(Timeout.Infinite, cancellationToken));
63             }
64         }
65 
66         public virtual void Dispose()
67         {
68             _stoppingCts.Cancel();
69         }
70     }
71 }
```

可以看出它一样是继承自 `IHostedService, IDisposable` ， 它相当于是帮我们写好了一些“通用”的逻辑， 而我们只需要继承并实现它的 `ExecuteAsync` 即可。

也就是说，我们只需在这个方法内写下这个服务需要做的事，这样上面的刷新Token的Service就可以改写成这样：

```csharp
1     internal class TokenRefreshService : BackgroundService
2     {
3         private readonly ILogger _logger;
4 
5         public TokenRefreshService(ILogger<TokenRefresh2Service> logger)
6         {
7             _logger = logger;
8         }
9 
10         protected override async Task ExecuteAsync(CancellationToken stoppingToken)
11         {
12             _logger.LogInformation("Service starting");
13 
14             while (!stoppingToken.IsCancellationRequested)
15             {
16                 _logger.LogInformation(DateTime.Now.ToLongTimeString() + ": Refresh Token!");//在此写需要执行的任务
17                 await Task.Delay(5000, stoppingToken);
18             }
19 
20             _logger.LogInformation("Service stopping");
21         }
22     }
```

是不是简单了不少。<span style="color: #ff6600;">（同样这里为了方便测试写了5秒执行一次）</span>

# <span style="color: #000000;"><span style="color: #005000;">四. 注意事项</span></span>

感谢[@](https://www.cnblogs.com/FlyLolo/p/ASPNETCore2_11.html#4006845 "查看所回复的评论") 咿呀咿呀哟在评论中的提醒，当项目部署在IIS上的时候， 当应用程序池回收的时候，这样的后台任务也会停止执行。

经测试：

 1. 当IIS上部署的项目启动后，后台任务随之启动，任务执行相应的log正常输出。

 2. 手动回收对应的应用程序池，任务执行相应的log输出停止。

 3. 重新请求该网站，后台任务随之启动，任务执行相应的log重新开始输出。

所以不建议在这样的后台任务中做一些需要固定定时执行的业务处理类的操作，但对于缓存刷新类的操作还是可以的，因为当应用程序池回收后再次运行的时候，后台任务会随着启动。

[github](https://github.com/FlyLolo/BackgroundServiceAndNlog)地址