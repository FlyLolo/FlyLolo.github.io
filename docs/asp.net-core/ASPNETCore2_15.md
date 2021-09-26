---
title: 十五.图解路由(2.1 or earler)
date: 2019-01-08
tags:
 - ASP.NET Core
categories:
 -  .NET
---

本文通过一张图来看一下路由的配置以及请求处理的机制。（ASP.NET Core 系列目录）

## 1. 概述
路由主要有两个主要功能：

* 将请求的URL与已定义的路由进行匹配，找到该URL对应的处理程序并传入该请求进行处理。
* 根据已定义的路由生成URL
这两个功能看起来这两个是相反的。

### A.路由的配置
路由的两个功能都离不开一个基本的操作：路由的基本配置。在Startup中默认通过 routes.MapRoute(name: "default",template: "{controller=Home}/{action=Index}/{id?}")定义，

当然我们还可以继续 `routes.MapRoute(。。。)`;  这样就定义了一系列的路由匹配方式组成一个路由表，例如这样：

```csharp
app.UseMvc(routes =>
{
    routes.MapRoute(name: "test", template: "Hello");
    routes.MapRoute("flylolo/{code}/{name}", MyRouteHandler.Handler);
    routes.MapRoute(name: "default", template: "{controller=Home}/{action=Index}/{id?}");
});
```
每一个MapRoute会生成一个Route，第二个MapRoute看起来有些特殊，我们可以传入一个自定义的RequestDelegate（本例为MyRouteHandler.Handler）来处理“flylolo/{code}/{name}”这样的请求，

```csharp
public static class MyRouteHandler
{
    public static async Task Handler(HttpContext context)
    {
        await context.Response.WriteAsync("MyRouteHandler");
    }
}
```
它会被封装成一个`RouteHandler（new RouteHandler(MyRouteHandler.Handler)）`赋值给Route的target属性，而对于另外两种没有指定的，Route的target属性默认会被指定为MvcRouteHandler ，如下图：
![](/blogimages/ASPNETCore2_15/548134-20190107161013283-2056472410.jpg)

### B.Handler的选择
当请求进入之后，根据此路由表对该URL进行逐一匹配，并将请求交给匹配到的路由的target（即MvcRouteHandler或RouteHandler），调用 _target.RouteAsync(context); ，在这个方法中，若是MvcRouteHandler会对请求的Controller和Action验证，若验证成功，则对context（是一个RouteContext）的Handler属性赋值一个匿名方法；若是RouteHandler则会直接将其封装的RequestDelegate（本例为MyRouteHandler.Handler）赋值给RouteContext.Handler.

### C.请求处理
经过Handler的选择后，若RouteContext.Handler不为空，则调用RouteContext.Handler(HttpContext)对请求进行处理。

### D.其他
回想一下中间件，这个是不是和app.Map("/test", XXHandle)这样配置中间件的方式有点像，当请求路径是/test的时候，请求交由XXHandle处理，同样是Map，对比着更容易理解。

下面通过一张图看一下路由配置和请求处理的流程。

## 2. 流程及解析
[![](/blogimages/ASPNETCore2_15/548134-20190104161629818-1260435333.png)](/blogimages/ASPNETCore2_15/548134-20190104161629818-1260435333.png)
  为了方便查看，对几个“重点对象”做了颜色标识（点击图片可以看大图）：

 

路由的初始化配置
一切从Startup开始，之前在中间件的文章中介绍过，一般是通过多个UseXXX的方式将多个中间件组成“请求处理管道”，而在这里通过UseMvc方法进行配置，传入routes.MapRoute(...)这样的一个或多个配置。
接下来会New一个
RouteBuilder

，顾名思义就是一个Route的创建者，通过调用传进来的一个或多个routes.MapRoute()方法生成多个Route，并配置默认的Handler。
```csharp
var routes = new RouteBuilder(app)
{
    DefaultHandler = app.ApplicationServices.GetRequiredService<MvcRouteHandler>(),
};

configureRoutes(routes);//调用Startup中的routes.MapRoute(...)方法
```
 

①调用RouteBuilder的Build方法，生成一个RouteCollection。

```csharp
public IRouter Build()
{
    var routeCollection = new RouteCollection();

    foreach (var route in Routes)
    {
        routeCollection.Add(route);
    }

    return routeCollection;
}
```
②RouteCollection实现IRouteCollection和IRouter接口，他是在Startup中的配置组成的集合。
③RouterMiddleWare就是专门用于进行路由处理的中间件，在此将RouteCollection作为中间件RouterMiddleWare的参数，并将这个中间件插入管道中。

```csharp
    public class RouterMiddleware
    {
        private readonly IRouter _router; //就是RouteCollection

        public async Task Invoke(HttpContext httpContext);

    }
```

2. 请求处理流程

④请求的处理流程在RouterMiddleWare的invoke()方法中。

⑤请求首先会被封装成一个RouteContext，本质就是将httpContext、_router(也就是RouteCollection)包装到一个对象里。

  var context = new RouteContext(httpContext);
  context.RouteData.Routers.Add(_router);
```csharp
public class RouteContext
{
   private RouteData _routeData;
   public RequestDelegate Handler ；
   public HttpContext HttpContext；//简单的赋值
   public RouteData RouteData；
}
```
⑥调用_router(也就是RouteCollection)的RouteAsync(context)方法，在其中遍历每一个路由

⑦若与请求URL匹配，则将对应的Handler赋值给context.Handler。

```csharp
public async virtual Task RouteAsync(RouteContext context)
{
    // 快照备份
    var snapshot = context.RouteData.PushState(null, values: null, dataTokens: null);
    //遍历
    for (var i = 0; i < Count; i++)
    {
        var route = this[i];
        context.RouteData.Routers.Add(route);

        try
        {
            await route.RouteAsync(context);//若匹配，则给context.Handler赋值

            if (context.Handler != null)
            {
                break;
            }
        }
        finally
        {
            if (context.Handler == null)
            {
                snapshot.Restore();//通过快照还原
            }
        }
    }
}
```
⑧在RouterMiddleWare的invoke()方法中，调用新赋值的context.Handler处理HttpContext;

```csharp
httpContext.Features[typeof(IRoutingFeature)] = new RoutingFeature()
{
    RouteData = context.RouteData,
};

await context.Handler(context.HttpContext);
```
 ## 3. 其他

由于文章写的比较早各种原因一直没有写完，现在发现2.2版本之后，启用了新的路由方案，还是把这章完成了发出来，有愿意看的可以参考一下，下一篇文章介绍一下2.2版的新的路由方案，至于通过路由生成URL部分，就暂时不写了。