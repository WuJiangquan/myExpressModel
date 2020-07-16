var BaseDBOperation = require('./BaseDBOperation');

var Insert = function(connect , fields , tableName){
	
	BaseDBOperation.call(this,connect,fields,tableName);
	var me = this;
	
	this.queryInsert = function(results,callback){
		var count = results.affectedRows;
		var insertId = results.insertId;
		var sal = 'select * from ' + tableName  + " where id >= " + insertId;
		this.baseOp(sql,function(err,queryResuls){
			results.data = queryResuls;
			if(callback && 'function' == typeof callback){
				callback(results);
			}
		});
	};
	
	this.insert = function(record,callback){
		return new Promise((resolve) => {
			var sql = "INSERT INTO "+ tableName + " (" + this.fieldsCollector(record) + ") values (" + this.dataBaseInsertSetCollector(fields,record) +")";
			this.baseOp(sql,function(errmsg,result){
				callback(errmsg,result);
				resolve({errmsg,result})
			});
		})
	};

	this.insertIgnore = function(record,callback){
		return new Promise((resolve) => {
			var sql = "INSERT IGNORE INTO "+ tableName + " (" + this.fieldsCollector(record) + ") values (" + this.dataBaseInsertSetCollector(fields,record) +")";
			this.baseOp(sql,function(errmsg,result){
				callback(errmsg,result);
				resolve({errmsg,result})
			});
		})
	}

	this.insertReplace = function(record,callback){
		return new Promise((resolve) => {
			var sql = "REPLACE INTO "+ tableName + " (" + this.fieldsCollector(record) + ") values (" + this.dataBaseInsertSetCollector(fields,record) +")";
			this.baseOp(sql,function(errmsg,result){
				callback(errmsg,result);
				resolve({errmsg,result})
			});
		})
	}
	
	this.dataBaseInsertSetCollector = function(fields , record){
		var set = "";
		for(var element in record){//浅度操作，如果record的数据中某个数据是一个对象则需要进一步完善；
			if(fields[element]&& !fields[element].generated)
				set += ' ' + this.formatBataBaseSet(record[element],fields[element]) + " ,";
		}
		return  set.slice(0,-1) ;
	};
	
	
	this.batchInsert = function(records,callback){
		 return new Promise((resolve)=>{
				var set = "";
				for(var i =0;i<records.length;i++){
					set += ' ( '+ this.dataBaseInsertSetCollector(fields,records[i]) + '),';
				}
				set = set.slice(0,-1);
				var sql = "INSERT INTO "+ tableName + " (" + this.fieldsCollector(records[0]) + ") values " + set +"";
				this.baseOp(sql,function(err,result){
					callback(err,result);
					resolve({errmsg:err,result});
				});
		 })
	};
};

module.exports = Insert;