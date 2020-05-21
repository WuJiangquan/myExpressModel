
var BaseDBOperation =function(connect,fields,tableName){
	var me = this;
	var mysqlConnection = connect;
	this.selectField = "";
	this.limitCount = 0;
	this.skipCount = 0;
	this.likeStr = "";
	this.orderStr = "";
	this.conditions  = "";

	if(!fields){
		throw new Error("you must set  parameter fields when you new a database operation object");
	}
	
	if(!tableName){
		throw new Error("you must set  pafieldsCollectorrameter tableName when you new a database operation object");
	}
	
	this.fields = fields;
	this.tableName = tableName
	
	for(var pro in fields){
		if(fields[pro].pk){
			this.pk = pro;
			break ;
		}
	}

	var formatString = function(field,value){
		
		if('string' == field.type || "datetime" == field.type || "text" == field.type || "tinyText" == field.type || "longText" == field.type )
			return "'" + value + "'";
		return value;
	};
	
	var refreshconditions = function(currentCondition,logic){
		var logic = logic || "and";
		if(me.conditions){
			me.conditions += " " + logic + currentCondition;
		}else{
			me.conditions +=  currentCondition;
		}
		return me.conditions;
	};
	
	this.baseOp = function(sql,callBack){
		mysqlConnection.query(sql, function(err, results){
			callBack(err, results);
			me.conditions = "";
		});
	};


	this.getDefaultCondition = (record)=>{
		var condition = " ";
		if(this.pk !== undefined){
			condition += this.pk + " = " + record[this.pk];
		}
		return condition
	}
	
	this.conditionsCollector = function(){
		
		if(this.likeStr && !this.conditions.match("like")){
			if(this.conditions){
				this.conditions += " and " + this.likeStr;
			}else{
				 this.conditions = this.likeStr;
			}
		}
		return this.conditions ;
	};
	
	/**
	*@params getCurrenConditionFunction 
	*/

	this.doCollectCondition = function(field,value,getCurrenConditionFunction,logic){
		value = formatString(me.fields[field],value);
		var currentCondition = " " + getCurrenConditionFunction(field,value) + " ";
		refreshconditions(currentCondition,logic);
	}

	this.equalTo = function(field,value,logic){
		this.doCollectCondition(field,value,function(field,value){
			return me.fields[field].mapping + " = " + value;
		},logic);
	};

	this.equalToMtp = function(conditions,logic){
		if( Object.prototype.toString.call(conditions) === '[object Array]'){
			for(var i=0,len = conditions.length;i<len;i++){
				var condition = conditions[i];
				this.doCollectCondition(condition.key,condition.value,function(field,value){
					return me.fields[field].mapping + " = " + value;
				},condition.logic||logic);
			}
		}else{
			for(var field in conditions){
				var value = conditions[field];
				this.doCollectCondition(field,value,function(field,value){
					return me.fields[field].mapping + " = " + value;
				},logic);
			}
		}
	};

	this.setConditions = function(conditions){
		if("string" === typeof conditions){
			this.conditions = conditions;
		}
		
	}



	this.notEqualTo = function(field,value,logic){
		this.doCollectCondition(field,value,function(field,value){
			return me.fields[field].mapping + " != " + value;
		},logic);
	};
	
	this.lessThan = function(field,value,logic){
		this.doCollectCondition(field,value,function(field,value){
			return me.fields[field].mapping + " < " + value;
		},logic);
	};
	
	this.moreThan = function(field,value,logic){
		this.doCollectCondition(field,value,function(field,value){
			return me.fields[field].mapping + " > " + value;
		},logic);
	};
	//大于等于 
	this.notLessThan = function(field,value,logic){
		this.doCollectCondition(field,value,function(field,value){
			return me.fields[field].mapping + " >=" + value;
		},logic);
	};
	//小于等于 
	this.notMoreThan = function(field,value,logic){
		this.doCollectCondition(field,value,function(field,value){
			return me.fields[field].mapping + " <=" + value;
		},logic);
	};
	
	this.between = function(field,v1,v2,logic){
		v1 = formatString(me.fields[field].mapping,v1);
		v2 = formatString(me.fields[field],mapping,v2);
		var currentCondition = " " + field + " < " + v2 + " and " + field + " > " +v1;
		refreshconditions(currentCondition,logic);
	};
	
	
	this.like = function(field , charList){
		this.likeStr = me.fields[field].mapping + " like " + "'%" + charList + "%'";
	};
	
	this.likeStartAs = function(field , charList){
		this.likeStr = me.fields[field].mapping + " like " + "'" + charList + "%'";
	};
	
	this.likeEndWidth = function(field , charList){
		this.likeStr = me.fields[field].mapping + " like " + "'%" + charList + "'";
	};
	
	this.in = function(field,valueArray,logic){
		logic = logic || 'and';
		valueArray = [].concat(valueArray);	
		var valueSet = "";
		for(var i =0;i<valueArray.length;i++){
			valueSet += " " + formatString(me.fields[field],valueArray[i]) + " ,";
		}
		valueSet = "(" + valueSet.slice(0,-1) + ")";
		var currentContion =  field + " IN " + valueSet;
		if(this.conditions){
			this.conditions += " " + logic + " " + currentContion;
		}else{
			this.conditions +=   currentContion;
		}
	};
	
	this.fieldsCollector = function(record){
		var fieldsstr = "";
		for(var element in record){
			if(fields[element]&&!fields[element].generated){
				fieldsstr += fields[element].mapping + ',';
			}
		}
		return  fieldsstr.slice(0,-1) ;
	};
	
	this.formatBataBaseSet = function(data,field){
		if(data === undefined || data === null){
			data = field.defaultValue||'';
		}
		if('string' == field.type || 'text' == field.type || 'datetime' == field.type || "tinyText" == field.type || "longText" == field.type) {
			return "'" + data + "'";
		}else{
			return  data ;
		}
	};
	
};

module.exports = BaseDBOperation;