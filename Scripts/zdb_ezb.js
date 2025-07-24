function __zdbDruckausgabe(dppn){

    var arr = [];
    var eppn = application.activeWindow.variable('P3GPP');
    var regexp;
    var satz;

    application.activeWindow.command('f idn ' + dppn, true);

    if (application.activeWindow.status != 'OK') {
        return alert('Die über 4243 verlinkte Druckausgabe existiert nicht.');
    }

//	DocType = 1. Zeichen im Feld 0500
    if (application.activeWindow.materialCode.charAt(0) != 'A') {
        alert('Record der "Druckausgabe" hat Materialcode '
                    + application.activeWindow.materialCode);
        return false;
    }

    satz = __zdbGetRecord('D',false);
    if (false == satz) {
        return false;
    }

    regexp = new RegExp('!' + eppn + '!','gm');
    arr = satz.match(regexp);
    if (arr == null) {
        application.activeWindow.command('k',false);
        if (application.activeWindow.status != 'OK') {
            alert('Sie sind nicht berechtigt, den Datensatz zu ändern.');
            return false;
        }

        application.activeWindow.title.endOfBuffer(false);
        application.activeWindow.title.insertText('4243 Erscheint auch als$nOnline-Ausgabe!' + eppn + "!\n");

        application.activeWindow.simulateIBWKey('FR');
        //	Korrektur ausgeführt, dann ist der Titel im diagn. Format
        //	sonst im Korrekturformat
        //application.messageBox('SCR', application.activeWindow.variable('scr'), 'alert-icon');
        if (application.activeWindow.variable('scr') != '8A') {
            alert('Die Korrektur des Titel ist fehlgeschlagen. Bitte holen'
                    + 'Sie dies direkt über die WinIBW nach.');
            return false;
        }
    } else {
        application.messageBox('Test','Die Verknüpfung zur Internetausgabe im Feld 4243 ist schon vorhanden.', 'alert-icon');
    }
}

function __EZBNota(maske) {
    var DDC_EZB = {
        '000': ['AK-AL', 'SQ-SU'], '004': ['SQ-SU'], '010': ['A'], '020': ['AN'], '030': [''],
        '050': ['A'], '060': ['AK-AL'], '070': ['AP'], '080': [''], '090': [''],
        '100': ['CA-CK'], '130': ['A'], '150': ['CL-CZ'], '200': ['B'], '220': ['B'],
        '230': ['B'], '290': ['B'], '300': ['Q', 'MN-MS'], '310': ['Q'], '320': ['MA-MM'],
        '330': ['Q'], '333.7': ['AR'], '340': ['P'], '350': ['P'], '355': ['MX-MZ'],
        '360': ['MN-MS', 'Q', 'A'], '370': ['AK-AL', 'D'], '380': ['Q', 'ZG'], '390': ['LA-LC'],
        '400': ['E'], '420': ['H'], '430': ['G'], '439': ['G'], '440': ['I'], '450': ['I'],
        '460': ['I'], '470': ['F'], '480': ['F'], '490': ['E'], '491.8': ['K'], '500': ['TA-TD'],
        '510': ['SA-SP'], '520': ['U'], '530': ['U'], '540': ['V'], '550': ['TE-TZ'],
        '560': ['TE-TZ'], '570': ['W'], '580': ['W'], '590': ['W'], '600': ['ZG'],
        '610': ['WW-YZ', 'MT'], '615': ['V'], '620': ['ZL', 'ZN', 'ZP'], '621.042': ['ZP'],
        '621.3': ['ZN'], '624': ['ZG', 'ZP'], '630': ['ZA-ZE', 'WW-YZ'], '640': ['ZA-ZE'],
        '650': ['Q'], '660': ['V', 'ZL'], '660.6': ['W'], '664': ['V'], '670': ['ZL'],
        '690': ['ZH-ZI'], '700': ['LH-LO'], '710': ['ZH-ZI'], '720': ['ZH-ZI'], '730': ['N'],
        '740': ['LH-LO'], '741.5': ['A'], '750': ['LH-LO'], '760': ['LH-LO'], '770': ['LH-LO'],
        '780': ['LP-LZ'], '790': ['A'], '791': ['LH-LO'], '792': ['A'], '793': ['ZX-ZY'],
        '796': ['ZX-ZY'], '800': ['E'], '810': ['H'], '820': ['H'], '830': ['G'], '839': ['G'],
        '840': ['I'], '850': ['I'], '860': ['I'], '870': ['F'], '880': ['F'], '890': ['K', 'E'],
        '891.8': ['K'], '900': ['N'], '910': ['N', 'R'], '914.3': ['N'], '920': ['A', 'N'],
        '930': ['LD-LG'], '940': ['N'], '943': ['N'], '950': ['N'], '960': ['N'], '970': ['N'],
        '980': ['N'], '990': ['N'], 'B': [''], 'K': ['A'], 'S': ['']
    };
    return maske ? DDC_EZB[maske] || '' : '';
}

