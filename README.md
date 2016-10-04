# myExpressModel
# 前言
&nbsp;&nbsp;&nbsp;&nbsp;使用express官网提供的express-generator在本地生成的express框架中，只包含了bin、public、routes、views、app.js、pakage.json文件。bin文件存放了一个www文件，public文件用来存放前端的静态文件，views用来存放模板，routes用来配置路由。因为我本人已经习惯了MVC框架的思维模式，所以我将我平时开始练习使用的express框架改造成了MVC结构的。这个项目负责封装Model 层。因为我nodejs刚入门不久，而且只对mysql稍微熟悉，所以目前这个项目只封装了mysql，下一步会拓展mangoDB.
&nbsp;&nbsp;&nbsp;&nbsp;express官方没有提供mysql中间件，所以我谷歌搜索到了一个叫mysql的第三方中间件。github 地址：https://github.com/mysqljs/mysql#contributors 。他的使用方法在，上面的网址已经讲述得相当清楚了。需要指出的是，每次执行数据库操作，都要拼装一个数据库语句字符串，然后使用query方法执行语句并产生回调。官方例子：<br/>
   var userId = 'some user provided value';<br/>
var sql    = 'SELECT * FROM users WHERE id = ' + connection.escape(userId);<br/>
connection.query(sql, function(err, results) {<br/>
  // ...<br/>
});<br/>
&nbsp;&nbsp;&nbsp;&nbsp;如果在开发中，每次使用数据库都要这样拼装字符串，会不会很麻烦？于是我想起了 leancloud 数据存储文档，它更新数据对象的操作如下：<br/>
// 第一个参数是 className，第二个参数是 objextId<br/>
  var todo = AV.Object.createWithoutData('Todo', '5745557f71cfe400686abe0');<br/>
  // 修改属性<br/>
  todo.set('content', '每周工程师会议，本周改为周三下午3点半。');<br/>
  // 保存到云端<br/>
  todo.save();<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;在平常开发中这样操作数据库是不是变得简单多了？只可惜网上找不到他们开源的代码，所以我决定自己造轮子了。
# 开始：
    1. 安装
        npm install --save my-express-model
     2.使用：
        a. 在express项目的根目录下添加model文件夹，并添加一个所有数据表的父类，并在父类设置数据库配置。
       		我通常做法是添加一个名为BaseModel.js文件，然后文件中声明一个类，代码如下
	         var Model = require("my-express-model");
	         var config = require("../config/globalConfig");
	         var BaseModel = function(fiedls,tableName){
	            this.config = config.databaseConfig;
	            Model.call(this,fields,tableName);
	         }
	         module.exports = BaseModel;
       
        b.配置
        	在a步骤require进来的config文件里面配置数据库的端口等参数：
	        var isDebug = true;
			var globaleConfig = {
				database :{
					host : 'localhost',
					user : 'root',
					password : 'password',
					databaseName : 'mydatabasename'
				},
				appViewUrl  : isDebug ? "app/dev/" : "app/dist/",
				port : 3001
			};

			module.exports = globaleConfig;


   