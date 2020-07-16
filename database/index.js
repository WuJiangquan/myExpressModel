var engins = {
	mysql : require("./mysql"),
	mongodb : require("./mongodb")
}

let instances = {
	
}
module.exports = {
	getDataBaseEngine : function(config){
		var enginStr  = config.engin;
		let dataBaseName = config.databaseName || enginStr;
		if(engins[enginStr]){
			if(instances[dataBaseName] === undefined){
				instances[dataBaseName] = new engins[enginStr](config);
			}
			return instances[dataBaseName];
		}
		else
			throw new Error(enginStr + " database engin is not exist");
	}
}