function zdb_EZB_BibID(){
    //Anwender können BibID prüfen und ggf. korrigieren
    showDialog('ProfD\\Dialogs\\ZDB_EZBAccountDefinieren.html');
}

function __checkEZBAccount(){
    if(application.getProfileString('zdb', 'ezb.account', '') == '')
    {
        showDialog('ProfD\\Dialogs\\ZDB_EZBAccountDefinieren.html');
    }
    var bibid = application.getProfileString('zdb', 'ezb.account', '');
    if(bibid != '')
    {
        return bibid;
    }
    else
    {
        return false;
    }
}
//
// ZDB-Funktionen > EZB
//
//=============
function zdb_EZB() {
    //	Dokumenttyp  8A: Vollanzeige, 7A: Kurzliste
    if (!__zdbCheckScreen(['7A', '8A'], 'EZB')) return false;
    if ('O' != application.activeWindow.variable('P3VMC').substr(0, 1)) {
        return alert('Das Skript darf nur bei O-Aufnahmen aufgerufen werden.');
    }

    var _ezbnota = [],
        _ezb = [],
        title, publisher, eissn, url, urls, sprachen = [], indxISSN,
        dppn = false,
        pissn = '',
        first_volume, first_date, first_issue, idx, winsnap, EZB_satz,
        bibid = __checkEZBAccount();
    L = new LANG();
    if (!bibid) {
        return alert('Sie müssen ein gültige EZB-bibid angeben.');
    }

    //	url zur EZB
    var dbformUrl = 'http://ezb.uni-regensburg.de/admin/newtitle.php?';
    var frontDoor = 'http://www.bibliothek.uni-regensburg.de/ezeit/?';

    // set global variable _rec
    var _rec = __zdbJSON();

    //---Feld '4000' , Inhalt nach title
    title = _rec['021A'][0]['a'][0];
    idx = title.indexOf(' @');
    if (idx == 0) title = title.substr(2);
    else if (idx > 0) {
        title = title.substr(idx + 2) + ', ' + title.substr(0, idx);
    }

    //---Sprachen aus 1500
    for (var s = 0; s < _rec['010@'][0]['a'].length; s += 1) {
        sprachen.push(L.getCode(_rec['010@'][0]['a'][s]));
    }

    //---Feld '4005' , Inhalt an title anhängen
    if (_rec['021C']) {
        var unterreihe_bez = typeof unterreihe_bez !== 'undefined' ? unterreihe_bez : '',
            unterreihe_tit = typeof unterreihe_tit !== 'undefined' ? unterreihe_tit : '';
        for (var p in _rec['021C']) {
            if (!_rec['021C'].hasOwnProperty(p)) { continue; }
            if (__zdbCheckSF('021C', 'r', p)) {
                unterreihe_bez += ' / ' + _rec['021C'][0]['r'][0];
            }
            else {
                if (__zdbCheckSF('021C', 'l', p)) {
                    unterreihe_bez += ' / ' + _rec['021C'][p]['l'][0];
                } else {
                    if (__zdbCheckSF('021C', 'a', p)) {
                        unterreihe_bez += ' / ' + _rec['021C'][p]['a'][0]; // wenn l nicht vh nimm a
                    }
                }
                if (__zdbCheckSF('021C', 'a', p)) {
                    unterreihe_tit = ': ' + _rec['021C'][p]['a'][0]
                }
            }
        }
        title += unterreihe_bez + unterreihe_tit;
    }

    if (__zdbCheckSF('021A', 'e')) title += ' / ' + _rec['021A'][0]['e'][0];

    //---Feld '4030' , Inhalt nach publisher
    publisher = (__zdbCheckSF('033A', 'n')) ? _rec['033A'][0]['n'][0] : '';

    //---Feld '2010' , Inhalt nach eissn
    eissn = '';
    if (_rec['005A']) {
            if (_rec['005A'][0]['0']) { // E-ISSN vorhanden
                eissn = _rec['005A'][0]['0'][0];
            }
    }
    //---URL-Feld '4085' , Inhalt nach url, mehrere aneinander
    url = '';

    if (_rec['009Q']) {
        urls = [];
        for (var u = 0; u < _rec['009Q'].length; u += 1) {
            urls.push(_rec['009Q'][u]['u'][0]);
        }
        url = urls.join("\n");
    }
    else {
        return alert('Die URL (4085) fehlt.');
    }

    //---Feld '4024' , Inhalt nach first_volume, first_issue, first_date
    first_volume = '';
    first_date = '';
    first_issue = '';
    if (_rec['031N']) {
        if (__zdbCheckSF('031N', 'd')) {
            first_volume = _rec['031N'][0]['d'][0];
        }
        if (__zdbCheckSF('031N', 'e')) {
            first_issue = _rec['031N'][0]['e'][0];
        }
        if (__zdbCheckSF('031N', 'j')) {
            first_date = _rec['031N'][0]['j'][0];
        }
    }
    else if (_rec['031@']) {
        if (__zdbCheckSF('031@', 'a')) {
            first_volume = _rec['031@'][0]['a'][0];
        }
    }

    //---Feld '5080' , Inhalt nach notation
    if (_rec['045U']) {
        for (var i in _rec['045U'][0]['e']) {
            if (!_rec['045U'][0]['e'].hasOwnProperty(i)) { continue; }
            // ruft ddc-ezb konkordanz
            _ezb = __EZBNota(_rec['045U'][0]['e'][i]);
            for (var x in _ezb) {
                if (!_ezb.hasOwnProperty(x)) { continue; }
                _ezbnota.push(_ezb[x]);
            }
        }
        _ezbnota = __zdbArrayUnique(_ezbnota);
    }

    // pissn über Verknüpfung ermitteln
    if (_rec['039D']) {
        for (var d in _rec['039D']) {
            if (!_rec['039D'].hasOwnProperty(d)) { continue; }
            if (__zdbCheckSF('039D', 'n', d, 'Druck-Ausgabe')) {
                if(__zdbCheckSF('039D', '9', d)) {
                    dppn =  _rec['039D'][d]['9'][0];
                }
                if (__zdbCheckSF('039D', 'X', d)) {
                    pissn = _rec['039D'][d]['X'][0];
                    break;
                } else if (__zdbCheckSF('039D', '8', d)) {
                    indxISSN = _rec['039D'][d][8][0].indexOf('ISSN: ');
                    pissn = _rec['039D'][d][8][0].substring(indxISSN + 6, indxISSN + 15);
                    break;

                }
            }
        }
    }
    if (dppn) {
        winsnap = application.windows.getWindowSnapshot();
        if(!__zdbDruckausgabe(dppn)) {
            if (!__zdbYesNo('Eine reziproke Verknüpfung ist nicht möglich. Möchten Sie trotzdem fortfahren?')) {
                return false;
            }
        }
        application.windows.restoreWindowSnapshot(winsnap);
    } else {
        if (!__zdbYesNo('Eine reziproke Verknüpfung ist nicht möglich. Möchten Sie trotzdem fortfahren?')) {
            return false;
        }
    }


    EZB_satz =
        'title=' + encodeURIComponent(title) + '&publisher=' + encodeURIComponent(publisher)
        + '&eissn=' + eissn + '&pissn=' + pissn
        + '&zdb_id=' + _rec['006Z'][0][0][0] + '&url=' + encodeURIComponent(url)
        + '&first_volume=' + encodeURIComponent(first_volume)
        + '&first_date=' + encodeURIComponent(first_date)
        + '&first_issue=' + encodeURIComponent(first_issue)
        + '&languages[]=' + sprachen.join('&languages[]=');

    for (var i in _ezbnota) {
        if (!_ezbnota.hasOwnProperty(i)) { continue; }
        EZB_satz += '&notation[]=' + _ezbnota[i];
    }
    EZB_satz += '&charset=utf8';
    EZB_satz += '&bibid=' + bibid;
    EZB_satz = EZB_satz.replace(/ /g, '%20');
    application.shellExecute(dbformUrl + EZB_satz, 'open', '');
    //	4 bedeutet ja und nein; 6=ja 7=nein
    if (__zdbYesNo(
        "Falls nicht automatisch Ihr Browser mit der EZB-Darstellung\n"
        + "in den Vordergrund kommt, wechseln Sie bitte in den Browser\n"
        + "und kontrollieren die Übereinstimmung Ihrer Aufnahme mit dem\n"
        + "im Browser gezeigten Titel.\n\n"
        + "Ist die EZB-Aufnahme korrekt und soll die Frontdoor-url\n"
        + 'eingetragen werden?')) {
        //	Press the 'Korrigieren' button
        application.activeWindow.command('k d', false);
        if (application.activeWindow.status != 'OK') {
            alert('Sie sind nicht berechtigt, den Datensatz zu ändern.');
            return false;
        }
        //	Go to end of buffer without expanding the selection
        application.activeWindow.title.endOfBuffer(false);
        //	EZB-Frontdoor einfügen
        application.activeWindow.title.insertText('4085 =u ' + frontDoor);
        application.activeWindow.title.insertText(_rec['006Z'][0][0][0].substr(0, _rec['006Z'][0][0][0].length - 2));
        application.activeWindow.title.insertText('=x F');
        //	Press the <ENTER> key
        application.activeWindow.simulateIBWKey('FR');

        //	Dokumenttyp  8A: korrekt, MT: Fehler
        if (application.activeWindow.variable('scr') != '8A') {
            alert('Die Korrektur des Titel ist fehlgeschlagen. Bitte holen'
                + 'Sie dies direkt über die WInIBW nach.');
            return false;
        }
    }
}