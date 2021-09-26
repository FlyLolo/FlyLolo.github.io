(window.webpackJsonp=window.webpackJsonp||[]).push([[43],{548:function(s,a,t){"use strict";t.r(a);var e=t(7),r=Object(e.a)({},(function(){var s=this,a=s.$createElement,t=s._self._c||a;return t("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[t("p",[s._v("本文聊一下如何在Windows上用VS开发并发布， 然后将其部署到CentOS上。对于我们一些常在Windows上逛的来说，CentOS用起来还真有些麻烦。MSDN官方有篇文章大概讲了一下（"),t("a",{attrs:{href:"https://docs.microsoft.com/zh-cn/aspnet/core/host-and-deploy/linux-apache?tabs=aspnetcore2x",target:"_blank",rel:"noopener noreferrer"}},[s._v("链接"),t("OutboundLink")],1),s._v("），按照MSDN上面的例子用vs创建个hellomvc项目，还是踩了好多坑，将整个过程和遇到的坑说一下，希望对有需要的朋友有所帮助。")]),s._v(" "),t("p",[s._v("本文主要内容：")]),s._v(" "),t("p",[s._v("1.工具准备")]),s._v(" "),t("p",[s._v("2.CentOS 上安装.NET Core环境")]),s._v(" "),t("p",[s._v("3.Windows上用VS发布项目")]),s._v(" "),t("p",[s._v("4.项目运行测试")]),s._v(" "),t("p",[s._v("5.安装并配置Apache")]),s._v(" "),t("p",[s._v("6.创建service管理应用")]),s._v(" "),t("p",[s._v("7.其他注意事项")]),s._v(" "),t("p",[s._v("8.独立部署（SCD）")]),s._v(" "),t("p",[t("span",{staticStyle:{color:"#ff6600"}},[s._v("  9.2018.5.8文章更新：Visual Studio 2017 15.7版本的项目发布提供了部署模式（框架依赖和独立部署）和目标运行时（win、osx、linux）的选择功能")])]),s._v(" "),t("p",[s._v("示意图：")]),s._v(" "),t("p",[t("img",{attrs:{src:"/blogimages/ASPNETCore2_9/548134-20180502111537901-311287491.png",alt:""}})]),s._v(" "),t("p",[s._v("最近在阿里云上弄了个ECS玩，既然.NET Core跨平台了，也就选了个CentOS的系统，然后踩坑开始。")]),s._v(" "),t("h2",{attrs:{id:"_1-工具准备"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_1-工具准备"}},[s._v("#")]),s._v(" 1. 工具准备")]),s._v(" "),t("p",[s._v("Putty：阿里云提供了一个网页方式远程操作CentOS的命令行工具，没找到怎么粘贴，挺不好用的。这个是一个命令行的小软件，也省去了每次都要登录阿里云控制台的步骤。"),t("a",{attrs:{href:"https://the.earth.li/~sgtatham/putty/latest/w64/putty.exe",target:"_blank",rel:"noopener noreferrer"}},[s._v("链接"),t("OutboundLink")],1)]),s._v(" "),t("p",[s._v("FileZila：sftp工具，用于将windows上生成的发布包弄到CentOS上去。"),t("a",{attrs:{href:"https://download.filezilla-project.org/client/FileZilla_3.32.0_win64-setup_bundled.exe",target:"_blank",rel:"noopener noreferrer"}},[s._v("链接"),t("OutboundLink")],1)]),s._v(" "),t("h2",{attrs:{id:"_2-centos-上安装-net-core环境"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_2-centos-上安装-net-core环境"}},[s._v("#")]),s._v(" 2. CentOS 上安装.NET Core环境")]),s._v(" "),t("p",[s._v("安装.NET Core的环境有两种方式，SDK和Runtime，区别类似java的JDK和JRE。")]),s._v(" "),t("p",[s._v("官方提供的"),t("a",{attrs:{href:"https://www.microsoft.com/net/download/linux/run",target:"_blank",rel:"noopener noreferrer"}},[s._v("下载页面"),t("OutboundLink")],1),s._v("用Build Apps 和Run Apps描述这两个， 我们不需要在CentOS上编码， 所以安装Runtime就够了。")]),s._v(" "),t("p",[s._v("在页面的all downloads中找到CentOS对应的Runtime版本页面（"),t("a",{attrs:{href:"https://www.microsoft.com/net/download/linux-package-manager/centos/runtime-2.0.6",target:"_blank",rel:"noopener noreferrer"}},[s._v("链接"),t("OutboundLink")],1),s._v("）进行安装，这里要注意一下：")]),s._v(" "),t("p",[t("span",{staticStyle:{color:"#ff6600"}},[s._v("坑一：版本问题，看了一下自己的VS中项目的Microsoft.AspNetCore.All版本是2.0.6， 也就去找了Runtime的2.0.6版本， 否则容易出现某些组件在VS上的引用版本和CentOS上的环境中的版本不一致的错误。")])]),s._v(" "),t("p",[t("span",{staticStyle:{color:"#000000"}},[s._v(" 通过Putty链接到CentOS服务器，按照该页面上的步骤执行如下命令：")])]),s._v(" "),t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token number"}},[s._v("1")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("rpm")]),s._v(" --import https://packages.microsoft.com/keys/microsoft.asc\n"),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("sh")]),s._v(" -c "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v("'echo -e \"[packages-microsoft-com-prod]\\nname=packages-microsoft-com-prod \\nbaseurl= https://packages.microsoft.com/yumrepos/microsoft-rhel7.3-prod\\nenabled=1\\ngpgcheck=1\\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc\" > /etc/yum.repos.d/dotnetdev.repo'")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("3")]),s._v(" \n"),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("4")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" yum update\n"),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("5")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" yum "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("install")]),s._v(" libunwind libicu\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br")])]),t("p",[t("span",{staticStyle:{color:"#ff6600"}},[s._v("最后还有下面关键一步我执行后部署仍会有提示某包找不到的问题，")])]),s._v(" "),t("div",{staticClass:"language-csharp line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-csharp"}},[t("code",[s._v("sudo yum install dotnet"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("-")]),s._v("runtime"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("-")]),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2.0")]),t("span",{pre:!0,attrs:{class:"token number"}},[s._v(".6")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br")])]),t("p",[s._v("在github上看到这样一段话：")]),s._v(" "),t("div",{staticClass:"language-csharp line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-csharp"}},[t("code",[s._v("Linux\nOn supported "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Linux")]),s._v(" systems"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" register the Microsoft Product feed "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("as")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("described")]),s._v(" above "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("and")]),s._v(" install dotnet"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("-")]),s._v("hosting"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("-")]),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2.0")]),t("span",{pre:!0,attrs:{class:"token number"}},[s._v(".6")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("using")]),s._v(" your package manager"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v(" This will also install the "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("NET Core Runtime "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("and")]),s._v(" other required packages"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br")])]),t("p",[s._v("后来测试了一下不安装dotnet-runtime-"),t("span",{attrs:{"data-mce-":""}},[s._v("2.0."),t("span",{attrs:{"data-mce-":""}},[s._v("6")])]),s._v("而是安装dotnet-hosting-"),t("span",{attrs:{"data-mce-":""}},[s._v("2.0."),t("span",{attrs:{"data-mce-":""}},[s._v("6")])]),s._v("成功。")]),s._v(" "),t("div",{staticClass:"language-csharp line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-csharp"}},[t("code",[s._v("sudo yum install dotnet"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("-")]),s._v("hosting"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("-")]),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2.0")]),t("span",{pre:!0,attrs:{class:"token number"}},[s._v(".6")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br")])]),t("h2",{attrs:{id:"_3-windows上用vs发布项目"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_3-windows上用vs发布项目"}},[s._v("#")]),s._v(" 3. Windows上用VS发布项目")]),s._v(" "),t("p",[s._v("右键项目选择发布，默认情况下是FDD（依赖框架部署），发布生成的内容不包含依赖的框架内容，将依赖上文安装的runtime。")]),s._v(" "),t("p",[s._v("在CentOS上创建个文件夹， 通过FileZila将发布的文件上传到该文件夹。")]),s._v(" "),t("p",[s._v("参考创建目录命令： "),t("code",[s._v('mkdir -p /<span style="color: #0000ff;">var')]),s._v("/aspnetcore/hellomvc")]),s._v(" "),t("h2",{attrs:{id:"_4-项目运行测试"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_4-项目运行测试"}},[s._v("#")]),s._v(" 4. 项目运行测试")]),s._v(" "),t("p",[s._v("执行命令运行上传后的项目：")]),s._v(" "),t("div",{staticClass:"language-csharp line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-csharp"}},[t("code",[s._v("dotnet "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("var")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),s._v("aspnetcore"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),s._v("hellomvc"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),s._v("hellomvc"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("dll\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br")])]),t("p",[s._v("我们都知道，默认情况下，项目采用的事5000端口，我运行项目时遇到了端口冲突，可能是被占用了吧，VS中修改一下Program.cs, 将端口改为常用的8080")]),s._v(" "),t("div",{staticClass:"language-csharp line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-csharp"}},[t("code",[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("public")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("static")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token return-type class-name"}},[s._v("IWebHost")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("BuildWebHost")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("string")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")])]),s._v(" args"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=>")]),s._v("\n        WebHost"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("CreateDefaultBuilder")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("args"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n        "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("UseUrls")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"http://*:8080"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n            "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token generic-method"}},[t("span",{pre:!0,attrs:{class:"token function"}},[s._v("UseStartup")]),t("span",{pre:!0,attrs:{class:"token generic class-name"}},[t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("<")]),s._v("Startup"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(">")])])]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v("\n            "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("Build")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br")])]),t("p",[s._v("重新发布并上传，执行上面的命令成功，提示"),t("span",{attrs:{"data-ttu-id":"24e91-142"}},[s._v("Kestrel")]),s._v("开始监听8080端口。")]),s._v(" "),t("p",[s._v("浏览器访问一下http://ip:8080")]),s._v(" "),t("p",[t("img",{attrs:{src:"/blogimages/ASPNETCore2_9/548134-20180428171317951-1548356450.png",alt:""}})]),s._v(" "),t("p",[s._v("结果如上图很怪异，"),t("span",{staticStyle:{color:"#ff6600"}},[s._v("坑二出现，")]),s._v("按F12查看一下提示找不到xxx.css  xxx.js等，通过FileZila确认对应的css和js文件都已成功上传在指定位置。")]),s._v(" "),t("p",[s._v("第一感觉是没有执行UseStaticFiles()， 确认了一下已执行。接着又怀疑是目录大小写问题，一 一排除， 均正常。")]),s._v(" "),t("p",[s._v("后来先cd到发布目录，再次执行，终于成功。")]),s._v(" "),t("div",{staticClass:"language-csharp line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-csharp"}},[t("code",[s._v("cd "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("var")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),s._v("aspnetcore"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),s._v("hellomvc\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br")])]),t("p",[s._v("结果如我们熟悉的下图：")]),s._v(" "),t("p",[t("img",{attrs:{src:"/blogimages/ASPNETCore2_9/548134-20180428171329166-2060405090.png",alt:""}})]),s._v(" "),t("h2",{attrs:{id:"_5-安装并配置apache"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_5-安装并配置apache"}},[s._v("#")]),s._v(" 5. 安装并配置Apache")]),s._v(" "),t("p",[s._v("安装Apache，并配置反向代理， 将80端口请求转给上面的8080端口由"),t("span",{attrs:{"data-ttu-id":"24e91-142"}},[s._v("Kestrel")]),s._v("处理。")]),s._v(" "),t("p",[s._v("安装并启动Apache")]),s._v(" "),t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" yum -y "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("install")]),s._v(" httpd mod_ssl\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" systemctl start httpd\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br")])]),t("p",[s._v("访问一下http://ip ，页面是Apache的默认页面，安装成功。")]),s._v(" "),t("p",[t("img",{attrs:{src:"/blogimages/ASPNETCore2_9/548134-20180428171340250-910561158.png",alt:""}})]),s._v(" "),t("p",[s._v("配置代理，创建并打开文件hellomvc.conf：")]),s._v(" "),t("div",{staticClass:"language-csharp line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-csharp"}},[t("code",[s._v("nano "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),s._v("etc"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),s._v("httpd"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),s._v("conf"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("d"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),s._v("hellomvc"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("conf\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br")])]),t("p",[s._v("nano是一个文本编辑工具，如果提示  nano: command not found   可能nano没有安装"),t("br"),s._v("\n执行   "),t("code",[s._v("yum install nano")]),s._v("  命令安装即可。")]),s._v(" "),t("p",[s._v("hellomvc.conf文件内写入如下内容：")]),s._v(" "),t("div",{staticClass:"language-xml line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-xml"}},[t("code",[t("span",{pre:!0,attrs:{class:"token tag"}},[t("span",{pre:!0,attrs:{class:"token tag"}},[t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("<")]),s._v("VirtualHost")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token attr-name"}},[t("span",{pre:!0,attrs:{class:"token namespace"}},[s._v("*:")]),s._v("80")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(">")])]),s._v("\n    ProxyPreserveHost On\n    ProxyPass / http://127.0.0.1:8080/\n    ProxyPassReverse / http://127.0.0.1:8080/\n    ServerName www.example.com\n    ServerAlias *.example.com\n    ErrorLog ${APACHE_LOG_DIR}hellomvc-error.log\n    CustomLog ${APACHE_LOG_DIR}hellomvc-access.log common\n"),t("span",{pre:!0,attrs:{class:"token tag"}},[t("span",{pre:!0,attrs:{class:"token tag"}},[t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("</")]),s._v("VirtualHost")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(">")])]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br"),t("span",{staticClass:"line-number"},[s._v("8")]),t("br"),t("span",{staticClass:"line-number"},[s._v("9")]),t("br")])]),t("p",[s._v("重启Apache服务并将该服务设置为自动启动：")]),s._v(" "),t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" systemctl restart httpd\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" systemctl "),t("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("enable")]),s._v(" httpd\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br")])]),t("p",[s._v("再次通过 "),t("code",[s._v('dotnet /<span style="color: #0000ff;">var')]),s._v("/aspnetcore/hellomvc/hellomvc.dll"),s._v(" 将项目运行起来后，访问 "),t("code",[s._v('http:<span style="color: #008000;">//')]),t("span",{staticStyle:{color:"#008000"}},[s._v("ip ")]),s._v(" 或者 "),t("code",[s._v('http:<span style="color: #008000;">//')]),t("span",{staticStyle:{color:"#008000"}},[s._v("ip:8080")]),s._v(" 均访问正常。")]),s._v(" "),t("p",[t("span",{staticStyle:{color:"#ff6600"}},[s._v("到现在可能有人比较疑惑， 既然之前的项目已经可以正常访问了，为什么还要用Apache？在项目中直接指定监听80端口不就已经OK？   因为这样做该服务直接占用了80端口， 但有些情况下，我们需要将来自不同域名的访问指定到不同的端口处理，例如可以将a.com的请求指定到8080，将b.com的请求指定到8081.  当然， 如果没有这样的需求，直接用"),t("span",{attrs:{"data-ttu-id":"24e91-142"}},[s._v("Kestrel")]),s._v("做服务而不用反向代理。")])]),s._v(" "),t("p",[t("span",{staticStyle:{color:"#ff6600"}},[s._v(" 另外每次通过命令 "),t("code",[s._v("dotnet xxx.dll")]),s._v(" 的方式来启动也不是个很好的体验，我们可以创建个service来管理它， 这也有点向windows的service。")])]),s._v(" "),t("h2",{attrs:{id:"_6-创建service管理应用"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_6-创建service管理应用"}},[s._v("#")]),s._v(" 6. 创建service管理应用")]),s._v(" "),t("p",[s._v("再次用nano创建文件：")]),s._v(" "),t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("nano")]),s._v(" /etc/systemd/system/kestrel-hellomvc.service\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br")])]),t("p",[s._v("文件内容如下：")]),s._v(" "),t("div",{staticClass:"language-csharp line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-csharp"}},[t("code",[t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),t("span",{pre:!0,attrs:{class:"token attribute"}},[t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Unit")])]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\nDescription"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("Example "),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("NET Web API App running "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("on")]),s._v(" CentOS "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("7")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("Service"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\nWorkingDirectory"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("var")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),s._v("aspnetcore"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("hellomvc")]),s._v("\nExecStart"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),s._v("usr"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),s._v("local"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),s._v("bin"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),s._v("dotnet "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("var")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),s._v("aspnetcore"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),s._v("hellomvc"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("hellomvc"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("dll")]),s._v("\nRestart"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("always\n"),t("span",{pre:!0,attrs:{class:"token preprocessor property"}},[s._v("# Restart service after 10 seconds if dotnet service crashes")]),s._v("\nRestartSec"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("10")]),s._v("\nSyslogIdentifier"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("dotnet"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("-")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("example")]),s._v("\nUser"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("apache")]),s._v("\nEnvironment"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("ASPNETCORE_ENVIRONMENT"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("Production \n\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("Install"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v("\nWantedBy"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("multi"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("-")]),s._v("user"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("target\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br"),t("span",{staticClass:"line-number"},[s._v("8")]),t("br"),t("span",{staticClass:"line-number"},[s._v("9")]),t("br"),t("span",{staticClass:"line-number"},[s._v("10")]),t("br"),t("span",{staticClass:"line-number"},[s._v("11")]),t("br"),t("span",{staticClass:"line-number"},[s._v("12")]),t("br"),t("span",{staticClass:"line-number"},[s._v("13")]),t("br"),t("span",{staticClass:"line-number"},[s._v("14")]),t("br"),t("span",{staticClass:"line-number"},[s._v("15")]),t("br")])]),t("p",[s._v("保存并启动服务：")]),s._v(" "),t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[s._v("systemctl "),t("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("enable")]),s._v(" kestrel-hellomvc.service\nsystemctl start kestrel-hellomvc.service\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br")])]),t("p",[s._v("查看是否成功：")]),s._v(" "),t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[s._v("systemctl status kestrel-hellomvc.service\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br")])]),t("p",[s._v("在此处我遇到了问题，提示出错，..........(code=exited, status=203/EXEC)..............  kestrel-hellomvc.service failed。坑三出现，又是各种搜索，后来发现msdn中提供的上面的kestrel-hellomvc.service文件内容中的 "),t("code",[s._v("ExecStart=/usr/local/bin/dotnet")]),s._v(" 在我的CentOS系统中不存在，通过 "),t("code",[s._v("which dotnet")]),s._v(" 查看我的系统中是在 "),t("code",[s._v("/usr/bin/dotnet")]),s._v(" ，修改kestrel-hellomvc.service重新执行 "),t("code",[s._v("systemctl start kestrel-hellomvc.service")]),s._v(" 提示成功。注意修改该文件后会提示先执行 "),t("code",[s._v("systemctl daemon-reload")]),s._v(" 重新加载。")]),s._v(" "),t("p",[s._v("至此，主要工作均已完成。")]),s._v(" "),t("h2",{attrs:{id:"_7-其他注意事项"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_7-其他注意事项"}},[s._v("#")]),s._v(" 7. 其他注意事项")]),s._v(" "),t("h3",{attrs:{id:"a-kestrel-hellomvc-service中的user-apache"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#a-kestrel-hellomvc-service中的user-apache"}},[s._v("#")]),s._v(" A.kestrel-hellomvc.service中的"),t("span",{attrs:{"data-mce-":""}},[s._v("User="),t("span",{attrs:{"data-mce-":""}},[s._v("apache")])])]),s._v(" "),t("p",[t("span",{attrs:{"data-mce-":""}},[t("span",{attrs:{"data-mce-":""}},[s._v(" 在安装Apache之前，通过 "),t("code",[s._v('dotnet /<span style="color: #0000ff;">var')]),s._v("/aspnetcore/hellomvc/hellomvc.dll")]),s._v(" 已经可以将项目运行起来了， 那时候就想先创建Service，因为觉得这与Apache无关， 结果service总是启动失败，后来才注意到了这个"),t("span",{attrs:{"data-mce-":""}},[s._v("User="),t("span",{attrs:{"data-mce-":""}},[s._v("apache")])]),s._v("，这里要求这个User存在并且拥有相应的权限。由于对CentOS不熟悉，这点也绕了好久。")])]),s._v(" "),t("h3",{attrs:{id:"b-启用forwardedheaders中间件"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#b-启用forwardedheaders中间件"}},[s._v("#")]),s._v(" "),t("span",{attrs:{"data-mce-":""}},[t("span",{attrs:{"data-mce-":""}})]),t("span",{attrs:{"data-mce-":""}},[t("span",{attrs:{"data-mce-":""}},[s._v("B.启用")])]),t("span",{attrs:{"data-mce-":""}},[t("span",{attrs:{"data-mce-":""}},[s._v("ForwardedHeaders中间件")])])]),s._v(" "),t("p",[t("span",{attrs:{"data-mce-":""}},[t("span",{attrs:{"data-mce-":""}},[s._v(" 由于采用了反向代理，需要启用ForwardedHeaders中间件转发，在Startup的Configure中添加如下代码，注意UseForwardedHeaders要用在UseAuthentication之前。（"),t("a",{attrs:{href:"https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer?view=aspnetcore-2.1",target:"_blank",rel:"noopener noreferrer"}},[s._v("MSDN上的详细说明"),t("OutboundLink")],1),s._v("）")])])]),s._v(" "),t("div",{staticClass:"language-csharp line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-csharp"}},[t("code",[s._v("app"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("UseForwardedHeaders")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("new")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token constructor-invocation class-name"}},[s._v("ForwardedHeadersOptions")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    ForwardedHeaders "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" ForwardedHeaders"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("XForwardedFor "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("|")]),s._v(" ForwardedHeaders"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("XForwardedProto\n"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\napp"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("UseAuthentication")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br")])]),t("h2",{attrs:{id:"_8-独立部署-scd"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_8-独立部署-scd"}},[s._v("#")]),s._v(" 8. 独立部署（SCD）")]),s._v(" "),t("p",[s._v("下面说一下独立部署（包含依赖项）的发布方式。")]),s._v(" "),t("p",[s._v("在VS中右击项目文件，注意是 "),t("code",[s._v(".csproj")]),s._v(" 而不是 "),t("code",[s._v(".sln")]),s._v(" ，选择编辑xxx.csproj，打开该文件：")]),s._v(" "),t("div",{staticClass:"language-csharp line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-csharp"}},[t("code",[t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("Project")]),s._v(" Sdk"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Microsoft.NET.Sdk.Web"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v("\n\n    "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("PropertyGroup"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("TargetFramework"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v("netcoreapp2"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),s._v("TargetFramework"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),s._v("PropertyGroup"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v("\n\n    "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("ItemGroup"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("PackageReference")]),s._v(" Include"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Microsoft.AspNetCore.All"')]),s._v(" Version"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"2.0.6"')]),s._v(" "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),s._v("ItemGroup"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v("\n\n    "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("ItemGroup"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),t("span",{pre:!0,attrs:{class:"token class-name"}},[s._v("DotNetCliToolReference")]),s._v(" Include"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Microsoft.VisualStudio.Web.CodeGeneration.Tools"')]),s._v(" Version"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"2.0.3"')]),s._v(" "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),s._v("ItemGroup"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),s._v("Project"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br"),t("span",{staticClass:"line-number"},[s._v("8")]),t("br"),t("span",{staticClass:"line-number"},[s._v("9")]),t("br"),t("span",{staticClass:"line-number"},[s._v("10")]),t("br"),t("span",{staticClass:"line-number"},[s._v("11")]),t("br"),t("span",{staticClass:"line-number"},[s._v("12")]),t("br"),t("span",{staticClass:"line-number"},[s._v("13")]),t("br"),t("span",{staticClass:"line-number"},[s._v("14")]),t("br"),t("span",{staticClass:"line-number"},[s._v("15")]),t("br")])]),t("p",[s._v("在PropertyGroup中添加RuntimeIdentifiers标签")]),s._v(" "),t("div",{staticClass:"language-csharp line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-csharp"}},[t("code",[t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("PropertyGroup"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("TargetFramework"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v("netcoreapp2"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),s._v("TargetFramework"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v("\n    "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),s._v("RuntimeIdentifiers"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v("win10"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("-")]),s._v("x64"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("centos"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("7")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("-")]),s._v("x64"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),s._v("RuntimeIdentifiers"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("<")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("/")]),s._v("PropertyGroup"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br")])]),t("p",[s._v("win10-x64;centos-x64叫做.NET Core RID， 是一些固定的内容， 具体可选项见"),t("a",{attrs:{href:"https://docs.microsoft.com/zh-cn/dotnet/core/rid-catalog",target:"_blank",rel:"noopener noreferrer"}},[s._v(".NET Core RID的目录"),t("OutboundLink")],1),s._v("。")]),s._v(" "),t("p",[s._v("当我们再次发布的时候，在发布设置的目标运行时中就出现了这两个选项，我们可以根据需要部署的系统选择对应的RID后进行发布。")]),s._v(" "),t("h2",{attrs:{id:"_9-2018-5-8文章更新"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_9-2018-5-8文章更新"}},[s._v("#")]),s._v(" 9. 2018.5.8文章更新")]),s._v(" "),t("p",[s._v("Visual Studio 2017 15.7版本的项目发布提供了部署模式（框架依赖和独立部署）和目标运行时（win、osx、linux）的选择功能")]),s._v(" "),t("p",[t("img",{attrs:{src:"/blogimages/ASPNETCore2_9/548134-20180508095954157-106746629.png",alt:""}})])])}),[],!1,null,null,null);a.default=r.exports}}]);