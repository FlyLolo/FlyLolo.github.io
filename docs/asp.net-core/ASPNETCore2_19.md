---
title: 十九. Action参数的映射与模型绑定
date: 2019-02-27
tags:
 - ASP.NET Core
categories:
 -  .NET
---

 前文说道了Action的激活，这里有个关键的操作就是Action参数的映射与模型绑定，这里即涉及到简单的string、int等类型，也包含Json等复杂类型，本文详细分享一下这一过程。
## 1. 概述

 当客户端发出一个请求的时候，参数可能存在于URL中也可能是在请求的Body中，而参数类型也大不相同，可能是简单类型的参数，如字符串、整数或浮点数，也可能是复杂类型的参数，比如常见的Json、XML等，这些事怎么与目标Action的参数关联在一起并赋值的呢？

 故事依然是发生在通过路由确定了被请求的Action之后，invoker的创建与执行阶段（详见[Action的执行](https://www.cnblogs.com/FlyLolo/p/ASPNETCore2_17.html)）。

       invoker的创建阶段，创建处理方法，并根据目标Action的actionDescriptor获取到它的所有参数，分析各个参数的类型确定对应参数的绑定方法，

       invoker的执行阶段，调用处理方法，遍历参数逐一进行赋值。

        为了方便描述，创建一个测试Action如下，它有两个参数，下文以此为例进行描述。：

```csharp
public JsonResult Test([FromBody]User user,string note = "FlyLolo")
{
    return new JsonResult(user.Code + "|" + user.Name );
}
```

## 2. 准备阶段

###    1. 创建绑定方法

 当收到请求后，由路由系统确定了被访问的目标Action是我们定义的Test方法， 这时进入invoker的创建阶段，前文说过它有一个关键属性cacheEntry是由多个对象组装而成（发生在ControllerActionInvokerCache的GetCachedResult方法中），其中一个是propertyBinderFactory：

```csharp
var propertyBinderFactory = ControllerBinderDelegateProvider.CreateBinderDelegate(_parameterBinder,_modelBinderFactory,_modelMetadataProvider,actionDescriptor,_mvcOptions);
```

      看一下CreateBinderDelegate这个方法：

```csharp
public static ControllerBinderDelegate CreateBinderDelegate(ParameterBinder parameterBinder,IModelBinderFactory modelBinderFactory,  
              IModelMetadataProvider modelMetadataProvider, ControllerActionDescriptor actionDescriptor,  MvcOptions mvcOptions)
{
    //各种验证  略

    var parameterBindingInfo = GetParameterBindingInfo(modelBinderFactory,  modelMetadataProvider, actionDescriptor, mvcOptions);
    var propertyBindingInfo = GetPropertyBindingInfo(modelBinderFactory, modelMetadataProvider, actionDescriptor);
    if (parameterBindingInfo == null && propertyBindingInfo == null)
    {
        return null;
    }
    return Bind;

    async Task Bind(ControllerContext controllerContext, object controller, Dictionary<string, object> arguments)
    {
        //后文详细描述
    }
    }
```

      前文说过，invoker的创建阶段就是创建一些关键对象和一些用于执行的方法，而propertyBinderFactory 就是众多方法之中的一个，前文介绍它是一个用于参数绑定的Task，而没有详细说明，现在可以知道它被定义为一个名为Bind的Task，最终作为invoker的一部分等待被执行进行参数绑定。

###     2. 为每个参数匹配Binder

      上面的CreateBinderDelegate方法创建了两个对象parameterBindingInfo 和propertyBindingInfo ，顾名思义，一个用于参数一个用于属性。看一下parameterBindingInfo 的创建：

```csharp
private static BinderItem[] GetParameterBindingInfo(IModelBinderFactory modelBinderFactory,IModelMetadataProvider modelMetadataProvider,ControllerActionDescriptor actionDescriptor, MvcOptions mvcOptions)
{
    var parameters = actionDescriptor.Parameters;
    if (parameters.Count == 0)
    {
        return null;
    }
    var parameterBindingInfo = new BinderItem[parameters.Count];
    for (var i = 0; i < parameters.Count; i++)
    {
        var parameter = parameters[i];
　　　　　　　　　　//略。。。
        var binder = modelBinderFactory.CreateBinder(new ModelBinderFactoryContext
        {
            BindingInfo = parameter.BindingInfo,
            Metadata = metadata,
            CacheToken = parameter,
        });

        parameterBindingInfo[i] = new BinderItem(binder, metadata);
    }

    return parameterBindingInfo;
}
```

 可以看到parameterBindingInfo 本质是一个BinderItem[]

```csharp
private readonly struct BinderItem
{
    public BinderItem(IModelBinder modelBinder, ModelMetadata modelMetadata)
    {
        ModelBinder = modelBinder;
        ModelMetadata = modelMetadata;
    }

    public IModelBinder ModelBinder { get; }

    public ModelMetadata ModelMetadata { get; }
}
```

通过遍历目标Action的所有参数actionDescriptor.Parameters，根据参数逐一匹配一个对应定的处理对象BinderItem。

如本例，会匹配到两个Binder：

参数 user   ===>  {Microsoft.AspNetCore.Mvc.ModelBinding.Binders.BodyModelBinder}

参数 note  ===>   {Microsoft.AspNetCore.Mvc.ModelBinding.Binders.SimpleTypeModelBinder}

<span style="color: #ff6600;">这是如何匹配的呢</span>，系统定义了一系列provider，如下图

![](/blogimages/ASPNETCore2_19/548134-20190225170716368-1355631770.png)

 图一

会遍历他们分别与当前参数做匹配：

```csharp
for (var i = 0; i < _providers.Length; i++)
{
    var provider = _providers[i];
    result = provider.GetBinder(providerContext);
    if (result != null)
    {
        break;
    }
}
```

同样以这两个Binder为例看一下，**BodyModelBinderProvider**：

```csharp
public IModelBinder GetBinder(ModelBinderProviderContext context)
{
    if (context == null)
    {
        throw new ArgumentNullException(nameof(context));
    }

    if (context.BindingInfo.BindingSource != null &&
        context.BindingInfo.BindingSource.CanAcceptDataFrom(BindingSource.Body))
    {
        if (_formatters.Count == 0)
        {
            throw new InvalidOperationException(Resources.FormatInputFormattersAreRequired(
                typeof(MvcOptions).FullName,
                nameof(MvcOptions.InputFormatters),
                typeof(IInputFormatter).FullName));
        }

        return new BodyModelBinder(_formatters, _readerFactory, _loggerFactory, _options);
    }

    return null;
}
```

BodyModelBinder的主要判断依据是BindingSource.Body  也就是user参数我们设置了[FromBody]。

同理SimpleTypeModelBinder的判断依据是 `<span style="color: #0000ff;">if` (!context.Metadata.IsComplexType)</span> 。

找到对应的provider后，则会由该provider来new 一个 ModelBinder返回，也就有了上文的BodyModelBinder和SimpleTypeModelBinder。

<span style="color: #ff6600;">小结：至此前期准备工作已经完成，这里创建了三个重要的对象： </span>

<span style="color: #ff6600;">1. Task Bind() ，用于绑定的方法，并被封装到了invoker内的CacheEntry中。</span>

<span style="color: #ff6600;">2. parameterBindingInfo ：本质是一个BinderItem[]，其中的BinderItem数量与Action的参数数量相同。</span>

<span style="color: #ff6600;">3. propertyBindingInfo：类似parameterBindingInfo， 用于属性绑定，下面详细介绍。</span>

 ![](/blogimages/ASPNETCore2_19/548134-20190226104626545-654318007.png)

 图二

### 3. 执行阶段

 从上一节的小结可以猜到，执行阶段就是调用Bind方法，利用创建的parameterBindingInfo和propertyBindingInfo将请求发送来的参数处理后赋值给Action对应的参数。

 同样，这个阶段发生在invoker（即ControllerActionInvoker）的InvokeAsync()阶段，当调用到它的Next方法的时候，首先第一步State为ActionBegin的时候就会调用BindArgumentsAsync()方法，如下

```csharp
private Task Next(ref State next, ref Scope scope, ref object state, ref bool isCompleted)
{
    switch (next)
    {
        case State.ActionBegin:
            {
　　　　　　　　　　　　　　//略。。。
                _arguments = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);

                var task = BindArgumentsAsync();
            }
```

而BindArgumentsAsync()方法会调用上一节创建的_cacheEntry.ControllerBinderDelegate，也就是Task Bind() 方法

```csharp
private Task BindArgumentsAsync()
{
    // 略。。。  

return _cacheEntry.ControllerBinderDelegate(_controllerContext, _instance, _arguments);
}
```

上一节略了，现在详细看一下这个方法，

```csharp
async Task Bind(ControllerContext controllerContext, object controller, Dictionary<string, object> arguments)
{
    var valueProvider = await CompositeValueProvider.CreateAsync(controllerContext);
    var parameters = actionDescriptor.Parameters;

    for (var i = 0; i < parameters.Count; i++) //遍历参数集和，逐一处理
    {
        var parameter = parameters[i];
        var bindingInfo = parameterBindingInfo[i];
        var modelMetadata = bindingInfo.ModelMetadata;

        if (!modelMetadata.IsBindingAllowed)
        {
            continue;
        }

        var result = await parameterBinder.BindModelAsync(
            controllerContext,
            bindingInfo.ModelBinder,
            valueProvider,
            parameter,
            modelMetadata,
            value: null);

        if (result.IsModelSet)
        {
            arguments[parameter.Name] = result.Model;
        }
    }

    var properties = actionDescriptor.BoundProperties;
    for (var i = 0; i < properties.Count; i++)
    //略
}
```

 主体就是两个for循环，分别用于处理参数和属性，依然是以参数处理为例说明。 

 依然是先获取到Action所有的参数，然后进入for循环进行遍历，通过parameterBindingInfo[i]获取到参数对应的BinderItem，这些都准备好后调用parameterBinder.BindModelAsync()方法进行参数处理和赋值。注意这里传入了 `bindingInfo.ModelBinder` ，在parameterBinder中会调用传入的modelBinder的BindModelAsync方法

```csharp
modelBinder.BindModelAsync(modelBindingContext);
```

而这个modelBinder是根据参数匹配的，也就是到现在已经将被处理对象交给了上文的BodyModelBinder、SimpleTypeModelBinder等具体的ModelBinder了。

 以BodyModelBinder为例：

```csharp
public async Task BindModelAsync(ModelBindingContext bindingContext)
{
    //略。。。  

    var formatterContext = new InputFormatterContext(httpContext,modelBindingKey,bindingContext.ModelState, bindingContext.ModelMetadata,  _readerFactory, allowEmptyInputInModelBinding);
        var formatter = (IInputFormatter)null;
        for (var i = 0; i < _formatters.Count; i++)
        {
            if (_formatters[i].CanRead(formatterContext))
            {
                formatter = _formatters[i];
                _logger?.InputFormatterSelected(formatter, formatterContext);
                break;
            }
            else
            {
                _logger?.InputFormatterRejected(_formatters[i], formatterContext);
            }
        }  

    var result = await formatter.ReadAsync(formatterContext);

    //略。。。

}
```

       部分代码已省略，剩余部分可以看到，这里像上文匹配provider一样，会遍历一个名为_formatters的集和，通过子项的CanRead方法来确定是否可以处理这样的formatterContext。若可以，则调用该formatter的ReadAsync()方法进行处理。这个_formatters集和默认有两个Formatter， `Microsoft.AspNetCore.Mvc.Formatters.JsonPatchInputFormatter}` 和 ` Microsoft.AspNetCore.Mvc.Formatters.JsonInputFormatter` , JsonPatchInputFormatter的判断逻辑是这样的

```csharp
if (!typeof(IJsonPatchDocument).GetTypeInfo().IsAssignableFrom(modelTypeInfo) ||
                    !modelTypeInfo.IsGenericType)
{
    return false;
}
```

 它会判断请求的类型是否为IJsonPatchDocument，JsonPatch见本文后面的备注，回到本例，我们经常情况遇到的还是用JsonInputFormatter，此处它会被匹配到。它继承自TextInputFormatter ， TextInputFormatter 又继承自 InputFormatter，JsonInputFormatter未重写CanRead方法，采用InputFormatter的CanRead方法。

```csharp
public virtual bool CanRead(InputFormatterContext context)
{
    if (SupportedMediaTypes.Count == 0)
    {
        var message = Resources.FormatFormatter_NoMediaTypes(GetType().FullName, nameof(SupportedMediaTypes));
        throw new InvalidOperationException(message);
    }

    if (!CanReadType(context.ModelType))
    {
        return false;
    }

    var contentType = context.HttpContext.Request.ContentType;
    if (string.IsNullOrEmpty(contentType))
    {
        return false;
    }
    return IsSubsetOfAnySupportedContentType(contentType);
}
```

 例如要求ContentType不能为空。本例参数为 `[FromBody]User user` ，并标识了 `content-type: application/json` ，通过CanRead验证后，

```csharp
public override async Task<InputFormatterResult> ReadRequestBodyAsync(InputFormatterContext context,Encoding encoding)
{
    //略。。。。using (var streamReader = context.ReaderFactory(request.Body, encoding))
    {
        using (var jsonReader = new JsonTextReader(streamReader))
        {
            jsonReader.ArrayPool = _charPool;
            jsonReader.CloseInput = false;
　　　　　　　　　　　　//略。。var type = context.ModelType;
            var jsonSerializer = CreateJsonSerializer();
            jsonSerializer.Error += ErrorHandler;
            object model;
            try
            {
                model = jsonSerializer.Deserialize(jsonReader, type);
            }
            
　　　　　　　　　　　　//略。。。
        }
    }
}
```

 可以看到此处就是将收到的请求的内容Deserialize，获取到一个model返回。此处的jsonSerializer是 `Newtonsoft.Json.JsonSerializer` ，系统默认采用的json处理组件是Newtonsoft。model返回后，被赋值给对应的参数，至此赋值完毕。

<span style="color: #ff6600;">小结：本阶段的工作是获取请求参数的值并赋值给Action的对应参数的过程。由于参数不同，会分配到一些不同的处理方法中处理。例如本例涉及到的provider（图一）、不同的ModelBinder（BodyModelBinder和SimpleTypeModelBinder）、不同的Formatter等等，实际项目中还会遇到其他的类型，这里不再赘述。</span>

<span style="color: #ff6600;">而文中有两个需要单独说明的，在后面的小节里说一下。 </span>

### 4. propertyBindingInfo

 上文提到了但没有介绍，它主要用于处理Controller的属性的赋值，例如：

```csharp
public class FlyLoloController : Controller
{
    [ModelBinder]
    public string Key { get; set; }

    //other ...
}
```

有一个属性Key被标记为[ModelBinder]，它会在Action被请求的时候，像给参数赋值一样赋值，处理方式也类似，不再描述。

### 5. JsonPatch

上文中提到了JsonPatchInputFormatter，简要说一下JsonPatch，可以理解为操作json的文档，比如上文的User类是这样的：

```csharp
public class User
{
    public string Code { get; set; }
    public string Name { get; set; }  

    //other ...
}
```

 现在我只想修改它的Name属性，默认情况下我仍然会需要提交这样的json

```json
{"Code":"001","Name":"张三", .........}
```

 这不科学，从省流量的角度来说也觉得太多了，用JsonPatch可以这样写

```csharp
[
    { "op" : "replace", "path" : "/Name", "value" : "张三" }
]
```