---
title: 二十二. 多样性的配置方式
date: 2019-09-20
tags:
 - ASP.NET Core
categories:
 -  .NET
---

大多数应用都离不开配置，本章将介绍ASP.NET Core中常见的几种配置方式及系统内部实现的机制。([ASP.NET Core 系列目录](https://www.cnblogs.com/FlyLolo/p/ASPNETCore2_0.html))

    说到配置，第一印象可能就是“.config”类型的xml文件或者“.ini”类型的ini文件，在ASP.NET Core 中，常用的配置文件类型为JSON。比如项目根目录中的appsettings.json和appsettings.Development.json两个文件。实际上，ASP.NET Core支持多种配置方式，除了采用JSON文件的方式外，还支持内存、命令行等方式。

## 1. 文件方式

这是最常见的方式，ASP.NET Core支持多种格式的配置文件，例如常见的JSON、XML、INI等格式的文件。

首先看一下项目默认创建的配置文件appsettings.json，其内容默认如下：

```json
{
    "Logging": {
    "LogLevel": {
        "Default": "Warning"
    }
    },
    "AllowedHosts": "*"
}
```

这个文件会在系统启动的时候自动被加载（加载发生在Program文件的CreateWebHostBuilder方法中，下一节会详细说明），默认内容主要是对Log的配置。

举个例子，需要在配置文件中设置应用的主题，例如颜色风格等。向文件末尾添加如下内容：

```json
"Theme": {
    "Name": "Blue",
    "Color": "#0921DC"
}
```

用通过这样的代码设置了系统的主题和对应的色值。那么这个值是如何被获取并使用的呢？以默认的HomeController为例，新建一个名为“GetConfiguration”的Action来演示Configuration值的获取。代码如下：

```csharp
privatereadonlyIConfiguration _configuration;  

publicHomeController(IConfiguration configuration)
{
    _configuration = configuration;
}

publicContentResult GetConfiguration()
{
    returnnewContentResult() { Content = $"Theme Name:{ _configuration["Theme:Name"] },Color:{_configuration["Theme:Color"]}"};
}
```

  在构造方法中通过依赖注入的方式获取到了一个IConfiguration，并在Action中通过这个IConfiguration获取到了appsettings.json中设置的值。可以看出，在获取值的时候，是通过“：”符号来体现JSON的层级关系体现的。例如获取“Color”的值，对应的表达式为“_configuration["Theme:Color"]”。这是因为整个JSON会被处理为一个个的Key-Value的格式，本例的“Theme”的两个值会被分解为如下格式：

<table border="1" cellspacing="0" cellpadding="0">
<tbody>
<tr>
<td valign="top" width="246">

<span style="font-size: 14pt;">**Key**</span>

</td>
<td valign="top" width="245">

<span style="font-size: 14pt;">**Value**</span>

</td>
</tr>
<tr>
<td valign="top" width="246">

Theme:Name

</td>
<td valign="top" width="245">

Blue

</td>
</tr>
<tr>
<td valign="top" width="246">

Theme:Color

</td>
<td valign="top" width="245">

#0921DC

</td>
</tr>
</tbody>
</table>

这里有两个说明，第一，“Key”不区分大小写，即写为“theme:color”也是等效的；第二，约定“Value”值是字符串格式。

除了上例中的获取方式，还可以通过GetValue方法获取。

```csharp
_configuration.GetValue<string>("Theme:Color","#000000")
```

含义是将获取到的值转换为string类型，如果获取失败则返回默认值“#000000”。

本例演示了系统默认的appsettings.json文件中的内容被自动载入，那么如何将自定义的JSON文件中的内容应用到系统的配置中去呢？

新建一个名为“Theme.json”的文件，同样再预设一个红色主题，代码如下：

```csharp
{
    "Theme": {
    "Name": "Red",
    "Color": "#FF4500"
    }
}
```

由于这个自定义的“Theme.json”不会被自动载入，需要手动将其添加到系统的配置中去，在讲应用系统的启动的时候说过，配置是在Program文件的CreateDefaultBuilder方法中被加载的，可以在其之后继续通过ConfigureAppConfiguration方法继续设置。例如如下代码：

```csharp
publicstaticIWebHostBuilder CreateWebHostBuilder(string[] args) =>
    WebHost.CreateDefaultBuilder(args)
.ConfigureAppConfiguration((hostingContext,config)=> {
        config.SetBasePath(Directory.GetCurrentDirectory());
        varpath = Path.Combine(Directory.GetCurrentDirectory(), "Theme.json");
        config.AddJsonFile(path, optional: false, reloadOnChange: true);
    })
    .UseStartup<Startup>();
}
```

首先通过SetBasePath方法设置了基路径，然后通过AddJsonFile方法添加“Theme.json”文件，这个方法有3个参数，第一个是“Theme.json”所在的位置，第二个设置此文件是否可选，第三个设置当此文件被修改后，是否自动重新加载该文件。

再次访问home/GetConfiguration，返回的结果如下：

```csharp
Theme Name:Red,Color:#FF4500
```

这是因为后添加的Theme.json文件中的Theme值覆盖了appsettings.json文件中的Theme值。这涉及到各种配置设置方式的优先级问题，在下一节会讲。

说完了将JSON格式的文件用作配置的例子，再看看如何采用INI格式的。新建一个名为Theme.ini的文件，为了不覆盖之前设置的Theme，本例将Theme改为了ThemeGreen。

```csharp
[ThemeGreen]
Name=Green
Color=#76EE00
```

通过ConfigureAppConfiguration方法将这个INI文件添加到配置中去。

```csharp
var pathIni = Path.Combine(Directory.GetCurrentDirectory(), "Theme.ini");
config.AddIniFile(pathIni, optional: false, reloadOnChange: true);
```

修改Action中读取配置的Key，将对应的将Theme改为ThemeGreen：

```csharp
publicContentResult GetConfiguration()
{
    returnnewContentResult() { Content = $"Theme Name:{ _configuration["ThemeGreen:Name"] },Color:{_configuration.GetValue<string>("ThemeGreen:Color", "#000000")}"};
}
```

再次访问home/GetConfiguration，返回的结果如下：

```csharp
Theme Name:Green,Color:#76EE00
```

上面介绍了JSON和INI两种格式的文件的应用，除了二者文件格式的不同以及被添加到配置时采用的方法不同（分别采用了AddJsonFile和AddIniFile方法），在其他环节二者的使用方式均是一样的。同理，对于XML格式的文件，有一个对应的AddXmlFile方法，其他环节和JSON、INI文件的应用也是一样的，此处就不再举例描述。

## 2. 目录文件

除了上一节利用JSON、INI和XML这样常用的文件格式外，还可以将指定目录和文件作为配置的数据来源。

例如现在有个文件夹s，其下面有1.txt和2.txt两个文件，文件内容分别是s1和s2，如下图1

 ![](/blogimages/ASPNETCore_22/548134-20190919211813141-515335042.png)

图1

可以将这一的目录和文件作为配置的数据来源，同样只需要在ConfigureAppConfiguration方法中添加即可，见如下代码：

```csharp
var pathFile = Path.Combine(Directory.GetCurrentDirectory(), "s");
config.AddKeyPerFile(directoryPath: pathFile, optional: true);
```

通过一个Action测试一下：

```csharp
publicContentResult GetFileConfiguration()
{
        returnnewContentResult() { Content = $"1.txt:{_configuration["1.txt"]}, 2.txt:{_configuration["2.txt"]}"};
}
```

返回结果为：

```csharp
1.txt:s1,2.txt:s2
```

可见这样的方法是将s文件夹下的两个文件的文件名作为了Key，文件内容作为Value。

## 3. 命令行

通过命令行启动应用的时候，可以在命令行中通过添加Key-Value的方式作为配置的数据来源，例如执行如下命令启动应用：

```csharp
dotnet run key1=value1 key2=value2
```
访问定义好的如下Action：

```csharp
publicContentResult GetCommandConfiguration()
{
    returnnewContentResult() { Content = $"key1:{_configuration["key1"]}, key2:{_configuration["key2"]}"};
}
```

返回结果为：

```csharp
key1:value1,key2:value2
```
这是由于在默认的WebHost.CreateDefaultBuilder(args)方法中添加了对命令行参数的调用，如果需要在ConfigureAppConfiguration方法中继续添加，只需要在该方法中南调用config.AddCommandLine(args)方法即可。

## 4. 环境变量

在WebHost.CreateDefaultBuilder(args)方法中，除了会加载命令行参数，还会加载环境变量中的数据。此处的环境变量包括系统的环境变量，例如下图2

 ![](/blogimages/ASPNETCore_22/548134-20190919211933515-196118170.png)

图2

环境变量中的“变量”和“值”会被读取为配置的Key和Value。

除了读取系统的环境变量，也可以在项目的属性中添加，例如在项目的属性中添加，例如下图3：

 ![](/blogimages/ASPNETCore_22/548134-20190919212018768-2130751267.png)

图3

除了熟悉的名为ASPNETCORE_ENVIRONMENT的环境变量，又在这里添加了一个Key为TestKey，Value为TestValue的环境变量。

添加一个Action测试一下：

```csharp
publicContentResult GetEnvironmentVariables()
{
    returnnewContentResult() { Content = $"TestKey:{_configuration["TestKey"]}, OS:{_configuration["OS"]}"};
}
```
分别读取了图2和图3中的两个环境变量，访问这个Action，返回结果为：

```csharp
TestKey:TestValue,OS:Windows_NT
```

#  五、内存对象

以上的例子都是将一些外部的数据源读取并转换成了配置中的Key-Value格式，那么是否可以直接在应用中通过代码方式创建一些Key-Value值并加入到配置中去呢？这当然是可以的。常见的就是Dictionary了，新建一个Dictionary代码如下：

```csharp
public static readonly Dictionary<string, string> dict = newDictionary<string, string> { { "ThemeName", "Purple"},{"ThemeColor", "#7D26CD"} };
```

在ConfigureAppConfiguration方法中将其加入到配置中去：

```csharp
config.AddInMemoryCollection(dict);
```

新建一个Action进行测试：

```csharp
publicContentResult GetMemoryConfiguration()
{
        returnnewContentResult() { Content = "ThemeName:{_configuration["ThemeName"]}, ThemeColor:{_configuration["ThemeColor"]}"};
}
```

返回结果为：

```csharp
ThemeName:Purple,ThemeColor:#7D26CD
```