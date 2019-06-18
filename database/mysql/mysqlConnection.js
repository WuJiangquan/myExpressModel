var mysql = require('mysql');
var connection,connectErr = false;
module.exports = function (config){
	if(undefined === connection || connectErr){
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
				console.log("mysql connection lost");
				connectErr = true;
			}
		});
	}
	
	return connection;
};
