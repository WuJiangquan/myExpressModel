var BaseDBOperation = require('./BaseDBOperation');

var Delete = function(connect , fields , tableName){
	
//	this.tableName = model.tableName;
	BaseDBOperation.call(this,connect,fields,tableName);
	var me = this;
	
	
	this.sqlCollector = function(){
		var sql = "";
		sql += "DELETE FROM " + this.tableName ;
		var conditions = this.conditionsCollector( );
		
		if(conditions){
			sql += " where " + conditions;
		}
		return sql;
	};
	
	this.delete = function(callback){//conditions//需要进一步完善
		var sql = this.sqlCollector();
		this.dodelete(sql,callback);
	};
	
	this.deleteAllById = function(callback){
		var sql = "DELETE FROM "+ this.tableName + " WHERE ID > 0";
		this.dodelete(sql,callback);
	};
	
	this.dodelete = function(sql,callback){
		this.baseOp(sql,callback||function(err,results){
			console.log(err);
			console.log(results);
		});
	};
	
	this.deleteInBatchByIds = function(ids , callback){
		var idsStr = "";
		for(var i=0 , len = ids.length; i <len;i++){
			idsStr += ids[i] + ",";
		}
		if(idsStr != ""){
			idsStr = idsStr.slice(0,-1);
			var sql = "DELETE FROM " + this.tableName + " WHERE ID IN " + "( " + idsStr + " );";
			this.dodelete(sql,callback);
		}
	}
};

module.exports = Delete;