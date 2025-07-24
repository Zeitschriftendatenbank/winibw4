// Datei: zdb_scripte_public.js
// WinIBW-Version ab 3.7

/**
* ZDB globale Variablen
*/
var zdb =  {
    // auto Suchbox
    anfangsfenster: '',
    delimiter: '\u0192', // Unterfeldzeichen 'ƒ' = \u0192
    delimiterReg: '\u0192', // regualr expression version Unterfeldzeichen '$' = \$
    charCode: 402, // Unterfeldzeichen 'ƒ' = 402, Unterfeldzeichen '$' = 36
    _rec: {} // global varibale holding the JSON record
};


function zdb_merkeZDB(){
    activeWindow.clipboard = __zdbGetZDB();
}

function zdb_ILTISseiten(){
    shellExecute ('https://wiki.dnb.de/display/ILTIS/ILTIS-Handbuch', 'open', '');
}

function zdb_openWinibwInfo() {
    shellExecute("http://www.zeitschriftendatenbank.de/erschliessung/winibw", "open", "");
}

function zdb_openWinibwSupport() {
    shellExecute("mailto:zdb-winibw@sbb.spk-berlin.de?subject=[WinIBW 4.5] ", "open", "");
}

function zdb_openFormat() {
    if (!activeWindow.title) {
        shellExecute("https://www.zeitschriftendatenbank.de/erschliessung/zdb-format/", "open", "");
    }
    else {
        shellExecute("https://www.zeitschriftendatenbank.de/erschliessung/zdb-format/" + activeWindow.title.tag, "open", "");
    }
}

function zdb_MerkeIDN(){
    if(!__zdbCheckScreen(['8A','7A','MT','IT'],'Merke IDN')) return false;
    var idn = activeWindow.variable('P3GPP'),
    idn_formatiert = '!' + idn + '!';
    activeWindow.clipboard = idn_formatiert;
}

function zdb_idListe() {
    var set = new SET(),
        t,
        allezdb = [];

        while (t = set.nextTit()) {
            allezdb[t] = __zdbGetZDB();
        }
        activeWindow.clipboard = allezdb.join("\r\n");
        messageBox ("ZDB-ID-Liste", "Alle ZDB-IDs wurden eingesammelt und in den " +
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
        activeWindow.command('e ' + exNum, false);
    }
    // Exemplarsatz anlegen und befüllen
    activeWindow.title.insertText(exNum + " x\n" + content);
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
    activeWindow.command('show d', false);
    var found = (activeWindow.getVariable('P3CLIP')).match(/\n(E\d\d\d)/g);
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
    var record,
        num;
    if(__zdbCheckScreen(['MT'])){
        activeWindow.title.selectAll();
        record = activeWindow.title.selection;
        activeWindow.title.selectNone();
    } else {
        record = activeWindow.getVariable('P3CLIP');
    }
    for (var i = 1; i <= 999; i += 1) {
        num = "E" + ("000" + i).slice(-3);
        if ('' != record) {
            if (record.indexOf(num) == -1) {
                return num;
            }
        } else {
            if (!activeWindow.title.find("\n" + num, true, false, true)) {
                return num;
            }
        }
    }
}

function zdb_MailboxsatzAnlegen(){
    var ppn = activeWindow.variable('P3GPP');
    activeWindow.command('ein t', false);
    if (activeWindow.status != 'OK') {
        messageBox('MailboxsatzAnlegen', 'Sie haben nicht die nötigen Berechtigungen, um einen Mailboxsatz anzulegen.', 'alert-icon');
        return false;
    }
    activeWindow.title.insertText (
            "0500 am\n"
            + '8900 !' + ppn + "!\n"
            + "8901 \n"
            + '8902 ');
    activeWindow.title.startOfBuffer(false);
    activeWindow.title.lineDown(2, false);
    activeWindow.title.charRight(5, false);
}

function zdb_HoleIDN(){
    // Wurde vorab eine Suche mit dem Skript 'Automatische Suchbox' ausgeführt?
    if (typeof zdb.anfangsfenster == 'undefined') {
        messageBox('HoleIDN', 'Vor Aufruf des Skriptes "HoleIDN" muss zunächst eine automatische Suche mit Hilfe des Skriptes "AutomatischeSuchBox" gestartet werden.', 'alert-icon');
    } else {
        // Ist das aktive Fenster eine Trefferliste?
        if(false == __zdbCheckScreen(['7A','8A'],'HoleIDN')) return false;
        //  IDN des markierten Titels aus der Trefferliste ermitteln
        var idn = activeWindow.variable('P3GPP');
        // ID des aktiven Fensters ermitteln
        var fenster = activeWindow.windowID;
        // Falls das Bearbeitungsfenster ( = zdb.anfangsfenster) geschlossen wurde, gibt das System einen 'uncaught exception'-Fehler aus. Um diesen abzufangen, wird mit TRY CATCH gearbeitet.
        try {
            // Zurück zum zdb.anfangsfenster gehen
            activateWindow(zdb.anfangsfenster);
            // IDN einfügen
            activeWindow.title.insertText('!' + idn + '!');
            // Trefferliste schließen
            closeWindow(fenster);
        } catch(e) {
            messageBox('HoleIDN', 'Das Bearbeitungsfenster, in welches die IDN eingefügt werden soll, ist nicht mehr geöffnet.', 'alert-icon');
        }
    }
    return true;
}


function zdb_alleinbesitz() {
    var eigene_bibliothek =  getProfileString('zdb.userdata', 'eigeneBibliothek', '');
    if('' == eigene_bibliothek) {
        if(__zdbYesNo('Ihre Bibliothek ist noch nicht definiert. Wollen Sie ihre Bibliothek jetzt defnieren?')) {
            zdb_BibliothekDefinieren();
            eigene_bibliothek =  getProfileString('zdb.userdata', 'eigeneBibliothek', '');
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

    activeWindow.command('f bie ' + id + ' not bie ' + command, false);
}






