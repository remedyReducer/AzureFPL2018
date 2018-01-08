var restify = require('restify');
var builder = require('botbuilder');
var emoji = require('node-emoji')
var fs = require('fs');
var util = require('util');
var request = require('request');
var cheerio = require('cheerio');
var nodemailer = require('nodemailer');
var MongoClient = require('mongodb').MongoClient;
//mongo for ITSupport and WMS
//var url ="mongodb://fpldata:6yQvbsvfndvXOGzadBHdAzysmxMxebNj6vxIEykdJBKAZvHR0ObYrKEoWlWYaSvZ5va2gOHVf3bLo2pEVsNhWg==@fpldata.documents.azure.com:10255/DB?ssl=true&sslverifycertificate=false";
var url ="mongodb://fpldata:GDlCyxjYiLoyhFfo43VJ2wyn6588INqPpJWFIGL2FHm1SZ6vA3XBNTIfzeiW4RIQTZTMNBfjYqiao1BmP0ahCw==@fpldata.documents.azure.com:10255/DB?ssl=true&sslverifycertificate=false"

//"mongodb://fpldata:GDlCyxjYiLoyhFfo43VJ2wyn6588INqPpJWFIGL2FHm1SZ6vA3XBNTIfzeiW4RIQTZTMNBfjYqiao1BmP0ahCw==@fpldata.documents.azure.com:10255/DB?ssl=true&sslverifycertificate=false"
//CUSTOMCONNSTR_url
//var url = 'mongodb://user1:password-user1@ec2-35-154-154-185.ap-south-1.compute.amazonaws.com:27100/db1';
//var url1 = 'mongodb://user1:password-user1@ec2-35-154-154-185.ap-south-1.compute.amazonaws.com:27100/db1';
//var url ='mongodb://MagogUser:fr33B!rd@nxtg01:10040/Magog?ssl=true';
//mongodb://fplmongodata:nsUh7jj0ikU45HmJQWpt9yd41eU4LkyhAlw2Vy350PDknr1XNb11Tdg1X1Q2wAMwDJTwbNSB1TdXOFPT641dMQ==@fplmongodata.documents.azure.com:10255/?ssl=true&replicaSet=globaldb
//mongodb://fplmongodata:PmRkuDEX87SavngrwLljYPSseaymtfYoCK9yLJ3ikf3Mad1BzAWd0lsicSkXOVD0o597ayPISQPIaNuD0LkWvw==@fplmongodata.documents.azure.com:10255/?ssl=true&replicaSet=globaldb
// mongo for Firewall
//var url1 = 'mongodb://fpldata:eQZRA0xo2UUBfLOgMmIVAbeiBBSI23ffmnUGlcNIeEf0uKOz26k5bJbkbpUTDwIYUyFZDFcnyYItSE0Nf8ElHg==@fpldata.documents.azure.com:10255/?ssl=true';
// Setup Restify Server
var server = restify.createServer();
//server.listen(process.env.port || process.env.PORT || 5604, function() {
//	console.log('%s listening to %s', server.name, server.url);
//});
server.listen(process.env.port || process.env.PORT || 1337, function() {
    try {
        console.log('%s listening to %s', server.name, server.url);
    } catch (err) {
        console.log("Server already in Use" + err);
    }

});
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
	appId: "f79112cd-78f9-4e73-82fd-a67d021b8e3e",
	appPassword: "llhLBYJS603$)[darpNJ93-"
	//serviceUrl: 'https://smba.trafficmanager.net'
});
//Bot Endpoint
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());
//LUIS Details
var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/8af1deff-7a99-472c-b241-da50cc348bbe?subscription-key=e7cb2d6442024b2c834294cabd2c7d1a&verbose=true&timezoneOffset=0&q=';
// This Url can be obtained by uploading or creating your model from the LUIS portal: https://www.luis.ai/
// for fixing default message issue
var recognizer = new builder.LuisRecognizer(model).onEnabled((context, callback) => {
	var enabled = context.dialogStack().length === 0;
	callback(null, enabled);
});
bot.recognizer(recognizer);
// for sending mail
 var  transporter = nodemailer.createTransport({
        service:'gmail',
        auth: {
            user: 'aimcognitivegurgaon@gmail.com', // generated ethereal user
            pass: 'Gurgaon@2016'  // generated ethereal password
        }
    });
// LUIS: Greeting intent
bot.dialog('/Greeting', [
	function(session, args, next) {
		//session.send("Let me look it up for you");
		console.log("#Inside Greeting Intent Dialog");
		builder.Prompts.choice(session, "Hi,Please select below options which assist you better", ['WMS', 'Firewall', 'ITSupport'], {
			listStyle: builder.ListStyle.button
		});
	},
	function(session, results) {
		if (results.response) {
			var selection = results.response.entity;
			// route to corresponding dialogs
			switch (selection) {
				case "WMS":
					//session.send(msg);
					session.endDialog();
					session.replaceDialog('/wmsinitiate');
					break;
				case "Firewall":
					//session.send(msg);
					session.endDialog();
					session.replaceDialog('/Firewall');
					break;
				case "ITSupport":
					//session.send(msg);
					session.endDialog();
					session.replaceDialog('/ITSupport');
					break;
			}
		}
	}
]).triggerAction({
	matches: 'Greeting'
});
// ITSupport BOT
bot.dialog('/ITSupport', [
	function(session) {
		session.send("Welcome to IT support helpdesk. How may I help you today?");
		session.endDialog();
	}
]);
// Firewall

bot.dialog('/Firewall', [
	function(session) {
		session.send("Welcome to Firewall BOT, How can I help you?");
		session.endDialog();
	}
]);

bot.dialog('/Re-EnterITSupport', [
	function(session) {
		session.send("Please type your Query here ");
		session.endDialog();
	}
]);

//wms loop
bot.dialog('wmsloop',[function(session){
session.beginDialog('/wmsinitiate');
}]);

// wms flow

