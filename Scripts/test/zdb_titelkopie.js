function __zdbNormdatenKopie(){
    // Titelkopie auf zdb_titeldatenkopie.ttl setzen
    application.activeWindow.titleCopyFile = '%__APPDIR__%ttFiles\\gnd_title.ttl';

    application.overwriteMode = false;
    var idn = application.activeWindow.variable('P3GPP'),
    typ = application.activeWindow.variable('P3VMC');
    application.activeWindow.command('show d', false);
    application.activeWindow.copyTitle();
    application.activeWindow.command('ein n', false);
    application.activeWindow.title.insertText(" *** Normdatenkopie *** \n");
    application.activeWindow.pasteTitle();
    application.activeWindow.title.endOfBuffer(false);

    if (typ == 'Tb' || typ == 'Tg') {
        application.activeWindow.title.insertText('??? !' + idn + '!');
    }
    //application.activeWindow.title.startOfBuffer(false);
    application.activeWindow.title.findTag('005', 0, false, true, true);
    application.activeWindow.title.endOfField(false);
}

function __zdbTiteldatenKopie(){

    var _rec = __zdbJSON();

    // Überschrift und IDN einfügeng
    application.overwriteMode = false;
    var idn = application.activeWindow.variable('P3GPP');
    application.activeWindow.command('show d', false);
    // Titelkopie auf zdb_titeldatenkopie.ttl setzen
    application.activeWindow.titleCopyFile = '%__APPDIR__%ttFiles\\zdb_titeldatenkopie.ttl';
    application.activeWindow.copyTitle();
    application.activeWindow.command('ein t', false);
    application.activeWindow.title.insertText(" *** Titeldatenkopie *** \n");
    application.activeWindow.pasteTitle();
    application.activeWindow.title.endOfBuffer(false);
    application.activeWindow.title.insertText('???? !' + idn + '!');
    application.activeWindow.clipboard = idn;

    if(!_rec['002C']) { // 0501 Inhaltstyp
        application.activeWindow.title.findTag('0500', 0, false, true, false);
        application.activeWindow.title.endOfField(false);
        application.activeWindow.title.insertText("\n0501 $btxt");
        _rec['002C'] = [{'b':['txt']}];
    }
    if(!_rec['002D']) { // 0502 Medientyp
        __zdbMediatype();
        application.activeWindow.title.insertText("\n0502 $b" + _rec['002D'][0]['b'][0]);
    }
    if(!_rec['002E']) { // 0503 Datenträgertyp
        __zdbDatentraeger();
        application.activeWindow.title.insertText("\n0503 $b" + _rec['002E'][0]['b'][0]);
    }
    // Ersetzungen in Kategorie 0600
    var codes0600;
    if('' != (codes0600 = application.activeWindow.title.findTag('0600', 0, false, true, true)))
    {
        var _codes0600 = codes0600.split(';');
        var _codes = __zdbArrayDiff(_codes0600, ['ee', 'mg', 'nw', 'vt', 'ra', 'rb', 'ru', 'rg']);
        if(0 < _codes.length)
        {
             application.activeWindow.title.insertText(_codes.join(';'));
        }
        else
        {
            application.activeWindow.title.deleteLine(1);
        }
    }

    var feld4000 = __zdbTitelAnpassen();
    application.activeWindow.title.insertText(feld4000+"\n");
    application.activeWindow.title.findTag('0500', 0, false, true, true);
    application.activeWindow.title.endOfField(false);
    application.activeWindow.title.insertText('xz');
    application.activeWindow.title.endOfBuffer(false);
    application.activeWindow.title.insertText("\n");
}

/**
* Der Inhalt von 0503 ist abhängig von 0500 und 0502
*
* Die Funktion erwartet ein globales Objekt _rec
* Der Medientyp wird in _rec['002E'][0]['b'][0] geschrieben
*/
function __zdbDatentraeger() {
    var datentraegerMap = {
        'A': 'nc',
        'O': 'cr'
    };
    var gattung    = _rec['002@'][0]['0'][0], // 0500
        gtt        = gattung.substr(0,1);
    if(!datentraegerMap.hasOwnProperty(gtt)) {
        _rec['002E'] = [{'b':[_rec['002D'][0]['b'][0] + '?']}];
        return;
    }
    _rec['002E'] = [{'b':[datentraegerMap[gtt]]}];
}

