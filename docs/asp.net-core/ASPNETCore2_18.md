---
title: 十八.Filter的处理机制及执行顺序
date: 2019-02-22
tags:
 - ASP.NET Core
categories:
 -  .NET
---

ASP.NET core 的Filter是系统中经常用到的，本文详细分享一下各种Filter定义、执行的内部机制以及执行顺序。

## 1.  概述

ASP.NET Core MVC 中有好几种常用的筛选器，例如Authorization filters 、Resource filters、Action filters 、Exception filters 、Result filters，他们运行在请求处理管道中的特定阶段，例如Authorization filters当前请求的用户是否已授权。 如果请求未获授权，则中止执行后面的请求处理。其他几种filters也类似，只是执行阶段不同。如下图：

![](/blogimages/ASPNETCore2_18/548134-20190221145436194-728574185.png)

              图一

Filter从定义到执行，本文通过四个阶段说明，如下图：

![](/blogimages/ASPNETCore2_18/548134-20190221145529198-1238098448.png)

                                                          图二

1.定义：以为例，可以通过继承ActionFilterAttribute并override它的OnActionExecuting和OnActionExecuted方法实现。

2.注册：主要有三种方式：在Startup的AddMvc、Controller、Action中注册。

3.获取：上一章有介绍，在确定了处理请求的Endpoint后，下一步就是创建创建invoker，它有个关键的属性就是filters，它由FilterFactory的GetAllFilters方法获取到。

4.执行：invoker的执行阶段，会进入InvokeFilterPipelineAsync，在这里，各种Filter按照图一的方式逐一被执行。

## 2. Filter的定义

Filter有好几种，但由于本文主要是分享Filter的运行机制，所以只以ActionFilter一种来举例，现在定义一个Test1Filter如下：

```csharp
public class Test1Filter : ActionFilterAttribute
{
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        base.OnActionExecuting(context);
        //do.....
    }

    public override void OnActionExecuted(ActionExecutedContext context)
    {
        base.OnActionExecuted(context);
        //do......
    }
}
```

很简单，可以很方便的通过继承系统提供的ActionFilterAttribute并override 它的相应方法即可。

## 3. Filter的注册

Filter定义好之后就是将其插入到处理管道中，可以在Startup的AddMvc、Controller、Action中注册。

1.全局：在Startup的AddMvc中注册

```csharp
services.AddMvc(
    options => { options.Filters.Add(new Test6Filter()); options.Filters.Add(new Test4Filter()); }
).SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
```

2.只对指定的Controller生效

```csharp
[Test5Filter]
[Test3Filter]
public class FlyLoloController : Controller
```

3.只对指定的Action生效

```csharp
[Test2Filter]
[Test1Filter]
public JsonResult Index()
```

在实际业务中，我们可以根据具体的需求来确定Filter的作用范围。

## 4. Filter的获取

Filter的获取是在FilterFactory的GetAllFilters方法中，

```csharp
public static FilterFactoryResult GetAllFilters(IFilterProvider[] filterProviders,            ActionContext actionContext)
{
    //省略……
    var orderedFilters = actionDescriptor.FilterDescriptors.OrderBy(filter => filter,FilterDescriptorOrderComparer.Comparer).ToList();
    //省略....
    return new FilterFactoryResult(staticFilterItems, filters);
}
```

 保留了关键的一句话，那就是根据actionDescriptor来获取到它对应的所有Filter（无论是针对全局、Controller还是Action），然后对这些Filter进行排序，这里用到了排序方法FilterDescriptorOrderComparer，它用来定义Filter的执行顺序，详细内容见后文。

## 5. Filter的执行

Filter的执行在invoker的执行阶段，会进入InvokeFilterPipelineAsync，在这里，各种Filter按照图一的方式逐一被执行。具体内容上一章已经进行了详细的描述。它是通过两个while循环实现了如图一的顺序逐一执行。

```csharp
while (!isCompleted)
{
    await Next(ref next, ref scope, ref state, ref isCompleted);
}
```

具体不再赘述。

## 6. Filter的执行顺序

Filter的执行顺序由三部分决定：

### A.对于不同种的Filter，按照图一的顺序执行，例如Authorization filters会最先被执行。

### B.对于同种的Filter，执行顺序由其Order和Scope来决定。

在Filter的获取一节提到了Filter的排序方法FilterDescriptorOrderComparer，它拥有对Filter定的排序。

```csharp
public class FilterDescriptorOrderComparer : IComparer<FilterDescriptor>
{
    public static FilterDescriptorOrderComparer Comparer { get; } = new FilterDescriptorOrderComparer();

    public int Compare(FilterDescriptor x, FilterDescriptor y)
    {
        if (x == null)
        {
            throw new ArgumentNullException(nameof(x));
        }

        if (y == null)
        {
            throw new ArgumentNullException(nameof(y));
        }

        if (x.Order == y.Order)
        {
            return x.Scope.CompareTo(y.Scope);
        }
        else
        {
            return x.Order.CompareTo(y.Order);
        }
    }
}
```

从这个方法可以看到Filter的执行顺序，按照先Order后Scope的方式排序。对于继承默认的内置Filter的，Order默认为0，所有对于这样的Filter来说觉得他们顺序的是Scope，也就是作用域，默认情况下，全局的为10、Controller上的为20、Action上的为30.也就是说，Filter的执行顺序为

全局 -> Controller -> Action, 实际的执行顺序是这样的：

```csharp
全局 OnActionExecuting

        Controller OnActionExecuting

            Action OnActionExecuting

            Action OnActionExecuted

        Controller OnActionExecuted

全局 OnActionExecuted
```

也是嵌套的，和中间件的处理方式类似。

当然我们可以自定义Filter的Order使其不再采用默认值0，只需在其构造函数中设置即可

```csharp
public class Test1Filter : ActionFilterAttribute
{
    public Test1Filter()
    {
        Order = 1;
    }

    //...........

}
```

### C.对于同样作用域的同种Filter来说，它们的执行顺序是按照注册先后排列的。

例如：

```csharp
[Test2Filter]
[Test1Filter]
public JsonResult Index()
```

则先执行Test2Filter、后执行Test1Filter。