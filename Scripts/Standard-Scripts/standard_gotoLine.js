<<<<<<< HEAD
function __showGotoLineDialog() {    
    if (application.activeWindow.title) {      
        showDialog('dialogGotoLine.html', 350, 100, 220, 96);   //showDialog(dialogName, dialogStartPointX, dialogStartPointY, dialogWidth, dialogHeight)
    } else {
        application.messageBox('', application.getString('IDS_THIS_FUNCTION_ONLY_IN_TITLE_EDIT'), 'alert-icon');
    }
}
    
function __gotoLine(o) {      
    if (o.lineNumber) {
        application.activeWindow.title.gotoLine(o.lineNumber);
    } 
}
=======
function __showGotoLineDialog() {    
    if (application.activeWindow.title) {      
        showDialog('dialogGotoLine.html', 350, 100, 220, 96);   //showDialog(dialogName, dialogStartPointX, dialogStartPointY, dialogWidth, dialogHeight)
    } else {
        application.messageBox('', application.getString('IDS_THIS_FUNCTION_ONLY_IN_TITLE_EDIT'), 'alert-icon');
    }
}
    
function __gotoLine(o) {      
    if (o.lineNumber) {
        application.activeWindow.title.gotoLine(o.lineNumber);
    } 
}
>>>>>>> 3e5d931d9d3b1faf29e675ab1fd818ecb1034437
