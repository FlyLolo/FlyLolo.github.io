---
title: 二十四. Options模式的配置
date: 2019-09-27
tags:
 - ASP.NET Core
categories:
 -  .NET
---

上一章讲到了配置的用法及内部处理机制，对于配置，ASP.NET Core还提供了一种Options模式。

## 1. Options的使用

上一章有个配置的绑定的例子，可以将配置绑定到一个Theme实例中。也就是在使用对应配置的时候，需要进行一次绑定操作。而Options模式提供了更直接的方式，并且可以通过依赖注入的方式提供配置的读取。**下文中称每一条Options配置为Option。**

### A.简单的不为Option命名的方式

依然采用这个例子，在appsettings.json中存在这样的配置：

```csharp
{
    "Theme": {
    "Name": "Blue",
    "Color": "#0921DC"
    }
}
```

修改一下ValueController，代码如下：

```csharp
public class ValuesController : Controller
{
    private IOptions<Theme> _options = null;
    public ValuesController(IOptions<Theme> options)
    {
        _options = options;
    }

    public ContentResult GetOptions()
    {
        return new ContentResult() { Content = $"options:{ _options.Value.Name}" };
    }
}
```

依然需要在Startup文件中做注册：

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.Configure<Theme>(Configuration.GetSection("Theme"));

    services.AddControllersWithViews();  //3.0中启用的新方法
}
```

请求这个Action，获取到的结果为：

```csharp
options:Blue
```

这样就可以在需要使用该配置的时候通过依赖注入的方式使用了。但有个疑问，这里将“Theme”类型绑定了这样的配置，但如果有多个这样的配置呢？就如同下面这样的配置的时候：

```csharp
"Themes": [
    {
        "Name": "Blue",
        "Color": "#0921DC"
    },
    {
        "Name": "Red",
        "Color": "#FF4500"
    }
]
```

在这样的情况下，存在多个Theme的配置，这样对于之前这种依赖注入的方式就不行了。这时系统提供了将注入的Options进行命名的方法。

### B.为Option命名的方式

首先需要在Startup文件中注册的时候对其命名，添加如下两条注册代码：

```csharp
services.Configure<Theme>("ThemeBlue", Configuration.GetSection("Themes:0"));
services.Configure<Theme>("ThemeRed" , Configuration.GetSection("Themes:1"));
```

修改`ValueController`代码，添加`IOptionsMonitor<Theme>`和`IOptionsSnapshot<Theme>`两种新的注入方式如下：

```csharp
private IOptions<Theme> _options = null;
private IOptionsMonitor<Theme> _optionsMonitor = null;
private IOptionsSnapshot<Theme> _optionsSnapshot = null;
public ValuesController(IOptions<Theme> options, IOptionsMonitor<Theme> optionsMonitor, IOptionsSnapshot<Theme> optionsSnapshot)
{
    _options = options;
    _optionsMonitor = optionsMonitor;
    _optionsSnapshot = optionsSnapshot;
}

