if (typeof Array.isArray !== 'function') {
    Array.isArray = function (arr) {
        return Object.prototype.toString.call(arr) === "[object Array]";
    };
}

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement, fromIndex) {
        var k;
        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }
        var o = Object(this);
        var len = o.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = fromIndex | 0;
        if (n >= len) {
            return -1;
        }
        k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
        while (k < len) {
            if (k in o && o[k] === searchElement) {
                return k;
            }
            k++;
        }
        return -1;
    };
}

function GetScriptEngineInfo() {
    var s;
    s = ""; // Build string with necessary info.
    s += ScriptEngine() + " Version ";
    s += ScriptEngineMajorVersion() + ".";
    s += ScriptEngineMinorVersion() + ".";
    s += ScriptEngineBuildVersion();
    alert(s);
}


function zdb_AutomatischeSuchBox() {
    if (false == ZDB._checkScreen(['MT', 'IT', 'IE'], 'AutomatischeSuchBox')) return false;
    anfangsfenster = application.activeWindow.windowID; // globale Variable, die vom Skript HoleIDN verwendet wird
    showDialog('ProfD\\Dialogs_zdb\\ZDB_AutomatischeSuchBox.html');
    return true;
}

function zdb_BibliothekDefinieren() {
    showDialog('ProfD\\Dialogs_zdb\\ZDB_dialogBibliothekDefinieren.html');
}

function zdb_DigiConfig() {
    showDialog('ProfD\\Dialogs_zdb\\ZDB_dialogDigitalisierungConfig.html', 400, 100, 400, 500);
}



function zdb_csvImportTemplate() {
    if (false == ZDB._checkScreen(['8A', '7A', 'IT', 'IE'], 'AutomatischeSuchBox')) return false;
    showDialog('ProfD\\Dialogs_zdb\\ZDB_dialogCsvImportTemplate.html', 400, 100, 500, 500);
}

function __zdb_csvImportTemplate_load(dir) {
    try {
        var arNames = [];
        var theDir = getSpecialDirectory("ProfD");
        theDir.append(dir);
        if (theDir.exists()) {
            var theDirEnum = theDir.directoryEntries;
            while (theDirEnum.hasMoreElements()) {
                var theItem = theDirEnum.getNext();
                if (theItem.isFile()) {
                    var found,
                        i;
                    for (found = false, i = 0; (i < arNames.length) && !found; i++) {
                        found = (arNames[i] == theItem.leafName);
                    }
                    if (!found) {
                        arNames.push(theItem.leafName);
                    }
                }
            }
        }
        return arNames.sort();
    } catch (e) { alert('LoadFiles: ' + e.name + ': ' + e.message); }
}

function __zdb_csvImportTemplate_loadDatenmasken() {
    utility.sentDataToDialog(__zdb_csvImportTemplate_load("datenmasken_eigene").join('@@@'));
}
function __zdb_csvImportTemplate_loadCsv() {
    utility.sentDataToDialog(__zdb_csvImportTemplate_load('csv').join('@@@'));
}

function __zdb_csvImportTemplate_runImport(o) {
    var theFileInput = utility.newFileInput(),
        norm = '',
        counter = 1,
        header,
        template,
        csv = new CSV();

    var paths = [
        "\\datenmasken_eigene\\",
        "\\datenmasken_kxp\\",
        "\\datenmasken_zdb\\"
    ];
    var found = false;
    for (var i = 0; i < paths.length; i++) {
        if (theFileInput.openSpecial("ProfD", paths[i] + o.idFileListdatenmasken)) {
            found = true;
            break;
        }
    }
    if (!found) {
        alert("Datei " + o.idFileListdatenmasken + " wurde nicht gefunden.");
        return;
    }
    for (template = ""; !theFileInput.isEOF();) {
        template += theFileInput.readLine() + "\n"
    }
    theFileInput.close();

    var importer = function () {
        var fillTemplate = function (template, line) {
            //__zeigeEigenschaften(line);
            for (var col in line) {
                if (!line.hasOwnProperty(col)) continue;
                if ('' == col) continue;
                var re = new RegExp('\\{([^{]*?)@' + col.replace('$', '\\$') + '@([^{]*?)}|\\{' + col.replace('$', '\\$') + '}', "g");
                if ('' == line[col]) {
                    template = template.replace(re, "");
                } else {
                    template = template.replace(re, "$1" + line[col] + "$2");
                }
            }
            return template;
        };
        activeWindow.command("e" + norm, false);
        csv.line['##'] = counter++;
        activeWindow.title.insertText(fillTemplate(template, csv.line));
        if ('false' == o.idCheckboxTest) csv.__csvSaveBuffer(true, 'Importiere Template mit Zähler ' + counter);
    };


    csv.csvFilename = o.idFileListcsv;
    csv.delimiter = ('t' == o.separator) ? "\t" : o.separator;
    csv.startLine = o.start || 2;
    if ('true' == o.idCheckboxTest) {
        csv.endLine = csv.startLine;
    }
    norm = ('true' == o.idCheckboxNorm) ? ' n' : '';
    counter = o.counter;
    header = csv.__csvGetHeader();
    csv.__csvSetProperties(importer, header, '', false, false, false, 'LOG_isil_import.txt');
    csv.__csvAPI();
}

function __zdbGetScr(){
    utility.sentDataToDialog(activeWindow.getVariable('scr'));
}


