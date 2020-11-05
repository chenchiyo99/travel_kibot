'use strict'// var Mongoclient = require('mongodb').Mongoclient;
// var url = "mongodb://localhost:27017/POIDB";

const axios = require("axios");
var MongoClient = require('mongodb').MongoClient;
// &keepAlive=true&poolSize=30&autoReconnect=true&socketTimeoutMS=360000&connectTimeoutMS=360000
// var url = "mongodb+srv://chenchiyo99:cocochiyo99@cluster0.w0yom.gcp.mongodb.net/POIDB?retryWrites=true&w=majority";
var url = "mongodb+srv://chenchiyo99:cocochiyo99@cluster0.w0yom.gcp.mongodb.net/anything?retryWrites=true&w=majority";
var getwresult;
const ln = "";
const wx06 = "";
const wx12 = "";
const wx18 = "";
const pop06 = "";
const pop12 = "";
const pop18 = "";
const mint06 = "";
const mint12 = "";
const mint18 = "";
const ci06 = "";
const ci12 = "";
const ci18 = "";
const maxt06 = "";
const maxt12 = "";
const maxt18 = "";
const clothes="",rain="";

const express = require('express')
const app = express()
let { PythonShell } = require('python-shell')

// app.listen(3000, () => {
//   console.log('server running on port 3000')
// })

// app.get('/call/python', pythonProcess)

function getGoogleSearch(Query){
	return new Promise(async (resolve, reject) => {
		try {
			const Result = await axios.get(
				"https://www.googleapis.com/customsearch/v1",
				{
					params: {
						cx: "30186518590ab80b3",
						key: "AIzaSyDRRW_RtDdJ88PuhjzcUnCqzupzQSse_m0",
						q: Query
					}
				});

			resolve(Result.data);
			console.log(Result.data.queries.request);
			for(var i = 0;i<5;i++)
			{
				
			}
			
		} catch (error) {
			reject(error);
		}
	}); 
}


function pythonProcess(req, res) {
  let options = {
    args:
      [
        req.query.name,
        req.query.from
      ]
  }

  PythonShell.run('./process.py', options, (err, data) => {
    if (err) res.send(err)
    const parsedString = JSON.parse(data)
    console.log(`name: ${parsedString.Name}, from: ${parsedString.From}`)
    // res.json(parsedString)
  })

}

function pprocess(crawlquery) {
  let options = {
    args:
      [
        crawlquery
      ]
  }

  PythonShell.run('./gcrawler.py', options, (err, data) => {
  	console.log(data);
    const parsedString = JSON.parse(data)
    console.log(parsedString)
    // res.json(parsedString)
  })

}


// pprocess('臺北市有什麽好吃的');


// var scraper = require('google-search-scraper');
 
// var options = {
//   query: 'nodejs',
//   limit: 10
// };
 
// scraper.search(options, function(err, url, meta) {
//   // This is called for each result
//   if(err) throw err;
//   console.log(url);
//   console.log(meta.title);
//   console.log(meta.meta);
//   console.log(meta.desc)
// });


// pprocess('臺北市有什麽好吃的');
// const { getData } = require('./googleSheet.js');
// const csv=require('csvtojson');
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("POIDB");
//   dbo.collection("POI").findOne({}, function(err, result) {
//     if (err) throw err;
//     console.log(result.name);
//     db.close();
//   });
// });



// const getWeather = location => {
// 	return new Promise(async (resolve, reject) => {
// 		try {
// 			const weatherConditions = await axios.get(
// 				"https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001",
// 				{
// 					params: {
// 						access_key: "CWB-9CF20E34-2234-49C1-8561-1E70869054E4",
// 						locationName: location
// 					}
// 				});

// 			resolve(weatherConditions.data);
// 			console.log(weatherConditions.data);
// 		} catch (error) {
// 			reject(error);
// 		}
// 	}); 
// }




// const asyncApiCall = async (location) => {
//     const response = await getW(location);}

// function getW(location){ 
// 	return axios({
//         method:"get",
//         url : "opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-9CF20E34-2234-49C1-8561-1E70869054E4&locationName=%E5%AE%9C%E8%98%AD%E7%B8%A3"
//     //     ,params: {
//     //         access_key: "CWB-9CF20E34-2234-49C1-8561-1E70869054E4",
//  			// locationName: location
//     //     }
//     })
// }


// function getWeather(location){	return new Promise(async (resolve, reject) => {
// 		try {
// 			const weatherConditions = await axios.get(
// 				"https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001",
// 				{
// 					params: {
// 						Authorization: "CWB-9CF20E34-2234-49C1-8561-1E70869054E4",
// 						locationName: "宜蘭縣"
// 					}
// 				});

