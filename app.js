   'use strict';

const axios = require('axios');
const dialogflow = require('dialogflow');
const config = require('./config');
const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const uuid = require('uuid');
const wapikey = "CWB-9CF20E34-2234-49C1-8561-1E70869054E4";
const wurl = 'https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001';
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://chenchiyo99:cocochiyo99@cluster0.w0yom.gcp.mongodb.net/anything?retryWrites=true&w=majority";
var searchtype;
var formonmessage,mongotemp,mongoresult,getwresult;
var sender = 2708331595942685;
var regex;



// Messenger API parameters
if (!config.FB_PAGE_TOKEN) {
    throw new Error('missing FB_PAGE_TOKEN');
}
if (!config.FB_VERIFY_TOKEN) {
    throw new Error('missing FB_VERIFY_TOKEN');
}
if (!config.GOOGLE_PROJECT_ID) {
    throw new Error('missing GOOGLE_PROJECT_ID');
}
if (!config.DF_LANGUAGE_CODE) {
    throw new Error('missing DF_LANGUAGE_CODE');
}
if (!config.GOOGLE_CLIENT_EMAIL) {
    throw new Error('missing GOOGLE_CLIENT_EMAIL');
}
if (!config.GOOGLE_PRIVATE_KEY) {
    throw new Error('missing GOOGLE_PRIVATE_KEY');
}
if (!config.FB_APP_SECRET) {
    throw new Error('missing FB_APP_SECRET');
}
if (!config.SERVER_URL) { //used for ink to static files
    throw new Error('missing SERVER_URL');
}



app.set('port', (process.env.PORT || 8080))

//verify request came from facebook
app.use(bodyParser.json({
    verify: verifyRequestSignature
}));

//serve static files in the public directory
app.use(express.static('public'));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));

// Process application/json
app.use(bodyParser.json());






const credentials = {
    client_email: config.GOOGLE_CLIENT_EMAIL,
    private_key: config.GOOGLE_PRIVATE_KEY,
};

const sessionClient = new dialogflow.SessionsClient(
    {
        projectId: config.GOOGLE_PROJECT_ID,
        credentials
    }
);


const sessionIds = new Map();

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    console.log("request");
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === config.FB_VERIFY_TOKEN) {
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
})

/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page. 
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
app.post('/webhook/', function (req, res) {
    var data = req.body;
    console.log(JSON.stringify(data));



    // Make sure this is a page subscription
    if (data.object == 'page') {
        // Iterate over each entry
        // There may be multiple if batched
        data.entry.forEach(function (pageEntry) {
            var pageID = pageEntry.id;
            var timeOfEvent = pageEntry.time;

            // Iterate over each messaging event
            pageEntry.messaging.forEach(function (messagingEvent) {
                if (messagingEvent.optin) {
                    receivedAuthentication(messagingEvent);
                } else if (messagingEvent.message) {
                    receivedMessage(messagingEvent);
                } else if (messagingEvent.delivery) {
                    receivedDeliveryConfirmation(messagingEvent);
                } else if (messagingEvent.postback) {
                    receivedPostback(messagingEvent);
                } else if (messagingEvent.read) {
                    receivedMessageRead(messagingEvent);
                } else if (messagingEvent.account_linking) {
                    receivedAccountLink(messagingEvent);
                } else {
                    console.log("Webhook received unknown messagingEvent: ", messagingEvent);
                }
            });
        });

        // Assume all went well.
        // You must send back a 200, within 20 seconds
        res.sendStatus(200);
    }
});




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
			console.log(Result.data);
			if(Result.data.searchInformation.totalResults == '0')
			{
				sendTextMessage(sender,"我在Google上也找不到相關的資訊，可能要換個我能理解的説法。。。")
			}
			else
			{
				sendTextMessage(sender,"這些是我從Google上找到的幾個答案");
				for(var i = 0;i<5;i++)
				{
					sendTextMessage(sender,Result.data.items[i].title+"\n"+Result.data.items[i].formattedUrl+"\n"+Result.data.items[i].snippet);
				}
			}
		} catch (error) {
			reject(error);
		}
	}); 
}





