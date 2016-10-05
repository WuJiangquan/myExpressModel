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
       
        b. 配置
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

		c. 在models层下面建立Model类，继承BaseModel,设置fields和该Model在数据库中对应的table名称，例如：
			var BaseModel = require("./BaseModel");

			var Category = function() {

			    BaseModel.call(this, Category.fields, "Category");
			};

			Category.fields = {
			    id: {
			        type: 'integer',
			        validator: ['presence']
			    },
			    name: {
			        type: 'string',
			        validator: ['presence']
			    },
			    time: {
			        type: 'datetime',
			        validator: ['presence']
			    }
			};

			module.exports = Category;

#在controller中使用Model
		a. 添加记录
			1).新增一条纪录：
				 /*当Model 对象执行save操作的时候，会判断是id属性是否为空或者该id在数据库是否已经存在，满足两个否条件，则执行插入操作，否则执行更新操作*/
	       		 var CategoryModel = require("../../models/Category");
	       		 var categoryModel = new CategoryModel();
				 categoryModel.set("id",0);
				 categoryModel.set("name","JiangquanWu");
				 categoryModel.set("time",new Date());
				 categoryModel.save(function(err,result){
					 //to do
				 });
			2). 通过insert对象批量新增
				var categoryModel = new CategoryModel();
				var insertOp = categoryModel.getOperateObj("insert");
				insertOp.batchInsert(categories,function(err,result){
					 //to do
				});

		b. 修改纪录:
			1). 跟新增纪录一样，修改一条记录。
			2). 通过update对象根据条件更新:
				//修改所有品类名称为“衣服”的时间
				var categoryModel = new CategoryModel();
				categoryModel.set("time",new Date());
				var updateOp = categoryModel.getOperateObj("update");
				updateOp.equalTo("name","衣服");
				updateOp.updateRecord(categoryModel,function(err,result){
					 //to do
				});
			3). 批量更新多条记录。
				var categoryModel = new CategoryModel();
				var updateOp = categoryModel.getOperateObj("update");
				//@parameter categories 是一个categoryModel数组，所有categoryModel都必须有id属性；
				updateOp.batchUpdateById(categories,function(err,result){
					//to do
				});
		c. 查找：
		    1). 通过model对象简单的查找，比如查找id等于1的品类：
		    	var categoryModel = new CategoryModel();
		    	categoryModel.get("id=1",callback);
		    2). 通过model对象获取所有的记录(方法1如果只传入一个回调函数作为参数，也可以获取所有记录):
		    	var categoryModel = new CategoryModel();
		    	categoryModel.getAll(callback);
		    3). 复杂的条件查询，比如：
		    	var categoryModel = new CategoryModel();
		    	var queryObj = categoryModel.getOperateObj("query");
				queryObj.limit(pageSize);//分页；
				queryObj.skip((pageNumber-1)*pageSize);//跳过前几条；
				queryObj.descending("time");//根据时间降序；
				queryObj.notMoreThan("time",time);//查找所有time时间点之前添加的品类
				queryObj.find(callback);
			4). 连接查询因为尚未经过项目检验，所以暂未开放接口。如果要进行连接查询，只能通过model对象的 opSqlSetament 方法进行：
				var categoryModel = new CategoryModel();
				var sql = "连接查询语句";
				categoryModel.opSqlSetament(sql,callback);
		d. 删除:
			1). 通过model对象简单地根据id条件删除:
				var categoryModel = new CategoryModel();
				categoryModel.deleteByIds(1,callback);
				//categoryModel.deleteByIds([1,2,3,4,5,6,7,8],callback);
			2). 通过delete对象执行复杂的条件判断删除：
				var categoryModel = new CategoryModel();
				var deleteOp = deleteByIds.getOperateObj("delete");
				deleteOp.equalTo("name",'衣服');//更多的条件设置方法请看后面文档;
				deleteOp.delete(cllback);
			3). 通过delete对象删除所有记录
				var categoryModel = new CategoryModel();
				var deleteOp = deleteByIds.getOperateObj("delete");
				deleteOp.deleteAllById(callback);
#条件设置
	上面的删查改都可能要设置复杂的条件，下面就是上面方法中的通过model对象的getOperateObj方法获取的数据库操作对象可以执行的设置复杂条件的方法：
	说明，每个方法最后都有一个logic参数，是用来设置数据库语句中条件之间的与或逻辑的.如果是或，参数值设置"or"。如果是与，参数值为"and"。缺省值为and.
	a. equalTo(fieldName,value,logic)//参数1.是字段名，参数2是 字段值。字段名等于某值
	b. notEqualTo(fieldName,value,logic)//参数1.是字段名，参数2是 字段值。字段名不等于某值
	c. lessThan(fieldName,value,logic)//参数1.是字段名，参数2是 字段值。字段名小于某值
	d. moreThan(fieldName,value,logic)//参数1.是字段名，参数2是 字段值。字段名大于某值
	e. notLessThan(fieldName,value,logic)//参数1.是字段名，参数2是 字段值。字段名大于等于某值
	f. notMoreThan(fieldName,value,logic)//参数1.是字段名，参数2是 字段值。字段名小于等于某值
	g. between(fieldName,startValue,endvalue,logic)//参数1是字段名，参数2和参数3是字段值的开区间(不包含开始值和结束值)，
	h. like(fieldName,charList)//模糊查询。参数1字段名，参数2.模糊值
	i. likeStartAs(fieldName,charList)//以某值开头的模糊查询。参数1字段名，参数2.模糊值
	j. likeEndWidth(fieldName,charList);//以某值结束的模糊查询。参数1字段名，参数2.模糊值
	k. in(fieldName,valueArray,logic) //查找某只段在valueArray数组的所有记录.参数1字段名，参数2.字段的值数组
	//查找操作还有下面这些特殊的条件设置方法：
	a. skip(count); //跳过前count条查询，参数count是跳过条数的数值
	b. limit(count); //限制查询的条数， 参数count是查询条数的数值
	c. ascending(fieldName); //查询结果根据某字段升序排列. 参数fieldName是字段名
	d. descending(fieldName); //查询结果根据某字段降序排列。参数fieldName是字段名