public ContentResult GetOptions()
{
    return new ContentResult() { Content = $"options:{_options.Value.Name}," +
        $"optionsSnapshot:{ _optionsSnapshot.Get("ThemeBlue").Name }," +
        $"optionsMonitor:{_optionsMonitor.Get("ThemeRed").Name}" };
}
```

请求这个Action，获取到的结果为：

```csharp
options:Blue,optionsSnapshot:Red,optionsMonitor:Gray
```

新增的两种注入方式通过Options的名称获取到了对应的Options。为什么是两种呢？它们有什么区别？不知道有没有读者想到上一章配置的重新加载功能。在配置注册的时候，有个`reloadOnChange`选项，如果它被设置为true的，当对应的数据源发生改变的时候，会进行重新加载。而Options怎么能少了这样的特性呢。

### C.Option的自动更新与生命周期

为了验证这三种Options的读取方式的特性，修改Theme类，添加一个Guid字段，并在构造方法中对其赋值，代码如下：

```csharp
public class Theme
{
    public Theme()
    {
        Guid = Guid.NewGuid();
    }
    public Guid Guid { get; set; }
    public string Name { get; set; }
    public string Color { get; set; }
}
```

修改上例中的名为GetOptions的Action的代码如下：

```csharp
public ContentResult GetOptions()
{
    return new ContentResult()
    {
        Content = $"options:{_options.Value.Name}|{_options.Value.Guid}," +
        $"optionsSnapshot:{ _optionsSnapshot.Get("ThemeBlue").Name }|{_optionsSnapshot.Get("ThemeBlue").Guid}," +
        $"optionsMonitor:{_optionsMonitor.Get("ThemeRed").Name}|{_optionsMonitor.Get("ThemeRed").Guid}"
    };
}
```

请求这个Action，返回结果如下：

```csharp
options:Blue|ad328f15-254f-4505-a79f-4f27db4a393e,optionsSnapshot:Red|dba5f550-29ca-4779-9a02-781dd17f595a,optionsMonitor:Gray|a799fa41-9444-45dd-b51b-fcd15049f98f
```

刷新页面，返回结果为：

```csharp
options:Blue|ad328f15-254f-4505-a79f-4f27db4a393e,optionsSnapshot:Red|a2350cb3-c156-4f71-bb2d-25890fe08bec,optionsMonitor:Gray|a799fa41-9444-45dd-b51b-fcd15049f98f
```

可见IOptions和IOptionsMonitor两种方式获取到的Name值和Guid值均未改变，而通过IOptionsSnapshot方式获取到的Name值未改变，但Guid值发生了改变，每次刷新页面均会改变。这类似前面讲依赖注入时做测试的例子，现在猜测Guid未改变的IOptions和IOptionsMonitor两种方式是采用了Singleton模式，而Guid发生改变的IOptionsSnapshot方式是采用了Scoped或Transient模式。如果在这个Action中多次采用IOptionsSnapshot读取`_optionsSnapshot.Get("ThemeBlue").Guid`的值，会发现同一次请求的值是相同的，不同请求之间的值是不同的，也就是IOptionsSnapshot方式使采用了Scoped模式（此验证示例比较简单，请读者自行修改代码验证）。

在这样的情况下，修改三种获取方式对应的配置项的Name值，例如分别修改为“Blue1”、“Red1”和“Gray1”，再次多次刷新页面查看返回值，会发现如下情况：

IOptions方式：Name和Guid的值始终未变。Name值仍为Blue。

IOptionsSnapshot方式：Name值变为Red1，Guid值单次请求内相同，每次刷新之间不同。

IOptionsMonitor方式：只有修改配置值后第一次刷新的时候将Name值变为了Gray1，Guid未改变。之后多次刷新，这两个值均未做改变。

总结：IOptions和IOptionsMonitor两种方式采用了Singleton模式，但区别在于IOptionsMonitor会监控对应数据源的变化，如果发生了变化则更新实例的配置值，但不会重新提供新的实例。IOptionsSnapshot方式采用了Scoped模式每次请求采用同一个实例，在下一次请求的时候获取到的是一个新的实例，所以如果数据源发生了改变，会读取到新的值。先大概记一下这一的情况，在下文剖析IOptions的内部处理机制的时候就会明白为什么会这样。

### D.数据更新提醒

IOptionsMonitor方式还提供了一个OnChange方法，当数据源发生改变的时候会触发它，所以如果想在这时候做点什么，可以利用这个方法实现。示例代码：

```csharp
_optionsMonitor.OnChange((theme,name)=> { Console.WriteLine(theme.Name +"-"+ name); });
```

### E.不采用Configuration配置作为数据源的方式

上面的例子都是采用了读取配置的方式，实际上Options模式和上一章的Configuration配置方式使分开的，读取配置只不过是Options模式的一种实现方式，例如可以不使用Configuration中的数据，直接通过如下代码注册：

```csharp
services.Configure<Theme>("ThemeBlack", theme => {
    theme.Color = "#000000";
    theme.Name = "Black";
});
```

### F.ConfigureAll方法

系统提供了一个ConfigureAll方法，可以将所有对应的实例统一设置。例如如下代码：

```csharp
services.ConfigureAll<Theme>(theme => {
    theme.Color = "#000000";
    theme.Name = "Black2";
});
```

此时无论通过什么名称去获取Theme的实例，包括不存在对应设置的名称，获取到的值都是本次通过ConfigureAll设置的值。

### G.PostConfigure和PostConfigureAll方法

这两个方法和Configure、ConfigureAll方法类似，只是它们会在Configure、ConfigureAll之后执行。

### H.多个Configure、ConfigureAll、PostConfigure和PostConfigureAll的执行顺序

可以这样理解，每个Configure都是去修改一个名为其设置的名称的变量，以如下代码为例：

```csharp
services.Configure<Theme>("ThemeBlack", theme => {
    theme.Color = "#000000";
    theme.Name = "Black";
});
```

这条设置就是去修改（注意是修改而不是替换）一个名为"ThemeBlack"的Theme类型的变量，如果该变量不存在，则创建一个Theme实例并赋值。这样就生成了一些变量名为“空字符串、“ThemeBlue”、“ThemeBlack”的变量（只是举例，忽略空字符串作为变量名不合法的顾虑）”。

依次按照代码的顺序执行，这时候如果后面的代码中出现同名的Configure，则修改对应名称的变量的值。如果是ConfigureAll方法，则修改所有类型为Theme的变量的值。

而PostConfigure和PostConfigureAll则在Configure和ConfigureAll之后执行，即使Configure的代码写在了PostConfigure之后也是一样。

至于为什么会是这样的规则，下一节会详细介绍。

## 2. 内部处理机制解析

### A. 系统启动阶段，依赖注入

上一节的例子中涉及到了三个接口IOptions、IOptionsSnapshot和IOptionsMonitor，那么就从这三个接口说起。既然Options模式是通过这三个接口的泛型方式注入提供服务的，那么在这之前系统就需要将它们对应的实现注入到依赖注入容器中。这发生在系统启动阶段创建IHost的时候，这时候HostBuilder的Build方法中调用了一个services.AddOptions()方法，这个方法定义在OptionsServiceCollectionExtensions中，代码如下：

```csharp
public static class OptionsServiceCollectionExtensions
{
    public static IServiceCollection AddOptions(this IServiceCollection services)
    {
        if (services == null)
        {
            throw new ArgumentNullException(nameof(services));
        }

        services.TryAdd(ServiceDescriptor.Singleton(typeof(IOptions<>), typeof(OptionsManager<>)));
        services.TryAdd(ServiceDescriptor.Scoped(typeof(IOptionsSnapshot<>), typeof(OptionsManager<>)));
        services.TryAdd(ServiceDescriptor.Singleton(typeof(IOptionsMonitor<>), typeof(OptionsMonitor<>)));
        services.TryAdd(ServiceDescriptor.Transient(typeof(IOptionsFactory<>), typeof(OptionsFactory<>)));
        services.TryAdd(ServiceDescriptor.Singleton(typeof(IOptionsMonitorCache<>), typeof(OptionsCache<>)));
        return services;
    }