// 			resolve(weatherConditions.data);
// 			console.log(weatherConditions.data.records.location[0]);
// 		} catch (error) {
// 			reject(error);
// 		}
// 	}); 
// }






// function getWeather(location){
// 	return new Promise(async (resolve, reject) => {
// 		try {
// 			const weatherConditions = await axios.get(
// 				"https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001",
// 				{
// 					params: {
// 						Authorization: "CWB-9CF20E34-2234-49C1-8561-1E70869054E4",
// 						locationName: location
// 					}
// 				});

// 			resolve(weatherConditions.data);
// 			getwresult = weatherConditions.data.records;
// 			const ln = getwresult.location[0].locationName;
// 			const wx06 = getwresult.location[0].weatherElement[0].time[0].parameter.parameterName;
// 			const wx12 = getwresult.location[0].weatherElement[0].time[1].parameter.parameterName;
// 			const wx18 = getwresult.location[0].weatherElement[0].time[2].parameter.parameterName;
// 			const pop06 = getwresult.location[0].weatherElement[1].time[0].parameter.parameterName+"%"; 
// 			const pop12 = getwresult.location[0].weatherElement[1].time[1].parameter.parameterName+"%";
// 			const pop18 = getwresult.location[0].weatherElement[1].time[2].parameter.parameterName+"%";
// 			const mint06 = getwresult.location[0].weatherElement[2].time[0].parameter.parameterName+"度C";
// 			const mint12 = getwresult.location[0].weatherElement[2].time[1].parameter.parameterName+"度C";
// 			const mint18 = getwresult.location[0].weatherElement[2].time[2].parameter.parameterName+"度C";
// 			const ci06 = getwresult.location[0].weatherElement[3].time[0].parameter.parameterName; 
// 			const ci12 = getwresult.location[0].weatherElement[3].time[1].parameter.parameterName;
// 			const ci18 = getwresult.location[0].weatherElement[3].time[2].parameter.parameterName;
// 			const maxt06 = getwresult.location[0].weatherElement[4].time[0].parameter.parameterName+"度C";
// 			const maxt12 = getwresult.location[0].weatherElement[4].time[1].parameter.parameterName+"度C";
// 			const maxt18 = getwresult.location[0].weatherElement[4].time[2].parameter.parameterName+"度C";
// 			const clothes="no",rain="no"; 
// 			if(getwresult.location[0].weatherElement[2].time[0].parameter.parameterName < 15)
// 			{
// 				if(getwresult.location[0].weatherElement[1].time[0].parameter.parameterName == 0)
// 			{
// 				console.log(ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天溫度比較低建議要帶外套"+"\n"+"看起來不會下雨，挺適合出門的哦~");	
// 				// rain = ;
				
// 			}
// 			else if(getwresult.location[0].weatherElement[1].time[0].parameter.parameterName < 30)
// 			{
// 				console.log(ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天溫度比較低建議要帶外套"+"\n"+"降雨機率不高，不過還是建議帶把傘");	
// 				// rain = "降雨機率不高，不過還是建議帶把傘";
				
// 			}
// 			else
// 			{
// 				console.log(ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天溫度比較低建議要帶外套"+"\n"+"近期很可能會下雨，請記得帶傘");
// 				// rain = "近期很可能會下雨，請記得帶傘";
				
// 			}
// 				// clothes = "今天溫度比較低建議要帶外套";
				
// 			}
// 			else if(getwresult.location[0].weatherElement[2].time[0].parameter.parameterName > 26)
// 			{
// 				if(getwresult.location[0].weatherElement[1].time[0].parameter.parameterName == 0)
// 			{
// 				console.log(ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天氣溫炎熱，多補充水分避免中暑"+"\n"+"看起來不會下雨，挺適合出門的哦~");
// 				// rain = "看起來不會下雨，挺適合出門的哦~";
				
// 			}
// 			else if(getwresult.location[0].weatherElement[1].time[0].parameter.parameterName < 30)
// 			{
// 				console.log(ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天氣溫炎熱，多補充水分避免中暑"+"\n"+"降雨機率不高，不過還是建議帶把傘");
// 				// rain = "降雨機率不高，不過還是建議帶把傘";
				
// 			}
// 			else
// 			{
// 				console.log(ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天氣溫炎熱，多補充水分避免中暑"+"\n"+"近期很可能會下雨，請記得帶傘");
// 				// rain = "近期很可能會下雨，請記得帶傘";
				
// 			}
// 				// clothes = "今天氣溫炎熱，多補充水分避免中暑";
				
