
function saveFoodlineHTML() {
  saveHtml("http://www.foodline.sg", "0By25ANcDsNEuclVwb25XSkpVWHM");
}

function venuerific(){
  // scan venuerific for list of vendors
  var url_base = "http://www.venuerific.com/sg/search?page=";
  var dest_folder = "0By25ANcDsNEuZDM2TVprWmUyajA";
  // save html
  for (var i = 1; i < 20; i++){
    saveHTML(url_base+i,dest_folder);
  }
}

/*
  Function to regularly save HTML from target website.
*/
function saveHTML(url, dest_folder) {
  var response = UrlFetchApp.fetch(url)
  var html = response.getContentText()
  var dest_folder = DriveApp.getFolderById(dest_folder)
  var fileName = url + "_" + Utilities.formatDate(new Date(),Session.getScriptTimeZone(),"YYMMddHHmm")
  dest_folder.createFile(fileName, html, 'text/html');
}


function readHTML(htmlFile) {
  // get text as string
  // text = htmlFile.getAs('text/html').getDataAsString()
  // find only required sections
  
}


function test(){
  // get folder with all the HTML files 
  var foldId = "0By25ANcDsNEueEZQQWlwMDQtRXM"
  // real all the files into an iterator
  var HTMLFiles = DriveApp.getFolderById(foldId).getFiles();
  // iterate through files
  while (HTMLFiles.hasNext()){
    // convert each file into 10 text sections
    readHTML(HTMLFiles.next())
  }
}


function getCaterers2(){
  var caterer_links = ['/catering/Pin-Si-Kitchen', '/cakes/shops/The-ONE-Bake-Shop', '/cakes/shops/The-Ice-Cream-N-Cookie-Co', '/catering/Sunlife-Durian-Puffs-N-Pastries', '/cakes/shops/Chocolate-Origin', 
                       '/cakes/shops/The-Frosted-Chick', '/catering/Big-O-Group-Catering', '/cakes/shops/Jara-Petit-Cheesecups', '/catering/Spice-Sutra', '/catering/New-Fut-Kai-Vegetarian', 
                       '/catering/Table-No.-7', '/cakes/shops/Frostylicious-Cakes', '/cakes/shops/Temptations-Cakes', '/cakes/shops/Bakers-World', '/catering/AKAIFUNE-Japanese-Restaurant', '/catering/Jai-Thai', 
                       '/catering/Wrap-N-Roll', '/cakes/shops/Whiskit-Patisserie', '/cakes/shops/Yez-Cake', '/catering/Madam-Saigon', '/catering/The-Scoop-Place', '/cakes/shops/Rocky-Master', 
                       '/catering/Tong-Chiang-Kitchen', '/cakes/shops/The-Bakers-Pte-Ltd', '/cakes/shops/Snowgurt', '/cakes/shops/Hokey-Pokey', '/catering/Lotus-Secret-Bun', '/catering/Hawkers', 
                       '/catering/Sakunthala', '/catering/Taste-of-India', '/catering/Indian-Express', '/cakes/shops/Scoopy’s-and-Cream', '/catering/Teng-Bespoke-Vegetarian-Dining-藤素食', 
                       '/cakes/shops/TenEleven-Cupcakes', '/catering/Old-Hong-Kong', '/cakes/shops/Sugar-Palette', '/cakes/shops/Baker-V', '/cakes/shops/HNJ-Cakeshop', '/catering/Fumiko-Enterprise', 
                       '/catering/Tung-Lok-Catering', '/catering/Curry-Gardenn', '/catering/YOLO---Healthy-Food', '/catering/Spice-Garden', '/cakes/shops/Rainbow-Lapis', 
                       '/catering/DONG-CHEUNG-KEE-(东昌记)', '/cakes/shops/PapaMama.sg', '/catering/Ocean-Treats-Catering', '/cakes/shops/The-White-Ombré', '/cakes/shops/Cravings', 
                       '/cakes/shops/Bake-Babe-Bakery', '/catering/Tims-Fine-Catering-Services', '/cakes/shops/AnnaBella-Patisserie', '/cakes/shops/Corine-N-Cake', '/cakes/shops/Bees-Cake', 
                       '/cakes/shops/Ugly-Cake-Shop', '/catering/Kings-Catering-Singapore', '/cakes/shops/Buck-Tile-St.-Cafe', '/catering/Napolizz-Pizza-Delivery', '/catering/IND-LINE', '/catering/BBQ-House', 
                       '/catering/Marco-Marco', '/catering/Quentins', '/catering/X-Empire-Cuisine', '/catering/Wangzai-Hongkong-Cafe', '/catering/BALLAJI-BHAAWAN', '/catering/Barworks-Wine-N-Spirits']
  
  var caterers = ['Pin-Si-Kitchen', 'The-ONE-Bake-Shop', 'The-Ice-Cream-N-Cookie-Co', 'Sunlife-Durian-Puffs-N-Pastries', 'Chocolate-Origin', 'The-Frosted-Chick', 
                  'Big-O-Group-Catering', 'Jara-Petit-Cheesecups', 'Spice-Sutra', 'New-Fut-Kai-Vegetarian', 'Table-No.-7', 'Frostylicious-Cakes', 'Temptations-Cakes', 'Bakers-World', 
                  'AKAIFUNE-Japanese-Restaurant', 'Jai-Thai', 'Wrap-N-Roll', 'Whiskit-Patisserie', 'Yez-Cake', 'Madam-Saigon', 'The-Scoop-Place', 'Rocky-Master', 'Tong-Chiang-Kitchen', 'The-Bakers-Pte-Ltd', 
                  'Snowgurt', 'Hokey-Pokey', 'Lotus-Secret-Bun', 'Hawkers', 'Sakunthala', 'Taste-of-India', 'Indian-Express', 'Scoopy’s-and-Cream', 'Teng-Bespoke-Vegetarian-Dining-藤素食', 
                  'TenEleven-Cupcakes', 'Old-Hong-Kong', 'Sugar-Palette', 'Baker-V', 'HNJ-Cakeshop', 'Fumiko-Enterprise', 'Tung-Lok-Catering', 'Curry-Gardenn', 'YOLO---Healthy-Food', 
                  'Spice-Garden', 'Rainbow-Lapis', 'DONG-CHEUNG-KEE-(东昌记)', 'PapaMama.sg', 'Ocean-Treats-Catering', 'The-White-Ombré', 'Cravings', 'Bake-Babe-Bakery', 'Tims-Fine-Catering-Services', 
                  'AnnaBella-Patisserie', 'Corine-N-Cake', 'Bees-Cake', 'Ugly-Cake-Shop', 'Kings-Catering-Singapore', 'Buck-Tile-St.-Cafe', 'Napolizz-Pizza-Delivery', 'IND-LINE', 'BBQ-House', 'Marco-Marco', 
                  'Quentins', 'X-Empire-Cuisine', 'Wangzai-Hongkong-Cafe', 'BALLAJI-BHAAWAN', 'Barworks-Wine-N-Spirits']
  saveCaterersHTML([caterer_links, caterers])
}