    public static IServiceCollection Configure<TOptions>(this IServiceCollection services, Action<TOptions> configureOptions) where TOptions : class
        => services.Configure(Options.Options.DefaultName, configureOptions);

    public static IServiceCollection Configure<TOptions>(this IServiceCollection services, string name, Action<TOptions> configureOptions)
        where TOptions : class
    {
        //省略非空验证代码

        services.AddOptions();
        services.AddSingleton<IConfigureOptions<TOptions>>(new ConfigureNamedOptions<TOptions>(name, configureOptions));
        return services;
    }

    public static IServiceCollection ConfigureAll<TOptions>(this IServiceCollection services, Action<TOptions> configureOptions) where TOptions : class
        => services.Configure(name: null, configureOptions: configureOptions);
//省略部分代码
}
```

可见这个AddOptions方法的作用就是进行服务注入，IOptions<>、IOptionsSnapshot<>对应的实现是`OptionsManager<>`，只是分别采用了Singleton和Scoped两种生命周期模式，`IOptionsMonitor<>`对应的实现是`OptionsMonitor<>`，同样为Singleton模式，这也验证了上一节例子中的猜想。除了上面提到的三个接口外，还有`IOptionsFactory<>`和`IOptionsMonitorCache<>`两个接口，这也是Options模式中非常重要的两个组成部分，接下来的内容中会用到。

另外的两个Configure方法就是上一节例子中用到的将具体的Theme注册到Options中的方法了。二者的区别就是是否为配置的option命名，而第一个Configure方法就未命名的方法，通过上面的代码可知它实际上是传入了一个默认的Options.Options.DefaultName作为名称，这个默认值是一个空字符串，也就是说，未命名的Option相当于是被命名为空字符串。最终都是按照已命名的方式也就是第二个Configure方法进行处理。还有一个ConfigureAll方法，它是传入了一个null作为Option的名称，也是交由第二个Configure处理。

在第二个Configure方法中仍调用了一次AddOptions方法，然后才是将具体的类型进行注入。AddOptions方法中采用的都是TryAdd方法进行注入，已被注入的不会被再次注入。接下来注册了一个`IConfigureOptions<TOptions>`接口，对应的实现是`ConfigureNamedOptions<TOptions>(name, configureOptions)`，它的代码如下：

```csharp
public class ConfigureNamedOptions<TOptions> : IConfigureNamedOptions<TOptions> where TOptions : class
{
    public ConfigureNamedOptions(string name, Action<TOptions> action)
    {
        Name = name;
        Action = action;
}

