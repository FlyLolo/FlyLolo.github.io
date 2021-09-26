---
title: 十七.Action的执行
date: 2019-01-25
tags:
 - ASP.NET Core
categories:
 -  .NET
---

上一章介绍了经过路由的处理，一个请求找到了具体处理这个请求的EndPoint，并最终执行它的RequestDelegate方法来处理这个Httpcontext。本章继续这个处理进程，按照惯例，依然通过几幅图来聊一聊这个RequestDelegate之后的故事。在此就避免不了的聊到各种Filter，它方便我们在action执行的前后做一些 “小动作”。

## 1. 概述

首先看一下RequestDelegate这个方法：

```csharp
RequestDelegate requestDelegate = (context) =>
{
    var routeData = context.GetRouteData();
    var actionContext = new ActionContext(context, routeData, action);
    var invoker = _invokerFactory.CreateInvoker(actionContext);

    return invoker.InvokeAsync();
};
```

将这个方法的内容分为两部分：

A. invoker的生成，前三句，通过CreateInvoker方法生成了一个invoker，它是一个比较复杂的综合体，包含了controller的创建工厂、参数的绑定方法以及本action相关的各种Filter的集合等， 也就是说它是前期准备工作阶段，这个阶段扩展开来涉及面比较广，在下文详细描述。  

B.invoker的执行，最后一句，前面已经万事俱备，准备了好多方法，到此来执行。此时涉及到前面准备的各种方法的执行，各种Filter也在此时被执行。

## 2. invoker的生成

依照习惯，还是通过流程图来看一看：

[![](/blogimages/ASPNETCore2_17/548134-20190125115548360-1143760105.png)](/blogimages/ASPNETCore2_17/548134-20190125115548360-1143760105.png)

                                                                                                     图一（[点击查看大图](/blogimages/ASPNETCore2_17/548134-20190125115548360-1143760105.png)）

首先说一下此图的结构，每个泳道相当于是上一个泳道中的![](/blogimages/ASPNETCore2_17/548134-20190124164750728-608923653.jpg)图标的细化说明，例如第二条泳道是图标<span style="color: #ff0000;">①</span>标识的方块的明细化。

###           A. 泳道一：

                  就是第一节【概述】中描述的的内容，不再赘述。另外提一下本文的核心invoker本质上就是一个ControllerActionInvoker，也是图中的ActionInvokerProviderContext.Result。

###           B.泳道二：即①的详细描述

**① ActionInvokerFactory.CreateInvoker(actionContext)**

```csharp
1 public IActionInvoker CreateInvoker(ActionContext actionContext)
2 {
3     var context = new ActionInvokerProviderContext(actionContext);
4 
5     foreach (var provider in _actionInvokerProviders)
6     {
7         provider.OnProvidersExecuting(context);
8     }
9 
10     for (var i = _actionInvokerProviders.Length - 1; i >= 0; i--)
11     {
12         _actionInvokerProviders[i].OnProvidersExecuted(context);
13     }
14 
15     return context.Result;
16 }
```

本章设计的这部分内容比较常见的一个操作就是context的封装，这从第一个泳道的第一个操作就开始了， 他将HttpContext、RouteData，ActionDescriptor封装到一起成了一个**ActionContext ，**而到了这个方法，又将这个**ActionContext** 封装成了**ActionInvokerProviderContext，**接下来就是遍历_actionInvokerProviders调用它们的OnProvidersExecuting和OnProvidersExecuted方法来设置**ActionInvokerProviderContext**.Result，也就是最终的ControllerActionInvoker。

这里说一下_actionInvokerProviders，它的类型是IActionInvokerProvider[]，默认情况下包含了两个，分别是ControllerActionInvokerProvider和PageActionInvokerProvider，第一个是用于MVC的action的处理，而第二个用于Razor Pages Web的处理。二者的OnProvidersExecuting方法都会首先判断当前action是不是自己对应的类型，若不是则直接跳过。二者的OnProvidersExecuted方法目前均为空。<span style="color: #ff6600;">所以图中和下面关于OnProvidersExecuting的描述也仅限于ControllerActionInvokerProvider的OnProvidersExecuting方法。</span>

###           C.泳道三：ControllerActionInvokerProvider.OnProvidersExecuting(context)

**即泳道二中的③的详细描述**

