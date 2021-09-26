---
title: 二十七. JWT与用户授权
date: 2019-09-03
tags:
 - ASP.NET Core
categories:
 -  .NET
---

上一章分享了如何在ASP.NET Core中应用JWT进行用户认证以及Token的刷新，本章继续进行下一步，用户授权。涉及到的例子也以上一章的为基础。

## 1. 概述

 首先说一下认证(authentication)与授权(authorization)，它们经常在一起工作，所以有时候会分不清楚。并且这两个英文单词长得也像兄弟。举例来说，我刷门禁卡进入公司，门禁【认证】了我是这里的员工，可以进入；但进入公司以后，我并不是所有房间都可以进，比如“机房重地，闲人免进”，我能进入哪些房间，需要公司的【授权】。这就是认证和授权的区别。

 ASP.NET Core提倡的是基于声明（**Claim**）的授权，关于这个Claim，上一章用到过，有如下这样的代码，但没有介绍：**  
**

```csharp
Claim[] claims = new Claim[] { new Claim(ClaimTypes.NameIdentifier, user.Code), new Claim(ClaimTypes.Name, user.Name) };
```

这是一个声明的集合，它包含了两个 声明，用于保存了用户的唯一ID和用户名。当然我们还可以添加更多的Claim。对应Claim，还有ClaimsIdentity 和ClaimsPrincipal 两个类型。

ClaimsIdentity相当于是一个证件，例如上例的门禁卡；ClaimsPrincipal 则是证件的持有者，也就是我本人；那么对应的Claim就是门禁卡内存储的一些信息，例如证件号、持有人姓名等。

我除了门禁卡还有身份证、银行卡等，也就是说一个ClaimsPrincipal中可以有多个ClaimsIdentity，而一个ClaimsIdentity中可以有多个Claim。ASP.NET Core的授权模型大概就是这样的一个体系。

