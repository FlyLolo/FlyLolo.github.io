---
title: 二十三. 配置的内部处理机制
date: 2019-09-23
tags:
 - ASP.NET Core
categories:
 -  .NET
---

上一章介绍了配置的多种数据源被注册、加载和获取的过程，本节看一下这个过程系统是如何实现的。([ASP.NET Core 系列目录](https://www.cnblogs.com/FlyLolo/p/ASPNETCore2_0.html))

## 1. 数据源的注册

在上一节介绍的数据源设置中，appsettings.json、命令行、环境变量三种方式是被系统自动加载的，这是因为系统在webHost.CreateDefaultBuilder(args)中已经为这三种数据源进了注册，那么就从这个方法说起。这个方法中同样调用了ConfigureAppConfiguration方法，代码如下：

```csharp
public static IWebHostBuilder CreateDefaultBuilder(string[] args)
{
    var builder = newWebHostBuilder();
    //省略部分代码
    builder.UseKestrel((builderContext, options) =>
        {
            options.Configure(builderContext.Configuration.GetSection("Kestrel"));
        })
        .ConfigureAppConfiguration((hostingContext, config) =>
        {
            var env = hostingContext.HostingEnvironment;
            config.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                    .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional:true, reloadOnChange: true);
            if(env.IsDevelopment())
            {
                var appAssembly = Assembly.Load(newAssemblyName(env.ApplicationName));
                if(appAssembly != null)
                {
                    config.AddUserSecrets(appAssembly, optional: true);
                }
            }

            config.AddEnvironmentVariables();
            if(args != null)
            {
                config.AddCommandLine(args);
            }
        })

        //省略部分代码

    return builder;
}
```


看一下其中的ConfigureAppConfiguration方法，加载的内容主要有四种，首先加载的是appsettings.json和appsettings.{env.EnvironmentName}.json两个JSON文件，关于env.EnvironmentName在前面的章节已经说过，常见的有Development、Staging 和 Production三种值，在我们开发调试时一般是Development，也就是会加载appsettings.json和appsettings. Development.json两个JSON文件。第二种加载的是用户机密文件，这仅限于Development状态下，会通过config.AddUserSecrets方法加载。第三种是通过config.AddEnvironmentVariables方法加载的环境变量，第四种是通过config.AddCommandLine方法加载的命令行参数。

注意：这里的ConfigureAppConfiguration方法这时候是不会被执行的，只是将这个方法作为一个`Action<WebHostBuilderContext, IConfigurationBuilder> configureDelegate`添加到了WebHostBuilder的_configureServicesDelegates属性中。configureServicesDelegates是一个`List<Action<WebHostBuilderContext, IConfigurationBuilder>>`类型的集合。对应代码如下：

```csharp
public IWebHostBuilder ConfigureAppConfiguration(Action<WebHostBuilderContext, IConfigurationBuilder> configureDelegate)
{
    if(configureDelegate == null)
    {
        throw new ArgumentNullException(nameof(configureDelegate));
    }

    _configureAppConfigurationBuilderDelegates.Add(configureDelegate);
    returnthis;
}
```

上一节的例子中，我们在`webHost.CreateDefaultBuilder(args)`方法之后再次调用ConfigureAppConfiguration方法添加了一些自定义的数据源，这个方法也是没有执行，同样被添加到了这个集合中。直到WebHostBuilder通过它的Build()方法创建WebHost的时候，才会遍历这个集合逐一执行。这段代码写在被Build()方法调用的BuildCommonServices()中：

```csharp
private IServiceCollection BuildCommonServices(out AggregateException hostingStartupErrors)
{
    //省略部分代码
    var builder = new ConfigurationBuilder()
        .SetBasePath(_hostingEnvironment.ContentRootPath)
        .AddConfiguration(_config);

    foreach (var configureAppConfiguration in _configureAppConfigurationBuilderDelegates)
    {
        configureAppConfiguration(_context, builder);
    }

    var configuration = builder.Build();
    services.AddSingleton<IConfiguration>(configuration);
    _context.Configuration = configuration;
//省略部分代码
    return services;
}
```

首先创建了一个ConfigurationBuilder对象，然后通过foreach循环逐一执行被添加到集合_configureAppConfigurationBuilderDelegates中的configureAppConfiguration方法，那么在执行的时候，这些不同的数据源是如何被加载的呢？这部分功能在namespace Microsoft.Extensions.Configuration命名空间中。

以appsettings.json对应的`config.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)`方法为例，进一步看一下它的实现方式。首先介绍的是IConfigurationBuilder接口，对应的实现类是ConfigurationBuilder，代码如下：

```csharp
public class ConfigurationBuilder : IConfigurationBuilder
{
    public IList<IConfigurationSource> Sources { get; } = new List<IConfigurationSource>();

    public IDictionary<string, object> Properties { get; } = new Dictionary<string, object>();

    public IConfigurationBuilder Add(IConfigurationSource source)
    {
        if (source == null)
        {
            throw new ArgumentNullException(nameof(source));
        }

        Sources.Add(source);
        return this;
    }
    //省略了IConfigurationRoot Build()方法，下文介绍
}
```

ConfigureAppConfiguration方法中调用的AddJsonFile方法来自JsonConfigurationExtensions类，代码如下：

```csharp
public static class JsonConfigurationExtensions
{
//省略部分代码

    public static IConfigurationBuilder AddJsonFile(this IConfigurationBuilder builder, IFileProvider provider, string path, bool optional, bool reloadOnChange)
    {
        if (builder == null)
        {
            throw new ArgumentNullException(nameof(builder));
        }
        if (string.IsNullOrEmpty(path))
        {
            throw new ArgumentException(Resources.Error_InvalidFilePath, nameof(path));
        }

        return builder.AddJsonFile(s =>
        {
            s.FileProvider = provider;
            s.Path = path;
            s.Optional = optional;
            s.ReloadOnChange = reloadOnChange;
            s.ResolveFileProvider();
        });
    }
    public static IConfigurationBuilder AddJsonFile(this IConfigurationBuilder builder, Action<JsonConfigurationSource> configureSource)
        => builder.Add(configureSource);
}
```

AddJsonFile方法会创建一个JsonConfigurationSource并通过ConfigurationBuilder的Add(IConfigurationSource source)方法将这个JsonConfigurationSource添加到ConfigurationBuilder的`IList<IConfigurationSource> Sources`集和中去。

同理，针对环境变量，存在对应的`EnvironmentVariablesExtensions`，会创建一个对应的`EnvironmentVariablesConfigurationSource`添加到`ConfigurationBuilder的IList<IConfigurationSource> Sources`集和中去。这样的还有`CommandLineConfigurationExtensions`和`CommandLineConfigurationSource`等，最终结果就是会根据数据源的加载顺序，生成多个XXXConfigurationSource对象（它们都直接或间接实现了IConfigurationSource接口）添加到ConfigurationBuilder的`IList<IConfigurationSource> Sources`集和中。

在Program文件的WebHost.CreateDefaultBuilder(args)方法中的ConfigureAppConfiguration方法被调用后，如果在CreateDefaultBuilder方法之后再次调用了ConfigureAppConfiguration方法并添加了数据源（如同上一节的例子），同样会生成相应的XXXConfigurationSource对象添加到ConfigurationBuilder的`IList<IConfigurationSource> Sources`集和中。

注意：这里不是每一种数据源生成一个XXXConfigurationSource，而是按照每次添加生成一个XXXConfigurationSource，并且遵循添加的先后顺序。例如添加多个JSON文件，会生成多个JsonConfigurationSource。

这些ConfigurationSource之间的关系如下图1：

 ![](/blogimages/ASPNETCore_23/548134-20190922215415518-186735720.png)

图1

到这里各种数据源的收集工作完成，都添加到了`ConfigurationBuilder`的`IList<IConfigurationSource> Sources`属性中。

回到BuildCommonServices方法中，通过foreach循环逐一执行了`configureAppConfiguration`方法获取到`IList<IConfigurationSource>`之后，下一句是`varconfiguration = builder.Build()`，这是调用`ConfigurationBuilder`的`Build()`方法创建了一个`IConfigurationRoot`对象。对应代码如下：

```csharp
public class ConfigurationBuilder : IConfigurationBuilder
{
    public IList<IConfigurationSource> Sources { get; } = new List<IConfigurationSource>();

    //省略部分代码

    public IConfigurationRoot Build()
    {
        var providers = new List<IConfigurationProvider>();
        foreach (var source in Sources)
        {
            var provider = source.Build(this);
            providers.Add(provider);
        }
        return new ConfigurationRoot(providers);
    }

}
```

这个方法主要体现了两个过程：首先，遍历`IList<IConfigurationSource> Sources`集合，主要调用其中的各个IConfigurationSource的Build方法创建对应的IConfigurationProvider，最终生成一个`List<IConfigurationProvider>`；第二，通过集合`List<IConfigurationProvider>`创建了`ConfigurationRoot`。`ConfigurationRoot`实现了`IConfigurationRoot`接口。

先看第一个过程，依然以`JsonConfigurationSource`为例，代码如下：

```csharp
public class JsonConfigurationSource : FileConfigurationSource
{
    public override IConfigurationProvider Build(IConfigurationBuilder builder)
    {
        EnsureDefaults(builder);
        return new JsonConfigurationProvider(this);
    }
}
```

JsonConfigurationSource会通过Build方法创建一个名为JsonConfigurationProvider的对象。通过JsonConfigurationProvider的名字可知，它是针对JSON类型的，也就是意味着不同类型的IConfigurationSource创建的IConfigurationProvider类型也是不一样的，对应图18‑4中的IConfigurationSource，生成的IConfigurationProvider关系如下图2。

 ![](/blogimages/ASPNETCore_23/548134-20190922215502406-289703191.png)

图2

系统中添加的多个数据源被转换成了一个个对应的ConfigurationProvider，这些ConfigurationProvider组成了一个ConfigurationProvider的集合。

再看一下第二个过程，ConfigurationBuilder的Build方法的最后一句是`return new ConfigurationRoot(providers)`，就是通过第一个过程创建的ConfigurationProvider的集合创建ConfigurationRoot。ConfigurationRoot代码如下：

```csharp
public class ConfigurationRoot : IConfigurationRoot
{
    private IList<IConfigurationProvider> _providers;
    private ConfigurationReloadToken _changeToken = new ConfigurationReloadToken();

    public ConfigurationRoot(IList<IConfigurationProvider> providers)
    {
        if (providers == null)
        {
            throw new ArgumentNullException(nameof(providers));
        }

        _providers = providers;
        foreach (var p in providers)
        {
            p.Load();
            ChangeToken.OnChange(() => p.GetReloadToken(), () => RaiseChanged());
        }
    }
//省略部分代码
}
```

可以看出，ConfigurationRoot的构造方法主要的作用就是将ConfigurationProvider的集合作为自己的一个属性的值，并遍历这个集合，逐一调用这些ConfigurationProvider的Load方法，并为ChangeToken的OnChange方法绑定数据源的改变通知和处理方法。


## 2. 数据源的加载

从图18‑5可知，所有类型数据源最终创建的*XXX*ConfigurationProvider都继承自ConfigurationProvider，所以它们都有一个Load方法和一个`IDictionary<string, string> `类型的Data 属性，它们是整个配置系统的重要核心。Load方法用于数据源的数据的读取与处理，而Data用于保存最终结果。通过逐一调用Provider的Load方法完成了整个配置系统的数据加载。

以JsonConfigurationProvider为例，它继承自FileConfigurationProvider，所以先看一下FileConfigurationProvider的代码：

```csharp
public abstract class FileConfigurationProvider : ConfigurationProvider
{
//省略部分代码
    private void Load(bool reload)
    {
        var file = Source.FileProvider?.GetFileInfo(Source.Path);
        if (file == null || !file.Exists)
        {
        //省略部分代码
        }
        else
        {
            if (reload)
            {
                Data = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            }
            using (var stream = file.CreateReadStream())
            {
                try
                {
                    Load(stream);
                }
                catch (Exception e)
                {
//省略部分代码
                }
            }
        }
        OnReload();
    }
    public override void Load()
    {
        Load(reload: false);
}
    public abstract void Load(Stream stream);
}
```

本段代码的主要功能就是读取文件生成stream，然后调用Load(stream)方法解析文件内容。从图18‑5可知，JsonConfigurationProvider、IniConfigurationProvider、XmlConfigurationProvider都是继承自FileConfigurationProvider，而对应JSON、INI、XML三种数据源来说，只是文件内容的格式不同，所以将通用的读取文件内容的功能交给了FileConfigurationProvider来完成，而这三个子类的ConfigurationProvider只需要将FileConfigurationProvider读取到的文件内容的解析即可。所以这个参数为stream 的Load方法写在JsonConfigurationProvider、IniConfigurationProvider、XmlConfigurationProvider这样的子类中，用于专门处理自身对应的格式的文件。

JsonConfigurationProvider代码如下：

```csharp
public class JsonConfigurationProvider : FileConfigurationProvider
{
    public JsonConfigurationProvider(JsonConfigurationSource source) : base(source) { }

    public override void Load(Stream stream)
    {
        try
        {
            Data = JsonConfigurationFileParser.Parse(stream);
        }
        catch (JsonReaderException e)
        {
            string errorLine = string.Empty;
            if (stream.CanSeek)
            {
                stream.Seek(0, SeekOrigin.Begin);

                IEnumerable<string> fileContent;
                using (var streamReader = new StreamReader(stream))
                {
                    fileContent = ReadLines(streamReader);
                    errorLine = RetrieveErrorContext(e, fileContent);
                }
            }

            throw new FormatException(Resources.FormatError_JSONParseError(e.LineNumber, errorLine), e);
        }
    }
    //省略部分代码
}
```

JsonConfigurationProvider中关于JSON文件的解析由JsonConfigurationFileParser.Parse(stream)完成的。最终的解析结果被赋值给了父类ConfigurationProvider的名为Data的属性中。

所以最终每个数据源的内容都分别被解析成了`IDictionary<string, string>`集合，这个集合作为对应的ConfigurationProvider的一个属性。而众多ConfigurationProvider组成的集合又作为ConfigurationRoot的属性。最终它们的关系图如下图3：

 ![](/blogimages/ASPNETCore_23/548134-20190922215532733-2002489865.png)

图3

到此，配置的加载与数据的转换工作完成。下图4展示了这个过程。

![](/blogimages/ASPNETCore_23/548134-20190922215927882-372366852.png) 

图4

## 3. 配置的读取

第一节的例子中，通过`_configuration["Theme:Color"]`的方式获取到了对应的配置值，这是如何实现的呢？现在我们已经了解了数据源的加载过程，而这个_configuration就是数据源被加载后的最终产出物，即ConfigurationRoot，见图18‑7。它的代码如下：

```csharp
public class ConfigurationRoot : IConfigurationRoot
{
    private IList<IConfigurationProvider> _providers;
    private ConfigurationReloadToken _changeToken = new ConfigurationReloadToken();

    //省略了上文已讲过的构造方法

    public IEnumerable<IConfigurationProvider> Providers => _providers;
    public string this[string key]
    {
        get
        {
            foreach (var provider in _providers.Reverse())
            {
                string value;

                if (provider.TryGet(key, out value))
                {
                    return value;
                }
            }

            return null;
        }

        set
        {
            if (!_providers.Any())
            {
                throw new InvalidOperationException(Resources.Error_NoSources);
            }

            foreach (var provider in _providers)
            {
                provider.Set(key, value);
            }
        }
    }

    public IEnumerable<IConfigurationSection> GetChildren() => GetChildrenImplementation(null);

    internal IEnumerable<IConfigurationSection> GetChildrenImplementation(string path)
    {
        return _providers
            .Aggregate(Enumerable.Empty<string>(),
                (seed, source) => source.GetChildKeys(seed, path))
            .Distinct()
            .Select(key => GetSection(path == null ? key : ConfigurationPath.Combine(path, key)));
    }

    public IChangeToken GetReloadToken() => _changeToken;

    public IConfigurationSection GetSection(string key) 
        => new ConfigurationSection(this, key);

    public void Reload()
    {
        foreach (var provider in _providers)
        {
            provider.Load();
        }
        RaiseChanged();
    }

    private void RaiseChanged()
    {
        var previousToken = Interlocked.Exchange(ref _changeToken, new ConfigurationReloadToken());
        previousToken.OnReload();
    }
}
```

对应`_configuration["Theme:Color"]`的读取方式的是索引器`string this[string key]`，通过查看其get方法可知，它是通过倒序遍历所有ConfigurationProvider，在ConfigurationProvider的Data中尝试查找是否存在Key为"Theme:Color"的值。这也说明了第一节的例子中，在Theme.json中设置了Theme对象的值后，原本在appsettings.json设置的Theme的值被覆盖的原因。从图18‑6中可以看到，该值其实也是被读取并加载的，只是由于ConfigurationRoot的“倒序”遍历ConfigurationProvider的方式导致后注册的Theme.json中的Theme值先被查找到了。同时验证了所有配置值均认为是string类型的约定。

ConfigurationRoot还有一个GetSection方法，会返回一个IConfigurationSection对象，对应的是ConfigurationSection类。它的代码如下：

```csharp
public class ConfigurationSection : IConfigurationSection
{
    private readonly ConfigurationRoot _root;
    private readonly string _path;
    private string _key;

    public ConfigurationSection(ConfigurationRoot root, string path)
    {
        if (root == null)
        {
            throw new ArgumentNullException(nameof(root));
        }

        if (path == null)
        {
            throw new ArgumentNullException(nameof(path));
        }

        _root = root;
        _path = path;
    }

    public string Path => _path;
    public string Key
    {
        get
        {
            if (_key == null)
            {
                // Key is calculated lazily as last portion of Path
                _key = ConfigurationPath.GetSectionKey(_path);
            }
            return _key;
        }
    }
    public string Value
    {
        get
        {
            return _root[Path];
        }
        set
        {
            _root[Path] = value;
        }
    }
    public string this[string key]
    {
        get
        {
            return _root[ConfigurationPath.Combine(Path, key)];
        }

        set
        {
            _root[ConfigurationPath.Combine(Path, key)] = value;
        }
    }

    public IConfigurationSection GetSection(string key) => _root.GetSection(ConfigurationPath.Combine(Path, key));

    public IEnumerable<IConfigurationSection> GetChildren() => _root.GetChildrenImplementation(Path);

    public IChangeToken GetReloadToken() => _root.GetReloadToken();
}
```

它的代码很简单，可以说没有什么实质的代码，它只是保存了当前路径和对ConfigurationRoot的引用。它的方法大多是通过调用ConfigurationRoot的对应方法完成的，通过它自身的路径计算在ConfigurationRoot中对应的Key，从而获取对应的值。而ConfigurationRoot对配置值的读取功能以及数据源的重新加载功能（Reload方法）也是通过ConfigurationProvider实现的，实际数据也是保存在ConfigurationProvider的Data值中。所以ConfigurationRoot和ConfigurationSection就像一个外壳，自身并不负责数据源的加载（或重载）与存储，只负责构建了一个配置值的读取功能。

而由于配置值的读取是按照数据源加载顺序的倒序进行的，所以对于Key值相同的多个配置，只会读取后加载的数据源中的配置，那么ConfigurationRoot和ConfigurationSection就模拟出了一个树状结构，如下图5：

 ![](/blogimages/ASPNETCore_23/548134-20190922220033897-1793601684.png)

图5

本图是以如下配置为例：

```csharp
{
    "Theme": {
    "Name": "Blue",
    "Color": "#0921DC"
    }
}
```

ConfigurationRoot利用它制定的读取规则，将这样的配置模拟成了如图18‑8这样的树，它有这样的特性：

A．所有节点都认为是一个ConfigurationSection，不同的是对于“Theme”这样的节点的值为空（图中用空心椭圆表示），而“Name”和“Color”这样的节点有对应的值（图中用实心椭圆表示）。

B．由于对Key值相同的多个配置只会读取后加载的数据源中的配置，所以不会出现相同路径的同名节点。例如第一节例子中多种数据源配置了“Theme”值，在这里只会体现最后加载的配置项。

## 4. 配置的更新

由于ConfigurationRoot未实际保存数据源中加载的配置值，所以配置的更新实际还是由对应的ConfigurationProvider来完成。以JsonConfigurationProvider、IniConfigurationProvider、XmlConfigurationProvider为例，它们的数据源都是具体文件，所以对文件内容的改变的监控也是放在FileConfigurationProvider中。FileConfigurationProvider的构造方法中添加了对设置了对应文件的监控，当然这里会首先判断数据源的ReloadOnChange选项是否被设置为True了。

```csharp
public abstract class FileConfigurationProvider : ConfigurationProvider
{
    public FileConfigurationProvider(FileConfigurationSource source)
    {
        if (source == null)
        {
            throw new ArgumentNullException(nameof(source));
        }
        Source = source;

        if (Source.ReloadOnChange && Source.FileProvider != null)
        {
            changeToken.OnChange(
                () => Source.FileProvider.Watch(Source.Path),
                () => {
                    Thread.Sleep(Source.ReloadDelay);
                    Load(reload: true);
                });
        }
    }
    //省略其他代码
}
```

所以当数据源发生改变并且ReloadOnChange被设置为True的时候，对应的ConfigurationProvider就会重新加载数据。但ConfigurationProvider更新数据源也不会改变它在ConfigurationRoot的`IEnumerable<IConfigurationProvider>`列表中的顺序。如果在列表中存在A和B两个ConfigurationProvider并且含有相同的配置项，B排在A后面，那么对于这些相同的配置项来说，A中的是被B中的“覆盖”的。即使A的数据更新了，它依然处于“被覆盖”的位置，应用中读取相应配置项的依然是读取B中的配置项。

##### 5. 配置的绑定

在第一节的例子中讲过了两种获取配置值的方式，类似这样`_configuration["Theme:Name"]`和`_configuration.GetValue<string>("Theme:Color","#000000")`可以获取到Theme的Name和Color的值，那么就会有下面这样的疑问：

appsettings.json中存在如下这样的配置

```csharp
{
    "Theme": {
    "Name": "Blue",
    "Color": "#0921DC"
    }
}
```

新建一个Theme类如下：

```csharp
public class Theme
{
    public string Name { get; set; }
    public string Color { get; set; }
}
```

是否可以将配置值获取并赋值到这样的一个Theme的实例中呢？

当然可以，系统提供了这样的功能，可以采用如下代码实现：

```csharp
Theme theme = new Theme();
_configuration.GetSection("Theme").Bind(theme);
```

绑定功能由ConfigurationBinder实现，逻辑不复杂，读者如果感兴趣的可自行查看其代码。