```csharp
1 public void OnProvidersExecuting(ActionInvokerProviderContext context)
2 {
3     if (context.ActionContext.ActionDescriptor is ControllerActionDescriptor)
4     {
5         var controllerContext = new ControllerContext(context.ActionContext);
6         // PERF: These are rarely going to be changed, so let's go copy-on-write.
7         controllerContext.ValueProviderFactories = new CopyOnWriteList<IValueProviderFactory>(_valueProviderFactories);
8         controllerContext.ModelState.MaxAllowedErrors = _maxModelValidationErrors;
9 
10         var cacheResult = _controllerActionInvokerCache.GetCachedResult(controllerContext);
11 
12         var invoker = new ControllerActionInvoker(
13             _logger,
14             _diagnosticSource,
15             _mapper,
16             controllerContext,
17             cacheResult.cacheEntry,
18             cacheResult.filters);
19 
20         context.Result = invoker;
21     }
22 }
```
如上文所述，在处理之前，首先就是判断当前action是否是自己对应处理的类型。然后就是继续封装大法，将ActionContext封装成了ControllerContext。进而是调用GetCachedResult方法读取两个关键内容cacheResult.cacheEntry和cacheResult.filters后，将其封装成ControllerActionInvoker（⑤）。

###           D.第四条泳道：

对应的是第三条中的④**ControllerActionInvokerCache.GetCachedResult(controllerContext);**

```csharp
1 public (ControllerActionInvokerCacheEntry cacheEntry, IFilterMetadata[] filters) GetCachedResult(ControllerContext controllerContext)
2 {
3     var cache = CurrentCache;
4     var actionDescriptor = controllerContext.ActionDescriptor;
5 
6     IFilterMetadata[] filters;
7     if (!cache.Entries.TryGetValue(actionDescriptor, out var cacheEntry))
8     {
9         var filterFactoryResult = FilterFactory.GetAllFilters(_filterProviders, controllerContext);
10         filters = filterFactoryResult.Filters;
11 
12         var parameterDefaultValues = ParameterDefaultValues
13             .GetParameterDefaultValues(actionDescriptor.MethodInfo);
14 
15         var objectMethodExecutor = ObjectMethodExecutor.Create(
16             actionDescriptor.MethodInfo,
17             actionDescriptor.ControllerTypeInfo,
18             parameterDefaultValues);
19 
20         var controllerFactory = _controllerFactoryProvider.CreateControllerFactory(actionDescriptor);
21         var controllerReleaser = _controllerFactoryProvider.CreateControllerReleaser(actionDescriptor);
22         var propertyBinderFactory = ControllerBinderDelegateProvider.CreateBinderDelegate(
23             _parameterBinder,
24             _modelBinderFactory,
25             _modelMetadataProvider,
26             actionDescriptor,
27             _mvcOptions);
28 
29         var actionMethodExecutor = ActionMethodExecutor.GetExecutor(objectMethodExecutor);
30 
31         cacheEntry = new ControllerActionInvokerCacheEntry(
32             filterFactoryResult.CacheableFilters,
33             controllerFactory,
34             controllerReleaser,
35             propertyBinderFactory,
36             objectMethodExecutor,
37             actionMethodExecutor);
38         cacheEntry = cache.Entries.GetOrAdd(actionDescriptor, cacheEntry);
39     }
40     else
41     {
42         // Filter instances from statically defined filter descriptors + from filter providers
43         filters = FilterFactory.CreateUncachedFilters(_filterProviders, controllerContext, cacheEntry.CachedFilters);
44     }
45 
46     return (cacheEntry, filters);
```

总的来看，本段内容主要是为了组装cacheEntry和 filters两个内容，而一个大的 if 体现出这里加入了缓存机制，使系统不必每次都去拼凑这些，提高执行效率。

⑥IFilterMetadata[] filters，它是一个filter的集和，首先调用FilterFactory的GetAllFilters(_filterProviders, controllerContext)方法获取当前action对应的所有Filte<span style="color: #000000;">r并对这些Filter进行排序（Filter部分将在之后章节分享）。</span>

<span style="color: #000000;">接下来就是组装⑦cacheEntry，它的内容比较多，比较重要的几个有：⑧ controllerFactory和controllerReleaser他们的本质都是Func<ControllerContext, object>，也就是Controller的Create和Release方法。 ⑨propertyBinderFactory 是一个用于参数绑定的Task，可以说也是一个组装好准备被执行的方法。最后一个⑩actionMethodExecutor也就是执行者，通过ActionMethodExecutor.GetExecutor(objectMethodExecutor)方法从众多的action执行者（如图二）中找出一个当前action对应的执行者出来。</span>

<span style="color: #000000;">![](/blogimages/ASPNETCore2_17/548134-20190125100104654-1468029255.jpg)</span>

<span style="color: #000000;">                                                             图二</span>

<span style="color: #ff6600;">**总结: 本节invoker的生成，总的来说就是一个执行前“万事俱备”的过程，invoker是一个组装起来的集合，它包含一个人（**执行者actionMethodExecutor**）、N把枪（**组装好用于“被执行”的方法例如controllerFactory、controllerReleaser和propertyBinderFactory，当然还有个filter的集和**）。由此也可以进一步想到，接下来的过程就是这些准备好的内容按照一定的顺序逐步执行的过程。**</span>

