var restify = require('restify');
var builder = require('botbuilder');
var parseXlsx = require('excel');
var textract = require('textract');
var connector = new builder.ChatConnector({
    appId: "0e3c9693-fd42-47bd-9c79-80e98291bb96",
    appPassword: "iwVX8+xjxxrXXZXX0375-!)"

});

// Receive messages from the user and respond
var bot = new builder.UniversalBot(connector);

var dataExcel=[];
// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 5609,function () {});



//// Listen for messages from users 
server.post('/api/messages', connector.listen());
var model = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/ca1c85e6-2574-4f7f-83ac-1cc86731c779?subscription-key=6538d2cf46cb4185ba71872eae6a04d9&verbose=true&timezoneOffset=0&q='
// This Url can be obtained by uploading or creating your model from the LUIS portal: https://www.luis.ai/
// for fixing default message issue
var recognizer = new builder.LuisRecognizer(model).onEnabled((context, callback) => {
    var enabled = context.dialogStack().length === 0;
    callback(null, enabled);
});
bot.recognizer(recognizer);

bot.dialog('/Greeting', [
    function(session, args, next) {
    
    var msg = new builder.Message(session)
    .addAttachment({
        contentUrl: 'https://learn.zu.ac.ae/webapps/dur-browserCheck-bb_bb60/samples/sample.xlsx',
        contentType: 'Excel file',
        name: 'Firewall template'
    });
session.send("Please fill this template and upload back for validation");
session.send(msg);
session.beginDialog('/ScannedAddress');
        }
]).triggerAction({
    matches: 'Greeting'
});

bot.dialog('/ScannedAddress', [
      function(session) {
        builder.Prompts.attachment(session, "Please upload updated template.");
        console.log("UploadPhotoDialog starts here!#");
    },
    function(session, results, next) {

        var msg_img = session.message;
        console.log(msg_img);
         console.log(msg_img.attachments[0].contentUrl);
         var urlexcel= msg_img.attachments[0].contentUrl;
         textract.fromUrl(urlexcel, function( error, text ) {
         console.log(text);
         var array = text.split('"');
         console.log(array);
         if(array.length%2==0){
         totalValues=array.length}
         else{
         totalValues=array.length-1;
         }
         console.log(totalValues);
         for ( let i =0;i<totalValues;i=i+2){
         if (i==0){  val2=array[i].split(",");
                      dataExcel.push({Source_DNS:val2[8],SOURCE_IP:val2[9],Destination_DNS:val2[10],Destination_IP:val2[11],Service:val2[12],Source_Port:val2[13],Business_need:array[i+1]});                    
                 
                   }
         else{
             val2=array[i].split(",");
                      dataExcel.push({Source_DNS:val2[1],SOURCE_IP:val2[2],Destination_DNS:val2[3],Destination_IP:val2[4],Service:val2[5],Source_Port:val2[6],Business_need:array[i+1]});
         
         
         }
         }
         console.log(dataExcel);
//         console.log("##############",array[1]);
//         console.log("##########*****####",array[3]);
//         var val1 =array[0].split(",");
//         var val2 =array[2].split(",");
//         console.log("valuehere",val1);
//         console.log(val1[8]);
//         console.log(val2[1]);
         });
         
//                     
//                     parseXlsx(urlexcel,function(err, data) {
//                       if(err) throw err;
//                        console.log(data) // data is an array of arrays
//                     });
         
         
         }
         
         
         
         
         
         ]);