/**
* Der Inhalt von 0502 ist abhängig von 0500 und 0501
*
* Die Funktion erwartet ein globales Objekt _rec
* Der Medientyp wird in _rec['002D'][0]['b'][0] geschrieben
*/
function __zdbMediatype() {

    var mediamap = {
        'A': {'def': 'n'},
        'C': {'def': 'n'},
        'S': {'prm': 's', 'tdi': 'v', 'snd': 's', 'spw': 's', 'def': 'c'},
        'O': {'prm': 's', 'tdi': 'v', 'snd': 's', 'spw': 's', 'def': 'c'},
        'B': {'prm': 's', 'tdi': 'v', 'snd': 's', 'spw': 's', 'def': 'z'},
        'E': {'def': 'h'}
    },
        gattung    = _rec['002@'][0]['0'][0], // 0500
        gtt        = gattung.substr(0,1),
        inhaltstyp = _rec['002C'][0]['b'][0]; // 0501

    if(!mediamap[gtt][inhaltstyp]) {
         _rec['002D'] = [{'b':[mediamap[gtt]['def']]}];
         return;
    }

    _rec['002D'] = [{'b':[mediamap[gtt][inhaltstyp]]}];
}

function zdb_Datensatzkopie() {
    if(false == __zdbCheckScreen(['8A'],'Datensatzkopie')) return false;
    //Persönliche Einstellung des Titelkopie-Pfades ermitteln
    var titlecopyfileStandard = application.getProfileString('winibw.filelocation', 'titlecopy', '');
    if (application.activeWindow.materialCode.charAt(0) == 'T') {
        __zdbNormdatenKopie();
        } else {
        __zdbTiteldatenKopie();
    }
    //Wiederherstellen des ursprünglichen Pfades der Titelkopie-Datei:
    application.activeWindow.titleCopyFile = titlecopyfileStandard;
}

function zdb_Digitalisierung() {
    if(false == __zdbCheckScreen(['8A'],'Digitalisierung')) return false;
    // Prüfen, ob Titeldatensatz mit bibliographischer Gattung 'A' aufgerufen, bei 'T' oder 'O' Fehlermeldung ausgeben
    var matCode = application.activeWindow.materialCode.charAt(0);
    if(matCode == 'T' || matCode == 'O') {
        application.messageBox('Digitalisierung', 'Die Funktion kann nur für Titelsätze des Satztyps "A" verwendet werden.', 'alert-icon');
        return false;
    }
    // Titelkopie auf zdb_titeldatenkopie_digi.ttl setzen
    var titlecopyfileStandard = application.getProfileString('winibw.filelocation', 'titlecopy', '');
    var idn = application.activeWindow.variable('P3GPP');
    var showComment = " *** Titeldatenkopie Digitalisierung *** \n"
    if(!__zdbOnlineRessource('%__APPDIR__%ttFiles\\zdb_titeldatenkopie_digi.ttl',showComment,['ld','dm'],true)) return false;

    application.activeWindow.title.endOfBuffer(false);
    application.activeWindow.title.insertText("\n4256 Elektronische Reproduktion von!" + idn + "!\n");

    application.activeWindow.title.endOfBuffer(false);
    application.activeWindow.title.insertText('4201 Gesehen am ++');
    application.activeWindow.title.charLeft(1,false);
    //Wiederherstellen des ursprünglichen Pfades der Titelkopie-Datei:
    application.activeWindow.titleCopyFile = titlecopyfileStandard;
}