##  3. invoker的执行

invoker的执行也就是invoker.InvokeAsync()，虽然invoker本质上是ControllerActionInvoker，但这个方法写在ResourceInvoker类中， `ControllerActionInvoker : <span style="color: #0000ff;">ResourceInvoker, IActionInvoker`</span> 。

```csharp
public virtual async Task InvokeAsync()
{
    try
    {
        await InvokeFilterPipelineAsync();
    }
    finally
    {
        ReleaseResources();
        _logger.ExecutedAction(_actionContext.ActionDescriptor, stopwatch.GetElapsedTime());
    }
}

private async Task InvokeFilterPipelineAsync()
{
    var next = State.InvokeBegin;
    var scope = Scope.Invoker;
    var state = (object)null;

    // `isCompleted` will be set to true when we've reached a terminal state.
    var isCompleted = false;

    while (!isCompleted)
    {
        await Next(ref next, ref scope, ref state, ref isCompleted);
    }
}
```

看似比较简单的两个方法，从InvokeAsync方法中可以看出来，请求会进入筛选器管道进行处理，也就是 `Task InvokeFilterPipelineAsync()` 方法，借用官方文档中的一个图看一下

![](/blogimages/ASPNETCore2_17/548134-20190125112326288-1119304777.png)

                                  图三

