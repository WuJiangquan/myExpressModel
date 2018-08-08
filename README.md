#  myExpressModel

## 1. 安装
        npm install --save my-express-model
## 2.使用：
###  在express项目的根目录下添加model文件夹，并添加一个所有数据表的父类，并在父类设置数据库配置。
通常做法是添加一个名为BaseModel.js文件，然后文件中声明一个类，代码如下
	         
```
var Model = require("my-express-model");
var config = require("../config/databaseConfig");
var BaseModel = function(fiedls,tableName){
    this.config = config.databaseConfig;
    Model.call(this,fields,tableName);
}
module.exports = BaseModel;
```
###  配置
在a步骤require进来的config文件里面配置数据库的端等参数：

```
 module.exports = {
	engin : "mysql",//开发中使用的数据库引擎，如果要更换数据库，修改配置即可(让然目前只提供mysql数据库)
	host : 'localhost',
	user : 'root',
	password : 'password',
	databaseName : 'databaseName'
}
```
###  在models层下面建立Model类，继承BaseModel,设置fields和该Model在数据库中对应的table名称，例如：

```
var BaseModel = require("./BaseModel");
class CategoryModel  extends BaseModel{
    constructor(){
        super();
    }
};
CategoryModel.tableName = "FbUser";
CategoryModel.fields = {
    id: {
        type: 'integer',
         pk : true, // primary key 主键，当不设置任何条件的时候则按主键的值进行更新
         generated : true, // 自增字段，插入时跳过该字段
        validator: ['presence']
    },
    name: {
        type: 'string',
        validator: ['presence']
    },
    avatar: {
        type: 'string',
        validator: ['presence']
    }
};

module.exports = CategoryModel;
```


# 在controller中使用Model
##  添加记录
### 1).新增一条纪录：
当Model 对象执行save操作的时候，会判断是id属性是否为空或者该id在数据库是否已经存在。
满足两个否条件，则执行插入操作，否则执行更新操作
```
var CategoryModel = require("../../models/Category");
var categoryModel = new CategoryModel();
 categoryModel.set("id",0);
 categoryModel.set("name","JiangquanWu");
 categoryModel.set("time",new Date());
 categoryModel.save(function(err,result){
	 //to do
 });
```
```
var CategoryModel = require("../../models/Category");
CategoryModel.insertRecord({
    id : 0,
    name : "JiangquanWu",
    time : new Date()
})
.then((errmsg,result)=>{

})
```

###  2). 通过insert对象批量新增

```
var insertOp = CategoryModel.getOperateObj("insert");
insertOp.batchInsert(categories,function(err,result){
	 //to do
});
```
##  修改纪录:
### 1). 跟新增纪录一样，修改一条记录。
### 2). 通过update对象根据条件更新:

```
//修改所有品类名称为“衣服”的时间
var categoryModel = new CategoryModel();
categoryModel.set("time",new Date());
var updateOp = CategoryModel.getOperateObj("update");
updateOp.equalTo("name","衣服");
updateOp.updateRecord(categoryModel,function(err,result){
	 //to do
});
```
### 3). 批量更新多条记录。

```
var categoryModel = new CategoryModel();
var updateOp = categoryModel.getOperateObj("update");
//@parameter categories 是一个categoryModel数组，所有categoryModel都必须有id属性；
updateOp.batchUpdateById(categories,function(err,result){
	//to do
});
```
##  查找：
### 1). 通过model对象简单的查找，
比如查找id等于1的品类：

```
CategoryModel.get("id=1",callback);
//CategoryModel.get(callback);则返回所有记录
```
### 2). 通过model对象获取所有的记录(方法1如果只传入一个回调函数作为参数，也可以获取所有记录)

```
CategoryModel.getAll(callback);
```
### 3). 复杂的条件查询，比如：

```
var queryObj = CategoryModel.getOperateObj("query");
queryObj.limit(pageSize);//分页；
queryObj.skip((pageNumber-1)*pageSize);//跳过前几条；
queryObj.descending("time");//根据时间降序；
queryObj.notMoreThan("time",time);//查找所有time时间点之前添加的品类
queryObj.find(callback);
```

### 4). 连接查询
通过model对象的 opSqlSetament 方法进行

```
var sql = "连接查询语句";
CategoryModel.opSqlSetament(sql,callback);
```
##  删除:
### 1). 通过model对象简单地根据id条件删除:

```
CategoryModel.deleteByIds(1,callback);
//CategoryModel.deleteByIds([1,2,3,4,5,6,7,8],callback);
```

### 2). 通过delete对象执行复杂的条件判断删除：

```
var deleteOp = CategoryModel.getOperateObj("delete");
deleteOp.equalTo("name",'衣服');//更多的条件设置方法请看后面文档;
deleteOp.delete(cllback);
```
### 3). 通过delete对象删除所有记录

```
var deleteOp = CategoryModel.getOperateObj("delete");
deleteOp.deleteAllById(callback);
```

# 条件设置
上面的删查改都可能要设置复杂的条件，通过model对象的getOperateObj方法获取的数据库操作对象可以执行的设置复杂条件的方法
#### 说明：每个方法最后都有一个logic参数，是用来设置数据库语句中条件之间的与或逻辑的.如果是或，参数值设置"or"。如果是与，参数值为"and"。缺省值为and.
### equalTo(fieldName,value,logic)
参数1.是字段名，参数2是 字段值。字段名等于某值
### notEqualTo(fieldName,value,logic)
参数1.是字段名，参数2是 字段值。字段名不等于某值
### lessThan(fieldName,value,logic)
参数1.是字段名，参数2是 字段值。字段名小于某值
### moreThan(fieldName,value,logic)
参数1.是字段名，参数2是 字段值。字段名大于某值
### notLessThan(fieldName,value,logic)
参数1.是字段名，参数2是 字段值。字段名大于等于某值
### notMoreThan(fieldName,value,logic)
参数1.是字段名，参数2是 字段值。字段名小于等于某值
### between(fieldName,startValue,endvalue,logic)
参数1是字段名，参数2和参数3是字段值的开区间(不包含开始值和结束值)，
### like(fieldName,charList)
模糊查询。参数1字段名，参数2.模糊值
### likeStartAs(fieldName,charList)
以某值开头的模糊查询。参数1字段名，参数2.模糊值
### likeEndWidth(fieldName,charList);
以某值结束的模糊查询。参数1字段名，参数2.模糊值
### in(fieldName,valueArray,logic)
查找某只段在valueArray数组的所有记录.参数1字段名，参数2.字段的值数组
# 查找操作还有下面这些特殊的条件设置方法：
###  skip(count); 跳过前count条查询，参数count是跳过条数的数值
### limit(count); 
限制查询的条数， 参数count是查询条数的数值
### ascending(fieldName);
查询结果根据某字段升序排列. 参数fieldName是字段名
### descending(fieldName);
查询结果根据某字段降序排列。参数fieldName是字段名

	
