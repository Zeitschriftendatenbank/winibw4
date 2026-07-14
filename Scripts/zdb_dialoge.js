function zdb_AutomatischeSuchBox() {
    if (false == ZDB.checkScreen(['MT', 'IT', 'IE'], 'AutomatischeSuchBox')) return false;
    ZDB.anfangsfenster = activeWindow.windowID; // globale Variable, die vom Skript HoleIDN verwendet wird
    showDialog('ProfD\\Dialogs_zdb\\ZDB_AutomatischeSuchBox.html', 200, 200, 400, 400, 'Automatische Suchbox');
    return true;
}

function __zdbAutomatischeSuchboxSearch(o) {
    var searchString = o && typeof o.searchString === 'string' ? o.searchString : '';
    // opens results in new window, so no need to check for screen type here
    activeWindow.command('f ' + searchString, true);
    utility.sentDataToDialog(activeWindow.receivedMessageOnly !== true);
}

function zdb_BibliothekDefinieren() {
    showDialog('ProfD\\Dialogs_zdb\\ZDB_dialogBibliothekDefinieren.html', 200, 200, 500, 400,'Eigene Bibliothek definieren');
}

function zdb_DigiConfig() {
    showDialog('ProfD\\Dialogs_zdb\\ZDB_dialogDigitalisierungConfig.html', 200, 200, 600, 500, 'Digitalisierungs-Config');
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
    if (false === ZDB.checkScreen(['MT', 'IT', 'IE'], 'Erscheinungsverlauf')) return false;
    try {
        showDialog('ProfD\\Dialogs_zdb\\ZDB_dialogErscheinungsverlauf.html', 200, 200, 500, 400);
    } catch (error) {
        alert('Error showing dialog: ' + (error && error.message ? error.message : String(error)));
    }
}

function __zdbGet4024() {
    var strScreen = ZDB.checkScreen(['MT', 'IT'], '__zdbGet4024');
    if (!strScreen) {
        utility.sentDataToDialog(false);
    } else {
        var f4024 = activeWindow.title.findTag('4024', 0, false, true, false);
        utility.sentDataToDialog(f4024);
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

