function onOpen() {
  var ui = SpreadsheetApp.getUi();
  // Or DocumentApp or FormApp.
  ui.createMenu('CaterSpot Tools')
      .addItem('Update Report', 'getSent')
      .addToUi();
}

function getSent(){
  var emailRegex = new RegExp("<([^>]+)>")
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  var db = spreadsheet.getSheetByName("db")
  var emails = db.getRange("G:G").getValues()
  var threads = GmailApp.getInboxThreads()
  for (var i=0; i < threads.length; i++){
    // find all the messages which bounced
    // criteria: 2 emails, first is original, second from mailer-daemon@google.com or postmaster
    var msg_count = threads[i].getMessageCount()
    //
    if (msg_count > 1){ 
      var sec_email = threads[i].getMessages()[1].getFrom().toLowerCase()
      if (sec_email.indexOf('mailer-daemon')+sec_email.indexOf('postmaster') > -2){
        // email was a bounce, update spreadsheet
        var cust_email = threads[i].getMessages()[0].getTo()
        for (var j = 0; j < emails.length; j++){
          if (emails[j] == cust_email){
            db.getRange(j+1,10).setValue("TRUE")
          }
        }
      }
    }
    // see if they replied
    if (msg_count > 1){
      var cust_email = threads[i].getMessages()[0].getTo().toLowerCase()
      var messages = threads[i].getMessages()
      for (var j = 0; j < messages.length; j++){
        var from = messages[j].getFrom().toLowerCase()
        if (from.indexOf("<") >= 0){
          from = emailRegex.exec(from)[1]
        }
        if (from == cust_email){
          // cust responded, update
          var k = getRow(from, emails)
          if (k) {
            db.getRange(k+1,13).setValue("TRUE")
            db.getRange(k+1,14).setValue(msg_count)
          }
        } 
      }
    }
    // out of office?
  }
}

function getRow(email, emails){
  for (var k = 0; k < emails.length; k++){
    if (emails[k] == email){
      return k;
    }
  } 
  Logger.log("couldn't match email")
  return;
}
