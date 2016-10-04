var engins = {
	mysql : require("./mysql"),
	mongodb : require("./mongodb")
}
module.exports = {
	getDataBaseEngine : function(config){
		var enginStr  = config.engin;
		if(engins[enginStr])
			return new engins[enginStr](config);
		else
			throw new Error(enginStr + " database engin is not exist");
	}
}
