function onOpen() {
  var user = Session.getEffectiveUser().getEmail()
  if (user == "support@caterspot.com"){
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('CaterSpot Tools')
    .addItem('Fetch Orders', 'processMailAuto')
    .addToUi();
  }
}


function getCompany(msgText){
  ans = findText(msgText,"Company",1);
  if (ans == ""){
    ans = findText(msgText,"Company",2) 
  }
  return ans
}

function getSurchargeArea(msgText){
  var searchIndex = msgText.indexOf(">Surcharge:")
  if (searchIndex != -1){
    var start = msgText.indexOf(":",searchIndex)
    var end = msgText.indexOf("<",start)
    var term = msgText.substr(start+2,end-start-3)
    return term
  } else{
    return ""
  }
}

function getSummary(msgText){
  var searchIndex = msgText.indexOf("Order Summary")
  if (searchIndex != -1){
  // WHAT IF TERM IS NOT FOUND, result is -1, return -1
  var start = msgText.indexOf("<br />",searchIndex)
  start = msgText.indexOf("<br />",start+1)
  var end = msgText.indexOf("<strong>",start)
  var term = msgText.substr(start+6,end-start-18)
  // replace <br> with \n
  term = term.replace(/<br \/>/g,"\n"); 
  //term = term.replace(/<strong>/g,"\n"); 
  term = term.replace(/<[^>]+>/g,""); 
  return term
  } else{
    return ""
  }
}

function getDetails(msgText){
  var searchIndex = msgText.indexOf("Order Details")
  var start = msgText.indexOf("<strong>",searchIndex)
  var end = msgText.indexOf("Min Delivery Value",start)
  var term = msgText.substr(start+8,end-start-21)
  // replace <br> with \n
  term = term.replace(/<br \/>/g,"\n"); 
  // wherever bold, start a new line
  term = term.replace(/<strong>/g,"\n");
  // remove all other tags
  term = term.replace(/<[^>]+>/g,"");
  term = term.substr(0,term.length-1)
  return term
}

/*
 Process email to remove tags used by CS to place orders. 
*/
function cleanEmail(email){
  if (typeof email === 'string'){
    return email.replace(/\+[0-9a-zA-Z]+/g,"").trim()
  } else{
    return email
  }
}

/*
  Extract the domain from the given email, returns empty 
  string if email in bad format.
  
  Removes public emails from options. More domains
  can be excluded by simpling adding to the "ignore_domains"
  object.
*/
function domainFromEmail(email){
  if (typeof email === 'string'){
    // list of domains to ignore
    var ignore_domains = ["hotmail", "gmail", "yahoo", "msn", "outlook", "live"]
    var remove_parts = ["edu", "com", "co", "gov", "org"]
    // create regexp object
    var regExpDomain = new RegExp("@(.*)\\.[^.]+$");
    // execute regex
    var result = regExpDomain.exec(email);
    // check if match found
    if (result){
      var clean_email = result[1]
      // some may have .com, .co, .edu on the end, need to remove
      clean_email = clean_email.replace(/[.]com$/,"")
      clean_email = clean_email.replace(/[.]co$/,"")
      clean_email = clean_email.replace(/[.]edu$/,"")
      clean_email = clean_email.replace(/[.]org$/,"")
      clean_email = clean_email.replace(/[.]gov$/,"")
      // make sure it's not one of the ignored domains
      if (ignore_domains.indexOf(clean_email) >= 0){
        return ""
      } else{
        return clean_email
      }
    } else{
      return ""
    }
  } else{
    return email
  }
}


/*
  This function generates the output ready for adding to the database.
  It runs using a simple function findText which finds a string within
  the email. This will break when the menu items contain the same word
  followed by a colon.
  
  Better way to do this would be to convert the email HTML to a nice 
  object which could be processed easily.
  
  The find functions should also be replaced with regex.
*/
function emailExtractNew(message){
  var msgText = message.getBody();
  msgText = cleanText(msgText);
  var subject = message.getSubject();
  var output = [];
  Logger.log(msgText)
  // generate output
  // generic order info
  output.push(findText(msgText,"Order Code"));         // order code
  output.push(subject.substr(17,2).toUpperCase());     // country
  output.push(dateConvert(findText(msgText,"Order Date"),1));
  output.push(dateConvert(findText(msgText,"Delivery Date and Time"),0));
  output.push(findText(msgText,"Special Instruction"));
  // vendor info
  output.push(findText(msgText,"Name")); 
  // customer info
  output.push(findText(msgText,"First Name"));
  output.push(findText(msgText,"Last Name"));
  output.push(cleanEmail(findText(msgText,"Email",2)));
  output.push(findText(msgText,"Mobile",2));
  output.push(findText(msgText,"Company",1));
  output.push(findText(msgText,"Company",2));
  output.push(findText(msgText,"Unit"));  ////////////special
  output.push(findText(msgText,"Street"));
  output.push(findText(msgText,"Area"));
  output.push(getSurchargeArea(msgText));
  output.push(findText(msgText,"City"));
  output.push(findText(msgText,"Country"));
  output.push(findText(msgText,"Post Code"));
  // billing info
  output.push(findText(msgText,"Subtotal"));
  output.push([findText(msgText,"Delivery Fee"),""][+(findText(msgText,"Delivery Fee") == -1)]);
  output.push([findText(msgText,"Surcharge"),""][+(findText(msgText,"Surcharge") == -1)]);
  output.push([findText(msgText,"Tax"),""][+(findText(msgText,"Tax")==-1)]);
  output.push([findText(msgText,"Discount"),""][+(findText(msgText,"Discount")==-1)]); // CaterSpot discount 20
  output.push(findText(msgText,"Total",-1));
  output.push([findText(msgText,"Voucher Code"),""][+(findText(msgText,"Voucher Code")==-1)]); // voucher
  output.push(paymentMethod(findText(msgText,"Payment Method")))
  // output.push(findText(msgText,"Braintree Transaction"));
  output.push(findText(msgText,"Credit Card Transaction"));
  // order info
  output.push(getSummary(msgText));
  output.push(getDetails(msgText));
  //output.push(findText(msgText,"Serves:"));
  //Logger.log(output)  
  return output
}

