---
title: 三. 项目结构
date: 2018-02-09
tags:
 - ASP.NET Core
categories:
 -  .NET
---

本章我们一起来对比着ASP.NET Framework版本看一下ASP.NET Core 2.0的项目结构.(此后的文章也尽量这样对比着, 方便学习理解.)

关注差异, 也为项目迁移做准备.


## 1. 新建项目, 选择类型

新建项目, 选择.NET Core 有如下几种类型可选, 分别是Console, ASP.NET Core 的空项目, Web API

我们选择ASP.NET Core Web App(MVC), 没有标注MVC的是采用Razor pages 的项目.

![](/blogimages/ASPNETCore2_3/548134-20180207212207779-1001668776.jpg)

## 2. 项目结构图

新建的项目结构如下图所示, 大体上和ASP.NET 的Framework版本差不多, 现在按照图上的数字标记逐一做一下介绍(Controller、Model就不介绍了, View中单独介绍一下几个特殊View).

**按照标注的数字逐个做一下简单介绍, 先了解大概是干什么用的, 后面的文章会做详细的研究.**

介绍的时候我会对比大家熟悉的ASP.NET Framework版本, 方便理解.

![](/blogimages/ASPNETCore2_3/548134-20180207230835763-894954850.png)

### ① Dependencies 依赖项

这里主要分两部分, NuGet和SDK, 目前这两部分下面都只有一项.

**Nuget:**

包含Microsoft.AspNetCore.All, 展开它看一下, 里面MVC、Razor、EF以及SQLLite都要,

官方这样说: 它包含了

*   ASP.NET Core 团队支持的所有包。

*   Entity Framework Core 支持的所有包。

*   ASP.NET Core 和 Entity Framework Core 使用的内部和第三方依赖关系。 

猛地一看, 这是一非常大而全的包了, 和之前说的模块化有点不一致, 而且无缘无故的让自己的项目引用了一些根本用不到的程序集, 非常不爽.

其实这些程序集不会随着项目发布一起出现在部署包中, 不止没引用的, 包括引用的也不会. 这些已经存在于部署环境中了, 所以发布包不会变大反而会变小, 不必担心.

**SDK:**

SDk中包含了一项: Microsoft.NETCore.App, 它是.NET Core 的部分库。 也就是 `.NETCoreApp` 框架。 它依赖于更小的 `NETStandard.Library`。

相对于上面的Microsoft.AspNetCore.All, 它同样是包含了一些程序集.但它似乎更"基础"一些.

**二者异同**

Microsoft.AspNetCore.All中大部分都是Microsoft.开头的一些程序集, 而Microsoft.NETCore.App中出现的大多数是我们熟悉的system.XXX的.

二者的关系就像ASP.NET相对于.NET, 此处是Asp.NetCore相对于.Net Core. 

SDK同样是一个大而全的集和, 在部署的时候, SDK中的引用依然不会出现在部署包中, 如下图, 是不是很精简

![](/blogimages/ASPNETCore2_3/548134-20180208134140216-1713065500.png)

### ② launchSettings.json

顾名思义, 这是一个启动配置文件, json格式的. 通过上面的项目结构图可以发现, 常见的web.config或app.config等xml格式的config文件找不到了,

都是json. 打开这个json看一下. 一项项的不好解释, 后来发现windows 中的 vs2017有个图形化的配置界面(右键当前项目->属性->调试),

一个个介绍太麻烦了, 直接上图感受一下.

![](/blogimages/ASPNETCore2_3/548134-20180208142350138-1478919252.png)

图下部分的Web服务器配置是我们熟悉的URL、身份认证以及SSL等配置.

图的上部分对应json中的profiles中定义的两种配置,分别以IIS Express和以当前项目名HelloCore命名.

切换该选项下面的配置项也会随之改变, 相当于是两个页, 每页中的配置对应json中相应的节点. 

### ③ _Layout.cshtml

布局模板, 简单的说就是所有采用此模板的页面拥有大体一致的布局, 

举个例子, 我们的页面经常是这样的结构:

![](/blogimages/ASPNETCore2_3/548134-20180208150014560-42688859.png)

