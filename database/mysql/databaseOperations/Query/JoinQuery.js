var BaseQuery = require('./BaseQuery');
var JoinQuery = function(fields){
	BaseQuery.call(this,connect,fields,tableName);
	this.fields = fields;
	var me = this;
	var thisTableName = tableName;
	var foreignTableName = foreignTableName;
	var sql = "select";
	
	this.jionStr = "";
	this.sqlCollector = function(){
		var sql = "select";
		sql += this.selectFieldsCollector() +  " FROM "+ thisTableName  ;
		if(me.jionStr){
			sql += " " + me.jionStr;
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
		var sql = "select count(*) from " + thisTableName + "  "+ conditions + " "  + me.jionStr||"";
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
	
	var getJoinKey = function(joinTableName){
		var joinKey = {};
		for(var element in fields){
			if("foreignKey" == fields[element].type){
				var tableName= fields[element].association.foreignTableName;
				if(tableName == joinTableName){
					joinKey.foreignTableName = tableName;
					joinKey.foreignKey = element;
					joinKey.associationKey = tableName= fields[element].association.associationKey;
				}
			}
		}
		return joinKey;
	}
	
	
	this.assembledJoinKey = function(joinKey){
		return foreignTableName + " ON " + thisTableName + "." + joinKey.foreignKey + " = " + joinKey.foreignTableName + "." + joinKey.associationKey;
	};
	
	this.innerJoin = function(joinTableName){
		var joinKey = getJoinKey(joinTableName);
		me.jionStr =  " INNER JOIN " + this.assembledJoinKey(joinKey);
	};
	
	this.leftJoin = function(joinTableName){
		var joinKey = getJoinKey(joinTableName);
		me.jionStr = " LEFT JOIN " + this.assembledJoinKey(joinKey);
	};
	
	this.rightJoin = function(joinTableName){
		var joinKey = getJoinKey(joinTableName);
		me.jionStr = " RIGHT JOIN " + this.assembledJoinKey(joinKey);
	};
	
	this.fullJoin = function(joinTableName){
		var joinKey = getJoinKey(joinTableName);
		me.jionStr = " FULL JOIN " + this.assembledJoinKey(joinKey);
	};
	
};

module.exports = JoinQuery;