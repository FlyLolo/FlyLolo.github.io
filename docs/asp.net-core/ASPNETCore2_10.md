---
title: 十.升级到2.1
date: 2018-05-31
tags:
 - ASP.NET Core
categories:
 -  .NET
---

.NET Core 2.1 终于发布了， 赶紧升级一下。

## 1. 安装SDK

首先现在并安装 SDK（[64-bit](https://download.microsoft.com/download/8/8/5/88544F33-836A-49A5-8B67-451C24709A8F/dotnet-sdk-2.1.300-win-x64.exe)）

![](/blogimages/ASPNETCore2_10/548134-20180531121630732-1409004822.png)

安装完毕后如果新建项目可以看到已经有2.1的选项了

![](/blogimages/ASPNETCore2_10/548134-20180531121823694-1346838723.png)

## 2. 更新现有2.0项目到2.1

### 2.1. 修改 项目版本

右键点击解决方案管理器中的项目， 选择编辑项目名.csproj

![](/blogimages/ASPNETCore2_10/548134-20180531122401567-1139089398.png)

将 `<TargetFramework>netcoreapp2.<span style="color: #800080;">0`</TargetFramework></span> 中的2.0改为2.1，保存。

### 2.2. 将引用 Microsoft.AspNetCore.All  替换为 Microsoft.AspNetCore.App 

项目依赖中找到 `Microsoft.AspNetCore.All` ，移除它， 在Nugget中搜索并安装 `Microsoft.AspNetCore.App` 

<span style="color: #ff6600;">注意：</span>以下内容依旧包含在 `Microsoft.AspNetCore.All` 中， 而 `Microsoft.AspNetCore.App` 中不存在

*   `Microsoft.AspNetCore.ApplicationInsights.HostingStartup`

*   `Microsoft.AspNetCore.AzureAppServices.HostingStartup`

*   `Microsoft.AspNetCore.AzureAppServicesIntegration`

*   `Microsoft.AspNetCore.DataProtection.AzureKeyVault`

*   `Microsoft.AspNetCore.DataProtection.AzureStorage`

*   `Microsoft.AspNetCore.Server.Kestrel.Transport.Libuv`

*   `Microsoft.AspNetCore.SignalR.Redis`

*   `Microsoft.Data.Sqlite`

*   `Microsoft.Data.Sqlite.Core`

*   `Microsoft.EntityFrameworkCore.Sqlite`

*   `Microsoft.EntityFrameworkCore.Sqlite.Core`

*   `Microsoft.Extensions.Caching.Redis`

*   `Microsoft.Extensions.Configuration.AzureKeyVault`

*   `Microsoft.Extensions.Logging.AzureAppServices`

*   `Microsoft.VisualStudio.Web.BrowserLink`

所以如果项目中需要用到这些内容， 可以单独引用它们， 而不建议再次整体引用 `Microsoft.AspNetCore.All` 

### 2.3. 修改其他引用

再次打开*.csproj文件， 可以看到对应的 `Microsoft.AspNetCore.All` 已经替换为`Microsoft.AspNetCore.App `了

删除各种 `<DotNetCliToolReference Include=<span style="color: #800000;">"`<span style="color: #800000;">********</span><span style="color: #800000;">"</span> Version=<span style="color: #800000;">"</span><span style="color: #800000;">2.0.3</span><span style="color: #800000;">"</span> /></span>  例如： `<DotNetCliToolReference Include=<span style="color: #800000;">"`<span style="color: #800000;">Microsoft.EntityFrameworkCore.Tools.DotNet</span><span style="color: #800000;">"</span> Version=<span style="color: #800000;">"</span><span style="color: #800000;">2.0.3</span><span style="color: #800000;">"</span> /></span> 

最终这个*.csproj文件类似这样

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
    <PropertyGroup>
    <TargetFramework>netcoreapp2.1</TargetFramework>
    <UserSecretsId>aspnet-{Project Name}-{GUID}</UserSecretsId>
    </PropertyGroup>
    <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.App" />
    <PackageReference Include="Microsoft.VisualStudio.Web.CodeGeneration.Design" Version="2.1.0" PrivateAssets="All" />
    </ItemGroup>
</Project>
```

### 2.4.修改Program.cs

修改Main方法和BuildWebHost方法， 结果如下

```csharp
public class Program
{
    public static void Main(string[] args)
    {
        CreateWebHostBuilder(args).Build().Run();
    }

    public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
        WebHost.CreateDefaultBuilder(args)
            .UseStartup<Startup>();
}
```

### 2.5. 修改Startup

修改后代码示例如下， 主要是新增行，删除UseBrowserLink， 见下文代码的颜色标注

```csharp
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace WebApp1
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => true;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });

            services.AddMvc()
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_1);
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {  
　　　　　　　　　　//app.UseBrowserLink();  删除此行
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseCookiePolicy();

            app.UseMvc();
        }
    }
}
```

## 3. 其他改动

*   shared文件夹中添加了新文件<span data-mce-=""><span data-mce-="">_CookieConsentPartial.cshtml, </span></span>在_Layout文件中被引用 `<<span style="color: #0000ff;">partial` name=<span style="color: #800000;">"</span><span style="color: #800000;">_CookieConsentPartial</span><span style="color: #800000;">"</span> /></span> 

*   _ValidationScriptsPartial.cshtml 文件中的jquery.validate.js版本升级到了1.17.0

*   JQuery从2.2.0升级到3.3.1

## 4. 一点郁闷的事

看到2.1发布， 首先没有去下载SDK而是查看VS是否有更新，希望更新VS的时候可以顺便更新SDK。 当前版本15.7.1 ， 官方文档中提示前几天有15.7.2发布， VS中检查更新一直没有。

下载SDK安装好后， 终于右上角的小旗子亮了提示有更新， 各种重试均是不动没有下载进度。

最后不管它发现它以一种怪异的方式开始了更新。。。

![](/blogimages/ASPNETCore2_10/548134-20180531131425581-887586927.png)