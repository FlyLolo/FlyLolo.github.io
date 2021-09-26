---
title: 二十五. TagHelper
date: 2019-09-25
tags:
 - ASP.NET Core
categories:
 -  .NET
---

 什么是TagHelper？这是ASP.NET Core 中新出现的一个名词，它的作用是使服务器端代码可以在Razor 文件中参与创建和呈现HTML 元素。

## 1. 概述

 上面的解释有点拗口？那么换一个名词，HtmlHelper大家都知道吧，在ASP.NET Core中，TagHelper类似HtmlHelper，但可以说是青出于蓝而胜于蓝。那么TagHelper的作用也就大概明白了吧。

首先通过一个例子看一下TagHelper是怎么使用的，看看它和HtmlHelper有什么区别。新建一个Book类：

```csharp
public class Book
{
    [Display(Name = "编号")]
    public string Code { get; set; }
    [Display(Name = "名称")]
    public string Name { get; set; }
}
```

新建对应的Controller和Action：

```csharp
public class BookController : Controller
{
    // GET: /<controller>/
    public IActionResult Index()
    {
        return View(new Book() { Code = "001", Name = "ASP" });
    }
}
```

最后就是View了：

```csharp
@model Book
@{
    Layout = null;
}
@Html.LabelFor(m => m.Name)
@Html.EditorFor(m => m.Name)
<br />
<label asp-for="Name"></label>
<input asp-for="Name" />
```

这里分别通过HtmlHelper和TagHelper两种方式实现了一个文本和输入框的显示。查看网页源代码，可以看到二者生成的HTML如下:

```csharp
<label for="Name">Name</label>
<input class="text-box single-line" id="Name" name="Name" type="text" value="ASP" />
<br/>
<label for="Name">Name</label>
<input type="text" id="Name" name="Name" value="ASP" />
```

目前看起来二者差不多，从工作量上来看也是区别不大。现在功能实现了，需要做一些样式处理。简单举个例子，现在希望Book的编号（Code）对应的label的颜色设置为红色，定义了一个css如下：

```csharp
<style type="text/css">
    .codeColor {
        color:red;
    }
</style>
```

然后准备把这个样式应用到label上，这时如果是HtmlHelper就很有可能会被问：“class写在哪”，估计好多人都被问过。然后我们告诉他可以这样写：

```csharp
@Html.LabelFor(m=>m.Name,new {@class="codeColor"})
```

前端工程师添加后达到了想要的效果，但同时表示记不住这个写法，下次可能还会问。

如果是TagHelper就方便了，告诉他可以像平时给Html的标签添加class一样操作即可，也就是：

```csharp
<label asp-for="Name" class="codeColor"></label>
```

前端工程师表示这种写法“真是太友好了”。同样对于Form及验证，比较一下两种写法的不同，HtmlHelper版：

```csharp
@using (Html.BeginForm("Index", "Home", FormMethod.Post)){    
@Html.LabelFor(m => m.Code)
    @Html.EditorFor(m => m.Code)    @Html.ValidationMessageFor(m => m.Code)    <input type="submit" value="提交" />
}
```

TagHelper版：

```csharp
<form asp-action="Index" asp-controller="Home" method="post">
    <label asp-for="Code"></label>
    <input asp-for="Code" />
    
    <input type="submit" value="提交" />
</form>
```

## 2. 自定义TagHelper

现在有这样的需求，用于显示Book的编号的label不止要添加名为codeColor的css样式，还要给书的编号自动添加一个前缀，例如“BJ”。

对于这样的需求，希望可以通过一个简单的标记，然后由TagHelper自动实现。例如：

```csharp
<label show-type="bookCode">1001</label>
```

自定义了一个属性“show-type”，用于标识这个label的显示类别，“1001”为假定的图书编号。通过这样的设置方式，将来如果需求有变化，需要对编号的显示做更多的修饰，只需修改对应的TagHelper即可，而页面部分不需要做任何调整。

系统提供了方便的自定义TagHelper的方式，就是继承系统提供的TagHelper类，并重写它的Process/ProcessAsync方法，例如下面的例子：

```csharp
public class LabelTagHelper : TagHelper
{
    public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
    {
        if (output.Attributes.TryGetAttribute("show-type", out TagHelperAttribute showTypeAttribute))
        {
            if (showTypeAttribute.Value.ToString().Equals("bookCode"))
            {
                output.Attributes.SetAttribute("class", "codeColor");

                string content = output.Content.IsModified ? output.Content.GetContent() : (await output.GetChildContentAsync()).GetContent(); ;
                output.Content.SetContent("BJ" + content);
            }
        }
    }
}
```

首先判断label是否被设置了show-type="bookCode"，然后获取当前label的Content内容，将其添加前缀“BJ”后作为此label的Content的新内容。注意一下Content的获取方式，如果它没有被修改，凭感觉直接通过output.Content.GetContent()获取到的内容是空的。

