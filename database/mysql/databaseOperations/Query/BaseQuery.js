var BaseDBOperation = require('../BaseDBOperation');
var BaseQuery = function(connect,fields,tableName){
	BaseDBOperation.call(this,connect,fields,tableName);
	var me = this;
	this.setSelectFields = function(fields){
		fields = [].concat(fields);
		var  selectField = "";
		for(var i =0,len = fields.length;i<len;i++){
			selectField += " " + fields[i] + " ,";
		};
		
		
		if(selectField){
			selectField = selectField.slice(0,-1);
		}
		this.selectField += selectField;
	};
	
	this.selectFieldsCollector = function(){
		return this.selectField ?  " " + this.selectField :  " *";
	};
	
	this.skip = function(count){
		if(count)
			this.skipCount = count;
	};
	
	this.limit = function(count){
		if(count)
			this.limitCount = count;
	};
	
	this.ascending = function(field){
		this.orderStr = "order by " + field + ' ASC';
	};
	
	this.descending = function(field){
		this.orderStr = "order by " + field + ' DESC';
	};
	
	
	this.find = function(callback){
		return new Promise((resolve)=>{
			var sql = this.sqlCollector();
			connect.query(sql,function(err, results){
				if(callback){
					callback(err, results);
				}
				me.conditions = "";
				resolve({errmsg:err,result :results})
			
			});
		})
	};
	
};

module.exports = BaseQuery;




