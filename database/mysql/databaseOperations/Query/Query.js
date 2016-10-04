var BaseQuery = require('./BaseQuery');
var JoinQuery = require("./JoinQuery");
var Query = function(connect , fields , tableName){
	
//	this.tableName = model.tableName;
	
	BaseQuery.call(this,connect,fields,tableName);
	var query = this;
	var sql = "select";
	this.conditions = "";
	var me = this;
	//public:
	
	this.sqlCollector = function(){
		var sql = "select";
		sql += this.selectFieldsCollector() + " from "+ tableName ;
		var conditions = this.conditionsCollector( );
		
		if(conditions){
			sql += " where " + conditions;
		}
		if(me.orderStr){
			sql += " " + me.orderStr;
		}
		
		if(me.limitCount>0) {
			sql += " limit " + me.limitCount;
		}
		
		if(me.skipCount>0){
			sql += " offset " + me.skipCount;
		}
		return sql;
	};
	
	this.getCount = function(callback){
		var conditions = this.conditionsCollector( ) ?( " where "+this.conditionsCollector( ) ): "";
		
		var sql = "select * from " + tableName + "  " + conditions;
		connect.query(sql,function(err, results){			
			if(callback){
				if(err){
					callback(err, 0);
				}
				else
					callback(err, results.length);
			}
			me.conditions = "";
		});
	};
	
	this.setSelectField = function(fields){
		if(fields instanceof Array){
			for(var i = 0,len =fields.length;i<len;i++){
				this.selectField += ' ' + fields[i] + ' ,';
			}
		}else{
			this.selectField += ' ' + fields + ' ,';
		}
		
	};
	
	this.joinQuery = function(joinType,joinTableName,callback){
		var joinQueryObj = new JoinQuery(fields);
		joinQueryObj[joinType](joinTableName);
		joinQueryObj.find(callback);
	}
};

module.exports = Query;