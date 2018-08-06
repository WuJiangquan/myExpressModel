var mysql = require('mysql');

module.exports = function (config){
	var connection = mysql.createConnection({
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
        }
    });
	return connection;
};