bot.dialog('/wmsinitiate',[
    function (session,args,next) {
    //console.log("on wmsinitiate",session)
    builder.Prompts.text(session,"Please enter your question");
    },function(session,result){
    console.log(session.message.text)
     var question = session.message.text;
      jsonObject = JSON.stringify({"question": question, "top": 1});
     // console.log(jsonObject)
     request.post({
  headers: {'Content-type' : 'application/json','Ocp-Apim-Subscription-Key':'45bf530d13f14afab04d29b4dbc54f18','Content-Length' :Buffer.byteLength(jsonObject, 'utf8')},
  url:     'https://westus.api.cognitive.microsoft.com/qnamaker/v2.0/knowledgebases/' + 'c0ba1edb-2d86-4091-ae34-04bf69a44c6a' + '/generateAnswer',
  // method: 'POST',
  body:    jsonObject
}, function(error, response, body){
  var data = JSON.parse(body);
  if((data.answers[0].answer) === "No good match found in the KB"){
  
                     session.send("Sorry answer is not available yet.  SME person will contact you soon");
                     
                     var mailOptions = {
                                  from: 'aimcognitivegurgaon@gmail.com',
                                    to: 'paulabhinish@gmail.com', 
                                    subject: 'New question to WMS ', 
                                    text: 'Enter the question "'+ session.message.text+'" to Confluence WMS Portal and reply back to user',
                                         };
                      transporter.sendMail(mailOptions);
                      console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',mailOptions)
                      session.beginDialog('/AnythingElse1');
   
  }
  else{
  session.send(data.answers[0].answer);
  session.beginDialog('/AnythingElse1');}
  
});

  }]);
  
  
//Anything else for wms

bot.dialog('/AnythingElse1', [

function(session, args, next) {
        builder.Prompts.choice(session, "Can I help you in any other way?", ['Yes', 'No'], {retryPrompt: "Invalid choice, Please pick below listed choices",
            listStyle: builder.ListStyle.button,
            maxRetries: 1
            });
    },
    function(session, results) {
        if (results.response) {
            var selection = results.response.entity;
            // route to corresponding dialogs
            switch (selection) {
                case "Yes":
                     
                     session.replaceDialog('/AnythingElse11');
                     break;
                case "No":
                     session.replaceDialog('/Gettingfeedback');
                     break;
            }
            }
            }
]);
//back to home
bot.dialog('/AnythingElse11', [

function(session, args, next) {
        builder.Prompts.choice(session, "Would you like to continue with:", ['WMS service', 'Back to home'], {retryPrompt: "Invalid choice, Please pick below listed choices",
            listStyle: builder.ListStyle.button,
            maxRetries: 1
            });
    },
    function(session, results) {
        if (results.response) {
            var selection = results.response.entity;
            // route to corresponding dialogs
            switch (selection) {
                case "WMS service":
                     
                     session.replaceDialog('wmsloop');
                     break;
                case "Back to home":
                     session.replaceDialog('/Greeting');
                     break;
            }
            }
            }
]);

// ShareCalendar Dialog 

