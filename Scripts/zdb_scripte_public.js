function zdb_merkeZDB(){
    activeWindow.clipboard = ZDB.getZDB();
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
    if(!ZDB.checkScreen(['8A','7A','MT','IT'],'Merke IDN')) {
        return false;
    }
    activeWindow.clipboard = activeWindow.getVariable('P3GPP');
}

function zdb_idListe() {
    var set = new SET(),
        t,
        allezdb = [];

        while (t = set.nextTit()) {
            allezdb[t] = ZDB.getZDB();
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
        if(false == ZDB.checkScreen(['7A','8A'],'HoleIDN')) return false;
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

function LANG() {
    this.codes = {
        'aar': 'aa', 'abk': 'ab', 'ave': 'ae', 'afr': 'af', 'aka': 'ak', 'amh': 'am', 'arg': 'an', 'ara': 'ar', 'asm': 'as', 'ava': 'av', 'aym': 'ay',
        'aze': 'az', 'bak': 'ba', 'bel': 'be', 'bul': 'bg', 'bih': 'bh', 'bis': 'bi', 'bam': 'bm', 'ben': 'bn', 'tib': 'bo', 'tib': 'bo', 'bre': 'br',
        'bos': 'bs', 'cat': 'ca', 'che': 'ce', 'cha': 'ch', 'cos': 'co', 'cre': 'cr', 'cze': 'cs', 'cze': 'cs', 'chu': 'cu', 'chv': 'cv', 'wel': 'cy',
        'wel': 'cy', 'dan': 'da', 'ger': 'de', 'ger': 'de', 'div': 'dv', 'dzo': 'dz', 'ewe': 'ee', 'gre': 'el', 'gre': 'el', 'eng': 'en', 'epo': 'eo',
        'spa': 'es', 'est': 'et', 'baq': 'eu', 'baq': 'eu', 'per': 'fa', 'per': 'fa', 'ful': 'ff', 'fin': 'fi', 'fij': 'fj', 'fao': 'fo', 'fre': 'fr',
        'fre': 'fr', 'fry': 'fy', 'gle': 'ga', 'gla': 'gd', 'glg': 'gl', 'grn': 'gn', 'guj': 'gu', 'glv': 'gv', 'hau': 'ha', 'heb': 'he', 'hin': 'hi',
        'hmo': 'ho', 'hrv': 'hr', 'hat': 'ht', 'hun': 'hu', 'arm': 'hy', 'arm': 'hy', 'her': 'hz', 'ina': 'ia', 'ind': 'id', 'ile': 'ie', 'ibo': 'ig',
        'iii': 'ii', 'ipk': 'ik', 'ido': 'io', 'ice': 'is', 'ice': 'is', 'ita': 'it', 'iku': 'iu', 'jpn': 'ja', 'jav': 'jv', 'geo': 'ka', 'geo': 'ka',
        'kon': 'kg', 'kik': 'ki', 'kua': 'kj', 'kaz': 'kk', 'kal': 'kl', 'khm': 'km', 'kan': 'kn', 'kor': 'ko', 'kau': 'kr', 'kas': 'ks', 'kur': 'ku',
        'kom': 'kv', 'cor': 'kw', 'kir': 'ky', 'lat': 'la', 'ltz': 'lb', 'lug': 'lg', 'lim': 'li', 'lin': 'ln', 'lao': 'lo', 'lit': 'lt', 'lub': 'lu',
        'lav': 'lv', 'mlg': 'mg', 'mah': 'mh', 'mao': 'mi', 'mao': 'mi', 'mac': 'mk', 'mac': 'mk', 'mal': 'ml', 'mon': 'mn', 'mar': 'mr', 'may': 'ms',
        'may': 'ms', 'mlt': 'mt', 'bur': 'my', 'bur': 'my', 'nau': 'na', 'nob': 'nb', 'nde': 'nd', 'nep': 'ne', 'ndo': 'ng', 'dut': 'nl', 'dut': 'nl',
        'nno': 'nn', 'nor': 'no', 'nbl': 'nr', 'nav': 'nv', 'nya': 'ny', 'oci': 'oc', 'oji': 'oj', 'orm': 'om', 'ori': 'or', 'oss': 'os', 'pan': 'pa',
        'pli': 'pi', 'pol': 'pl', 'pus': 'ps', 'por': 'pt', 'que': 'qu', 'roh': 'rm', 'run': 'rn', 'rum': 'ro', 'rum': 'ro', 'rus': 'ru', 'kin': 'rw',
        'san': 'sa', 'srd': 'sc', 'snd': 'sd', 'sme': 'se', 'sag': 'sg', 'sin': 'si', 'slo': 'sk', 'slo': 'sk', 'slv': 'sl', 'smo': 'sm', 'sna': 'sn',
        'som': 'so', 'alb': 'sq', 'alb': 'sq', 'srp': 'sr', 'ssw': 'ss', 'sot': 'st', 'sun': 'su', 'swe': 'sv', 'swa': 'sw', 'tam': 'ta', 'tel': 'te',
        'tgk': 'tg', 'tha': 'th', 'tir': 'ti', 'tuk': 'tk', 'tgl': 'tl', 'tsn': 'tn', 'ton': 'to', 'tur': 'tr', 'tso': 'ts', 'tat': 'tt', 'twi': 'tw',
        'tah': 'ty', 'uig': 'ug', 'ukr': 'uk', 'urd': 'ur', 'uzb': 'uz', 'ven': 've', 'vie': 'vi', 'vol': 'vo', 'wln': 'wa', 'wol': 'wo', 'xho': 'xh',
        'yid': 'yi', 'yor': 'yo', 'zha': 'za', 'chi': 'zh', 'chi': 'zh', 'zul': 'zu'
    };
};

LANG.prototype = {
    getCode: function (code) {
        var flip = {};
        code = code.toLowerCase();
        if (code.length == 2) {
            for (var key in this.codes) {
                flip[this.codes[key]] = key;
            }
        } else if (code.length == 3) {
            flip = this.codes;
        } else {
            return false;
        }
        if (flip.hasOwnProperty(code)) {
            return flip[code];
        }
        return false;
    }
};