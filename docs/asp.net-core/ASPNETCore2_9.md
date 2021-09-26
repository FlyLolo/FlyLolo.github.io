---
title: 九.发布到CentOS
date: 2018-05-03
tags:
 - ASP.NET Core
categories:
 -  .NET
---

 本文聊一下如何在Windows上用VS开发并发布， 然后将其部署到CentOS上。对于我们一些常在Windows上逛的来说，CentOS用起来还真有些麻烦。MSDN官方有篇文章大概讲了一下（[链接](https://docs.microsoft.com/zh-cn/aspnet/core/host-and-deploy/linux-apache?tabs=aspnetcore2x)），按照MSDN上面的例子用vs创建个hellomvc项目，还是踩了好多坑，将整个过程和遇到的坑说一下，希望对有需要的朋友有所帮助。

 本文主要内容：

 1.工具准备

 2.CentOS 上安装.NET Core环境

 3.Windows上用VS发布项目

 4.项目运行测试

 5.安装并配置Apache

 6.创建service管理应用

 7.其他注意事项

 8.独立部署（SCD）

 <span style="color: #ff6600;">  9.2018.5.8文章更新：Visual Studio 2017 15.7版本的项目发布提供了部署模式（框架依赖和独立部署）和目标运行时（win、osx、linux）的选择功能</span>

 示意图：

 ![](/blogimages/ASPNETCore2_9/548134-20180502111537901-311287491.png)

 最近在阿里云上弄了个ECS玩，既然.NET Core跨平台了，也就选了个CentOS的系统，然后踩坑开始。

## 1. 工具准备

 Putty：阿里云提供了一个网页方式远程操作CentOS的命令行工具，没找到怎么粘贴，挺不好用的。这个是一个命令行的小软件，也省去了每次都要登录阿里云控制台的步骤。[链接](https://the.earth.li/~sgtatham/putty/latest/w64/putty.exe)

 FileZila：sftp工具，用于将windows上生成的发布包弄到CentOS上去。[链接](https://download.filezilla-project.org/client/FileZilla_3.32.0_win64-setup_bundled.exe)

## 2. CentOS 上安装.NET Core环境

 安装.NET Core的环境有两种方式，SDK和Runtime，区别类似java的JDK和JRE。

 官方提供的[下载页面](https://www.microsoft.com/net/download/linux/run)用Build Apps 和Run Apps描述这两个， 我们不需要在CentOS上编码， 所以安装Runtime就够了。

 在页面的all downloads中找到CentOS对应的Runtime版本页面（[链接](https://www.microsoft.com/net/download/linux-package-manager/centos/runtime-2.0.6)）进行安装，这里要注意一下：

 <span style="color: #ff6600;">坑一：版本问题，看了一下自己的VS中项目的Microsoft.AspNetCore.All版本是2.0.6， 也就去找了Runtime的2.0.6版本， 否则容易出现某些组件在VS上的引用版本和CentOS上的环境中的版本不一致的错误。</span>

<span style="color: #000000;"> 通过Putty链接到CentOS服务器，按照该页面上的步骤执行如下命令：</span>

```bash
1 sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
2 sudo sh -c 'echo -e "[packages-microsoft-com-prod]\nname=packages-microsoft-com-prod \nbaseurl= https://packages.microsoft.com/yumrepos/microsoft-rhel7.3-prod\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/yum.repos.d/dotnetdev.repo'
3 
4 sudo yum update
5 sudo yum install libunwind libicu
```

 <span style="color: #ff6600;">最后还有下面关键一步我执行后部署仍会有提示某包找不到的问题，</span>

```csharp
sudo yum install dotnet-runtime-2.0.6
```

 在github上看到这样一段话：

```csharp
Linux
On supported Linux systems, register the Microsoft Product feed as described above and install dotnet-hosting-2.0.6 using your package manager. This will also install the .NET Core Runtime and other required packages.
```

 后来测试了一下不安装dotnet-runtime-<span data-mce-="">2.0.<span data-mce-="">6</span></span>而是安装dotnet-hosting-<span data-mce-="">2.0.<span data-mce-="">6</span></span>成功。

```csharp
sudo yum install dotnet-hosting-2.0.6
```

## 3. Windows上用VS发布项目

 右键项目选择发布，默认情况下是FDD（依赖框架部署），发布生成的内容不包含依赖的框架内容，将依赖上文安装的runtime。

 在CentOS上创建个文件夹， 通过FileZila将发布的文件上传到该文件夹。

 参考创建目录命令： `mkdir -p /<span style="color: #0000ff;">var`/aspnetcore/hellomvc</span>   

## 4. 项目运行测试

 执行命令运行上传后的项目：

```csharp
dotnet /var/aspnetcore/hellomvc/hellomvc.dll
```

 我们都知道，默认情况下，项目采用的事5000端口，我运行项目时遇到了端口冲突，可能是被占用了吧，VS中修改一下Program.cs, 将端口改为常用的8080

```csharp
public static IWebHost BuildWebHost(string[] args) =>
        WebHost.CreateDefaultBuilder(args)
        .UseUrls("http://*:8080")
            .UseStartup<Startup>()
            .Build();
```

 重新发布并上传，执行上面的命令成功，提示<span data-ttu-id="24e91-142">Kestrel</span>开始监听8080端口。

 浏览器访问一下http://ip:8080 

 ![](/blogimages/ASPNETCore2_9/548134-20180428171317951-1548356450.png)

 结果如上图很怪异，<span style="color: #ff6600;">坑二出现，</span>按F12查看一下提示找不到xxx.css  xxx.js等，通过FileZila确认对应的css和js文件都已成功上传在指定位置。

 第一感觉是没有执行UseStaticFiles()， 确认了一下已执行。接着又怀疑是目录大小写问题，一 一排除， 均正常。

 后来先cd到发布目录，再次执行，终于成功。

```csharp
cd /var/aspnetcore/hellomvc
```

 结果如我们熟悉的下图：

 ![](/blogimages/ASPNETCore2_9/548134-20180428171329166-2060405090.png)

##  5. 安装并配置Apache

  安装Apache，并配置反向代理， 将80端口请求转给上面的8080端口由<span data-ttu-id="24e91-142">Kestrel</span>处理。

 安装并启动Apache

```bash
sudo yum -y install httpd mod_ssl
sudo systemctl start httpd
```

 访问一下http://ip ，页面是Apache的默认页面，安装成功。

![](/blogimages/ASPNETCore2_9/548134-20180428171340250-910561158.png)

 配置代理，创建并打开文件hellomvc.conf：

```csharp
nano /etc/httpd/conf.d/hellomvc.conf
```

 nano是一个文本编辑工具，如果提示  nano: command not found   可能nano没有安装  
 执行   `yum install nano`  命令安装即可。

 hellomvc.conf文件内写入如下内容：

```xml
<VirtualHost *:80>
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:8080/
    ProxyPassReverse / http://127.0.0.1:8080/
    ServerName www.example.com
    ServerAlias *.example.com
    ErrorLog ${APACHE_LOG_DIR}hellomvc-error.log
    CustomLog ${APACHE_LOG_DIR}hellomvc-access.log common
</VirtualHost>
```

 重启Apache服务并将该服务设置为自动启动：

```bash
sudo systemctl restart httpd
sudo systemctl enable httpd
```

 再次通过 `dotnet /<span style="color: #0000ff;">var`/aspnetcore/hellomvc/hellomvc.dll</span> 将项目运行起来后，访问 `http:<span style="color: #008000;">//`<span style="color: #008000;">ip </span></span> 或者 `http:<span style="color: #008000;">//`<span style="color: #008000;">ip:8080</span></span> 均访问正常。

 <span style="color: #ff6600;">到现在可能有人比较疑惑， 既然之前的项目已经可以正常访问了，为什么还要用Apache？在项目中直接指定监听80端口不就已经OK？   因为这样做该服务直接占用了80端口， 但有些情况下，我们需要将来自不同域名的访问指定到不同的端口处理，例如可以将a.com的请求指定到8080，将b.com的请求指定到8081.  当然， 如果没有这样的需求，直接用<span data-ttu-id="24e91-142">Kestrel</span>做服务而不用反向代理。</span>

<span style="color: #ff6600;"> 另外每次通过命令 `dotnet xxx.dll` 的方式来启动也不是个很好的体验，我们可以创建个service来管理它， 这也有点向windows的service。</span>

##  6. 创建service管理应用

 再次用nano创建文件：

```bash
sudo nano /etc/systemd/system/kestrel-hellomvc.service
```

 文件内容如下：

```csharp
[Unit]
Description=Example .NET Web API App running on CentOS 7

[Service]
WorkingDirectory=/var/aspnetcore/hellomvc
ExecStart=/usr/local/bin/dotnet /var/aspnetcore/hellomvc/hellomvc.dll
Restart=always
# Restart service after 10 seconds if dotnet service crashes
RestartSec=10
SyslogIdentifier=dotnet-example
User=apache
Environment=ASPNETCORE_ENVIRONMENT=Production 

[Install]
WantedBy=multi-user.target
```

 保存并启动服务：

```bash
systemctl enable kestrel-hellomvc.service
systemctl start kestrel-hellomvc.service
```

 查看是否成功：

```bash
systemctl status kestrel-hellomvc.service
```

 在此处我遇到了问题，提示出错，..........(code=exited, status=203/EXEC)..............  kestrel-hellomvc.service failed。坑三出现，又是各种搜索，后来发现msdn中提供的上面的kestrel-hellomvc.service文件内容中的 `ExecStart=/usr/local/bin/dotnet` 在我的CentOS系统中不存在，通过 `which dotnet` 查看我的系统中是在 `/usr/bin/dotnet` ，修改kestrel-hellomvc.service重新执行 `systemctl start kestrel-hellomvc.service` 提示成功。注意修改该文件后会提示先执行 `systemctl daemon-reload` 重新加载。

 至此，主要工作均已完成。

## 7. 其他注意事项

### 　　A.kestrel-hellomvc.service中的<span data-mce-="">User=<span data-mce-="">apache</span></span>

<span data-mce-=""><span data-mce-=""> 在安装Apache之前，通过 `dotnet /<span style="color: #0000ff;">var`/aspnetcore/hellomvc/hellomvc.dll</span> 已经可以将项目运行起来了， 那时候就想先创建Service，因为觉得这与Apache无关， 结果service总是启动失败，后来才注意到了这个<span data-mce-="">User=<span data-mce-="">apache</span></span>，这里要求这个User存在并且拥有相应的权限。由于对CentOS不熟悉，这点也绕了好久。</span></span>

### <span data-mce-=""><span data-mce-="">　　</span></span><span data-mce-=""><span data-mce-="">B.启用</span></span><span data-mce-=""><span data-mce-="">ForwardedHeaders中间件</span></span>

<span data-mce-=""><span data-mce-=""> 由于采用了反向代理，需要启用ForwardedHeaders中间件转发，在Startup的Configure中添加如下代码，注意UseForwardedHeaders要用在UseAuthentication之前。（[MSDN上的详细说明](https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer?view=aspnetcore-2.1)）</span></span>

```csharp
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

app.UseAuthentication();
```

## 8. 独立部署（SCD）

  下面说一下独立部署（包含依赖项）的发布方式。

 在VS中右击项目文件，注意是 `.csproj` 而不是 `.sln` ，选择编辑xxx.csproj，打开该文件：

```csharp
<Project Sdk="Microsoft.NET.Sdk.Web">

    <PropertyGroup>
    <TargetFramework>netcoreapp2.0</TargetFramework>
    </PropertyGroup>

    <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.All" Version="2.0.6" />
    </ItemGroup>

    <ItemGroup>
    <DotNetCliToolReference Include="Microsoft.VisualStudio.Web.CodeGeneration.Tools" Version="2.0.3" />
    </ItemGroup>

</Project>
```

 在PropertyGroup中添加RuntimeIdentifiers标签

```csharp
<PropertyGroup>
    <TargetFramework>netcoreapp2.0</TargetFramework>
    <RuntimeIdentifiers>win10-x64;centos.7-x64</RuntimeIdentifiers>
</PropertyGroup>
```

win10-x64;centos-x64叫做.NET Core RID， 是一些固定的内容， 具体可选项见[.NET Core RID的目录](https://docs.microsoft.com/zh-cn/dotnet/core/rid-catalog)。

 当我们再次发布的时候，在发布设置的目标运行时中就出现了这两个选项，我们可以根据需要部署的系统选择对应的RID后进行发布。

## 9. 2018.5.8文章更新

 Visual Studio 2017 15.7版本的项目发布提供了部署模式（框架依赖和独立部署）和目标运行时（win、osx、linux）的选择功能

![](/blogimages/ASPNETCore2_9/548134-20180508095954157-106746629.png)