function zdb_Parallelausgabe(){
    if(false == __zdbCheckScreen(['8A'],'Parallelausgabe')) return false;
    // Prüfen, ob Titeldatensatz mit bibliographischer Gattung 'A' aufgerufen, bei 'T' oder 'O' Fehlermeldung ausgeben
    var matCode = application.activeWindow.materialCode.charAt(0);
    if(matCode == 'T' || matCode == 'O') {
        application.messageBox('Digitalisierung', 'Die Funktion kann nur für Titelsätze des Satztyps "A" verwendet werden.', 'alert-icon');
        return false;
    }

    // Titelkopie auf zdb_titeldatenkopie_digi.ttl setzen
    var titlecopyfileStandard = application.getProfileString('winibw.filelocation', 'titlecopy', '');
    var idn = application.activeWindow.variable('P3GPP');
    var showComment = " *** Titeldatenkopie Parallelausgabe *** \n";
    if(!__zdbOnlineRessource('%__APPDIR__%ttFiles\\zdb_titeldatenkopie_parallel.ttl',showComment,[],false)) return false;

    // Kategorie 4234: anlegen und mit Text '4243 Erscheint auch als$nDruckausgabe![...IDN...]!' befüllen
    application.activeWindow.title.endOfBuffer(false);
    application.activeWindow.title.insertText("\n4243 Erscheint auch als$nDruck-Ausgabe!" + idn + "!\n");

    // Kategorie 4213: individuell gefüllt oder leer ausgeben
    application.activeWindow.title.endOfBuffer(false);
    application.activeWindow.title.insertText('4201 Gesehen am ++');
    application.activeWindow.title.charLeft(1,false);

    //Wiederherstellen des ursprünglichen Pfades der Titelkopie-Datei:
    application.activeWindow.titleCopyFile = titlecopyfileStandard;
}

function __zdbTitelAnpassen()
{
    // Titel anpassen
    var feld4000 = application.activeWindow.title.findTag('4000',0, true, true, true);
    application.activeWindow.title.deleteLine(1);

    if(__zdbCheckSF('021A','e')) // Körperschaftsergänzungen vhd.
    {
        for(var e in _rec['021A'][0]['e'])
        {
            if(!_rec['021A'][0]['e'].hasOwnProperty(e)) {continue;}
            feld4000 = feld4000.replace(' // '+_rec['021A'][0]['e'][e],'');
        }

        if(!__zdbCheckSF('021A','h')) // Verfasserangabe nicht vhd.
        {
            feld4000 += ' / '+_rec['021A'][0]['e'][0];
        }
    }

    if(__zdbCheckSF('021A','n')) // Materialbenennung vhd.
    {
        feld4000 = feld4000.replace(' [['+_rec['021A'][0]['n'][0]+']]','');
    }

    return feld4000;
}

