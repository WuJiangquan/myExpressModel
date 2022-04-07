var mysqlConnection = require('./mysqlConnection');

var databaseOperateType = {
	insert: require('./databaseOperations/Insert'),
	update: require('./databaseOperations/Update'),
	delete: require('./databaseOperations/Delete'),
	query: require("./databaseOperations/Query/Query")
}

class Mysql {
	constructor(config) {
		this.config = config;
		this.constructor.databaseConfig = config;
		this.constructor.databaseName = config.databaseName;
		this.connectCreater = mysqlConnection
	}

	getOperations(opType, fields, tableName, connection,pool) {
		return new databaseOperateType[opType](connection, fields, tableName);
	}

	createConnection() {
		return mysqlConnection.createConnection(this.config);
	}

	createPool() {
		console.log(this.config)
		return mysqlConnection.createPool(this.config);
	}

	connect(connection){
		return mysqlConnection.connect(connection);
	}
	baseOp(sqlSetence,connect,callback){
		connect.query(sqlSetence,function(	error, results, fields){
		  typeof callback === "function" && callback(	error, results, fields)
		})
		connect.release();
	}
}


module.exports = Mysql;