    public string Name { get; }
    public Action<TOptions> Action { get; }

    public virtual void Configure(string name, TOptions options)
    {
        if (options == null)
        {
            throw new ArgumentNullException(nameof(options));
        }

        // Null name is used to configure all named options.
        if (Name == null || name == Name)
        {
            Action?.Invoke(options);
        }
    }

    public void Configure(TOptions options) => Configure(Options.DefaultName, options);
}
```

它在构造方法中存储了配置的名称（Name）和创建方法（Action），它的两个Configure方法用于在获取Options的值的时候执行对应的Action来创建实例（例如示例中的Theme）。在此时不会被执行。所以在此会出现3中类型的ConfigureNamedOptions，分别是Name值为具体值的、Name值为为空字符串的和Name值为null的。这分别对应了第一节的例子中的为Option命名的Configure方法、不为Option命名的Configure方法、以及ConfigureAll方法。

此处用到的OptionsServiceCollectionExtensions和ConfigureNamedOptions对应的是通过代码直接注册Option的方式，例如第一节例子中的如下方式：

```csharp
services.Configure<Theme>("ThemeBlack", theme => { new Theme { Color = "#000000", Name = "Black" }; });
```

如果是以Configuration作为数据源的方式，例如如下代码

```csharp
services.Configure<Theme>("ThemeBlue", Configuration.GetSection("Themes:0"));
```

用到的是OptionsServiceCollectionExtensions和ConfigureNamedOptions这两个类的子类，分别为OptionsConfigurationServiceCollectionExtensions和NamedConfigureFromConfigurationOptions两个类，通过它们的名字也可以知道是专门用于采用Configuration作为数据源用的，代码类似，只是多了一条关于IOptionsChangeTokenSource的依赖注入，作用是将Configuration的关于数据源变化的监听和Options的关联起来，当数据源发生改变的时候可以及时更新Options中的值，主要的Configure方法代码如下：

```csharp
public static IServiceCollection Configure<TOptions>(this IServiceCollection services, string name, IConfiguration config, Action<BinderOptions> configureBinder)
        where TOptions : class
{
    //省略验证代码

    services.AddOptions();
    services.AddSingleton<IOptionsChangeTokenSource<TOptions>>(new ConfigurationChangeTokenSource<TOptions>(name, config));
    return services.AddSingleton<IConfigureOptions<TOptions>>(new NamedConfigureFromConfigurationOptions<TOptions>(name, config, configureBinder));
}
```

同样还有PostConfigure和PostConfigureAll方法，和Configure、ConfigureAll方法类似，只不过注入的类型为`IPostConfigureOptions<TOptions>`。

### B. Options值的获取

Option值的获取也就是从依赖注入容器中获取相应实现的过程。通过依赖注入阶段，已经知道了IOptions<>和IOptionsSnapshot<>对应的实现是`OptionsManager<>`，就以`OptionsManager<>`为例看一下依赖注入后的服务提供过程。`OptionsManager<>`代码如下：

```csharp
public class OptionsManager<TOptions> : IOptions<TOptions>, IOptionsSnapshot<TOptions> where TOptions : class, new()
{
    private readonly IOptionsFactory<TOptions> _factory;
    private readonly OptionsCache<TOptions> _cache = new OptionsCache<TOptions>();