function getWeather(location,searchtime){
	return new Promise(async (resolve, reject) => {
		try {
			const weatherConditions = await axios.get(
				"https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001",
				{
					params: {
						Authorization: "CWB-9CF20E34-2234-49C1-8561-1E70869054E4",
						locationName: location
					}
				});

			resolve(weatherConditions.data);

			getwresult = weatherConditions.data.records;
			const ln = getwresult.location[0].locationName;
			const wx06 = getwresult.location[0].weatherElement[0].time[0].parameter.parameterName;
			const wx12 = getwresult.location[0].weatherElement[0].time[1].parameter.parameterName;
			const wx18 = getwresult.location[0].weatherElement[0].time[2].parameter.parameterName;
			const pop06 = getwresult.location[0].weatherElement[1].time[0].parameter.parameterName+"%"; 
			const pop12 = getwresult.location[0].weatherElement[1].time[1].parameter.parameterName+"%";
			const pop18 = getwresult.location[0].weatherElement[1].time[2].parameter.parameterName+"%";
			const mint06 = getwresult.location[0].weatherElement[2].time[0].parameter.parameterName+"度C";
			const mint12 = getwresult.location[0].weatherElement[2].time[1].parameter.parameterName+"度C";
			const mint18 = getwresult.location[0].weatherElement[2].time[2].parameter.parameterName+"度C";
			const ci06 = getwresult.location[0].weatherElement[3].time[0].parameter.parameterName; 
			const ci12 = getwresult.location[0].weatherElement[3].time[1].parameter.parameterName;
			const ci18 = getwresult.location[0].weatherElement[3].time[2].parameter.parameterName;
			const maxt06 = getwresult.location[0].weatherElement[4].time[0].parameter.parameterName+"度C";
			const maxt12 = getwresult.location[0].weatherElement[4].time[1].parameter.parameterName+"度C";
			const maxt18 = getwresult.location[0].weatherElement[4].time[2].parameter.parameterName+"度C";
			const clothes="no",rain="no"; 
			if(getwresult.location[0].weatherElement[2].time[0].parameter.parameterName < 15)
			{
				if(getwresult.location[0].weatherElement[1].time[0].parameter.parameterName == 0)
			{
				sendTextMessage(sender,ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天溫度比較低建議要帶外套"+"\n"+"看起來不會下雨，挺適合出門的哦~");	
				// sendTextMessage(sender,ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天溫度比較低建議要帶外套"+"\n"+"看起來不會下雨，挺適合出門的哦~");
				// rain = ;
				
			}
			else if(getwresult.location[0].weatherElement[1].time[0].parameter.parameterName < 30)
			{
				sendTextMessage(sender,ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天溫度比較低建議要帶外套"+"\n"+"降雨機率不高，不過還是建議帶把傘");	
				// sendTextMessage(sender,ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天溫度比較低建議要帶外套"+"\n"+"看起來不會下雨，挺適合出門的哦~");
				// rain = "降雨機率不高，不過還是建議帶把傘";
				
			}
			else
			{
				sendTextMessage(sender,ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天溫度比較低建議要帶外套"+"\n"+"近期很可能會下雨，請記得帶傘");
				// sendTextMessage(sender,ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天溫度比較低建議要帶外套"+"\n"+"看起來不會下雨，挺適合出門的哦~");
				// rain = "近期很可能會下雨，請記得帶傘";
				
			}
				// clothes = "今天溫度比較低建議要帶外套";
				
			}
			else if(getwresult.location[0].weatherElement[2].time[0].parameter.parameterName > 26)
			{
				if(getwresult.location[0].weatherElement[1].time[0].parameter.parameterName == 0)
			{
				sendTextMessage(sender,ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天氣溫炎熱，多補充水分避免中暑"+"\n"+"看起來不會下雨，挺適合出門的哦~");				
				// sendTextMessage(sender,ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天溫度比較低建議要帶外套"+"\n"+"看起來不會下雨，挺適合出門的哦~");
				// rain = "看起來不會下雨，挺適合出門的哦~";
				
			}
			else if(getwresult.location[0].weatherElement[1].time[0].parameter.parameterName < 30)
			{
				sendTextMessage(sender,ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天氣溫炎熱，多補充水分避免中暑"+"\n"+"降雨機率不高，不過還是建議帶把傘");
				// sendTextMessage(sender,ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天溫度比較低建議要帶外套"+"\n"+"看起來不會下雨，挺適合出門的哦~");
				// rain = "降雨機率不高，不過還是建議帶把傘";
				
			}
			else
			{
				sendTextMessage(sender,ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天氣溫炎熱，多補充水分避免中暑"+"\n"+"近期很可能會下雨，請記得帶傘");
				// sendTextMessage(sender,ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天溫度比較低建議要帶外套"+"\n"+"看起來不會下雨，挺適合出門的哦~");
				// rain = "近期很可能會下雨，請記得帶傘";
				
			}
				// clothes = "今天氣溫炎熱，多補充水分避免中暑";
				
			}
			else
			{
				if(getwresult.location[0].weatherElement[1].time[0].parameter.parameterName == 0)
			{
				sendTextMessage(sender,ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天天氣氣溫宜人，可以搭配心情自由穿搭"+"\n"+"看起來不會下雨，挺適合出門的哦~");
				// sendTextMessage(sender,ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天溫度比較低建議要帶外套"+"\n"+"看起來不會下雨，挺適合出門的哦~");
				// rain = "看起來不會下雨，挺適合出門的哦~";
				
			}
			else if(getwresult.location[0].weatherElement[1].time[0].parameter.parameterName < 30)
			{
				sendTextMessage(sender,ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天天氣氣溫宜人，可以搭配心情自由穿搭"+"\n"+"降雨機率不高，不過還是建議帶把傘");
				// sendTextMessage(sender,ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天溫度比較低建議要帶外套"+"\n"+"看起來不會下雨，挺適合出門的哦~");
				// rain = "降雨機率不高，不過還是建議帶把傘";
				
			}
			else
			{
				sendTextMessage(sender,ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天天氣氣溫宜人，可以搭配心情自由穿搭"+"\n"+"近期很可能會下雨，請記得帶傘");
				// sendTextMessage(sender,ln+"未來36小時的天氣預報如下"+"\n"+"12小時内天氣預報資訊:"+wx06+"\n"+"24小時内天氣預報資訊:"+wx12+"\n"+"36小時内天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+"今天溫度比較低建議要帶外套"+"\n"+"看起來不會下雨，挺適合出門的哦~");
				// rain = "近期很可能會下雨，請記得帶傘";
				
			}
				// clothes = "今天天氣氣溫宜人，可以搭配心情自由穿搭";
				
			}
			
			// +"未來36小時的天氣預報如下"+"\n"+"12小時内："+"\n"+"天氣預報資訊:"+wx06
			// +"\n"+"24小時内："+"\n"+"天氣預報資訊:"+wx12+"\n"+"36小時内："+"\n"+"天氣預報資訊:"+wx18+"\n"+"預報告訴我們天氣感受將會是"+ci06+"的"+"\n"+clothes+"\n"+rain
		} catch (error) {
			reject(error);
		}
	}); 
}



function getDirection(location1,location2,dtype){
	switch(dtype)
	{

	case "getD":
	return new Promise(async (resolve, reject) => {
		try {
			const Directions = await axios.get(
				"https://maps.googleapis.com/maps/api/directions/json",
				{
					params: {
						origin: location1,
						destination: location2,
						// mode: "transit",
						key: "AIzaSyDRRW_RtDdJ88PuhjzcUnCqzupzQSse_m0"
					}
				});

			resolve(Directions.data);
			location1 = trimAll(location1);
			location2 = trimAll(location2);
			sendTextMessage(sender,"爲了更快速解決你的問題"+"\n"+"讓我帶你去導航介面吧"+"\n"+"https://www.google.com/maps/dir/"+location1+"/"+location2);
			
		} catch (error) {
			reject(error);
		}
	}); 
	break;
	case "findt":
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
			sendTextMessage(sender,"這段路程將會耗時"+Directions.data.routes[0].legs[0].duration.text);
			
		} catch (error) {
			reject(error);
		}
	}); 
	break;
	case "findd":
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
			sendTextMessage(sender,"這段路程長度爲"+Directions.data.routes[0].legs[0].distance.text);
			
		} catch (error) {
			reject(error);
		}
	}); 
	break;
	default:
	break;



}}





var trim = function(str){
var trimLeft = /^\s+/,
trimRight = /\s+$/;
return str.replace( trimLeft, "" ).replace( trimRight, "" );
};

var trimAll = function(str){
var trimAll = /\s*/g;
return str.replace(trimAll,"");
};
//臺北婦女館地圖資料https://www.google.com/maps/search/?api=1&query=25.033459,121.501280&query_place_id=ChIJaRFJC6-pQjQRx9I-a2QVtYI


//find intent type with (response.intent.name),normally use getintent(response.intent.name);
function getintent(getintentinput,messages){
switch (getintentinput) {
        case 'projects/kibot-tkwefa/agent/intents/e2ae1ba6-4299-40b0-b55d-c303c1139658': //好無聊，可以去哪裏
            console.log("Backend Intent:好無聊，可以去哪裏");
            // return "getrandom";
            formonmessage = trim(formonmessage);
            Mongos("getrandom",formonmessage);
            break;
        // case 'projects/kibot-tkwefa/agent/intents/bd776b51-4192-45d1-99d1-d4c8db33bfc5': //地圖資料-哪裡可以從事什麼活動
        //     console.log("Backend Intent:地圖資料-哪裡可以從事什麼活動");
        //     sendTextMessage(sender,"你可以使用以下地點資訊...");
        //     break;
        case 'projects/kibot-tkwefa/agent/intents/2628fa97-f8f7-44cd-9bdd-636ff9ae47a2': //地圖資料-從某地導航到某地
            console.log("Backend Intent:地圖資料-從某地導航到某地");
            sendTextMessage(sender,"你可以使用以下地點資訊...");
            formonmessage=formonmessage.toString().split(",");
            for(var i=0;i<formonmessage.length;i++)
            {
            	formonmessage[i] = trim(formonmessage[i]);
            }
            getDirection(formonmessage[0],formonmessage[1],"getD");
            break;
        case 'projects/kibot-tkwefa/agent/intents/b11f2db0-994b-4546-9cc0-e061cb90ee7d': //地圖資料-時間
            console.log("Backend Intent:地圖資料-時間");
            sendTextMessage(sender,"計算時間中...");
            formonmessage=formonmessage.toString().split(",");
            for(var i=0;i<formonmessage.length;i++)
            {
            	formonmessage[i] = trim(formonmessage[i]);
            }
            getDirection(formonmessage[0],formonmessage[1],"findt");
            break;
        case 'projects/kibot-tkwefa/agent/intents/c765c398-16ef-4b63-88e8-a0bbb8ad1af7': //地圖資料-距離
            console.log("Backend Intent:地圖資料-距離");
            sendTextMessage(sender,"計算距離中...");
            formonmessage=formonmessage.toString().split(",");
            for(var i=0;i<formonmessage.length;i++)
            {
            	formonmessage[i] = trim(formonmessage[i]);
            }
            getDirection(formonmessage[0],formonmessage[1],"findd");
            break;
        case 'projects/kibot-tkwefa/agent/intents/46b4fe80-20aa-41e7-a127-b14c2ea5a1e6': //地圖資料-路線
            console.log("Backend Intent:地圖資料-路線");
            sendTextMessage(sender,"你可以使用以下地點資訊...");
            break;
        case 'projects/kibot-tkwefa/agent/intents/a4cbdc4e-f66e-47ea-89b3-d0bdd6cfe9dd': //天氣-天氣狀況
            console.log("Backend Intent:天氣-天氣狀況");
            formonmessage = trim(formonmessage);
            sendTextMessage(sender,"將會爲您查詢我的天氣資料庫,請稍等~~");
            Mongos("getweather",formonmessage);
            break;
        case 'projects/kibot-tkwefa/agent/intents/65889a6f-812b-407e-b4ca-966494edf23e': //天氣-某地+天氣狀況
            console.log("Backend Intent:天氣-某地+天氣狀況");
            formonmessage = trim(formonmessage);
            sendTextMessage(sender,"將會爲您查詢我的天氣資料庫,請稍等~~");
            Mongos("getweather",formonmessage);
            break;
        case 'projects/kibot-tkwefa/agent/intents/1d5fdd51-8117-467b-a1ce-22d82e4dd0cf': //天氣-某地+某時間點+狀況
            console.log("Backend Intent:天氣-某地+某時間點+狀況");
            sendTextMessage(sender,"將會爲您查詢我的天氣資料庫,請稍等~~");
            formonmessage=formonmessage.toString().split(",");
            for(var i=0;i<formonmessage.length;i++)
            {
            	formonmessage[i] = trim(formonmessage[i]);
            }
            Mongos("getweather",formonmessage[0]);
            break;
        case 'projects/kibot-tkwefa/agent/intents/cb63052a-82d8-4965-8892-cabef724d058': //天氣-某時間點+某地+狀況
            console.log("Backend Intent:天氣-某時間點+某地+狀況");
            formonmessage = trim(formonmessage);
            sendTextMessage(sender,"將會爲您查詢我的天氣資料庫,請稍等~~");
            Mongos("getweather",formonmessage);
            break;
        default:
        	handleMessages(messages, sender);
        	break;
    }
}



//MongoDB Query Function with switch case TT
var Mongos=function (cat,q,callback) {
MongoClient.connect(url,async function(err, db) {

switch (cat){

	case "getrandom":
		regex = new RegExp(q,'g')
		if (err) throw err;
		var dbo = db.db("POIDB");
		// const m=dbo.collection("POI").count({"address":/q/});
		// .skip(dbo.collection("POI").count({"address":/q/})).next()
		dbo.collection("POI").find({"address":regex}).limit(-1).toArray(function(err,result) {
		if (err) throw err;
		db.close();
		console.log(result[0]);
		console.log(result[1]);
		console.log(result[2]);
		if(result[0] != undefined)
		{
		mongoresult = "我推薦你去"+result[0].stitle+"\n"+"地址在："+result[0].address;
		sendTextMessage(sender,mongoresult);
		}
		else{
			sendTextMessage(sender,"你所詢問的地點不在我的興趣點資料庫内，再試試別的看看");
		}
		});
		break;
	case "getweather":
		regex = new RegExp(q,'g')
		if (err) throw err;
		var dbo = db.db("POIDB");
		// const m=dbo.collection("POI").count({"address":/q/});
		// .skip(dbo.collection("POI").count({"address":/q/})).next()
		dbo.collection("LocationDB").find({"similar":regex}).toArray(function(err,result) {
		if (err) throw err;
		db.close();
		console.log(result);
		if(result[0] != undefined){
		mongoresult = result[0].location;
		getWeather(mongoresult);
		}
		else
		{
			sendTextMessage(sender,"抱歉我找不到資料，"+"\n"+"可能你問的區域不是我所認識的"+"\n"+"再試著問問看別的"+"\n"+"(另外我只服務台灣地區的使用者哦，所以記得別問我國外的地點，我會沒辦法回答。。)");
		}
		});
		break;
	case "getll"://還沒準備好
		regex = new RegExp(q,'g')
		if (err) throw err;
		var dbo = db.db("POIDB");
		// const m=dbo.collection("POI").count({"address":/q/});
		// .skip(dbo.collection("POI").count({"address":/q/})).next()
		dbo.collection("POI").find({"address":regex}).limit(-1).toArray(function(err,result) {
		if (err) throw err;
		db.close();
		mongoresult = "我推薦你去"+result[0].stitle+"\n"+"地址在："+result[0].address;
		sendTextMessage(sender,mongoresult);
		});
		break;
	default:
		break;
}


})
}

function receivedMessage(event) {

    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    if (!sessionIds.has(senderID)) {
        sessionIds.set(senderID, uuid.v1());
    }
    //console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
    //console.log(JSON.stringify(message));

    var isEcho = message.is_echo;
    var messageId = message.mid;
    var appId = message.app_id;
    var metadata = message.metadata;

    // You may get a text or attachment but not both
    var messageText = message.text;
    var messageAttachments = message.attachments;
    var quickReply = message.quick_reply;

    if (isEcho) {
        handleEcho(messageId, appId, metadata);
        return;
    } else if (quickReply) {
        handleQuickReply(senderID, quickReply, messageId);
        return;
    }


    if (messageText) {
        //send message to api.ai
        sendToDialogFlow(senderID, messageText);
    } else if (messageAttachments) {
        handleMessageAttachments(messageAttachments, senderID);
    }
}


function handleMessageAttachments(messageAttachments, senderID){
    //for now just reply
    sendTextMessage(senderID, "附件已收到. 謝謝你.");
}

function handleQuickReply(senderID, quickReply, messageId) {
    var quickReplyPayload = quickReply.payload;
    console.log("Quick reply for message %s with payload %s", messageId, quickReplyPayload);
    //send payload to api.ai
    sendToDialogFlow(senderID, quickReplyPayload);
}

//https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-echo
function handleEcho(messageId, appId, metadata) {
    // Just logging message echoes to console
    console.log("Received echo for message %s and app %d with metadata %s", messageId, appId, metadata);
}

function handleDialogFlowAction(sender, action, messages, contexts, parameters) {
    switch (action) {
        default:
            //unhandled action, just send back the text
            handleMessages(messages, sender);
    }
}

function handleMessage(message, sender) {
    switch (message.message) {
        case "text": //text
            message.text.text.forEach((text) => {
                if (text !== '') {
                    sendTextMessage(sender, text);
                }
            });
            break;
        case "quickReplies": //quick replies
            let replies = [];
            message.quickReplies.quickReplies.forEach((text) => {
                let reply =
                    {
                        "content_type": "text",
                        "title": text,
                        "payload": text
                    }
                replies.push(reply);
            });
            sendQuickReply(sender, message.quickReplies.title, replies);
            break;
        case "image": //image
            sendImageMessage(sender, message.image.imageUri);
            break;
    }
}


function handleCardMessages(messages, sender) {

    let elements = [];
    for (var m = 0; m < messages.length; m++) {
        let message = messages[m];
        let buttons = [];
        for (var b = 0; b < message.card.buttons.length; b++) {
            let isLink = (message.card.buttons[b].postback.substring(0, 4) === 'http');
            let button;
            if (isLink) {
                button = {
                    "type": "web_url",
                    "title": message.card.buttons[b].text,
                    "url": message.card.buttons[b].postback
                }
            } else {
                button = {
                    "type": "postback",
                    "title": message.card.buttons[b].text,
                    "payload": message.card.buttons[b].postback
                }
            }
            buttons.push(button);
        }


        let element = {
            "title": message.card.title,
            "image_url":message.card.imageUri,
            "subtitle": message.card.subtitle,
            "buttons": buttons
        };
        elements.push(element);
    }
    sendGenericMessage(sender, elements);
}


function handleMessages(messages, sender) {
    let timeoutInterval = 1100;
    let previousType ;
    let cardTypes = [];
    let timeout = 0;
    for (var i = 0; i < messages.length; i++) {

        if ( previousType == "card" && (messages[i].message != "card" || i == messages.length - 1)) {
            timeout = (i - 1) * timeoutInterval;
            setTimeout(handleCardMessages.bind(null, cardTypes, sender), timeout);
            cardTypes = [];
            timeout = i * timeoutInterval;
            setTimeout(handleMessage.bind(null, messages[i], sender), timeout);
        } else if ( messages[i].message == "card" && i == messages.length - 1) {
            cardTypes.push(messages[i]);
            timeout = (i - 1) * timeoutInterval;
            setTimeout(handleCardMessages.bind(null, cardTypes, sender), timeout);
            cardTypes = [];
        } else if ( messages[i].message == "card") {
            cardTypes.push(messages[i]);
        } else  {

            timeout = i * timeoutInterval;
            setTimeout(handleMessage.bind(null, messages[i], sender), timeout);
        }

        previousType = messages[i].message;

    }
}

function handleDialogFlowResponse(sender, response) {
    let responseText = response.fulfillmentMessages.fulfillmentText;

    let messages = response.fulfillmentMessages;
    let action = response.action;
    let contexts = response.outputContexts;
    let parameters = response.parameters;

    sendTypingOff(sender);

    //要看意圖資訊用這個
    // console.log(response);

    if (isDefined(action)) {
    	console.log("DFRaction");
    	if(response.action == 'input.unknown')
    	{
    		// handleDialogFlowAction(sender, action, messages, contexts, parameters);
    		getGoogleSearch(response.queryText);
    	}
    	else
    	{
   		    handleDialogFlowAction(sender, action, messages, contexts, parameters);
    	}
    } else if (isDefined(messages)) {
    	console.log("DFRmessage");
    	if(response.allRequiredParamsPresent==true)
    	{
    		formonmessage = response.fulfillmentText;
    		getintent(response.intent.name,messages);
    	}
    	else
    	{
    		handleMessages(messages, sender);
    	}
    } else if (responseText == '' && !isDefined(action)) {
        //dialogflow could not evaluate input.
        console.log("undefined");
        sendTextMessage(sender, "不好意思我不太確定你的意思。是否能夠再説的明白一點?");
    } else if (isDefined(responseText)) {
    	console.log("DFRresponseText");
        sendTextMessage(sender, responseText);
    }
    // console.log("endif");
    console.log(response);
}

async function sendToDialogFlow(sender, textString, params) {

    sendTypingOn(sender);

    try {
        const sessionPath = sessionClient.sessionPath(
            config.GOOGLE_PROJECT_ID,
            sessionIds.get(sender)
        );

        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: textString,
                    languageCode: config.DF_LANGUAGE_CODE,
                },
            },
            queryParams: {
                payload: {
                    data: params
                }
            }
        };
        const responses = await sessionClient.detectIntent(request);

        const result = responses[0].queryResult;
        handleDialogFlowResponse(sender, result);
    } catch (e) {
        console.log('error');
        console.log(e);
    }

}




