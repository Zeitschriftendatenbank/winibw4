function zdb_merkeZDB(){
    activeWindow.clipboard = ZDB._getZDB();
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

function __zdbYesNo(msgtxt) {
    return utility.newPrompter().confirm('Ihre Entscheidung', msgtxt);
}

function zdb_MerkeIDN(){
    if(!ZDB._checkScreen(['8A','7A','MT','IT'],'Merke IDN')) {
        return false;
    }
    activeWindow.clipboard = activeWindow.getVariable('P3GPP');
}

function zdb_idListe() {
    var set = new SET(),
        t,
        allezdb = [];

        while (t = set.nextTit()) {
            allezdb[t] = ZDB._getZDB();
        }
        activeWindow.clipboard = alleZDB.join("\r\n");
        messageBox ("ZDB-ID-Liste", "Alle ZDB-IDs wurden eingesammelt und in den " +
            "Zwischenspeicher geschrieben. \nSie können die ZDB-IDs jetzt mit dem Shortcut Strg+v " +
            "in eine Datei einfügen.", "message-icon");
}





function zdb_MailboxsatzAnlegen(){
    var ppn = activeWindow.getVariable('P3GPP');
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
    if (typeof ZDB.anfangsfenster == 'undefined') {
        messageBox('HoleIDN', 'Vor Aufruf des Skriptes "HoleIDN" muss zunächst eine automatische Suche mit Hilfe des Skriptes "AutomatischeSuchBox" gestartet werden.', 'alert-icon');
    } else {
        // Ist das aktive Fenster eine Trefferliste?
        if(false == ZDB._checkScreen(['7A','8A'],'HoleIDN')) return false;
        //  IDN des markierten Titels aus der Trefferliste ermitteln
        var idn = activeWindow.getVariable('P3GPP');
        // ID des aktiven Fensters ermitteln
        var fenster = activeWindow.windowID;
        // Falls das Bearbeitungsfenster ( = ZDB.anfangsfenster) geschlossen wurde, gibt das System einen 'uncaught exception'-Fehler aus. Um diesen abzufangen, wird mit TRY CATCH gearbeitet.
        try {
            // Zurück zum ZDB.anfangsfenster gehen
            activateWindow(ZDB.anfangsfenster);
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
    var eigene_bibliothek =  getProfileString('ZDB.userdata', 'eigeneBibliothek', '');
    if('' == eigene_bibliothek) {
        if(__zdbYesNo('Ihre Bibliothek ist noch nicht definiert. Wollen Sie ihre Bibliothek jetzt defnieren?')) {
            zdb_BibliothekDefinieren();
            eigene_bibliothek =  getProfileString('ZDB.userdata', 'eigeneBibliothek', '');
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



