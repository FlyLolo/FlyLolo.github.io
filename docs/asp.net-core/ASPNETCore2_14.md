---
title: 十四.静态文件访问与授权
date: 2018-11-27
tags:
 - ASP.NET Core
categories:
 -  .NET
---

我的网站的图片不想被公开浏览、下载、盗链怎么办？本文主要通过解读一下ASP.NET Core对于静态文件的处理方式的相关源码，来看一下为什么是wwwroot文件夹，如何修改或新增一个静态文件夹，为什么新增的文件夹名字不会被当做controller处理？访问授权怎么做？
## 1. 静态文件夹

所谓静态文件，直观的说就是wwwroot目录下的一些直接提供给访问者的文件，例如css，图片、js文件等。 当然这个wwwroot目录是默认目录，

这个是在Main->CreateDefaultBuilder的时候做了默认设置。

```csharp
public static class HostingEnvironmentExtensions
{
    public static void Initialize(this IHostingEnvironment hostingEnvironment, string contentRootPath, WebHostOptions options)
    {
        //省略部分代码
        var webRoot = options.WebRoot;
        if (webRoot == null)
        {
            // Default to /wwwroot if it exists.
            var wwwroot = Path.Combine(hostingEnvironment.ContentRootPath, "wwwroot");
            if (Directory.Exists(wwwroot))
            {
                hostingEnvironment.WebRootPath = wwwroot;
            }
        }
        else
        {
            hostingEnvironment.WebRootPath = Path.Combine(hostingEnvironment.ContentRootPath, webRoot);
        }
        //省略部分代码
    }
}
```

## 2. 处理方式

前文关于中间件部分说过，在Startup文件中，有一个 `app.UseStaticFiles()` 方法的调用，这里是将静态文件的处理中间件作为了“处理管道”的一部分，

并且这个中间件是写在 `app.UseMvc` 之前， 所以当一个请求进来之后， 会先判断是否为静态文件的请求，如果是，则在此做了请求处理，这时候请求会发生短路，不会进入后面的mvc中间件处理步骤。

```csharp
public void Configure(IApplicationBuilder app, IHostingEnvironment env)
{
    if (env.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }
    else
    {
        app.UseExceptionHandler("/Home/Error");
    }

    app.UseStaticFiles();

    app.UseCookiePolicy();
    app.UseAuthentication();
    app.UseMvc(routes =>
    {
        routes.MapRoute(
            name: "default",
            template: "{controller=Home}/{action=Index}/{id?}");
    });
}
```

## 3. 新增静态文件目录

除了这个默认的wwwroot目录，需要新增一个目录来作为静态文件的目录，可以Startup文件的 `app.UseStaticFiles()` 下面继续use，例如下面代码

```csharp
app.UseFileServer(new FileServerOptions
{
    FileProvider = new PhysicalFileProvider(
Path.Combine(Directory.GetCurrentDirectory(), "NewFilesPath")),
    RequestPath = "/NewFiles"
});
```

含义就是指定应用程序目录中的一个名为“<span data-mce-="">NewFilesPath</span>”的文件夹，将它也设置问静态文件目录， 而这个目录的访问路径为<span data-mce-="">"<span data-mce-="">/NewFiles<span data-mce-="">"</span></span></span>。

例如文件夹<span data-mce-="">"<span data-mce-="">NewFilesPath<span data-mce-="">"下面有一个test.jpg, 那么我们可以通过这样的地址来访问它：http://localhost:64237/<span style="color: #993366;" data-mce-="">NewFiles/test.jpg。</span></span></span></span>

# <span data-mce-=""><span data-mce-=""><span data-mce-=""><span data-mce-="">四、中间件的处理方式</span></span></span></span>

<span style="color: #000000;" data-mce-=""><span data-mce-=""><span data-mce-=""><span data-mce-="">静态文件的处理中间件为StaticFileMiddleware，主要的处理方法 `Invoke` 代码如下</span></span></span></span>