function sendTextMessage(recipientId, text) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: text
        }
    }
    console.log(searchtype);
    callSendAPI(messageData);
}

/*
 * Send an image using the Send API.
 *
 */
function sendImageMessage(recipientId, imageUrl) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "image",
                payload: {
                    url: imageUrl
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a Gif using the Send API.
 *
 */
function sendGifMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "image",
                payload: {
                    url: config.SERVER_URL + "/assets/instagram_logo.gif"
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send audio using the Send API.
 *
 */
function sendAudioMessage(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "audio",
                payload: {
                    url: config.SERVER_URL + "/assets/sample.mp3"
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a video using the Send API.
 * example videoName: "/assets/allofus480.mov"
 */
function sendVideoMessage(recipientId, videoName) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "video",
                payload: {
                    url: config.SERVER_URL + videoName
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a video using the Send API.
 * example fileName: fileName"/assets/test.txt"
 */
function sendFileMessage(recipientId, fileName) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "file",
                payload: {
                    url: config.SERVER_URL + fileName
                }
            }
        }
    };

    callSendAPI(messageData);
}



/*
 * Send a button message using the Send API.
 *
 */
function sendButtonMessage(recipientId, text, buttons) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: text,
                    buttons: buttons
                }
            }
        }
    };

    callSendAPI(messageData);
}


