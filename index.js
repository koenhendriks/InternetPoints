const TelegramBot = require('node-telegram-bot-api');
const Secrets = require('./secrets');
var admin = require("firebase-admin");
const serviceAccount = require("./firebase-key.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: Secrets.firebase.databaseURL
});

// replace the value below with the Telegram token you receive from @BotFather
const token = Secrets.telegram_token;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();
var ref = db.ref();

function addPoint(username,from,callback){
	let time = Math.floor(new Date() / 1000);	
	let userRef = ref.child(username+"/points");

	userRef.push({
		"time" : time,
		"amount" : 1,
		"from" : from
	});

	userRef.once("value", function(snapshot) {
		callback(snapshot.val());
	});
}


// Matches "/echo [whatever]"
bot.onText(/\/internetpoint (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const username = match[1]; // the captured "whatever"

  if(username === msg.from.username){
  	bot.sendMessage(chatId,"You can only give internetpoints to others!");
  } else{
	  // send back the matched "whatever" to the chat
	  addPoint(username,msg.from.username, function(data){
	  	bot.sendMessage(chatId, "Interpoints given to "+username+"("+Object.keys(data).length+"), thanks "+msg.from.username);  	
	  });	
  }  
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  // bot.sendMessage(chatId, 'Creating internet points....');
});