---
title: 二十六. 应用JWT进行用户认证
date: 2019-08-27
tags:
 - ASP.NET Core
categories:
 -  .NET
---

本文将通过实际的例子来演示如何在ASP.NET Core中应用JWT进行用户认证以及Token的刷新方案

## 1. 什么是JWT？

JWT(json web token)基于开放标准（RFC 7519)，是一种无状态的分布式的身份验证方式，主要用于在网络应用环境间安全地传递声明。它是基于JSON的，所以它也像json一样可以在.Net、JAVA、JavaScript,、PHP等多种语言使用。  
为什么要使用JWT？  
传统的Web应用一般采用Cookies+Session来进行认证。但对于目前越来越多的App、小程序等应用来说，它们对应的服务端一般都是RestFul 类型的无状态的API，再采用这样的的认证方式就不是很方便了。而JWT这种无状态的分布式的身份验证方式恰好符合这样的需求。

## 2. JWT的组成：

JWT是什么样子的呢？它就是下面这样的一段字符串：  
```csharp
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjAwMiIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiLmnY7lm5siLCJuYmYiOjE1NjU5MjMxMjIsImV4cCI6MTU2NTkyMzI0MiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1NDIxNCIsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6NTQyMTUifQ.Mrta7nftmfXeo_igBVd4rl2keMmm0rg0WkqRXoVAeik  
```
它是由三段“乱码”字符串通过两个“.”连接在一起组成。官网https://jwt.io/提供了它的验证方式  
![](/blogimages/ASPNETCore2_26/548134-20191015135029255-1555812654.png)

它的三个字符串分别对应了上图右侧的Header、Payload和Signature三部分。

### Header：

```csharp
Header：
{
"alg": "HS256", 
"typ": "JWT"
}
```

标识加密方式为HS256，Token类型为JWT, 这段JSON通过Base64Url编码形成上例的第一个字符串

### Payload

Payload是JWT用于信息存储部分，其中包含了许多种的声明（claims）。  
可以自定义多个声明添加到Payload中，系统也提供了一些默认的类型  
iss (issuer)：签发人  
exp (expiration time)：过期时间  
sub (subject)：主题  
aud (audience)：受众  
nbf (Not Before)：生效时间  
iat (Issued At)：签发时间  
jti (JWT ID)：编号

这部分通过Base64Url编码生成第二个字符串。

### Signature

Signature是用于Token的验证。它的值类似这样的表达式：Signature = HMACSHA256( base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)，也就是说，它是通过将前两个字符串加密后生成的一个新字符串。

所以只有拥有同样加密密钥的人，才能通过前两个字符串获得同样的字符串，通过这种方式保证了Token的真实性。

## 3. 认证流程

大概的流程是这样的：

![](/blogimages/ASPNETCore2_26/548134-20190823171447632-1086011141.png)

1.  认证服务器：用于用户的登录验证和Token的发放。

2.  应用服务器：业务数据接口。被保护的API。

3.  客户端：一般为APP、小程序等。

认证流程：

1.   用户首先通过登录，到认证服务器获取一个Token。

2.  在访问应用服务器的API的时候，将获取到的Token放置在请求的Header中。

3.  应用服务器验证该Token，通过后返回对应的结果。

说明：这只是示例方案，实际项目中可能有所不同。

1.  对于小型项目，可能认证服务和应用服务在一起。本例通过分开的方式来实现，使我们能更好的了解二者之间的认证流程。

2.  对于复杂一些的项目，可能存在多个应用服务，用户获取到的Token可以在多个分布式服务中被认证，这也是JWT的优势之一。

关于JWT的文章很多，这里就不做过多介绍了。下面通过实际的例子来看一下 它是如何在ASP.NET Core 中应用的。

## 4. 应用实例

上一节的图：“JWT的认证流程”中涉及到客户端、认证服务器、应用服务器三部分，下面通过示例来对这三部分进行模拟：

1.  认证服务器：新建一个WebApi的解决方案，名为FlyLolo.JWT.Server。

2.  应用服务器：新建一个WebApi的解决方案，名为FlyLolo.JWT.API。

3.  客户端：这里用Fiddler发送请求做测试。

### 认证服务

首先新建一个ASP.NET Core 的解决方案WebApi的解决方案 

![](/blogimages/ASPNETCore2_26/548134-20190823205937319-24285416.png)

将其命名为FlyLolo.JWT.Server。