function __zdbOnlineRessource(copyFile, showComment, add0600, digi) {
    
    // set global variable _rec
    var _rec = __zdbJSON();

    var _felder424X = __zdbFeld424XGet();

    // Titelaufnahme kopieren und neue Titelaufnahme anlegen
    application.overwriteMode = false;
    application.activeWindow.command('show d', false);
    application.activeWindow.titleCopyFile = copyFile;
    application.activeWindow.copyTitle();
    application.activeWindow.command('ein t', false);
    if(showComment != false) application.activeWindow.title.insertText(showComment);
    application.activeWindow.pasteTitle();


    // Kategorie 0500: Bibliographische Gattung/Status ändern
    var f0500 = application.activeWindow.title.findTag('0500', 0, false, true, true);
    f0500 = f0500.replace('A', 'O');
    f0500 = f0500.replace('v', 'x');
    application.activeWindow.title.insertText(f0500);

    if(!_rec['002C']) application.activeWindow.title.insertText("\n0501 $btxt");
    // wird schon in zdb_titeldatenkopie_digi gemacht
    //if(!_rec['002D']) application.activeWindow.title.insertText("\n0502 $bc");
    //if(!_rec['002E']) application.activeWindow.title.insertText("\n0503 $bcr");

    // Feld 0600
    // Feld 600 must be deleted in ttlcopy
    add0600 = typeof add0600 !== 'undefined' ? add0600 : [];
    if(!add0600)  {add0600 = [];}
    if(_rec['017A'])
    {
        var _codes = __zdbArrayDiff(_rec['017A'][0]['a'], ['es', 'ks', 'sf', 'sm', 'mg', 'mm', 'nw', 'ra', 'rb', 'rc', 'rg', 'ru', 'ee', 'vt']);
        // join arrays
        _codes = _codes.concat(add0600);

        if(0 < _codes.length)
        {
            application.activeWindow.title.insertText("\n0600 "+ _codes.join(';'));
        }
    }
    else if(0 < add0600.length)
    {
        application.activeWindow.title.insertText("\n0600 "+ add0600.join(';'));
    }


    if(!_rec['010@']) application.activeWindow.title.insertText("\n1500 ");

    if(typeof digi === 'object') {
        for(var x in digi)
        {
            if(!digi.hasOwnProperty(x)) {continue;}
            application.activeWindow.title.endOfBuffer(false);
            application.activeWindow.title.insertText(digi[x].kat + digi[x].cont + "\n");
        }
    } else if(digi !== false) {
        application.activeWindow.title.insertText("\n1109 "+application.getProfileString('zdb.userdata.digiconfig', '1109', ''));
        application.activeWindow.title.insertText("\n1101 "+application.getProfileString('zdb.userdata.digiconfig', '1101', ''));
        application.activeWindow.title.insertText("\n1700 "+application.getProfileString('zdb.userdata.digiconfig', '1700', ''));
        application.activeWindow.title.insertText("\n2050 "+application.getProfileString('zdb.userdata.digiconfig', '2050', ''));
        application.activeWindow.title.insertText("\n2051 "+application.getProfileString('zdb.userdata.digiconfig', '2051', ''));
    }

    // Kategorie 4215,4225 ändern
    var content,y;
    var fieldmap = {
        '4215': '4201 ',
        '4225': '4201 '
    };
    for(var m in fieldmap)
    {
        if(!fieldmap.hasOwnProperty(m)) {continue;}
        content = '';
        y = 0;
        while( (content = application.activeWindow.title.findTag(m, y, false, true, true)) !='')
        {
            application.activeWindow.title.deleteLine(1);
            application.activeWindow.title.insertText(fieldmap[m] + content + "\n");
            y++;
        }
    }

    // neues Feld für Sekundärköperschaft 312X -> 311X
    content = '';
    y = 0;
    while( (content = application.activeWindow.title.findTag('312', y, false, true, true)) !='')
    {
        application.activeWindow.title.deleteLine(1);
        application.activeWindow.title.insertText('311' + y + ' '+content + '$4isb');
        y++;
    }

    y = 0;
    while('' != application.activeWindow.title.findTag('311', y, false, true, true))
    {
        if(!/\$4isb/.test(application.activeWindow.title.selection))
        {
            application.activeWindow.title.endOfField(false);
            application.activeWindow.title.insertText("$4isb\n");
        }
        y++;
    }

    var feld4000 = __zdbTitelAnpassen();
    application.activeWindow.title.insertText(feld4000+"\n");

    if(digi === true)
    {
        application.activeWindow.title.insertText("\n4048 "+application.getProfileString('zdb.userdata.digiconfig', '4048', ''));
        application.activeWindow.title.insertText("\n4085 "+application.getProfileString('zdb.userdata.digiconfig', '4085', ''));
        application.activeWindow.title.insertText("\n4119 "+application.getProfileString('zdb.userdata.digiconfig', '4119', ''));
        application.activeWindow.title.insertText("\n4237 "+application.getProfileString('zdb.userdata.digiconfig', '4237', ''));
    }
    // Kategorie 4212 mit neuem Vortext
    if(_rec['046C'])
    {
        for(var c in _rec['046C'])
        {
            if(!_rec['046C'].hasOwnProperty(c)) {continue;}
            application.activeWindow.title.insertText("\n4212 Abweichender Titel: "+_rec['046C'][c]['a'][0]);
        }
    }
    if(digi === true)
    {
        application.activeWindow.title.insertText("\n4233 "+application.getProfileString('zdb.userdata.digiconfig', '4233', ''));
    }
    application.activeWindow.title.insertText("\n");
    application.activeWindow.title.endOfBuffer(false);

    __zdbFeld424XSet(_felder424X);

    return true;
}

