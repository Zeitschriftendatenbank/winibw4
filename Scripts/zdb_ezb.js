var MISC, O, Notify;
function __zdbDruckausgabe(dppn) {
    var eppn = activeWindow.getVariable('P3GPP');
    var arr = [];
    var regexp;
    var satz;
    var DocType;

    activeWindow.command('f idn ' + dppn, true);

    if (activeWindow.status != 'OK') {
        Notify.error('Die über 4243 verlinkte Druckausgabe existiert nicht.');
        return false;
    }

    DocType = activeWindow.materialCode.charAt(0);
    if (DocType != 'A') {
        Notify.error('Record der "Druckausgabe" hat Materialcode ' + activeWindow.materialCode);
        return false;
    }

    satz = ZDB.getRecord('D', false);
    if (satz === false) {
        return false;
    }
    regexp = new RegExp('!' + eppn + '!', 'gm');
    arr = satz.match(regexp);
    if (arr == null) {
        activeWindow.command('k', false);
        activeWindow.title.endOfBuffer(false);
        activeWindow.title.insertText('4243 Erscheint auch als$nOnline-Ausgabe!' + eppn + "!\n");

        activeWindow.simulateIBWKey('FR');
        if (activeWindow.getVariable('scr') != '8A') {
            Notify.error('Die Korrektur des Titel ist fehlgeschlagen. Bitte holen Sie dies direkt über die WinIBW nach.');
            return false;
        }
    } else {
        messageBox('Test', 'Die Verknüpfung zur Internetausgabe im Feld 4243 ist schon vorhanden.', 'alert-icon');
    }
    return true;
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

function zdb_EZB_BibID() {
    showDialog('ProfD\\Dialogs_zdb\\ZDB_dialogEZBAccountDefinieren.html', 200, 200, 400, 400,'EZBAccountDefinieren');
}

function zdb_EZB() {
    var _ezbnota = [];
    var _ezb = [];
    var title, publisher, eissn, url, urls, sprachen = [], indxISSN;
    var dppn = false;
    var pissn = '';
    var bibid = '';
    var first_volume, first_date, first_issue, idx, EZB_satz;
    var L, i, s, u, p, x, d;
    if (!MISC.checkScreen(['7A', '8A'], 'EZB')) return false;
    if ('O' != activeWindow.getVariable('P3VMC').substr(0, 1)) {
        Notify.error('Das Skript darf nur bei O-Aufnahmen aufgerufen werden.');
        return false;
    }

    if ('' == (bibid = getProfileString('zdb', 'ezb.account', ''))) {
        zdb_EZB_BibID();
        bibid = getProfileString('zdb', 'ezb.account', '');
    }

    if(!bibid) {
        Notify.error('Sie müssen ein gültiges EZB-BibID angeben.');
        return false;
    }

    L = new LANG();

    var dbformUrl = 'http://ezb.uni-regensburg.de/admin/newtitle.php?';
    var frontDoor = 'https://ezb.ur.de/?';

    ZDB._rec = O.create();
//__zeigeEigenschaften(ZDB._rec);
    title = ZDB._rec['021A'][0]['a'][0];
    idx = title.indexOf(' @');
    if (idx === 0) {
        title = title.substr(2);
    } else if (idx > 0) {
        title = title.substr(idx + 2) + ', ' + title.substr(0, idx);
    }

    for (s = 0; s < ZDB._rec['010@'][0]['a'].length; s += 1) {
        sprachen.push(L.getCode(ZDB._rec['010@'][0]['a'][s]));
    }

    if (ZDB._rec['021C']) {
        var unterreihe_bez = '';
        var unterreihe_tit = '';
        for (p in ZDB._rec['021C']) {
            if (!ZDB._rec['021C'].hasOwnProperty(p)) continue;
            if (ZDB.checkSF('021C', 'r', p)) {
                unterreihe_bez += ' / ' + ZDB._rec['021C'][0]['r'][0];
            } else {
                if (ZDB.checkSF('021C', 'l', p)) {
                    unterreihe_bez += ' / ' + ZDB._rec['021C'][p]['l'][0];
                } else {
                    if (ZDB.checkSF('021C', 'a', p)) {
                        unterreihe_bez += ' / ' + ZDB._rec['021C'][p]['a'][0];
                    }
                }
                if (ZDB.checkSF('021C', 'a', p)) {
                    unterreihe_tit = ': ' + ZDB._rec['021C'][p]['a'][0];
                }
            }
        }
        title += unterreihe_bez + unterreihe_tit;
    }

    if (ZDB.checkSF('021A', 'e')) {
        title += ' / ' + ZDB._rec['021A'][0]['e'][0];
    }

    publisher = (ZDB.checkSF('033A', 'n')) ? ZDB._rec['033A'][0]['n'][0] : '';

    eissn = '';
    if (ZDB._rec['005A']) {
        if (ZDB._rec['005A'][0]['0']) {
            eissn = ZDB._rec['005A'][0]['0'][0];
        }
    }
    url = '';
    if (ZDB._rec['009Q']) {
        urls = [];
        for (u = 0; u < ZDB._rec['009Q'].length; u += 1) {
            urls.push(ZDB._rec['009Q'][u]['u'][0]);
        }
        url = urls.join("\n");
    } else {
        Notify.error('Die URL (4085) fehlt.');
        return false;
    }

    first_volume = '';
    first_date = '';
    first_issue = '';
    if (ZDB._rec['031N']) {
        if (ZDB.checkSF('031N', 'd')) {
            first_volume = ZDB._rec['031N'][0]['d'][0];
        }
        if (ZDB.checkSF('031N', 'e')) {
            first_issue = ZDB._rec['031N'][0]['e'][0];
        }
        if (ZDB.checkSF('031N', 'j')) {
            first_date = ZDB._rec['031N'][0]['j'][0];
        }
    } else if (ZDB._rec['031@']) {
        if (ZDB.checkSF('031@', 'a')) {
            first_volume = ZDB._rec['031@'][0]['a'][0];
        }
    }
    if (ZDB._rec['045U']) {
        for (i in ZDB._rec['045U'][0]['e']) {
            if (!ZDB._rec['045U'][0]['e'].hasOwnProperty(i)) { continue; }
            _ezb = __EZBNota(ZDB._rec['045U'][0]['e'][i]);
            for (x in _ezb) {
                if (!_ezb.hasOwnProperty(x)) { continue; }
                _ezbnota.push(_ezb[x]);
            }
        }
        _ezbnota = ZDB.arrayUnique(_ezbnota);
    }
    if (ZDB._rec['039D']) {
        for (d in ZDB._rec['039D']) {
            if (!ZDB._rec['039D'].hasOwnProperty(d)) { continue; }
            if (ZDB.checkSF('039D', 'n', d, 'Druck-Ausgabe')) {
                if (ZDB.checkSF('039D', '9', d)) {
                    dppn = ZDB._rec['039D'][d]['9'][0];
                }
                if (ZDB.checkSF('039D', 'X', d)) {
                    pissn = ZDB._rec['039D'][d]['X'][0];
                    break;
                } else if (ZDB.checkSF('039D', '8', d)) {
                    indxISSN = ZDB._rec['039D'][d][8][0].indexOf('ISSN: ');
                    pissn = ZDB._rec['039D'][d][8][0].substring(indxISSN + 6, indxISSN + 15);
                    break;
                }
            }
        }
    }

    if (dppn) {
        var windowId = activeWindow.windowID;
        if (!__zdbDruckausgabe(dppn)) {
            if (!__zdbYesNo('Eine reziproke Verknüpfung ist nicht möglich. Möchten Sie trotzdem fortfahren?')) {
                return false;
            }
        }

        __zdbYesNo('Eine reziproke Verknüpfung ist nicht möglich. Möchten Sie trotzdem fortfahren?')
        activateWindow(windowId);
    } else {
        if (!__zdbYesNo('Eine reziproke Verknüpfung ist nicht möglich. Möchten Sie trotzdem fortfahren?')) {
            return false;
        }
    }

    EZB_satz =
        'title=' + encodeURIComponent(title) + '&publisher=' + encodeURIComponent(publisher)
        + '&eissn=' + eissn + '&pissn=' + pissn
        + '&zdb_id=' + ZDB._rec['006Z'][0][0][0] + '&url=' + encodeURIComponent(url)
        + '&first_volume=' + encodeURIComponent(first_volume)
        + '&first_date=' + encodeURIComponent(first_date)
        + '&first_issue=' + encodeURIComponent(first_issue)
        + '&languages[]=' + sprachen.join('&languages[]=');

    for (i in _ezbnota) {
        if (!_ezbnota.hasOwnProperty(i)) { continue; }
        EZB_satz += '&notation[]=' + _ezbnota[i];
    }
    EZB_satz += '&charset=utf8';
    EZB_satz += '&bibid=' + bibid;
    EZB_satz = EZB_satz.replace(/ /g, '%20');
    shellExecute(dbformUrl + EZB_satz, 'open', '');

    if (__zdbYesNo(
        "Falls nicht automatisch Ihr Browser mit der EZB-Darstellung in den Vordergrund kommt, wechseln Sie bitte in den " 
        + "Browser und kontrollieren die Übereinstimmung Ihrer Aufnahme mit dem "
        + "im Browser gezeigten Titel. Ist die EZB-Aufnahme korrekt und soll die Frontdoor-url eingetragen werden?")) 
    {
        activeWindow.command('k d', false);
        activeWindow.title.endOfBuffer(false);
        activeWindow.title.insertText('4085 =u ' + frontDoor);
        activeWindow.title.insertText(ZDB._rec['006Z'][0][0][0].substr(0, ZDB._rec['006Z'][0][0][0].length - 2));
        activeWindow.title.insertText('=x F');
        activeWindow.simulateIBWKey('FR');
        if (activeWindow.getVariable('scr') != '8A') {
            Notify.error('Die Korrektur des Titel ist fehlgeschlagen. Bitte holen Sie dies direkt über die WInIBW nach.');
            return false;
        }
    }
}