bot.dialog('/ShareCalendar', [
	function(session, args, next) {
		console.log(session.message.text)
		session.userData.userQuery = session.message.text
		session.send("Let me look it up for you");
    webscrap(function(res) {
    if(res.length>=0){
    	builder.Prompts.choice(session, "Please select the mode you want to view your answer:", ['Video', 'Document'], {
			listStyle: builder.ListStyle.button
		});
    }
    else{
    session.send("We currently have no video available.Please follow the below content");
							console.log(session.userData.userQuery)
							qnamaker(session, session.userData.userQuery, function(res) {
								if (res != "No good match found in the KB") {
									session.send(res);
									session.endDialog();
									session.replaceDialog('/AnythingElse');
								} else {
									var arr = session.userData.userQuery.split(" ");
									var url_ques = "";
									for (var i = 0; i < arr.length; i++) {
										if (i == (arr.length - 1)) {
											url_ques = url_ques + arr[i]
											url_final = "https://support.office.com/search/results?query=" + url_ques
											console.log(url_ques)
											console.log(url_final)
											request(url_final, function(error, response, html) {
												if (!error && response.statusCode == 200) {
													abc(html, function(res) {
														//console.log(res)
														var urlbutton = [];
														urlbutton.push(builder.CardAction.openUrl(session, res[2][0], "Click here to know more"));
														var attachments1 = [];
														var card1 = CreateHeroCard(session, builder, res[0][0], res[1][0], " ", " ", urlbutton);
														attachments1.push(card1);
														var msg1 = new builder.Message(session).attachments(attachments1);
														session.send(msg1);
														var urlbutton1 = [];
														urlbutton1.push(builder.CardAction.openUrl(session, res[2][1], "Click here to know more"));
														var attachments2 = [];
														var card2 = CreateHeroCard(session, builder, res[0][1], res[1][1], " ", " ", urlbutton1);
														attachments2.push(card2);
														var msg2 = new builder.Message(session).attachments(attachments2);
														session.send(msg2);
														var urlbutton2 = [];
														urlbutton2.push(builder.CardAction.openUrl(session, res[2][2], "Click here to know more"));
														var attachments3 = [];
														var card3 = CreateHeroCard(session, builder, res[0][2], res[1][2], " ", " ", urlbutton2);
														attachments3.push(card3);
														var msg3 = new builder.Message(session).attachments(attachments3);
														session.send(msg3);
														session.endDialog();
														session.replaceDialog('/AnythingElse');
													});
												}
											});
										} else {
											url_ques = url_ques + arr[i] + '+'
										}
									}
								}
							});
    }
    });
	},
	function(session, results) {
		if (results.response) {
			var selection = results.response.entity;
			// route to corresponding dialogs
			switch (selection) {
				case "Video":
					var msg = new builder.Message(session).attachments([{
							contentType: "video/mp4",
							name: "How to Share calendar to outlook",
              //https://www.youtube.com/embed/aDa2xBAfSFw
              //"http://elearning/bunit/it/it-help-center/share-calendar.mp4"
							contentUrl: "http://elearning/bunit/it/it-help-center/share-calendar.mp4"
						}]);
					session.send(msg);
					session.endDialog();
					session.replaceDialog('/AnythingElse');
					break;
				case "Document":
					console.log(session.userData.userQuery)
					qnamaker(session, session.userData.userQuery, function(res) {
						if (res != "No good match found in the KB") {
							session.send(res);
							session.endDialog();
							session.replaceDialog('/AnythingElse');
						} else {
							var arr = session.userData.userQuery.split(" ");
							var url_ques = "";
							for (var i = 0; i < arr.length; i++) {
								if (i == (arr.length - 1)) {
									url_ques = url_ques + arr[i]
									url_final = "https://support.office.com/search/results?query=" + url_ques
									console.log(url_ques)
									console.log(url_final)
									request(url_final, function(error, response, html) {
										if (!error && response.statusCode == 200) {
											abc(html, function(res) {
												//console.log(res)
												var urlbutton = [];
												urlbutton.push(builder.CardAction.openUrl(session, res[2][0], "Click here to know more"));
												var attachments1 = [];
												var card1 = CreateHeroCard(session, builder, res[0][0], res[1][0], " ", " ", urlbutton);
												attachments1.push(card1);
												var msg1 = new builder.Message(session).attachments(attachments1);
												session.send(msg1);
												var urlbutton1 = [];
												urlbutton1.push(builder.CardAction.openUrl(session, res[2][1], "Click here to know more"));
												var attachments2 = [];
												var card2 = CreateHeroCard(session, builder, res[0][1], res[1][1], " ", " ", urlbutton1);
												attachments2.push(card2);
												var msg2 = new builder.Message(session).attachments(attachments2);
												session.send(msg2);
												var urlbutton2 = [];
												urlbutton2.push(builder.CardAction.openUrl(session, res[2][2], "Click here to know more"));
												var attachments3 = [];
												var card3 = CreateHeroCard(session, builder, res[0][2], res[1][2], " ", " ", urlbutton2);
												attachments3.push(card3);
												var msg3 = new builder.Message(session).attachments(attachments3);
												session.send(msg3);
												session.endDialog();
												session.replaceDialog('/AnythingElse');
											});
										}
									});
								} else {
									url_ques = url_ques + arr[i] + '+'
								}
							}
						}
					});
					break;
			}
		}
	}
]).triggerAction({
	matches: 'ShareCalendar'
});
// AddCalendar Dialog
bot.dialog('/AddCalendar', [
	function(session, args, next) {
		console.log(session.message.text)
		session.userData.userQuery = session.message.text
    //session.userData.userQuery= session.message.text
    //console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqq',session.userData.userQuery)
		session.send("Let me look it up for you");
    webscrap(function(res) {
    if(res.length>0){
    	builder.Prompts.choice(session, "Please select the mode you want to view your answer:", ['Video', 'Document'], {
			listStyle: builder.ListStyle.button
		});
    }
    else{
    session.send("We currently have no video available.Please follow the below content");
							console.log(session.userData.userQuery)
							qnamaker(session, session.userData.userQuery, function(res) {
								if (res != "No good match found in the KB") {
									session.send(res);
									session.endDialog();
									session.replaceDialog('/AnythingElse');
								} else {
									var arr = session.userData.userQuery.split(" ");
									var url_ques = "";
									for (var i = 0; i < arr.length; i++) {
										if (i == (arr.length - 1)) {
											url_ques = url_ques + arr[i]
											url_final = "https://support.office.com/search/results?query=" + url_ques
											console.log(url_ques)
											console.log(url_final)
											request(url_final, function(error, response, html) {
												if (!error && response.statusCode == 200) {
													abc(html, function(res) {
														//console.log(res)
														var urlbutton = [];
														urlbutton.push(builder.CardAction.openUrl(session, res[2][0], "Click here to know more"));
														var attachments1 = [];
														var card1 = CreateHeroCard(session, builder, res[0][0], res[1][0], " ", " ", urlbutton);
														attachments1.push(card1);
														var msg1 = new builder.Message(session).attachments(attachments1);
														session.send(msg1);
														var urlbutton1 = [];
														urlbutton1.push(builder.CardAction.openUrl(session, res[2][1], "Click here to know more"));
														var attachments2 = [];
														var card2 = CreateHeroCard(session, builder, res[0][1], res[1][1], " ", " ", urlbutton1);
														attachments2.push(card2);
														var msg2 = new builder.Message(session).attachments(attachments2);
														session.send(msg2);
														var urlbutton2 = [];
														urlbutton2.push(builder.CardAction.openUrl(session, res[2][2], "Click here to know more"));
														var attachments3 = [];
														var card3 = CreateHeroCard(session, builder, res[0][2], res[1][2], " ", " ", urlbutton2);
														attachments3.push(card3);
														var msg3 = new builder.Message(session).attachments(attachments3);
														session.send(msg3);
														session.endDialog();
														session.replaceDialog('/AnythingElse');
													});
												}
											});
										} else {
											url_ques = url_ques + arr[i] + '+'
										}
									}
								}
							});
    }
    });
	},
	function(session, results) {
		if (results.response) {
			var selection = results.response.entity;
			// route to corresponding dialogs
			switch (selection) {
				case "Video":
				    var msg = new builder.Message(session).attachments([{
							contentType: "video/mp4",
							name: "How to Share calendar to outlook",
							contentUrl: "http://elearning/bunit/it/it-help-center/share-calendar.mp4"
						}]);
					session.send(msg);
					session.endDialog();
					session.replaceDialog('/AnythingElse');
					
					break;
				case "Document":
					console.log(session.userData.userQuery)
          //console.log('443443444444444444444444444444444444',session.userData.userQuery)
					qnamaker(session, session.userData.userQuery, function(res) {
						if (res != "No good match found in the KB") {
							session.send(res);
							session.endDialog();
							session.replaceDialog('/AnythingElse');
						} else {
							var arr = session.userData.userQuery.split(" ");
							var url_ques = "";
							for (var i = 0; i < arr.length; i++) {
								if (i == (arr.length - 1)) {
									url_ques = url_ques + arr[i]
									url_final = "https://support.office.com/search/results?query=" + url_ques
									console.log(url_ques)
									console.log(url_final)
									request(url_final, function(error, response, html) {
										if (!error && response.statusCode == 200) {
											abc(html, function(res) {
												//console.log(res)
												var urlbutton = [];
												urlbutton.push(builder.CardAction.openUrl(session, res[2][0], "Click here to know more"));
												var attachments1 = [];
												var card1 = CreateHeroCard(session, builder, res[0][0], res[1][0], " ", " ", urlbutton);
												attachments1.push(card1);
												var msg1 = new builder.Message(session).attachments(attachments1);
												session.send(msg1);
												var urlbutton1 = [];
												urlbutton1.push(builder.CardAction.openUrl(session, res[2][1], "Click here to know more"));
												var attachments2 = [];
												var card2 = CreateHeroCard(session, builder, res[0][1], res[1][1], " ", " ", urlbutton1);
												attachments2.push(card2);
												var msg2 = new builder.Message(session).attachments(attachments2);
												session.send(msg2);
												var urlbutton2 = [];
												urlbutton2.push(builder.CardAction.openUrl(session, res[2][2], "Click here to know more"));
												var attachments3 = [];
												var card3 = CreateHeroCard(session, builder, res[0][2], res[1][2], " ", " ", urlbutton2);
												attachments3.push(card3);
												var msg3 = new builder.Message(session).attachments(attachments3);
												session.send(msg3);
												session.endDialog();
												session.replaceDialog('/AnythingElse');
											});
										}
									});
								} else {
									url_ques = url_ques + arr[i] + '+'
								}
							}
						}
					});
					break;
			}
		}
	}
]).triggerAction({
	matches: 'AddCalendar'
});
// Email_iPhone/iPad Dialog
bot.dialog('/Email_iPhone/iPad', [
function(session, args, next) {
		console.log(session.message.text)
		session.userData.userQuery = session.message.text
		session.send("Let me look it up for you");
    webscrap(function(res) {
    if(res.length>0){
    	builder.Prompts.choice(session, "Please select the mode you want to view your answer:", ['Video', 'Document'], {
			listStyle: builder.ListStyle.button
		});
    }
    else{
    session.send("We currently have no video available.Please follow the below content");
							console.log(session.userData.userQuery)
							qnamaker(session, session.userData.userQuery, function(res) {
								if (res != "No good match found in the KB") {
									session.send(res);
									session.endDialog();
									session.replaceDialog('/AnythingElse');
								} else {
									session.send('Sorry, we do not have any document for you question');
									session.endDialog();
									session.replaceDialog('/AnythingElse');
								}
							});
    }
    });
},
	function(session, results) {
		if (results.response) {
			var selection = results.response.entity;
			// route to corresponding dialogs
			switch (selection) {
				case "Video":
					
					var msg = new builder.Message(session).attachments([{
						contentType: "video/mp4",
						name: "How to Set Up NextEra Email on Your iPhone/iPad",
						contentUrl: "http://elearning/bunit/it/it-help-center/email-on-mobile.mp4"
						}]);
					session.send(msg);
					session.endDialog();
					session.replaceDialog('/AnythingElse');
					break;
					
				case "Document":
					console.log(session.userData.userQuery)
					qnamaker(session, session.userData.userQuery, function(res) {
						if (res != "No good match found in the KB") {
							session.send(res);
							session.endDialog();
							session.replaceDialog('/AnythingElse');
						} else {
							session.send("Sorry, we do not have answer to your question");
							session.endDialog();
							session.replaceDialog('/AnythingElse');
						}
					});
					break;
			}
		}
	}
]).triggerAction({
	matches: 'Email_iPhone/iPad'
});
bot.dialog('/Email_ iOS11', [
function(session, args, next) {
		console.log(session.message.text)
		session.userData.userQuery = session.message.text
		session.send("Let me look it up for you");
    webscrap(function(res) {
    if(res.length>0){
    	builder.Prompts.choice(session, "Please select the mode you want to view your answer:", ['Video', 'Document'], {
			listStyle: builder.ListStyle.button
		});
    }
    else{
    session.send("We currently have no video available.Please follow the below content");
							console.log(session.userData.userQuery)
							qnamaker(session, session.userData.userQuery, function(res) {
								if (res != "No good match found in the KB") {
									session.send(res);
									session.endDialog();
									session.replaceDialog('/AnythingElse');
								} else {
									session.send('Sorry, we do not have any document for you question');
									session.endDialog();
									session.replaceDialog('/AnythingElse');
								}
							});
    }
    });
},
	function(session, results) {
		if (results.response) {
			var selection = results.response.entity;
			// route to corresponding dialogs
			switch (selection) {
				case "Video":
					
						var msg = new builder.Message(session).attachments([{
							contentType: "video/mp4",
							name: "How to Add Email on iOS 11 Devices",
							contentUrl: "http://elearning/bunit/it/it-help-center/ios-11-email.mp4"
						}]);
						
							session.send(msg);
							session.endDialog();
							session.replaceDialog('/AnythingElse');
					break;
				case "Document":
					console.log(session.userData.userQuery)
					qnamaker(session, session.userData.userQuery, function(res) {
						if (res != "No good match found in the KB") {
							session.send(res);
							session.endDialog();
							session.replaceDialog('/AnythingElse');
						} else {
							session.send("Sorry we donot have answer to your question");
							session.endDialog();
							session.replaceDialog('/AnythingElse');
						}
					});
					break;
			}
		}
	}
]).triggerAction({
	matches: 'Email_ iOS11'
});