首先新建一个TokenController用于登录和Token的发放：

```csharp
[Route("api/[controller]")]
public class TokenController : Controller
{
    private ITokenHelper tokenHelper = null;
    public TokenController(ITokenHelper _tokenHelper)
    {
        tokenHelper = _tokenHelper;
    }
    [HttpGet]
    public IActionResult Get(string code, string pwd)
    {
        User user = TemporaryData.GetUser(code);
        if (null != user && user.Password.Equals(pwd))
        {
            return Ok(tokenHelper.CreateToken(user));
        }
        return BadRequest();
    }
}
```

 它有个名为Get的Action用于接收提交的用户名和密码，并进行验证，验证通过后，调用TokenHelper的CreateToken方法生成Token返回。

这里涉及到了User和TokenHelper两个类。

<span style="font-size: 18px;">**User相关：**</span>

```csharp
public class User
{
    public string Code { get; set; }
    public string Name { get; set; }
    public string Password { get; set; }
}
```

由于只是Demo，User类只含有以上三个字段。在TemporaryData类中做了User的模拟数据

```csharp
/// <summary>
/// 虚拟数据，模拟从数据库或缓存中读取用户
/// </summary>
public static class TemporaryData
{
    private static List<User> Users = new List<User>() { new User { Code = "001", Name = "张三", Password = "111111" }, new User { Code = "002", Name = "李四", Password = "222222" } };

    public static User GetUser(string code)
    {
        return Users.FirstOrDefault(m => m.Code.Equals(code));
    }
}
```

这只是模拟数据，实际项目中应该从数据库或者缓存等读取。

<span style="font-size: 18px;">**TokenHelper：**</span>

```csharp
public class TokenHelper : ITokenHelper
{
    private IOptions<JWTConfig> _options;
    public TokenHelper(IOptions<JWTConfig> options)
    {
        _options = options;
    }

    public Token CreateToken(User user)
    {
        Claim[] claims = { new Claim(ClaimTypes.NameIdentifier,user.Code),new Claim(ClaimTypes.Name,user.Name) };

        return CreateToken(claims);
    }
    private Token CreateToken(Claim[] claims)
    {
        var now = DateTime.Now;var expires = now.Add(TimeSpan.FromMinutes(_options.Value.AccessTokenExpiresMinutes));
        var token = new JwtSecurityToken(
            issuer: _options.Value.Issuer,
            audience: _options.Value.Audience,
            claims: claims,
            notBefore: now,
            expires: expires,
            signingCredentials: new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Value.IssuerSigningKey)), SecurityAlgorithms.HmacSha256));
        return new Token { TokenContent = new JwtSecurityTokenHandler().WriteToken(token), Expires = expires };
    }
}
```

    通过CreateToken方法创建Token，这里有几个关键参数：

1.  issuer            Token发布者

2.  Audience      Token接受者

3.  expires          过期时间

4.  IssuerSigningKey  签名秘钥

对应的Token代码如下：

```csharp
public class Token
{
    public string TokenContent { get; set; }

    public DateTime Expires { get; set; }
}
```

这样通过TokenHelper的CreateToken方法生成了一个Token返回给了客户端。到现在来看，貌似所有的工作已经完成了。并非如此，我们还需要在Startup文件中做一些设置。

```csharp
public class Startup
{  
// 。。。。。。此处省略部分代码  

    public void ConfigureServices(IServiceCollection services)
    {  
    //读取配置信息
        services.AddSingleton<ITokenHelper, TokenHelper>();
        services.Configure<JWTConfig>(Configuration.GetSection("JWT"));
        //启用JWT
        services.AddAuthentication(Options =>
        {
            Options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            Options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        }).
        AddJwtBearer();
        services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
    }

    public void Configure(IApplicationBuilder app, IHostingEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }  
    //启用认证中间件
        app.UseAuthentication();
        app.UseMvc();
    }
}
```

 这里用到了配置信息，在appsettings.json中对认证信息做配置如下：

```json
"JWT": {
    "Issuer": "FlyLolo",
    "Audience": "TestAudience",
    "IssuerSigningKey": "FlyLolo1234567890",
    "AccessTokenExpiresMinutes": "30"
}
```

运行这个项目，并通过Fidder以Get方式访问api/token?code=002&pwd=222222，返回结果如下：