```csharp
public async Task Invoke(HttpContext context)
{
    var fileContext = new StaticFileContext(context, _options, _matchUrl, _logger, _fileProvider, _contentTypeProvider);

    if (!fileContext.ValidateMethod())
    {
        _logger.LogRequestMethodNotSupported(context.Request.Method);
    }
    else if (!fileContext.ValidatePath())
    {
        _logger.LogPathMismatch(fileContext.SubPath);
    }
    else if (!fileContext.LookupContentType())
    {
        _logger.LogFileTypeNotSupported(fileContext.SubPath);
    }
    else if (!fileContext.LookupFileInfo())
    {
        _logger.LogFileNotFound(fileContext.SubPath);
    }
    else
    {
        // If we get here, we can try to serve the file
        fileContext.ComprehendRequestHeaders();
        switch (fileContext.GetPreconditionState())
        {
            case StaticFileContext.PreconditionState.Unspecified:
            case StaticFileContext.PreconditionState.ShouldProcess:
                if (fileContext.IsHeadMethod)
                {
                    await fileContext.SendStatusAsync(Constants.Status200Ok);
                    return;
                }
                try
                {
                    if (fileContext.IsRangeRequest)
                    {
                        await fileContext.SendRangeAsync();
                        return;
                    }
                    await fileContext.SendAsync();
                    _logger.LogFileServed(fileContext.SubPath, fileContext.PhysicalPath);
                    return;
                }
                catch (FileNotFoundException)
                {
                    context.Response.Clear();
                }
                break;
            case StaticFileContext.PreconditionState.NotModified:
                _logger.LogPathNotModified(fileContext.SubPath);
                await fileContext.SendStatusAsync(Constants.Status304NotModified);
                return;

            case StaticFileContext.PreconditionState.PreconditionFailed:
                _logger.LogPreconditionFailed(fileContext.SubPath);
                await fileContext.SendStatusAsync(Constants.Status412PreconditionFailed);
                return;

            default:
                var exception = new NotImplementedException(fileContext.GetPreconditionState().ToString());
                Debug.Fail(exception.ToString());
                throw exception;
        }
    }
    await _next(context);
}
```

<span style="color: #000000;" data-mce-=""><span data-mce-=""><span data-mce-=""><span data-mce-="">当HttpContext进入此中间件后会尝试封装成StaticFileContext， 然后对其逐步判断，例如请求的URL是否与设置的静态目录一致， 判断文件是否存在，判断文件类型等，</span></span></span></span>

<span style="color: #000000;" data-mce-=""><span data-mce-=""><span data-mce-=""><span data-mce-="">若符合要求 ，会进一步判断文件是否有修改等。</span></span></span></span>

# <span data-mce-=""><span data-mce-=""><span data-mce-=""><span data-mce-="">五、静态文件的授权管理</span></span></span></span>

<span style="color: #000000;" data-mce-="">默认情况下，静态文件是不需要授权，可以公开访问的。</span>

<span style="color: #000000;" data-mce-="">因为即使采用了授权， `app.UseAuthentication();` 一般也是写在 `app.UseStaticFiles()` 后面的，那么如果我们想对其进行授权管理，首先想到可以改写 `StaticFileMiddleware` 这个中间件，</span>

<span style="color: #000000;" data-mce-="">在其中添加一些自定义的判断条件，但貌似不够友好。而且这里只能做一些大类的判断，比如请求的IP地址是否在允许范围内这样的还行，如果要根据登录用户的权限来判断（比如用户只能看到自己上传的图片）就不行了，</span>

<span style="color: #000000;" data-mce-="">因为权限的判断写在这个中间件之后。所以可以通过Filter的方式来处理，首先可以在应用目录中新建一个<span data-mce-="">"<span data-mce-="">images<span data-mce-="">"</span></span></span>文件夹， 而这时就不要把它设置为静态文件目录了，这样这个<span data-mce-="">"<span data-mce-="">images<span data-mce-="">"</span></span></span>目录的文件默认情况下是不允许访问的，</span>

<span style="color: #000000;" data-mce-="">然后通过Controller返回文件的方式来处理请求，如下代码所示</span>

```csharp
[Route("api/[controller]")]
[AuthorizeFilter]
public class FileController : Controller
{
    [HttpGet("{name}")]
    public FileResult Get(string name)
    {
        var file = Path.Combine(Directory.GetCurrentDirectory(), "images", name);

        return PhysicalFile(file, "application/octet-stream");
    }

}
```

 在AuthorizeFilter中进行相关判断，代码如下

```csharp
public class AuthorizeFilter: ActionFilterAttribute
{
    public override void OnActionExecuting(ActionExecutingContext context)
    {
        base.OnActionExecuting(context);

        if (context.RouteData.Values["controller"].ToString().ToLower().Equals("file"))
        {
            bool isAllow = false;//在此进行一系列访问权限验证，如果失败，返回一个默认图片，例如logo或不允许访问的提示图片

            if (!isAllow)
            {
                var file = Path.Combine(Directory.GetCurrentDirectory(), "images", "default.png");

                context.Result = new PhysicalFileResult(file, "application/octet-stream");

            }
        }
    }
}
```