访问index页面，可以看到改标签已被处理，如下图：

![](/blogimages/ASPNETCore_25/548134-20190924195003686-1380523059.png)

备注：a.关于获取show-type的值，还可以有其他方式，下文会讲到。

b.从规范化命名的角度，建议将自定义的TagHelper其命名为XXXagHelper这样的格式。

## 3. TagHelper的注册

TagHelper自定义之后需要将其注册一下，否则它是不会生效的。打开_ViewImports.cshtml，默认为：

```csharp
@using TagHelperDemo
@using TagHelperDemo.Models
@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers
```

在最下面添加一条

```csharp
@addTagHelper *, TagHelperDemo
```

最后添加的这一句话是什么意思呢？也就是将程序集TagHelperDemo（即第二个参数）中的所有TagHelper（第一个参数为“*”，即所有）全部启用。假如还定义了一个PasswordTagHelper，但只想只添加LabelTagHelper，可以这样写：

```csharp
@addTagHelper TagHelperDemo.TagHelpers. LabelTagHelper, TagHelperDemo
```

如果想添加所有自定义的TagHelper，但要去除LabelTagHelper呢？

那么可以先添加所有，再去除这个LabelTagHelper。

```csharp
@addTagHelper *, TagHelperDemo
@removeTagHelper TagHelperDemo.TagHelpers. LabelTagHelper, TagHelperDemo
```

## 4. TagHelper的作用范围

在项目中，可能不止使用label标签来显示Book的Code，还有可能会是p、span等类型的标签，现在的需求是，无论是上述哪一种标签，都要实现添加css和前缀的功能。

现在将index.cshtml中新增一个p标签如下：

```csharp
<p show-type="bookCode">1002</p>
```

访问这个页面发现1002未被处理。这是因为我们定义的TagHelper名为LabelTagHelper，在默认的情况下只会处理label标签。当然也可以做特殊设置，例如下面代码的写法：

```csharp
[HtmlTargetElement("p")]
public class LabelTagHelper : TagHelper
{
    //代码省略
}
```

通过“<span lang="EN-US">[HtmlTargetElement(<span lang="EN-US">"p"<span lang="EN-US">)]”指定本<span lang="EN-US">TagHelper只能被使用于<span lang="EN-US">p标签。再次访问此页面，发现<span lang="EN-US">p标签被处理了，而<span lang="EN-US">label未被处理。这说明这样的显式指定的优先级要高于默认的名称匹配。除了设置指定标签，还可以有一些其他的辅助设置：</span></span></span></span></span></span></span>

```csharp
[HtmlTargetElement("p", Attributes = "show-type", ParentTag = "div")]
public class LabelTagHelper : TagHelper
```

可以这样写，会匹配p标签，要求该标签拥有show-type属性，并且父标签为div。这几个条件是“and”的关系。如果还想匹配label标签，可以添加对label的设置，例如下面代码这样：

```csharp
[HtmlTargetElement("p", Attributes = "show-type", ParentTag = "div")]
[HtmlTargetElement("label", Attributes = "show-type", ParentTag = "div")]
public class LabelTagHelper : TagHelper
```

这两个HtmlTargetElement的关系是“or”。通过这样的设置，可以极大的缩小目标标签的范围。

但是这样设置之后，这个TagHelper的名字再叫LabelTagHelper就不合适了，例如可以改为BookCodeTagHelper，最终代码如下：

```csharp
[HtmlTargetElement("p", Attributes = "show-type", ParentTag = "div")]
[HtmlTargetElement("label", Attributes = "show-type", ParentTag = "div")]
public class BookCodeTagHelper : TagHelper
{
    public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
    {
        if (output.Attributes.TryGetAttribute("show-type", out TagHelperAttribute showTypeAttribute))
        {
            if (showTypeAttribute.Value.ToString().Equals("bookCode"))
            {
                output.Attributes.SetAttribute("class", "codeColor");

                string content = output.Content.IsModified ? output.Content.GetContent() :
                                    (await output.GetChildContentAsync()).GetContent(); ;
                output.Content.SetContent("BJ" + content);
            }
        }
    }
}
```

如果想使个别Html标签屏蔽TagHelper的作用，可以使用“!”。例如下面两个标签：

```csharp
<!label show-type="bookCode">1001</label>
```

## 5. 自定义标签

上一节最终形成了一个名为BookCodeTagHelper的TagHelper，我们知道LabelTagHelper是可以按名称默认匹配label标签的，那么是否可以自定义一个BookCode标签呢？在index.cshtml中添加这样的代码：

```csharp
<BookCode>1003</BookCode>
```

由于自定义bookcode标签的目的就是专门显示Book的Code，所以也不必添加show-type属性了。然后修改BookCodeTagHelper，修改后的代码如下：

