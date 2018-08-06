var db = require('./database');
var dataBaseEngine = null;
class Model{
	constructor(fields,tableName,databaseConfig){
		var me = this;
		this.databaseConfig = databaseConfig;
		this.fields = fields;
		this.tableName = tableName;
		this.pageNumber = 0;
		this.pageSize = 30;
		dataBaseEngine = db.getDataBaseEngine(this.databaseConfig);
		this.initFields();
	}
	initFields  (){
		for(element in this.fields){
			this.fields[element].mapping = this.fields[element].mapping || element;
		}
	}
	domapping (record){
		var newRecord = {};
		for(var element in this.fields){
			var data = record[this.fields[element].mapping||element];
			if(undefined === data){
				var errorMsg =  this.tableName + '返回的数据不包含' + this.fields[element].mapping  + '或' + element + '字段'; 
				throw error(errorMsg);
			}
			newRecord[element.name] = data;
		}
		return newRecord;
	}
	mapRecord(record){
		var newRecord = {};
		for(var element in this.fields){
			var mapping = this.fields[element].mapping || element;
			if(record[element])
				newRecord[mapping] = record[element] || "";
		}
		return newRecord;
	}

	formatValueString  (field,value){
		var type = field.type;
		var newVlue = '';
		switch(type){
			case 'string' : newVlue = "\'" + value + "\'";break;
			default : newVlue = value;
		}
		
		return newVlue;
	}
	collectRecord (){
		var record = {};
		for(var element in this.fields){
			record[element] = this[element];
		}
		return record;
	}
	addNewRecord(record , callback){
		if("string" == typeof record){
			record = parseParameterStr(record);
		}
		for(var element in this.fields){
			this[element] = record[element];
		}
		this.save(callback);
	}
	set(fieldName,val){
		this[fieldName] = val;
	}
	save(callback){
		var record = this.collectRecord();
		if(record.id){
			this.get("id = "+record.id,function(err,results){
				if(err){
					callback(err,results);
				}else{
					if(results.length>0){
						me.updateRecord(record, callback);
					}else{
						me.insertRecord(recordRecord,callback);
					}
				}
			});
		}else{
			this.insertRecord(record,callback);
		}
	}

	insertRecord (record,callback){
		var mappingRecord = mapRecord(record);
		var insertObj = this.getOperateObj("insert");
		insertObj.insert(mappingRecord,callback)
	}

	updateRecord (record,callback){
		var mappingRecord = mapRecord(record);
		var updateObj = this.getOperateObj("update");
		updateObj.updateRecord(mappingRecord,callback);
	}

	parseParameterStr (parametersStr){
		parametersStr = parametersStr.replace(/\s/g,"");
		var mappingParametersStr = "";
		var parametersStrs = parametersStr.split(";");
		var maps = [];
		for(var i =0,len = parametersStrs.length;i<len;i++){
			var parameters = parametersStrs[i].split("=");
			var map = {
				key : this.fields[parameters[0]].mapping || parameters[0],
				val : parameters[1]
			};
			maps.push(map);
		}
		return maps;
		
	}

	get (parameterStr,callback){
		if(("string" != typeof parameterStr) && ("function" == typeof parameterStr)){
			this.getAll(parameterStr);
			return ;
		}
		var queryObj = this.getOperateObj("query");
		var maps = parseParameterStr(parameterStr);
		for(var i = 0,len = maps.length;i<len;i++){
			queryObj.equalTo(maps[i].key,maps[i].val);
		}
		queryObj.find(callback);
	}

	getAll (callback){
		var queryObj = this.getOperateObj("query");
		queryObj.find(callback);
	}
	
	deleteByIds (ids,callback){
		if(!isNaN(ids)){
			var idArray = new Array();
			idArray.push(ids);
			ids = idArray;
		}
		var deleteObj = this.getOperateObj("delete");
		deleteObj.deleteInBatchByIds(ids,callback);
	}

	deleteAll(){

	}

	getOperateObj (operateType){
		return dataBaseEngine.getOperations(operateType,this.fields,this.tableName);
	}

	parseDataStr (dataStr){
		if("string" != typeof dataStr){
			throw new Error("dataStr must be a string")
		}else{
			var strs = dataStr.split(";");
			for(var i =0,len= strs.length;i<len;i++){
				var strArray = strs[i].split("=");
				var key = strArray[0];
				var value = strArray[1];
				if(this.fields[key]){
					this[key] = value;
				}
			}
		}
	}

	setPageSize (pageSize){
		this.pageSize = pageSize;
	}

	setPageNumber (pageNumber){
		this.pageNumber = pageNumber;
	}

	init (){

	}

	opSqlSetament (sql,callBack){
		db.baseOp(sql,callBack||function(){});
	};
	
}


	
	

module.exports = Model;