bot.dialog('/LostRemoteAccessToken', [
function(session, args, next) {
		console.log(session.message.text)
		session.userData.userQuery = session.message.text
		session.send("Let me look it up for you");
    webscrap(function(res) {
    if(res.length>0){
    	builder.Prompts.choice(session, "Please select the mode you want to view your answer:", ['Video', 'Document'], {
			listStyle: builder.ListStyle.button
		});
    }
    else{
    session.send("We currently have no video available.Please follow the below content");
							console.log(session.userData.userQuery)
							qnamaker(session, session.userData.userQuery, function(res) {
								if (res != "No good match found in the KB") {
									session.send(res);
									session.endDialog();
									session.replaceDialog('/AnythingElse');
								} else {
									session.send('Sorry, we do not have any document for you question');
									session.endDialog();
									session.replaceDialog('/AnythingElse');
								}
							});
    }
    });
},
	function(session, results) {
		if (results.response) {
			var selection = results.response.entity;
			// route to corresponding dialogs
			switch (selection) {
				case "Video":
					
						var msg = new builder.Message(session).attachments([{
							contentType: "video/mp4",
							name: "How to Report a Lost Remote Access Token",
							contentUrl: "http://elearning/bunit/it/it-help-center/report-lost-token.mp4"
						}]);
						
							session.send(msg);
							session.endDialog();
							session.replaceDialog('/AnythingElse');

					break;
				case "Document":
					console.log(session.userData.userQuery)
					qnamaker(session, session.userData.userQuery, function(res) {
						if (res != "No good match found in the KB") {
							session.send(res);
							session.endDialog();
							session.replaceDialog('/AnythingElse');
						} else {
							session.send("Sorry we donot have answer to your question");
							session.endDialog();
							session.replaceDialog('/AnythingElse');
						}
					});
					break;
			}
		}
	}
]).triggerAction({
	matches: 'LostRemoteAccessToken'
});
//****
bot.dialog('/TroubleshootRemoteAccessToken', [
function(session, args, next) {
		console.log(session.message.text)
		session.userData.userQuery = session.message.text
		session.send("Let me look it up for you");
    webscrap(function(res) {
    if(res.length>0){
    	builder.Prompts.choice(session, "Please select the mode you want to view your answer:", ['Video', 'Document'], {
			listStyle: builder.ListStyle.button
		});
    }
    else{
    session.send("We currently have no video available.Please follow the below content");
							console.log(session.userData.userQuery)
							qnamaker(session, session.userData.userQuery, function(res) {
								if (res != "No good match found in the KB") {
									session.send(res);
									session.endDialog();
									session.replaceDialog('/AnythingElse');
								} else {
									session.send('Sorry, we do not have any document for you question');
									session.endDialog();
									session.replaceDialog('/AnythingElse');
								}
							});
    }
    });
},
	function(session, results) {
		if (results.response) {
			var selection = results.response.entity;
			// route to corresponding dialogs
			switch (selection) {
				case "Video":
					
						var msg = new builder.Message(session).attachments([{
							contentType: "video/mp4",
							name: "How to Troubleshoot Remote Access Token",
							contentUrl: "http://elearning/bunit/it/it-help-center/troubleshoot-token.mp4"
						}]);
						
							session.send(msg);
							session.endDialog();
							session.replaceDialog('/AnythingElse');
						
					break;
				case "Document":
					console.log(session.userData.userQuery)
					qnamaker(session, session.userData.userQuery, function(res) {
						if (res != "No good match found in the KB") {
							session.send(res);
							session.endDialog();
							session.replaceDialog('/AnythingElse');
						} else {
							session.send("Sorry we donot have answer to your question");
							session.endDialog();
							session.replaceDialog('/AnythingElse');
						}
					});
					break;
			}
		}
	}
]).triggerAction({
	matches: 'TroubleshootRemoteAccessToken'
});
//*****
bot.dialog('/UnlockYourPassword', [
function(session, args, next) {
		console.log(session.message.text)
		session.userData.userQuery = session.message.text
		session.send("Let me look it up for you");
    webscrap(function(res) {
    if(res.length>0){
    	builder.Prompts.choice(session, "Please select the mode you want to view your answer:", ['Video', 'Document'], {
			listStyle: builder.ListStyle.button
		});
    }
    else{
    session.send("We currently have no video available.Please follow the below content");
							console.log(session.userData.userQuery)
							qnamaker(session, session.userData.userQuery, function(res) {
								if (res != "No good match found in the KB") {
									session.send(res);
									session.endDialog();
									session.replaceDialog('/AnythingElse');
								} else {
									session.send('Sorry, we do not have any document for you question');
									session.endDialog();
									session.replaceDialog('/AnythingElse');
								}
							});
    }
    });
},
	function(session, results) {
		if (results.response) {
			var selection = results.response.entity;
			// route to corresponding dialogs
			switch (selection) {
				case "Video":
					
						var msg = new builder.Message(session).attachments([{
							contentType: "video/mp4",
							name: "How to Reset or Unlock Your Password Using Press 1",
							contentUrl: "http://elearning/bunit/it/it-help-center/press-one.mp4"
						}]);
						
							session.send(msg);
							session.endDialog();
							session.replaceDialog('/AnythingElse');
						
					break;
				case "Document":
					console.log(session.userData.userQuery)
					qnamaker(session, session.userData.userQuery, function(res) {
						if (res != "No good match found in the KB") {
							session.send(res);
							session.endDialog();
							session.replaceDialog('/AnythingElse');
						} else {
							session.send("Sorry we donot have answer to your question");
							session.endDialog();
							session.replaceDialog('/AnythingElse');
						}
					});
					break;
			}
		}
	}
]).triggerAction({
	matches: 'UnlockYourPassword'
});
//****
bot.dialog('/ReplaceHardToken', [
	function(session, args, next) {
		console.log(session.message.text)
		session.userData.userQuery = session.message.text
		session.send("Let me look it up for you");
    webscrap(function(res) {
    if(res.length>0){
    	builder.Prompts.choice(session, "Please select the mode you want to view your answer:", ['Video', 'Document'], {
			listStyle: builder.ListStyle.button
		});
    }
    else{
    session.send("We currently have no video available.Please follow the below content");
							console.log(session.userData.userQuery)
							qnamaker(session, session.userData.userQuery, function(res) {
								if (res != "No good match found in the KB") {
									session.send(res);
									session.endDialog();
									session.replaceDialog('/AnythingElse');
								} else {
									session.send('Sorry, we do not have any document for you question');
									session.endDialog();
									session.replaceDialog('/AnythingElse');
								}
							});
    }
    });
},
	function(session, results) {
		if (results.response) {
			var selection = results.response.entity;
			// route to corresponding dialogs
			switch (selection) {
				case "Video":
					
						var msg = new builder.Message(session).attachments([{
							contentType: "video/mp4",
							name: "How to Connect to Remote Access on a Corporate Device",
							contentUrl: "http://elearning/bunit/it/it-help-center/Replacing-hard-with-soft-token.mp4"
						}]);
						
							session.send(msg);
							session.endDialog();
							session.replaceDialog('/AnythingElse');
					
							
					break;
				case "Document":
					console.log(session.userData.userQuery)
					qnamaker(session, session.userData.userQuery, function(res) {
						if (res != "No good match found in the KB") {
							session.send(res);
							session.endDialog();
							session.replaceDialog('/AnythingElse');
						} else {
							session.send("Sorry we donot have answer to your question");
							session.endDialog();
							session.replaceDialog('/AnythingElse');
						}
					});
					break;
			}
		}
	}
]).triggerAction({
	matches: 'ReplaceHardToken'
});
//****
bot.dialog('/ConnectRemoteAccess', [
	function(session, args, next) {
		console.log(session.message.text)
		session.userData.userQuery = session.message.text
		session.send("Let me look it up for you");
    webscrap(function(res) {
    if(res.length>0){
    	builder.Prompts.choice(session, "Please select the mode you want to view your answer:", ['Video', 'Document'], {
			listStyle: builder.ListStyle.button
		});
    }
    else{
    session.send("We currently have no video available.Please follow the below content");
							console.log(session.userData.userQuery)
							qnamaker(session, session.userData.userQuery, function(res) {
								if (res != "No good match found in the KB") {
									session.send(res);
									session.endDialog();
									session.replaceDialog('/AnythingElse');
								} else {
									session.send('Sorry, we do not have any document for you question');
									session.endDialog();
									session.replaceDialog('/AnythingElse');
								}
							});
    }
    });
},
	function(session, results) {
		if (results.response) {
			var selection = results.response.entity;
			// route to corresponding dialogs
			switch (selection) {
				case "Video":
					
						var msg = new builder.Message(session).attachments([{
							contentType: "video/mp4",
							name: "How to Connect to Remote Access on a Corporate Device",
							contentUrl: "http://elearning/bunit/it/it-help-center/Connecting-to-IPSEC.mp4"
						}]);
						
							session.send(msg);
							session.endDialog();
							session.replaceDialog('/AnythingElse');
				
					break;
				case "Document":
					console.log(session.userData.userQuery)
					qnamaker(session, session.userData.userQuery, function(res) {
						if (res != "No good match found in the KB") {
							session.send(res);
							session.endDialog();
							session.replaceDialog('/AnythingElse');
						} else {
							session.send("Sorry we donot have answer to your question");
							session.endDialog();
							session.replaceDialog('/AnythingElse');
						}
					});
					break;
			}
		}
	}
]).triggerAction({
	matches: 'ConnectRemoteAccess'
});
//****
bot.dialog('/UseRemoteDesktop', [
function(session, args, next) {
		console.log(session.message.text)
		session.userData.userQuery = session.message.text
		session.send("Let me look it up for you");
    webscrap(function(res) {
    if(res.length>0){
    	builder.Prompts.choice(session, "Please select the mode you want to view your answer:", ['Video', 'Document'], {
			listStyle: builder.ListStyle.button
		});
    }
    else{
    session.send("We currently have no video available.Please follow the below content");
							console.log(session.userData.userQuery)
							qnamaker(session, session.userData.userQuery, function(res) {
								if (res != "No good match found in the KB") {
									session.send(res);
									session.endDialog();
									session.replaceDialog('/AnythingElse');
								} else {
									session.send('Sorry, we do not have any document for you question');
									session.endDialog();
									session.replaceDialog('/AnythingElse');
								}
							});
    }
    });
},
	function(session, results) {
		console.log("results.response", results);
		if (results.response) {
			var selection = results.response.entity;
			// route to corresponding dialogs
			switch (selection) {
				case "Video":
					
						var msg = new builder.Message(session).attachments([{
							contentType: "video/mp4",
							name: "How to Use Remote Desktop",
							contentUrl: "http://elearning/bunit/it/it-help-center/Remote-desktop.mp4"
						}]);
						
							session.send(msg);
							session.endDialog();
							session.replaceDialog('/AnythingElse');
						
					break;
				case "Document":
					console.log(session.userData.userQuery)
					qnamaker(session, session.userData.userQuery, function(res) {
						if (res != "No good match found in the KB") {
							session.send(res);
							session.endDialog();
							session.replaceDialog('/AnythingElse');
						} else {
							session.send("Sorry we donot have answer to your question");
							session.endDialog();
							session.replaceDialog('/AnythingElse');
						}
					});
					break;
			}
		} else {
			console.log("hdkshdfhsdh")
		}
	}
]).triggerAction({
	matches: 'UseRemoteDesktop'
});
//********************