    public OptionsManager(IOptionsFactory<TOptions> factory)
    {
        _factory = factory;
    }

    public TOptions Value
    {
        get
        {
            return Get(Options.DefaultName);
        }
    }

    public virtual TOptions Get(string name)
    {
        name = name ?? Options.DefaultName;
        return _cache.GetOrAdd(name, () => _factory.Create(name));
    }
}
```

它有`IOptionsFactory<TOptions>`和`OptionsCache<TOptions>`两个重要的成员。如果直接获取Value值，实际上是调用的另一个`Get(string name)`方法，传入了空字符串作为name值。所以最终值的获取还是在缓存中读取，这里的代码是`_cache.GetOrAdd(name, () => _factory.Create(name))`，即如果缓存中存在对应的值，则返回，如果不存在，则由_factory去创建。`OptionsFactory<TOptions>`的代码如下：

```csharp
public class OptionsFactory<TOptions> : IOptionsFactory<TOptions> where TOptions : class, new()
{
    private readonly IEnumerable<IConfigureOptions<TOptions>> _setups;
    private readonly IEnumerable<IPostConfigureOptions<TOptions>> _postConfigures;
    private readonly IEnumerable<IValidateOptions<TOptions>> _validations;

    public OptionsFactory(IEnumerable<IConfigureOptions<TOptions>> setups, IEnumerable<IPostConfigureOptions<TOptions>> postConfigures) : this(setups, postConfigures, validations: null)
    { }

    public OptionsFactory(IEnumerable<IConfigureOptions<TOptions>> setups, IEnumerable<IPostConfigureOptions<TOptions>> postConfigures, IEnumerable<IValidateOptions<TOptions>> validations)
    {
        _setups = setups;
        _postConfigures = postConfigures;
        _validations = validations;
    }

