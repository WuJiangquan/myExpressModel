var db = require('./database');
var dataBaseEngine = null;
class Model {
	constructor(databaseConfig) {
		var me = this;
		this.databaseConfig = databaseConfig;
		this.pageNumber = 0;
		this.pageSize = 30;
		dataBaseEngine = db.getDataBaseEngine(databaseConfig);
		if (databaseConfig.connectType == "pool") {
			this.pool = dataBaseEngine.createPool(databaseConfig);
		} else {
			this.pool = null;
		}
		this.initFields();
	}
	initFields() {
		for (var element in this.constructor.fields) {
			this.constructor.fields[element].mapping = this.constructor.fields[element].mapping || element;
			if (this.constructor.fields[element].pk) {
				this.pk = element;
			}
		}
	}
	domapping(record) {
		var newRecord = {};
		for (var element in this.constructor.fields) {
			var data = record[this.constructor.fields[element].mapping || element];
			if (undefined === data) {
				var errorMsg = this.constructor.tableName + '返回的数据不包含' + this.constructor.fields[element].mapping + '或' + element + '字段';
				throw error(errorMsg);
			}
			newRecord[element.name] = data;
		}
		return newRecord;
	}

	static mapRecord(record) {
		var newRecord = {};
		for (var element in this.fields) {
			var mapping = this.fields[element].mapping || element;
			if (record[element] !== undefined)
				newRecord[mapping] = record[element] === null ? "" : record[element];
		}
		return newRecord;
	}

	formatValueString(field, value) {
		var type = field.type;
		var newVlue = '';
		switch (type) {
			case 'string': newVlue = "\'" + value + "\'"; break;
			default: newVlue = value;
		}

		return newVlue;
	}
	collectRecord() {
		var record = {};
		for (var element in this.constructor.fields) {
			record[element] = this[element];
		}
		return record;
	}
	addNewRecord(record, callback) {
		if ("string" == typeof record) {
			record = this.constructor.parseParameterStr(record);
		}
		for (var element in this.constructor.fields) {
			this[element] = record[element];
		}
		this.save(callback);
	}
	set(fieldName, val) {
		if (arguments.length === 1 && "object" === typeof fieldName) {
			for (var pro in fieldName) {
				if (undefined !== this.constructor.fields[pro]) {
					this[pro] = fieldName[pro];
				}
			}
		} else {
			this[fieldName] = val;
		}
		return this;

	}

	getDefaultCondition(record) {
		var condition = " ";
		if (this.pk !== undefined) {
			condition += this.pk + " = " + record[this.pk];
		}
		return condition
	}

	save(connection, callback) {
		return new Promise(async (resolve, reject) => {
			try {
				if ("function" === typeof connection || undefined == connection) {
					callback = connection;
					if (this.pool !== null) {
						connection = await this.constructor.connect(this.pool)
					} else {
						throw new Error("you should create connection before opera mysql");
					}
				}
			} catch (error) {
				reject(error);
			}
			if ("object" === typeof callback) {
				var obj = callback;
				this.set(obj);
				callback = arguments[1];
			}
			var record = this.collectRecord();
			if (record.id) {
				this.constructor.get(this.getDefaultCondition(record), connection, (err, results) => {
					if (err) {
						if ("function" === typeof callback) {
							callback(err, results)
						}
						this.pool && connection.end();
						resolve(err, results);
					} else {
						if (results.length > 0) {
							if ("function" === typeof callback) {
								callback(err, results)
							}
							this.constructor.updateRecord(record, connection, this.constructor.resolveCallback(resolve, callback));
						} else {
							this.constructor.insertRecord(record, connection, this.constructor.resolveCallback(resolve, callback));
						}
						this.pool && connection.end();
					}
				});
			} else {
				this.constructor.insertRecord(record, connection, this.constructor.resolveCallback(resolve, callback));
				this.pool && connection.end();
			}
		})

	}

	static insertRecord(record, connection, callback) {
		return new Promise(async (resolve, reject) => {
			try {
				if ("function" === typeof connection || undefined == connection) {
					callback = connection;
					if (this.pool !== null) {
						connection = await this.connect(this.pool)
					} else {
						throw new Error("you should create connection before opera mysql");
					}
				}
			} catch (error) {
				reject(error);
			}
			var mappingRecord = this.mapRecord(record);
			var insertObj = await this.getOperateObj("insert", connection);
			insertObj.insert(mappingRecord, this.resolveCallback(resolve, callback))
		})

	}

	static updateRecord(record, connection, callback) {
		return new Promise(async (resolve, reject) => {
			try {
				if ("function" === typeof connection || undefined == connection) {
					callback = connection;
					if (this.pool !== null) {
						connection = await this.connect(this.pool)
					} else {
						throw new Error("you should create connection before opera mysql");
					}
				}
			} catch (error) {
				reject(error);
			}
			var mappingRecord = this.mapRecord(record);
			var updateObj = await this.getOperateObj("update", connection);
			updateObj.updateRecord(mappingRecord, this.resolveCallback(resolve, callback));
		})

	}

	static parseParameterStr(parametersStr) {
		if ("undefined" === parametersStr) {
			throw new Error("parametersStr is undeifned");
		}
		parametersStr = parametersStr.replace(/\s/g, "");
		var mappingParametersStr = "";
		var parametersStrs = parametersStr.split(";");
		var maps = [];
		for (var i = 0, len = parametersStrs.length; i < len; i++) {
			var parameters = parametersStrs[i].split("=");
			var map = {
				key: this.fields[parameters[0]].mapping || parameters[0],
				val: parameters[1]
			};
			maps.push(map);
		}
		return maps;

	}

