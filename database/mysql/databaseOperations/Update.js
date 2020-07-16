var BaseDBOperation = require('./BaseDBOperation');

var Update = function (connect, fields, tableName) {

	//	this.tableName = model.tableName;
	BaseDBOperation.call(this, connect, fields, tableName);
	this.updateFieldsSql = "";

	this.batchUpdateById = function (records, callback) {
		return new Promise((resolve) => {
			var sql = "UPDATE " + tableName + " SET ";
			var ids = [];
			var length = records.length;
			for (var i = 0; i < length; i++) {
				if (!records[i].id) {
					throw new Error(records[i].name + " haven't insert ");
				}
				ids.push(records[i].id);
			}
			var idMappingFieldsName = fields['id'].mapping;
			this.in(idMappingFieldsName, ids);
			var updatesql = "";
			for (field in fields) {
				var mapping = fields[field].mapping;
				updatesql += ' ' + mapping + " = CASE " + idMappingFieldsName;
				for (var i = 0; i < length; i++) {
					updatesql += " when " + records[i].id + " then " + this.formatBataBaseSet(records[i][field], fields[field]) + " ";
				}
				updatesql += ' END,';
			}
			updatesql = updatesql.slice(0, -1);
			sql += updatesql + ' WHERE ' + this.conditionsCollector();
			this.baseOp(sql, function(errmsg,result){
				callback(errmsg,result)
				resolve({errmsg,result})
			});
		})
	};


	this.updateRecord = function (record, callback) {
		// this.equalTo("id",record.id);
		return this.doupdate(record, callback);
	};


	this.doupdate = function (record, callBack) {
		return new Promise((resolve) => {
			var conditions = this.conditionsCollector();
			if ("" === conditions) {
				conditions = this.getDefaultCondition(record);
			}
			let changeInfo = this.dataBaseUpdateSetCollector(record);
			if (changeInfo) {
				var sql = "update " + tableName + " set " + changeInfo + 'where' + conditions + " ;";
				this.baseOp(sql, function (errmsg, result) {
					typeof callBack == "function" && callBack(errmsg, result)
					resolve({ errmsg, result })
				});
			} else {
				typeof callBack == "function"  && callBack("", record)
				resolve({ errmsg: "", result: record })
			}
		})
	};

	this.dataBaseUpdateSetCollector = function (record) {
		var set = '';
		for (var element in record) {//浅度操作，如果record的数据中某个数据是一个对象则需要进一步完善；
			var field = fields[element];
			if (element != 'id' && field) {
				set += " " + field.mapping + " = " + this.formatBataBaseSet(record[element], field) + " ,";
			}
		}
		return set.slice(0, -1);
	};

};

module.exports = Update;