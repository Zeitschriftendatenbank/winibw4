function __zdbNormdatenKopie() {
    // Titelkopie auf zdb_titeldatenkopie.ttl setzen
    activeWindow.titleCopyFile = '%APPDATA%\\OCLC\\WinIBW4\\ttlFiles_zdb\\gnd_title.ttl';
    //overwriteMode = false;
    var idn = activeWindow.getVariable('P3GPP'),
        typ = activeWindow.getVariable('P3VMC');
    activeWindow.command('show d', false);
    activeWindow.copyTitle();
    activeWindow.command('ein n', false);
    activeWindow.title.insertText(" *** Normdatenkopie *** \n");
    activeWindow.pasteTitle();
    activeWindow.title.endOfBuffer(false);

    if (typ == 'Tb' || typ == 'Tg') {
        activeWindow.title.insertText('??? !' + idn + '!');
    }
    //activeWindow.title.startOfBuffer(false);
    activeWindow.title.findTag('005', 0, false, true, true);
    activeWindow.title.endOfField(false);
}

function __zdbTiteldatenKopie() {

    ZDB._rec = ZDB.JSON();

    // Überschrift und IDN einfügeng
    //overwriteMode = false;
    var idn = activeWindow.getVariable('P3GPP');
    activeWindow.command('show d', false);
    // Titelkopie auf zdb_titeldatenkopie.ttl setzen
    activeWindow.titleCopyFile = '%APPDATA%\\OCLC\\WinIBW4\\ttlFiles_zdb\\zdb_titeldatenkopie.ttl';
    activeWindow.copyTitle();
    activeWindow.command('ein t', false);
    activeWindow.title.insertText(" *** Titeldatenkopie *** \n");
    activeWindow.pasteTitle();
    activeWindow.title.endOfBuffer(false);
    activeWindow.title.insertText('???? !' + idn + '!');
    activeWindow.clipboard = idn;

    if (!ZDB._rec['002C']) { // 0501 Inhaltstyp
        activeWindow.title.findTag('0500', 0, false, true, false);
        activeWindow.title.endOfField(false);
        activeWindow.title.insertText("\n0501 $btxt");
        ZDB._rec['002C'] = [{ 'b': ['txt'] }];
    }
    if (!ZDB._rec['002D']) { // 0502 Medientyp
        __zdbMediatype();
        activeWindow.title.insertText("\n0502 $b" + ZDB._rec['002D'][0]['b'][0]);
    }
    if (!ZDB._rec['002E']) { // 0503 Datenträgertyp
        __zdbDatentraeger();
        activeWindow.title.insertText("\n0503 $b" + ZDB._rec['002E'][0]['b'][0]);
    }
    // Ersetzungen in Kategorie 0600
    var codes0600;
    if ('' != (codes0600 = activeWindow.title.findTag('0600', 0, false, true, true))) {
        var _codes0600 = codes0600.split(';');
        var _codes = MISC.arrayDiff(_codes0600, ['ee', 'mg', 'nw', 'vt', 'ra', 'rb', 'ru', 'rg']);
        if (0 < _codes.length) {
            activeWindow.title.insertText(_codes.join(';'));
        }
        else {
            activeWindow.title.deleteLine(1);
        }
    }

    var feld4000 = __zdbTitelAnpassen();
    activeWindow.title.insertText(feld4000 + "\n");
    activeWindow.title.findTag('0500', 0, false, true, true);
    activeWindow.title.endOfField(false);
    activeWindow.title.insertText('xz');
    activeWindow.title.endOfBuffer(false);
    activeWindow.title.insertText("\n");
}