// firewall


bot.dialog('firewall_request',[ function (session) {
        console.log("Hello in firewall_request");
        builder.Prompts.text(session, "Sure, I would be happy to help you on that. Why do you want to raise the firewall request?.");
        },
        
        
        function(session, results){
        console.log("Hello in firewall_request");
        if (results.response) {
        console.log("Hello in firewall_request22");
        global.business_need = results.response;
        builder.Prompts.text(session, "Sure, I would be happy to help you on that. Please enter your name..");
        }
        },
        
        function(session, results){
        if (results.response) {
        global.name = results.response;
        builder.Prompts.choice(session, "VENDOR B2B CONNECTION", "Yes|No", { listStyle: 3 });
        }
        },
                
        function(session, results){
        if (results.response) {
        global.V2B_connection = results.response.entity;
        builder.Prompts.text(session, "Please enter your project name  ");
        }
        },
        
        function(session, results){
        if (results.response) {
        global.project_name = results.response;
        builder.Prompts.text(session, "Please enter your manager's name  ");
        }
        },
        
        function(session, results){
        if (results.response) {
        global.manager_name = results.response;
        builder.Prompts.choice(session, "Please choose your application type ", "SAP|DataCentre|Dev", { listStyle: 3 });
        }
        },
        
        function(session, results){
        if (results.response) {
        global.choice = results.response.entity;
        console.log(global.choice);
        builder.Prompts.number(session, "You chose "+ choice+" . Before you raise the firewall, we would like to verify if the firewall is already open. Please enter your Source IP Address.");
        }
        }, 
        
        function(session, results){
        if (results.response){
        global.source_IP = results.response;
        console.log(global.source_IP);
        console.log(source_IP);
        builder.Prompts.number(session,  "Please enter your Destination IP Address.");
        }
        },
        
        function(session, results){
        if (results.response){
        global.dest_IP = results.response;
        console.log((global.dest_IP));
        builder.Prompts.number(session, "Please enter port address.");
        }
        },
        
        function(session, results){
        if (results.response){
        global.port_address  = results.response;
        console.log((global.port_address));
        builder.Prompts.choice(session, "Please choose communication flow ", "One way|Bidirectional", { listStyle: 3 });
        }
        },
        
        function(session, results){
        if (results.response){
        
        global.comm_flow = results.response;
        console.log((global.port_address));
        console.log((global.dest_IP));
        console.log((global.choice));
        console.log((comm_flow));
        
        
        MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        console.log((global.source_IP));
        global.s_ip = source_IP.toString();
        global.d_ip= dest_IP.toString();
        global.port_addr =port_address.toString(); 
        var query={Application_type:choice,Source_IP:global.s_ip,Dest_IP:d_ip,port_No:port_addr};
        //var query = {Application_type:'DataCentre',Source_IP:'56',Dest_IP:'56',port_No:'56'};
         //var query = {Application_type:"${global.choice}", Source_IP:"${global.Source_IP}" , Dest_IP:"${global.dest_IP}", port_No:"${global.port_address}"};
        db.collection("tb_firewall_details").find({query}).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        console.log(result.length);
       
        if(result.length){
        session.send("Firewall request for these details is already raised. Please don't raise a new request.");
		session.endDialog();
		session.replaceDialog('/AnythingElse2')
        }
        else{
        builder.Prompts.text(session, "Please enter duration of request.");
         }
        db.close();
  });
});
        }
        },
        
        function(session, results){
        if (results.response){
        global.duration_request  = results.response;
        global.dur_req=duration_request.toString();
        builder.Prompts.text(session, "Please enter SLA");
        }
        },
        
        function(session, results){
        if (results.response){
        global.SLA = results.response;
        MongoClient.connect(url, function(err, db) {
  if (err) throw err;
        var myobj = { Name: name, Project_name:project_name, Manager_Name:manager_name, Application_type:choice, Source_IP:s_ip, Dest_IP:d_ip, port_No:port_addr, Status:"open",Duration:dur_req, Date:"11/29/2017", Ticket_Number:"aa001" };  
  db.collection("tb_firewall_details").insertOne(myobj, function(err, res){
  if(err) throw err;
  console.log("1 record inserted");
  
   db.close();
   session.send("Your request has been registered.");
   session.beginDialog('/AnythingElse2');
  });
});
      
        }
        }    
        
]).triggerAction({
    matches: 'firewall_request'
});

