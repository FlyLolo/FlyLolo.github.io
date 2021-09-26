---
title: 二十.Action的数据返回格式处理
date: 2019-09-11
tags:
 - ASP.NET Core
categories:
 -  .NET
---

上一章讲了系统如何将客户端提交的请求数据格式化处理成我们想要的格式并绑定到对应的参数，本章讲一下它的“逆过程”，如何将请求结果按照客户端想要的格式返回去。

## 1. 常见的返回类型

以系统模板默认生成的Home/Index这个Action来说，为什么当请求它的时候回返回一个Html页面呢？除了这之外，还有JSON、文本等类型，系统是如何处理这些不同的类型的呢？

首先来说几种常见的返回类型的例子，并用Fiddler请求这几个例子看一下结果，涉及到的一个名为Book的类，代码为：

```csharp
public class Book
{
    public string Code { get; set; }
    public string Name { get; set; }
}
```

### A.ViewResult类型

```csharp
public class HomeController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
```

返回一个Html页面，Content-Type值为： text/html; charset=utf-8

### B.string类型

```csharp
public string GetString()
{
    return "Hello Core";
}
```

返回字符串“Hello Core”，Content-Type值为：text/plain; charset=utf-8

### C.JSON类型

```csharp
public JsonResult GetJson()
{
    return new JsonResult(new Book() { Code = "1001", Name = "ASP" });
}
```

返回JSON，值为：
```
{"code":"1001","name":"ASP"}
```

Content-Type值为：Content-Type: application/json; charset=utf-8

### D.直接返回实体类型

```csharp
public Book GetModel()
{
        return new Book() { Code = "1001", Name = "ASP" };
}
```

同样是返回JSON，值为：

```
{"code":"1001","name":"ASP"}
```

Content-Type值同样是：Content-Type: application/json; charset=utf-8

### E.void类型

```csharp
public void GetVoid()
{
}
```

没有返回结果也没有Content-Type值。

**下面看几个异步方法：**

### F.Task类型

```csharp
public async Task GetTaskNoResult()
{
    await Task.Run(() => { });
}
```

与void类型一样，没有返回结果也没有Content-Type值。

### G.`Task<string>`类型

```csharp
public async Task<string> GetTaskString()
{
    string rtn = string.Empty;
    await Task.Run(() => { rtn = "Hello Core"; });

    return rtn;
}
```

与string类型一样，返回字符串“Hello Core”，Content-Type值为：text/plain; charset=utf-8

### H.`Task<JsonResult>`类型

```csharp
public async Task<JsonResult> GetTaskJson()
{
    JsonResult jsonResult = null;
    await Task.Run(() => { jsonResult = new JsonResult(new Book() { Code = "1001", Name = "ASP" }); });
    return jsonResult;
}
```

与JSON类型一样，返回JSON，值为：

```json
[{"code":"1001","name":"ASP"},{"code":"1002","name":"Net Core"}]
```

Content-Type值为：Content-Type: application/json; charset=utf-8

还有其他类型，这里暂不列举了，总结一下：

1.  返回结果有空、Html页面、普通字符串、JSON字符串几种。

2.  对应的Content-Type类型有空、text/html、text/plain、application/json几种。

3.  异步Action的返回结果，和其对应的同步Action返回结果类型一致。

下一节我们看一下系统是如何处理这些不同的类型的。

## 2. 内部处理机制解析

### A.总体流程

通过下图 来看一下总体的流程：

 ![](/blogimages/ASPNETCore2_20/548134-20190910221135403-460462513.png)

图1

这涉及三部分内容：

第一部分，在invoker的生成阶段。在第14章讲invoker的生成的时候，讲到了Action的执行者的获取，它是从一系列系统定义的*XXX*ResultExecutor中筛选出来的，虽然它们名为*XXX*ResultExecutor，但它们都是Action的执行者而不是ActionResult的执行者，都是ActionMethodExecutor的子类。以Action是同步还是异步以及Action的返回值类型为筛选条件，具体这部分内容见图 14‑2所示*XXX*ResultExecutor列表及其后面的筛选逻辑部分。在图 17‑1中，筛选出了被请求的Action对应的*XXX*ResultExecutor，若以Home/Index这个默认的Action为例，这个*XXX*ResultExecutor应该是SyncActionResultExecutor。