Header、Footer和Navigation基本上是不变的, 打开_Layout.cshtml, 我们可以看到一个@RenderBody()标识, 它其实就是来定义Content部分的, 

继承此模板的页面只需要提供这部分内容即可.

当然, 常见的还有类似@RenderSection("Scripts", required: false)这样的标识, 引用此模板的页面可以将该页的特定JS的引用放在对应的Section中.

引用此模板, 只需在页首如下配置即可.

```csharp
@{
    Layout = "~/Views/Shared/_Layout.cshtml";
}
```

每个页都配置比较麻烦? ⑥ _ViewStart.cshtml 会帮忙.

### ④ _ValidationScriptsPartial.cshtml

```html
<environment include="Development">
    <script src="~/lib/jquery-validation/dist/jquery.validate.js"></script>
    <script src="~/lib/jquery-validation-unobtrusive/jquery.validate.unobtrusive.js"></script>
</environment>
```

打开此页面, 可以看到一些这样的引用, validation 顾名思义是用来做验证的, 我们经常看到这样的页面

![](/blogimages/ASPNETCore2_3/548134-20180208163938170-1351718798.png)

当输入的格式不正确的时候, 给出提示, 最早我们经常是在输入后或者提交前用js将输入的内容正则验证一下, 

这个不用那么麻烦了, 我们通过如下代码引用_ValidationScriptsPartial.cshtml, 也就是采用jquery-validation来做验证

```csharp
@section Scripts {
    @await Html.PartialAsync("_ValidationScriptsPartial")
}
```

<span style="color: #ff0000;">注意: 默认的_Layout模板是未引用的, 因为不是所有页面都需要有输入操作.</span>

Model中设置验证方式

```csharp
[Required(ErrorMessage ="用户名不能为空!")]
[Display(Name = "用户名")]
public string UserName { get; set; }

[EmailAddress(ErrorMessage ="Email格式不正确!")]
[Required]
[Display(Name = "EMail")]
public string EMail { get; set; }
```

在页面添加验证即可:

```html
<div asp-validation-summary="All" class="text-danger">
    <div <span style="color: #0000ff;">class</span>=<span style="color: #800000;">"</span><span style="color: #800000;">form-group</span><span style="color: #800000;">"</span>>
        <label asp-<span style="color: #0000ff;">for</span>=<span style="color: #800000;">"</span><span style="color: #800000;">Email</span><span style="color: #800000;">"</span>></label>
        <input asp-<span style="color: #0000ff;">for</span>=<span style="color: #800000;">"</span><span style="color: #800000;">Email</span><span style="color: #800000;">"</span> <span style="color: #0000ff;">class</span>=<span style="color: #800000;">"</span><span style="color: #800000;">form-control</span><span style="color: #800000;">"</span> />
        <span asp-validation-<span style="color: #0000ff;">for</span>=<span style="color: #800000;">"</span><span style="color: #800000;">Email</span><span style="color: #800000;">"</span> <span style="color: #0000ff;">class</span>=<span style="color: #800000;">"</span><span style="color: #800000;">text-danger</span><span style="color: #800000;">"</span>></span>
    </div>
</div>
```
validation细化起来内容还很多, 此处只是大概介绍一下, 后文会专题研究.

### ⑤ _ViewImports.cshtml

先不说这个, 再说一个消失了的Web.config. 就是Framework版本的MVC项目中的View目录下的那个.

![](/blogimages/ASPNETCore2_3/548134-20180208170048623-2111482412.png)

在View中引用Model等的时候, 为了避免写using .... , 我们可以在这个config中添加这些引用

```html
<system.web.webPages.razor>
<host factoryType="System.Web.Mvc.MvcWebRazorHostFactory, System.Web.Mvc, Version=5.2.3.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35" />
<pages pageBaseType="System.Web.Mvc.WebViewPage">
  <namespaces>
    <add namespace="System.Web.Mvc" />
    <add namespace="System.Web.Mvc.Ajax" />
    <add namespace="System.Web.Mvc.Html" />
    <add namespace="System.Web.Optimization"/>
    <add namespace="System.Web.Routing" />
    <add namespace="FrameworkMVCTest" />
    <add namespace="FrameworkMVCTest.Model" />
  </namespaces>
</pages>
</system.web.webPages.razor>
```