```json
{"tokenContent":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8  
yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjAwMiIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL  
3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiLmnY7lm5siLCJuYmYiOjE1NjY3OTg0NzUsImV4cCI6MTU2NjgwMDI  
3NSwiaXNzIjoiRmx5TG9sbyIsImF1ZCI6IlRlc3RBdWRpZW5jZSJ9.BVf3gOuW1E9RToqKy8XXp8uIvZKL-lBA-q9fB9QTEZ4",  
"expires":"2019-08-26T21:17:55.1183172+08:00"}
```

 客户端登录成功并成功返回了一个Token，认证服务创建完成

### 应用服务

新建一个WebApi的解决方案，名为FlyLolo.JWT.API。

添加BookController用作业务API。

```csharp
[Route("api/[controller]")]
[Authorize]
public class BookController : Controller
{
    // GET: api/<controller>
    [HttpGet]
    [AllowAnonymous]
    public IEnumerable<string> Get()
    {
        return new string[] { "ASP", "C#" };
    }

    // POST api/<controller>
    [HttpPost]
    public JsonResult Post()
    {
        return new JsonResult("Create  Book ...");
    }
}
```

 对此Controller添加了[Authorize]标识，表示此Controller的Action被访问时需要进行认证，而它的名为Get的Action被标识了[AllowAnonymous]，表示此Action的访问可以跳过认证。

在Startup文件中配置认证：

```csharp
public class Startup
{
// 省略部分代码
    public void ConfigureServices(IServiceCollection services)
    {
        #region 读取配置
        JWTConfig config = new JWTConfig();
        Configuration.GetSection("JWT").Bind(config);
        #endregion

        #region 启用JWT认证
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        }).
        AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidIssuer = config.Issuer,
                ValidAudience = config.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config.IssuerSigningKey)),
                ClockSkew = TimeSpan.FromMinutes(1)
            };
        });
        #endregion

        services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IHostingEnvironment env)
    {
        if (env.IsDevelopment())
        {
            app.UseDeveloperExceptionPage();
        }
        app.UseAuthentication();
        app.UseMvc();
    }
}
```

 这里同样用到了配置：

```csharp
public class JWTConfig
{
    public string Issuer { get; set; }
    public string Audience { get; set; }
    public string IssuerSigningKey { get; set; }
    public int AccessTokenExpiresMinutes { get; set; }
}
```

 appsettings.json：

```json
"JWT": {
    "Issuer": "FlyLolo",
    "Audience": "TestAudience",
    "IssuerSigningKey": "FlyLolo1234567890",
    "AccessTokenExpiresMinutes": "30"
}
```

 关于JWT认证，这里通过options.TokenValidationParameters对认证信息做了设置，ValidIssuer、ValidAudience、IssuerSigningKey这三个参数用于验证Token生成的时候填写的Issuer、Audience、IssuerSigningKey，所以值要和生成Token时的设置一致。

ClockSkew默认值为5分钟，它是一个缓冲期，例如Token设置有效期为30分钟，到了30分钟的时候是不会过期的，会有这么个缓冲时间，也就是35分钟才会过期。为了方便测试（不想等太长时间），这里我设置了1分钟。

TokenValidationParameters还有一些其他参数，在它的构造方法中已经做了默认设置，代码如下：

```csharp
public TokenValidationParameters()
{
    RequireExpirationTime = true;  
    RequireSignedTokens = true;    
    SaveSigninToken = false;
    ValidateActor = false;
    ValidateAudience = true;  //是否验证接受者
    ValidateIssuer = true;   //是否验证发布者
    ValidateIssuerSigningKey = false;  //是否验证秘钥
    ValidateLifetime = true; //是否验证过期时间
    ValidateTokenReplay = false;
    }
```

 访问api/book，正常返回了结果

```csharp
["ASP","C#"]
```

 通过POST方式访问，返回401错误。

这就需要使用获取到的Toke了，如下图方式再次访问

![](/blogimages/ASPNETCore2_26/548134-20190826145721615-277294541.png)

添加了“Authorization: bearer Token内容”这样的Header，可以正常访问了。