/**
* Der Inhalt von 0503 ist abhängig von 0500 und 0502
*
* Die Funktion erwartet ein globales Objekt ZDB._rec
* Der Medientyp wird in ZDB._rec['002E'][0]['b'][0] geschrieben
*/
function __zdbDatentraeger() {
    var datentraegerMap = {
        'A': 'nc',
        'O': 'cr'
    };
    var gattung = ZDB._rec['002@'][0]['0'][0], // 0500
        gtt = gattung.substr(0, 1);
    if (!datentraegerMap.hasOwnProperty(gtt)) {
        ZDB._rec['002E'] = [{ 'b': [ZDB._rec['002D'][0]['b'][0] + '?'] }];
        return;
    }
    ZDB._rec['002E'] = [{ 'b': [datentraegerMap[gtt]] }];
}

/**
* Der Inhalt von 0502 ist abhängig von 0500 und 0501
*
* Die Funktion erwartet ein globales Objekt ZDB._rec
* Der Medientyp wird in ZDB._rec['002D'][0]['b'][0] geschrieben
*/
function __zdbMediatype() {

    var mediamap = {
        'A': { 'def': 'n' },
        'C': { 'def': 'n' },
        'S': { 'prm': 's', 'tdi': 'v', 'snd': 's', 'spw': 's', 'def': 'c' },
        'O': { 'prm': 's', 'tdi': 'v', 'snd': 's', 'spw': 's', 'def': 'c' },
        'B': { 'prm': 's', 'tdi': 'v', 'snd': 's', 'spw': 's', 'def': 'z' },
        'E': { 'def': 'h' }
    },
        gattung = ZDB._rec['002@'][0]['0'][0], // 0500
        gtt = gattung.substr(0, 1),
        inhaltstyp = ZDB._rec['002C'][0]['b'][0]; // 0501

    if (!mediamap[gtt][inhaltstyp]) {
        ZDB._rec['002D'] = [{ 'b': [mediamap[gtt]['def']] }];
        return;
    }

    ZDB._rec['002D'] = [{ 'b': [mediamap[gtt][inhaltstyp]] }];
}

function zdb_Datensatzkopie() {
    if (false == ZDB.checkScreen(['8A'], 'Datensatzkopie')) return false;
    //Persönliche Einstellung des Titelkopie-Pfades ermitteln
    var titlecopyfileStandard = getProfileString('prefs', 'titleCopyFile', '');
    if (activeWindow.materialCode.charAt(0) == 'T') {
        __zdbNormdatenKopie();
    } else {
        __zdbTiteldatenKopie();
    }
    //Wiederherstellen des ursprünglichen Pfades der Titelkopie-Datei:
    activeWindow.titleCopyFile = titlecopyfileStandard;
}

function zdb_Digitalisierung() {
    if (false == ZDB.checkScreen(['8A'], 'Digitalisierung')) return false;
    // Prüfen, ob Titeldatensatz mit bibliographischer Gattung 'A' aufgerufen, bei 'T' oder 'O' Fehlermeldung ausgeben
    var matCode = activeWindow.materialCode.charAt(0);
    if (matCode == 'T' || matCode == 'O') {
        messageBox('Digitalisierung', 'Die Funktion kann nur für Titelsätze des Satztyps "A" verwendet werden.', 'alert-icon');
        return false;
    }
    // Titelkopie auf zdb_titeldatenkopie_digi.ttl setzen
    var titlecopyfileStandard = getProfileString('winibw.filelocation', 'titlecopy', '');
    var idn = activeWindow.getVariable('P3GPP');
    var showComment = " *** Titeldatenkopie Digitalisierung *** \n"
    if (!__zdbOnlineRessource('%APPDATA%\\OCLC\\WinIBW4\\ttlFiles_zdb\\zdb_titeldatenkopie_digi.ttl', showComment, ['ld', 'dm'], true)) return false;

    activeWindow.title.endOfBuffer(false);
    activeWindow.title.insertText("\n4256 Elektronische Reproduktion von!" + idn + "!\n");

    activeWindow.title.endOfBuffer(false);
    activeWindow.title.insertText('4201 Gesehen am ');
    //activeWindow.title.charLeft(1,false);
    //Wiederherstellen des ursprünglichen Pfades der Titelkopie-Datei:
    activeWindow.titleCopyFile = titlecopyfileStandard;
}

