if (Array.isArray == null) {
    Array.isArray = function (arr) {
        return Object.prototype.toString.call(arr) === "[object Array]";
    };
}

if (!Array.prototype.indexOf) {
    Array.indexOf = function (searchElement, fromIndex) {
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
    if (false == __zdbCheckScreen(['MT', 'IT', 'IE'], 'AutomatischeSuchBox')) return false;
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

function zdb_Erscheinungsverlauf() {
    showDialog('ProfD\\Dialogs_zdb\\ZDB_dialogErscheinungsverlauf.html', 400, 100, 600, 500);
}

function __zdbGet4024() {
    var feld4024 = application.activeWindow.title.findTag('4024', 0, false, true, false);
    utility.sentDataToDialog(feld4024);
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

function zdb_csvImportTemplate() {
    showDialog('H:\\WinIBW4\\Files\\Dialogs_zdb\\ZDB_dialogCsvImportTemplate.html', 400, 100, 500, 500);
}

function __getDatenmaskenPath() {
    if (application.activeWindow.getVariable("system") != "ZENTRALKATALOG" && application.activeWindow.getVariable("system") != "ILTIS-APPROVAL") {
        alert(application.activeWindow.getVariable("system"));
        return "datenmasken_kxp";
    }
    return "datenmasken_zdb";
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