function getCaterers3(){
  var caterer_links = ['/catering/Chu-Yi-Kitchen', '/catering/Brindas', '/catering/Curry-N-Tandoor-Pte-Ltd', '/catering/SuanThai-Restaurant', '/cakes/shops/Cat-N-the-Fiddle', 
                       '/cakes/shops/Cake-Avenue', '/catering/Shiok!-Kitchen-Catering-(SK-Catering)', '/cakes/shops/CAKE-INSPIRATION', '/catering/Royal-Catering', '/cakes/shops/White-Spatula', 
                       '/cakes/shops/The-Scoop-Place', '/cakes/shops/Bing-Bing-Ice-Cream-Gallery', '/catering/Occasions-Catering', '/catering/Cita-Rasa-Kitchen', '/catering/Grain', '/catering/Savis-Food',
                       '/catering/BBQ-Chef', '/catering/Moonshee’s-Satay', '/catering/Churros-Factory', '/cakes/shops/Taste-Better', '/cakes/shops/My-Fat-Lady-Cakes', '/cakes/shops/The-Manna-Enterprise', 
                       '/cakes/shops/Bud-Of-Joy', '/cakes/shops/Cuppa-Cakes', '/cakes/shops/Crème-Maison-Bakery', '/catering/IINDIAN-SUMMER', '/cakes/shops/Straits-Lapis', '/catering/Fusion-Spoon', 
                       '/cakes/shops/Fancy-Delight', '/cakes/shops/Breadwerks', '/catering/Pearls-Court', '/catering/Tea-Valley', '/catering/Thyme-Food-N-Services', '/cakes/shops/Bakers-Heart', 
                       '/cakes/shops/Grin-Affair', '/catering/Indian-Curry-House', '/catering/Tropic-Twilight', '/catering/Old-Hong-Kong-Buffet', '/catering/The-Catering-Concerto-by-TCC', 
                       '/catering/Kantipur-Tandoori-Restaurant', '/catering/Old-Hong-Kong-Steamboat', '/cakes/shops/Jims-Bakery']
  
  var caterers = ['Chu-Yi-Kitchen', 'Brindas', 'Curry-N-Tandoor-Pte-Ltd', 'SuanThai-Restaurant', 'Cat-N-the-Fiddle', 
                  'Cake-Avenue', 'Shiok!-Kitchen-Catering-(SK-Catering)', 'CAKE-INSPIRATION', 'Royal-Catering', 'White-Spatula', 'The-Scoop-Place', 'Bing-Bing-Ice-Cream-Gallery', 'Occasions-Catering', 
                  'Cita-Rasa-Kitchen', 'Grain', 'Savis-Food','BBQ-Chef', 'Moonshee’s-Satay', 'Churros-Factory', 'Taste-Better', 'My-Fat-Lady-Cakes', 
                  'The-Manna-Enterprise', 'Bud-Of-Joy', 'Cuppa-Cakes', 'Crème-Maison-Bakery', 'IINDIAN-SUMMER', 'Straits-Lapis', 'Fusion-Spoon', 'Fancy-Delight', 'Breadwerks', 'Pearls-Court', 'Tea-Valley', 
                  'Thyme-Food-N-Services', 'Bakers-Heart', 'Grin-Affair', 'Indian-Curry-House', 'Tropic-Twilight', 'Old-Hong-Kong-Buffet', 'The-Catering-Concerto-by-TCC', 'Kantipur-Tandoori-Restaurant', 
                  'Old-Hong-Kong-Steamboat', 'Jims-Bakery']
  saveCaterersHTML([caterer_links, caterers])
}

