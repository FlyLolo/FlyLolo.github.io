---
title: 六. 聊聊依赖注入
date: 2018-03-08
tags:
 - ASP.NET Core
categories:
 -  .NET
---

本文通过一个维修工与工具库的例子形象的描述一下为什么要用依赖注入、它的工作原理是什么样的, 然后根据这个类比一下ASP.NET Core 中的依赖注入, 从而深刻了解它的使用方法、注意事项以及回收机制等.


本文主要内容:

1.为什么要用依赖注入(DI)

2.容器的构建和规则

3.ASP.NET Core 2.0中的依赖注入

4.使用方法及需要注意的问题

5.服务的Dispose

6.我想换个容器

## 1.为什么要用依赖注入(DI)

什么是依赖注入就不说了, 为什么要使用呢?

软件设计原则中有一个依赖倒置原则（DIP）讲的是要依赖于抽象，不要依赖于具体,高层模块不应该依赖于低层模块, 二者应该依赖于抽象。简单的说就是为了更好的解耦。而控制反转(Ioc)就是这样的原则的其中一个实现思路, 这个思路的其中一种实现方式就是依赖注入(DI)。

感觉有点绕, 举个栗子:老李是一个维修工, 现在要出任务去维修, 得先去申领个扳手。

 ![](/blogimages/ASPNETCore2_6/548134-20180303112615300-529479844.png)

                              图一

老李: "请给我一把可以可以拧7mm大小的六角螺丝的扳手.", 然后库管老张就从仓库里拿了一把这样的![](/blogimages/ASPNETCore2_6/548134-20180303113142362-236256002.png)大力牌扳手给老李。

在这个例子中, 维修工老李只要告诉库管我要一个 "<span style="color: #ff0000;">可以拧7mm大小的六角螺丝</span>"的扳手即可, 他不用关心扳手的品牌和样式, 也不用采购扳手,更不用关心这个扳手是怎么来的.而对于库管, 他只需提供满足这样规则的一个扳手即可, 不用去关心老李拿着这个扳手之后去干什么。所以老李和老张都只是关心"可以拧7mm大小的六角螺丝的"这个规则即可, 也就是说, 如果后期仓库里不再提供![](/blogimages/ASPNETCore2_6/548134-20180303113142362-236256002.png)大力牌扳手, 而是提供了![](/blogimages/ASPNETCore2_6/548134-20180303114221147-722038305.png)这样的大牛牌扳手, 无论换了什么牌子和样式, 只要仍满足这个规则, 老李仍然可以正常工作.它们定义了一个规则(比如接口IWrench7mm), 二者都依赖于这个规则, 然后仓库无论提供大力牌(WrenchDaLi : IWrench7mm)还是大牛牌(WrenchDaNiu : IWrench7mm), 都不影响正常工作.

 这就是依赖倒置原则(DIP),  不依赖于具体(牌子),  高层模块(老李)不应该依赖于低层模块(大力牌扳手), 二者应该依赖于抽象(IWrench7mm:可以拧7mm大小的六角螺丝)。如果直接由老李去获取(new)大力牌扳手, 那么当业务改变要求采用大牛牌的时候, 我们就要去修改老李的代码.为了解耦, 在本例中我们只要在配置中让仓库由原来的提供大力牌改为提供大牛牌即可。老李要使用的时候, 可以通过注入(构造器、属性、方法)的方式, 将仓库提供的扳手实例提供给老李使用。

## 2.容器的构建和规则

 继续上面的例子, 库管老张为什么会提供给老李大力牌而不是大牛牌的扳手呢? 那是因为领导给了他一份构建仓库的<span style="color: #ff6600;">物品购置及发放清单</span>:

 A. 当有人要7mm的六角扳手的时候,给他一个大力牌的扳手, 当再有人来要的时候就再给另一把。

 B. 但对于相机, 每个小组只能给一台, 小组内所有人共用这一台。

 C. 卡车更是全单位只有一辆, 谁申请都是同一辆。

 ![](/blogimages/ASPNETCore2_6/548134-20180304222201242-1577523357.png)

                                       图二

