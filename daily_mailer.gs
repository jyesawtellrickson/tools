/*

Script to analyse daily orders and send out summary.
Triggers at 5am each day.

*/

function dailySummary(){
  // 
  var data_input_sheet = SpreadsheetApp.openById("1J0YUzpzy8kG_OVsZVR0QY2G2RMkqP1rRpWwAd_06CWk").getSheetByName("Sheet3")
  data_input_sheet.getRange("A1").setValue(Math.random())
  SpreadsheetApp.flush()
  // get current day and set to 6am
  var today = new Date()
  today.setHours(0);
  // find previous day at 6am
  var yest = new Date()
  yest.setDate(today.getDate()-1);
  yest.setHours(0);
  // Gmail variables
  var name = 'Orders'
  var label = GmailApp.getUserLabelByName(name)
  var threads = label.getThreads();    
  // B2B/C? - voucher codes
  var countries = [];
  var orderVals = [];
  var vendors = [];
  var companies = [];
  var vouchers = [];
  // look through 50 recent emails (or while day is greater than yest) fails if more than 50 orders
  for (i=0;i<50;i++){
    var message = threads[i].getMessages()[0];
    // check if date is correct
    if (message.getDate() >= yest && message.getDate() <= today){
      // extract values from thread and add to arrays
      var ans = addEmail(message);
      countries.push(ans[0]);
      orderVals.push(ans[1]);
      vendors.push(ans[2]);
      companies.push(ans[3]);
      vouchers.push(ans[4]);
    }
  }
  // all values extracted
  // get order value information
  orderVals = currencyConvert(orderVals,countries)
  var orderValsSort = orderVals.sort(function(a, b){return b-a});
  // count voucher use
  var voucherCounts = countA(vouchers)
  var voucherList = buildList2(voucherCounts[0],voucherCounts[1]);
  var companyCounts = countA(companies)
  var companyList = buildList2(companyCounts[0],companyCounts[1]);
  var vendorCounts = countA(vendors)
  var vendorList = buildList2(vendorCounts[0],vendorCounts[1]);
  var avgOrderVal = (orderVals.reduce(add, 0) / orderVals.length).toString()
  avgOrderVal = avgOrderVal.substr(0,3);
  var returning = data_input_sheet.getRange(7,3).getDisplayValue()
  var new_orders = data_input_sheet.getRange(6,3).getDisplayValue()
  var pct_ret = data_input_sheet.getRange(8,3).getDisplayValue()
   // Generate email body
  var response = ""
  response += "Total Orders: "+countries.length+'\n\n'
  response += "Country Orders: Singapore: "+countOccur(countries,"SG")+", Hong Kong: "+countOccur(countries,"HK")+"\n\n";
  response += "Retention: New: "+new_orders+", Returning: "+returning+", Pct Ret: "+pct_ret+"\n\n";
  response += "Total Orders Value: USD$"+orderVals.reduce(add, 0)+"\n";
  response += "Average Order Value: USD$"+avgOrderVal+"\n";
  response += "Largest Orders: USD$"+orderValsSort[0]+", $"+orderValsSort[1]+", $"+orderValsSort[2]+"\n\n";
  response += "Vouchers Used: \n";
  response += voucherList+"\n\n";
  response += "Client Type: B2B: "+sumCompanies(companyCounts[1])+", B2C: "+(companies.length-sumCompanies(companyCounts[1]))+"\n\n";
  response += "Companies: \n";
  response += companyList + "\n\n";
  response += "Vendors: \n";
  response += vendorList
  Logger.log(response)
  // now send email to user
  var subject = "Daily Summary - "+yest.toDateString();
  MailApp.sendEmail("paul@caterspot.com,silvia@caterspot.com,amanda@caterspot.com,camilo@caterspot.com,robert@caterspot.com",subject,response)  
  // MailApp.sendEmail("jye@caterspot.com",subject,response)  
  return
}



function addEmail(message){
  var msgText = cleanText(message.getBody());
  var subject = message.getSubject();
  // extract data required
  // country, order value, vendor, companies
  var country = subject.substr(17,2).toUpperCase();
  var orderVal = findText(msgText, "Subtotal");
  var vendor = findText(msgText, "Name");
  var company = findText(msgText, "Company", 1); 
  if (company == ""){
    company = findText(msgText, "Company", -1);
  }
  var voucher = findText(msgText, "Voucher");
  return [country, orderVal, vendor, company, voucher]
}


