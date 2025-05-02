 /*************************************************************************************************
 * 
 *	This file contains the standard WinIBW script functions for transliteration
 *
 **************************************************************************************************
 */					
 var selectedNumber_trans;				// selected number in numberList
 var selectedSourceCode_trans;		    // selected sourceCode in sourceTargetList
 var selectedTargetCode_trans;		    // selected targetCode in sourceTargetList

 var selectedTime;
 var transPrefix = gConfig.transPrefix;
 var transCenter = gConfig.transCenter;
 var transSuffix = gConfig.transSuffix;

var transliterateUtility =
{
    numbersArray: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
                    "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
                    "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
                    "31", "32", "33", "34", "35", "36", "37", "38", "39", "40",
                    "41", "42", "43", "44", "45", "46", "47", "48", "49", "50",
                    "51", "52", "53", "54", "55", "56", "57", "58", "59", "60",
                    "61", "62", "63", "64", "65", "66", "67", "68", "69", "70",
                    "71", "72", "73", "74", "75", "76", "77", "78", "79", "80",
                    "81", "82", "83", "84", "85", "86", "87", "88", "89", "90",
                    "91", "92", "93", "94", "95", "96", "97", "98", "99", ],

    getNextNumber: function (curNr) {
        for (var i = 0; i < this.numbersArray.length; i++) {
            if (this.numbersArray[i] == curNr) {
                return this.numbersArray[i + 1];
            }
        }
    },

    add_numberLanCode: function (lineNr, tag, nr_sourceCode, nr_targetCode) {
        var currentLineNr;        

        application.activeWindow.title.startOfField(false);
        application.activeWindow.title.charRight(tag.length + 1, false);
        application.activeWindow.title.insertText2(nr_sourceCode);

        //wait for enough time to let insertText2(nr_sourceCode) work fine
        var cnt = 0;
        for (var i = 0; i < 2000000; i++) cnt++;   
       
        application.activeWindow.title.lineDown(1, false);
        currentLineNr = application.activeWindow.title.currentLineNumber;   
        
        if (currentLineNr == lineNr) {                
            application.activeWindow.title.endOfField(false);
            application.activeWindow.title.insertText("\n");
        } 

        var tagNrCode = tag + " " + nr_targetCode + "\n";       
        application.activeWindow.title.insertText2(tagNrCode);

        //wait for enough time to let insertText2(tagNrCode) work fine
        cnt = 0;
        for (var i = 0; i <2000000; i++) cnt++;      
       
        application.activeWindow.title.startOfField(false);
    },

    readSavedData: function () {
        var transData = application.transliterateData;
        if (transData == "") return false;

        var parts = transData.split(":");
        selectedNumber_trans = parts[0];
        selectedSourceCode_trans = parts[1];
        selectedTargetCode_trans = parts[2];
        selectedTime = parts[3];
        return true;
    }
};

function setupTransliteration()
{
    showDialog('dialogSetupTransliterate.html', 200, 20, 480, 202); //showDialog(dialogName, dialogStartPointX, dialogStartPointY, dialogWidth, dialogHeight)
}

function __preparation() {
    if (!transliterateUtility.readSavedData()) {
        application.messageBox("", gPicaUtility.getMessage("SetupTransliterate"), "error-icon");
        setupTransliteration();
        return false;
    }
   
    if (!application.activeWindow.title && selectedTime == "0") {
        application.messageBox("Alert", gPicaUtility.getMessage("MustBeEditing"), "alert-icon");
        return false;
    }
	return true; 
}

function __processTransliteration() {
    if (__preparation()) {
		if (selectedTime == "1") return;		
		__doTransliteration();
	}
}

function repeatTransliteration() {
    if (__preparation()) {  
		__doTransliteration();
	}
}