## 3.ASP.NET Core 2.0中的依赖注入

 首先看一下下面的图三

 ![](/blogimages/ASPNETCore2_6/548134-20180304223315637-868568123.png)  

                                         图三

 这就是ASP.NET Core 中默认的依赖注入方式,  对比一下图二是不是很像?

 上篇文章说要将Startup放大介绍一下,  那么打开Startup这个文件,  看一下里面的<span style="font-family: Menlo;">ConfigureServices方法。</span>顾名思义,  这个方法是用来配置服务,

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddMvc();
}
```

 此方法接收一个IServiceCollection类型的参数,  查看它的定义, 被定义在[Microsoft.Extensions.DependencyInjection](https://github.com/aspnet/DependencyInjection)这个NuGet包中, 功能就是依赖注入, 在ASP.NET Core中被广泛使用.

### ①IServiceCollection

 它正是图三中的<span style="color: #ff6600;">①IServiceCollection, </span>它是一个`IList<ServiceDescriptor>`类型的集合。也就是上门的维修工的例子中领导制定的清单<span data-mce-="">,  而Startup中的ConfigureServices这个方法的作用就是让我们作为"领导"来配置这个清单。</span>方法中默认调用的services.AddMvc(),  是IServiceCollection的一个扩展方法 <span style="color: #0000ff;">public` <span style="color: #0000ff;">static</span> IMvcBuilder AddMvc(<span style="color: #0000ff;">this</span> IServiceCollection services);</span> , 作用就是向这个清单中添加了一些MVC需要的服务,例如Authorization、RazorViewEngin、DataAnnotations等。

 系统需要的添加好了, 剩下的就是我们把自己需要的用的添加进去了。  这里我们可以创建一个ServiceDescriptor然后把它添加到这个集合里,  系统<span data-mce-="">①IServiceCollection</span>也提供了AddSingleton、AddScoped和AddTransient这样的方法, 三种方法定义了所添加服务的生命周期, 具体见<span style="color: #ff6600;">②ServiceDescriptor</span>.

 当然我们可以在ConfigureServices中通过一堆AddXXX将服务添加到<span data-mce-="">IServiceCollection</span>,  但这样好多堆在一起不易于修改和阅读,  特别还有一些功能会包含好几个服务的添加,  所以推荐像系统默认的 `AddMvc()` 这样封装到一个扩展方法中去。

 现在来看一下清单中的内容。

### ②ServiceDescriptor

 既然<span style="color: #ff6600;">①IServiceCollection</span> 是一个`IList<ServiceDescriptor>`,  那么ServiceDescriptor也就是这个集合中的内容了,  也就是仓库中物品的描述.对照图三中的<span style="color: #ff6600;">②ServiceDescriptor</span>看一下它的各个属性。

 **A. Type ServiceType:** 服务的类型    <span style="color: #ff6600;">--7mm六角扳手</span>

 **B. Type ImplementationType:** 实现的类型  <span style="color: #ff6600;">--大力牌扳手</span>

 **C. ServiceLifetime Lifetime:** 服务的生命周期  <span style="color: #ff6600;">--若干(谁要都给一把新的)    </span>

 **D. object ImplementationInstance:** 实现服务的实例

 **E: Func<IServiceProvider, object> ImplementationFactory:** 创建服务实例的工厂

 **ServiceLifetime**是一个枚举, 上文说的AddSingleton、AddScoped和AddTransient就是对应这个枚举, 分别为:

 **Singleton**: 单例, 例子中的卡车, 全单位只有一辆, 谁调用都是返回这个实例。

 **Scoped**: 区域内单例, 例子中的傻瓜相机, 每小组一台, 小组内谁要都是同一台, 不同小组的相机不同。

 **Transient**: 临时的   例子中的扳手和锤子, 谁要都给一把新的, 所有人的都不是同一把。

 从这些属性的介绍来看, ServiceDescriptor规定了当有人需要ServiceType这个类型服务的时候, 提供给他一个ImplementationType类型的实例,  其他几个属性规定了提供的方法和生命周期.