function zdb_Parallelausgabe() {
    if (false == ZDB.checkScreen(['8A'], 'Parallelausgabe')) {
        return false;
    }
    var matCode = activeWindow.materialCode.charAt(0);
    if (matCode == 'T' || matCode == 'O') {
        messageBox('Digitalisierung', 'Die Funktion kann nur für Titelsätze des Satztyps \"A\" verwendet werden.', 'alert-icon');
        return false;
    }

    var titlecopyfileStandard = getProfileString('winibw.filelocation', 'titlecopy', '');
    var idn = activeWindow.getVariable('P3GPP');
    var showComment = " *** Titeldatenkopie Parallelausgabe *** \n";
    var onlineResult = __zdbOnlineRessource('%APPDATA%\\OCLC\\WinIBW4\\ttlFiles_zdb\\zdb_titeldatenkopie_parallel.ttl', showComment, [], false);
    if (!onlineResult) {
        return false;
    }

    activeWindow.title.endOfBuffer(false);
    activeWindow.title.insertText("\n4243 Erscheint auch als$nDruck-Ausgabe!" + idn + "!\n");

    activeWindow.title.endOfBuffer(false);
    activeWindow.title.insertText('4201 Gesehen am ');

    activeWindow.titleCopyFile = titlecopyfileStandard;
}