    public TOptions Create(string name)
    {
        var options = new TOptions();
        foreach (var setup in _setups)
        {
            if (setup is IConfigureNamedOptions<TOptions> namedSetup)
            {
                namedSetup.Configure(name, options);
            }
            else if (name == Options.DefaultName)
            {
                setup.Configure(options);
            }
        }
        foreach (var post in _postConfigures)
        {
            post.PostConfigure(name, options);
        }

        if (_validations != null)
        {
            var failures = new List<string>();
            foreach (var validate in _validations)
            {
                var result = validate.Validate(name, options);
                if (result.Failed)
                {
                    failures.AddRange(result.Failures);
                }
            }
            if (failures.Count > 0)
            {
                throw new OptionsValidationException(name, typeof(TOptions), failures);
            }
        }

        return options;
    }
}
```

主要看它的TOptions Create(string name)方法。这里会遍历它的_setups集合，这个集合类型为`IEnumerable<IConfigureOptions<TOptions>>`，在讲Options模式的依赖注入的时候已经知道，每一个Configure、ConfigureAll实际上就是向依赖注入容器中注册了一个`IConfigureOptions<TOptions>`，只是名称可能不同。而PostConfigure和PostConfigureAll方法注册的是`IPostConfigureOptions<TOptions>`类型，对应的就是_postConfigures集合。

首先会遍历_setups集合，调用`IConfigureOptions<TOptions>`的Configure方法，这个方法的主要代码就是：

```csharp
if (Name == null || name == Name)
{
    Action?.Invoke(options);
}
```

如果Name值为null，即对应的是ConfigureAll方法，则执行该Action。或者Name值和需要读取的值相同，则执行该Action。

_setups集合遍历之后，同样的机制遍历_postConfigures集合。这就是上一节关于Configure、ConfigureAll、PostConfigure和PostConfigureAll的执行顺序的验证。

最终返回对应的实例并写入缓存。这就是IOptions和IOptionsSnapshot两种模式的处理机制，接下来看一下IOptionsMonitor模式，它对应的实现是OptionsMonitor。代码如下：

```csharp
public class OptionsMonitor<TOptions> : IOptionsMonitor<TOptions> where TOptions : class, new()
{
    private readonly IOptionsMonitorCache<TOptions> _cache;
    private readonly IOptionsFactory<TOptions> _factory;
    private readonly IEnumerable<IOptionsChangeTokenSource<TOptions>> _sources;
    internal event Action<TOptions, string> _onChange;

    public OptionsMonitor(IOptionsFactory<TOptions> factory, IEnumerable<IOptionsChangeTokenSource<TOptions>> sources, IOptionsMonitorCache<TOptions> cache)
    {
        _factory = factory;
        _sources = sources;
        _cache = cache;

        foreach (var source in _sources)
        {
                var registration = ChangeToken.OnChange(
                        () => source.GetChangeToken(),
                        (name) => InvokeChanged(name),
                        source.Name);

                _registrations.Add(registration);        
        }
    }

    private void InvokeChanged(string name)
    {
        name = name ?? Options.DefaultName;
        _cache.TryRemove(name);
        var options = Get(name);
        if (_onChange != null)
        {
            _onChange.Invoke(options, name);
        }
    }

    public TOptions CurrentValue
    {
        get => Get(Options.DefaultName);
    }

    public virtual TOptions Get(string name)
    {
        name = name ?? Options.DefaultName;
        return _cache.GetOrAdd(name, () => _factory.Create(name));
    }

    public IDisposable OnChange(Action<TOptions, string> listener)
    {
        var disposable = new ChangeTrackerDisposable(this, listener);
        _onChange += disposable.OnChange;
        return disposable;
    }

    internal class ChangeTrackerDisposable : IDisposable
    {
        private readonly Action<TOptions, string> _listener;
        private readonly OptionsMonitor<TOptions> _monitor;

        public ChangeTrackerDisposable(OptionsMonitor<TOptions> monitor, Action<TOptions, string> listener)
        {
            _listener = listener;
            _monitor = monitor;
        }

        public void OnChange(TOptions options, string name) => _listener.Invoke(options, name);

        public void Dispose() => _monitor._onChange -= OnChange;
    }
}
```

大部分功能和OptionsManager类似，只是由于它是采用了Singleton模式，所以它是采用监听数据源改变并更新的模式。当通过Configuration作为数据源注册Option的时候，多了一条IOptionsChangeTokenSource的依赖注入。当数据源发生改变的时候更新数据并触发`OnChange(Action<TOptions, string> listener)`，在第一节的数据更新提醒中有相关的例子。