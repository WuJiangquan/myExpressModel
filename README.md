#  myExpressModel

## 1. 安装
        npm install --save my-express-model
## 2.使用：
###  在express项目的根目录下添加model文件夹，并添加一个所有数据表的父类，并在父类设置数据库配置。
通常做法是添加一个名为BaseModel.js文件，然后文件中声明一个类，代码如下
	         
```
var Model = require("my-express-model");
var databaseConfig = require("../config/databaseConfig");
class BaseModel extends Model{
    constructor(){
        super(databaseConfig);
    }
    static instance: BaseModel ; // typescript 类静态属性，es6/7 无此语法。可以写成BaseModel.instacne
    static getInstance() {
        if (this.instance === undefined) {
            this.instance  = new this();
        }
        return this.instance;
    }
}
// 使用连接池长连接模式，创建持久复用的连接池
if(databaseConfig.connectType === "pool"){
    BaseModel.createPool(databaseConfig);
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
	databaseName : 'databaseName',
    connectType : "pool" //连接类型,连接池最大请求数默认 为100个。需要自定义，可以通过limit 配置项修改
}
```
###  在models层下面建立Model类，继承BaseModel,设置fields和该Model在数据库中对应的table名称，例如：

```
var BaseModel = require("./BaseModel");
class CategoryModel  extends BaseModel{
    id : number
    name : string
    avatar : string
    static tableName: string = "FbUser"
    static fields: Object = {
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
    }
    constructor(options){
        super(options);
    }
};

module.exports = CategoryModel;
```
# 创建连接
在配置文件中，可以配置连接的方式：连接池和普通连接。

##  连接方式
1）连接池：长连接的方式。
connectType : "pool" //连接类型
2）普通连接：建议短连接的方式。
connectType : "connection" //连接类型。


##  创建连接-->连接池
在上述BaseModel 的例子中，统一创建了连接池。在后续的数据库操作的API中，会有限判断参数列表的connection 是否可用
如果不可用，并且pool 不为空，会自动创建。
```
if(databaseConfig.connectType === "pool"){
    BaseModel.createPool(databaseConfig);
}
```

##  创建连接-->短连接
遵循一次请求一个连接的方式：
```
import Model from xxxx;
(req,res) = >{
   let connection = Model.createConnection();
   try{
       await  connection.connect();
   }catch(e){}
   // Promise  的异步操作可以通过catch 来捕获，async await 只能通过try catch 来捕获 
  const insertOp = Model.getOperateObj("insert",connection);   
  //todo 
  connection.release();
}   
```


# 在controller中使用Model

##  获取操作数据库的对象 getOperateObj(type,connection?)
每个数据表类，继承Model之后，就继承了getOperateObj 的请求方法。
该方法提供了增删改查四个操作对象的获取。
### 参数 type
type 包括：
1）insert  增
2) update  改
3) delete 删
4) query 查
### 参数 connection
使用短连接的方式，需要传递connection 参数，使用连接池的方式，在connection 为空的时候，会使用连接池获取一个可用连接。

### 使用案例
1）使用连接池的方式：
   let insertOp = await Model.getOperateObj("insert");
2）使用短简介方式
```
    let connection = Model.createConnection();
    await connection.connect();
    let insertOp = await Model.getOperateObj("insert",connection);
    connection.end();
```

##  添加记录
### 1.新增一条纪录：
#### 1.1 save(connection?,callback?);
使用连接池的方式，不需要传递connection. save 返回值是一个Promise对象，也支持回调函数的方式调用。
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
 }).then(({errmsg,result})=>{

 });
```

#### 1.2 insertRecord(record,connection?);
使用连接池的方式，则不需要connection。否则需要传递connection.并且在响应用户请求之前结束连接。

```
var CategoryModel = require("../../models/Category");
CategoryModel.insertRecord({
    id : 0,
    name : "JiangquanWu",
    time : new Date()
})
.then(({errmsg,result})=>{

})
```

###  2. 通过insert对象批量新增  insertOp.batchInsert(records,callback?)
#### 2.1 参数records
records 是要批量插入的对象

####  2.2 返回值
返回提供了Promise 和 回调函数两种方式。
callback(errmsg,result);
resolve({errmsg,result});

#### 2.3 调用案例
```
var insertOp = CategoryModel.getOperateObj("insert",connection);//连接池模式不需要connection 参数
insertOp.batchInsert(categories,function(err,result){
	 //to do
});