/**
 * Read the contents of a file (line by line) and send the resulting text to a dialog.
 *
 * The function attempts to open a file using utility.newFileInput().openSpecial(dir, "\\" + path).
 * If the file cannot be opened, utility.sentDataToDialog(false) is invoked and the function returns.
 * When opened successfully, the file is read line-by-line. Lines may be conditionally skipped:
 * - lines starting with "//" can be skipped if o.zdbNoComments is truthy,
 * - blank lines can be skipped if o.zdbNoBlanks is truthy.
 * After processing the lines the collected content is delivered via utility.sentDataToDialog(inhalt).
 *
 * Note: This comment documents the intended behavior of the implementation. The current source
 * contains a few implementation issues that affect behavior (for example: duplicate variable
 * declarations overwrite flags, a referenced noBlanksFlag identifier is not defined, and the
 * collected content variable may not be appended to). Those issues should be resolved in code
 * for the function to behave as described here.
 *
 * @param {Object} o - Options object controlling file selection and filtering.
 * @param {string} o.theDir - Directory (special/open context) used by openSpecial.
 * @param {string} o.thePath - Relative path or filename to open (will be prefixed with a backslash).
 * @param {boolean} [o.zdbNoComments=false] - If true, skip lines that begin with "//".
 * @param {boolean} [o.zdbNoBlanks=false] - If true, skip blank/empty lines.
 *
 * @returns {void} This function does not return a value. On success it calls utility.sentDataToDialog(inhalt)
 *                   where inhalt is the concatenated/processed file content; on open failure it calls
 *                   utility.sentDataToDialog(false).
 *
 * @throws {Error} No explicit exceptions are thrown by this function in normal operation; underlying
 *                 utility methods may raise errors depending on their implementations.
 */
function __zdbGetFileContent(o) {
    var dir = o.theDir,
        path = o.thePath,
        noCommentsFlag = o.zdbNoComments,
        noBlanksFlag = o.zdbNoBlanks,
        zeile = '',
        inhalt = '',
        defInpFile = utility.newFileInput();

    if (!defInpFile.openSpecial(dir, "\\" + path)) {
        utility.sentDataToDialog(false);
        return;
    }
    for (zeile = ""; !defInpFile.isEOF();) {
        zeile = defInpFile.readLine();
        if (noCommentsFlag && zeile.substring(0, 2) === "//") {
            continue;
        }
        // filter blank lines (preserve existing behaviour or conditionalize if needed)
        if (noBlanksFlag) {
            if (zeile.length === 0) continue;
        } else {
            // original behaviour previously skipped blanks unconditionally; keep that
            if (zeile.length === 0) continue;
        }
        inhalt += zeile + "\n";
    }
    utility.sentDataToDialog(inhalt);
}

function zdb_Erscheinungsverlauf() {
    if (false === ZDB._checkScreen(['MT', 'IT', 'IE'], 'Erscheinungsverlauf')) return false;
    showDialog('ProfD\\Dialogs_zdb\\ZDB_dialogErscheinungsverlauf.html', 400, 100, 500, 400);
}

function __zdbGet4024() {
    var strScreen = ZDB._checkScreen(['MT', 'IT'], '__zdbGet4024');
    if (!strScreen) {
        utility.sentDataToDialog(false);
    } else {
        utility.sentDataToDialog(application.activeWindow.title.findTag('4024', 0, false, true, false));
    }
}

function __zdb_paste4024(o) {
    //__zeigeEigenschaften(o);
    var bb, bj, bh, bm, bt, eb, ej, eh, em, et, feld4024, _feld4024 = [];
    for (var g = 0; g <= o.count; g++) {
        feld4024 = "";
        bb = "";
        bj = "";
        bh = "";
        bm = "";
        bt = "";
        eb = "";
        ej = "";
        eh = "";
        em = "";
        et = "";
        if ("" !== (bb = o['bb' + g])) {
            feld4024 += "$d" + bb;
        }
        if ("" !== (bh = o['bh' + g])) {
            feld4024 += "$e" + bh;
        }
        if ("" !== (bt = o['bt' + g])) {
            feld4024 += "$b" + bt;
        }
        if ("" !== (bm = o['bm' + g])) {
            feld4024 += "$c" + bm;
        }
        if ("" !== (bj = o['bj' + g])) {
            feld4024 += "$j" + bj;
        }
        if ("" !== (eb = o['eb' + g])) {
            feld4024 += "$n" + eb;
        }
        if ("" !== (eh = o['eh' + g])) {
            feld4024 += "$o" + eh;
        }
        if ("" !== (et = o['et' + g])) {
            feld4024 += "$l" + et;
        }
        if ("" !== (em = o['em' + g])) {
            feld4024 += "$m" + em;
        }
        if ("" !== (ej = o['ej' + g])) {
            feld4024 += "$k" + ej;
        }
        if ("" !== feld4024) _feld4024.push(feld4024);
    }
    // Simulated title field operations:
    var titleField = activeWindow.title;
    var current4024 = titleField.findTag ? titleField.findTag('4024', 0, true, true, false) : "";
    if ("" !== current4024) {
        titleField.deleteLine(1);
    } else {
        titleField.endOfField(false);
        titleField.insertText("\n");
    }
    titleField.insertText('4024 ' + _feld4024.join('$0;'));
    if ('true' == o.lfd) {
        var ende = _feld4024[_feld4024.length - 1];
        if (ende.match(/\$o|\$l|\$m|\$n|\$k/)) {
            alert("Da ein Wert in der letzten Endgruppe vorhanden ist, wird die Angabe 'laufend' ignoriert.");
            titleField.insertText("\n");
        } else {
            titleField.insertText("$6-\n");
        }
    } else {
        titleField.insertText("\n");
    }
    return true;
}

