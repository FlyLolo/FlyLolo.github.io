---
title: 八.图说管道
date: 2018-03-27
tags:
 - ASP.NET Core
categories:
 -  .NET
---

 本文通过一张GIF动图来继续聊一下ASP.NET Core的请求处理管道，从管道的配置、构建以及请求处理流程等方面做一下详细的研究。（[ASP.NET Core系列目录](http://www.cnblogs.com/FlyLolo/p/ASPNETCore2_0.html)）

## 1. 概述

 上文说到，请求是经过 Server监听=>处理成httpContext=>Application处理生成Response。 这个Application的类型RequestDelegate本质是 `public delegate Task RequestDelegate (HttpContext context); `，即接收HttpContext并返回Task， 它是由一个个中间件 `Func<RequestDelegate, RequestDelegate> middleware` 嵌套在一起构成的。它的构建是由ApplicationBuilder完成的，先来看一下这个ApplicationBuilder：

```csharp
1 public class ApplicationBuilder : IApplicationBuilder
2 {
3     private readonly IList<Func<RequestDelegate, RequestDelegate>> _components = new List<Func<RequestDelegate, RequestDelegate>>();
5     public IApplicationBuilder Use(Func<RequestDelegate, RequestDelegate> middleware)
6     {
7         _components.Add(middleware);
8         return this;
9     }
11     public RequestDelegate Build()
12     {
13         RequestDelegate app = context =>
14         {
15             context.Response.StatusCode = 404;
16             return Task.CompletedTask;
17         }; 
19         foreach (var component in _components.Reverse())20         {
21             app = component(app);
22         }
24         return app;
25     }
26 }
```

  ApplicationBuilder有个集合 `IList<Func<RequestDelegate, RequestDelegate>> _components` 和一个用于向这个集合中添加内容的  `Use(Func<RequestDelegate, RequestDelegate> middleware)` 方法，通过它们的类型可以看出来它们是用来添加和存储中间件的。现在说一下大概的流程：

1.  调用startupFilters和_startup的Configure方法，调用其中定义的多个UseXXX（进一步调用ApplicationBuilder的Use方法）将一个个中间件middleware按照顺序写入上文的集合<span style="color: #993366;">_components<span style="color: #000000;">（记住这个_components）</span></span><span style="color: #000000;">。</span>

2.  定义了一个 `context.Response.StatusCode = <span style="color: #800080;">404`</span> 的RequestDelegate。

3.  将集合<span style="color: #993366;">_components</span>颠倒一下, 然后遍历其中的middleware，一个个的与新创建的404 RequestDelegate 连接在一起，组成一个新的RequestDelegate（即Application）返回。

 这个最终返回的RequestDelegate类型的Application就是对HttpContext处理的管道了，这个管道是多个中间件按照一定顺序连接在一起组成的，startupFilters先不说，以我们非常熟悉的Startup为例，它的Configure方法默认情况下已经依次进行了UseBrowserLink、UseDeveloperExceptionPage、UseStaticFiles、UseMvc了等方法，请求进入管道后，<span style="color: #ff6600;">请求也会按照这个顺序来经过各个中间件处理，首先进入UseBrowserLink，然后UseBrowserLink会调用下一个中间件UseDeveloperExceptionPage，依次类推到达UseMVC后被处理生成Response开始逆向返回再依次反向经过这几个中间件，正常情况下，请求到达MVC中间件后被处理生成Response开始逆向返回，而不会到达最终的404，这个404是为了防止其他层未配置或未能处理的时候的一个保险操作。 </span>

<span style="color: #ff6600;"> 胡扯两句：</span>这个管道就像一座塔，话说唐僧路过金光寺去扫金光塔，从前门进入第一层开始扫，然后从前门的楼梯进入第二层、第三层、第四层，然后从第四层的后门扫下来直至后门出去，却不想妖怪没处理好， 被唐僧扫到了第五层（顶层）去，发现佛宝被奔波儿灞和霸波尔奔偷走了，大喊：悟空悟空，佛宝被妖怪偷走啦！（404...）

 下面就以这4个为例通过一个动图形象的描述一下整个过程：

![](/blogimages/ASPNETCore2_8/548134-20180326095926807-259901814.gif)

图1

 一个<span style="color: #ff6600;">“中规中矩”</span>的管道就是这样构建并运行的，通过上图可以看到各个中间件在Startup文件中的配置顺序与最终构成的管道中的顺序的关系，下面我们自己创建几个中间件体验一下，然后再看一下不“中规中矩”的<span style="color: #ff6600;">长了杈子</span>的管道。

## 2. 自定义中间件

 先仿照系统现有的写一个

```csharp
public class FloorOneMiddleware
{
    private readonly RequestDelegate _next;
    public FloorOneMiddleware(RequestDelegate next)
    {
        _next = next;
    }
    public async Task InvokeAsync(HttpContext context)
    {
        Console.WriteLine("FloorOneMiddleware In");
        //Do Something
        //To FloorTwoMiddleware
        await _next(context);
        //Do Something
        Console.WriteLine("FloorOneMiddleware Out");
    }
}
```

 这是塔的第一层，进入第一层后的 `<span style="color: #008000;">//`<span style="color: #008000;">Do Something</span></span> 表示在第一层需要做的工作， 然后通过 `_next(context)` 进入第二层，再下面的 `<span style="color: #008000;">//`<span style="color: #008000;">Do Something</span></span> 是从第二层出来后的操作。同样第二层调用第三层也是一样。再仿写个UseFloorOne的扩展方法：

```csharp
public static class FloorOneMiddlewareExtensions
{
    public static IApplicationBuilder UseFloorOne(this IApplicationBuilder builder)
    {
        Console.WriteLine("Use FloorOneMiddleware");
        return builder.UseMiddleware<FloorOneMiddleware>();
    }
}
```

这样在Startup的Configure方法中就也可以写 `app.UseFloorOne();` 将这个中间件作为管道的一部分了。

 通过上面的例子仿照系统默认的中间件完成了一个简单的中间件的编写，这里也可以用简要的写法，直接在Startup的Configure方法中这样写：

```csharp
app.Use(async (context,next) =>
{
    Console.WriteLine("FloorThreeMiddleware In");
    //Do Something
    //To FloorThreeMiddleware
    await next.Invoke();
    //Do Something
    Console.WriteLine("FloorThreeMiddleware Out");
});
```

同样可以实现上一种例子的工作，但还是建议按照那样的写法，在Startup这里体现的简洁并且可读性好的多。

复制一下第一种和第二种的例子，形成如下代码：

```csharp
public void Configure(IApplicationBuilder app, IHostingEnvironment env)
{
    app.UseFloorOne();
    app.UseFloorTwo();
    app.Use(async (context,next) =>
    {
        Console.WriteLine("FloorThreeMiddleware In");
        //Do Something
        //To FloorThreeMiddleware
        await next.Invoke();
        //Do Something
        Console.WriteLine("FloorThreeMiddleware Out");
    });
    app.Use(async (context, next) =>
    {
        Console.WriteLine("FloorFourMiddleware In");
        //Do Something
        await next.Invoke();
        //Do Something
        Console.WriteLine("FloorFourMiddleware Out");
    });

    if (env.IsDevelopment())
    {
        app.UseBrowserLink();
        app.UseDeveloperExceptionPage();
    }
    else
    {
        app.UseExceptionHandler("/Home/Error");
    }

    app.UseStaticFiles();

    app.UseMvc(routes =>
    {
        routes.MapRoute(
            name: "default",
            template: "{controller=Home}/{action=Index}/{id?}");
    });
}
```

运行一下看日志：

```csharp
1 CoreMiddleware> Use FloorOneMiddleware
2 CoreMiddleware> Use FloorTwoMiddleware
3 CoreMiddleware> Hosting environment: Development
4 CoreMiddleware> Content root path: C:\Users\FlyLolo\Desktop\CoreMiddleware\CoreMiddleware
5 CoreMiddleware> Now listening on: http://localhost:10757
6 CoreMiddleware> Application started. Press Ctrl+C to shut down.
7 CoreMiddleware> info: Microsoft.AspNetCore.Hosting.Internal.WebHost[1]
8 CoreMiddleware>       Request starting HTTP/1.1 GET http://localhost:56440/  
9 CoreMiddleware> FloorOneMiddleware In
10 CoreMiddleware> FloorTwoMiddleware In
11 CoreMiddleware> FloorThreeMiddleware In
12 CoreMiddleware> FloorFourMiddleware In
13 CoreMiddleware> info: Microsoft.AspNetCore.Mvc.Internal.ControllerActionInvoker[1]
14 CoreMiddleware>       Executing action method CoreMiddleware.Controllers.HomeController.Index (CoreMiddleware) with arguments ((null)) - ModelState is Valid
15 CoreMiddleware> info: Microsoft.AspNetCore.Mvc.ViewFeatures.Internal.ViewResultExecutor[1]
16 CoreMiddleware>       Executing ViewResult, running view at path /Views/Home/Index.cshtml.
17 CoreMiddleware> info: Microsoft.AspNetCore.Mvc.Internal.ControllerActionInvoker[2]
18 CoreMiddleware>       Executed action CoreMiddleware.Controllers.HomeController.Index (CoreMiddleware) in 9896.6822ms
19 CoreMiddleware> FloorFourMiddleware Out
20 CoreMiddleware> FloorThreeMiddleware Out
21 CoreMiddleware> FloorTwoMiddleware Out
22 CoreMiddleware> FloorOneMiddleware Out
23 CoreMiddleware> info: Microsoft.AspNetCore.Hosting.Internal.WebHost[2]
24 CoreMiddleware>       Request finished in 10793.8944ms 200 text/html; charset=utf-8
```

可以看到，前两行的Use FloorOneMiddleware和Use FloorTwoMiddleware是将对应的中间件写入集合_components，而中间件本身并未执行，然后10至12行是依次经过我们自定义的例子的处理，第13-18就是在中间件MVC中的处理了，找到并调用对应的Controller和View，然后才是19-22的逆向返回， 最终Request finished返回状态200， 这个例子再次验证了请求在管道中的处理流程。

那么我们试一下404的情况， 把Configure方法中除了自定义的4个中间件外全部注释掉，再次运行

```csharp
1 //上面没变化  省略
2 CoreMiddleware> FloorOneMiddleware In
3 CoreMiddleware> FloorTwoMiddleware In
4 CoreMiddleware> FloorThreeMiddleware In
5 CoreMiddleware> FloorFourMiddleware In
6 CoreMiddleware> FloorFourMiddleware Out
7 CoreMiddleware> FloorThreeMiddleware Out
8 CoreMiddleware> FloorTwoMiddleware Out
9 CoreMiddleware> FloorOneMiddleware Out
10 CoreMiddleware> info: Microsoft.AspNetCore.Hosting.Internal.WebHost[2]
11 CoreMiddleware>       Request finished in 218.7216ms 404
```

可以看到，MVC处理的部分没有了，因为该中间件已被注释，而最后一条可以看到系统返回了状态404。

 那么既然MVC可以正常处理请求没有进入404， 我们怎么做可以这样呢？是不是不调用下一个中间件就可以了？ 试着把FloorFour改一下

```csharp
1 app.Use(async (context, next) =>
2 {
3     Console.WriteLine("FloorFourMiddleware  In");
4     //await next.Invoke();
5     await context.Response.WriteAsync("Danger!");
6     Console.WriteLine("FloorFourMiddleware  Out");
7 });
```

再次运行，查看输出和上文的没有啥太大改变， 只是最后的404变为了200， 网页上的“404 找不到。。”也变成了我们要求输出的<span data-mce-="">"<span data-mce-="">Danger!<span data-mce-="">", 达到了我们想要的效果。</span></span></span>

<span data-mce-=""><span data-mce-=""><span data-mce-="">但一般情况下我们不这样写，ASP.NET Core 提供了Use、Run和Map三种方法来配置管道。</span></span></span>

## 3. Use、Run和Map

 Use上面已经用过就不说了，对于上面的问题， 一般用Run来处理，Run主要用来做为管道的末尾，例如上面的可以改成这样：

```csharp
app.Run(async (context) =>
{
    await context.Response.WriteAsync("Danger!");
});
```

 因为本身他就是作为管道末尾，也就省略了next参数，虽然用use也可以实现， 但还是建议用Run。

###  　  Map：

`static IApplicationBuilder Map(this IApplicationBuilder app, PathString pathMatch, Action<IApplicationBuilder> configuration);` pathMatch用于匹配请求的path， 例如“/Home”, 必须以“/”开头， 判断path是否是以pathMatch开头。

若是，则进入 `Action<IApplicationBuilder> configuration)` ， <span style="color: #ff6600;">这个参数是不是长得很像startup的Configure方法？ 这就像进入了我们配置的另一个管道</span>，它是一个分支，如下图

![](/blogimages/ASPNETCore2_8/548134-20180326171036111-1242012111.png)

图2

做个例子：

```csharp
app.UseFloorOne();
app.Map("/Manager", builder =>
{
    builder.Use(async (context, next) =>
    {
        await next.Invoke();
    });

    builder.Run(async (context) =>
    {
        await context.Response.WriteAsync("Manager.");
    });
});
app.UseFloorTwo();
```

 进入第一层后， 添加了一个Map， 作用是当我们请求 `localhost:<span style="color: #800080;">56440`<span style="color: #ff6600;">**/Manager**</span>/index</span> 这样的地址的时候（是不是有点像Area）， 会进入这个Map创建的新分支， 结果也就是页面显示<span data-mce-="">"<span data-mce-="">Manager.<span data-mce-="">" 不会再进入下面的FloorTwo。若不是“/Manager”开头的， 这继续进入FloorTwo。虽然感觉这个Map灵活了我们的管道配置， 但这个只能匹配path开头的方法太局限了，不着急， 我们看一下MapWhen。</span></span></span>

### Map When：

<span data-mce-=""><span data-mce-=""><span data-mce-=""> MapWhen方法就是一个灵活版的Map，它将原来的PathMatch替换为一个 `Func<HttpContext, <span style="color: #0000ff;">bool`> predicate</span> ，这下就开放多了，它返回一个bool值，现在举个栗子随便改一下</span></span></span>

```csharp
app.MapWhen(context=> {return context.Request.Query.ContainsKey("XX");}, builder =>
{
    //...TODO...
}
```

 当根据请求的参数是否包含“XX”的时候进入这个分支。

 从图2可知，一旦进入分支，是无法回到原分支的，<span style="color: #ff6600;"> 如果只是想在某种情况下进入某些中间件，但执行完后还可以继续后续的中间件怎么办呢？</span>对比MapWhen，Use也有个UseWhen。

### UseWhen：

<span data-mce-="">  它和MapWhen一样，当满足条件的时候进入一个分支，在这个分支完成之后再继续后续的中间件，当然<span style="color: #ff6600;">前提是这个分支中没有Run等短路行为</span>。</span>

```csharp
app.UseWhen(context=> {return context.Request.Query.ContainsKey("XX");}, builder =>
{
    //...TODO...
}
```

## 4. IStartupFilter

 我们只能指定一个Startup类作为启动类，那么还能在其他的地方定义管道么？ 文章开始的时候说到，构建管道的时候，会调用startupFilters和_startup的Configure方法，调用其中定义的多个UseXXX方法来将中间件写入_components。自定义一个StartupFilter，实现IStartupFilter的Configure方法，用法和Startup的Configure类似，不过<span style="color: #ff6600;">要记得最后调用</span> `next(app)` 。

```csharp
1 public class TestStartupFilter : IStartupFilter
2 {
3     public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next)
4     {
5         return app => { 
6             app.Use(async (context, next1) =>
7             {
8                 Console.WriteLine("filter.Use1.begin");
9                 await next1.Invoke();
10                 Console.WriteLine("filter.Use1.end");
11             });
12             next(app);
13         };
14     }
15 }
```

在复制一个，去startup的ConfigureServices注册一下：

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddMvc();
    services.AddSingleton<IStartupFilter,TestStartupFilter>();
    services.AddSingleton<IStartupFilter, TestStartupFilter2>();
}
```

这样的配置就生效了，现在剖析一下他的生效机制。回顾一下WebHost的BuildApplication方法：

```csharp
1 private RequestDelegate BuildApplication()
2 {
3  //....省略
4     var startupFilters = _applicationServices.GetService<IEnumerable<IStartupFilter>>();
5     Action<IApplicationBuilder> configure = _startup.Configure;
6     foreach (var filter in startupFilters.Reverse())
7     {
8         configure = filter.Configure(configure);
9     }
10 
11     configure(builder);
12 
13     return builder.Build();
14 }
```

 仔细看这段代码，其实这<span style="color: #ff6600;">和构建管道的流程非常相似</span>，对比着说一下：

1.  首先通过GetService获取到注册的IStartupFilter集合startupFilters（类比_components）

2.  然后获取Startup的Configure（类比404的RequestDelegate）

3.  翻转startupFilters，foreach它并且与Startup的Configure链接在一起。

4.  上文强调要记得最后调用 `next(app)`，这个是不是和 `next.Invoke()` 类似。

 是不是感觉和图一的翻转拼接过程非常类似，是不是想到了拼接先后顺序的问题。对比着管道构建后中间件的执行顺序，体会一下后，这时应该可以想到各个IStartupFilter和Startup的Configure的执行顺序了吧。没错就是按照依赖注入的顺序：TestStartupFilter=>TestStartupFilter2=>Startup。