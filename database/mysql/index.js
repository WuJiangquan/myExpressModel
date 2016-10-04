var mysqlConnection = require('./mysqlConnection');

var databaseOperateType = {
	insert : require('./databaseOperations/Insert'),
	update : require('./databaseOperations/Update'),
	delete : require('./databaseOperations/Delete'),
	query : require("./databaseOperations/Query/Query")
}

module.exports = function(config){
	var connect = mysqlConnection(config);
	this.getOperations = function(opType , fields ,tableName){
		return new databaseOperateType[opType](connect , fields ,tableName);
	}
}