	static resolveCallback(resolve, callback) {
		return (errmsg, result) => {
			if ("function" === typeof callback) {
				callback(errmsg, result)
			}
			resolve({ errmsg, result });
		}
	}

	static get(condition, connection, callback) {
		return new Promise(async (resolve, reject) => {
			try {
				if ("function" === typeof connection || undefined == connection) {
					callback = connection;
					if (this.pool !== null) {
						connection = await this.connect(this.pool)
					} else {
						throw new Error("you should create connection before opera mysql");
					}
				}
			} catch (error) {
				reject(error);
			}
			if (undefined === condition) {
				throw new Error("get needs condition parameter")
			}
			if (("string" != typeof condition) && ("function" == typeof condition)) {
				callback = condition;
				this.getAll(connection, this.resolveCallback(resolve, callback));
				return;
			}
			var queryObj = await this.getOperateObj("query", connection, resolve);
			var maps = this.parseParameterStr(condition);
			for (var i = 0, len = maps.length; i < len; i++) {
				queryObj.equalTo(maps[i].key, maps[i].val);
			}
			queryObj.find(this.resolveCallback(resolve, callback));
		})
	}

	static getAll(connection, callback) {
		return new Promise(async (resolve, reject) => {
			try {
				if ("function" === typeof connection || undefined == connection) {
					callback = connection;
					if (this.pool !== null) {
						connection = await this.connect(this.pool)
					} else {
						throw new Error("you should create connection before opera mysql");
					}
				}
			} catch (error) {
				reject(error);
			}
			var queryObj = await this.getOperateObj("query", connection);
			queryObj.find(this.resolveCallback(resolve, callback));
		})
	}

	static getByIds(ids, connection, callback) {
		return new Promise(async (resolve, errmsg) => {
			try {
				if ("function" === typeof connection || undefined == connection) {
					callback = connection;
					if (this.pool !== null) {
						connection = await this.connect(this.pool)
					} else {
						throw new Error("you should create connection before opera mysql");
					}
				}
			} catch (error) {
				reject(error);
			}
			var queryObj = await this.getOperateObj("query", connection, resolve);
			queryObj.in("id", ids)
			queryObj.find(this.resolveCallback(resolve, callback));
		})
	}

	static deleteByIds(ids, connection, callback) {
		return new Promise(async (resolve, reject) => {
			try {
				if ("function" === typeof connection || undefined == connection) {
					callback = connection;
					if (this.pool !== null) {
						connection = await this.connect(this.pool)
					} else {
						throw new Error("you should create connection before opera mysql");
					}
				}
			} catch (error) {
				reject(error);
			}
			if (!isNaN(ids)) {
				var idArray = new Array();
				idArray.push(ids);
				ids = idArray;
			}
			var deleteObj = await this.getOperateObj("delete", connection);
			deleteObj.deleteInBatchByIds(ids, this.resolveCallback(resolve, callback));
		})
	}


	static async getOperateObj (operateType, connection) {
		if (undefined == connection && this.pool !== null) {
			connection = await this.connect(this.pool)
		} 
		return dataBaseEngine.getOperations(operateType, this.fields, this.tableName, connection,this.pool);
	}

	parseDataStr(dataStr) {
		if ("string" != typeof dataStr) {
			throw new Error("dataStr must be a string")
		} else {
			var strs = dataStr.split(";");
			for (var i = 0, len = strs.length; i < len; i++) {
				var strArray = strs[i].split("=");
				var key = strArray[0];
				var value = strArray[1];
				if (this.constructor.fields[key]) {
					this[key] = value;
				}
			}
		}
	}

	setPageSize(pageSize) {
		this.pageSize = pageSize;
	}

	setPageNumber(pageNumber) {
		this.pageNumber = pageNumber;
	}




	opSqlSetament(connection, sql, callBack) {
		return new Promise(async (resolve, reject) => {
			try {
				if (("string" === typeof connection || undefined == connection)) {
					callback = "function" === typeof sql && sql;
					sql = "string" === typeof connection && connection;
					if (this.pool !== null) {
						connection = await this.constructor.connect(this.pool)
					} else {
						throw new Error("you should create connection before opera mysql");
					}
				}
			} catch (error) {
				reject(error);
			}
			return db.baseOp(sql, connection, this.resolveCallback(resolve, callback));
		})
	};

	static opSqlSetament(connection, sql, callBack) {
		return new Promise(async (resolve, reject) => {
			try {
				if (("string" === typeof connection || undefined == connection)) {
					callBack = ("function" === typeof sql) && sql;
					sql = "string" === typeof connection && connection;
					if (this.pool !== null) {
						connection = await this.connect(this.pool)
					} else {
						throw new Error("you should create connection before opera mysql");
					}
				}
			} catch (error) {
				reject(error);
			}
			return dataBaseEngine.baseOp(sql,connection ,this.resolveCallback(resolve, callBack));
		})
	};

	static createConnection(config) {
		if (dataBaseEngine == null) {
			dataBaseEngine = db.getDataBaseEngine(config);
		}
		return dataBaseEngine.createConnection();
	}

	static createPool(config) {
		if (dataBaseEngine == null) {
			dataBaseEngine = db.getDataBaseEngine(config);
		}
		this.pool = dataBaseEngine.createPool();
		return this.pool;
	}

	static connect(connection) {
		return dataBaseEngine.connect(connection);
	}
}

module.exports = Model;