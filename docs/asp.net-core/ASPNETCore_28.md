---
title: 二十八. 在Docker中部署
date: 2019-10-31
tags:
 - ASP.NET Core
categories:
 -  .NET
---

本文简要说一下ASP.NET Core 在Docker中部署以及docker-compose的使用 。 系统环境为CentOS 8 。 

## 1. 概述

简单说一下Docker的几个概念：

记得上学的时候流行一种安装操作系统的方式，叫GHOST，大概是这样的：

![](/blogimages/ASPNETCore_28/548134-20191030205104569-373383123.png)

进入PE系统打开GHOST软件，点击“local”,然后选择“Partition”,最后选择“From Image”，选择一个.gho后缀文件，就开始系统安装了。

安装好系统之后，根据自己的需求又安装了一些常用软件，然后为了避免下次重装系统还要安装这些，可以将现在状态的系统再次用GHOST备份一下，生成一个.gho后缀的镜像文件，这个镜像又可以用来安装系统。

一个.gho文件可以用来为多台电脑安装系统，每个被安装好的系统又可以被备份成一个.gho文件文件。

而类比Docker，有这样几个概念：

1.  Image(镜像)：有点像.gho后缀的镜像文件。

2.  Container(容器)：就像用.gho安装成功的一个操作系统。

3.  Repository(仓库)：存放镜像的仓库，像Git一样可以有公有的仓库也可以有私有的。微软的仓库地址为：

但实际上Docker不是一个操作系统，也不像一个虚拟机一样，它是要共享宿主的内核的。

而且一般建议一个容器只跑一个进程，不像操作系统那样可以多进程运行。（虽然也可以通过一些方法在一个Docker容器中跑多个应用，但不建议这样做。）

## 2. 安装docker

     **说明：安装CentOS 8 选择了最小安装，此处就不说了，下面说一下Docker的安装过程。**

*   安装一些必要的系统工具：

```bash
 sudo yum install -y yum-utils device-mapper-persistent-data lvm2
 ```

*   添加软件源信息：
```bash
 sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
 ```
*   更新 yum 缓存：
```bash
 sudo yum makecache fast
 ```
*   安装 Docker-ce：
```bash
 sudo yum -y install docker-ce
 ```
*   启动 Docker 后台服务
```bash
 sudo systemctl start docker
 ```
 注意：安装Docker-ce的时候可能报错：
 ```bash
 package docker-ce …… requires containerd.io >= 1.2.2-3, but none of the providers can be installed  
 ```
 是因为containerd.io版本过低，可去下面网站查看新版本：

 https://download.docker.com/linux/centos/7/x86_64/edge/Packages

*   下载：
```bash
 wget https://download.docker.com/linux/centos/7/x86_64/edge/Packages/containerd.io-1.2.6-3.3.el7.x86_64.rpm
 ```
*   安装：
```bash
 yum -y install containerd.io-1.2.6-3.3.el7.x86_64.rpm 
 ```
 再次执行sudo yum -y install docker-ce安装即可。

## 3. Docker的几个常见命令

*   搜索远程存储库中的镜像，例如MongoDB的镜像

```csharp
docker search mongo
```

![](/blogimages/ASPNETCore_28/548134-20191031091003819-1071898188.png)

*   **拉取仓库中的**镜像

```csharp
docker pull  mongo
```

*   ** **列出本地镜像。

```csharp
docker images
```

可以看到本地镜像中包了mongo镜像。

*   运行镜像生成一个容器

```csharp
docker run --name mongotodocker -p 27088:27017 -d mongo
```

含义: 用镜像mongo运行生成一个容器，名字为mongotodocker ，将容器内的端口27017映射到主机的27088端口。-p 指的是端口映射。 -d是说后台运行容器，并返回容器ID；

*   ** 列出所有容器**。

```csharp
docker ps -a
```

可以看到刚运行起来的容器。

*   停止容器

```csharp
docker stop mongotodocker
```

*   ** 删除容器**。

```csharp
docker rm mongotodocker
```

*   删除镜像

```csharp
docker rmi mongo
```

 具体每个命令都有一些参数可用，这里只是简单介绍一下使用方法。具体的文档网上很多，不一一说明了。

## 4. 注册Docker账号