function getCaterers1(){
  var caterer_links = ['/catering/Ronnie-Kitchen', '/catering/Kims-Kitchen', '/catering/338-Catering', '/catering/ECreative-Catering', '/catering/Mei-Hao-99-Catering', '/catering/Xin-Yi-Pin-Catering', 
                       '/catering/Savory-Kitchen', '/catering/Lion-Kitchen', '/catering/Shi-Fu-Ge', '/catering/Liang-Food-Caterer', '/catering/Jessie-Catering-Pte-Ltd', '/catering/Hows-Catering', 
                       '/catering/YLS-Catering', '/catering/Delizio-Catering', '/catering/Food-Fest', '/catering/Makan-Mate', '/catering/Thai-Pavilion', '/catering/International-Catering-Pte-Ltd',
                       '/catering/Seyu-Catering', '/catering/QQ-Catering', '/catering/House-Of-Catering', '/catering/Katong-Catering', '/catering/DesKitchen', '/catering/Curry-Pot', '/catering/CJS-CATERING', 
                       '/catering/Le-Xin-Catering-Pte-Ltd', '/catering/Golden-Pillow-933', '/catering/BellyGood-By-TungLok', '/catering/AM-Chef-Catering', '/catering/IS-Pot-Cuisine', '/catering/Fostre-Catering', 
                       '/catering/Yeh-Lai-Siang-Catering-Service', '/catering/Rasa-Rasa-Group-Catering-Services', '/catering/JMJ-Catering', '/catering/Fu-Kwee-Kitchen-Catering-Services',
                       '/catering/Hawa-Catering-Service', '/catering/Mums-kitchen', '/catering/Jiale-Buffet-Services', '/catering/Eatzi-Gourmet-Catering', '/catering/Tim-Delight',
                       '/catering/KCK-Food-Catering-Pte-Ltd', '/catering/East-West-Fusion', '/catering/Pines-Food-Delight', '/catering/Sakura-Forte', '/catering/Ohs-Farm-Catering', '/catering/Xiangs-Catering',
                       '/catering/Lye-Heng-Food-Supplies', '/cakes/shops/The-Cake-Shop', '/catering/Oriental-Pavilion', '/catering/Casuarina-Curry', '/cakes/shops/Eatzi-Gourmet-Bakery',
                       '/catering/Five-Food-Path', '/catering/The-Caterers', '/cakes/shops/Mirana-Cake-House', '/catering/Empire-Catering', '/catering/Yeyeah-Delights', 
                       '/catering/Amici-Events-And-Catering', '/cakes/shops/Guru-Nice-Bakery', '/catering/Orchid-Thai-Catering', '/catering/Nature-Vegetarian-Catering', 
                       '/catering/Straits-Chinese-Nonya-Restaurant', '/catering/Jai-Siam', '/catering/Sushi-Deli', '/catering/Rumah-Makan-Minang', '/catering/Cater.in-by-The-Coffee-Connection-Pte-Ltd']
  
  var caterers = ['Ronnie-Kitchen', 'Kims-Kitchen', '338-Catering', 'Ecreative-Catering', 'Mei-Hao-99-Catering', 'Xin-Yi-Pin-Catering', 'Savory-Kitchen', 'Lion-Kitchen', 'Shi-Fu-Ge', 'Liang-Food-Caterer', 
                  'Jessie-Catering-Pte-Ltd', 'Hows-Catering', 'YLS-Catering', 'Delizio-Catering', 'Food-Fest', 'Makan-Mate', 'Thai-Pavilion', 'International-Catering-Pte-Ltd', 'Seyu-Catering', 'QQ-Catering', 
                  'House-Of-Catering', 'Katong-Catering', 'DesKitchen', 'Curry-Pot', 'CJS-CATERING', 'Le-Xin-Catering-Pte-Ltd', 'Golden-Pillow-933', 'BellyGood-By-TungLok', 'AM-Chef-Catering', 'IS-Pot-Cuisine', 
                  'Fostre-Catering', 'Yeh-Lai-Siang-Catering-Service', 'Rasa-Rasa-Group-Catering-Services', 'JMJ-Catering', 'Fu-Kwee-Kitchen-Catering-Services', 'Hawa-Catering-Service', 'Mums-kitchen', 
                  'Jiale-Buffet-Services', 'Eatzi-Gourmet-Catering', 'Tim-Delight', 'KCK-Food-Catering-Pte-Ltd', 'East-West-Fusion', 'Pines-Food-Delight', 'Sakura-Forte', 'Ohs-Farm-Catering', 'Xiangs-Catering', 
                  'Lye-Heng-Food-Supplies', 'The-Cake-Shop', 'Oriental-Pavilion', 'Casuarina-Curry', 'Eatzi-Gourmet-Bakery', 'Five-Food-Path', 'The-Caterers', 'Mirana-Cake-House', 'Empire-Catering', 
                  'Yeyeah-Delights', 'Amici-Events-And-Catering', 'Guru-Nice-Bakery', 'Orchid-Thai-Catering', 'Nature-Vegetarian-Catering', 'Straits-Chinese-Nonya-Restaurant', 'Jai-Siam', 'Sushi-Deli', 
                  'Rumah-Makan-Minang', 'Cater.in-by-The-Coffee-Connection-Pte-Ltd']
  saveCaterersHTML([caterer_links, caterers])
}