function sendGenericMessage(recipientId, elements) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "generic",
                    elements: elements
                }
            }
        }
    };

    callSendAPI(messageData);
}


function sendReceiptMessage(recipientId, recipient_name, currency, payment_method,
                            timestamp, elements, address, summary, adjustments) {
    // Generate a random receipt ID as the API requires a unique ID
    var receiptId = "order" + Math.floor(Math.random() * 1000);

    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "receipt",
                    recipient_name: recipient_name,
                    order_number: receiptId,
                    currency: currency,
                    payment_method: payment_method,
                    timestamp: timestamp,
                    elements: elements,
                    address: address,
                    summary: summary,
                    adjustments: adjustments
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a message with Quick Reply buttons.
 *
 */
function sendQuickReply(recipientId, text, replies, metadata) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: text,
            metadata: isDefined(metadata)?metadata:'',
            quick_replies: replies
        }
    };

    callSendAPI(messageData);
}

/*
 * Send a read receipt to indicate the message has been read
 *
 */
function sendReadReceipt(recipientId) {

    var messageData = {
        recipient: {
            id: recipientId
        },
        sender_action: "mark_seen"
    };

    callSendAPI(messageData);
}

/*
 * Turn typing indicator on
 *
 */
function sendTypingOn(recipientId) {


    var messageData = {
        recipient: {
            id: recipientId
        },
        sender_action: "typing_on"
    };

    callSendAPI(messageData);
}

