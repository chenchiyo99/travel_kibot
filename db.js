// var Mongoclient = require('mongodb').Mongoclient;
// var url = "mongodb://localhost:27017/POIDB";

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var a,key=0;
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("POIDB");
//   dbo.collection("POI").findOne({}, function(err, result) {
//     if (err) throw err;
//     console.log(result.name);
//     db.close();
//   });
// });



var Mongos=function (q) {
MongoClient.connect(url,async function(err, db) {

  if (err) throw err;
  var dbo = db.db("POIDB");
  var qry = q;
  var m;
  await dbo.collection("POI").find(qry).toArray(function(err,result) {
  	return new Promise((resolve,reject) => {
    if (err) throw err;
    resolve(result);
    db.close();
    });
  });

});
}

var query = {"total":441};
console.log(1);
Mongos(query);
console.log(2);
// while(key=1)
// {
// 	console.log(m);
// }
// console.log(m);

// mongo.connect(url, function (err, client) {
// 	client.getCollection('POI').find({"data.0.id":1588}).sort( { CreateTime: -1 } ).skip(PageSize*PageIndex - PageSize).limit(PageSize).toArray((err, items) => {
// 	if (err) {
// 		client.close();
// 		throw err;
// 	}
//     client.close();
// });
// });

// mongo.connect(url, function(err, db) {
// 		var cursor = db.collection('POI').find();
// 		cursor.each(function(err, doc) {
// 			console.log(doc);
// 		});
// });

// "mongodb://localhost:27017/POIDB";

// Mongoclient.connect(url, function(err, db) {
// 	console.log("Connected");
// 	db.close();
// );