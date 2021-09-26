---
title: 二十一. 内容协商与自定义返回格式
date: 2019-09-18
tags:
 - ASP.NET Core
categories:
 -  .NET
---

上一章的结尾留下了一个问题：同样是ObjectResult，在执行的时候又是如何被转换成string和JSON两种格式的呢？

本章来解答这个问题，这里涉及到一个名词：“内容协商”。除了这个，本章将通过两个例子来介绍如何自定义IActionResult和格式化类。([ASP.NET Core 系列目录](https://www.cnblogs.com/FlyLolo/p/ASPNETCore2_0.html))

## 1. 内容协商

依然以返回Book类型的Action为例，看看它是怎么被转换为JSON类型的。

```csharp
public Book GetModel()
    {
        return new Book() { Code = "1001", Name = "ASP" };
    }
```

这个Action执行后被封装为ObjectResult，接下来就是这个ObjectResult的执行过程。

ObjectResult的代码如下：

```csharp
public class ObjectResult : ActionResult, IStatusCodeActionResult
    {
         //部分代码略
         public override Task ExecuteResultAsync(ActionContext context)
         {
              var executor = context.HttpContext.RequestServices.GetRequiredService<IActionResultExecutor<ObjectResult>>();
              return executor.ExecuteAsync(context, this);
         }
    }
```

它是如何被执行的呢？首先会通过依赖注入获取ObjectResult对应的执行者，获取到的是ObjectResultExecutor，然后调用ObjectResultExecutor的ExecuteAsync方法。代码如下：

```csharp
public class ObjectResultExecutor : IActionResultExecutor<ObjectResult>
    {
         //部分代码略
         public virtual Task ExecuteAsync(ActionContext context, ObjectResult result)
         {
              //部分代码略
              var formatterContext = new OutputFormatterWriteContext(
                   context.HttpContext,
                   WriterFactory,
                   objectType,
                   result.Value);

                var selectedFormatter = FormatterSelector.SelectFormatter(
                    formatterContext,
                    (IList<IOutputFormatter>)result.Formatters ?? Array.Empty<IOutputFormatter>(),
                    result.ContentTypes);
                if (selectedFormatter == null)
                {
                    // No formatter supports this.
                    Logger.NoFormatter(formatterContext);
                    context.HttpContext.Response.StatusCode = StatusCodes.Status406NotAcceptable;
                    return Task.CompletedTask;
                }

                result.OnFormatting(context);
                return selectedFormatter.WriteAsync(formatterContext);
         }
    }
```

核心代码就是FormatterSelector.SelectFormatter()方法，它的作用是选择一个合适的Formatter。Formatter顾名思义就是一个用于格式化数据的类。系统默认提供了4种Formatter，如下图 1

![](/blogimages/ASPNETCore2_21/548134-20190912144111915-1440270022.png)

图 1

它们都实现了IOutputFormatter接口，继承关系如下图 2：

 ![](/blogimages/ASPNETCore2_21/548134-20190912144247361-856742257.png)

图 2

IOutputFormatter代码如下：

```csharp
public interface IOutputFormatter
    {
        bool CanWriteResult(OutputFormatterCanWriteContext context);
        Task WriteAsync(OutputFormatterWriteContext context);
    }
```

又是非常熟悉的方式，就像在众多*XXX*ResultExecutor中筛选一个合适的Action的执行者一样，首先将它们按照一定的顺序排列，然后开始遍历，逐一执行它们的Can*XXX*方法，若其中一个的执行结果为true，则它就会被选出来。例如StringOutputFormatter的代码如下：

```csharp
public class StringOutputFormatter : TextOutputFormatter
    {
        public StringOutputFormatter()
        {
            SupportedEncodings.Add(Encoding.UTF8);
            SupportedEncodings.Add(Encoding.Unicode);
            SupportedMediaTypes.Add("text/plain");
        }

        public override bool CanWriteResult(OutputFormatterCanWriteContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            if (context.ObjectType == typeof(string) || context.Object is string)
            {
                return base.CanWriteResult(context);
            }

             return false;
        }
        //省略部分代码
    }
```

从StringOutputFormatter的CanWriteResult方法中可以知道它能处理的是string类型的数据。它的构造方法中标识它可以处理的字符集为UTF8和Unicode。对应的数据格式标记为“text/plain”。同样查看HttpNoContentOutputFormatter和HttpNoContentOutputFormatter对应的是返回值为void或者task的，StreamOutputFormatter对应的是Stream类型的。

JsonOutputFormatter没有重写CanWriteResult方法，采用的是OutputFormatter的CanWriteResult方法，代码如下：

```csharp
public abstract class OutputFormatter : IOutputFormatter, IApiResponseTypeMetadataProvider
    {
       //部分代码略
        protected virtual bool CanWriteType(Type type)
        {
            return true;
        }

        /// <inheritdoc />
        public virtual bool CanWriteResult(OutputFormatterCanWriteContext context)
        {
            if (SupportedMediaTypes.Count == 0)
            {
                var message = Resources.FormatFormatter_NoMediaTypes(
                    GetType().FullName,
                    nameof(SupportedMediaTypes));

                 throw new InvalidOperationException(message);
            }

             if (!CanWriteType(context.ObjectType))
            {
                return false;
            }

            if (!context.ContentType.HasValue)
            {
                context.ContentType = new StringSegment(SupportedMediaTypes[0]);
                return true;
            }
            else
            {
                var parsedContentType = new MediaType(context.ContentType);

                for (var i = 0; i < SupportedMediaTypes.Count; i++)
                {
                    var supportedMediaType = new MediaType(SupportedMediaTypes[i]);
                    if (supportedMediaType.HasWildcard)
                    {
                        if (context.ContentTypeIsServerDefined
                            && parsedContentType.IsSubsetOf(supportedMediaType))
                        {
                            return true;
                        }
                    }
                    else
                    {
                        if (supportedMediaType.IsSubsetOf(parsedContentType))
                        {
                            context.ContentType = new StringSegment(SupportedMediaTypes[i]);
                            return true;
                        }
                    }
                }
            }

             return false;
        }
    }
```

通过代码可以看出它主要是利用SupportedMediaTypes和context.ContentType做一系列的判断，它们分别来自客户端和服务端：

**SupportedMediaTypes：**它是客户端在请求的时候给出的，标识客户端期望服务端按照什么样的格式返回请求结果。

**context.ContentType：**它来自ObjectResult.ContentTypes，是由服务端在Action执行后给出的。

二者的值都是类似“application/json”、“text/plain”这样的格式，当然也有可能为空，即客户端或服务端未对请求做数据格式的设定。通过上面的代码可以知道，如果这两个值均未做设置或者只有一方做了设置并且设置为JSON时，这个CanWriteResult方法的返回值都是true。所以这样的情况下除了前三种Formatter对应的特定类型外的ObjectResult都会交由JsonOutputFormatter处理。这也就是为什么同样是ObjectResult，但string类型的Action返回结果是String类型，而Book类型的Action返回的结果是JSON类型。这个JsonOutputFormatter有点像当其他的Formatter无法处理时用来“保底”的。

那么SupportedMediaTypes和context.ContentType这两个值又是在什么时候被设置的呢？ 在讲请求的模型参数绑定的时候，可以通过在请求Request的Header中添加“content-type: application/json”这样的标识来说明请求中包含的数据的格式是JSON类型的。同样，在请求的时候也可以添加“accept:*xxx*”这样的标识，来表明期望服务端对本次请求返回的数据的格式。例如期望是JSON格式“accept:application/json”，文本格式“accept: text/plain”等。这个值就是SupportedMediaTypes。

在服务端，也可以对返回的数据格式做设置，例如下面的代码：

```csharp
[Produces("application/json")]
public Book GetModel()
{
    return new Book() { Code = "1001", Name = "ASP" };
}
```

通过这个ProducesAttribute设置的值最终就会被赋值给ObjectResult.ContentTypes，最终传递给context.ContentType。ProducesAttribute实际是一个IResultFilter，代码如下：

```csharp
public class ProducesAttribute : Attribute, IResultFilter, IOrderedFilter, IApiResponseMetadataProvider
{
    //部分代码省略
    public virtual void OnResultExecuting(ResultExecutingContext context)
    {
        //部分代码省略
        SetContentTypes(objectResult.ContentTypes);
    }

    public void SetContentTypes(MediaTypeCollection contentTypes)
    {
        contentTypes.Clear();
        foreach (var contentType in ContentTypes)
        {
            contentTypes.Add(contentType);
        }
    }

    private MediaTypeCollection GetContentTypes(string firstArg, string[] args)
    {
        var completeArgs = new List<string>();
        completeArgs.Add(firstArg);
        completeArgs.AddRange(args);
        var contentTypes = new MediaTypeCollection();
        foreach (var arg in completeArgs)
        {
            var contentType = new MediaType(arg);
            if (contentType.HasWildcard)
            {
                throw new InvalidOperationException(                     Resources.FormatMatchAllContentTypeIsNotAllowed(arg));
            }

            contentTypes.Add(arg);
        }

        return contentTypes;
    }
}
```

在执行OnResultExecuting的时候，会将设置的“application/json”赋值给ObjectResult.ContentTypes。所以请求最终返回结果的数据格式是由二者“协商”决定的。下面回到Formatter的筛选方法FormatterSelector.SelectFormatter()，这个方法写在DefaultOutputFormatterSelector.cs中。精简后的代码如下：

```csharp
public class DefaultOutputFormatterSelector : OutputFormatterSelector
{
    //部分代码略
    public override IOutputFormatter SelectFormatter(OutputFormatterCanWriteContext context, IList<IOutputFormatter> formatters, MediaTypeCollection contentTypes)
    {
        //部分代码略
        var request = context.HttpContext.Request;
        var acceptableMediaTypes = GetAcceptableMediaTypes(request);
        var selectFormatterWithoutRegardingAcceptHeader = false;
        IOutputFormatter selectedFormatter = null;
        if (acceptableMediaTypes.Count == 0)
        {
            //客户端未设置Accept标头的情况
            selectFormatterWithoutRegardingAcceptHeader = true;
        }
        else
        {
            if (contentTypes.Count == 0)
            {
                //服务端未指定数据格式的情况
                selectedFormatter = SelectFormatterUsingSortedAcceptHeaders(
                    context,
                    formatters,
                    acceptableMediaTypes);
            }
            else
            {
                //客户端和服务端均指定了数据格式的情况
                selectedFormatter = SelectFormatterUsingSortedAcceptHeadersAndContentTypes(
                    context,
                    formatters,
                    acceptableMediaTypes,
                    contentTypes);
            }

            if (selectedFormatter == null)
            {
                //如果未找到合适的，由系统参数ReturnHttpNotAcceptable决定直接返回错误
                //还是忽略客户端的Accept设置再筛选一次
                if (!_returnHttpNotAcceptable)
                {
                    selectFormatterWithoutRegardingAcceptHeader = true;
                }
            }
        }

        if (selectFormatterWithoutRegardingAcceptHeader)
        {
            //Accept标头未设置或者被忽略的情况
            if (contentTypes.Count == 0)
            {
                //服务端也未指定数据格式的情况
                selectedFormatter = SelectFormatterNotUsingContentType(
                    context,
                    formatters);
            }
            else
            {
                //服务端指定数据格式的情况
                selectedFormatter = SelectFormatterUsingAnyAcceptableContentType(
                    context,
                    formatters,
                    contentTypes);
            }
        }

        if (selectedFormatter == null)
        {
            // No formatter supports this.
            _logger.NoFormatter(context);
            return null;
        }

        _logger.FormatterSelected(selectedFormatter, context);
        return selectedFormatter;
    }

    // 4种情况对应的4个方法略
    // SelectFormatterNotUsingContentType
    // SelectFormatterUsingSortedAcceptHeaders
    // SelectFormatterUsingAnyAcceptableContentType
    // SelectFormatterUsingSortedAcceptHeadersAndContentTypes
}
```

DefaultOutputFormatterSelector根据客户端和服务端关于返回数据格式的设置的4种不同情况作了分别处理，优化了查找顺序，此处就不详细讲解了。

**总结一下这个规则：**

1.  **只有在Action返回类型为ObjectResult的时候才会进行“协商”。如果返回类型为JsonResult、ContentResult、ViewResult等特定ActionResult，无论请求是否设置了accept标识，都会被忽略，会固定返回 JSON、String，Html类型的结果。**

2.  **当系统检测到请求是来自浏览器时，会忽略 其Header中Accept 的设置，所以会由服务器端设置的格式决定（未做特殊配置时，系统默认为JSON）。 这是为了在使用不同浏览器使用 API 时提供更一致的体验。系统提供了参数RespectBrowserAcceptHeader，即尊重浏览器在请求的Header中关于Accept的设置，默认值为false。将其设置为true的时候，浏览器请求中的Accept 标识才会生效。注意这只是使该Accept 标识生效，依然不能由其决定返回格式，会进入“协商”阶段。**

3.  **若二者均未设置，采用默认的JSON格式。**

4.  **若二者其中有一个被设置，采用该设置值。**

5.  **若二者均设置且不一致，即二者值不相同且没有包含关系（有通配符的情况），会判断系统参数ReturnHttpNotAcceptable（返回不可接受，默认值为false），若ReturnHttpNotAcceptable值为false，则忽略客户端的Accept设置，按照无Accept设置的情况再次筛选一次Formatter。如果该值为true，则直接返回状态406。**

涉及的两个系统参数RespectBrowserAcceptHeader和ReturnHttpNotAcceptable的设置方法是在 Startup.cs 中通过如下代码设置：

```csharp
services.AddMvc(
    options =>
    {
        options.RespectBrowserAcceptHeader = true;
        options.ReturnHttpNotAcceptable = true;
    }
)
```

  最终，通过上述方法找到了合适的Formatter，接着就是通过该Formatter的WriteAsync方法将请求结果格式化后写入HttpContext.Response中。JsonOutputFormatter重写了OutputFormatter的WriteResponseBodyAsync方法（WriteAsync方法会调用WriteResponseBodyAsync方法），代码如下：

```csharp
public override async Task WriteResponseBodyAsync(OutputFormatterWriteContext context, Encoding selectedEncoding)
{
    if (context == null)
    {
        throw new ArgumentNullException(nameof(context));
    }

    if (selectedEncoding == null)
    {
        throw new ArgumentNullException(nameof(selectedEncoding));
    }

    var response = context.HttpContext.Response;
    using (var writer = context.WriterFactory(response.Body, selectedEncoding))
    {
        WriteObject(writer, context.Object);
        // Perf: call FlushAsync to call WriteAsync on the stream with any content left in the TextWriter's
        // buffers. This is better than just letting dispose handle it (which would result in a synchronous
        // write).
        await writer.FlushAsync();
    }
}
```

这个方法的功能就是将结果数据转换为JSON并写入HttpContext.Response. Body中。至此，请求结果就按照JSON的格式返回给客户端了。

在实际项目中，如果上述的几种格式均不能满足需求，比如某种数据经常需要通过特殊的格式传输，想自定义一种格式，该如何实现呢？通过本节的介绍，可以想到两种方式，即自定义一种IActionResult或者自定义一种IOutputFormatter。

## 2. 自定义IActionResult

举个简单的例子，以第一节的第3个例子为例，该例通过 “return new JsonResult(new Book() { Code = "1001", Name = "ASP" })”返回了一个JsonResult。

返回的JSON值为：

```csharp
{"code":"1001","name":"ASP"}
```

假如对于Book这种类型，希望用特殊的格式返回，例如这样的格式：

```csharp
Book Code:[1001]|Book Name:<ASP>
```

可以通过自定义一个类似JsonResult的类来实现。代码如下：

```csharp
public class BookResult : ActionResult
{
    public BookResult(Book content)
    {
        Content = content;
    }
    public Book Content { get; set; }
    public string ContentType { get; set; }
    public int? StatusCode { get; set; }

    public override async Task ExecuteResultAsync(ActionContext context)
    {
        if (context == null)
        {
            throw new ArgumentNullException(nameof(context));
        }

            var executor = context.HttpContext.RequestServices.GetRequiredService<IActionResultExecutor<BookResult>>();
        await executor.ExecuteAsync(context, this);
    }
}
```

定义了一个名为BookResult的类，为了方便继承了ActionResult。由于是为了处理Book类型，在构造函数中添加了Book类型的参数，并将该参数赋值给属性Content。重写ExecuteResultAsync方法，对应JsonResultExecutor，还需要自定义一个BookResultExecutor。代码如下：

```csharp
public class BookResultExecutor : IActionResultExecutor<BookResult>
{
    private const string DefaultContentType = "text/plain; charset=utf-8";
    private readonly IHttpResponseStreamWriterFactory _httpResponseStreamWriterFactory;

    public BookResultExecutor(IHttpResponseStreamWriterFactory httpResponseStreamWriterFactory)
    {
        _httpResponseStreamWriterFactory = httpResponseStreamWriterFactory;
    }

    private static string FormatToString(Book book)
    {
        return string.Format("Book Code:[{0}]|Book Name:<{1}>", book.Code, book.Name);
    }

        /// <inheritdoc />
    public virtual async Task ExecuteAsync(ActionContext context, BookResult result)
    {
        if (context == null)
        {
            throw new ArgumentNullException(nameof(context));
        }

        if (result == null)
        {
            throw new ArgumentNullException(nameof(result));
        }

        var response = context.HttpContext.Response;
        string resolvedContentType;
        Encoding resolvedContentTypeEncoding;
        ResponseContentTypeHelper.ResolveContentTypeAndEncoding(
            result.ContentType,
            response.ContentType,
            DefaultContentType,
            out resolvedContentType,
            out resolvedContentTypeEncoding);
        response.ContentType = resolvedContentType;

        if (result.StatusCode != null)
        {
            response.StatusCode = result.StatusCode.Value;
        }

        string content = FormatToString(result.Content);
        if (result.Content != null)
        {
            response.ContentLength = resolvedContentTypeEncoding.GetByteCount(content);
            using (var textWriter = _httpResponseStreamWriterFactory.CreateWriter(response.Body, resolvedContentTypeEncoding))
            {
                await textWriter.WriteAsync(content);
                await textWriter.FlushAsync();
            }
        }
    }
}
```

这里定义了默认的ContentType 类型，采用了文本格式，即"text/plain; charset=utf-8"，这会在请求结果的Header中出现。为了特殊说明这个格式，也可以自定义一个特殊类型，例如"text/book; charset=utf-8"，这需要项目中提前约定好。定义了一个FormatToString方法用于将Book类型的数据格式化。最终将格式化的数据写入Response.Body中。

这个BookResultExecutor定义之后，需要在依赖注入中（Startup文件中的ConfigureServices方法）注册：

```csharp
public void ConfigureServices(IServiceCollection services)
{
    //省略部分代码
    services.TryAddSingleton<IActionResultExecutor<BookResult>, BookResultExecutor>();
}
```

至此，这个自定义的BookResult就可以被使用了，例如下面代码所示的Action：

```csharp
public BookResult GetBookResult()
{
    return new BookResult(new Book() { Code = "1001", Name = "ASP" });
}
```

用Fiddler访问这个Action测试一下,返回结果如下：

```csharp
Book Code:[1001]|Book Name:<ASP>
```

Header值：

```csharp
Content-Length: 32
Content-Type: text/book; charset=utf-8
```

这是自定义了Content-Type的结果。

## 3.  自定义格式化类

对于上一节的例子，也可以对照JsonOutputFormatter来自定义一个格式化类来实现。将新定义一个名为BookOutputFormatter的类，也如同JsonOutputFormatter一样继承TextOutputFormatter。代码如下：

```csharp
public class BookOutputFormatter : TextOutputFormatter
{
    public BookOutputFormatter()
    {
        SupportedEncodings.Add(Encoding.UTF8);
        SupportedEncodings.Add(Encoding.Unicode);
        SupportedMediaTypes.Add("text/book");
    }

    public override bool CanWriteResult(OutputFormatterCanWriteContext context)
    {
        if (context == null)
        {
            throw new ArgumentNullException(nameof(context));
        }

        if (context.ObjectType == typeof(Book) || context.Object is Book)
        {
            return base.CanWriteResult(context);
        }

            return false;
    }

        private static string FormatToString(Book book)
    {
        return string.Format("Book Code:[{0}]|Book Name:<{1}>",book.Code,book.Name);
    }

    public override async Task WriteResponseBodyAsync(OutputFormatterWriteContext context, Encoding selectedEncoding)
    {
        if (context == null)
        {
            throw new ArgumentNullException(nameof(context));
        }

            if (selectedEncoding == null)
        {
            throw new ArgumentNullException(nameof(selectedEncoding));
        }

        var valueAsString = FormatToString(context.Object as Book);
        if (string.IsNullOrEmpty(valueAsString))
        {
            await Task.CompletedTask;
        }

        var response = context.HttpContext.Response;
        await response.WriteAsync(valueAsString, selectedEncoding);
    }
}
```

首先在构造函数中定义它所支持的字符集和Content-type类型。重写CanWriteResult方法，这是用于确定它是否能处理对应的请求返回结果。可以在此方法中做多种判断，最终返回bool类型的结果。本例比较简单，仅是判断返回的结果是否为Book类型。同样定义了FormatToString方法用于请求结果的格式化。最后重写WriteResponseBodyAsync方法，将格式化后的结果写入Response.Body中。

BookOutputFormatter定义之后也需要注册到系统中去，例如如下代码：

```csharp
services.AddMvc(
    options =>
    {
        options.OutputFormatters.Insert(0,new BookOutputFormatter());
    }
)
```

这里采用了Insert方法，也就是将其插入了OutputFormatters集合的第一个。所以在筛选OutputFormatters的时候，它也是第一个。此时的OutputFormatters如下图 3

 ![](/blogimages/ASPNETCore2_21/548134-20190912144421309-1858424000.png)

图 3

通过Fiddler测试一下，以第一节返回Book类型的第4个例子为例：

```csharp
public Book GetModel()
{
    return new Book() { Code = "1001", Name = "ASP" };
}
```

当设定accept: text/book或者未设定accept的时候，采用了自定义的BookOutputFormatter，返回结果为：

```csharp
Book Code:[1001]|Book Name:<ASP>
```

Content-Type值是：Content-Type: text/book; charset=utf-8。

当设定accept: application/json的时候，返回JSON，值为：

```json
{"code":"1001","name":"ASP"}
```
Content-Type值是：Content-Type: application/json; charset=utf-8。

这是由于BookOutputFormatter类型排在了JsonOutputFormatter的前面，所以对于Book类型会首先采用BookOutputFormatter，当客户端通过Accept方式要求返回结果为JSON的时候，才采用了JSON类型。测试一下服务端的要求。将这个Action添加Produces设置，代码如下：

```csharp
[Produces("application/json")]
public Book GetModel()
{
    return new Book() { Code = "1001", Name = "ASP" };
}
```

此时无论设定accept: text/book或者未设定accept的情况，都会按照JSON的方式返回结果。这也验证了第二节关于服务端和客户端“协商”的规则。

## 4. 添加XML类型支持

第三、四节通过自定义的方式实现了特殊格式的处理，在项目中常见的格式还有XML，这在ASP.NET Core中没有做默认支持。如果需要XML格式的支持，可以通过NuGet添加相应的包。

在NuGet中搜索并安装Microsoft.AspNetCore.Mvc.Formatters.Xml，如下图 4

 ![](/blogimages/ASPNETCore2_21/548134-20190912144441812-329832628.png)

图 4

不需要像BookOutputFormatter那样都注册方式，系统提供了注册方法：

```csharp
services.AddMvc().AddXmlSerializerFormatters()；
```

或者

```csharp
services.AddMvc().AddXmlDataContractSerializerFormatters();
```

分别对应了两种格式化程序：

```csharp
System.Xml.Serialization.XmlSerializer；
System.Runtime.Serialization.DataContractSerializer；
```

二者的区别就不在这里描述了。注册之后，就可以通过在请求的Header中通过设置“accept: application/xml”来获取XML类型的结果了。访问上一节的返回结果类型为Book的例子，返回的结果如下：

```csharp
<Book xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <Code>1001</Code>
    <Name>ASP</Name>
</Book>
```

Content-Type值是：Content-Type: application/xml; charset=utf-8。