```

##  修改纪录:
### 1. 跟新增纪录一样，修改一条记录。
使用方式参考上面的save操作，区别在于，当前Model 的实例的主健是否为空。

### 2. 通过update对象根据条件更新 updateRecord(record,callback?)

#### 2.1 参数records
records 需要更新的对象

####  2.2 返回值
返回提供了Promise 和 回调函数两种方式。
callback(errmsg,result);
resolve({errmsg,result});

#### 2.3 调用案例
```
//修改所有品类名称为“衣服”的时间
var categoryModel = new CategoryModel();
categoryModel.set("time",new Date());
var updateOp = CategoryModel.getOperateObj("update",connection?);//连接池的方式不需要传递conection
updateOp.equalTo("name","衣服");
updateOp.updateRecord(categoryModel,function(err,result){
	 //to do
});
```
### 3. 批量更新多条记录，batchUpdateById(records,callback?)
#### 3.1 参数records
records 需要更新的对象

####  3.2 返回值
返回提供了Promise 和 回调函数两种方式。
callback(errmsg,result);
resolve({errmsg,result});

#### 3.3 调用案例

```
var categoryModel = new CategoryModel();
var updateOp = categoryModel.getOperateObj("update",connection?);//连接池的方式不需要传递conection
//@parameter categories 是一个categoryModel数组，所有categoryModel都必须有id属性；
updateOp.batchUpdateById(categories,function(err,result){
	//to do
});
```

##  查找：
### 1. 通过model对象简单的查找，Model.get(connection?,callback?);

#### 1.1 参数connection
使用连接池的时候不需要传递这个参数，否则需要。

#### 1.2 参数callback
回调函数，也可以使用Promise 的异步处理方式处理回调

#### 1.3 案例
比如查找id等于1的品类：

```
CategoryModel.get("id=1",callback);
//CategoryModel.get(callback);则返回所有记录
```
### 2. 通过model对象获取所有的记录 getAll(connection?,callback?)
方法1如果只传入一个回调函数作为参数，也可以获取所有记录
#### 2.1 参数connection
使用连接池的时候不需要传递这个参数，否则需要。

#### 2.2 参数callback
回调函数，也可以使用Promise 的异步处理方式处理回调

#### 2.3 案例
```
CategoryModel.getAll(callback);
```
### 3. 复杂的条件查询，Model.getOperateObj("query",connection?)

#### 3.1 参数type
在前面介绍过getOperateObj的使用，查找类的type 为 “query”

#### 3.2 参数connection
使用连接池的时候不需要传递这个参数，否则需要。

#### 3.3 查询条件的设置
可以通过下面的条件设置罗列的API设置条件。
这个例子中使用了limit、skip、descending、notMoreThan 等API

#### 3.4 案例
```
var queryObj = CategoryModel.getOperateObj("query");
queryObj.limit(pageSize);//分页；
queryObj.skip((pageNumber-1)*pageSize);//跳过前几条；
queryObj.descending("time");//根据时间降序；
queryObj.notMoreThan("time",time);//查找所有time时间点之前添加的品类
queryObj.find(callback);
```

### 4. 连接查询
通过model对象的 opSqlSetament 方法进行

```
var sql = "连接查询语句";
CategoryModel.opSqlSetament(sql,callback);
```
##  删除:
### 1. 通过model对象简单地根据id条件删除，Model.deleteByIds(id,connection?,callback?)

#### 1.1 参数id
需要删除的ID
#### 1.2 参数connection
使用连接池的时候不需要传递这个参数，否则需要。

#### 1.3 参数callback
回调函数，也可以使用Promise 的异步处理方式处理回调

#### 1.4 案例
```
CategoryModel.deleteByIds(1,callback);
//CategoryModel.deleteByIds([1,2,3,4,5,6,7,8],callback);
```

### 2. 通过delete对象执行复杂的条件判断删除，delete(connection?,callback?)
Model.getOperateObj("delete",conection?);
#### 2.1 参数connection
使用连接池的时候不需要传递这个参数，否则需要。

#### 2.2 参数callback
回调函数，也可以使用Promise 的异步处理方式处理回调

#### 2.3 案例

```
var deleteOp = CategoryModel.getOperateObj("delete");
deleteOp.equalTo("name",'衣服');//更多的条件设置方法请看后面文档;
deleteOp.delete(cllback);
```
### 3. 通过delete对象 批量删除所有ID  deleteInBatchByIds(ids,connection?,callback?)

#### 3.1 参数ids
需要删除的ID
#### 3.2 参数connection
使用连接池的时候不需要传递这个参数，否则需要。

#### 3.3 参数callback
回调函数，也可以使用Promise 的异步处理方式处理回调

#### 3.4 案例
```
var deleteOp = CategoryModel.getOperateObj("delete");
deleteOp.deleteInBatchByIds([1,2,3],callback);
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

	