至此，简单的JWT认证示例就完成了，代码地址[https://github.com/FlyLolo/JWT.Demo/releases/tag/1.0](https://github.com/FlyLolo/JWT.Demo/releases/tag/1.0)。

这里可能会有个疑问，例如：

   1.Token被盗了怎么办？

    答: 在启用Https的情况下，Token被放在Header中还是比较安全的。另外Token的有效期不要设置过长。例如可以设置为1小时（微信公众号的网页开发的Token有效期为2小时）。

   2. Token到期了如何处理？

   答：理论上Token过期应该是跳到登录界面，但这样太不友好了。可以在后台根据Token的过期时间定期去请求新的Token。下一节来演示一下Token的刷新方案。

## 5. Token的刷新

   为了使客户端能够获取到新的Token，对上文的例子进行改造，大概思路如下：

1.  用户登录成功的时候，一次性给他两个Token，分别为AccessToken和RefreshToken，AccessToken用于正常请求，也就是上例中原有的Token，RefreshToken作为刷新AccessToken的凭证。

2.  AccessToken的有效期较短，例如一小时，短一点安全一些。RefreshToken有效期可以设置长一些，例如一天、一周等。

3.  当AccessToken即将过期的时候，例如提前5分钟，客户端利用RefreshToken请求指定的API获取新的AccessToken并更新本地存储中的AccessToken。

所以只需要修改FlyLolo.JWT.Server即可。

首先修改Token的返回方案，新增一个Model

```csharp
public class ComplexToken
{
    public Token AccessToken { get; set; }
    public Token RefreshToken { get; set; }
}
```

包含AccessToken和RefreshToken，用于用户登录成功后的Token结果返回。

修改 appsettings.json，添加两个配置项：

```json
"RefreshTokenAudience": "RefreshTokenAudience", 
"RefreshTokenExpiresMinutes": "10080" //60*24*7
```

RefreshTokenExpiresMinutes用于设置RefreshToken的过期时间，这里设置了7天。RefreshTokenAudience用于设置RefreshToken的接受者，与原Audience值不一致，作用是使RefreshToken不能用于访问应用服务的业务API，而AccessToken不能用于刷新Token。

修改TokenHelper：

```csharp
public enum TokenType
{
    AccessToken = 1,
    RefreshToken = 2
}
public class TokenHelper : ITokenHelper
{
    private IOptions<JWTConfig> _options;
    public TokenHelper(IOptions<JWTConfig> options)
    {
        _options = options;
    }

    public Token CreateAccessToken(User user)
    {
        Claim[] claims = new Claim[] { new Claim(ClaimTypes.NameIdentifier, user.Code), new Claim(ClaimTypes.Name, user.Name) };

        return CreateToken(claims, TokenType.AccessToken);
    }

    public ComplexToken CreateToken(User user)
    {
        Claim[] claims = new Claim[] { new Claim(ClaimTypes.NameIdentifier, user.Code), new Claim(ClaimTypes.Name, user.Name)
            //下面两个Claim用于测试在Token中存储用户的角色信息，对应测试在FlyLolo.JWT.API的两个测试Controller的Put方法，若用不到可删除
            , new Claim(ClaimTypes.Role, "TestPutBookRole"), new Claim(ClaimTypes.Role, "TestPutStudentRole")
        };

        return CreateToken(claims);
    }

    public ComplexToken CreateToken(Claim[] claims)
    {
        return new ComplexToken { AccessToken = CreateToken(claims, TokenType.AccessToken), RefreshToken = CreateToken(claims, TokenType.RefreshToken) };
    }

    /// <summary>
    /// 用于创建AccessToken和RefreshToken。
    /// 这里AccessToken和RefreshToken只是过期时间不同，【实际项目】中二者的claims内容可能会不同。
    /// 因为RefreshToken只是用于刷新AccessToken，其内容可以简单一些。
    /// 而AccessToken可能会附加一些其他的Claim。
    /// </summary>
    /// <param name="claims"></param>
    /// <param name="tokenType"></param>
    /// <returns></returns>
    private Token CreateToken(Claim[] claims, TokenType tokenType)
    {
        var now = DateTime.Now;
        var expires = now.Add(TimeSpan.FromMinutes(tokenType.Equals(TokenType.AccessToken) ? _options.Value.AccessTokenExpiresMinutes : _options.Value.RefreshTokenExpiresMinutes));//设置不同的过期时间
        var token = new JwtSecurityToken(
            issuer: _options.Value.Issuer,
            audience: tokenType.Equals(TokenType.AccessToken) ? _options.Value.Audience : _options.Value.RefreshTokenAudience,//设置不同的接受者
            claims: claims,
            notBefore: now,
            expires: expires,
            signingCredentials: new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Value.IssuerSigningKey)), SecurityAlgorithms.HmacSha256));
        return new Token { TokenContent = new JwtSecurityTokenHandler().WriteToken(token), Expires = expires };
    }

    public Token RefreshToken(ClaimsPrincipal claimsPrincipal)
    {
        var code = claimsPrincipal.Claims.FirstOrDefault(m => m.Type.Equals(ClaimTypes.NameIdentifier));
        if (null != code )
        {
            return CreateAccessToken(TemporaryData.GetUser(code.Value.ToString()));
        }
        else
        {
            return null;
        }
    }
}
```

在登录后，生成两个Token返回给客户端。在TokenHelper添加了一个RefreshToken方法，用于生成新的AccessToken。对应在TokenController中添加一个名为Post的Action，用于调用这个RefreshToken方法刷新Token

```csharp
[HttpPost]
[Authorize]
public IActionResult Post()
{
    return Ok(tokenHelper.RefreshToken(Request.HttpContext.User));
}
```

这个方法添加了[Authorize]标识，说明调用它需要RefreshToken认证通过。既然启用了认证，那么在Startup文件中需要像上例的业务API一样做JWT的认证配置。

```csharp
public void ConfigureServices(IServiceCollection services)
{
    #region 读取配置信息
    services.AddSingleton<ITokenHelper, TokenHelper>();
    services.Configure<JWTConfig>(Configuration.GetSection("JWT"));
    JWTConfig config = new JWTConfig();
    Configuration.GetSection("JWT").Bind(config);
    #endregion

    #region 启用JWT
    services.AddAuthentication(Options =>
    {
        Options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        Options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    }).
        AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidIssuer = config.Issuer,
                ValidAudience = config.RefreshTokenAudience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config.IssuerSigningKey))
            };
        });
    #endregion

    services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
}
```

 注意这里的ValidAudience被赋值为config.RefreshTokenAudience，和FlyLolo.JWT.API中的不一致，用于防止AccessToken和RefreshToken的混用。

再次访问/api/token?code=002&pwd=222222，会返回两个Token：

```csharp
{"accessToken":{"tokenContent":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8y  
MDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjAwMiIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUva  
WRlbnRpdHkvY2xhaW1zL25hbWUiOiLmnY7lm5siLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW  
1zL3JvbGUiOlsiVGVzdFB1dEJvb2tSb2xlIiwiVGVzdFB1dFN0dWRlbnRSb2xlIl0sIm5iZiI6MTU2NjgwNjQ3OSwiZXhwIjoxNTY2ODA4Mjc5LCJ  
pc3MiOiJGbHlMb2xvIiwiYXVkIjoiVGVzdEF1ZGllbmNlIn0.wlMorS1V0xP0Fb2MDX7jI7zsgZbb2Do3u78BAkIIwGg",  
"expires":"2019-08-26T22:31:19.5312172+08:00"},  

"refreshToken":{"tokenContent":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8y  
MDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjAwMiIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUva  
WRlbnRpdHkvY2xhaW1zL25hbWUiOiLmnY7lm5siLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW  
1zL3JvbGUiOlsiVGVzdFB1dEJvb2tSb2xlIiwiVGVzdFB1dFN0dWRlbnRSb2xlIl0sIm5iZiI6MTU2NjgwNjQ3OSwiZXhwIjoxNTY3NDExMjc5LCJ  
pc3MiOiJGbHlMb2xvIiwiYXVkIjoiUmVmcmVzaFRva2VuQXVkaWVuY2UifQ.3EDi6cQBqa39-ywq2EjFGiM8W2KY5l9QAOWaIDi8FnI",  
"expires":"2019-09-02T22:01:19.6143038+08:00"}}
```

 可以使用RefreshToken去请求新的AccessToken

 ![](/blogimages/ASPNETCore2_26/548134-20190826162255441-1336402458.png)

测试用AccessToken可以正常访问FlyLolo.JWT.API，用RefreshToken则不可以。

至此，Token的刷新功能改造完成。代码地址：[https://github.com/FlyLolo/JWT.Demo/releases/tag/1.1](https://github.com/FlyLolo/JWT.Demo/releases/tag/1.1)

疑问：RefreshToken有效期那么长，被盗了怎么办，和直接将AccessToken的有效期延长有什么区别？

个人认为：1. RefreshToken不像AccessToken那样在大多数请求中都被使用。2. 应用类的API较多，对应的服务（器）也可能较多，所以泄露的概率更大一些。