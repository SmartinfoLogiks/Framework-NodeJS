//MySQL Database Helper Functions

global._MYSQL = {};

module.exports = function(server, restify) {

	//Standard MySQL
	global.db_query = function(sql, params, callback) {
		if(CONFIG.log_sql) {
			console.log("SQL", sql, params);
		}
		server.mysql.query(sql, params, function(err, results, fields) {
					// console.log(err,results,fields);
			      	if(err) {
			      		callback(false);
			      		return;
			      	}
			      	if(results.length<=0) {
			      		return callback([]);
			      	}
			      	results = JSON.parse(JSON.stringify(results));
			      	callback(results);
			    });
	},

	global.db_selectQ = function(table, columns, where, whereParams, callback, additionalQueryParams) {
		if(Array.isArray(columns)) columnsStr = columns.join(",");
		else columnsStr = columns;

		var sql = "SELECT "+columnsStr+" FROM "+table+" ";

		if(where!=null) {
			var sqlWhere = [];
			if(typeof where == "object" && !Array.isArray(where)) {
				_.each(where, function(a, b) {
					if(a == "RAW") {
						sqlWhere.push(b);
					} else if(Array.isArray(a) && a.length==2) {
						sqlWhere.push(b+a[1]+"'"+a[0]+"'");
					} else {
						sqlWhere.push(b+"='"+a+"'");
					}
				});
			} else {
				sqlWhere.push(where);
			}

			if(sqlWhere.length>0) {
				sql += " WHERE "+sqlWhere.join(" AND ");
			}
		}

		if(additionalQueryParams!=null && additionalQueryParams.length>0) {
			sql += additionalQueryParams;
		}

		// console.log("_selectQ", sql);
		if(CONFIG.log_sql) {
			console.log("SQL", sql, whereParams);
		}
		server.mysql.query(sql, whereParams, function(err, results, fields) {
			      	if(err || results.length<=0) {
			      		if(err) console.log(err);
			      		callback(false);
			      		return;
			      	}

			      	results = JSON.parse(JSON.stringify(results));
			      	callback(results);
			    });
	},

	global.db_insertQ1 = function(table, data, callback) {

		cols = [];quest = [];
		vals = [];
		_.each(data, function(a,b) {
			cols.push(b);
			vals.push(a);
			quest.push("?");
		});

		var sql = "INSERT INTO "+table+" ("+cols.join(",")+") VALUES ("+quest.join(",")+")";

		if(CONFIG.log_sql) {
			console.log("SQL", sql, vals);
		}

		server.mysql.query(sql, vals, function(err, results, fields) {
	          if(err) {
	          	// console.log(err);
	            return callback(false, err.code, err.sqlMessage);
	          }

	          callback(results.insertId);
	        });
	},

	global.db_insert_batchQ = function(table, data, callback) {
		if(data[0]==null) {
			return callback(false, "Data Not Defined");
		}

		let cols = Object.keys(data[0]);
		let values = data.map( obj => cols.map( key => obj[key]));


		var sql = "INSERT INTO "+table+" ("+cols.join(",")+") VALUES ?";

		if(CONFIG.log_sql) {
			console.log("SQL", sql, data);
		}

		server.mysql.query(sql, [values], function(err, results, fields) {
	          if(err) {
	          	if(err) console.log(err);
	            return callback(false);
	          }
	          callback(true);
	        });
	},

	global.db_deleteQ = function(table, where, callback) {
		sqlWhere = [];
		if(typeof where == "object" && !Array.isArray(where)) {
			_.each(where, function(a, b) {
				if(a == "RAW") {
					sqlWhere.push(b);
				} else if(Array.isArray(a) && a.length==2) {
					sqlWhere.push(b+a[1]+"'"+a[0]+"'");
				} else {
					sqlWhere.push(b+"='"+a+"'");
				}
			});
		} else {
			sqlWhere.push(where);
		}

		var sql = "DELETE FROM "+table+" WHERE "+sqlWhere.join(" AND ");

		if(CONFIG.log_sql) {
			console.log("SQL", sql, vals);
		}

		server.mysql.query(sql, vals, function(err, results, fields) {
	          if(err) {
	            return callback(false);
	          }
	          callback(true);
	        });
	},

	global.db_updateQ = function(table, data, where, callback) {
		var fData = [];
		var vals = [];
		_.each(data, function(a,b) {
			fData.push(b+"=?");
			vals.push(a);
		});

		var sqlWhere = [];
		if(typeof where == "object" && !Array.isArray(where)) {
			_.each(where, function(a, b) {
				if(a == "RAW") {
					sqlWhere.push(b);
				} else if(Array.isArray(a) && a.length==2) {
					sqlWhere.push(b+a[1]+"'"+a[0]+"'");
				} else {
					sqlWhere.push(b+"='"+a+"'");
				}
			});
		} else {
			sqlWhere.push(where);
		}

		var sql = "UPDATE "+table+" SET "+fData.join(",")+" WHERE "+sqlWhere.join(" AND ");

		//console.log(sql);
		if(CONFIG.log_sql) {
			console.log("SQL", sql, vals);
		}

		server.mysql.query(sql, vals, function(err, results, fields) {
	          if(err) {
	          	if(err) console.log(err);
	            return callback(false);
	          }
	          callback(true);
	        });
	}
}