<<<<<<< HEAD
// SearchReplace.js
// Search and Replace in the title editor.
// The main function calls showDialog, which opens a dialog (window), using the html file, to fill in the search parameters.
// The _findReplace callback is called when submitDialog() is called in the dialog.

// Search

function search() {
    if (activeWindow.title) {
        showDialog('dialogSearch.html', 350, 30, 220, 140); //showDialog(dialogName, dialogStartPointX, dialogStartPointY, dialogWidth, dialogHeight)
    } else {
        messageBox('', application.getString('IDS_THIS_FUNCTION_ONLY_IN_TITLE_EDIT'), 'alert-icon');
    }
}
    
function _find(o) {
    if (!activewindow.title.find(o.search, o.caseSensitive == 'true', false, o.wholeWord == 'true', 'next')
        && !activewindow.title.find(o.search, o.caseSensitive == 'true', false, o.wholeWord == 'true', 'first')) {
        messageBox('', '"' + o.search + '" ' + application.getString('IDS_NOTFOUND'), 'alert-icon');
    }
}

// Search and Replace
function searchReplace() {
    if (activeWindow.title) {
        showDialog('dialogSearchReplace.html', 350, 30, 220, 182); //showDialog(dialogName, dialogStartPointX, dialogStartPointY, dialogWidth, dialogHeight)
    } else {
        application.messageBox('', application.getString('IDS_THIS_FUNCTION_ONLY_IN_TITLE_EDIT'), 'alert-icon');
    }
}
    
function _findReplace(o) {
    var n = 0;
    if (o.search && o.replace) {
        while (activewindow.title.find(o.search, o.caseSensitive == 'true', false, o.wholeWord == 'true')) {
            if (activewindow.title.replace(o.replace)) n++;
       }
        application.messageBox('', n + ' ' + application.getString('IDS__OCCURRENCES_REPLACED'), 'message-icon');
    }
    else if (o.search) {
        activewindow.title.find(o.search, o.caseSensitive == 'true', false, o.wholeWord == 'true');
    }
    else {
        application.messageBox('', application.getString('IDS_NOTHING_CHANGED'), 'alert-icon');
    }
=======
// SearchReplace.js
// Search and Replace in the title editor.
// The main function calls showDialog, which opens a dialog (window), using the html file, to fill in the search parameters.
// The _findReplace callback is called when submitDialog() is called in the dialog.

// Search

function search() {
    if (activeWindow.title) {
        showDialog('dialogSearch.html', 350, 30, 220, 140); //showDialog(dialogName, dialogStartPointX, dialogStartPointY, dialogWidth, dialogHeight)
    } else {
        messageBox('', application.getString('IDS_THIS_FUNCTION_ONLY_IN_TITLE_EDIT'), 'alert-icon');
    }
}
    
function _find(o) {
    if (!activewindow.title.find(o.search, o.caseSensitive == 'true', false, o.wholeWord == 'true', 'next')
        && !activewindow.title.find(o.search, o.caseSensitive == 'true', false, o.wholeWord == 'true', 'first')) {
        messageBox('', '"' + o.search + '" ' + application.getString('IDS_NOTFOUND'), 'alert-icon');
    }
}

// Search and Replace
function searchReplace() {
    if (activeWindow.title) {
        showDialog('dialogSearchReplace.html', 350, 30, 220, 182); //showDialog(dialogName, dialogStartPointX, dialogStartPointY, dialogWidth, dialogHeight)
    } else {
        application.messageBox('', application.getString('IDS_THIS_FUNCTION_ONLY_IN_TITLE_EDIT'), 'alert-icon');
    }
}
    
function _findReplace(o) {
    var n = 0;
    if (o.search && o.replace) {
        while (activewindow.title.find(o.search, o.caseSensitive == 'true', false, o.wholeWord == 'true')) {
            if (activewindow.title.replace(o.replace)) n++;
       }
        application.messageBox('', n + ' ' + application.getString('IDS__OCCURRENCES_REPLACED'), 'message-icon');
    }
    else if (o.search) {
        activewindow.title.find(o.search, o.caseSensitive == 'true', false, o.wholeWord == 'true');
    }
    else {
        application.messageBox('', application.getString('IDS_NOTHING_CHANGED'), 'alert-icon');
    }
>>>>>>> 3e5d931d9d3b1faf29e675ab1fd818ecb1034437
}