此图描述了请求经过其他中间件处理后，进入路由处理最终找到了对应的action，最终进入筛选器管道进行处理。而这个处理的核心部分就是方法中的 `while(!isCompleted)` 循环，它对应的Next方法比较长，如下（较长已折叠）
```csharp
private Task Next(ref State next, ref Scope scope, ref object state, ref bool isCompleted)
{
    switch (next)
    {
        case State.InvokeBegin:
            {
                goto case State.AuthorizationBegin;
            }

        case State.AuthorizationBegin:
            {
                _cursor.Reset();
                goto case State.AuthorizationNext;
            }

        case State.AuthorizationNext:
            {
                var current = _cursor.GetNextFilter<IAuthorizationFilter, IAsyncAuthorizationFilter>();
                if (current.FilterAsync != null)
                {
                    if (_authorizationContext == null)
                    {
                        _authorizationContext = new AuthorizationFilterContext(_actionContext, _filters);
                    }

                    state = current.FilterAsync;
                    goto case State.AuthorizationAsyncBegin;
                }
                else if (current.Filter != null)
                {
                    if (_authorizationContext == null)
                    {
                        _authorizationContext = new AuthorizationFilterContext(_actionContext, _filters);
                    }

                    state = current.Filter;
                    goto case State.AuthorizationSync;
                }
                else
                {
                    goto case State.AuthorizationEnd;
                }
            }

        case State.AuthorizationAsyncBegin:
            {
                Debug.Assert(state != null);
                Debug.Assert(_authorizationContext != null);

                var filter = (IAsyncAuthorizationFilter)state;
                var authorizationContext = _authorizationContext;

                _diagnosticSource.BeforeOnAuthorizationAsync(authorizationContext, filter);
                _logger.BeforeExecutingMethodOnFilter(
                    FilterTypeConstants.AuthorizationFilter,
                    nameof(IAsyncAuthorizationFilter.OnAuthorizationAsync),
                    filter);

                var task = filter.OnAuthorizationAsync(authorizationContext);
                if (task.Status != TaskStatus.RanToCompletion)
                {
                    next = State.AuthorizationAsyncEnd;
                    return task;
                }

                goto case State.AuthorizationAsyncEnd;
            }

        case State.AuthorizationAsyncEnd:
            {
                Debug.Assert(state != null);
                Debug.Assert(_authorizationContext != null);

                var filter = (IAsyncAuthorizationFilter)state;
                var authorizationContext = _authorizationContext;

                _diagnosticSource.AfterOnAuthorizationAsync(authorizationContext, filter);
                _logger.AfterExecutingMethodOnFilter(
                    FilterTypeConstants.AuthorizationFilter,
                    nameof(IAsyncAuthorizationFilter.OnAuthorizationAsync),
                    filter);

                if (authorizationContext.Result != null)
                {
                    goto case State.AuthorizationShortCircuit;
                }

                goto case State.AuthorizationNext;
            }

        case State.AuthorizationSync:
            {
                Debug.Assert(state != null);
                Debug.Assert(_authorizationContext != null);

                var filter = (IAuthorizationFilter)state;
                var authorizationContext = _authorizationContext;

                _diagnosticSource.BeforeOnAuthorization(authorizationContext, filter);
                _logger.BeforeExecutingMethodOnFilter(
                    FilterTypeConstants.AuthorizationFilter,
                    nameof(IAuthorizationFilter.OnAuthorization),
                    filter);

                filter.OnAuthorization(authorizationContext);

                _diagnosticSource.AfterOnAuthorization(authorizationContext, filter);
                _logger.AfterExecutingMethodOnFilter(
                    FilterTypeConstants.AuthorizationFilter,
                    nameof(IAuthorizationFilter.OnAuthorization),
                    filter);

                if (authorizationContext.Result != null)
                {
                    goto case State.AuthorizationShortCircuit;
                }

                goto case State.AuthorizationNext;
            }

        case State.AuthorizationShortCircuit:
            {
                Debug.Assert(state != null);
                Debug.Assert(_authorizationContext != null);
                Debug.Assert(_authorizationContext.Result != null);

                _logger.AuthorizationFailure((IFilterMetadata)state);

                // This is a short-circuit - execute relevant result filters + result and complete this invocation.
                isCompleted = true;
                _result = _authorizationContext.Result;
                return InvokeAlwaysRunResultFilters();
            }

        case State.AuthorizationEnd:
            {
                goto case State.ResourceBegin;
            }

        case State.ResourceBegin:
            {
                _cursor.Reset();
                goto case State.ResourceNext;
            }

        case State.ResourceNext:
            {
                var current = _cursor.GetNextFilter<IResourceFilter, IAsyncResourceFilter>();
                if (current.FilterAsync != null)
                {
                    if (_resourceExecutingContext == null)
                    {
                        _resourceExecutingContext = new ResourceExecutingContext(
                            _actionContext,
                            _filters,
                            _valueProviderFactories);
                    }

                    state = current.FilterAsync;
                    goto case State.ResourceAsyncBegin;
                }
                else if (current.Filter != null)
                {
                    if (_resourceExecutingContext == null)
                    {
                        _resourceExecutingContext = new ResourceExecutingContext(
                            _actionContext,
                            _filters,
                            _valueProviderFactories);
                    }

                    state = current.Filter;
                    goto case State.ResourceSyncBegin;
                }
                else
                {
                    // All resource filters are currently on the stack - now execute the 'inside'.
                    goto case State.ResourceInside;
                }
            }

        case State.ResourceAsyncBegin:
            {
                Debug.Assert(state != null);
                Debug.Assert(_resourceExecutingContext != null);

                var filter = (IAsyncResourceFilter)state;
                var resourceExecutingContext = _resourceExecutingContext;

                _diagnosticSource.BeforeOnResourceExecution(resourceExecutingContext, filter);
                _logger.BeforeExecutingMethodOnFilter(
                    FilterTypeConstants.ResourceFilter,
                    nameof(IAsyncResourceFilter.OnResourceExecutionAsync),
                    filter);

                var task = filter.OnResourceExecutionAsync(resourceExecutingContext, InvokeNextResourceFilterAwaitedAsync);
                if (task.Status != TaskStatus.RanToCompletion)
                {
                    next = State.ResourceAsyncEnd;
                    return task;
                }

                goto case State.ResourceAsyncEnd;
            }

        case State.ResourceAsyncEnd:
            {
                Debug.Assert(state != null);
                Debug.Assert(_resourceExecutingContext != null);

                var filter = (IAsyncResourceFilter)state;
                if (_resourceExecutedContext == null)
                {
                    // If we get here then the filter didn't call 'next' indicating a short circuit.
                    _resourceExecutedContext = new ResourceExecutedContext(_resourceExecutingContext, _filters)
                    {
                        Canceled = true,
                        Result = _resourceExecutingContext.Result,
                    };

                    _diagnosticSource.AfterOnResourceExecution(_resourceExecutedContext, filter);
                    _logger.AfterExecutingMethodOnFilter(
                        FilterTypeConstants.ResourceFilter,
                        nameof(IAsyncResourceFilter.OnResourceExecutionAsync),
                        filter);

                    // A filter could complete a Task without setting a result
                    if (_resourceExecutingContext.Result != null)
                    {
                        goto case State.ResourceShortCircuit;
                    }
                }

                goto case State.ResourceEnd;
            }

        case State.ResourceSyncBegin:
            {
                Debug.Assert(state != null);
                Debug.Assert(_resourceExecutingContext != null);

                var filter = (IResourceFilter)state;
                var resourceExecutingContext = _resourceExecutingContext;

                _diagnosticSource.BeforeOnResourceExecuting(resourceExecutingContext, filter);
                _logger.BeforeExecutingMethodOnFilter(
                    FilterTypeConstants.ResourceFilter,
                    nameof(IResourceFilter.OnResourceExecuting),
                    filter);

                filter.OnResourceExecuting(resourceExecutingContext);

                _diagnosticSource.AfterOnResourceExecuting(resourceExecutingContext, filter);
                _logger.AfterExecutingMethodOnFilter(
                    FilterTypeConstants.ResourceFilter,
                    nameof(IResourceFilter.OnResourceExecuting),
                    filter);

                if (resourceExecutingContext.Result != null)
                {
                    _resourceExecutedContext = new ResourceExecutedContext(resourceExecutingContext, _filters)
                    {
                        Canceled = true,
                        Result = _resourceExecutingContext.Result,
                    };

                    goto case State.ResourceShortCircuit;
                }

                var task = InvokeNextResourceFilter();
                if (task.Status != TaskStatus.RanToCompletion)
                {
                    next = State.ResourceSyncEnd;
                    return task;
                }

                goto case State.ResourceSyncEnd;
            }

        case State.ResourceSyncEnd:
            {
                Debug.Assert(state != null);
                Debug.Assert(_resourceExecutingContext != null);
                Debug.Assert(_resourceExecutedContext != null);

                var filter = (IResourceFilter)state;
                var resourceExecutedContext = _resourceExecutedContext;

                _diagnosticSource.BeforeOnResourceExecuted(resourceExecutedContext, filter);
                _logger.BeforeExecutingMethodOnFilter(
                    FilterTypeConstants.ResourceFilter,
                    nameof(IResourceFilter.OnResourceExecuted),
                    filter);

                filter.OnResourceExecuted(resourceExecutedContext);

                _diagnosticSource.AfterOnResourceExecuted(resourceExecutedContext, filter);
                _logger.AfterExecutingMethodOnFilter(
                    FilterTypeConstants.ResourceFilter,
                    nameof(IResourceFilter.OnResourceExecuted),
                    filter);

                goto case State.ResourceEnd;
            }

        case State.ResourceShortCircuit:
            {
                Debug.Assert(state != null);
                Debug.Assert(_resourceExecutingContext != null);
                Debug.Assert(_resourceExecutedContext != null);

                _logger.ResourceFilterShortCircuited((IFilterMetadata)state);

                _result = _resourceExecutingContext.Result;
                var task = InvokeAlwaysRunResultFilters();
                if (task.Status != TaskStatus.RanToCompletion)
                {
                    next = State.ResourceEnd;
                    return task;
                }

                goto case State.ResourceEnd;
            }

        case State.ResourceInside:
            {
                goto case State.ExceptionBegin;
            }

        case State.ExceptionBegin:
            {
                _cursor.Reset();
                goto case State.ExceptionNext;
            }

        case State.ExceptionNext:
            {
                var current = _cursor.GetNextFilter<IExceptionFilter, IAsyncExceptionFilter>();
                if (current.FilterAsync != null)
                {
                    state = current.FilterAsync;
                    goto case State.ExceptionAsyncBegin;
                }
                else if (current.Filter != null)
                {
                    state = current.Filter;
                    goto case State.ExceptionSyncBegin;
                }
                else if (scope == Scope.Exception)
                {
                    // All exception filters are on the stack already - so execute the 'inside'.
                    goto case State.ExceptionInside;
                }
                else
                {
                    // There are no exception filters - so jump right to the action.
                    Debug.Assert(scope == Scope.Invoker || scope == Scope.Resource);
                    goto case State.ActionBegin;
                }
            }

        case State.ExceptionAsyncBegin:
            {
                var task = InvokeNextExceptionFilterAsync();
                if (task.Status != TaskStatus.RanToCompletion)
                {
                    next = State.ExceptionAsyncResume;
                    return task;
                }

                goto case State.ExceptionAsyncResume;
            }

        case State.ExceptionAsyncResume:
            {
                Debug.Assert(state != null);

                var filter = (IAsyncExceptionFilter)state;
                var exceptionContext = _exceptionContext;

                // When we get here we're 'unwinding' the stack of exception filters. If we have an unhandled exception,
                // we'll call the filter. Otherwise there's nothing to do.
                if (exceptionContext?.Exception != null && !exceptionContext.ExceptionHandled)
                {
                    _diagnosticSource.BeforeOnExceptionAsync(exceptionContext, filter);
                    _logger.BeforeExecutingMethodOnFilter(
                        FilterTypeConstants.ExceptionFilter,
                        nameof(IAsyncExceptionFilter.OnExceptionAsync),
                        filter);

                    var task = filter.OnExceptionAsync(exceptionContext);
                    if (task.Status != TaskStatus.RanToCompletion)
                    {
                        next = State.ExceptionAsyncEnd;
                        return task;
                    }

                    goto case State.ExceptionAsyncEnd;
                }

                goto case State.ExceptionEnd;
            }

        case State.ExceptionAsyncEnd:
            {
                Debug.Assert(state != null);
                Debug.Assert(_exceptionContext != null);

                var filter = (IAsyncExceptionFilter)state;
                var exceptionContext = _exceptionContext;

                _diagnosticSource.AfterOnExceptionAsync(exceptionContext, filter);
                _logger.AfterExecutingMethodOnFilter(
                    FilterTypeConstants.ExceptionFilter,
                    nameof(IAsyncExceptionFilter.OnExceptionAsync),
                    filter);

                if (exceptionContext.Exception == null || exceptionContext.ExceptionHandled)
                {
                    // We don't need to do anything to trigger a short circuit. If there's another
                    // exception filter on the stack it will check the same set of conditions
                    // and then just skip itself.
                    _logger.ExceptionFilterShortCircuited(filter);
                }

                goto case State.ExceptionEnd;
            }

        case State.ExceptionSyncBegin:
            {
                var task = InvokeNextExceptionFilterAsync();
                if (task.Status != TaskStatus.RanToCompletion)
                {
                    next = State.ExceptionSyncEnd;
                    return task;
                }

                goto case State.ExceptionSyncEnd;
            }

        case State.ExceptionSyncEnd:
            {
                Debug.Assert(state != null);

                var filter = (IExceptionFilter)state;
                var exceptionContext = _exceptionContext;

                // When we get here we're 'unwinding' the stack of exception filters. If we have an unhandled exception,
                // we'll call the filter. Otherwise there's nothing to do.
                if (exceptionContext?.Exception != null && !exceptionContext.ExceptionHandled)
                {
                    _diagnosticSource.BeforeOnException(exceptionContext, filter);
                    _logger.BeforeExecutingMethodOnFilter(
                        FilterTypeConstants.ExceptionFilter,
                        nameof(IExceptionFilter.OnException),
                        filter);

                    filter.OnException(exceptionContext);

                    _diagnosticSource.AfterOnException(exceptionContext, filter);
                    _logger.AfterExecutingMethodOnFilter(
                        FilterTypeConstants.ExceptionFilter,
                        nameof(IExceptionFilter.OnException),
                        filter);

                    if (exceptionContext.Exception == null || exceptionContext.ExceptionHandled)
                    {
                        // We don't need to do anything to trigger a short circuit. If there's another
                        // exception filter on the stack it will check the same set of conditions
                        // and then just skip itself.
                        _logger.ExceptionFilterShortCircuited(filter);
                    }
                }

                goto case State.ExceptionEnd;
            }

        case State.ExceptionInside:
            {
                goto case State.ActionBegin;
            }

        case State.ExceptionHandled:
            {
                // We arrive in this state when an exception happened, but was handled by exception filters
                // either by setting ExceptionHandled, or nulling out the Exception or setting a result
                // on the ExceptionContext.
                //
                // We need to execute the result (if any) and then exit gracefully which unwinding Resource
                // filters.

                Debug.Assert(state != null);
                Debug.Assert(_exceptionContext != null);

                if (_exceptionContext.Result == null)
                {
                    _exceptionContext.Result = new EmptyResult();
                }

                _result = _exceptionContext.Result;

                var task = InvokeAlwaysRunResultFilters();
                if (task.Status != TaskStatus.RanToCompletion)
                {
                    next = State.ResourceInsideEnd;
                    return task;
                }

                goto case State.ResourceInsideEnd;
            }

        case State.ExceptionEnd:
            {
                var exceptionContext = _exceptionContext;

                if (scope == Scope.Exception)
                {
                    isCompleted = true;
                    return Task.CompletedTask;
                }

                if (exceptionContext != null)
                {
                    if (exceptionContext.Result != null ||
                        exceptionContext.Exception == null ||
                        exceptionContext.ExceptionHandled)
                    {
                        goto case State.ExceptionHandled;
                    }

                    Rethrow(exceptionContext);
                    Debug.Fail("unreachable");
                }

                var task = InvokeResultFilters();
                if (task.Status != TaskStatus.RanToCompletion)
                {
                    next = State.ResourceInsideEnd;
                    return task;
                }
                goto case State.ResourceInsideEnd;
            }

        case State.ActionBegin:
            {
                var task = InvokeInnerFilterAsync();
                if (task.Status != TaskStatus.RanToCompletion)
                {
                    next = State.ActionEnd;
                    return task;
                }

                goto case State.ActionEnd;
            }

        case State.ActionEnd:
            {
                if (scope == Scope.Exception)
                {
                    // If we're inside an exception filter, let's allow those filters to 'unwind' before
                    // the result.
                    isCompleted = true;
                    return Task.CompletedTask;
                }

                Debug.Assert(scope == Scope.Invoker || scope == Scope.Resource);
                var task = InvokeResultFilters();
                if (task.Status != TaskStatus.RanToCompletion)
                {
                    next = State.ResourceInsideEnd;
                    return task;
                }
                goto case State.ResourceInsideEnd;
            }

        case State.ResourceInsideEnd:
            {
                if (scope == Scope.Resource)
                {
                    _resourceExecutedContext = new ResourceExecutedContext(_actionContext, _filters)
                    {
                        Result = _result,
                    };

                    goto case State.ResourceEnd;
                }

                goto case State.InvokeEnd;
            }

        case State.ResourceEnd:
            {
                if (scope == Scope.Resource)
                {
                    isCompleted = true;
                    return Task.CompletedTask;
                }

                Debug.Assert(scope == Scope.Invoker);
                Rethrow(_resourceExecutedContext);

                goto case State.InvokeEnd;
            }

        case State.InvokeEnd:
            {
                isCompleted = true;
                return Task.CompletedTask;
            }

        default:
            throw new InvalidOperationException();
    }
}
```

