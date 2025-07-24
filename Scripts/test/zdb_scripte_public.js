// Datei: zdb_scripte_public.js
// WinIBW-Version ab 4

/**
* ZDB globale Variablen
*/
// auto Suchbox
var zdb_anfangsfenster;
// delimiter
var zdb_delimiter = '\u0192'; // Unterfeldzeichen 'ƒ' = \u0192
var zdb_delimiterReg = '\u0192'; // regualr expression version Unterfeldzeichen '$' = \$
var zdb_charCode = 402; // Unterfeldzeichen 'ƒ' = 402, Unterfeldzeichen '$' = 36

function zdb_merkeZDB(){
    application.activeWindow.clipboard = __zdbGetZDB();
}

function zdb_ILTISseiten(){
    application.shellExecute ('https://wiki.dnb.de/display/ILTIS/ILTIS-Handbuch', 'open', '');
}

function zdb_openWinibwInfo() {
    application.shellExecute("http://www.zeitschriftendatenbank.de/erschliessung/winibw", "open", "");
}

function zdb_openWinibwSupport() {
    application.shellExecute("mailto:zdb-winibw@sbb.spk-berlin.de?subject=[WinIBW 4.5] ", "open", "");
}

function zdb_openFormat() {
    if (!application.activeWindow.title) {
        application.shellExecute("https://www.zeitschriftendatenbank.de/erschliessung/zdb-format/", "open", "");
    }
    else {
        application.shellExecute("https://www.zeitschriftendatenbank.de/erschliessung/zdb-format/" + application.activeWindow.title.tag, "open", "");
    }
}

function zdb_MerkeIDN(){
    if(!__zdbCheckScreen(['8A','7A','MT','IT'],'Merke IDN')) return false;
    var idn = application.activeWindow.variable('P3GPP'),
    idn_formatiert = '!' + idn + '!';
    application.activeWindow.clipboard = idn_formatiert;
}

function zdb_BibliothekDefinieren(){
    showDialog('ProfD\\Dialogs\\ZDB_dialogBibliothekDefinieren.html');
}

function zdb_DigiConfig(){
    showDialog('ProfD\\Dialogs\\ZDB_dialogDigitalisierungConfig.html', 100,100,400,500);
}

function zdb_Erscheinungsverlauf(){
    if(!__zdbCheckScreen(['MT','IT'],'Erscheinungsverlauf')) return;
    showDialog('ProfD\\Dialogs\\ZDB_Erscheinungsverlauf.html', null);
}

function zdb_idListe() {
    var set = new SET(),
        t,
        allezdb = [];

        while (t = set.nextTit()) {
            allezdb[t] = __zdbGetZDB();
        }
        application.activeWindow.clipboard = allezdb.join("\r\n");
        application.messageBox ("ZDB-ID-Liste", "Alle ZDB-IDs wurden eingesammelt und in den " +
            "Zwischenspeicher geschrieben. \nSie können die ZDB-IDs jetzt mit dem Shortcut Strg+v " +
            "in eine Datei einfügen.", "message-icon");
}

/**
 * Kategorie 'EXXX x' wird automatisch befüllt
 * @param string content
 * @param function|undefined callback
 */
function __zdbExemplarErfassen(content, callback) {
    var exNum = __zdbEXXX();
    if (!__zdbCheckScreen(['MT', 'IE'])) {
        application.activeWindow.command('e ' + exNum, false);
    }
    // Exemplarsatz anlegen und befüllen
    application.activeWindow.title.insertText(exNum + " x\n" + content);
    if (typeof callback !== 'undefined') {
        callback();
    }
    return exNum;
}

/**
 * Gibt ein Array von genutzten Exemplarnummern zurück
 * @returns array Genutzte Exemplarnummern
 */
function __zdbExemplarNummern() {
    application.activeWindow.command('show d', false);
    var found = (application.activeWindow.getVariable('P3CLIP')).match(/\n(E\d\d\d)/g);
    found.sort();
    for (var i = 0; i < found.length; i += 1) {
        if ('0' == found[i][3]) {
            found[i] = found[i].substring(4);
        } else {
            found[i] = found[i].substring(3);
        }
    }
    return found;
}

function __zdbEXXX() {
    var record;
    if(__zdbCheckScreen(['MT'])){
        application.activeWindow.title.selectAll();
        record = application.activeWindow.title.selection;
        application.activeWindow.title.selectNone();
    } else {
        record = application.activeWindow.getVariable('P3CLIP');
    }
    for (var i = 1; i <= 999; i += 1) {
        num = "E" + ("000" + i).slice(-3);
        if ('' != record) {
            if (record.indexOf(num) == -1) {
                return num;
            }
        } else {
            if (!application.activeWindow.title.find("\n" + num, true, false, true)) {
                return num;
            }
        }
    }
}