现在打开_ViewImports.cshtml,

```csharp
@using HelloCore
@using HelloCore.Models
@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers
```

这里其实就是实现了上面的功能.

有一个比较特别的地方就是比原版MVC多了个@addTagHelper

在上文的validation中我们看到过这样的代码

```html
<label asp-for="Email"></label>
<input asp-for="Email" class="form-control" />
```

原来我们是这样写的

```csharp
@Html.LabelFor(m => m.EMail)
@Html.EditorFor(m => m.EMail)
@Html.ValidationMessageFor(m=>m.EMail)
```

初步看来这个 TagHelper 和 HtmlHelper 有点像, 具体先了解这么多, 后文细化.

### ⑥ _ViewStart.cshtml

这个打开就一句话,

```csharp
@{
    Layout = "_Layout";
}
```

这个页面中的内容会在所有View执行前执行, 现在这句话就是给所有的View一个默认的Layout模板.

所以在View中这样写

```csharp
@{
    Layout = null;
}
```

和这样写

```csharp
@{

}
```

是不一样的, 第一种是告诉这个View不采用任何模板.

第二种写法是什么都不干, 所以它会采用_ViewStart.cshtml中指定的模板.

当然, 这个_ViewStart.cshtml的作用不只是写这么一句话, 我们还可以在这写一些其他需要"通用"执行的内容.

### ⑦ wwwroot

看这名字好像是IIS的默认网站根目录, 它包含了所有的"前端"的静态文件,  css、image、JS以及一个名为lib的文件夹.

lib中默认内容是bootstrap和jquery.

在Startup中, 会调用一个无参数的UseStaticFiles()方法, 将此目录标记到网站根目录.

```csharp
public void Configure(IApplicationBuilder app, IHostingEnvironment env)
{
    //.....        
    app.UseStaticFiles();
    //.....

}
```

具体静态文件的路径及相关自定义配置, 授权等后文详细研究.

### ⑧ appsettings.json和appsettings.Development.json

这就是原来的framework版本的MVC的Web.config文件了.

不过这个算是够精简的了, 默认情况没几句话,只有对于log日志的相关配置,

当然正常项目中我们要配置的肯定不止这一点, 举个例子, 数据库连接

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ContosoUniversity1;Trusted_Connection=True;MultipleActiveResultSets=true"
  },
  "Logging": {
    "IncludeScopes": false,
    "LogLevel": {
      "Default": "Warning"
    }
  }
}
```

### ⑨ bundleconfig.json

默认文件内容如下:

```json
[
  {
    "outputFileName": "wwwroot/css/site.min.css",
    "inputFiles": [
      "wwwroot/css/site.css"
    ]
  },
  {
    "outputFileName": "wwwroot/js/site.min.js",
    "inputFiles": [
      "wwwroot/js/site.js"
    ],
    // Optionally specify minification options
    "minify": {
      "enabled": true,
      "renameLocals": true
    },
    // Optionally generate .map file
    "sourceMap": false
  }
]
```

这里主要涉及两个概念:

1.Bunding

     可以理解为绑定或者合并, 也就是把几个文件合并成一个大文件, 减少请求次数.

     上文的代码可以看到, inputFiles 是一个数组, 而outputFileName 是一个单独的文件名, 

 以css为例, inputFiles里面已经有一个文件 wwwroot/css/site.css, 假如现在页面还需要一个wwwroot/css/skin.css,

 如果不做合并, 页面打开的时候就需要分别请求这两个文件, 做了合并之后, 即将这个skin.css文件也写入数组中, 只要请求

 /css/site.min.css这一个文件即可. 

2.Minification

 翻译为缩减, 即将代码中注释和多余空格等删除, 甚至将变量名改为一个字符来缩减文件的大小.

      例如下面的JS代码

```csharp
AddAltToImg = function (imageTagAndImageID, imageContext) {
    ///<signature>
    ///<summary> Adds an alt tab to the image
    // </summary>
    //<param name="imgElement" type="String">The image selector.</param>
    //<param name="ContextForImage" type="String">The image context.</param>
    ///</signature>
    var imageElement = $(imageTagAndImageID, imageContext);
    imageElement.attr('alt', imageElement.attr('id').replace(/ID/, ''));
}
```

      缩减后的代码:

```csharp
AddAltToImg=function(n,t){var i=$(n,t);i.attr("alt",i.attr("id").replace(/ID/,""))};
```

      一下就减少了好多.

通过以上两种方式组合不但减少了请求次数,还减小了请求的静态文件的总大小, 从而提高加载时间和性能.

在上文查看_layout模板文件的时候我们就见过这样的代码:

```html
<environment include="Development">
    <link rel="stylesheet" href="~/lib/bootstrap/dist/css/bootstrap.css" />
    <link rel="stylesheet" href="~/css/site.css" />