第二部分，在Action Filters的处理阶段。这部分内容见16.5 Filter的执行，此处恰好以Action Filter为例讲了Action Filter的执行方式及Action被执行的过程。在这个阶段，会调用上文筛选出的SyncActionResultExecutor的Execute方法来执行Home/Index这个 Action。执行结果返回一个IActionResult。

第三部分，在Result Filters的处理阶段。这个阶段和Action Filters的逻辑相似，只不过前者的核心是Action的执行，后者的核心是Action的执行结果的执行。二者都分为OnExecuting和OnExecuted两个方法，这两个方法也都在其对应的核心执行方法前后执行。

整体流程是这样，下面看一下细节。

### B. ActionMethodExecutor的选择与执行

第一部分，系统为什么要定义这么多种*XXX*ResultExecutor并且在请求的时候一个个筛选合适的*XXX*ResultExecutor呢？从筛选规则是以Action的同步、异步以及Action的返回值类型来看，这么多种*XXX*ResultExecutor就是为了处理不同的Action类型。

依然以Home/Index为例，在筛选*XXX*ResultExecutor的时候，最终返回结果是SyncActionResultExecutor。它的代码如下：

```csharp
private class SyncActionResultExecutor : ActionMethodExecutor
{
    public override ValueTask<IActionResult> Execute(
        IActionResultTypeMapper mapper,
        ObjectMethodExecutor executor,
        object controller,
        object[] arguments)
        {
            var actionResult = (IActionResult)executor.Execute(controller, arguments);
            EnsureActionResultNotNull(executor, actionResult);
            return new ValueTask<IActionResult>(actionResult);
        }

    protected override bool CanExecute(ObjectMethodExecutor executor)
            => !executor.IsMethodAsync && typeof(IActionResult).IsAssignableFrom(executor.MethodReturnType);
}
```

*XXX*ResultExecutor的CanExecute方法是筛选的条件，通过这个方法判断它是否适合当前请求的目标Action。它要求这个Action不是异步的并且返回结果类型是派生自IActionResult的。而Home/Index这个Action标识的返回结果是IActionResult，实际是通过View()这个方法返回的，这个方法的返回结果类型实际是IActionResult的派生类ViewResult。这样的派生类还有常见的JsonResult和ContentResult等，他们都继承了ActionResult，而ActionResult实现了IActionResult接口。所以如果一个Action是同步的并且返回结果是JsonResult或ContentResult的时候，对应的*XXX*ResultExecutor也是SyncActionResultExecutor。

第二部分中，Action的执行是在*XXX*ResultExecutor的Execute方法，它会进一步调用了ObjectMethodExecutor的Execute方法。实际上所有的Action的都是由ObjectMethodExecutor的Execute方法来执行执行的。而众多的*XXX*ResultExecutor方法的作用是调用这个方法并且对返回结果进行验证和处理。例如SyncActionResultExecutor会通过EnsureActionResultNotNull方法确保返回的结果不能为空。

如果是sting类型呢？它对应的是SyncObjectResultExecutor，代码如下：

```csharp
private class SyncObjectResultExecutor : ActionMethodExecutor
{
    public override ValueTask<IActionResult> Execute(
        IActionResultTypeMapper mapper,
        ObjectMethodExecutor executor,
        object controller,
        object[] arguments)
    {
        // Sync method returning arbitrary object
        var returnValue = executor.Execute(controller, arguments);
        var actionResult = ConvertToActionResult(mapper, returnValue, executor.MethodReturnType);
        return new ValueTask<IActionResult>(actionResult);
    }

    // Catch-all for sync methods
    protected override bool CanExecute(ObjectMethodExecutor executor) => !executor.IsMethodAsync;

}
```

