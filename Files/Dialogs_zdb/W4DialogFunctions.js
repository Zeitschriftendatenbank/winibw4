/*
 * The following functions in this file can be used in HTML-dialogs in WinIBW4 to communicate with WinIBW4:
 * runScript(scriptName)
 * runScript_afterCloseDialog(scriptName)
 * sendCommandToCBS(cmd, backGround)
 * getValueOfVariable(variableName)
 * getProfileInt(section, entry, defaultValue)
 * writeProfileInt(section, entry, value)
 * getProfileString(section, entry, defaultValue)
 * writeProfileString(section, entry, value)
 * closeDialog()
 *  
 * Therefore, 
 * (1) the script-file needs to be present in the same location as the HTML-dialog.
 * (2) <script src="./W4DialogFunctions.js"></script> needs to be included in the HTML-dialog.
 */

/*
 * This function is to run a loaded script-function from dialog.
 * if the name of the script-function is with sfName(), using it as runScript('sfName()')
 * if the name of the script-function is with sfName(o), using it as runScript('sfName')
 * i.e. 
 * scriptName = 'sfName()'
 * or
 * scriptName = 'sfName'
 * 
 * e.g. 
 * there are following 2 script functions:
 * function callback_1() {...};
 * function callback_2(o) {...};
 * 
 * runScript("callback_1()") will call callback_1()
 * runScript("callback_2") will call callback_2(o)
 * 
 * If the script-function has return-value, 'utility.sentDataToDialog(value);' needs to be used in the script-function to send the value to dialog.
 *
 * e.g.
 * 'utility.sentDataToDialog("A string!");' will send a string value to dialog
 * 'utility.sentDataToDialog(true);' will send a boolean value to dialog
 * 'utility.sentDataToDialog(12345);' will send an Integer value to dialog
 * 
 * in the dialog script, 
 * var return-value = runScript(scriptName);
 * the 'return-value' will be "A string!" or true or 12345
 */ 
function runScript(scriptName) {    
    if (!isValidString(scriptName)) {
        alert("Error: incorrect parameters at calling 'runScript' in the dialog: \n" + scriptName);
        return false;
    }
    return executeScript(scriptName, 1);
}

/*
 * This function is to run a loaded script-function automatically after dialog is closed
 * if the name of the script-function is with sfName(), using it as runScript("sfName())
 * if the name of the script-function is with sfName(o), using it as runScript("sfName)
 *
 * e.g.
 * there are following 2 script functions:
 * function callback_1() {...};
 * function callback_1(o) {...};
 *
 * runScript_afterCloseDialog("callback_1()") will call callback_1()
 * runScript_afterCloseDialog("callback_1") will call callback_1(o)
 *
 */
function runScript_afterCloseDialog(scriptName) {
    if (!isValidString(scriptName)) {
        alert("Error: incorrect parameters at calling 'runScript__afterCloseDialog' in the dialog: \n" + scriptName);
        return false;
    }
    executeScript(scriptName, 2);
}

/*
 * This function is to send a command to CBS, either backGround or front-end
 * cmd is the command to be sent to CBS, must be of 'string'
 * backGround must be of 'boolean', indicating whether the command is sent to CBS, background or not.
 * default value of backGround is false
 *
 * A boolean return-value indicates whether the sending is successful or not.
 */
function sendCommandToCBS(cmd, backGround) {
    if (backGround == undefined) backGround = false; 
    if (!isValidString(cmd) || typeof (backGround) != 'boolean') {
        alert("Error: incorrect parameters at calling 'sendCommandToCBS' in the dialog : \n" + cmd + "\n" + backGround);
        return false;
    }
    return external.dialogFunctionDispatch(["sendCommandToCBS", cmd, backGround]);
}

/*
 * This function is to get the value of the given variable, such as "P3GPP", "P3VAH", "P3VBK"
 * The variableName must be of 'string'
 */ 
function getValueOfVariable(variableName) {
    if (!isValidString(variableName)) {
        alert("Error: incorrect parameters at calling 'getValueOfVariable' in the dialog: \n" + variableName);
        return false;
    }
    return external.dialogFunctionDispatch(["getValueOfVariable", variableName]);
}

