/*************************************************************************************************
 * 
 *	This file contains the standard WinIBW script functions for adding number and language-code
 *
 *************************************************************************************************
 */		 					
 
 var selectedNumber;				// selected number in nameCodesArray
 var selectedSourceCode;	        // selected sourceCode in nameCodesArray
 var dataFilename;                  // the file for storing number and languagecode, which is in the directory /profiles/user-name/transliterate
 
var numCodeUtility =
{
    add_numberLanCode: function(tag, nr_sourceCode) {
   
        application.activeWindow.title.startOfField(false); 
        application.activeWindow.title.charRight(tag.length+1, false);
        application.activeWindow.title.insertText2(nr_sourceCode);

        //wait for enough time to let insertText2(tagNrCode) work fine
        var cnt = 0;
        for (var i = 0; i < 2000000; i++) cnt++;
        application.activeWindow.title.lineDown(1, false);            
    },  
     
    readSavedData: function () {
        var numCode = application.numCode;        
        if (numCode == "") return false;        

        var parts = numCode.split(":");
        selectedNumber = parts[0];
        selectedSourceCode = parts[1];
        return true;
    }
};        

function addNumberLanguageCode()
{    
    showDialog('dialogAddNumCode.html', 250, 50, 360, 128);   //showDialog(dialogName, dialogStartPointX, dialogStartPointY, dialogWidth, dialogHeight)
    return;
}

// The function is to repeat addNumberLanguagecode process with saved data
function repeatAddNumberLanguagecode()
{  
	if (!application.activeWindow.title) {
		application.messageBox("Alert",gPicaUtility.getMessage("MustBeEditing"), "alert-icon"); 
		return;
	}	
	
	// read the saved number and languagecode from the file "number_languagecode.txt"
	if (!numCodeUtility.readSavedData()) {
	    addNumberLanguageCode(); 
		return;		
	}
	
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

    var lineNrEnd = application.activeWindow.title.currentLineNumber;
    
    // preparation for adding number and Languagecode for each line
    application.activeWindow.title.setSelection(positionStart, positionStart, false);

    var curTag;
    var lineNrCurrent; 
    
    // add number and Languagecode for each line  
    do {
         curTag = application.activeWindow.title.tag;
         lineNrCurrent  = application.activeWindow.title.currentLineNumber;          

         if ((lineNrCurrent >= lineNrEnd) && (curTag == "")) {            
			return;
		 }	
         
         // if line is empty, only move cursor one line down         
         if (curTag == "") {
		 		 
     		if (lineNrCurrent >= lineNrEnd) {
     		// if the empty line at the end, do not perform further
     			break;
			}			
			application.activeWindow.title.lineDown(1, false);          
 	     } else {
			var numberSourceCode = transPrefix + selectedNumber + transCenter + selectedSourceCode + transSuffix;
			if (gConfig.numberCodeNeedReplace) {
				numberSourceCode = numberSourceCode.replace(/\./,"$L");
			}
			numCodeUtility.add_numberLanCode(curTag, numberSourceCode);
		 }                  
     }  while (lineNrCurrent < lineNrEnd)
          
     //set the cursor at the beginning of the next line after adding
     //application.activeWindow.title.startOfBuffer(false);
     //application.activeWindow.title.lineDown(lineNrEnd-1, false);
     //while (application.activeWindow.title.tag == "") {
	 //   application.activeWindow.title.lineUp(1, false); 
	 //}	
	 //application.activeWindow.title.lineDown(1, false);
	 //application.activeWindow.title.startOfField(false);   
    
     //if (application.activeWindow.title.getRTLEnabled() == false) { 
	 //   application.switchRTL ();
	 //} 
	 //application.activeWindow.title.refresh();       
}

function _getBeginNumber() {
	utility.sentDataToDialog(gConfig.beginNumber);
}