function __zdbOnlineRessource(copyFile, showComment, add0600, digi) {
    // set global variable ZDB._rec
    ZDB._rec = ZDB.JSON();

    var _felder424X = __zdbFeld424XGet();
    // Titelaufnahme kopieren und neue Titelaufnahme anlegen
    //overwriteMode = false;
    activeWindow.command('show d', false);
    activeWindow.titleCopyFile = copyFile;
    activeWindow.copyTitle();
    activeWindow.command('ein t', false);
    if (showComment != false) activeWindow.title.insertText(showComment);
    activeWindow.pasteTitle();

    // Kategorie 0500: Bibliographische Gattung/Status ändern
    var f0500 = activeWindow.title.findTag('0500', 0, false, true, true);
    f0500 = f0500.replace('A', 'O');
    f0500 = f0500.replace('v', 'x');
    activeWindow.title.insertText(f0500);

    if (!ZDB._rec['002C']) activeWindow.title.insertText("\n0501 $btxt");
    // wird schon in zdb_titeldatenkopie_digi gemacht
    //if(!ZDB._rec['002D']) activeWindow.title.insertText("\n0502 $bc");
    //if(!ZDB._rec['002E']) activeWindow.title.insertText("\n0503 $bcr");

    // Feld 0600
    // Feld 600 must be deleted in ttlcopy
    add0600 = typeof add0600 !== 'undefined' ? add0600 : [];
    if (!add0600) { add0600 = []; }
    if (ZDB._rec['017A']) {
        var _codes = MISC.arrayDiff(ZDB._rec['017A'][0]['a'], ['es', 'ks', 'sf', 'sm', 'mg', 'mm', 'nw', 'ra', 'rb', 'rc', 'rg', 'ru', 'ee', 'vt']);
        // join arrays
        _codes = _codes.concat(add0600);

        if (0 < _codes.length) {
            activeWindow.title.insertText("\n0600 " + _codes.join(';'));
        }
    }
    else if (0 < add0600.length) {
        activeWindow.title.insertText("\n0600 " + add0600.join(';'));
    }


    if (!ZDB._rec['010@']) activeWindow.title.insertText("\n1500 ");

    if (typeof digi === 'object') {
        for (var x in digi) {
            if (!digi.hasOwnProperty(x)) { continue; }
            activeWindow.title.endOfBuffer(false);
            activeWindow.title.insertText(digi[x].kat + digi[x].cont + "\n");
        }
    } else if (digi !== false) {
        activeWindow.title.insertText("\n1101 " + getProfileString('zdb.userdata.digiconfig', '1101', ''));
    }

    // Kategorie 4215,4225 ändern
    var content, y;
    var fieldmap = {
        '4215': '4201 ',
        '4225': '4201 '
    };
    for (var m in fieldmap) {
        if (!fieldmap.hasOwnProperty(m)) { continue; }
        content = '';
        y = 0;
        while ((content = activeWindow.title.findTag(m, y, false, true, true)) != '') {
            activeWindow.title.deleteLine(1);
            activeWindow.title.insertText(fieldmap[m] + content + "\n");
            y++;
        }
    }

    // neues Feld für Sekundärköperschaft 312X -> 311X
    content = '';
    y = 0;
    while ((content = activeWindow.title.findTag('312', y, false, true, true)) != '') {
        activeWindow.title.deleteLine(1);
        activeWindow.title.insertText('311' + y + ' ' + content + '$4isb');
        y++;
    }

    y = 0;
    while ('' != activeWindow.title.findTag('311', y, false, true, true)) {
        if (!/\$4isb/.test(activeWindow.title.selection)) {
            activeWindow.title.endOfField(false);
            activeWindow.title.insertText("$4isb\n");
        }
        y++;
    }

    var feld4000 = __zdbTitelAnpassen();
    activeWindow.title.insertText(feld4000 + "\n");

    if (digi === true) {
        activeWindow.title.insertText("\n2050 " + getProfileString('zdb.userdata.digiconfig', '2050', ''));
        activeWindow.title.insertText("\n2051 " + getProfileString('zdb.userdata.digiconfig', '2051', ''));
        activeWindow.title.insertText("\n4085 " + getProfileString('zdb.userdata.digiconfig', '4085', ''));
    }
    // Kategorie 4212 mit neuem Vortext
    if (ZDB._rec['046C'] && !__zdbIsRda()) {
        __zdbDeleteField("4212");
        for (var c in ZDB._rec['046C']) {
            if (!ZDB._rec['046C'].hasOwnProperty(c)) { continue; }
            activeWindow.title.insertText("\n4212 Abweichender Titel: " + ZDB._rec['046C'][c]['a'][0]);
        }
    }

    if (digi === true) {
        activeWindow.title.insertText("\n4233 " + getProfileString('ZDB.userdata.digiconfig', '4233', ''));
        activeWindow.title.insertText(__zdbFeld4238());
    }
    activeWindow.title.insertText("\n");
    activeWindow.title.endOfBuffer(false);

    __zdbFeld424XSet(_felder424X);

    return true;
}

function __zdbFeld4238() {
    var feld = "\n4238 ";
    feld += getProfileString('zdb.userdata.digiconfig', '4238a', '[Online-Ausgabe/CD-ROM-Ausgabe/Mikrofilm-Ausgabe]');
    feld += '$b' + getProfileString('zdb.userdata.digiconfig', '4238b', '[Reproduktionsort]');
    feld += '$c' + getProfileString('zdb.userdata.digiconfig', '4238c', '[Digitalisierende Institution]');
    feld += '$d' + getProfileString('zdb.userdata.digiconfig', '4238d', '[Erscheinungsdaten der Reproduktion (nicht normiert)]');
    feld += '$e' + getProfileString('zdb.userdata.digiconfig', '4238e', '[Umfangsangabe der Reproduktion]');
    feld += '$f' + getProfileString('zdb.userdata.digiconfig', '4238f', '[Ungezählter Gesamttitel der Reproduktion]');
    feld += '$g' + getProfileString('zdb.userdata.digiconfig', '4238g', '[Zählung der Reproduktion in Sortierform (JJJJ) - Anfang]');
    feld += '$h' + getProfileString('zdb.userdata.digiconfig', '4238h', '[Zählung der Reproduktion in Sortierform (JJJJ) - Ende]');
    feld += '$m' + getProfileString('zdb.userdata.digiconfig', '4238m', '[Zählung der reproduzierten Teile (Bände, Jahrgänge) in Vorlageform]');
    feld += '$n' + getProfileString('zdb.userdata.digiconfig', '4238n', '[Fußnote zur Reproduktion]');
    return feld;
}

