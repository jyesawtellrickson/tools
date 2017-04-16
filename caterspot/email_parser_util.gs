function findText(text, searchTerm, order) {
  order = typeof order !== 'undefined' ? order : 1;
  var res = 0
  var last = 0
  // if order is negative, search from the bottom
  // keep finding terms until there is an error
  if (order == -1){
    while (res >= 0){
      res = text.indexOf(">"+searchTerm,res+1);
      last++;
    }
    order = last-1
  }
  //Logger.log(searchTerm+" "+order)
  var init = 0
  for (k=0;k<order;k++){
    // find start of text term
    var searchIndex = text.indexOf(">"+searchTerm,init+1)
    init = searchIndex
    // WHAT IF TERM IS NOT FOUND, result is -1, return -1
    if (searchIndex != -1) {
      // find the end of tag to see wher it starts and ends
      var start = text.indexOf(">",searchIndex+1)
      var end = text.indexOf("<",start)
      if (searchTerm == "Unit"){
        start = start - 1
      }
      if (searchTerm == "Credit Card Transaction"){
        start = start - 1
      }
      var term = text.substr(start+2,end-start-2)
      } else {
        var term = searchIndex
      }
  }
  return term
}

function getLastRow(sheet,col){
  var lastRow = sheet.getMaxRows();
  var search = col+":"+col// + String(lastRow)
  var values = sheet.getRange(search).getValues();
  for (; values[lastRow - 1] == "" && lastRow > 0; lastRow--) {}
  return lastRow
}

function getThreadsFromName(name) {
  var label = GmailApp.getUserLabelByName(name)
  var threads = label.getThreads();  
  return threads
}


function dateConvert(dateStr,adj) {
  var pt1 = dateStr.substr(0,4);
  var pt2 = dateStr.substr(7,dateStr.length-4);
  var ind1 = 0
  // only look in first four characters
  if (pt1.indexOf("st", "") != -1) {ind1 = pt1.indexOf("st", "")}
  if (pt1.indexOf("nd", "") != -1) {ind1 = pt1.indexOf("nd", "")}
  if (pt1.indexOf("rd", "") != -1) {ind1 = pt1.indexOf("rd", "")}
  if (pt1.indexOf("th", "") != -1) {ind1 = pt1.indexOf("th", "")}
  pt1 = pt1.substr(0,ind1);
  if (ind1==1) {pt1 = pt1 + " "}
  var dateStr2 = pt1 + pt2;
  var tmp = new Date(dateStr2)
  var ans = tmp
  // adjust for HK
  if (adj ==1){ans = new Date(tmp.getYear(),tmp.getMonth(), tmp.getDate(), tmp.getHours()+8, tmp.getMinutes())}
  return(ans)
  
}

function paymentMethod(pay_method){
  ans = pay_method
  if (pay_method=="Invoice"){
    ans = "Not Paid"
  }
  if (pay_method=="Credit Card"){
    ans = "Paid via Braintree"
  }
  if (pay_method=="Bank Transfer"){
    ans = "To Bank Transfer"
  }
  return ans
}

function cleanText(content) {
  //content = content.replace(/(<([^>]+)>)/ig, "");
  //content = content.replace(/(\r\n|\n|\r)/gm, " ");
  //content = content.replace(/<br>/g, '\n');
  //content = content.replace(/<.*?>|&gt;|&lt;/g, '');
  //content = content.replace(/^\s+|\s+$/g,""); 
  content = content.replace(/&apos;|&#39;/g,"'"); 
  content = content.replace(/&quot;/g,'"');
  content = content.replace(/&amp;|&#38;|&#038;/g," "); 
  content = content.replace(/&nbsp;|&#160;/g," ");
  content = content.replace(/&Prime;|&#8243;/g,"″");
  content = content.replace(/&lsquo;|&#8216;/g,'‘'); 
  content = content.replace(/&rsquo;|&#8217;/g,'’'); 
  content = content.replace(/&#8211;/g,'–'); 
  content = content.replace(/&#8230;/g,'…'); 
  content = content.replace(/&rdquo;|&#8221;/g,'”'); 
  content = content.replace(/&ldquo;|&#8220;/g,'“'); 
  content = content.replace(/&#8212;/g,'—');  
  return content;
}
 


function performChecks(thread, name2){
  // check if already processed
  var curLabels = thread.getLabels();
  // define check as 0, if is greater, than it will fail
  var check = 0;
  var message = thread.getMessages()[0];
  // check each label to see if processed label is there
  for (j=0;j<curLabels.length;j++){check = check + (curLabels[j].getName() == name2)}
  // check if the subject starts with the correct thing
  if (thread.getFirstMessageSubject().substr(0,16) != "Order Received -"){check = check + 1}
  // check the subject is the right length
  if (Math.abs(thread.getFirstMessageSubject().length-27) > 1){check++}
  // chcek if the message contains Braintree Transaction in every order
  //if (findText(message.getBody(),"Braintree Transaction")==-1){check++}
  // checked, proceed with main code  
  return check
}





















