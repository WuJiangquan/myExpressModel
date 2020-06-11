var mysql = require('mysql');
let poll = null;
module.exports = {
  createConnection(config){
		let connection =  mysql.createConnection({
			host : config.host,
			user : config.user,
			password : config.password,
			database : config.databaseName,
			connectTimeout : config.connectTimeout || 10000,
			charset : config.charset || "UTF8_GENERAL_CI",
			timezone : config.timezone || "local"
		});
		connection.connectType = "connection"
	},
	createPool(config){
		if(!poll){
			poll = mysql.createPool({
				connectionLimit : config.limit || 200,
				host : config.host,
				user : config.user,
				password : config.password,
				database : config.databaseName,
			});	 
			poll.connectType = "poll"
		}
		return poll;
	},
	connect(connection){
		return new Promise((resolve,reject)=>{
			if(connection.connectType === "connection"){
				connection.connect(function(err) {
					if (err) {
						reject(err)
					}
					resolve(connection)
				});
			}else{
				poll.getConnection((err, connection)=>{
					if (err) {
						reject(err)
					}
					resolve(connection)
				})
			}
		})
	}
}