function __zdbFeld424XSet(_felder424X)
{
    var _lang = {
        'Dt':'Parallele Sprachausgabe$ndeutsch',
        'Fr':'Parallele Sprachausgabe$nfranzösisch',
        'En':'Parallele Sprachausgabe$nenglisch',
        'Sp':'Parallele Sprachausgabe$nspanisch'
    };
    var langpat = new RegExp('^(Dt|Fr|En|Sp)(?:[^$])+','i');
    var feld4248;
    var _repl = {
        'Digital. Ausg.': 'Online-Ausgabe',
        'Online-Ausg.': 'Online-Ausgabe'
    };
    //var replpat = new RegExp('^(Digital\. Ausg\.|Online-Ausg\.)(?:[^$])+');
    var feld4243;
    var needFor3210 = false;
    for(var n in _felder424X)
    {
        if(!_felder424X.hasOwnProperty(n)) {continue;}
        for(var i in _felder424X[n]['c'])
        {
            if(!_felder424X[n]['c'].hasOwnProperty(i)) {continue;}
            if('4243' == _felder424X[n]['p']) { // spacial language relation field 4248
                if(langpat.test(_felder424X[n]['c'][i]))
                {
                    needFor3210 = true;
                    feld4248 = _felder424X[n]['c'][i].replace(langpat, function(m) {return _lang[m[0]+m[1]]; });
                    application.activeWindow.title.insertText('4248 '+ feld4248+" \n");
                }
                else
                {
                    feld4243 = _felder424X[n]['c'][i];
                    for(var r in _repl)
                    {
                        if(!_repl.hasOwnProperty(r)) {continue;}
                        feld4243 = feld4243.replace(r,_repl[r]);
                    }
                    application.activeWindow.title.insertText(_felder424X[n]['p']+ ' Erscheint auch als$n'+ feld4243+" \n");
                }
            }
            else
            {
                application.activeWindow.title.insertText(_felder424X[n]['p']+ ' '+ _felder424X[n]['c'][i]+" \n");
            }
        }

    }

    if(needFor3210)
    {
        application.activeWindow.title.findTag2('4000',0, true, true, true);
        application.activeWindow.title.startOfField(false);
        application.activeWindow.title.insertText('3210 '+"\n");
    }
}


function __zdbFeld424XGet()
{

    // Verknüpfungsfelder einsammeln und auf verbale Form ändern
    var _felder424X = {
        '039B' : {p:'4241',c:[]},
        '039C' : {p:'4242',c:[]},
        '039D' : {p:'4243',c:[]},
        '039E' : {p:'4244',c:[]},
        '039X' : {p:'4248',c:[]}
    };

    var re = new RegExp('^.*--->.(.+)$'); // 2014 Sonderh. zu u. ab 2015 Forts. als Online-Ausg. ---> Lexware-Unternehmer-Wissen
    var _exp, match, code, expText;
    var text = '';
    // Online-Routine braucht dann nur noch s# oder f#
    var _code = {
        's':'s#',
        'f':'f#',
        'z': 'z#'
    };

    for(var f in _felder424X) //  f = 039.
    {
        if(!_felder424X.hasOwnProperty(f)) {continue;}
        if(_rec[f]) // Feld 039. vorhanden
        {
            for(var e in _rec[f]) // Wiederholungen
            {
                if(!_rec[f].hasOwnProperty(e)) {continue;}
                code = (__zdbCheckSF(f,'b',e)) ? _code[_rec[f][e]['b'][0]] : '';
                if(__zdbCheckSF(f,'a',e)) // Vortext vorhanden
                {
                    /*if('039E' != f || rda ) // kein Vortext für 4244 ohne rda
                    {
                        code += _rec[f][e]['a'][0];
                    }*/
                    code += _rec[f][e]['a'][0];
                } else { // kein Vortext
                    if('039E' == f) // kein Vortext für 4244
                    {
                        if('s#' == code) {
                            code += 'Fortgesetzt durch';
                        } else if('f#' == code) {
                            code += 'Fortsetzung von';
                        }

                    }
                }

                if(__zdbCheckSF(f,'8',e)) // Expansion vhd.
                {
                    _exp = __zdbParseExpansion(_rec[f][e][8][0]);
                    expText = __zdbExpansionToText(_exp); // Text with subfields $l and/or $t
                    _felder424X[f].c.push(code+expText); // $bf#Fortsetzung von$lVerantwortl$tTitel
                }
                else if(__zdbCheckSF(f,'r',e)) // something like 039E $bs$r2014 Sonderh. zu u. ab 2015 Forts. als Online-Ausg. ---> Lexware-Unternehmer-Wissen
                {
                    match = _rec[f][e]['r'][0].match(re);
                    if(match)
                    {
                        _felder424X[f].c.push(code+'$t'+match[1]);
                    } else {
                        _felder424X[f].c.push(code+'$t'+_rec[f][e]['r'][0]);
                    }
                }
                else if(__zdbCheckSF(f,'t',e))
                {
                    text = code;
                    if(__zdbCheckSF(f,'n',e)) text += '$n'+_rec[f][e]['n'][0];
                    if(__zdbCheckSF(f,'l',e)) text += '$l'+_rec[f][e]['l'][0];
                    text += '$t'+_rec[f][e]['t'][0];
                    _felder424X[f].c.push(text);
                }
            }
        }
    }

    return _felder424X;
}

