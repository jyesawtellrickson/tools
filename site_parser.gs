/**
 * Foodline Homepage Parser
 * Script to parse Foodline page for orders, info includes:
 * - Vendor
 * - Catering (or Tingkat)
 * - Date for
 * - Time placed (approx.)
 * - Time scanned
 * Data is written directly to a spreadsheet and the html is backed up.
 * Note it may be advantageous to scan multiple times in an hour if the results
 * aren't always the same.
 */


// return first regex match or undefined
function regexExtract(text, regex){
  regex = new RegExp(regex)
  try{
    return regex.exec(text, 'gi')[0];
  }
  catch (e){
    return undefined;
  }
}

// get date from file
function extractDate(fileName){
  var dateStr = regexExtract(fileName, '[0-9]+')
  var year = 2000 + +dateStr.substr(0,2);
  var month = +dateStr.substr(2,2)-1;
  var day = +dateStr.substr(4,2);
  var hour = +dateStr.substr(6,2);
  var minute = +dateStr.substr(8,2);
  var date = new Date(year, month, day, hour, minute, 0);
  return date
}

// get order details from link
function linkToOrder(link){
  var order = regexExtract(link, '\/[^/]+\/$');
  order = order.substr(1, order.length-2);
  return order
}

// get caterer from link
function linkToCatering(link){
  return regexExtract(link, '^\/[^/]+');
}

// fails for cakes
function linkToVendor(link){
  var vendor = regexExtract(link, '^\/[^/]+\/([^/]+)');
  vendor = regexExtract(vendor.substr(1, vendor.length-1), '\/([^/]+)');
  vendor = vendor.substr(1, vendor.length);
  return vendor
}

// get time order was placed
function cardToTime(card){
  var time = regexExtract(card, 'OrderDate\"\>[^<]+');
  time = time.substr(11, time.length-11);
  return time
}

// get number of pax
function cardToPeople(card){
  var people = regexExtract(card, 'OrderDetails\"\>[^p]+')
  people = regexExtract(people, '[0-9]+');
  return people
}

// Gets Delivery Date
function cardToDelivery(card){
  var delivery = regexExtract(card, 'OrderDetails\"\>[^<]+');
  var loc = delivery.indexOf('for');
  delivery = delivery.substr(loc+4, delivery.length-loc-4-6);
  return delivery
}

// Converts time to date
function timeToOrder(time, time_scanned){
  var time_searches = ['', ' sec', ' min', ' hour', ' few hours']
  var time_find = -1
  var order_date = undefined;
  var date = new Date();
  // if blank return undefined
  if (time.length == 0){
    return undefined;
  }
  while (time_find == -1){
    time_find = time.indexOf(time_searches.pop())
    if (time_searches.length != 0 && time_searches.length != 4){
      var time_num = parseInt(regexExtract(time, '[0-9]+'));
    }
    // could not find, over 5 hours ago
    if (time_searches.length == 0){
      order_date = new Date(time_scanned.getTime()-5*60*60*1000);
    }
    // seconds
    else if (time_searches.length == 1){
      order_date = new Date(time_scanned.getTime()-time_num*1000)
    }
    // mins
    else if (time_searches.length == 2){
      order_date = new Date(time_scanned.getTime()-time_num*60*1000)
    }
    // hours
    else if (time_searches.length == 3){
      order_date = new Date(time_scanned.getTime()-time_num*60*60*1000)
    }
    // few hours ago
    else if (time_searches.length == 4){
      order_date = new Date(time_scanned.getTime()-3*60*60*1000)
    }
  }
  return order_date
}

/**
 * Converts HTML to machine readable orders.
 *
 * @param {Object} html Homepage of foodline.
 *
 * @returns {Array} 10 cell array with each cell representing an order
 */