/*
 * Turn typing indicator off
 *
 */
function sendTypingOff(recipientId) {


    var messageData = {
        recipient: {
            id: recipientId
        },
        sender_action: "typing_off"
    };

    callSendAPI(messageData);
}

/*
 * Send a message with the account linking call-to-action
 *
 */
function sendAccountLinking(recipientId) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: "Welcome. Link your account.",
                    buttons: [{
                        type: "account_link",
                        url: config.SERVER_URL + "/authorize"
                    }]
                }
            }
        }
    };

    callSendAPI(messageData);
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll
 * get the message id in a response
 *
 */
function callSendAPI(messageData) {
    request({
        uri: 'https://graph.facebook.com/v3.2/me/messages',
        qs: {
            access_token: config.FB_PAGE_TOKEN
        },
        method: 'POST',
        json: messageData

    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;

            if (messageId) {
                console.log("Successfully sent message with id %s to recipient %s",
                    messageId, recipientId);
            } else {
                console.log("Successfully called Send API for recipient %s",
                    recipientId);
            }
        } else {
            console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
        }
    });
}



/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message. 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 * 
 */
function receivedPostback(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfPostback = event.timestamp;

    // The 'payload' param is a developer-defined field which is set in a postback
    // button for Structured Messages.
    var payload = event.postback.payload;

    switch (payload) {
        default:
            //unindentified payload
            sendTextMessage(senderID, "I'm not sure what you want. Can you be more specific?");
            break;

    }

    console.log("Received postback for user %d and page %d with payload '%s' " +
        "at %d", senderID, recipientID, payload, timeOfPostback);

}