由于string不是IActionResult的子类，所以会通过ConvertToActionResult方法对返回结果returnValue进行处理。

```csharp
private IActionResult ConvertToActionResult(IActionResultTypeMapper mapper, object returnValue, Type declaredType)
    {
        var result = (returnValue as IActionResult) ?? mapper.Convert(returnValue, declaredType);
        if (result == null)
        {
            throw new InvalidOperationException(Resources.FormatActionResult_ActionReturnValueCannotBeNull(declaredType));
        }

        return result;
     }
```

如果returnValue是IActionResult的子类，则返回returnValue，否则调用一个Convert方法将returnValue转换一下：

```csharp
public IActionResult Convert(object value, Type returnType)
{
    if (returnType == null)
    {
        throw new ArgumentNullException(nameof(returnType));
    }

    if (value is IConvertToActionResult converter)
    {
        return converter.Convert();
    }

    return new ObjectResult(value)
    {
        DeclaredType = returnType,
    };
}
```

这个方法会判断returnValue是否实现了IConvertToActionResult接口，如果是则调用该接口的Convert方法转换成IActionResult类型，否则会将returnValue封装成ObjectResult。ObjectResult也是ActionResult的子类。下文有个`ActionResult<T>` 类型就是这样，该例会介绍。

所以，针对不同类型的Action，系统设置了多种*XXX*ResultExecutor来处理，最终结果无论是什么，都会被转换成IActionResult类型。方便在图 17‑1所示的第三部分进行IActionResult的执行。

上一节列出了多种不同的Action，它们的处理在这里就不一一讲解了。通过下图 17‑2看一下它们的处理结果：

 ![](/blogimages/ASPNETCore2_20/548134-20190910221348566-1256541571.png)

图 2

这里有void类型没有讲到，它本身没有返回结果，但它会被赋予一个结果EmptyResult，它也是ActionResult的子类。

图 2被两行虚线分隔为三行，第一行基本都介绍过了，第二行是第一行对应的异步方法，上一节介绍常见的返回类的时候说过，这些异步方法的返回结果和对应的同步方法是一样的。不过通过图 2可知，处理它们的*XXX*ResultExecutor方法是不一样的。

第三行的`ActionResult<T>` 类型是在ASP.NET Core 2.1 引入的，它支持IActionResult的子类也支持类似string和Book这样的特定类型。

```csharp
public sealed class ActionResult<TValue> : IConvertToActionResult
{
    public ActionResult(TValue value)
    {
        if (typeof(IActionResult).IsAssignableFrom(typeof(TValue)))
        {
            var error = Resources.FormatInvalidTypeTForActionResultOfT(typeof(TValue), "ActionResult<T>");

            throw new ArgumentException(error);
        }

        Value = value;
    }

    public ActionResult(ActionResult result)
    {
        if (typeof(IActionResult).IsAssignableFrom(typeof(TValue)))
        {
            var error = Resources.FormatInvalidTypeTForActionResultOfT(typeof(TValue), "ActionResult<T>");
            throw new ArgumentException(error);
        }

        Result = result ?? throw new ArgumentNullException(nameof(result));
    }

    /// <summary>
    /// Gets the <see cref="ActionResult"/>.
    /// </summary>
    public ActionResult Result { get; }

    /// <summary>
    /// Gets the value.
    /// </summary>
    public TValue Value { get; }

    public static implicit operator ActionResult<TValue>(TValue value)
    {
        return new ActionResult<TValue>(value);
    }

    public static implicit operator ActionResult<TValue>(ActionResult result)
    {
        return new ActionResult<TValue>(result);
    }

    IActionResult IConvertToActionResult.Convert()
    {
        return Result ?? new ObjectResult(Value)
        {
            DeclaredType = typeof(TValue),
        };
    }
}
```