从代码可以看出，它是根据状态State进行轮转，而执行顺序是Authorization->Resource->Exception......  也就是说当前action对应的多种类型的Filter会按照这样的顺序被执行，如下图

![](/blogimages/ASPNETCore2_17/548134-20190125113044773-1757917990.png)

            图四

可以看出，在上面几个Filter执行之后，ActionFilter的执行比较特殊，它将Action的执行包在了中间，这段逻辑写在了ControllerActionInvoker自己的类中，同样是一个 `Task Next` 方法被while循环调用，如下
```csharp
private Task Next(ref State next, ref Scope scope, ref object state, ref bool isCompleted)
{
    switch (next)
    {
        case State.ActionBegin:
            {
                var controllerContext = _controllerContext;

                _cursor.Reset();

                _instance = _cacheEntry.ControllerFactory(controllerContext);

                _arguments = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);

                var task = BindArgumentsAsync();
                if (task.Status != TaskStatus.RanToCompletion)
                {
                    next = State.ActionNext;
                    return task;
                }

                goto case State.ActionNext;
            }

        case State.ActionNext:
            {
                var current = _cursor.GetNextFilter<IActionFilter, IAsyncActionFilter>();
                if (current.FilterAsync != null)
                {
                    if (_actionExecutingContext == null)
                    {
                        _actionExecutingContext = new ActionExecutingContext(_controllerContext, _filters, _arguments, _instance);
                    }

                    state = current.FilterAsync;
                    goto case State.ActionAsyncBegin;
                }
                else if (current.Filter != null)
                {
                    if (_actionExecutingContext == null)
                    {
                        _actionExecutingContext = new ActionExecutingContext(_controllerContext, _filters, _arguments, _instance);
                    }

                    state = current.Filter;
                    goto case State.ActionSyncBegin;
                }
                else
                {
                    goto case State.ActionInside;
                }
            }

        case State.ActionAsyncBegin:
            {
                Debug.Assert(state != null);
                Debug.Assert(_actionExecutingContext != null);

                var filter = (IAsyncActionFilter)state;
                var actionExecutingContext = _actionExecutingContext;

                _diagnosticSource.BeforeOnActionExecution(actionExecutingContext, filter);
                _logger.BeforeExecutingMethodOnFilter(
                    MvcCoreLoggerExtensions.ActionFilter,
                    nameof(IAsyncActionFilter.OnActionExecutionAsync),
                    filter);

                var task = filter.OnActionExecutionAsync(actionExecutingContext, InvokeNextActionFilterAwaitedAsync);
                if (task.Status != TaskStatus.RanToCompletion)
                {
                    next = State.ActionAsyncEnd;
                    return task;
                }

                goto case State.ActionAsyncEnd;
            }

        case State.ActionAsyncEnd:
            {
                Debug.Assert(state != null);
                Debug.Assert(_actionExecutingContext != null);

                var filter = (IAsyncActionFilter)state;

                if (_actionExecutedContext == null)
                {
                    // If we get here then the filter didn't call 'next' indicating a short circuit.
                    _logger.ActionFilterShortCircuited(filter);

                    _actionExecutedContext = new ActionExecutedContext(
                        _controllerContext,
                        _filters,
                        _instance)
                    {
                        Canceled = true,
                        Result = _actionExecutingContext.Result,
                    };
                }

                _diagnosticSource.AfterOnActionExecution(_actionExecutedContext, filter);
                _logger.AfterExecutingMethodOnFilter(
                    MvcCoreLoggerExtensions.ActionFilter,
                    nameof(IAsyncActionFilter.OnActionExecutionAsync),
                    filter);

                goto case State.ActionEnd;
            }

        case State.ActionSyncBegin:
            {
                Debug.Assert(state != null);
                Debug.Assert(_actionExecutingContext != null);

                var filter = (IActionFilter)state;
                var actionExecutingContext = _actionExecutingContext;

                _diagnosticSource.BeforeOnActionExecuting(actionExecutingContext, filter);
                _logger.BeforeExecutingMethodOnFilter(
                    MvcCoreLoggerExtensions.ActionFilter,
                    nameof(IActionFilter.OnActionExecuting),
                    filter);

                filter.OnActionExecuting(actionExecutingContext);

                _diagnosticSource.AfterOnActionExecuting(actionExecutingContext, filter);
                _logger.AfterExecutingMethodOnFilter(
                    MvcCoreLoggerExtensions.ActionFilter,
                    nameof(IActionFilter.OnActionExecuting),
                    filter);

                if (actionExecutingContext.Result != null)
                {
                    // Short-circuited by setting a result.
                    _logger.ActionFilterShortCircuited(filter);

                    _actionExecutedContext = new ActionExecutedContext(
                        _actionExecutingContext,
                        _filters,
                        _instance)
                    {
                        Canceled = true,
                        Result = _actionExecutingContext.Result,
                    };

                    goto case State.ActionEnd;
                }

                var task = InvokeNextActionFilterAsync();
                if (task.Status != TaskStatus.RanToCompletion)
                {
                    next = State.ActionSyncEnd;
                    return task;
                }

                goto case State.ActionSyncEnd;
            }

        case State.ActionSyncEnd:
            {
                Debug.Assert(state != null);
                Debug.Assert(_actionExecutingContext != null);
                Debug.Assert(_actionExecutedContext != null);

                var filter = (IActionFilter)state;
                var actionExecutedContext = _actionExecutedContext;

                _diagnosticSource.BeforeOnActionExecuted(actionExecutedContext, filter);
                _logger.BeforeExecutingMethodOnFilter(
                    MvcCoreLoggerExtensions.ActionFilter,
                    nameof(IActionFilter.OnActionExecuted),
                    filter);

                filter.OnActionExecuted(actionExecutedContext);

                _diagnosticSource.AfterOnActionExecuted(actionExecutedContext, filter);
                _logger.AfterExecutingMethodOnFilter(
                    MvcCoreLoggerExtensions.ActionFilter,
                    nameof(IActionFilter.OnActionExecuted),
                    filter);

                goto case State.ActionEnd;
            }

        case State.ActionInside:
            {
                var task = InvokeActionMethodAsync();
                if (task.Status != TaskStatus.RanToCompletion)
                {
                    next = State.ActionEnd;
                    return task;
                }

                goto case State.ActionEnd;
            }

        case State.ActionEnd:
            {
                if (scope == Scope.Action)
                {
                    if (_actionExecutedContext == null)
                    {
                        _actionExecutedContext = new ActionExecutedContext(_controllerContext, _filters, _instance)
                        {
                            Result = _result,
                        };
                    }

                    isCompleted = true;
                    return Task.CompletedTask;
                }

                var actionExecutedContext = _actionExecutedContext;
                Rethrow(actionExecutedContext);

                if (actionExecutedContext != null)
                {
                    _result = actionExecutedContext.Result;
                }

                isCompleted = true;
                return Task.CompletedTask;
            }

        default:
            throw new InvalidOperationException();
    }
}
```