//var luisAppUrl = process.env.LUIS_APP_URL || 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/381d2cde-56e1-4948-aa5c-5a9764e02d5f?subscription-key=3367258c3f6643eebe05fa52176af6da&verbose=true&timezoneOffset=0&q=';
//bot.recognizer(new builder.LuisRecognizer(luisAppUrl));
//
//
//
//bot.dialog('/HRMS', [
//    function (session) {
//      session.send("Whether your domain ID is created?")     
//    }
//]).triggerAction({matches:'HRMS'}).beginDialogAction('TOPSAction', 'askaboutTOPS',{ matches: /yes.*/i });
//
//bot.dialog('askaboutTOPS',[ function(session){
//session.send("Are you aware of TOPS Application?");
//}]).beginDialogAction('TopsYesAction', 'TOPSYes', { matches: /yes.*/i })
//.beginDialogAction('TopsNoAction', 'TOPSNo', { matches: /no.*/i });
//
//bot.dialog('TOPSYes',[ function(session){
//session.send("To get an HRMS application access, you need to raise an SR in TOPS applications");
//session.beginDialog('/frontSystem');
//}])
//bot.dialog('TOPSNo',[ function(session){
//session.send("I shall provide you the URL to access TOPS via email.  Please let me know your TKM ID / email ID.");
//session.beginDialog('/frontSystem');
//}])
//
//bot.dialog('/frontSystem', [
//    function (session) {
//      session.send("Are you infront of your system? ")     
//    }
//]).beginDialogAction('SysAction', 'frontYes',{ matches: /yes.*/i });
//
//bot.dialog('frontYes',[ function(session){
//session.send("Request you to login into TOPS")
//}]);
//
//bot.dialog('/credentials', [
//    function (session) {
//      session.send("Sir, provide your TKM ID and domain password for logging into TOPS.")     
//    }
//]).triggerAction({matches:'credentials'}).beginDialogAction('okaction12', 'fetchcredentials',{ matches: /password is.*/i });
//
//bot.dialog('fetchcredentials', [
//    function (session) {
//      session.send("Can you see the Dashboard field on your top left corner?")     
//    }
//]).triggerAction({matches:'fetchcredentials'}).beginDialogAction('click', 'clickAction', { matches: /yes.*/i });
//
//bot.dialog('clickAction', [
//    function (session) {
//      session.send("Once you click on Dashboard can you see Service Request-New Request")     
//    }
//]).beginDialogAction('okaction', 'afterClick1',{ matches: /yes.*/i });
//
//bot.dialog('afterClick1', [
//    function (session) {
//      session.send("Please click on the same")     
//    }
//]).beginDialogAction('okaction', 'afterClick',{ matches: /okay.*/i });
//
//bot.dialog('afterClick', [
//    function (session) {
//      session.send("You can see in the left Department , Request you to click on TKM IT")     
//    }
//]).beginDialogAction('donection', 'clickappinstance',{ matches: /done.*/i });
//
//
//bot.dialog('clickappinstance', [
//    function (session) {
//      session.send("Click on Application instance")     
//    }
//]).beginDialogAction('doneafteraction', 'oraclehrms',{ matches: /done.*/i });
//
//bot.dialog('oraclehrms', [
//    function (session) {
//      session.send("Scroll down and you will be able to see Oracle-HRMS , select that ")     
//    }
//]).beginDialogAction('doneafter1action', 'afteroraclehrms',{ matches: /done.*/i });
//
//bot.dialog('afteroraclehrms', [
//    function (session) {
//      session.send("Select the 6th service catalog- Oracle-HRMS Request for new user access to an application ")     
//    }
//]).beginDialogAction('doneafter2action', 'defaultgroup',{ matches: /done.*/i });
//
//bot.dialog('defaultgroup', [
//    function (session) {
//      session.send("Request you to fill all the mandatory fields in the default group ")     
//    }
//]);
//bot.dialog('/employeeType', [
//    function (session) {
//      session.send("Since you are a TKM employee, requesting you to select TKM Employee from the drop-down list")     
//    }
//]).triggerAction({matches:'employeeType'});
//
//bot.dialog('/companyName', [
//    function (session) {
//      session.send("Please mention TKM")     
//    }
//]).triggerAction({matches:'companyName'});
//
//bot.dialog('/startDate', [
//    function (session) {
//      session.send("Please select today's date")     
//    }
//]).triggerAction({matches:'startDate'});
//
//bot.dialog('/endDate', [
//    function (session) {
//      session.send("Please select a date within 5 years from now. e.g 31st Mar 2022")}
//]).triggerAction({matches:'endDate'});
//
//bot.dialog('/contactNumber', [
//    function (session) {
//      session.send("Rajesh san, the number on which you will be available if any clarifications required, kindly mention the same.")}
//]).triggerAction({matches:'contactNumber'});
//
//bot.dialog('/remarks', [
//    function (session) {
//      session.send("As you are new joinee, please mention the same and request for application access.")}
//]).triggerAction({matches:'remarks'}).beginDialogAction('click', 'aftersubmission', { matches: /okay.*/i });
//
//bot.dialog('aftersubmission', [
//    function (session) {
//      session.send("Kindly scroll top    You can see there are 4 levels of approval The first is your reporting manager and subsequent is application approvers.         Once you submit, request your manager to approve the SR. Once the SR is approved by all appprovers, the same will be processed and you will be given the access")}
//]).beginDialogAction('clickafw', 'servicereq', { matches: /okay.*/i });
//
//bot.dialog('servicereq', [
//    function (session) {
//      session.send("Please click the Submit button and submit the request Note down the service Request number for your ref")}
//]).beginDialogAction('clickfawi', 'elseassist', { matches: /okay.*/i });
//
//bot.dialog('elseassist', [
//    function (session) {
//      session.send("Is there anything else that i can help you out. ")}
//]).beginDialogAction('clickfawiq', 'thankyou', { matches: /no.*/i });
//
//bot.dialog('thankyou', [
//    function (session) {
//      session.send("Thank you for calling IT Helpdesk       Have a good day!")}
//]);
//
//
//
//// welcome message
//bot.on('conversationUpdate', function (message) {
//    if (message.membersAdded) {
//        message.membersAdded.forEach(function (identity) {
//            if (identity.id === message.address.bot.id) {
//
//                bot.send(new builder.Message()
//                    .address(message.address)
//                    .text("Thank you for calling IT Helpdesk,this is Prajna here.How may i help you? "));
//            }
//            
//            
//        });
//    }
//});

 /*
function getalertdays(a,callback){
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
     db.createCollection("indiaEmployees");
     
    var data = [{id:"1",name:"Abhinish Paul",vaildFrom: new Date(),validTill: new Date('2017-11-09T20:31:07.711Z')},{id:"2",name:"Nidhi Saini",vaildFrom: new     Date(),validTill: new Date('2017-11-07T20:31:07.711Z')}];
    db.collection('indiaEmployees').insertMany(data); 
        
     db.collection("indiaEmployees").find({}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);}
    );
    
    
     getalertdays("1",function(p){
                 
console.log("days left to change passsword",p);});
    
  
    db.collection("indiaEmployees").find({id:a}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result[0].validTill);
    var validTillDate = result[0].validTill;
    var currentDate= new Date();
    timeDiff =validTillDate-currentDate;
    var diffdays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    console.log(diffdays)
     db.close();  
     callback(diffdays);
        });
        });
}
 */ 