---
title: 四. _Layout与_ViewStart
date: 2018-02-18
tags:
 - ASP.NET Core
categories:
 -  .NET
---

本章我们新建一个项目,并通过这个项目熟悉一下_Layout与_ViewStart以及它们的加载顺序.

## 1. 新建一个项目

首先, 文件->新建一个解决方案

![](/blogimages/ASPNETCore2_4/548134-20180217213100544-1212981877.png)

选择.Net Core 的APP下面的ASP.NET Core Web App(MVC)

Next

 ![](/blogimages/ASPNETCore2_4/548134-20180218090605733-389996591.jpg)

设置解决方案的名称(和Xcode的界面风格有点像), 输入FL.WeightManager, 做一个每天记录体重的应用

点击Create.

项目新建完毕, 项目的文件结构上一章已经说过了.

## 2. _layout的应用

新建好的项目默认运行效果如下图

![](/blogimages/ASPNETCore2_4/548134-20180218092051640-1762210003.png)

页面主要分三部分, 上面的header, 下面的footer, 点击上面菜单总的Home、About和Contact切换一下页面看一下

这两部分都是不变的, 只有中间部分在变.

打开Shared文件夹下面的_layout.cshtml页面看一下, header和footer都是定义在这里的, 

而中间变的部分是`@RenderBody()`.也就是我们经常要改变的地方了.

现在将主页改变一下, 打开Home文件夹下的Index文件,将里面的一大堆代码改成如下代码

```csharp
1 @{
2     ViewData["Title"] = "主页";
3 }
4 <table class="table table-hover">
5     <thead>
6         <tr>
7             <th>序号</th>
8             <th>日期</th>
9             <th>体重</th>
10             <th>备注</th>
11         </tr>
12     </thead>
13     <tbody>
14         <tr>
15             <td>1</td>
16             <td>2018-02-15</td>
17             <td>66.6</td>
18             <td>除夕,胖了</td>
19         </tr>
20         <tr>
21             <td>2</td>
22             <td>2018-02-16</td>
23             <td>68.8</td>
24             <td>春节,又重了</td>
25         </tr>
26     </tbody>
27 </table>
```

刷新一下页面

![](/blogimages/ASPNETCore2_4/548134-20180217224433236-1995262637.png)

看起来效果还不错, 可能会注意到, 这个table有个class  `<table <span style="color: #0000ff;">class`=<span style="color: #800000;">"</span><span style="color: #800000;">table table-hover</span><span style="color: #800000;">"</span>></span> ,

这个class定义在哪里呢.

再次打开_layout文件, 可以看到里面在Development环境下引用了bootstrap的css

```csharp
<environment include="Development">
    <link rel="stylesheet" href="~/lib/bootstrap/dist/css/bootstrap.css" />
    <link rel="stylesheet" href="~/css/site.css" />
</environment>
```

所以可以把一些"通用"的css和js的引用放在layout文件里, 避免重复写这些引用.

顺便把header和footer中显示的项目名称改一下, 然后分别打开Index和About这些页面, Header和Footer都统一改变了.

如下图的About页面.

![](/blogimages/ASPNETCore2_4/548134-20180217221525137-558510817.png)

但是我们在这个Index页中没有对这个模板做引用, 是通过什么方式引用的呢?

## 3. _ViewStart的应用

回顾修改后的Index页面, 我们并没有写 `Layout = <span style="color: #800000;">"`<span style="color: #800000;">_Layout</span><span style="color: #800000;">"</span></span> 这样的代码, 这是因为已经在_ViewStart中默认设置了

_ViewStart中只有这一句

```csharp
@{
    Layout = "_Layout";
}
```

如果我们在Index页面中添加一句 `Layout=<span style="color: #0000ff;">null`</span> 如下,

```csharp
@{
    Layout=null;
    ViewData["Title"] = "主页";
}
```

再次刷新页面, 样子变成了这样

![](/blogimages/ASPNETCore2_4/548134-20180217224206353-1532728059.png)

Header和Footer以及Table的样式全都没有了, 是因为这些本来都写在_Layout中, 现在失去了对_Layout的引用, 这些也就消失了.

**总结:** _ViewStart对模板页做了默认的设置, 除非显示的写明Layout=XXX, 否则会采用_ViewStart中的设置.

       所以未做设置和设置 `Layout = <span style="color: #800000;">"`<span style="color: #800000;">_Layout</span><span style="color: #800000;">"</span></span> 的效果是一样的.

##  4. _ViewStart、_Layout和Index(实际页面)的加载顺序

 加载顺序是: _ViewStart =>Index=>_Layout.

1._ViewStart在所有View加载之前加载, 设置了默认的模板页.

2.接着由Controller指定的页面查找Index.cshtml加载, 并读取该页面的Layout设置. 

3.根据Index页面的Layout设置的模板页查找对应的模板页加载.

将_ViewStart中的 `Layout = <span style="color: #800000;">"`<span style="color: #800000;">_Layout</span><span style="color: #800000;">"</span></span> 改为 `Layout = <span style="color: #800000;">"`<span style="color: #800000;">_Layout1</span><span style="color: #800000;">"</span></span> , 再次运行, 页面会出现如下找不到模板的错误.

```csharp
An unhandled exception occurred while processing the request.

InvalidOperationException: The layout view '_Layout1' could not be located. The following locations were searched:
/Views/Home/_Layout1.cshtml
/Views/Shared/_Layout1.cshtml
Microsoft.AspNetCore.Mvc.Razor.RazorView.GetLayoutPage(ViewContext context, string executingFilePath, string layoutPath)
```

**View的查找规则:** 先查找Controller对应的文件夹(这里是Home), 若未找到则到Shared文件夹查找, 若最终未找到则提示错误.