function readHomepage(htmlFile){
  var html = htmlFile.getAs("text/html").getDataAsString();
  // get time scanned from file name
  var timeScanned = extractDate(htmlFile.getName());
  // get card elements
  // current method misses last order, that's OK...
  var res = 0;
  var res_old = 0;
  var cards = new Array;
  while (res >= 0){
    res = html.indexOf('<div class="CellContainer">', res_old+1);
    cards.push([res_old, res]);
    res_old = res;
  }
  var orders = new Array;
  // iterate over each card containing an order
  for (var j = 1; j < cards.length-1; j++){
    var card = html.substr(cards[j][0], cards[j][1]-cards[j][0]);
    // get link
    var link_regexp = new RegExp('href=\"([^"]*)', 'gi')
    var link = link_regexp.exec(card)[0];
    link = link.substr(6, link.length-6);
    var order = linkToOrder(link);
    // collect parameters
    var time = cardToTime(card);
    // apply functions to raw data
    var catering = linkToCatering(link);
    var vendor = linkToVendor(link);
    var people = cardToPeople(card)
    var delivery_date = cardToDelivery(card)
    var order_date = timeToOrder(time, timeScanned)
    var raw = link + " --- " + order + " --- " + delivery_date + " --- " + time
    orders.push([order, vendor, catering, people, delivery_date, order_date, timeScanned, raw]);
  }
  return orders;
}

// Gets the last row of a particular column.
function getLastRowCol(sheet,col){
  var lastRow = sheet.getMaxRows();
  var search = col+":"+col// + String(lastRow)
  var values = sheet.getRange(search).getValues();
  for (; values[lastRow - 1] == "" && lastRow > 0; lastRow--) {}
  return lastRow
}

// Adds orders to spreadsheet.
function addOrdersToSheet(orders){
  var destFile = SpreadsheetApp.openById('1Ft2l3X49iuE-kAfLfwJ5kxCIUMW1hzrd4RI0o1UMwx4');
  var sheet = destFile.getSheetByName('orders');
  var lastRow = getLastRowCol(sheet, "A");
  // before adding results to file, check if the order already exists
  // if order with same delivery date, same order and vendor AND time is within 1 hour, delete
  for (var i = 0; i < orders.length; i++){
    var order = orders[i];
    Logger.log('Processing '+order[7]);
    var do_not_add = false;
    // check if order was in last 30 minutes
    if (order[5] < new Date(order[6].getTime() - 30*60*1000)){
      do_not_add = true;
    }
    // if passed checks proceed
    if (do_not_add == false){
      // add results to file
      // can we create an ID with a trick and then check against orders
      sheet.getRange(lastRow+1+i, 1, 1, order.length).setValues([order]);
    }
  }
}

// Saves HTML from url in a folder.
function saveHTML(url, dest_folder) {
  var response = UrlFetchApp.fetch(url)
  var html = response.getContentText()
  var fileName = 'foodline_homepage' + "_" + Utilities.formatDate(new Date(),Session.getScriptTimeZone(),"YYMMddHHmm")
  dest_folder.createFile(fileName, html, 'text/html');
}

// Queries foodline website, writes results and saves backup.
function mainScript(){
  // fetch the HTML, save it and then process.
  var sourceFolder = DriveApp.getFolderById('1Sug1KLPKQh49k8GZTHR4_gopJ23h68XM');
  var destFolder = DriveApp.getFolderById('1amIlq2XA6z60YUiEfxN1bBORN_bGO61a');
  saveHTML('www.foodline.sg', sourceFolder);
  Logger.log('HTML file saved successfully.')
  // get files from this path
  var files = sourceFolder.getFiles()
  // with each file process
  while (files.hasNext()){
    var file = files.next();
    if (file.getName().substr(0,17) == 'foodline_homepage'){
      var orders = readHomepage(file);
      Logger.log(orders.length + ' orders to process.');
      // iterate over each order
      addOrdersToSheet(orders);
      // move file to processed
      destFolder.addFile(file);
      sourceFolder.removeFile(file);
    }
  }
  Logger.log("Script run successfully")
}