//AnythingElse  Dialog
bot.dialog('/AnythingElse', [
	function(session, args, next) {
		builder.Prompts.choice(session, "Is there anything else I can help you with??", ['Yes', 'No'],{retryPrompt: "Invalid choice, Please pick below listed choices",
            listStyle: builder.ListStyle.button,
            maxRetries: 1
            });
	},
	function(session, results) {
		if (results.response) {
			var selection = results.response.entity;
			// route to corresponding dialogs
			switch (selection) {
				case "Yes":
					session.replaceDialog('/AnythingElse12');
					break;
				case "No":
					session.replaceDialog('/Gettingfeedback');
					break;
			}
		}
	}
]);

// itsupport anything
bot.dialog('/AnythingElse12', [
	function(session, args, next) {
        builder.Prompts.choice(session, "Would you like to continue with:", ['ITSupport service', 'Back to home'], {retryPrompt: "Invalid choice, Please pick below listed choices",
            listStyle: builder.ListStyle.button,
            maxRetries: 1
            });
	},
	function(session, results) {
		if (results.response) {
			var selection = results.response.entity;
			// route to corresponding dialogs
			switch (selection) {
				case "ITSupport service":
					session.replaceDialog('/Re-EnterITSupport');
					break;
				case "Back to home":
					session.replaceDialog('/Greeting');
					break;
			}
		}
	}
]);