// The function is to repeat transliteration process with saved data
function __doTransliteration() { 
    //if (application.activeWindow.title.getRTLEnabled() == false) {
    //	application.switchRTL ();
    //} 
        
    // get the start point of the selected texts   
    var positionStart = application.activeWindow.title.selStart;    
    // get the end point of the selected texts
    var positionEnd = application.activeWindow.title.selEnd; 

    // positionEnd shuld not include '\r' if '\r' is at the end of the selection
    var sel1 = application.activeWindow.title.selection;
    application.activeWindow.title.setSelection(selStart, positionEnd - 1, false);
    var sel2 = application.activeWindow.title.selection;
    if (sel1 == sel2) positionEnd--;
 
    application.activeWindow.title.setSelection(positionEnd, positionEnd, false);
    var cField = application.activeWindow.title.currentField();
    
    while (cField == "") {
        application.activeWindow.title.lineUp(1);
        cField = application.activeWindow.title.currentField();        
    }   
    application.activeWindow.title.lineDown(1, false);
    var lineNrEnd = application.activeWindow.title.currentLineNumber;
    var selectLineNrEnd = lineNrEnd;

    // preparations for adding number and languagecode for each line
    application.activeWindow.title.setSelection(positionStart, positionStart, true);
    var curTag, curLineNr;
    var oldTag = 0;
    var theNumber, lineNrCurrent;
    var numberSourceCode, numberTargetCode;
    var contEmptyTag = 0;
    var contTag = 0;
    var doUp = false;

    // process the empty tag before the first line of the selection
    curLineNr = application.activeWindow.title.currentLineNumber;    
    if (curLineNr > 1) {
        while (application.activeWindow.title.tag == "") {
            if (curLineNr != 1) {
                application.activeWindow.title.lineUp(1, false);
                doUp = true;
                curLineNr = application.activeWindow.title.currentLineNumber;
            } else {
                doUp = false;
                break;
            }
        }
        if (doUp == true) {
            application.activeWindow.title.lineDown(1, false);
        }
    }

    // within the selection, cont empty tags and no-empty tags  
    do {
        curLineNr = application.activeWindow.title.currentLineNumber;
        curTag = application.activeWindow.title.tag;        
        if (curTag == "") {
            contEmptyTag++;
        } else {
            contTag++;
        }
        application.activeWindow.title.lineDown(1, false);
    } while (curLineNr < selectLineNrEnd - 1)

    // get the end of line after transliteration 
    lineNrEnd = lineNrEnd + contTag;

    // set the cursor at the begining of the selection
    application.activeWindow.title.setSelection(positionStart, positionStart, false);

    // add number and languagecode for each line 
    do {
        curLineNr = application.activeWindow.title.currentLineNumber;
        curTag = application.activeWindow.title.tag;        
         //if line is empty, only move cursor one line down
        if (curTag == "") {
            if (curLineNr >= lineNrEnd - 1) {
                break;
            }

            oldTag = curTag;
            lineNrCurrent = application.activeWindow.title.currentLineNumber;
            application.activeWindow.title.lineDown(1, false);
        } else {
            if ((curTag == oldTag) && (curLineNr != 1)) {
                theNumber = transliterateUtility.getNextNumber(theNumber);
                numberSourceCode = transPrefix + theNumber + transCenter + selectedSourceCode_trans + transSuffix;
                numberTargetCode = transPrefix + theNumber + transCenter + selectedTargetCode_trans + transSuffix;
            } else {
                theNumber = selectedNumber_trans;
                numberSourceCode = transPrefix + selectedNumber_trans + transCenter + selectedSourceCode_trans + transSuffix;
                numberTargetCode = transPrefix + selectedNumber_trans + transCenter + selectedTargetCode_trans + transSuffix;
            }
            if (gConfig.numberCodeNeedReplace) {
				numberSourceCode = numberSourceCode.replace(/\./,"$L");
				numberTargetCode = numberTargetCode.replace(/\./,"$L");
            }
            transliterateUtility.add_numberLanCode(curLineNr, curTag, numberSourceCode, numberTargetCode);
            lineNrCurrent = application.activeWindow.title.currentLineNumber;
            oldTag = curTag;
        }
    } while (lineNrCurrent < lineNrEnd)    

        
    application.activeWindow.pressButton(2); // 'transliterate' button in de second place

    // set the cursor at the beginning of the next line after transliteration        
    application.activeWindow.title.startOfBuffer(false); 
    application.activeWindow.title.lineDown(lineNrEnd - 1 - contEmptyTag, false);         
}

