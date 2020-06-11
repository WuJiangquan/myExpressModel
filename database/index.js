var engins = {
	mysql : require("./mysql"),
	mongodb : require("./mongodb")
}

let instances = {
	
}
module.exports = {
	getDataBaseEngine : function(config){
		var enginStr  = config.engin;
		if(engins[enginStr]){
			if(instances[enginStr] === undefined){
				instances[enginStr] = new engins[enginStr](config);
			}
			return instances[enginStr];
		}
		else
			throw new Error(enginStr + " database engin is not exist");
	}
}