TValue不支持IActionResult及其子类。它的值若是IActionResult子类，会被赋值给Result属性，否则会赋值给Value属性。它实现了IConvertToActionResult接口，想到刚讲解string类型被处理的时候用到的Convert方法。当返回结果实现了IConvertToActionResult这个接口的时候，就会调用它的Convert方法进行转换。它的Convert方法就是先判断它的值是否是IActionResult的子类，如果是则返回该值，否则将该值转换为ObjectResult后返回。

所以图 2中`ActionResult<T>` 类型返回的结果被加上引号的意思就是结果类型可能是直接返回的IActionResult的子类,也有可能是string和Book这样的特定类型被封装后的ObjectResult类型。

### C. Result Filter的执行

结果被统一处理为IActionResult后，进入图 1所示的第三部分。这部分的主要内容有两个，分别是Result Filters的执行和IActionResult的执行。Result Filter也有OnResultExecuting和OnResultExecuted两个方法，分别在IActionResult执行的前后执行。

自定义一个MyResultFilterAttribute，代码如下：

```csharp
public class MyResultFilterAttribute : Attribute, IResultFilter
{
    public void OnResultExecuted(ResultExecutedContext context)
    {
        Debug.WriteLine("HomeController=======>OnResultExecuted");
    }

    public void OnResultExecuting(ResultExecutingContext context)
    {
        Debug.WriteLine("HomeController=======>OnResultExecuting");
    }
}
```

将它注册到第一节JSON的例子中：

```csharp
[MyResultFilter]
public JsonResult GetJson()
{
    return new JsonResult(new Book() { Code = "1001", Name = "ASP" });
}
```

可以看到这样的输出结果：

```csharp
HomeController=======>OnResultExecuting

……Executing JsonResult……

HomeController=======>OnResultExecuted
```

在OnResultExecuting中可以通过设置context.Cancel = true;取消后面的工作的执行。

```csharp
public void OnResultExecuting(ResultExecutingContext context)
{
    //用于验证的代码略
    context.Cancel = true;
    Debug.WriteLine("HomeController=======>OnResultExecuting");
}
```

再看输出结果就至于的输出了

```csharp
HomeController=======>OnResultExecuting
```

同时返回结果也不再是JSON值了，返回结果以及Content-Type全部为空。所以这样设置后，IActionResult以及OnResultExecuted都不再被执行。

在这里除了可以做一些IActionResult执行之前的验证，还可以对HttpContext.Response做一些简单的操作，例如添加个Header值：

```csharp
public void OnResultExecuting(ResultExecutingContext context)
{
    context.HttpContext.Response.Headers.Add("version", "1.2");
    Debug.WriteLine("HomeController=======>OnResultExecuting");
}
```

除了正常返回JSON结果外，Header中会出现新添加的version

```csharp
Content-Type: application/json; charset=utf-8
version: 1.2
```

再看一下OnResultExecuted方法，它是在IActionResult执行之后执行。因为在这个方法执行的时候，请求结果已经发送给请求的客户端了，所以在这里可以做一些日志类的操作。举个例子，假如在这个方法中产生了异常：

```csharp
public void OnResultExecuted(ResultExecutedContext context)
{
    throw new Exception("exception");
    Debug.WriteLine("HomeController=======>OnResultExecuted");
}
```

请求结果依然会返回正常的JSON，但从输出结果中看到是不一样的

```csharp
HomeController=======>OnResultExecuting
……
System.Exception: exception
```

发生异常，后面的Debug输出没有 执行。但却将正确的结果返回给了客户端。

Result Filter介绍完了，看一下核心的IActionResult的执行。

### D. IActionResult的执行

在ResourceInvoker的case State.ResultInside阶段会调用IActionResult的执行方法InvokeResultAsync。该方法中参数IActionResult result会被调用ExecuteResultAsync方法执行。

