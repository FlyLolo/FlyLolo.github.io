---
title: 五.服务的加载与运行
date: 2018-02-27
tags:
 - Spring-ReadCode
categories:
 -  Java
---

最近打算阅读spring-framework的源码，按照GitHub中在spring-framework项目中给出的编译和导入IntelliJ IDEA的方式进行操作，其中还是遇到了各种各样的问题。主要是环境，最好都用新的，JDK17、Idea 2021、Gradle7.2、Tomcat10等，然后就是多次重试。最终还是成功了，文章末尾也列了几个遇到的问题及最终存在我的GitHub中的地址。     

## 1. 获取spring-framework源码

地址：[spring-projects/spring-framework: Spring Framework (github.com)](https://github.com/spring-projects/spring-framework)

目前看到最新的Tag是v5.3.10。

可以直接将最新代码clone到本地，如果想在代码做一些注释，也可以Fork到自己的仓库。本文采用Fork的方式，并添加了测试module。

## 2. 导入到IDEA

项目的wiki中给出了导入到 Eclipse 和 IntelliJ IDEA的方式：Ensure JDK 17 is configured properly in the IDE. Follow instructions for [Eclipse](https://github.com/spring-projects/spring-framework/blob/master/import-into-eclipse.md) and [IntelliJ IDEA](https://github.com/spring-projects/spring-framework/blob/master/import-into-idea.md).

**要求安装 JDK17**，根据自己的需求选择导入到 Eclipse 或 IntelliJ IDEA。对应的文档在下载的代码根目录也有，分别为**import-into-eclipse.md**和**import-into-idea.md**。本文为IDEA方式。

### 2.1 预编译spring-oxm

在代码目录打开cmd，输入命令`gradlew :spring-oxm:compileTestJava`（windows系统无需输入“./”），开始编译。

若出现如下错误，需检查JAVA_HOME是否已正确配置了JDK17：

![image-20210927104430419](/blogimages/spring-readcode-1/image-20210927104430419-16341082442501.png)



若未安装配置gradle，会自动下载安装。默认情况下，下载的包会存放在C:\\Users\用户名\\.gradle文件夹下。若C盘空间比较紧张想放到别的目录，可以配置一下名为GRADLE_USER_HOME的环境变量，将其值设置为新的目录。gradle的安装配置和maven类似，如果自己安装最好按照源码中的版本。

可以查看`spring-framework\gradle\wrapper`文件夹下的`gradle-wrapper.properties`文件中的`distributionUrl`的配置，例如目前代码采用的Gradle版本为7.2.

```
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-7.2-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

等待编译完成即可，最终结果类似如下情况。

![image-20210927114916527](/blogimages/spring-readcode-1/image-20210927114916527.png)

连接Github经常出现网络问题，若出现错误重新执行这个命令几次。

### 2.2 导入到Idea

依次点击菜单File->New->Project From Existing sources,出现如下对话框

![image-20210927132450092](/blogimages/spring-readcode-1/image-20210927132450092.png)

选择Gradle，提示信任此项目，选择Trust Project

![image-20210927132507897](/blogimages/spring-readcode-1/image-20210927132507897.png)

点击下图箭头所示的Reload All Gradle Projects

![image-20211013134551420](/blogimages/spring-readcode-1/image-20211013134551420.png)

可以在Idea的Build日志中看到如下输出

![image-20210927173411138](/blogimages/spring-readcode-1/image-20210927173411138.png)

第一次会下载很多依赖包，比较慢，慢慢等待。网上有说用阿里云Maven服务的，会快一些。但有时候个别包下载失败，不着急就慢慢等吧。直至Build完成，如果中途失败可以多试几次。

## 3 添加用于测试的SpringMVC项目Module

想调试不同的子项目，可以根据需要新建不同类型的测试Module。现在新建一个SpringMVC的Module用于调试spring-webmvc子项目及其依赖的子项目。

### 3.1 创建Module

依次点击菜单File->New->Module, 在弹出的对话框中选择Gradle，如下图**勾选Java和Web两个选项**，点击Next按钮进行下一步

![image-20211013140101349](/blogimages/spring-readcode-1/image-20211013140101349.png)

设置项目的名字，本例名为flylolo-readcode

![image-20211013140146814](/blogimages/spring-readcode-1/image-20211013140146814.png)



点击Finish完成设置，项目开始创建，等待项目创建完成。

查看根目录的settings.gradle文件，可以看到其中添加了如下一行。

```
include 'flylolo-readcode'
```

### 3.2 添加对spring-webmvc的依赖

编辑build.gradle,在dependencies内添加spring-webmvc的依赖：

```
implementation(project(":spring-webmvc"))
```

保存并点击Gradle面板中的Reload按钮，重新加载依赖，最终可以看到flylolo-readcode项目的依赖中出现了。

![image-20211013140832221](/blogimages/spring-readcode-1/image-20211013140832221.png)

### 3.3 添加MVC相关文件

添加mvc相关文件，文件结构如下：

![image-20211013141106582](/blogimages/spring-readcode-1/image-20211013141106582.png)

①首先添加一个Controller：

```
package cn.flylolo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author FlyLolo
 * @date 2021/10/9 16:42
 */
@RestController
@RequestMapping("user")
public class UserController {
    @GetMapping("")
    public String helloWorld(){
        return "Hello World!";
    }
}
```

②在resources目录下新建springmvc.xml文件：

```
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        http://www.springframework.org/schema/context/spring-context.xsd http://www.springframework.org/schema/mvc http://www.springframework.org/schema/mvc/spring-mvc.xsd">

    <context:component-scan base-package="cn.flylolo"/>
    <mvc:annotation-driven />
    <mvc:default-servlet-handler />
</beans>
```



③webapp目录下新建WEB-INF文件夹，其中新建web.xml文件：

```
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xmlns="http://java.sun.com/xml/ns/javaee"
         xsi:schemaLocation="http://java.sun.com/xml/ns/javaee http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd"
         id="WebApp_ID" version="3.0">
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>classpath:springmvc.xml</param-value>
    </context-param>
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>
    <!--配置springmvc核心servlet-->
    <servlet>
        <servlet-name>springmvc</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>classpath:springmvc.xml</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>
    <servlet-mapping>
        <servlet-name>springmvc</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>
</web-app>
```

### 3.4 设置Artifacts

打开File->Project Struture设置，左侧切换到Artifacts，可以看到已经自动生成的两个Artifact，选择带"exploded"后缀的，做如下修改：

Name比较长，可以自行修改，不改也可以，本例改为flylolo-readcode

Output directory自动生成的路径有问题，去掉"exploded",   例如本例改为：F:\spring-framework\flylolo-readcode\build\libs\flylolo-readcode-6.0.0-SNAPSHOT.war。

最终结果如下图：

![image-20211013141618675](/blogimages/spring-readcode-1/image-20211013141618675.png)

### 3.5 配置Tomcat服务

打开Run/Debug Configuration, 点击左上角的加号，选择Tomcat Server->Local。

![image-20211009175556466](/blogimages/spring-readcode-1/image-20211009175556466.png)



HTTP prot默认为8080，若已被使用则改为其他的端口。

![image-20211013141902093](/blogimages/spring-readcode-1/image-20211013141902093.png)

选择artifacts，点击右下角的Fix按钮，跳转到Deployment标签，选择刚刚配置的flylolo-readcode。

![image-20211009175804352](/blogimages/spring-readcode-1/image-20211009175804352.png)

保存并启动项目，访问UserController，地址：http://localhost:8099/flylolo_readcode/user

![image-20211013142150610](C:\Users\luozhichao\AppData\Roaming\Typora\typora-user-images\image-20211013142150610.png)

### 3.6 添加json解析：

如果只是返回String类型是没问题了，但大多数需要返回的时候Json类型。

新建一个User类：

```
package cn.flylolo.model;

import lombok.Data;

/**
 * @author FlyLolo
 * @date 2021/10/11 11:18
 */
@Data
public class User {
    private String userId;
    private String userName;
}
```

这里用到了lombok，需要在build.gradle中添加引用。

```
implementation 'org.projectlombok:lombok:1.18.20'
annotationProcessor 'org.projectlombok:lombok:1.18.20'
```

注意需要添加第二行，否则在调用对应的get和set方法的时候会出现 “错误: 找不到符号”的错误。

在UserController中添加新的方法：

```
@GetMapping("/{userId}")
public User getName(@PathVariable String userId){
    User user = new User();
    user.setUserId(userId);
    user.setUserName(userId + "的名字");
    return user;
}
```

将返回一个User对象。

访问http://localhost:8099/flylolo_readcode/user/testid，返回了406，不可接收错误。

![image-20211013142608922](/blogimages/spring-readcode-1/image-20211013142608922.png)

因为返回Json类型，需要添加对应的`message-converters`,本例采用FastJson。用下面代码替换springmvc.xml中的`<mvc:annotation-driven />`

```
<mvc:annotation-driven>
    <mvc:message-converters register-defaults="true">
        <!-- 配置Fastjson支持 -->
        <bean class="com.alibaba.fastjson.support.spring.FastJsonHttpMessageConverter">
            <property name="supportedMediaTypes">
                <list>
                    <value>application/json</value>
                    <value>text/html;charset=UTF-8</value>
                </list>
            </property>
        </bean>
    </mvc:message-converters>
</mvc:annotation-driven>
```

这需要在build.gradle中添加FastJson的引用：

```
implementation 'com.alibaba:fastjson:1.2.78'
```

再次访问http://localhost:8099/flylolo_readcode/user/testid，得到了期望的结果。

![image-20211013142846167](/blogimages/spring-readcode-1/image-20211013142846167.png)

至此，源码阅读环境准备完毕。

## 4. 遇到的问题



### 4.1 gradle进行build的时候，中文出现乱码：

Help->Edit Custom VM Options, 添加如下代码：

```
-Dfile.encoding=UTF-8
```

### 4.2 gradle项目，用了lombok，调用setXXX提示“找不到符号"的错误，需在build.gradle中做如下方式引用

```
//添加annotationProcessor，否则会出现找不到符号的错误
annotationProcessor 'org.projectlombok:lombok:1.18.20'
implementation 'org.projectlombok:lombok:1.18.20'
```

### 4.3 服务启动报错问题

服务无法正常启动，报错“org.apache.tomcat.util.modeler.BaseModelMBean.invoke 调用方法[manageApp]时发生异常 java.lang.IllegalStateException: 启动子级时出错”，详细错误如下：

```
Connected to server
[2021-10-11 03:30:50,531] Artifact flylolo-readcode: Artifact is being deployed, please wait...
11-Oct-2021 15:30:50.793 严重 [RMI TCP Connection(3)-127.0.0.1] org.apache.tomcat.util.modeler.BaseModelMBean.invoke 调用方法[manageApp]时发生异常
	java.lang.IllegalStateException: 启动子级时出错
		at org.apache.catalina.core.ContainerBase.addChildInternal(ContainerBase.java:729)
		at org.apache.catalina.core.ContainerBase.addChild(ContainerBase.java:698)
		at org.apache.catalina.core.StandardHost.addChild(StandardHost.java:696)
		at org.apache.catalina.startup.HostConfig.manageApp(HostConfig.java:1783)
		at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
		at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:77)
		at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
		at java.base/java.lang.reflect.Method.invoke(Method.java:568)
		at org.apache.tomcat.util.modeler.BaseModelMBean.invoke(BaseModelMBean.java:293)
		at java.management/com.sun.jmx.interceptor.DefaultMBeanServerInterceptor.invoke(DefaultMBeanServerInterceptor.java:814)
		at java.management/com.sun.jmx.mbeanserver.JmxMBeanServer.invoke(JmxMBeanServer.java:802)
		at org.apache.catalina.mbeans.MBeanFactory.createStandardContext(MBeanFactory.java:460)
		at org.apache.catalina.mbeans.MBeanFactory.createStandardContext(MBeanFactory.java:408)
		at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
		at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:77)
		at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
		at java.base/java.lang.reflect.Method.invoke(Method.java:568)
		at org.apache.tomcat.util.modeler.BaseModelMBean.invoke(BaseModelMBean.java:293)
		at java.management/com.sun.jmx.interceptor.DefaultMBeanServerInterceptor.invoke(DefaultMBeanServerInterceptor.java:814)
		at java.management/com.sun.jmx.mbeanserver.JmxMBeanServer.invoke(JmxMBeanServer.java:802)
		at java.management/com.sun.jmx.remote.security.MBeanServerAccessController.invoke(MBeanServerAccessController.java:472)
		at java.management.rmi/javax.management.remote.rmi.RMIConnectionImpl.doOperation(RMIConnectionImpl.java:1472)
		at java.management.rmi/javax.management.remote.rmi.RMIConnectionImpl$PrivilegedOperation.run(RMIConnectionImpl.java:1310)
		at java.base/java.security.AccessController.doPrivileged(AccessController.java:712)
		at java.management.rmi/javax.management.remote.rmi.RMIConnectionImpl.doPrivilegedOperation(RMIConnectionImpl.java:1412)
		at java.management.rmi/javax.management.remote.rmi.RMIConnectionImpl.invoke(RMIConnectionImpl.java:829)
		at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
		at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:77)
		at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
		at java.base/java.lang.reflect.Method.invoke(Method.java:568)
		at java.rmi/sun.rmi.server.UnicastServerRef.dispatch(UnicastServerRef.java:360)
		at java.rmi/sun.rmi.transport.Transport$1.run(Transport.java:200)
		at java.rmi/sun.rmi.transport.Transport$1.run(Transport.java:197)
		at java.base/java.security.AccessController.doPrivileged(AccessController.java:712)
		at java.rmi/sun.rmi.transport.Transport.serviceCall(Transport.java:196)
		at java.rmi/sun.rmi.transport.tcp.TCPTransport.handleMessages(TCPTransport.java:587)
		at java.rmi/sun.rmi.transport.tcp.TCPTransport$ConnectionHandler.run0(TCPTransport.java:828)
		at java.rmi/sun.rmi.transport.tcp.TCPTransport$ConnectionHandler.lambda$run$0(TCPTransport.java:705)
		at java.base/java.security.AccessController.doPrivileged(AccessController.java:399)
		at java.rmi/sun.rmi.transport.tcp.TCPTransport$ConnectionHandler.run(TCPTransport.java:704)
		at java.base/java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1136)
		at java.base/java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:635)
		at java.base/java.lang.Thread.run(Thread.java:833)
	Caused by: org.apache.catalina.LifecycleException: 无法启动组件[StandardEngine[Catalina].StandardHost[localhost].StandardContext[/flylolo_readcode]]
		at org.apache.catalina.util.LifecycleBase.handleSubClassException(LifecycleBase.java:440)
		at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:198)
		at org.apache.catalina.core.ContainerBase.addChildInternal(ContainerBase.java:726)
		... 42 more
	Caused by: java.lang.NoClassDefFoundError: jakarta/servlet/ServletContainerInitializer
		at java.base/java.lang.ClassLoader.defineClass1(Native Method)
		at java.base/java.lang.ClassLoader.defineClass(ClassLoader.java:1012)
		at java.base/java.security.SecureClassLoader.defineClass(SecureClassLoader.java:150)
		at org.apache.catalina.loader.WebappClassLoaderBase.findClassInternal(WebappClassLoaderBase.java:2478)
		at org.apache.catalina.loader.WebappClassLoaderBase.findClass(WebappClassLoaderBase.java:870)
		at org.apache.catalina.loader.WebappClassLoaderBase.loadClass(WebappClassLoaderBase.java:1371)
		at org.apache.catalina.loader.WebappClassLoaderBase.loadClass(WebappClassLoaderBase.java:1215)
		at java.base/java.lang.Class.forName0(Native Method)
		at java.base/java.lang.Class.forName(Class.java:467)
		at org.apache.catalina.startup.WebappServiceLoader.loadServices(WebappServiceLoader.java:226)
		at org.apache.catalina.startup.WebappServiceLoader.load(WebappServiceLoader.java:197)
		at org.apache.catalina.startup.ContextConfig.processServletContainerInitializers(ContextConfig.java:1840)
		at org.apache.catalina.startup.ContextConfig.webConfig(ContextConfig.java:1298)
		at org.apache.catalina.startup.ContextConfig.configureStart(ContextConfig.java:986)
		at org.apache.catalina.startup.ContextConfig.lifecycleEvent(ContextConfig.java:303)
		at org.apache.catalina.util.LifecycleBase.fireLifecycleEvent(LifecycleBase.java:123)
		at org.apache.catalina.core.StandardContext.startInternal(StandardContext.java:5135)
		at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:183)
		... 43 more
	Caused by: java.lang.ClassNotFoundException: jakarta.servlet.ServletContainerInitializer
		at org.apache.catalina.loader.WebappClassLoaderBase.loadClass(WebappClassLoaderBase.java:1407)
		at org.apache.catalina.loader.WebappClassLoaderBase.loadClass(WebappClassLoaderBase.java:1215)
		... 61 more
```

通过错误信息中的“Caused by: java.lang.ClassNotFoundException: jakarta.servlet.ServletContainerInitializer”可以看出是缺少对应的包，网上搜了有类似的错误，少的却不是这个包，后来尝试把Tomcat改为10.0.12（出错时为Tomcat 9），此问题解决，应该是最新的Tomcat中存在此包。

## 5 GitHub地址

https://github.com/FlyLolo/spring-framework