/*
  Main function which is scheduled to run every hour and 
  process the orders in the orders data sheet. 
  
  This function assumes we receive less than 20 orders / hour.
  To increase, modify the number in "runNum" variable.
*/
function processMailAuto() {
  // Gmail variables
  var name = 'Orders'
  var name2 = 'Orders_backlog_processed'
  var threads = getThreadsFromName(name)
  var procLabel = GmailApp.getUserLabelByName(name2);
  // Spreadsheet variables, create backup variables for updating the 
  // backup sheet simultaneously
  // we run this here to minimise Gmail calls to not hit the limit
  var spreadsheet = SpreadsheetApp.openById("1vG8FT7laQTWHo6p_qq5fEMI1ypsw1W4on1PV7UyTX78")
  var spreadsheet_bup = SpreadsheetApp.openById("1nLcIX3AEbKuLJDljRU2TSP-E-wBUG90nwZu1zynp0s0")
  var sheet = spreadsheet.getSheetByName("db");
  var sheet2 = spreadsheet.getSheetByName("db2");
  var sheet_bup = spreadsheet_bup.getSheetByName("db");
  var sheet2_bup = spreadsheet_bup.getSheetByName("db2");
  //
  var lastRow = sheet.getLastRow();
  var lastRow_bup = sheet_bup.getLastRow();
  //  
  var runNum = Math.min(20, threads.length); // <<<< This assumes less than 20 orders / hour
  // start at the bottom and work your way up so that orders stay in order
  for ( i = runNum - 1; i >= 0; i-- ){
    // always look at the first email in any thread
    var thread = threads[i]
    // check if already processed
    if (performChecks(thread, name2) == 0){
      // take first email and get output
      var output = emailExtractNew(thread.getMessages()[0]);
      // first update db sheet
      dbUpdate(sheet, output, lastRow)
      dbUpdate(sheet_bup, output, lastRow_bup)
      // update db2
      db2Update(sheet2, output, lastRow)
      db2Update(sheet2_bup, output, lastRow_bup)
      // set new order and domain in db
      sheet.getRange(lastRow+1,30).setValue("New Order")
      sheet.getRange(lastRow+1,39).setValue(domainFromEmail(sheet.getRange(lastRow+1,9).getValue()))
      // update to next row
      lastRow++;
      lastRow_bup++;
      // add processed label
      procLabel.addToThread(thread)
    }
  }

  // change the date rows to be non-US format for Calvin
  //var dateRange = SpreadsheetApp.getActiveSheet().getRange("B:B");
  //dateRange.setNumberFormat('dd/mm/yyyy');
  // sort data
  //sheet.getRange(2,1,sheet.getLastRow(),sheet.getLastColumn()).sort({column: 3, ascending: true})
  //sheet_bup.getRange(2,1,sheet_bup.getLastRow(),sheet_bup.getLastColumn()).sort({column: 3, ascending: true})
  //sheet2.getRange(2,1,sheet2.getLastRow(),sheet2.getLastColumn()).sort({column: 1, ascending: true})
  //  ui.alert(addCount+" new orders added.")
}


function dbUpdate(sheet, output, lastRow){
  // write all values except the last two columns
  sheet.getRange(lastRow+1, 1, 1, output.length-2).setValues([output.slice(0,output.length-2)]);
}


function db2Update(sheet2, output, lastRow){
  // write order code to first column
  sheet2.getRange(lastRow+1,1).setValue(output[0])
  // write order details to second/third columns
  sheet2.getRange(lastRow+1, 2, 1, 2).setValues([output.slice(output.length-2,output.length)])
}