ASP.NET Core支持多种授权方式，包括兼容之前的角色授权。下面通过几个例子说明一下（例子依然以[上一章](https://www.cnblogs.com/FlyLolo/p/ASPNETCore2_26.html)的代码为基础）。

## 2. 基于角色授权

 ASP.NET Core兼容之前的角色授权模式，如何使用呢？由于不是本文的重点，这里只是简要说一下。修改FlyLolo.JWT.Server的TokenHelper临时为张三添加了一个名为“TestPutBookRole”的权限（实际权限来源此处不做展示）。

```csharp
public ComplexToken CreateToken(User user)
{
    Claim[] claims = new Claim[] { new Claim(ClaimTypes.NameIdentifier, user.Code), new Claim(ClaimTypes.Name, user.Name) };

    //下面对code为001的张三添加了一个Claim，用于测试在Token中存储用户的角色信息，对应测试在FlyLolo.JWT.API的BookController的Put方法，若用不到可删除
    if (user.Code.Equals("001"))
    {
        claims = claims.Append(new Claim(ClaimTypes.Role, "TestPutBookRole")).ToArray();
    }

    return CreateToken(claims);
}
```

修改FlyLolo.JWT.API的BookController，添加了一个Action如下

```csharp
/// <summary>
/// 测试在JWT的token中添加角色，在此验证  见TokenHelper
/// </summary>
/// <returns></returns>
[HttpPut]
[Authorize(Roles = "TestPutBookRole")]
public JsonResult Put()
{
    return new JsonResult("Put  Book ...");
}
```

访问这个Action，只有用张三登录后获取的Token能正常访问。

## 3. 基于声明授权

对于上例来说，本质上也是基于声明（Claim）的授权，因为张三的"TestPutBookRole"角色也是作为一个Claim添加到证书中的。只不过采用了特定的ClaimTypes.Role。那么是否可以将其他的普通Claim作为授权的依据呢？当然是可以的。

这里涉及到了另一个单词“Policy”，翻译为策略？也就是说，可以把一系列的规则（例如要求姓名为李四，账号为002，国籍为中国等等）组合在一起，形成一个Policy，只有满足这个Policy的才可以被授权访问。

下面我们就新建一个Policy，在Startup的ConfigureServices中添加授权代码：

```csharp
services.AddAuthorization(options=>options.AddPolicy("Name",policy=> {
    policy.RequireClaim(ClaimTypes.Name, "张三");
    policy.RequireClaim(ClaimTypes.NameIdentifier,"001");
}));
```

在BookController中添加一个Action如下

```csharp
[HttpDelete]
[Authorize(Policy = "TestPolicy")]
public JsonResult Delete()
{
    return new JsonResult("Delete Book ...");
}
```

可以通过张三和李四的账号测试一下，只有使用张三的账号获取的Token能访问成功。

## 4. 基于策略自定义授权

上面介绍了两种授权方式，现在有个疑问，通过角色授权，只适合一些小型项目，将几个功能通过角色区分开就可以了。

通过声明的方式，目测实际项目中需要在Startup中先声明一系列的Policy，然后在Controller或Action中使用。

这两种方式都感觉不好。例如经常存在这样的需求：一个用户可以有多个角色，每个角色对应多个可访问的API地址（将授权细化到具体的Action）。用户还可以被特殊的授予某个API地址的权限。

这样的需求采用上面的两种方式实现起来都很麻烦，好在ASP.NET Core提供了方便的扩展方式。

### A.样例数据

将上面的需求汇总一下，最终可以形成如下形式的数据：

```csharp
/// <summary>
/// 虚拟数据，模拟从数据库或缓存中读取用户相关的权限
/// </summary>
public static class TemporaryData
{
    public readonly static List<UserPermissions> UserPermissions = new List<UserPermissions> {
        new UserPermissions {
            Code = "001",
            Permissions = new List<Permission> {
                new Permission { Code = "A1", Name = "student.create", Url = "/api/student",Method="post" },
                new Permission { Code = "A2", Name = "student.delete", Url = "/api/student",Method="delete"}
            }
        },
        new UserPermissions {
            Code = "002",
            Permissions = new List<Permission> {
                new Permission { Code = "B1", Name = "book.create", Url = "/api/book" ,Method="post"},
                new Permission { Code = "B2", Name = "book.delete", Url = "/api/book" ,Method="delete"}
            }
        },
    };

    public static UserPermissions GetUserPermission(string code)
    {
        return UserPermissions.FirstOrDefault(m => m.Code.Equals(code));
    }
}
```

涉及到的两个类如下：

```csharp
public class Permission
{
    public string Code { get; set; }
    public string Name { get; set; }
    public string Url { get; set; }

    public string Method { get; set; }
}

public class UserPermissions
{
    public string Code { get; set; }
    public List<Permission> Permissions { get; set; }
}
```

### B.自定义处理程序

下面就是根据样例数据来制定相应的处理程序了。这涉及到IAuthorizationRequirement和AuthorizationHandler两个内容。

IAuthorizationRequirement是一个空的接口，主要用于提供授权所需要满足的“要求”，或者说是“规则”。AuthorizationHandler则是对请求和“要求”的联合处理。

新建一个PermissionRequirement实现IAuthorizationRequirement接口。

```csharp
public class PermissionRequirement: IAuthorizationRequirement
{
    public List<UserPermissions> UsePermissionList { get { return TemporaryData.UserPermissions; } }
}
```

很简单的内容。它的“要求”也就是用户的权限列表了，用户的权限列表中包含当前访问的API，则授权通过，否则不通过。

判断逻辑放在新建的PermissionHandler中：

```csharp
public class PermissionHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
    {
        var code = context.User.Claims.FirstOrDefault(m => m.Type.Equals(ClaimTypes.NameIdentifier));
        if (null != code)
        {
            UserPermissions userPermissions = requirement.UsePermissionList.FirstOrDefault(m => m.Code.Equals(code.Value.ToString()));

            var Request = (context.Resource as AuthorizationFilterContext).HttpContext.Request;

            if (null != userPermissions && userPermissions.Permissions.Any(m => m.Url.ToLower().Equals(Request.Path.Value.ToLower()) && m.Method.ToLower().Equals(Request.Method.ToLower()) ))
            {
                context.Succeed(requirement);
            }
            else
            {
                context.Fail();
            }
        }
        else
        {
            context.Fail();
        }

        return Task.CompletedTask;
    }
}
```

逻辑很简单不再描述。

### C.使用自定义的处理程序

在Startup的ConfigureServices中添加授权代码

```csharp
services.AddAuthorization(options => options.AddPolicy("Permission", policy => policy.Requirements.Add(new PermissionRequirement())));
services.AddSingleton<IAuthorizationHandler, PermissionHandler>();
```

将BookController的Delete Action修改一下：

```csharp
[HttpDelete]
//[Authorize(Policy = "TestPolicy")]
[Authorize(Policy = "Permission")]
public JsonResult Delete()
{
    return new JsonResult("Delete Book ...");
}
```

测试一下只有李四可以访问这个Action。

代码地址：[https://github.com/FlyLolo/JWT.Demo/releases/tag/2.0](https://github.com/FlyLolo/JWT.Demo/releases/tag/2.0)