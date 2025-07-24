if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}

function focusSearch() {
    try {
        var thePrompter = utility.newPrompter();
        //__zeigeEigenschaften({'mb': messageBox, 'aw': activeWindow, 'ut': utility});
        application.activeWindow.command("mut bib 1999", false);
        popUpAlert('test', 'hello');
        __zeigeEigenschaften(Array);

        //activeWindow.simulateIBWKey("ID_SET_FOCUS_ON_CMD_LINE");
    } catch (e) {
        messageBox("Fehler", "Konnte den Fokus nicht setzen: " + e, false);
    }
}

function __zeigeEigenschaften(object) {
    var Namen = [];
    var namen = "";
    var type;

    // make a properties list for the prompter
    //for(var name in object) namen += name + "\n";
    for (var name in object) {
        if (object.hasOwnProperty(name)) {
            if (typeof object[name] == "object") {
                Namen.push(name + " (object)");
            } else if (typeof object[name] == "function") {

                Namen.push(name + " (function)");
            } else if (typeof object[name] == "string") {
                Namen.push(name + " (string)");
            }
            else if (typeof object[name] == "number") {
                Namen.push(name + " (number)");
            }
            else if (typeof object[name] == "boolean") {
                Namen.push(name + " (boolean)");

            } else if (typeof object[name] == "undefined") {
                Namen.push(name + " (undefined)");
            }
        } else {
            Namen.push(name);
        }
    }
    // get out if objects count zero prperties
    messageBox("Länge des Objekts", "Das Objekt hat " + Namen.length + " Eigenschaften.", false);
    if (Namen.length == 0) {
        return false;
    }
    Namen.sort();
    namen = Namen.join("\n");

    // initialize the prompter
    var thePrompter = utility.newPrompter();

    // get the selection as string
    var theAnswer = thePrompter.select("Eigenschaften von " + typeof object, "Zeige Eigenschaften von", namen);

    // return if nothing have been selected
    if (!theAnswer) {
        return;
    } else {
        var selectedObject = object[theAnswer.split(" (")[0].trim()]; // Get the corresponding object
        type = typeof selectedObject;
        messageBox("Typ des Objects", type, false);
        if (type == "object") {
            __zeigeEigenschaften(selectedObject);
            return;
        }
        else {
            try {
                messageBox("Eigenschaften", selectedObject.toString(), false);
                __zeigeEigenschaften(object);
            }
            catch (exception) {
                messageBox("Fehler", exception, false);
            }
            finally {
                return;
            }

        }
    }
}


function red_hotline() {
    activeWindow.title.endOfBuffer(false);
    activeWindow.title.insertText('667 $5DE-600');
    activeWindow.title.startOfField(false);
    activeWindow.title.charRight(4, false);
}


function klee_logAP() {

    activeWindow.commandLine = "pica3://appr.ibw0.dnb.de:1040/";

    activeWindow.processURL("pica3://appr.ibw0.dnb.de:1040");
    activeWindow.command("log 6001 ZDBm8sp", false);
    activeWindow.commandLine = "";
}
function klee_logPRValidatia() {

    activeWindow.commandLine = "pica3://ibw0.dnb.de:1042/";

    activeWindow.processURL("pica3://ibw0.dnb.de:1042");
    activeWindow.command("log 6005 buzz", false);
    activeWindow.commandLine = "";
}
function klee_logPR() {

    activeWindow.commandLine = "pica3://ibw0.dnb.de:1042/";

    activeWindow.processURL("pica3://ibw0.dnb.de:1042");
    activeWindow.command("log 6001 ZDBm8sp", false);
    activeWindow.commandLine = "";
}
function klee_logBib() {

    activeWindow.commandLine = "pica3://ibw0.dnb.de:1042/";

    activeWindow.processURL("pica3://ibw0.dnb.de:1042");
    activeWindow.command("log 6099 HMSisil1", false);
    activeWindow.commandLine = "";
}
function klee_logBibAppr() {

    activeWindow.commandLine = "pica3://appr.ibw0.dnb.de:1040/";

    activeWindow.processURL("pica3://appr.ibw0.dnb.de:1040/");
    activeWindow.command("log 6099 HMSisil1", false);
    activeWindow.commandLine = "";
}
function klee_logProdMaster() {

    activeWindow.commandLine = "pica3://ibw0.dnb.de:1042/";

    activeWindow.processURL("pica3://ibw0.dnb.de:1042");
    activeWindow.command("log 6000 zdbm", false);
    activeWindow.commandLine = "";
}
function klee_logAppMaster() {

    activeWindow.commandLine = "pica3://appr.ibw0.dnb.de:1040/";

    activeWindow.processURL("pica3://appr.ibw0.dnb.de:1040");
    activeWindow.command("log 6000 zdbm", false);
    activeWindow.commandLine = "";
}
function klee_logAppValidatia() {

    activeWindow.commandLine = "pica3://appr.ibw0.dnb.de:1040/";

    activeWindow.processURL("pica3://appr.ibw0.dnb.de:1040");
    activeWindow.command("log 6005 buzz", false);
    activeWindow.commandLine = "";
}

