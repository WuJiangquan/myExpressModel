var db = require('./database');
var config = require("../../config/databaseConfig");
var dataBaseEngine = db.getDataBaseEngine(config);
var Model = function(fields,tableName){
	this.fields = fields;
	this.tableName = tableName;
	var me = this;
	this.pageNumber = 0;
	this.pageSize = 30;
	var initFields = function (){
		for(element in me.fields){
			me.fields[element].mapping = me.fields[element].mapping || element;
		}
	}
	
	var domapping = function(record){
		var fields = me.fields;
		var newRecord = {};
		for(var element in fields){
			var data = record[fields[element].mapping||element];
			if(undefined === data){
				var errorMsg =  this.tableName + '返回的数据不包含' + fields[element].mapping  + '或' + element + '字段'; 
				console.log(errorMsg);
				throw error(errorMsg);
			}
			record[element.name] = data;
		}
	}
	
	var mapRecord = function(record){
		var fields = me.fields;
		var newRecord = {};
		for(var element in fields){
			var mapping = fields[element].mapping || element;
			if(record[element])
				newRecord[mapping] = record[element] || "";
		}
		return newRecord;
	}
	
	var formatValueString  = function(field,value){
		var type = field.type;
		var newVlue = '';
		switch(type){
			case 'string' : newVlue = "\'" + value + "\'";break;
			default : newVlue = value;
		}
		
		return newVlue;
	}
	
	var collectRecord = function(){
		var fields = me.fields;
		var record = {};
		for(var element in fields){
			record[element] = me[element];
		}
		return record;
	}
	
	this.addNewRecord = function(record , callback){
		var fields = me.fields;
		if("string" == typeof record){
			record = parseParameterStr(record);
		}
		for(var element in fields){
			this[element] = record[element];
		}
	};
	

	this.set = function(fieldName,val){
		this[fieldName] = val;
	}
	
	this.save = function(callback){
		var record = collectRecord();
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
			me.insertRecord(record,callback);
		}
	}
	
	this.insertRecord = function(record,callback){
		var mappingRecord = mapRecord(record);
		var insertObj = me.getOperateObj("insert");
		insertObj.insert(mappingRecord,callback)
	}
	
	this.updateRecord = function(record,callback){
		var mappingRecord = mapRecord(record);
		var updateObj = me.getOperateObj("update");
		updateObj.updateRecord(mappingRecord,callback);
	}
	
	
	var parseParameterStr = function(parametersStr){
		parametersStr = parametersStr.replace(/\s/g,"");
		var fields = me.fields;
		var mappingParametersStr = "";
		var parametersStrs = parametersStr.split(";");
		var maps = [];
		for(var i =0,len = parametersStrs.length;i<len;i++){
			var parameters = parametersStrs[i].split("=");
			var map = {
				key : fields[parameters[0]].mapping || parameters[0],
				val : parameters[1]
			};
			maps.push(map);
		}
		return maps;
		
	}
	
	this.get = function(parameterStr,callback){
		var queryObj = me.getOperateObj("query");
		var maps = parseParameterStr(parameterStr);
		for(var i = 0,len = maps.length;i<len;i++){
			queryObj.equalTo(maps[i].key,maps[i].val);
		}
		queryObj.find(callback);
	}
	
	this.getAll = function(callback){
		var queryObj = me.getOperateObj("query");
		queryObj.find(callback);
	}
	
	
	this.deleteByIds = function(ids,callback){
		if(!isNaN(ids)){
			var idArray = new Array();
			idArray.push(ids);
			ids = idArray;
		}
		var deleteObj = me.getOperateObj("delete");
		deleteObj.deleteInBatchByIds(ids,callback);
	}
	
	this.deleteAll = function(){
		
	}
	
	this.getOperateObj = function(operateType){
		return dataBaseEngine.getOperations(operateType,this.fields,this.tableName);
	}
	
	this.parseDataStr = function(dataStr){
		var fields = me.fields;
		if("string" != typeof dataStr){
			throw new Error("dataStr must be a string")
		}else{
			var strs = dataStr.split(";");
			for(var i =0,len= strs.length;i<len;i++){
				var strArray = strs[i].split("=");
				var key = strArray[0];
				var value = strArray[1];
				if(fields[key]){
					this[key] = value;
				}
			}
		}
	}
	
	this.opSqlSetament = function(sql,callBack){
		db.baseOp(sql,callBack||function(){});
	};
	
	this.setPageNumber = function(pageNumber){
		me.pageNumber = pageNumber;
	}
	
	this.setPageSize = function(pageSize){
		me.pageSize = pageSize;
	}
	
	function init(){
		initFields();
	};
	init();
}

module.exports = Model;