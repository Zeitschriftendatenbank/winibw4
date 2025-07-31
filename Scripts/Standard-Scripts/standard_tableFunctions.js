function __tableFunction_invokeTables() {
    if (!activeWindow.title) {
        application.messageBox(application.getString('IDS_MustBeEditing'), 'alert-icon');
        return;
    }
    var tag = application.activeWindow.title.tag;
    var shortCode = __tableFunction_getShortCut(__Trim(tag));   
    var text;
    if (shortCode == "") {
        // no shortcut, tag can be shortcut!
        text = application.getTableContentText(tag, tag);
    } else {
        text = application.getTableContentText(tag, shortCode);
    }

    if (text != "") {
        // matched text found, do insert or replace
        __tableFunction_insertText(text, shortCode);
        return;
    }

    // no matched text found, show tables and then do insert ot replace with user's selection
    application.tableData(shortCode);
    showDialog('tablesPage.html', 200, 0, 730, 362);   //showDialog(dialogName, dialogStartPointX, dialogStartPointY, dialogWidth, dialogHeight)
    return;
}

function __tableFunction_replaceText() {   
    var tableData = __Trim(application.tableData);    
    var theTitle = application.activeWindow.title;
    if (theTitle) {     
        tableData = tableData.replace(/\\r/gi, "\r");       
        theTitle.replace(tableData);   
    }
}

function __tableFunction_insertText(text, shortCode) {
    var theTitle = application.activeWindow.title;    
    if (shortCode == "") {   
        theTitle.startOfField(false);
        theTitle.endOfField(false);    
    }    
    text = text.replace(/\\r/gi, "\r"); 	
    theTitle.insertText(text);
}

function __tableFunction_getShortCut(theTag) {
    var theTitle = application.activeWindow.title;
    var selStart = theTitle.selStart;  
    var selEnd = theTitle.selEnd;     

    var strShortCut = __Trim(theTitle.selection);
    var ind;
    var len = theTag.length + 1;
    var isSpecialTag = false;
    var hasOnlyOneSpace = false;
    var tagContent;
    if (strShortCut == "") {       
        var theFirstLetterOfTag = theTag.substr(0, 1);

        if ((theFirstLetterOfTag == "M") || (theFirstLetterOfTag == "L") || (theFirstLetterOfTag == "C")) {
            isSpecialTag = true;
        }

        strShortCut = __Trim(theTitle.currentField);        
        tagContent = strShortCut.substr(len, strShortCut.length-len);        
        if (!__tableFunction_isShortCode(tagContent)) {
         	theTitle.startOfField(false);
            selStart = theTitle.selStart + len;
            selEnd = selStart + tagContent.length;
            strShortCut = tagContent;   
        } else {
            var theSelStart = theTitle.selStart;            
            theTitle.startOfField(false);
            var theStartField = theTitle.selStart;            
            theTitle.setSelection(theSelStart, theSelStart, false);
            strShortCut = strShortCut.substr(0, theSelStart - theStartField);           
            if ((ind = strShortCut.lastIndexOf("$")) >= 0) {
                if (isSpecialTag) {
                    strShortCut = strShortCut.substr(ind + 2, strShortCut.length - ind - 2);                    
                } else {
                    strShortCut = strShortCut.substr(ind + 1, strShortCut.length - ind - 1);                   
                }
                
            } else if ((ind = strShortCut.lastIndexOf(" ")) >= 0) {
                if (ind == strShortCut.indexOf(" ")) {                    
                    hasOnlyOneSpace = true;
                } 
                strShortCut = strShortCut.substr(ind + 1, strShortCut.length - ind - 1);
            } else {
                if (strShortCut.length > len) {
                    strShortCut = strShortCut.substr(len);
                } else {
                    strShortCut = "";
                    var curLine = theTitle.currentField;
                    if (curLine[curLine.length - 1] != ' ') {
                        theTitle.startOfField(false);
                        theTitle.endOfField(false);
                        theTitle.insertText(" ");
                    }
                }
                theTitle.startOfField(false);
                theTitle.charRight(len, false);
                theTitle.endOfField(true);
            }
            if (hasOnlyOneSpace) {
                selStart = selEnd - strShortCut.length;
            } else {
                selStart = selEnd - strShortCut.length - 1;
            }
        }        
        theTitle.setSelection(selStart, selEnd);        
    }    
    
    return __Trim(strShortCut);
}

function __tableFunction_isShortCode(str) {
    if (str.indexOf("$") >= 0 || str.indexOf(" ") >= 0) return true;
    return false;
}

function __Trim(x) {
    return x.replace(/^\s+|\s+$/g, "");
}