function klee_eigenebib() {
    var eigene = getProfileString("zdb.userdata", "eigeneBibliothek", "FEHLER");
    messageBox("Test Eigene Bibliothek", eigene, "e");
}



function klee_status() {
    messageBox('status', activeWindow.status, 'info-icon');
}

function klee_getVTX() {
    var satz = activeWindow.variable("P3VTX");
    satz = satz.replace("<ISBD><TABLE>", "");
    satz = satz.replace("<\/TABLE>", "");
    satz = satz.replace(/<BR>/g, "\n");
    satz = satz.replace(/^$/gm, "");
    satz = satz.replace(/^Eingabe:.*$/gm, "");
    satz = satz.replace(/<a[^<]*>/gm, "");
    satz = satz.replace(/<\/a>/gm, "");
    messageBox('satz', satz, 'e');

}

function klee_datum() {
    var datum = new Date(),
        fy = datum.getFullYear(),
        jahr = fy.toString().substring(2),
        monat = datum.getMonth() + 1,
        tag = datum.getDate() - 1,
        wtag = datum.getDay() - 1,
        arbeitsTag;
    // Sonntag
    if ('0' == wtag) {
        arbeitsTag = tag - 2;
    }

    // Samstag
    if ('6' == wtag) {
        arbeitsTag = tag - 1;
    }

    if (1 > arbeitsTag) {
        datum = new Date(jahr, monat - 1, arbeitsTag);
        tag = datum.getDate();
        monat = datum.getMonth() + 1;
        fy = datum.getFullYear();
        jahr = fy.toString().substring(2);
    }

    var suchstring = ('0' + tag).slice(-2) + '-' + ('0' + (monat)).slice(-2) + '-' + jahr;
    activeWindow.commandLine("f (ser 9005 " + suchstring + " and bbg t?) or (ser 8122 not (bbg tp? or tu? or ts?))");
}

function klee_spar() {
    activeWindow.commandLine = "s ben gru [bib]";
}

function klee_editPar() {
    activeWindow.command("s par", false);
    activeWindow.command("\\MUT \\PAR", false);
    activeWindow.variable("P3VSS") = "-";
    activeWindow.variable("P3VSM") = "BIK";
    activeWindow.simulateIBWKey("FR");
}


function klee_logAndFind() {
    activeWindow.commandLine = "pica3://appr.ibw0.dnb.de:1040/";
    activeWindow.processURL("pica3://appr.ibw0.dnb.de:1040");
    activeWindow.command("log 6001 ZDBm8sp", false);
    activeWindow.command("f tit cinema", false);
    //activeWindow.command("k", false);
    //zdb_Erscheinungsverlauf();
}

function klee_logAndImport() {
    activeWindow.commandLine = "pica3://appr.ibw0.dnb.de:1040/";
    activeWindow.processURL("pica3://appr.ibw0.dnb.de:1040");
    activeWindow.command("log 6001 ZDBm8sp", false);
    zdb_csvImportTemplate();

}




/**
 * Recursively serializes data (arrays, objects, or primitive types) into a string.
 * Arrays are joined with '@@@'. Objects are converted to key:::value pairs,
 * also joined with '@@@'.  Nested arrays and objects are recursively serialized.
 * Primitive types are converted to strings.  Avoids circular references.
 *
 * @param {any} data The data to serialize.
 * @param {Array} [seen=[]] An array to track visited objects to prevent circular references.
 * @returns {string} The serialized string representation of the data.
 */
function __zdb_serialize_recursive(data, seen) {
    seen = seen || [];

    if (typeof data === 'object' && data !== null) {
        if (Array.indexOf(data, seen) !== -1) {
            return "[Circular Reference]"; // Prevent circular references
        }
        seen.push(data);
    }

    if (Array.isArray(data)) {
        var serializedElements = [];
        for (var i = 0; i < data.length; i++) {
            serializedElements.push('A:' + __zdb_serialize_recursive(data[i], seen)); // Prefix 'A:' for arrays
        }
        return serializedElements.join('@@@');
    } else if (typeof data === 'object' && data !== null) {
        var result = [];
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                result.push('O:' + key + ':::' + __zdb_serialize_recursive(data[key], seen)); // Prefix 'O:' for objects
            }
        }
        return result.join('@@@');
    } else {
        return 'P:' + String(data); // Prefix 'P:' for primitive types
    }
}