</environment>
<environment exclude="Development">
    <link rel="stylesheet" href="https://ajax.aspnetcdn.com/ajax/bootstrap/3.3.7/css/bootstrap.min.css"
          asp-fallback-href="~/lib/bootstrap/dist/css/bootstrap.min.css"
          asp-fallback-test-class="sr-only" asp-fallback-test-property="position" asp-fallback-test-value="absolute" />
    <link rel="stylesheet" href="~/css/site.min.css" asp-append-version="true" />
</environment>
```

详细的配置说明暂时不说, 大概的意思就是在Development模式下加载未绑定和缩减的文件, 方便阅读和调试.

和非Development情况下,加载处理过的文件来提高性能.

### ⑩ Program.cs

```csharp
public class Program
{
    public static void Main(string[] args)
    {
        BuildWebHost(args).Run();
    }

    public static IWebHost BuildWebHost(string[] args) =>
        WebHost.CreateDefaultBuilder(args)
            .UseStartup<Startup>()
            .Build();
}
```

这里有一个非常熟悉的Main方法, 也就是应用的起点, 启动后通过`UseStartup<Startup>()`指定下文的Startup启动文件进行启动.

### ⑪ Startup.cs

这是Mvc Core非常重要的地方, 包括加载配置, 通过依赖注入加载组件, 注册路由等都在此处进行.

默认的代码中:

```csharp
// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
public void Configure(IApplicationBuilder app, IHostingEnvironment env)
{
    if (env.IsDevelopment())   //指定错误页
    {
        app.UseDeveloperExceptionPage();
    }
    else
    {
        app.UseExceptionHandler("/Home/Error");
    }

    app.UseStaticFiles(); //指定静态文件

//设置路由
    app.UseMvc(routes =>
    {
        routes.MapRoute(
            name: "default",
            template: "{controller=Home}/{action=Index}/{id?}");
    });
}
```

如上图所示, 默认情况下设置了两种不同状态下的错误页, 指定静态文件并且设置了路由.

在这里, 我们可以向管道中通过中间件的方式插入我们需要的工作内容.

比如我们还可以用app.UseAuthentication()来做身份验证.

我们使用 `Use`、`Run` 和 `Map` 来配置 HTTP 管道。 

`Use` 方法可使管道短路（即不调用 `next` 请求委托）。 

`Run` 是一种约定，并且某些中间件组件可公开在管道末尾运行的 `Run[Middleware]` 方法。

`Map*` 扩展用作约定来创建管道分支。

此处涉及内容非常多, 比如管道机制、路由注册、身份认证等都需要专题研究.

### ⑫ .bowerrc和bower.json 

bower是一款优秀的前端包及依赖管理工具,.bowerrc指定了文件位置, bower.json则进行了详细的配置,如下面的bootstrap和jquery

```json
{
  "name": "asp.net",
  "private": true,
  "dependencies": {
    "bootstrap": "3.3.7",
    "jquery": "2.2.0",
    "jquery-validation": "1.14.0",
    "jquery-validation-unobtrusive": "3.2.6"
  }
}
```

 详细的使用方法就不在这里介绍了.

## 3. 小结:

刚新建的项目的结构大体就是这样,  主要功能介绍完了就是一个个详细研究了.