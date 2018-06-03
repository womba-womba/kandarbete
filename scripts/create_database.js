var mysql = require('mysql');
var options = require("../server/database").database;
var bcrypt = require('bcrypt');
var con = mysql.createConnection(options);
var myArray = ['Stockholm', 'Oslo', 'Copenhagen'];
var password = null;
bcrypt.hash('staralliance', 10, function (err, hash) {
  password = hash;
});
con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

// var sql = "update vacation set period = CONCAT(YEAR(start_date), ' ', QUARTER(start_date))";
// con.query(sql, function (err, result) {
//   if (err) throw err;
//   console.log("Table created");
// });
var sql = "alter table users add status int ";
con.query(sql, function (err, result) {
  if (err) throw err;
  console.log("Table created");
});



// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
//   var sql = "delete from users where emp_no not like '1002'";
//   con.query(sql, function (err, result) {
//     if (err) throw err;
//     console.log("Table created");
//   });
// });

// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
//   var sql = "CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), password BINARY(60))";
//   con.query(sql, function (err, result) {
//     if (err) throw err;
//     console.log("Table created");
//   });
// });