function __zdbTitelAnpassen() {
    // Titel anpassen
    var feld4000 = __zdbDeleteField('4000', true, true);
    if (ZDB.checkSF('021A', 'e')) // Körperschaftsergänzungen vhd.
    {
        var e = 0;
        while (ZDB._rec['021A'][0]['e'] && ZDB._rec['021A'][0]['e'][e]) {
            feld4000 = feld4000.replace(' // ' + ZDB._rec['021A'][0]['e'][e], '');
            e++;
        }

        if (!ZDB.checkSF('021A', 'h')) // Verfasserangabe nicht vhd.
        {
            feld4000 += ' / ' + ZDB._rec['021A'][0]['e'][0];
        }
    }

    if (ZDB.checkSF('021A', 'n')) // Materialbenennung vhd.
    {
        feld4000 = feld4000.replace(' [[' + ZDB._rec['021A'][0]['n'][0] + ']]', '');
    }
    return feld4000;
}

function __zdbFeld424XSet(_felder424X) {
    var _lang = {
        'Dt': 'Parallele Sprachausgabe$ndeutsch',
        'Fr': 'Parallele Sprachausgabe$nfranzösisch',
        'En': 'Parallele Sprachausgabe$nenglisch',
        'Sp': 'Parallele Sprachausgabe$nspanisch'
    };
    var langpat = new RegExp('^(Dt|Fr|En|Sp)(?:[^$])+', 'i');
    var feld4248;
    var _repl = {
        'Digital. Ausg.': 'Online-Ausgabe',
        'Online-Ausg.': 'Online-Ausgabe'
    };
    //var replpat = new RegExp('^(Digital\. Ausg\.|Online-Ausg\.)(?:[^$])+');
    var feld4243;
    var needFor3210 = false;
    for (var n in _felder424X) {
        if (!_felder424X.hasOwnProperty(n)) { continue; }
        for (var i in _felder424X[n]['c']) {
            if (!_felder424X[n]['c'].hasOwnProperty(i)) { continue; }
            if ('4243' == _felder424X[n]['p']) { // spacial language relation field 4248
                if (langpat.test(_felder424X[n]['c'][i])) {
                    needFor3210 = true;
                    feld4248 = _felder424X[n]['c'][i].replace(langpat, function (m) { return _lang[m[0] + m[1]]; });
                    activeWindow.title.insertText('4248 ' + feld4248 + " \n");
                }
                else {
                    feld4243 = _felder424X[n]['c'][i];
                    for (var r in _repl) {
                        if (!_repl.hasOwnProperty(r)) { continue; }
                        feld4243 = feld4243.replace(r, _repl[r]);
                    }
                    activeWindow.title.insertText(_felder424X[n]['p'] + ' Erscheint auch als$n' + feld4243 + " \n");
                }
            }
            else {
                activeWindow.title.insertText(_felder424X[n]['p'] + ' ' + _felder424X[n]['c'][i] + " \n");
            }
        }

    }

    if (needFor3210) {
        activeWindow.title.findTag2('4000', 0, true, true, true);
        activeWindow.title.startOfField(false);
        activeWindow.title.insertText('3210 ' + "\n");
    }
}

function __zdbIsRda() {
    if (_rec && _rec['010E'] && _rec['010E'].length > 0 &&
        _rec['010E'][0] && _rec['010E'][0]['e'] && _rec['010E'][0]['e'].length > 0) {
        return _rec['010E'][0]['e'][0] === 'rda';
    }
    return false;
}

/**
 * Deletes all occurrences of a specified field (tag) from the active window's title.
 *
 * @param {string} tag - The tag to search for and delete.
 * @param {boolean} [includeTag=true] - Whether to include the tag in the search.
 * @param {boolean} [moveToPosition=false] - Whether to move to the position of the found tag before deleting.
 * @returns {string} - A string containing all deleted lines, separated by newlines.
 */