/*
 * This function is to store the value of entry as int in the WinIBW4 preferences for the key Section for the current user.
 * The value is set to 0 if value is NaN, where NaN = parseInt(non-digit-string), e.g. parseInt(“”).
 * Therefore, the following preference can be in the ‘C:\Users\USERNAME\AppData\Roaming\OCLC\WinIBW4\Prefs\user_Prefs.txt’ file:
 * section.entry = value
 * or
 * section.entry = 0
 *
 * e.g. writeProfileInt("today", "lunch", 1) will have the following entry in your user-preference:
 * today.lunch = 1
 * 
 * section and entry must be of 'string'
 * value must be integer
 *
 * A boolean return-value indicates whether writeProfileInt is successful or not.
 */ 
function writeProfileInt(section, entry, value) {
    if (!isValidString(section) || !isValidString(entry) || typeof (value) != 'number') {
        alert("Error: incorrect parameters at calling 'writeProfileInt' in the dialog : \n" + section + "\n" + entry + "\n" + value);
        return false;
    }
	//is NaN(value) is true when parseInt(a non-digit string), e.g. parseInt("");
	if (isNaN(value)) value = 0; 
    return external.dialogFunctionDispatch(["writeProfileValue", section, entry, value]);
}

/*
 * This function is to retrieve the value of entry as int from the preferences from the key Section for the current user. 
 * i.e., the value of the section.entry preference in the ‘C:\Users\USERNAME\AppData\Roaming\OCLC\WinIBW4\Prefs\user_Prefs.txt’ file. 
 * If the section.entry preference is not present or the value of the section.entry preference is not a number, defaultValue is returned.
 * 
 * e.g. getProfileInt("today", "lunch", 2) will get 1, because today.lunch = 1 in your user-preference.
 *
 * section and entry must be of 'string'
 * defaultValue must be integer
 */
function getProfileInt(section, entry, defaultValue) {
    if (!isValidString(section) || !isValidString(entry) ||
        typeof (defaultValue) == 'string' || typeof (defaultValue) == 'boolean') {
        alert("Error: incorrect parameters at calling 'getProfileInt' in the dialog : \n" + section + "\n" + entry + "\n" + defaultValue);
        return false;
    }
    return external.dialogFunctionDispatch(["getProfileValue", section, entry, defaultValue]);
}

/*
 * This function is to store the value of entry as string in the WinIBW4 preferences for the key Section for the current user.
 * Stores the value of entry as string in the WinIBW4 preferences for the key section for the current user. An empty string for value is valid. 
 * Therefore, the following preference can be in the ‘C:\Users\USERNAME\AppData\Roaming\OCLC\WinIBW4\Prefs\user_Prefs.txt’ file:
 * section.entry = value
 * or
 * section.entry = 
 *
 * e.g. writeProfileString("today", "dinner", "noodle") will have the following entry in your user-preference:
 * today.dinner = noodle
 *
 * section, entry must be a non-empty string 
 * value can be an empty string
 *
 * A boolean return-value indicates whether the writeProfileString is successful or not.
 */
function writeProfileString(section, entry, value) {
    if (!isValidString(section) || !isValidString(entry) || !isString(value)) {
        alert("Error: incorrect parameters at calling 'writeProfileString' in the dialog : \n" + section + "\n" + entry + "\n" + value);
        return false;
    }    
    return external.dialogFunctionDispatch(["writeProfileValue", section, entry, value]);
}

/*
 * This function is to retrieve the value of entry as string from the WinIBW4 preferences from the key Section for the current user. 
 * i.e., the value of the section.entry preference in the ‘C:\Users\USERNAME\AppData\Roaming\OCLC\WinIBW4\Prefs\user_Prefs.txt’ file. 
 * If the section.entry preference is not present, defaultValue is returned.
 *
 * e.g. getProfileString("today", "dinner", "noddle") will get 'something', because today.dinner = 'something' in your user-preference
 *
 * section, entry must be a non-empty string
 * defaultValue can be an empty string
 */
function getProfileString(section, entry, defaultValue) {
    if (!isValidString(section) || !isValidString(entry) || !isString(defaultValue)) {
        alert("Error: incorrect parameters at calling 'getProfileString' in the dialog : \n" + section + "\n" + entry + "\n" + defaultValue);
        return false;
    }
    return external.dialogFunctionDispatch(["getProfileValue", section, entry, defaultValue]);
}

/*
 * This function is to close a HTML dialog
 */ 
function closeDialog() { external.close(); }



//////The following functions are local/////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
 * This function is not used directly in a WinIBW4 HTML-dialog, called by runScript and runScript_afterCloseDialog
 * type = 1, run script;
 * type = 2, run script after dialog is closed automatically;
 * 
 * So, don't use the following functions directly in your HTML-dialogs in WinIBW4
 */