```csharp
protected virtual async Task InvokeResultAsync(IActionResult result)
{
    var actionContext = _actionContext;
    _diagnosticSource.BeforeActionResult(actionContext, result);
    _logger.BeforeExecutingActionResult(result);

    try
    {
        await result.ExecuteResultAsync(actionContext);
    }
    finally
    {
        _diagnosticSource.AfterActionResult(actionContext, result);
        _logger.AfterExecutingActionResult(result);
    }
}
```

由图 2可知，虽然所有类型的Action的结果都被转换成了IActionResult，但它们本质上还是有区别的。所以这个IActionResult类型的参数result实际上可能是JsonResult、ViewResult、EmptyResult等具体类型。下面依然以第一节JSON的例子为例来看，它返回了一个JsonResult。在这里就会调用JsonResult的ExecuteResultAsync方法，JsonResult的代码如下：

```csharp
public class JsonResult : ActionResult, IStatusCodeActionResult
{
    //部分代码略
    public override Task ExecuteResultAsync(ActionContext context)
    {
        if (context == null)
        {
            throw new ArgumentNullException(nameof(context));
        }

        var services = context.HttpContext.RequestServices;
        var executor = services.GetRequiredService<JsonResultExecutor>();

        return executor.ExecuteAsync(context, this);
    }
}
```

在它的ExecuteResultAsync方法中会获取依赖注入中设置的JsonResultExecutor，由JsonResultExecutor来调用ExecuteAsync方法执行后面的工作。JsonResultExecutor的代码如下：

```csharp
public class JsonResultExecutor
{
//部分代码略
    public virtual async Task ExecuteAsync(ActionContext context, JsonResult result)
    {
        //验证代码略
        var response = context.HttpContext.Response;
    ResponseContentTypeHelper.ResolveContentTypeAndEncoding(
            result.ContentType,
            response.ContentType,
            DefaultContentType,
            out var resolvedContentType,
            out var resolvedContentTypeEncoding);

        response.ContentType = resolvedContentType;

        if (result.StatusCode != null)
        {
            response.StatusCode = result.StatusCode.Value;
        }

        var serializerSettings = result.SerializerSettings ?? Options.SerializerSettings;
        Logger.JsonResultExecuting(result.Value);
        using (var writer = WriterFactory.CreateWriter(response.Body, resolvedContentTypeEncoding))
        {
            using (var jsonWriter = new JsonTextWriter(writer))
            {
                jsonWriter.ArrayPool = _charPool;
                jsonWriter.CloseOutput = false;
                jsonWriter.AutoCompleteOnClose = false;
                var jsonSerializer = JsonSerializer.Create(serializerSettings);
                jsonSerializer.Serialize(jsonWriter, result.Value);

            }
            // Perf: call FlushAsync to call WriteAsync on the stream with any content left in the TextWriter's
            // buffers. This is better than just letting dispose handle it (which would result in a synchronous write).

            await writer.FlushAsync();
        }
    }
}
```

JsonResultExecutor的ExecuteAsync方法的作用就是将JsonResult中的值转换成JSON串并写入context.HttpContext.Response. Body中。至此JsonResult执行完毕。

ViewResult会有对应的ViewExecutor来执行，会通过相应的规则生成一个 Html页面。

而EmptyResult的ExecuteResult方法为空，所以不会返回任何内容。

```csharp
public class EmptyResult : ActionResult
{
    /// <inheritdoc />
    public override void ExecuteResult(ActionContext context)
    {

    }
}
```

## 3. 下集预告


* <span style="color: #ff9900;">对于以上几种类型返回结果的格式是固定的，JsonResult就会返回JSON格式，ViewResult就会返回Html格式。</span>

* <span style="color: #ff9900;">但是从第一节的例子可知，string类型会返回string类型的字符串，而Book这样的实体类型却会返回JSON。</span>

* <span style="color: #ff9900;">由图 2可知这两种类型在执行完毕后，都被封装成了ObjectResult，那么ObjectResult在执行的时候又是如何被转换成string和JSON两种格式的呢？</span>

下一章继续这个话题。