function saveCaterersHTML([caterer_links, caterers]) {
  for (var i = 0, len = caterer_links.length; i < len; i++){ //caterers.length
    try {
      var response = UrlFetchApp.fetch("http://www.foodline.sg"+ caterer_links[i])
      var html = response.getContentText()
      var dest_folder = DriveApp.getFolderById("0By25ANcDsNEuMHU2Njd1SHM5RnM")
      var fileName = 'foodline_' + caterers[i] + '_' + Utilities.formatDate(new Date(),Session.getScriptTimeZone(),"YYMMddHHmm")
      dest_folder.createFile(fileName, html, 'text/html'); 
    } catch(err) {
    }

  }
}


function checkFolder(){
  var sourceFolder = DriveApp.getFolderById("0By25ANcDsNEuMHU2Njd1SHM5RnM");
  var destFolder = DriveApp.getFolderById("0By25ANcDsNEuU0J0QUxqczR0Qm8");
  var files = sourceFolder.getFiles();
  while (files.hasNext()){
    var file = files.next();
    var views = getViews(file);
    var date = extractDate(file.getName());
    var caterer = extractCaterer(file.getName());
    addToSpreadsheet(caterer, views, date);
    moveFile(file, sourceFolder, destFolder);
  } 
}


function extractCaterer(fileName){
  var len = fileName.substr(9,fileName.length-9).indexOf("_")
  var caterer = fileName.substr(9,len);
  return caterer
}


function extractDate(fileName){
  var date = fileName.substr(fileName.length-10,10)
  return date
}



// search through all files in folder, get the views, add to spreadsheet then move file
function addToSpreadsheet(caterer, views, date, row){
  var spreadsheet = SpreadsheetApp.openById("1XUWITZGS9l9bkRp-dzOmw3V82e-DHSYlwql4FNAGCMk")
  var sheet = spreadsheet.getSheetByName("Sheet1")
  var lastRow = getLastRowCol(sheet,"A")
  sheet.getRange(lastRow+1,1,1,3).setValues([[caterer, views, date]]) 
  return
}

  
// scan through the pages to find text then take numbers inside <b> tags in front.
// regex...
function getViews(file){
  var text = file.getAs("text/html").getDataAsString()
  var end = text.indexOf(" visitors have viewed this caterer in the last 24hrs")-4
  var start = text.substr(end-10,10).indexOf("<b>") + end-10 + 3
  var views = text.substr(start, end-start)
  return views
  }


function moveFile(file, sourceFolder, destFolder){
  destFolder.addFile(file);
  sourceFolder.removeFile(file);
}



function getLastRowCol(sheet,col){
  var lastRow = sheet.getMaxRows();
  var search = col+":"+col// + String(lastRow)
  var values = sheet.getRange(search).getValues();
  for (; values[lastRow - 1] == "" && lastRow > 0; lastRow--) {}
  return lastRow
}