### ③IServiceProvider

<span style="color: #ff6600;"> ③IServiceProvider </span>服务提供者,由<span style="color: #ff6600;">①IServiceCollection</span>的扩展方法BuildServiceProvider创建, 当需要它提供某个服务的时候,  它会根据创建它的<span style="color: #ff6600;">①IServiceCollection</span>中的对应的<span style="color: #ff6600;">②ServiceDescriptor</span>提供相应的服务实例.。它提供了<span style="color: #ff6600;">⑤GetService、GetRequiredService、GetServices、GetRequiredServices</span>这样的几个用于提供服务实例的方法,就像库管老张一样,  告诉他你需要什么服务的实例, 他会根据清单规定给你对应的工具。

 **GetService和GetRequiredService的区别: **

 维修工老李: "老张, 给我一架空客A380."  -- `GetService<IA380>()`;

 老张: "这个没有."   -- return null;

 维修工老李: "老张, <span style="color: #ff6600;">必须</span>给我一架空客A380!"  -- `GetRequiredService<IA380>()`;

 老张: "这个真TMD没有."   -- System.InvalidOperationException:“No service for type 'IA380' has been registered.”;

 GetServices和GetRequiredServices这两个加了"s"的方法返回对应的集合。

### ④IServiceScope

 上文中的ServiceDescriptor的Lifetime属性为Scoped的时候, IServiceProvider会为其创建一个新的区域<span style="color: #ff6600;">④IServiceScope</span>,

```csharp
public interface IServiceScope : IDisposable
{
    IServiceProvider ServiceProvider { get; }
}
```

 从上面的代码可以看出它只是对IServiceProvider进行了一个简单的封装, 原始的IServiceProvider通过CreateScope()创建了一个IServiceScope, 而这个IServiceScope的ServiceProvider属性将负责这个区域内的服务提供, 而Lifetime为Scoped的ServiceDescriptor创建的实例在本区域内是以"单例"的形式存在的.

  在ASP.NET Core中, Lifetime为Scoped的实例在每次请求中只创建一次.

## 4.使用方法及需要注意的问题

 对于上面的维修工的例子, ASP.NET Core的依赖注入还是有一些<span style="color: #ff6600;">不一样</span>的地方,  比如用卡车 (全单位只有一辆, 谁借都是这一辆) 来类比单例， 只有一个确实没问题， 但对于卡车， A把它借走了， B只有等他被还回来才能去借。 同样标记为Scoped的傻瓜相机即使在小组内也是需要轮换使用的。 没错， 就是<span style="color: #ff6600;">并发</span>问题，对于ASP.NET Core的依赖注入提供的**Singleton**和**Scoped**的实例来说， 它是很有可能同时被多个地方获取并调用的。通过下面的例子看一下这个问题， 顺便巩固一下上面的内容。

```csharp
public interface ITest
{
    Guid Guid { get; }
    string Name { get; set; }
}
public class Test : ITest
{
    public Test()
    {
        this.Guid = Guid.NewGuid();
    }
    public Guid Guid { get; }
    public string Name { get; set; }
}
```

 一个Test类继承自ITest, 为了方便比较是不是同一个实例, 在构造方法里对它的Guid属性赋一个新值, 然后将其注册一下

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddMvc();
    services.AddTransient<ITest,Test>();
}
```

 现在通过三种方法来获取这个Test, Controller中如下

```csharp
public class HomeController : Controller
{
    private ITest _test;
    public HomeController( ITest test)
    {
        this._test = test;
    }
    public IActionResult Index()
    {
        ViewBag.Test = this._test;  //构造方法获取
        ViewBag.TestFromContext = HttpContext.RequestServices.GetService<ITest>(); //通过HttpContext获取 需要using Microsoft.Extensions.DependencyInjection
        return View();
    }
}
```

 View中通过@inject ITest  viewITest的方式获取, 然后把他们的Guid值显示出来:

```csharp
@inject ITest  viewITest
<ul>
    <li>@ViewBag.Test.Guid</li>
    <li>@ViewBag.TestFromContext.Guid</li>
    <li>@viewITest.Guid</li>
