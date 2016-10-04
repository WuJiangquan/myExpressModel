var mysql = require('mysql');

module.exports = function (config){
	var connection = mysql.createConnection({
		host : config.host,
		user : config.user,
		password : config.password,
		database : config.databaseName
	});
	connection.connect();
	return connection;
};