注册一个账号（可选项），地址：[https://hub.docker.com/](https://hub.docker.com/) ，可以在上面建自己的仓库。

## 5. 创建一个ASP.NET Core 项目，生成并运行Docker镜像

新建一个名为DockerComposeDemo的API项目，直接发布，拷贝发布的文件到CentOS系统中，例如/home/aspcore目录。并在该目录新建一个文本文件名为Dockerfile，内容如下：

```csharp
FROM mcr.microsoft.com/dotnet/core/aspnet:3.0-buster-slim AS base
    WORKDIR /app
    EXPOSE 80
    COPY . .
    ENTRYPOINT ["dotnet", "DockerComposeDemo.dll"]
```

含义是：引用包含3.0运行时的镜像，这个镜像在远程仓库中，若本地没有提前pull下来，会先执行pull操作获取到本地。然后将工作目录设为/app ， 拷贝发布的项目文件，设置进程的入口是通过dotnet运行DockerComposeDemo.dll。

执行如下命令：

```csharp
cd /home/aspcore
    docker build -t dockertest .
```

注意第二行后后面有个'.'不能少。 含义就是按照Dockerfile文件中设置的规则生成名为dockertest的镜像。

此时执行docker images命令可以看到本地镜像中已经有了 `mcr.microsoft.com/dotnet/core/aspnet:<span style="color: #800080;">3.0`-buster-slim</span> 和 `dockertest` 两个镜像。

运行这个镜像生成容器：

```csharp
docker run --name aspdocker -p 8080:80 -d dockertest
```

生成一个名为aspdocker 的容器，并将容器的80端口映射到主机的8080端口。访问项目默认提供的controller：[http://192.168.183.230:8080/WeatherForecast](http://192.168.183.230:8080/WeatherForecast) 

可以看到能正常访问。 

## 6. 使用docker-compose

因为一个Docker容器只建议运行一个应用，那么一个项目就可能会存在多个容器被运行，可能包含多个项目、数据库等，这时候就需要对这些容器进行统一的管理，从构建运行开始到运行后状态的监控等。

这时候有个简易的方法就是docker-compose，它可以完成多个Docker的统一管理，包括Docker镜像构建、容器运行、相关配置以及Docker之间的依赖关系等。

下面举个简单例子，这个DockerComposeDemo项目需要搭配一个MongoDB数据库，这样除了该项目外还需要一个Docker容器运行MongoDB数据库。

这时候用docker-compose就方便多了。docker-compose的核心是[docker-](https://github.com/FlyLolo/SomeDockerDemo/blob/master/DockerComposeDemo/docker-compose.yml "docker-compose.yml")compose.yml文件，看一下对应这个例子的文件内容：

```csharp
version: '3.4'

    services:
      demomvc:
        image: thisdemoimage
        build:
          context: .
          dockerfile: Dockerfile
        environment:
          - ASPNETCORE_DBCONN=mongodb://192.168.183.230:27089
          - ASPNETCORE_DBNAME=dockerdb

        ports:
          - "5103:80"
        depends_on:
          - mongodocker
      mongodocker:
        image: mongo
        ports:
          - "27089:27017"
```

 在services节点下定义了demomvc和mongodocker两个服务，一个是ASP.NET Core的项目，一个是MongoDB数据库。

每个节点下的image参数指定了采用的镜像名称，ports指定端口映射。**此处的MongoDB设置未涉及持久化，实际使用时要注意设置。**

ASP.NET Core的项目的thisdemoimage镜像是不存在的，下面指定了build方法。**当然也可以先创建好镜像然后在这里使用就像mongo服务的设置一样。**

depends_on表示本服务对另一个服务的依赖，本例中就是ASP.NET Core项目依赖MongoDB项目。

environment用于设置环境变量，作用是什么呢？

有一些设置，比如本例中的数据库连接，如果将连接字符串写在了项目中的appsettings.json中，而这个文件被“固化”到镜像中了，是不能修改的，除非重新生成镜像，非常麻烦。

所以可以通过这样的环境变量在外面设置。

将项目引用NuGet包MongoDB.Driver, 修改WeatherForecastController的get方法：

```csharp
[HttpGet]
            public IEnumerable<WeatherForecast> Get()
            {
                var rng = new Random();
                _mongoHelper.InsertOne(new WeatherForecast
                {
                    Date = DateTime.Now.AddDays(1),
                    TemperatureC = rng.Next(-20, 55),
                    Summary = Summaries[rng.Next(Summaries.Length)]
                });
                return _mongoHelper.FindList<WeatherForecast>();
            }
```

 每次都是先插入一条，然后返回所有记录。这里简要的写了一个mongoHelper：

```csharp
public class MongoHelper
        {
            private readonly IMongoDatabase database;
            public MongoHelper(IConfiguration configuration) : this(configuration["ASPNETCORE_DBCONN"], configuration.GetSection("ASPNETCORE_DBNAME").Value)
            {

            }
            public MongoHelper(string ConnectionString,string DBName)
            {
                MongoClient mongoClient = new MongoClient(ConnectionString);
                database = mongoClient.GetDatabase(DBName);
            }
            public List<T> FindList<T>(FilterDefinition<T> filter = null, string collectionName = null)
            {
                collectionName ??= typeof(T).Name;
                filter ??= new BsonDocument();
                var collection = database.GetCollection<T>(collectionName);
                return collection.Find(filter).ToList();
            }
            public void InsertOne<T>(T model, string collectionName = null)
            {
                collectionName ??= typeof(T).Name;
                var collection = database.GetCollection<T>(collectionName);
                collection.InsertOne(model);
            }
        }
```

连接字符串采用 IConfiguration中的设置。

**这里有个不算技巧的技巧，为了方便在非Docker的情况下测试，依然可以在appsettings.json文件中设置MongoDB的连接字符串，当部署到Docker中的时候，通过Docker环境变量配置的连接字符串会覆盖appsettings.json中的配置。**

**这是因为在讲述IConfiguration的文章中说过，系统是先加载appsettings.json中的设置，后加载环境变量中的设置的，二者的key相同，所以最终会以环境变量中的配置为准。**

 重新发布项目并将文件拷贝到/home/aspcore目录，其中的dockerfile文件不变，添加本例中的docker-compose.yml文件。

docker-compose是需要单独下载安装的, 执行命令:

```csharp
sudo curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

如果提示权限错误，需执行如下命令：

```csharp
sudo chmod +x /usr/local/bin/docker-compose
```

安装好之后执行 `docker-compose --version` 验证是否安装成功。

都准备好了，执行如下命令：

```csharp
cd /home/aspcore
    docker-compose up
```

 执行成功后访问 [http://192.168.183.230:5103/WeatherForecast](http://192.168.183.230:8080/WeatherForecast) 进行测试。

## 7. Windows下开发

我们都知道，VisualStudio经常“贴心”的帮我们做好多事，例如Git的图形化操作。对于Docker也是如此。

**若要在Windows环境下开发及调试Docker，可按下面步骤完成。**

首先需下载并安装**Docker Desktop**

 页面上有个图标：![](/blogimages/ASPNETCore_28/548134-20191030162140868-695504147.png)，点击下载。安装![](/blogimages/ASPNETCore_28/548134-20191030162206079-358902424.png)后右下角会有 图标，右键可以做一些设置。

它支持Windows和Linux两种主机

通过docker version 命令可以看出当前主机类型。也可以右键点击右下角的图标，有个Switch to ……的选项，可以知道当前主机类型，点击后切换到另一种类型。

命令切换：C:\Program Files\Docker\Docker\DockerCli.exe -SwitchDaemon

**解决方案启用Docker支持：**

新建项目的时候，勾选启用Docker支持：

 ![](/blogimages/ASPNETCore_28/548134-20191030171135510-1776092839.png)

已有项目可以右键点击项目，添加Docker支持：

 ![](/blogimages/ASPNETCore_28/548134-20191030171202301-805548079.png)

两种方式都会要求选择主机类型是Windows还是Linux。

此时Visual Studio帮我们会在项目中添加一个名为Dockerfile的文件：

```bash
FROM mcr.microsoft.com/dotnet/core/aspnet:3.0-buster-slim AS base
    WORKDIR /app
    EXPOSE 80

    FROM mcr.microsoft.com/dotnet/core/sdk:3.0-buster AS build
    WORKDIR /src
    COPY ["DockerDemo/DockerDemo.csproj", "DockerDemo/"]
    RUN dotnet restore "DockerDemo/DockerDemo.csproj"
    COPY . .
    WORKDIR "/src/DockerDemo"
    RUN dotnet build "DockerDemo.csproj" -c Release -o /app/build

    FROM build AS publish
    RUN dotnet publish "DockerDemo.csproj" -c Release -o /app/publish

    FROM base AS final
    WORKDIR /app
    COPY --from=publish /app/publish .
    ENTRYPOINT ["dotnet", "DockerDemo.dll"]
```

 这个文件和上面例子中我们自己创建的优点不同，它包含了4个From，第一个和最后一个和我们自己创建的有点像，只是Visual Studio帮我们自动添加了SDK镜像的拉取、项目的编译、项目发布的过程。

这里用到了两个镜像，第一个From调用了微软官方的包含ASP.NET Core 3.0 的运行时版镜像。第二个From用到了包含.Net Core 3.0的SDK的镜像，因为我们需要对项目进行生成和发布操作。

通过添加Docker的支持，可以使用Visual Studio开发并将项目自动发布到Docker进行调试。但选择系统环境为Windows的时候速度很快，选择Linux的时候由于网络问题非常慢。网上有临时的解决方案。

如果多个项目想采用docker-compose管理，在上面添加docker支持的图中可以看到有一个“容器业务流程协调程序支持”， 添加它就会自动生成一个docker-compose.yml文件。

Docker-Compose主要用于当前主机中的docker的管理，对于多主机的集群管理，就需要Docker Swarm或者Kubernetes了。