function __zdbDeleteField(tag, includeTag, moveToPosition) {
    var y = 0,
        inc = (typeof includeTag === 'undefined') ? true : includeTag,
        move = (typeof moveToPosition === 'undefined') ? false : moveToPosition,
        deleted = '',
        current = '';
    while ('' != (current = activeWindow.title.findTag(tag, y, inc, move, true))) {
        deleted += current + "\n";
        activeWindow.title.deleteLine(1);
        y++;
    }
    return deleted;
}

function __zdbFeld424XGet() {

    // Verknüpfungsfelder einsammeln und auf verbale Form ändern
    var _felder424X = {
        '039B': { p: '4241', c: [] },
        '039C': { p: '4242', c: [] },
        '039D': { p: '4243', c: [] },
        '039E': { p: '4244', c: [] },
        '039X': { p: '4248', c: [] }
    };

    var re = new RegExp('^.*--->.(.+)$'); // 2014 Sonderh. zu u. ab 2015 Forts. als Online-Ausg. ---> Lexware-Unternehmer-Wissen
    var _exp, match, code, expText;
    var text = '';
    // Online-Routine braucht dann nur noch s# oder f#
    var _code = {
        's': 's#',
        'f': 'f#',
        'z': 'z#'
    };

    for (var f in _felder424X) //  f = 039.
    {
        if (!_felder424X.hasOwnProperty(f)) { continue; }
        if (ZDB._rec[f]) // Feld 039. vorhanden
        {
            for (var e in ZDB._rec[f]) // Wiederholungen
            {
                if (!ZDB._rec[f].hasOwnProperty(e)) { continue; }
                code = (ZDB.checkSF(f, 'b', e)) ? _code[ZDB._rec[f][e]['b'][0]] : '';
                if (ZDB.checkSF(f, 'a', e)) // Vortext vorhanden
                {
                    /*if('039E' != f || rda ) // kein Vortext für 4244 ohne rda
                    {
                        code += ZDB._rec[f][e]['a'][0];
                    }*/
                    code += ZDB._rec[f][e]['a'][0];
                } else { // kein Vortext
                    if ('039E' == f) // kein Vortext für 4244
                    {
                        if ('s#' == code) {
                            code += 'Fortgesetzt durch';
                        } else if ('f#' == code) {
                            code += 'Fortsetzung von';
                        }

                    }
                }

                if (ZDB.checkSF(f, '8', e)) // Expansion vhd.
                {
                    _exp = ZDB.parseExpansion(ZDB._rec[f][e][8][0]);
                    expText = ZDB.expansionToText(_exp); // Text with subfields $l and/or $t
                    _felder424X[f].c.push(code + expText); // $bf#Fortsetzung von$lVerantwortl$tTitel
                }
                else if (ZDB.checkSF(f, 'r', e)) // something like 039E $bs$r2014 Sonderh. zu u. ab 2015 Forts. als Online-Ausg. ---> Lexware-Unternehmer-Wissen
                {
                    match = ZDB._rec[f][e]['r'][0].match(re);
                    if (match) {
                        _felder424X[f].c.push(code + '$t' + match[1]);
                    } else {
                        _felder424X[f].c.push(code + '$t' + ZDB._rec[f][e]['r'][0]);
                    }
                }
                else if (ZDB.checkSF(f, 't', e)) {
                    text = code;
                    if (ZDB.checkSF(f, 'n', e)) text += '$n' + ZDB._rec[f][e]['n'][0];
                    if (ZDB.checkSF(f, 'l', e)) text += '$l' + ZDB._rec[f][e]['l'][0];
                    text += '$t' + ZDB._rec[f][e]['t'][0];
                    _felder424X[f].c.push(text);
                }
            }
        }
    }

    return _felder424X;
}

