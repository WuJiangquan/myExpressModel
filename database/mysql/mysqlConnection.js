var mysql = require('mysql');
var connection,connectErr = false;
module.exports = function (config,callback){
	connection = mysql.createConnection({
		host : config.host,
		user : config.user,
		password : config.password,
		database : config.databaseName
	});
	connection.connect(function(err) {
		if (!err) {
			console.log("mysql connected")
		} else {
			console.log(err)
			console.log("mysql connection lost");
			connectErr = true;
		}
		typeof callback === "function" && callback(connection,err);
	});
	return connection;
};