</ul>
```

结果如下

```csharp
ad79690e-1ee2-41bd-82f1-062de4c124b2
92cd97fc-7083-4b10-99e4-13b6b6926c16
cd0105f4-fa9d-4221-b395-af06798d96a2
```

说明三种方式获取了三个不同的实例, 刷新一下页面, 又变成了另外三个不同的值.

现在在startup文件中将原来的 `services.AddTransient<ITest,Test>()` 改为 `services.AddSingleton<ITest,Test>()` , 其他不变, 重新运行一下, 结果如下

```csharp
dd4c952e-b64c-4dc8-af01-2b9d667cf190
dd4c952e-b64c-4dc8-af01-2b9d667cf190
dd4c952e-b64c-4dc8-af01-2b9d667cf190
```

发现三组值是一样的, 说明获得的是同一个实例, 在刷新一下页面, 仍然是这三组值, 说明多次请求获得的结果也是同一个实例.

再将 `services.AddSingleton<ITest,Test>()` 改为 `services.AddScoped<ITest,Test>()` , 重新运行, 这次结果是

```csharp
ad5a600b-75fb-43c0-aee9-e90231fd510c
ad5a600b-75fb-43c0-aee9-e90231fd510c
ad5a600b-75fb-43c0-aee9-e90231fd510c
```

三组数字相同, 刷新一下, 又变成了另外三组一样的值, 这说明在同一次请求里, 获取的实例是同一个。

因为无论在Singleton还是Scoped的情况下, 可能在应用的多个地方同时使用同一个实例, 所以在程序设置的时候就要注意了, 如果存在像在上面的Test有个Name属性提供了 `{ get; set; }`的时候,多个引用者处理它的值, 会造成一些不可预料的错误。

## 5.服务的Dispose

 对于每次请求, 我们最初配置的根IServiceProvider通过CreateScope()创建了一个新的IServiceScope, 而这个IServiceScope的ServiceProvider属性将负责本次该次请求的服务提供, 当请求结束, 这个ServiceProvider的dispose会被调用, 同时它负责由它创建的各个服务。

 在 1.0 版中，ServiceProvider将对*所有* `IDisposable` 对象调用 dispose，包括那些并非由它创建的对象。

 而在2.0中, ServiceProvider只调用由<span data-ttu-id="ca47b-268">它创建的 `IDisposable` 类型的 `Dispose`。 <span data-ttu-id="ca47b-269">如果将一个实例添加到容器，它将不会被释放。 </span></span>

<span data-ttu-id="ca47b-268"><span data-ttu-id="ca47b-269"> 例如:</span></span><span data-ttu-id="ca47b-268"><span data-ttu-id="ca47b-269"> `services.AddSingleton<ITest>(<span style="color: #0000ff;">new Test())`;</span> </span></span>

## 6.我想换个容器

 可以将默认的容器改为其他的容器, 比如`Autofac`,这需要将`ConfigureServices`方法由返回`void`改为`IServiceProvider`。

```csharp
1 public IServiceProvider ConfigureServices(IServiceCollection services)
2 {
3     services.AddMvc();
4     // Add other framework services
5 
6     // Add Autofac
7     var containerBuilder = new ContainerBuilder();
8     containerBuilder.RegisterModule<DefaultModule>();
9     containerBuilder.Populate(services);
10     var container = containerBuilder.Build();
11     return new AutofacServiceProvider(container);
12 }
```