function emailExtract(message){
  /*
  Process email. Primarily with findText function
  */
  var msgText = message.getBody();
  msgText = cleanText(msgText);
  var subject = message.getSubject();
  var output = [];
  // generate output
  output.push(subject.substr(17,2).toUpperCase());
  output.push(dateConvert(findText(msgText,"Order Date"),1));
  output.push(findText(msgText,"Order Code"));
  output.push("New Order");
  output.push("");
  output.push(findText(msgText,"First Name")+" "+findText(msgText,"Last Name"));
  output.push(findText(msgText,"Company",2));
  // actually two places for company...
  output.push(dateConvert(findText(msgText,"Delivery Date and Time"),0));
  output.push("");
  output.push(findText(msgText,"Name"));
  output.push("");
  // ******* PAGE FREEZE ************** //
  output.push("");
  // need to do above two
  output.push(["B2B","B2C"][+(findText(msgText,"Company",2)=="")]);
  output.push(findText(msgText,"Serves:"));
  // could improve pax estimate by taking mode of many results
  output.push(["HKD","SGD"][+(subject.substr(17,2)=="sg")]); // column O 15
  // *********** Billed to Customer ************** //
  output.push(findText(msgText,"Subtotal"));
  output.push(findText(msgText,"Delivery Fee"));
  output.push(findText(msgText,"Tax"));
  output.push(""); // service fee
  output.push([findText(msgText,"Discount"),0][+(findText(msgText,"Discount")==-1)]); // CaterSpot discount 20
  output.push(""); // vendor refund
  output.push("");
  output.push("");
  output.push("");
  output.push("");
  output.push(paymentMethod(findText(msgText,"Payment Method")))
  // **************** Payable to Vendor ************ //
  for (j=1;j<=8;j++){output.push("")}
  // ********** yellow ********* //
  output.push("");
  output.push([findText(msgText,"Voucher Code"),""][+(findText(msgText,"Voucher Code")==-1)]); // voucher
  output.push("");
  for (j=1;j<=4;j++){output.push("")}
  // ******* customer details ************* //
  output.push(findText(msgText,"Company"));
  // little trickier as sometimes unit doesn't exist
  output.push(findText(msgText,"Unit")+", "+findText(msgText,"Street")+", "+findText(msgText,"City")+", "+findText(msgText,"Post Code"));
  // need to fix up address for missing parts
  output.push(findText(msgText,"Special Instruction"));
  // should add email here
  // only go up to AX, everything else is formulas and manual fill
  
  return output
}

// if proposal, don't add row

function processMailAuto() {
  // Gmail variables
  var name = 'Orders'
  var name2 = 'Order_Compiled'
  var threads = getThreadsFromName(name)
  var procLabel = GmailApp.getUserLabelByName(name2);
  // Spreadsheet variables
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName("Order_Compiler_Auto");
  var lastRow = getLastRow(sheet,"C")
  // var outputRange = sheet.getRange(lastRow+1,1);
  
  var runNum = 10 //spreadsheet.getSheetByName("Instructions").getRange(4, 7).getValue();
  var addCount = 0
  
  for (i=runNum-1;i>=0;i--){ // threads.length
    // always look at the first email in any thread
    var thread = threads[i]
    var message = thread.getMessages()[0];
    // check if already processed
    var check = performChecks(thread,name2);
    // checked, proceed with main code
    if (check == 0){
      var output = emailExtract(message);
      // output generated, now step through the row making a change if not blank.
      for (j=0;j<output.length;j++) {
        // if (output[j] != ""){outputRange.offset(0,j).setValue(output[j])}
        if (output[j] != ""){sheet.getRange(lastRow+1,1+j).setValue(output[j]);}
      }
      lastRow++;
      //outputRange = outputRange.offset(1,0)
      procLabel.addToThread(thread)
      addCount = addCount+1
    }
  }
  // change the date rows to be non-US format for Calvin
  var dateRange = SpreadsheetApp.getActiveSheet().getRange("B:B");
  dateRange.setNumberFormat('dd/mm/yyyy');
  // sort data
  sheet.sort(2,true)
//  ui.alert(addCount+" new orders added.")
}
  
function processMail() {
  // Gmail variables
  var name = 'Orders'
  var name2 = 'Auto'
  var label = GmailApp.getUserLabelByName(name)
  var threads = label.getThreads();  
  // create label Auto if doesn't exist
  GmailApp.createLabel(name2)
  var procLabel = GmailApp.getUserLabelByName(name2);
  // Spreadsheet variables
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName("Order_Compiler");
  var lastRow = sheet.getMaxRows();
  var values = SpreadsheetApp.getActiveSheet().getRange("C1:C" + lastRow).getValues();
  for (; values[lastRow - 1] == "" && lastRow > 0; lastRow--) {}
  var outputRange = sheet.getRange(lastRow+1,1);
  
  // runNum is restricted to 40 - the inbox size?
  var runNum = 200 //spreadsheet.getSheetByName("Instructions").getRange(4, 7).getValue();
  var addCount = 0
  
  for (i=runNum-1;i>=0;i--){ // threads.length
    // always look at the first email in any thread
    var thread = threads[i]
    var message = thread.getMessages()[0];
    // check if already processed
    var curLabels = thread.getLabels()
    var check = 0
    for (j=0;j<curLabels.length;j++){check = check + (curLabels[j].getName() == name2)}
    if (thread.getFirstMessageSubject().substr(0,16) != "Order Received -"){check = check + 1}
    if (message.getSubject().length != 27){check++}
    if (findText(message.getBody(),"Braintree Transaction")==-1){check++}
    if (check == 0){
      var output = emailExtract(message);
      // output generated, now step through the row making a change if not blank.
      for (j=0;j<output.length;j++) {
        if (output[j] != ""){outputRange.offset(0,j).setValue(output[j])}
      }
      outputRange = outputRange.offset(1,0)
      procLabel.addToThread(thread)
      addCount = addCount+1
    }
  }
  // change the date rows to be non-US format for Calvin
  var dateRange = SpreadsheetApp.getActiveSheet().getRange("B:B");
  dateRange.setNumberFormat('dd/mm/yyyy');
  // sort data
  sheet.sort(2,true)
//  ui.alert(addCount+" new orders added.")
}