function zdb_MailboxsatzAnlegen(){
    var ppn;
    application.overwriteMode = false;
    ppn = application.activeWindow.variable('P3GPP');
    application.activeWindow.command('ein t', false);
    if (application.activeWindow.status != 'OK') {
        application.messageBox('MailboxsatzAnlegen', 'Sie haben nicht die nötigen Berechtigungen, um einen Mailboxsatz anzulegen.', 'alert-icon');
        return false;
    }
    application.activeWindow.title.insertText (
            "0500 am\n"
            + '8900 !' + ppn + "!\n"
            + "8901 \n"
            + '8902 ');
    application.activeWindow.title.startOfBuffer(false);
    application.activeWindow.title.lineDown(2, false);
    application.activeWindow.title.charRight(5, false);
}

function zdb_AutomatischeSuchBox(){
    if(false == __zdbCheckScreen(['MT','IT','IE'],'AutomatischeSuchBox')) return false;
    zdb_anfangsfenster = application.activeWindow.windowID; // globale Variable, die vom Skript HoleIDN verwendet wird
    showDialog('ProfD\\Dialogs\\ZDB_AutomatischeSuchBox.html');
    return true;
}

function zdb_HoleIDN(){
    // Wurde vorab eine Suche mit dem Skript 'Automatische Suchbox' ausgeführt?
    if (typeof zdb_anfangsfenster == 'undefined') {
        application.messageBox('HoleIDN', 'Vor Aufruf des Skriptes "HoleIDN" muss zunächst eine automatische Suche mit Hilfe des Skriptes "AutomatischeSuchBox" gestartet werden.', 'alert-icon');
    } else {
        // Ist das aktive Fenster eine Trefferliste?
        if(false == __zdbCheckScreen(['7A','8A'],'HoleIDN')) return false;
        //  IDN des markierten Titels aus der Trefferliste ermitteln
        var idn = application.activeWindow.variable('P3GPP');
        // ID des aktiven Fensters ermitteln
        var fenster = application.activeWindow.windowID;
        // Falls das Bearbeitungsfenster ( = anfangsfenster) geschlossen wurde, gibt das System einen 'uncaught exception'-Fehler aus. Um diesen abzufangen, wird mit TRY CATCH gearbeitet.
        try {
            // Zurück zum Anfangsfenster gehen
            application.activateWindow(zdb_anfangsfenster);
            // IDN einfügen
            application.activeWindow.title.insertText('!' + idn + '!');
            // Trefferliste schließen
            application.closeWindow(fenster);
        } catch(e) {
            application.messageBox('HoleIDN', 'Das Bearbeitungsfenster, in welches die IDN eingefügt werden soll, ist nicht mehr geöffnet.', 'alert-icon');
        }
    }
    return true;
}


function zdb_alleinbesitz() {
    var eigene_bibliothek =  application.getProfileString('zdb.userdata', 'eigeneBibliothek', '');
    if('' == eigene_bibliothek) {
        if(__zdbYesNo('Ihre Bibliothek ist noch nicht definiert. Wollen Sie ihre Bibliothek jetzt defnieren?')) {
            zdb_BibliothekDefinieren();
            eigene_bibliothek =  application.getProfileString('zdb.userdata', 'eigeneBibliothek', '');
            if('' == eigene_bibliothek) {
                return false;
            }
        }

    }

    var id = eigene_bibliothek.substring(1,eigene_bibliothek.length -1),
        lenId = id.length,
        contingent = {
            0: '[123456789X]',
            1: '[023456789X]',
            2: '[013456789X]',
            3: '[012456789X]',
            4: '[012356789X]',
            5: '[012346789X]',
            6: '[012345789X]',
            7: '[012345689X]',
            8: '[012345679X]',
            9: '[012345678X]',
            X: '[0123456789]'
        },
    mutations = [],
    expression,
    command;

    for(var num = 0; num < lenId; num += 1) {
        expression = '';
        for(var pos = 0; pos < lenId; pos += 1) {
            if(pos == num) {
                expression += contingent[id[num]];
                break;
            } else if(0 == pos) {
                expression += '[0123456789]';
            } else {
                expression += '!'
            }
        }
        mutations.push(expression + '?');
    }

    command = mutations.join(' not bie ');

    application.activeWindow.command('f bie ' + id + ' not bie ' + command, false);
}