/*
 * Message Read Event
 *
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 * 
 */
function receivedMessageRead(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;

    // All messages before watermark (a timestamp) or sequence have been seen.
    var watermark = event.read.watermark;
    var sequenceNumber = event.read.seq;

    console.log("Received message read event for watermark %d and sequence " +
        "number %d", watermark, sequenceNumber);
}

/*
 * Account Link Event
 *
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 * 
 */
function receivedAccountLink(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;

    var status = event.account_linking.status;
    var authCode = event.account_linking.authorization_code;

    console.log("Received account link event with for user %d with status %s " +
        "and auth code %s ", senderID, status, authCode);
}

/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about 
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
 *
 */
function receivedDeliveryConfirmation(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var delivery = event.delivery;
    var messageIDs = delivery.mids;
    var watermark = delivery.watermark;
    var sequenceNumber = delivery.seq;

    if (messageIDs) {
        messageIDs.forEach(function (messageID) {
            console.log("Received delivery confirmation for message ID: %s",
                messageID);
        });
    }

    console.log("All message before %d were delivered.", watermark);
}

/*
 * Authorization Event
 *
 * The value for 'optin.ref' is defined in the entry point. For the "Send to 
 * Messenger" plugin, it is the 'data-ref' field. Read more at 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
 *
 */