```csharp
public class BookCodeTagHelper : TagHelper
{
    public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
    {
        output.Attributes.SetAttribute("class", "codeColor");

        string content = output.Content.IsModified ? output.Content.GetContent() :
                            (await output.GetChildContentAsync()).GetContent(); ;
        output.Content.SetContent("BJ" + content);
    }
}
```

去掉了两个HtmlTargetElement设置并取消了对show-type的判断，访问index页面查看新建的bookcode标签是否会被处理，结果是没有被处理。这是为什么呢？

这是由于TagHelper会将采用Pascal 大小写格式的类和属性名将转换为各自相应的短横线格式。即“BookCode”对应“book-code”，获取标签的属性值，同样遵循这样的规则。所以将标签改为如下写法即可：

```csharp
<book-code>1003</book-code>
```

再次运行测试，发现这个新标签被成功处理。查看网页源代码，被处理后的Html代码是这样的：

```csharp
<book-code class="codeColor">TJ1003</book-code>
```

如果想将其改变为label，可以在BookCodeTagHelper中通过指定TagName实现：

```csharp
public class BookCodeTagHelper : TagHelper
{
    public Book Book { get; set; }
    public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
    {
        output.TagName = "label";
        output.Attributes.SetAttribute("class", "codeColor");

        string content = output.Content.IsModified ? output.Content.GetContent() :
                            (await output.GetChildContentAsync()).GetContent(); ;
        output.Content.SetContent(Book.Prefix + content);
    }
}
```

## 6. TagHelper与页面之间的数据传递

假如现在的新需求是图书编码的前缀不再固定为“BJ”了，需要在标签中定义，例如这样：

```csharp
<book-code prefix="SH">1003</book-code>
```

需要获取prefix的值，在上面的例子中采用的是TryGetAttribute方法，其实还有简单的方式，修改BookCodeTagHelper，代码如下：

```csharp
public class BookCodeTagHelper : TagHelper
{
    public string Prefix { get; set; }
    public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
    {
        output.Attributes.SetAttribute("class", "codeColor");

        string content = output.Content.IsModified ? output.Content.GetContent() :
                            (await output.GetChildContentAsync()).GetContent(); ;
        output.Content.SetContent(Prefix + content);
    }
}
```

标签中的prefix的值会自动赋值给BookCodeTagHelper.Prefix，是不是更方便了。那么如果是Model中的值呢？假如Book类有一个属性“public string Prefix { get; set; } ”，这和传入一个字符串没什么区别，那么可以这样写：

```csharp
<book-code prefix="@Model.Prefix">1003</book-code>
```

这种传值方式不止是支持字符串，将Model整体传入也是支持的，将标签修改如下：

```csharp
<book-code book="@Model">1003</book-code>
```

修改BookCodeTagHelper代码：

```csharp
public class BookCodeTagHelper : TagHelper
{
    public Book Book { get; set; }
    public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
    {
        output.Attributes.SetAttribute("class", "codeColor");

        string content = output.Content.IsModified ? output.Content.GetContent() :
                            (await output.GetChildContentAsync()).GetContent(); ;
        output.Content.SetContent(Book.Prefix + content);
    }
}
```

## 7. 取消标签输出

前面的几个例子都是对满足条件的标签的修改，TagHelper也可以取消对应标签的输出，例如存在这样一个标签：

```csharp
<div simple-type="Simple1">
```

</div>

如果不想让它出现在生成的Html中，可以这样处理：

```csharp
[HtmlTargetElement("div",Attributes = "simple-type")]
public class Simple1TagHelpers : TagHelper
{
    public string SimpleType { get; set; }
    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        if (SimpleType.Equals("Simple1"))  //可以是其他一些判断规则
        {
            output.SuppressOutput();
        }
    }
}
```

## 8. TagBuilder

在TagHelper中，可以用TagBuilder来辅助生成标签，例如存在如下两个div：

```csharp
<div simple-type="Simple2">
    <div simple-type=<span style="color: #800000;">"</span><span style="color: #800000;">Simple3</span><span style="color: #800000;">"</span>></div>
</div>
```
想在div中添加Html元素可以这样写：

```csharp
[HtmlTargetElement("div",Attributes = "simple-type")]
public class Simple1TagHelpers : TagHelper
{
    public string SimpleType { get; set; }
    public override void Process(TagHelperContext context, TagHelperOutput output)
    {
        if (SimpleType.Equals("Simple2"))
        {
            output.Content.SetHtmlContent("<p>Simple2</p>");
        }
        else if (SimpleType.Equals("Simple3"))
        {
            var p = new TagBuilder("p");
            p.InnerHtml.Append("Simple3");
            output.Content.SetHtmlContent(p);
        }
    }
}
```

通过TagBuilder生成了一个新的p标签，并将它插入到div中。