// 			}
// 			else
// 			{
// 				if(getwresult.location[0].weatherElement[1].time[0].parameter.parameterName == 0)
// 			{
// 				console.log(ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天天氣氣溫宜人，可以搭配心情自由穿搭"+"\n"+"看起來不會下雨，挺適合出門的哦~");
// 				// rain = "看起來不會下雨，挺適合出門的哦~";
				
// 			}
// 			else if(getwresult.location[0].weatherElement[1].time[0].parameter.parameterName < 30)
// 			{
// 				console.log(ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天天氣氣溫宜人，可以搭配心情自由穿搭"+"\n"+"降雨機率不高，不過還是建議帶把傘");
// 				// rain = "降雨機率不高，不過還是建議帶把傘";
				
// 			}
// 			else
// 			{
// 				console.log(ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天天氣氣溫宜人，可以搭配心情自由穿搭"+"\n"+"近期很可能會下雨，請記得帶傘");
// 				// rain = "近期很可能會下雨，請記得帶傘";
				
// 			}
// 				// clothes = "今天天氣氣溫宜人，可以搭配心情自由穿搭";
				
// 			}
			
// 			// +"未來36小時的天氣預報如下"+"\n"+"12小時内："+"\n"+"天氣預報資訊:"+wx06
// 			// +"\n"+"24小時内："+"\n"+"天氣預報資訊:"+wx12+"\n"+"36小時内："+"\n"+"天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+clothes+"\n"+rain
// 		} catch (error) {
// 			reject(error);
// 		}
// 	}); 
// }



// const getWeatherW = location => {
// 	return new Promise(async (resolve, reject) => {
// 		try {
// 			const weatherConditions = await axios.get(
// 				"http://api.weatherstack.com/current",
// 				{
// 					params: {
// 						access_key: "67281a75482cbb8caabb544274f932b3",
// 						query: location
// 					}
// 				});

// 			resolve(weatherConditions.data);
// 			console.log(weatherConditions.data);
// 		} catch (error) {
// 			reject(error);
// 		}
// 	}); 
// }




// var trim = function(str){
// var trimLeft = /^\s+/,
// trimRight = /\s+$/;
// return str.replace( trimLeft, "" ).replace( trimRight, "" );
// };

var Mongos=function (cat,q,callback) {
MongoClient.connect(url,async function(err, db) {

switch (cat){

	case "getrandom":
		const regex = new RegExp(q,'g');
		if (err) throw err;
		var dbo = db.db("POIDB");
		// const m=dbo.collection("POI").count({"address":/q/});
		// .skip(dbo.collection("POI").count({"address":/q/})).next()
		dbo.collection("LocationDB").find({"similar":/北投/}).toArray(function(err,result) {
		if (err) throw err;
		// mongotemp = result;
		console.log(result);
		db.close();
		// mongoresult = "找到的結果是"+result[0].location;
		// console.log(mongoresult);

		if(typeof callback === 'function') callback();
		
		});
		break;

	default:
		break;
}

})
}


function getDirection(location1,location2){
	return new Promise(async (resolve, reject) => {
		try {
			const Directions = await axios.get(
				"https://maps.googleapis.com/maps/api/directions/json",
				{
					params: {
						origin: location1,
						destination: location2,
						mode: "transit",
						key: "AIzaSyDRRW_RtDdJ88PuhjzcUnCqzupzQSse_m0"
					}
				});

			resolve(Directions.data);
			console.log(Directions.data);
		} catch (error) {
			reject(error);
		}
	}); 
}



// var query = "        信義";
// query = trim(query);
// console.log(query);
// console.log(trim(query));
var searchtype = "getrandom";



console.log(1);

console.log(3);

// Mongos("getrandom");
getGoogleSearch("aiuwijbdcjbdas");
// getDirection("臺北車站","新北市林口區東明一街55巷23號");
console.log(2);



// CSVToJSON()
//     .then(users => {

//         // users is a JSON array
//         // log the JSON array
//         console.log(users);
//     }).catch(err => {
//         // log error if any
//         console.log(err);
//     });

// csv({
//     noheader:true,
//     output: "csv"
// })
// .fromString(csvStr)
// .then((csvRow)=>{ 
//     console.log(csvRow) // => [["1","2","3"], ["4","5","6"], ["7","8","9"]]
// })

// (async () => {
//   const resp = await getData('1jqWtx_61_opnb06YZE2mpZK2R8jBl3eZi8HmKA764P4', '0');
//   console.log(resp);
//   csv({
//     noheader:true,
//     output: "csv"
// })
// .fromString(resp)
// .then((csvRow)=>{ 
//     console.log(csvRow)
// });
// })();

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