function receivedAuthentication(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfAuth = event.timestamp;

    // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
    // The developer can set this to an arbitrary value to associate the
    // authentication callback with the 'Send to Messenger' click event. This is
    // a way to do account linking when the user clicks the 'Send to Messenger'
    // plugin.
    var passThroughParam = event.optin.ref;

    console.log("Received authentication for user %d and page %d with pass " +
        "through param '%s' at %d", senderID, recipientID, passThroughParam,
        timeOfAuth);

    // When an authentication is received, we'll send a message back to the sender
    // to let them know it was successful.
    sendTextMessage(senderID, "Authentication successful");
}

/*
 * Verify that the callback came from Facebook. Using the App Secret from 
 * the App Dashboard, we can verify the signature that is sent with each 
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
    var signature = req.headers["x-hub-signature"];

    if (!signature) {
        throw new Error('Couldn\'t validate the signature.');
    } else {
        var elements = signature.split('=');
        var method = elements[0];
        var signatureHash = elements[1];

        var expectedHash = crypto.createHmac('sha1', config.FB_APP_SECRET)
            .update(buf)
            .digest('hex');

        if (signatureHash != expectedHash) {
            throw new Error("Couldn't validate the request signature.");
        }
    }
}

function isDefined(obj) {
    if (typeof obj == 'undefined') {
        return false;
    }

    if (!obj) {
        return false;
    }

    return obj != null;
}

// Spin up the server
app.listen(app.get('port'), function () {
    console.log('running on port', app.get('port'))
});


// request(`${wurl}?Authorization=CWB-9CF20E34-2234-49C1-8561-1E70869054E4&locationName=%E5%AE%9C%E8%98%AD%E7%B8%A3`, function (error, response, body) {
//   console.log(JSON.parse(body).records.location[0].weatherElement[0]);
// });


// let apiResponse;

// axios.get(`${wurl}?Authorization=CWB-9CF20E34-2234-49C1-8561-1E70869054E4&locationName=%E5%AE%9C%E8%98%AD%E7%B8%A3`)
// 				 .then(function(response) {
//     apiResponse = response;
//     console.log('Does this work?')
//     console.log('apiResponse: ', apiResponse);
//   })
//   .catch(function (error) {
//     console.log(error, 'Error');
//   });
// const getWeather = location => {
// 	return new Promise(async (resolve, reject) => {
// 		try {
// 			const weatherConditions = await axios.get(
// 				"https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?",
// 				{
// 					params: {
// 						Authorization: wapikey,
// 						locationName: location
// 					}
// 				});

// 			resolve(formatData(weatherConditions.data));
// 		} catch (error) {
// 			reject(error);
// 		}
// 	}); 
// }

// const formatData = data => {
// 	return {
// 		location: `${data.location.name}, ${data.location.country}` ,
// 		temperature: data.current.temperature
// 		/*code: data.forecast.forecastday.map(day => {
// 			return {
// 				data: day.date,
// 				code: dat.day.condition.code,
// 				condition: day.day.condition.text
// 			}
// 		}
// 		)*/
// 	}
// }