//Firewall AnythingElse  Dialog
bot.dialog('/AnythingElse2', [
	function(session, args, next) {
		builder.Prompts.choice(session, "Is there anything else I can help you with??", ['Yes', 'No'],{retryPrompt: "Invalid choice, Please pick below listed choices",
            listStyle: builder.ListStyle.button,
            maxRetries: 1
            });
	},
	function(session, results) {
		if (results.response) {
			var selection = results.response.entity;
			// route to corresponding dialogs
			switch (selection) {
				case "Yes":
					session.replaceDialog('/AnythingElse22');
					break;
				case "No":
					session.replaceDialog('/Gettingfeedback');
					break;
			}
		}
	}
]);

// Firewall anything
bot.dialog('/AnythingElse22', [
	function(session, args, next) {
        builder.Prompts.choice(session, "Would you like to continue with:", ['Firewall service', 'Back to home'], {retryPrompt: "Invalid choice, Please pick below listed choices",
            listStyle: builder.ListStyle.button,
            maxRetries: 1
            });
	},
	function(session, results) {
		if (results.response) {
			var selection = results.response.entity;
			// route to corresponding dialogs
			switch (selection) {
				case "Firewall service":
					session.replaceDialog('/Re-EnterITSupport');
					break;
				case "Back to home":
					session.replaceDialog('/Greeting');
					break;
			}
		}
	}
]);
//Gettingfeedback Dialog
bot.dialog('/Gettingfeedback', [
	function(session) {
		console.log("in Feedback");
		//console.log("in Feedback******",session);
		var feed1 = emoji.emojify(':star2: :star2: :star2: :star2: :star2:')
		var feed2 = emoji.emojify(':star2: :star2: :star2: :star2:')
		var feed3 = emoji.emojify(':star2: :star2: :star2:')
		var feed4 = emoji.emojify(':star2: :star2: ')
		var feed5 = emoji.emojify(':star2:')
		builder.Prompts.choice(session, "Please provide your feedback.Could you indicate your choice amongst the following?", [feed1 + '\nExcellent', feed2 + '\nGood', feed3 + '\nOK', feed4 + '\nBad', feed5 + '\nTerrible'], {
			listStyle: builder.ListStyle.button
		});
	},
	function(session, results) {
		console.log(results.response.entity)
		//console.log(results.response.index)
		switch (results.response.index) {
			case 0:
				console.log("0", results.response.index)
				// session.send("Thank you for Valuable Feedback");
				MongoClient.connect(url,function(err, db) {
         console.log('1311',err);
         console.log('1312',db);
					var collection_feedback = db.collection('feedback');
					console.log("Connected correctly to server for intent update for Greeting");
					collection_feedback.insert({
						"userID": '12345',
						"feedback": '5 Star'
					});
					db.close();
				});
				break;
			case 1:
				console.log("1", results.response.index)
				// session.send("Thank you for Valuable Feedback");
				MongoClient.connect(url, function(err, db) {
					var collection_feedback = db.collection('feedback');
					console.log("Connected correctly to server for intent update for Greeting");
					collection_feedback.insert({
						"userID": '12345',
						"feedback": '4 Star'
					});
					db.close();
				});
				break;
			case 2:
				console.log("2", results.response.index)
				// session.send("Thank you for Valuable Feedback");
				MongoClient.connect(url, function(err, db) {
					var collection_feedback = db.collection('feedback');
					console.log("Connected correctly to server for intent update for Greeting");
					collection_feedback.insert({
						"userID": '12345',
						"feedback": '3 Star'
					});
					db.close();
				});
				break;
			case 3:
				console.log("2", results.response.index)
				// session.send("Thank you for Valuable Feedback");
				MongoClient.connect(url, function(err, db) {
					var collection_feedback = db.collection('feedback');
					console.log("Connected correctly to server for intent update for Greeting");
					collection_feedback.insert({
						"userID": '12345',
						"feedback": '2 Star'
					});
					db.close();
				});
				break;
			case 4:
				console.log("2", results.response.index)
				// session.send("Thank you for Valuable Feedback");
				MongoClient.connect(url, function(err, db) {
					var collection_feedback = db.collection('feedback');
					console.log("Connected correctly to server for intent update for Greeting");
					collection_feedback.insert({
						"userID": '12345',
						"feedback": '1 Star'
					});
					db.close();
				});
			default:
				console.log("3", results.response.index)
				session.endDialog();
				break;
		}
		session.replaceDialog('/EndDialog');
	}
]);
// EndDialog Dialog
bot.dialog('/EndDialog', [
	function(session, args, next) {
		console.log("Bot says bye..");
		session.endDialog("Thank you and have a wonderful time ahead !!");
	}
]);
//None Intent
bot.dialog('/None', [
	function(session) {
		session.send("Sorry I didn't understand");
		session.endDialog();
	}
]).triggerAction({
	matches: 'None'
});
//starting point
bot.dialog('/', function(session) {
	session.send("You said: %s", session.message.text);
});
//Function to webScraping video URL
function webscrap(cb) {
//	fs.readFile('/home/cts565637/FPL/ITsupport/' + '/source.html', 'utf8', function(err, html) {
//		var $ = cheerio.load(html);
//    console.log("inside webscrap")
//		links = $('a');
//    var abc=[];
//		$(links).each(function(i, link) {
//			var url = $(link).attr('href')
//			if (url.indexOf('.mp4') >= 0) {
//				console.log("MP4 url:", url);
//				abc.push(url)
//			}
//		});
//   cb(abc[0])
//	});
cb('https://www.youtube.com/embed/aDa2xBAfSFw')
}

