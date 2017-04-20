function myFunction() {
  var basesStart = SpreadsheetApp.getActive().getSheetByName("Sheet1").getRange("C3:C3").getValues()  // 4
  var basesEnd = SpreadsheetApp.getActive().getSheetByName("Sheet1").getRange("C3:C3").getValues()  // 5
  var starts = SpreadsheetApp.getActive().getSheetByName("Sheet1").getRange("D3:D9").getValues()  // 10
  var ends = SpreadsheetApp.getActive().getSheetByName("Sheet1").getRange("E3:E12").getValues()  // 14
  var absolute = "catering"
  var output = []
  var bases = []
  var keywordNumOrder = (4+5)*10*14-1000
  var noBaseMods = 1;
  if (noBaseMods == 1){
    bases = [absolute]
  } else{
    // generate bases
    for (i=0;i<basesStart.length;i++){
      bases.push(basesStart[i]+" "+absolute)
    }
    for (i=0;i<basesEnd.length;i++){
      bases.push(absolute+" "+basesEnd[i])
    }
  }
  // generate keywords
  for (i=0;i<bases.length;i++){
    // just the bases
    output.push("["+bases[i]+"]")
    // starts 1
    for (j=0;j<starts.length;j++){
      output.push("["+starts[j]+" "+bases[i]+"]")
    }
    // ends 1
    for (j=0;j<ends.length;j++){
      output.push("["+bases[i]+" "+ends[j]+"]")
    }
    // start and end
    for (j=0;j<starts.length;j++){
      for (k=0;k<ends.length;k++){
        output.push("["+starts[j]+" "+bases[i]+" "+ends[k]+"]")
      }
    }
    // starts and double ends
    for (j=0;j<starts.length;j++){
      for (k=0;k<ends.length;k++){
        for (l=0;l<ends.length;l++){
        output.push("["+starts[j]+" "+bases[i]+" "+ends[k]+" "+ends[l]+"]")
        }
      }
    }
    // double starts and ends
    for (j=0;j<starts.length;j++){
      for (k=0;k<starts.length;k++){
        for (l=0;l<ends.length;l++){
        output.push("["+starts[j]+" "+starts[k]+" "+bases[i]+" "+ends[l]+"]")
        }
      }
    }

    if (keywordNumOrder > 500){
      SpreadsheetApp.getActive().getSheetByName("Sheet2").getRange("B"+(2+i)).setValue(output.toString())
      output = []
    }

  }
  Logger.log(output.length)
  SpreadsheetApp.getActive().getSheetByName("Sheet2").getRange("B2").setValue(output.toString())
  //SpreadsheetApp.getActive().getSheetByName("Sheet2").getRange("B2").setValue(output.slice(1,1000).toString())
  //SpreadsheetApp.getActive().getSheetByName("Sheet2").getRange("B2").setValue(output.slice(1,100).toString())
  //SpreadsheetApp.getActive().getSheetByName("Sheet2").getRange("B2").setValue(output.slice(1,100).toString())
  //SpreadsheetApp.getActive().getSheetByName("Sheet2").getRange("B2").setValue(output.slice(1,100).toString())
  
  Logger.log(output)
}



function myFunctionChristmas() {
  bases = SpreadsheetApp.getActive().getSheetByName("Sheet1").getRange("C3:C7").getValues()  // 5
  starts = SpreadsheetApp.getActive().getSheetByName("Sheet1").getRange("D3:D12").getValues()  // 10
  ends = SpreadsheetApp.getActive().getSheetByName("Sheet1").getRange("E3:E19").getValues()  // 17
  absolute = "xmas"
  output = []
  for (i=0;i<5;i++){
    // starts
    output.push("["+absolute+" "+bases[i]+"]")
    output.push("["+bases[i]+" "+absolute+"]")
    for (j=0;j<10;j++){
      output.push("["+starts[j]+" "+absolute+" "+bases[i]+"]")
    }
    // ends
    for (j=0;j<17;j++){
      output.push("["+absolute+" "+bases[i]+" "+ends[j]+"]")
    }
    // start and end
    for (j=0;j<10;j++){
      for (k=0;k<17;k++){
        output.push("["+starts[j]+" "+absolute+" "+bases[i]+" "+ends[k]+"]")
      }
    }
    /*
    for (j=0;j<9;j++){
      for (k=0;k<12;k++){
        for (l=0;l<12;l++){
        output.push("["+starts[j]+" christmas "+bases[i]+" "+ends[k]+" "+ends[l]+"]")
        }
      }
    }
    */
  }
  Logger.log(output.length)
  SpreadsheetApp.getActive().getSheetByName("Sheet2").getRange("B2").setValue(output.toString())
  //SpreadsheetApp.getActive().getSheetByName("Sheet2").getRange("B2").setValue(output.slice(1,1000).toString())
  //SpreadsheetApp.getActive().getSheetByName("Sheet2").getRange("B2").setValue(output.slice(1,100).toString())
  //SpreadsheetApp.getActive().getSheetByName("Sheet2").getRange("B2").setValue(output.slice(1,100).toString())
  //SpreadsheetApp.getActive().getSheetByName("Sheet2").getRange("B2").setValue(output.slice(1,100).toString())
  
  Logger.log(output)
}