而在ActionBegin的时候，通过ControllerFactory创建了Controller并调用 `cacheEntry.ControllerBinderDelegate(_controllerContext, _instance, _arguments)` 进行了参数绑定。

然后的顺序是   ActionFilter的OnActionExecuting方法 ->action的执行->ActionFilter的OnActionExecuted方法， action的执行如下：

```csharp
private async Task InvokeActionMethodAsync()
{
    var controllerContext = _controllerContext;
    var objectMethodExecutor = _cacheEntry.ObjectMethodExecutor;
    var controller = _instance;
    var arguments = _arguments;
    var actionMethodExecutor = _cacheEntry.ActionMethodExecutor;
    var orderedArguments = PrepareArguments(arguments, objectMethodExecutor);

    var diagnosticSource = _diagnosticSource;
    var logger = _logger;

    IActionResult result = null;
    try
    {
        diagnosticSource.BeforeActionMethod(
            controllerContext,
            arguments,
            controller);
        logger.ActionMethodExecuting(controllerContext, orderedArguments);
        var stopwatch = ValueStopwatch.StartNew();
        var actionResultValueTask = actionMethodExecutor.Execute(_mapper, objectMethodExecutor, controller, orderedArguments);
        if (actionResultValueTask.IsCompletedSuccessfully)
        {
            result = actionResultValueTask.Result;
        }
        else
        {
            result = await actionResultValueTask;
        }

        _result = result;
        logger.ActionMethodExecuted(controllerContext, result, stopwatch.GetElapsedTime());
    }
    finally
    {
        diagnosticSource.AfterActionMethod(
            controllerContext,
            arguments,
            controllerContext,
            result);
    }
}
```

<span style="color: #ff6600;">总结： 如上文说的，本节的内容就是将准备阶段组装的多个方法在这里按一定的被逐步的执行（如图四）。</span>

大概内容就是这样，详细分析起来涉及细节还有好多，后面的文章会对一些关键内容进行详细分享。