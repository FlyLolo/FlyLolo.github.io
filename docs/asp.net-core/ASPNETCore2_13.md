---
title: 十三.httpClient.GetAsync 报SSL错误
date: 2018-08-10
tags:
 - ASP.NET Core
categories:
 -  .NET
---

不知什么时候 ，出现了这样的一个奇怪问题，简单的httpClient.GetAsync("xxxx")居然报错了。

## 1. 问题描述

把原来的程序从2.0升级到2.1，突然发现原本正常运行的httpClient.GetAsync("xxxx")居然不工作了。

为了排除项目中其他引用的干扰，新建了一个干净的2.1的项目，Main里直接调用

```csharp
var client = new HttpClient();
var task = client.GetAsync(url);
```

依然是报错。

错误信息如下：

```csharp
System.AggregateException: One or more errors occurred. (The SSL connection could not be established, see inner exception.) ---> System.Net.Http.HttpRequestException: The SSL connection could not be established, see inner exception. --->
Interop+Crypto+OpenSslCryptographicException: error:2006D002:BIO routines:BIO_new_file:system lib
    at Interop.Crypto.CheckValidOpenSslHandle(SafeHandle handle)
    at Internal.Cryptography.Pal.StorePal.LoadMachineStores()
    at *****************************************
```

原本以为是升级runtime的时候出错了，重新安装后依然是这样。

系统环境：

```csharp
OS：CentOS 7

Host (useful for support):
  Version: 2.1.2
  Commit:  811c3ce6c0

.NET Core runtimes installed:
  Microsoft.AspNetCore.All 2.1.2 [/usr/share/dotnet/shared/Microsoft.AspNetCore.All]
  Microsoft.AspNetCore.App 2.1.2 [/usr/share/dotnet/shared/Microsoft.AspNetCore.App]
  Microsoft.NETCore.App 2.1.2 [/usr/share/dotnet/shared/Microsoft.NETCore.App]
```

偶然发现，通过dotnet命令运行对应的dll可以正常运行：

```csharp
dotnet  ......xx/xx/test.dll
```

但通过 `/etc/systemd/system/kestrel-test.service` 这样的服务启动的情况下依然报错。

每次都通过dotnet命令运行肯定是不合适的，继续想办法。

## 2. 解决方法

这是因为在 `/etc/ssl/certs` 目录下存在没有读取权限或者已损坏的文件导致的，查看一下这个文件夹确实最近几天有新文件写入，可能是最近安装什么进来的吧。

没有一个个的试验，<span style="color: #ff6600;">临时把这个文件夹的公共权限设置了可读</span>，可以正常运行了，算是个临时方法吧，这样开权限肯定不是一个好办法，

据说在新版本中会修复， 重新刷了一下 `yum update` 也没有新的，官网看看也还没2.1.3的runtime。希望新版本中 早点把这个问题修复。