function executeScript(scriptName, type) {
    try {
        if (type != 1 && type != 2) return;
        var theScriptName;
        if (scriptName.slice(-2) == '()') {
            theScriptName = scriptName;           
        } else {
            var form = document.forms[0];
            var o = '{';
            var e, key;
            for (i = 0; i < form.elements.length; i++) {
                e = form.elements[i];
                if (e.id || e.name) {
                    if (o != '{') o += ',';
                    key = e.id ? e.id : e.name;   
                    value = (e.type === 'checkbox') ? e.checked
                          : (e.type === 'radio') ? (e.checked ? String(e.value).replace(/"/g, '\\"') : '')
                          : (typeof e.value !== 'undefined' && e.value !== null ? String(e.value).replace(/"/g, '\\"') : '');                    o += '"' + key + '":"' + value + '"';
                }
            }
            o += '}';
            //alert(o);
            if (form.id) {
                // Save the form contents for next time the dialog is used                
                external.dialogFunctionDispatch(["putVar", 'dialog-form-' + form.id, '(' + o + ')']);
            }
            theScriptName = scriptName + '(' + o + ')';            
        }
        return (type == 1) ? external.dialogFunctionDispatch(["exeScript", theScriptName]) : external.runScriptAfterCloseDialog(theScriptName);
    } catch (e) {
        alert('Error run scripts on dialog: ' + e.message);
    }
}

function isValidString(data) { return (typeof (data) == 'string' && data != ""); }

function isString(data) { return (typeof (data) == 'string'); }

// ---------------------------------------------
// Local functions continued: add event handlers
// ---------------------------------------------

// Set handler for the Tab key: move to next form element
// or [with shift] move to previous.
function setOnTabKeyPress(currE, prevE, nextE) {
    currE.addEventListener('keypress', function (ev) {
        if (ev.keyCode == 9) {  // Tab
            if (ev.shiftKey) {
                prevE.focus();
            } else {
                nextE.focus();
            }
        }
    });
}

// Set handler for editing keys, possibly using clipboard.
// TODO: implement Del key.
function setOnEditKeyPress(element) {
    element.addEventListener('keypress', function (ev) {
        if (ev.ctrlKey) {
            switch (ev.key) {
                case 'v':
                    // paste
                    var text = window.clipboardData.getData('Text');
                    if (text) {
                        var selStart = element.selectionStart;
                        element.value = element.value.substring(0, element.selectionStart)
                            + text
                            + element.value.substring(element.selectionEnd);
                        element.selectionStart = selStart + text.length;
                        element.selectionEnd = selStart + text.length;
                    }
                    break;
                case 'c':
                    // copy
                case 'x':
                    // copy and delete
                    if (element.selectionStart < element.selectionEnd) {
                        var selStart = element.selectionStart;
                        var text = element.value.substring(element.selectionStart, element.selectionEnd);
                        window.clipboardData.setData('Text', text);
                        if (ev.key != 'x') break;
                        element.value = element.value.substring(0, element.selectionStart)
                            + element.value.substring(element.selectionEnd);
                        element.selectionStart = element.selectionEnd = selStart;
                    } 
                    break;                        
                default:
                    break;
            }
        }
    });
}

// Set handlers for keypresses in specific fields
function addEventHandlers() {
    var forms = document.getElementsByTagName('form');
    for (var f in forms) {
        var elements = forms[f].elements;
        var tabElm = [];
        for (var e in elements) {
            var element = elements[e];
            if (element.tagName && !element.hidden && !element.disabled && element.focus && element.addEventListener) {
                var tagName = element.tagName.toLowerCase();
                if ((tagName == 'input' && element.type.toLowerCase() == 'text')
                    || tagName == 'textarea') {
                    setOnEditKeyPress(element);
                }
                if (tagName == 'input'
                    || tagName == 'select'
                    || tagName == 'textarea'
                    || tagName == 'a'
                    || tagName == 'button'
                ) {
                    tabElm.push(element);
                }
            }
        }
        // tabElm holds the elements that can be navigated with [shift]Tab.
        for (var t in tabElm) {
            var i = parseInt(t);
            var currE = tabElm[i];
            var nextE = tabElm[(i + 1 < tabElm.length) ? i + 1 : 0];
            var prevE = tabElm[(i > 0) ? i - 1 : tabElm.length - 1];
            setOnTabKeyPress(currE, prevE, nextE);
        }
    }
}

// Let addKeyHandlers() be called when the dialog html is loaded.
if (window && window.addEventListener) window.addEventListener('load', addEventHandlers);