//
//function webscrap(cb) {
//cb('none')
//}
//Function for hero card generation
function CreateHeroCard(session, builder, title, subtitle, text, url, buttons) {
	var card = new builder.HeroCard(session).title(title).subtitle(subtitle).text(text).buttons(buttons);
	return card;
};
//Function to webscrap outlook search on https://support.office.com
function abc(html, cb) {
	var $ = cheerio.load(html);
	var href = []
	var title = []
	var content = []
	var comm = []
	var a_href = $('h2 a')
	var a_href1 = $('h2 div.ocSearchResultDesc')
	$(a_href).each(function(i, link) {
		var url = $(link).attr('title')
		title.push(url);
	});
	$(a_href1).each(function(i, link) {
		var url = $(link).text()
		content.push(url);
	});
	$(a_href).each(function(i, link) {
		var url = $(link).attr('href')
		href.push(url);
	});
	comm.push(title);
	comm.push(content);
	comm.push(href);
	console.log(comm)
	cb(comm)
}


function qnamaker(session,userQuery, cb) {
	//var question = session.message.text
	var question = session.userData.userQuery;
	jsonObject = JSON.stringify({
		"question": question,
		"top": 1
	});
	request.post({
		headers: {
			'Content-type': 'application/json',
			'Ocp-Apim-Subscription-Key': '45bf530d13f14afab04d29b4dbc54f18',
			'Content-Length': Buffer.byteLength(jsonObject, 'utf8')
		},
		url: 'https://westus.api.cognitive.microsoft.com/qnamaker/v2.0/knowledgebases/' + '0a74c1ec-6338-4a5f-9fb5-4939fa3efab3' + '/generateAnswer',
		// method: 'POST',
		body: jsonObject
	}, function(error, response, body) {
		console.log("\nStatus: ", response.statusCode);
		console.log("\nAdded new utterances to LUIS");
		var data = JSON.parse(body)
		console.log("**************", data);
		//console.log("MMMMM",data.answers[0].answer);
		//
		if ((data.answers[0].answer) === "No good match found in the KB") {
			cb("No good match found in the KB");
		} else {
			cb(data.answers[0].answer);
		}
	});
};