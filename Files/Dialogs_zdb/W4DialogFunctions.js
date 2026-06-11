//=============================================================================
// Internal helper functions (must be defined before use)
//=============================================================================

/**
 * Validates that data is a non-empty string
 */
const isValidString = (data) => typeof data === 'string' && data !== "";

/**
 * Checks if data is a string (empty or non-empty)
 */
const isString = (data) => typeof data === 'string';

/**
 * Executes a script with automatic form data collection and returns a Promise
 */
const executeScript = (scriptName) => {
    try {    
            const theScriptName = scriptName.endsWith('()') ? scriptName : (() => {
            const form = document.forms[0];            
            let o = '';

            for (let i = 0; i < form.elements.length; i++) {
                const e = form.elements[i];

                switch (e.nodeName.toLowerCase()) {
                    case 'input':
                    case 'select':
                    case 'textarea': break;
                    default: continue;
                }

                // WIN4-1530 - backwards compatiblity: radio buttons identified by name, other primarily by id
                const key = e.type === 'radio' ? e.name : (e.id || e.name);
                if (!key) continue;

                const eltType = e.type ? e.type.toLowerCase() : '';
                let value;

                switch (eltType) {
                    case 'checkbox': value = e.checked.toString();
                        break;
                    case 'radio': if (!e.checked) continue;
                    // FALLTHROUGH
                    default:
                        if (e.value === null || e.value === undefined) {
                            value = '';
                        } else {
                            value = e.value.replace(/"/g, '\\"');
                        }
                } 
                
                if(o !== '') o += ',';
                // add "key":"value"
                o += `"${key}":"${value}"`;
            }  
            
            o = '{' + o + '}';

            if (form.id) {
                // Save the form contents for next time the dialog is used
                W4DialogAPI.PutVar(`dialog-form-${form.id}`, `(${o})`);
            }

            return `${scriptName}(${o})`;
        })();
        
        return new Promise((resolve, reject) => {
            W4DialogAPI.ExeScript(theScriptName, (result) => {
                if (result === null || result === undefined) {
                    reject(new Error(`Script function '${scriptName}' not found or failed`));
                } else {
                    resolve(result);
                }
            });
        });

    } catch (error) {
        return Promise.reject(error);
    }
};

//=============================================================================
// W4DialogAPI setup functions (must be defined before public API functions)
// This module provides an unified JavaScript API for communicating with WinIBW4 C++ code
// through WebView2's postMessage interface.
// No need for users to understand them.
//
// Architecture:
// 1. Low-level functions (W4DialogFunctionCall*) - handle WebView2 messaging
// 2. The API (W4DialogAPI.*) - convenient methods for each function
// 3. Callback management - tracks async results from WinIBW4 C++ code
//=============================================================================
const W4DialogFunctionCollection = ["CloseDialog",
                                    "ExeScript",
                                    "GetFullTableContent",
                                    "GetProfileValue",
                                    "GetTableFileNameList",
                                    "GetValueOfVariable",
                                    "NumCode",
                                    "SendCommandToCBS",
                                    "TableData",
                                    "TransliterateData",
                                    "PutVar",
                                    "WriteProfileValue"];

window.W4DialogAPI = {};

// Use a Map to store multiple pending callbacks
window.pendingCallbacks = new Map();
let callbackIdCounter = 0;

/**
 * Sends a message to WinIBW4 C++ code without expecting a result
 */
const W4DialogFunctionCall = (funcName, params = []) => {
    if (window.chrome?.webview) {
        window.chrome.webview.postMessage({
            funcName,
            params
        });
    } else {
        console.error("W4DialogFunctionCall failed: WebView2 not available. Function:", funcName);
    }
};

/**
 * Sends a message to WinIBW4 C++ code and handles async result via callback
 */
const W4DialogFunctionCallWithResult = (funcName, params = [], callback = null) => {
    const callbackId = callback ? (() => {
        const id = ++callbackIdCounter;
        window.pendingCallbacks.set(id, callback);
        return id;
    })() : null;

    if (window.chrome?.webview) {
        window.chrome.webview.postMessage({
            funcName,
            params,
            callbackId // Send the callback ID to WinIBW4 C++
        });
    } else {
        console.error("W4DialogFunctionCallWithResult failed: WebView2 not available. Function:", funcName);
        if (callback) callback("WebView2 not available", null);
    }
};

/**
 * Handles async callback execution when results arrive from WinIBW4 C++ code
 */
const executeCallback = (callbackId, error, result) => {
    const numericCallbackId = typeof callbackId === 'string' ? parseInt(callbackId) : callbackId;
    if (numericCallbackId && window.pendingCallbacks.has(numericCallbackId)) {
        const callback = window.pendingCallbacks.get(numericCallbackId);
        window.pendingCallbacks.delete(numericCallbackId);
        callback(error, result);
    }
};

/**
 * Called by WinIBW4 C++ code to deliver successful results
 */
window.handleW4Result = (result, callbackId) => executeCallback(callbackId, null, result);

/**
 * Called by WinIBW4 C++ code to deliver error results
 */
window.handleW4Error = (error, callbackId) => executeCallback(callbackId, error, null);

/**
 * Process all functions in W4DialogFunctionCollection
 */
W4DialogFunctionCollection.forEach(funcName => {
    W4DialogAPI[funcName] = (...args) => {
        const lastArg = args.at(-1);
        if (args.length && typeof lastArg === 'function') {
            const callback = args.pop();
            const params = args;

            W4DialogFunctionCallWithResult(funcName, params, (error, result) => {
                !error && callback(result);
            });
        } else {
            W4DialogFunctionCall(funcName, args);
        }
    };
});

//=============================================================================
// Public API functions
//=============================================================================
/*
 * The following functions in this file can be used in HTML-dialogs in WinIBW4 to communicate with WinIBW4:
 * runScript(scriptName) 
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

/**
 * Runs a loaded script-function from dialog with automatic form data collection.
 * 
 * If the script function name ends with '()', use it as: runScript('sfName()')
 * If the script function expects an object parameter, use it as: runScript('sfName')
 * 
 * @param {string} scriptName - Name of the script function to execute
 * @returns {Promise<*>} A Promise that resolves with the script's return value or rejects on error
 * 
 * @example
 * // For a script function: function callback_1() {...}
 * runScript("callback_1()");
 * 
 * @example
 * // For a script function: function callback_2(o) {...}
 * runScript("callback_2"); // Form data automatically collected and passed as object
 * 
 * @example
 * // Getting return values (use utility.sentDataToDialog(value) in script)
 * const result = await runScript("callback_1()");
 * 
 * @example
 * // Getting return values (use utility.sentDataToDialog(value) in script)
 * const result = await runScript("callback_2");
 */
const runScript = (scriptName) =>
    !isValidString(scriptName)
        ? Promise.reject(new Error(`Error: incorrect parameters at calling 'runScript' in the dialog:\n${scriptName}`))
        : executeScript(scriptName);

/**
 * Sends a command to CBS (either background or front-end)
 * 
 * @param {string} cmd - The command to be sent to CBS (must be a valid string)
 * @param {boolean} [backGround=false] - Whether to send the command in background mode
 * @returns {Promise<*>} A Promise that resolves with the command result on success, 
 *                       or rejects with an Error on failure or invalid parameters
 * @throws {Error} Throws "Invalid parameters" when cmd is invalid or backGround is not boolean
 * @throws {Error} Throws "sendCommandToCBS failed" when the CBS command execution fails 
 */
const sendCommandToCBS = (cmd, backGround = false) => {
    if (!isValidString(cmd) || typeof backGround !== 'boolean') {
        return Promise.reject(new Error(`Error: incorrect parameters at calling 'sendCommandToCBS' in the dialog:\n${cmd}\n${backGround}`));
    }

    return new Promise((resolve, reject) => {
        W4DialogAPI.SendCommandToCBS(cmd, backGround, (result) => {
            result ? resolve(result) : reject(new Error(`CBS command failed: "${cmd}" (background: ${backGround})`));
        });
    });
};

/**
 * Gets the value of the given variable, such as "P3GPP", "P3VAH", "P3VBK"
 * 
 * @param {string} variableName - The name of the variable to retrieve (must be a valid string)
 * @returns {Promise<string>} A Promise that resolves with the variable value (may be empty string),
 *                            or rejects with an Error if parameters are invalid
 * @throws {Error} Throws "Invalid variable name" when variableName is not a valid string
 */
const getValueOfVariable = (variableName) => {
    if (!isValidString(variableName)) {
        return Promise.reject(new Error(`Error: incorrect parameters '${variableName}' at calling 'getValueOfVariable' in the dialog`));              
    }

    return new Promise((resolve) => {
        W4DialogAPI.GetValueOfVariable(variableName, (result) => resolve(result ?? ""));
    });
};

/**
 * Stores the value of entry as int in the WinIBW4 preferences for the key Section for the current user.
 * The value is set to 0 if value is NaN, where NaN = parseInt(non-digit-string), e.g. parseInt("").
 * 
 * Preference file location: C:\Users\USERNAME\AppData\Roaming\OCLC\WinIBW4\Prefs\user_Prefs.txt
 * Format: section.entry = value (or 0 if NaN)
 *
 * @param {string} section - The section name for the preference (must be non-empty string)
 * @param {string} entry - The entry name within the section (must be non-empty string)
 * @param {number} value - The integer value to store (NaN values will be converted to 0)
 * @returns {Promise<boolean>} A Promise that resolves with true on success, or rejects with an Error on failure
 * @throws {Error} Throws "Invalid parameters" when section/entry are invalid or value is not a number
 * @throws {Error} Throws "writeProfileInt failed" when the preference write operation fails
 */
const writeProfileInt = (section, entry, value) => {
    if (!isValidString(section) || !isValidString(entry) || typeof value !== 'number') {
        return Promise.reject(new Error(`Error: incorrect parameters '${section}', '${entry}', '${value}' at calling 'writeProfileInt' in the dialog`));        
    }

    const normalizedValue = isNaN(value) ? 0 : value;

    return new Promise((resolve, reject) => {
        W4DialogAPI.WriteProfileValue(section, entry, normalizedValue, (result) => {
            result ? resolve(result) : reject(new Error("writeProfileInt failed"));
        });
    });
};

/**
 * Retrieves the value of entry as int from the WinIBW4 preferences from the key Section for the current user.
 * 
 * Preference file location: C:\Users\USERNAME\AppData\Roaming\OCLC\WinIBW4\Prefs\user_Prefs.txt
 * If the section.entry preference is not present or the value is not a number, defaultValue is returned.
 * 
 * @param {string} section - The section name for the preference (must be non-empty string)
 * @param {string} entry - The entry name within the section (must be non-empty string)
 * @param {number} defaultValue - The default value to return if preference not found (must be a number)
 * @returns {Promise<number>} A Promise that resolves with the preference value or defaultValue
 * @throws {Error} Throws "Invalid parameters" when section/entry are invalid or defaultValue is string/boolean
 */
const getProfileInt = (section, entry, defaultValue) => {
    if (!isValidString(section) || !isValidString(entry) ||
        typeof defaultValue !== 'number' || isNaN(defaultValue)) {
        return Promise.reject(new Error(`Error: incorrect parameters '${section}', '${entry}', '${defaultValue}' at calling 'getProfileInt' in the dialog`));
    }

    return new Promise((resolve) => {
        W4DialogAPI.GetProfileValue(section, entry, defaultValue, (result) => resolve(result ?? defaultValue));
    });
};

/**
 * Stores the value of entry as string in the WinIBW4 preferences for the key Section for the current user.
 * An empty string for value is valid.
 * 
 * Preference file location: C:\Users\USERNAME\AppData\Roaming\OCLC\WinIBW4\Prefs\user_Prefs.txt
 * Format: section.entry = value (or empty if value is "")
 *
 * @param {string} section - The section name for the preference (must be non-empty string)
 * @param {string} entry - The entry name within the section (must be non-empty string)  
 * @param {string} value - The string value to store (can be empty string)
 * @returns {Promise<boolean>} A Promise that resolves with true on success, or rejects with an Error on failure
 * @throws {Error} Throws "Invalid parameters" when section/entry are invalid or value is not a string
 * @throws {Error} Throws "writeProfileString failed" when the preference write operation fails
 */
const writeProfileString = (section, entry, value) => {
    if (!isValidString(section) || !isValidString(entry) || !isString(value)) {
        return Promise.reject(new Error(`Error: incorrect parameters at calling 'writeProfileString' in the dialog : \n${section}\n${entry}\n${value}`));
    }

    return new Promise((resolve, reject) => {
        W4DialogAPI.WriteProfileValue(section, entry, value, (result) => {
            result ? resolve(result) : reject(new Error("writeProfileString failed"));
        });
    });
};

/**
 * Retrieves the value of entry as string from the WinIBW4 preferences from the key Section for the current user.
 * 
 * Preference file location: C:\Users\USERNAME\AppData\Roaming\OCLC\WinIBW4\Prefs\user_Prefs.txt
 * If the section.entry preference is not present, defaultValue is returned.
 *
 * @param {string} section - The section name for the preference (must be non-empty string)
 * @param {string} entry - The entry name within the section (must be non-empty string)
 * @param {string} defaultValue - The default value to return if preference not found (can be empty string)
 * @returns {Promise<string>} A Promise that resolves with the preference value or defaultValue
 * @throws {Error} Throws "Invalid parameters" when section/entry are invalid or defaultValue is not a string
 */
const getProfileString = (section, entry, defaultValue) => {
    if (!isValidString(section) || !isValidString(entry) || !isString(defaultValue)) {
        return Promise.reject(new Error(`Error: incorrect parameters at calling 'getProfileString' in the dialog : \n${section}\n${entry}\n${defaultValue}`));
    }

    return new Promise((resolve) => {
        W4DialogAPI.GetProfileValue(section, entry, defaultValue, (result) => resolve(result ?? defaultValue));
    });
};

/**
 * Closes the HTML dialog
 */
const closeDialog = () => W4DialogAPI.CloseDialog();

/**
 * Converts a callback-based function to a Promise-based function.
 * Takes a function that expects a callback as its last parameter and returns
 * a new function that returns a Promise instead.
 * 
 * @param {Function} fn - The callback-based function to promisify (callback must be last parameter)
 * @returns {Function} A new function that returns a Promise
 * 
 * @example
 * // Basic usage: promisify a W4DialogAPI function
 * const numCodeAsync = promisify(W4DialogAPI.NumCode);
 * const result = await numCodeAsync(); 
 * 
 * @example
 * // Promisify multiple functions
 * const getTableFileNameListAsync = promisify(W4DialogAPI.GetTableFileNameList);
 * const getFullTableContentAsync = promisify(W4DialogAPI.GetFullTableContent);
 * const tableDataAsync = promisify(W4DialogAPI.TableData);
 */
const promisify = (fn) => (...args) =>
    new Promise((resolve) => {
        fn(...args, resolve);
    });