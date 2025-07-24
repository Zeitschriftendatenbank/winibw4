function __zdbYesNo(msgtxt){
    var prompter = utility.newPrompter();
    return !prompter.confirmEx(messageBoxHeader,msgtxt,'Ja','Nein',null,null,null);
}

function __zdbGetFormat() {
    return (application.activeWindow.variable('P3GPR') || application.activeWindow.variable('P3GDB') || '').toUpperCase() || false;
}

/**
* Retrieves ZDBID from the current view or edit mode
* @param {string} idn optional
* @return {string|boolean} ZDBID or false
*/
function __zdbGetZDB(idn) {
    idn = idn || false;
    if (idn) {
        var myWindowId = __zdbOpenWorkWindow();
        application.activeWindow.commandLine('\zoe idn ' + idn);
    }

    var strScreen = __zdbCheckScreen(['8A', 'MT', 'IT'], 'Merke ZDBID');
    if (!strScreen) return false;

    var format = __zdbGetFormat();
    var cat = { 'D': '2110', 'DA': '2110', 'P': '006Z' }[format];
    var zdbid;

    if (format !== 'P') {
        zdbid = (strScreen === 'MT' || strScreen === 'IT') 
            ? application.activeWindow.title.findTag(cat, 0, false, false, true)
            : application.activeWindow.findTagContent(cat, 0, false).trim();
    } else {
        var field = (strScreen === 'MT' || strScreen === 'IT') 
            ? __zdbParseField(application.activeWindow.title.findTag(cat, 0, true, false, true))
            : __zdbParseField(application.activeWindow.findTagContent(cat, 0, true));
        zdbid = field[cat][0][0];
    }

    if (idn) __zdbCloseWorkWindow(myWindowId);

    return zdbid.replace(/\s+/g, '');
}

/**
* opens a new window for temporary works
*/
function __zdbOpenWorkWindow(){
    var myWindowId = application.activeWindow.windowID;
    application.newWindow();
    return myWindowId;
}

/**
* closes the window for temporary works and return to the old one
*/
function __zdbCloseWorkWindow(myWindowId){
    if(myWindowId == null) return false;
    application.activeWindow.closeWindow();
    application.activateWindow(myWindowId);
}

/**
* Expansion object to RDA fields
* @param {object} e created from __zdbParseExpansion()
* @return {string} RDA fields
*/
function __zdbExpansionToText(e){
    var text = '';
    if(e.norm)
    {
        text = '$l'+e.norm.a;
    }
    return text += '$t'+e.tit;
}

/**
 * Retrieves and parses a ZDB record in JSON format based on the given IDN.
 *
 * @param {string|boolean} idn - The IDN of the ZDB record to retrieve. If `false`, retrieves the current record.
 * @returns {Object} An object representing the parsed ZDB record, where each key corresponds to a category
 *                   and its value is an array of parsed field data. Includes a `katToString` method for
 *                   converting a category to a formatted string.
 *
 * @property {Function} katToString - A method to convert a specific category (`kat`) into a formatted string.
 *                                    The string includes all subfields and their values, separated by a delimiter.
 */
function __zdbJSON(idn){
    var _rec = {};
    idn = idn || false;

    // save format
    var format = __zdbGetFormat();

    var myWindowId = application.activeWindow.windowID;

    if(idn) // get zdb id of a different title in a work window
    {
        application.disableScreenUpdate(true);
        __zdbOpenWorkWindow();
        application.activeWindow.command('f idn '+idn,true);
    }

    if( 'P' != __zdbGetFormat() ) application.activeWindow.command('s p',false);

    var rec = __zdbGetExpansionFromP3VTX();


    // get array of lines
    var arrLines = rec.match(/(.+)/gm);

    // for each line
    for(var i = 0; i < arrLines.length; i += 1)
    {
        _line = __zdbParseField(arrLines[i]);

        // key is the category
        for(var key in _line)
        {
            if(_line.hasOwnProperty(key)) {
                // if key already exists
                if(_rec.hasOwnProperty(key))
                {
                    _rec[key].push(_line[key]);
                }
                else // key does not exist
                {
                    // always create an array
                    _rec[key] = [_line[key]];
                }
            }
        }
    }

    _rec.katToString = function (kat) {
        var string = '',
            i;
        for (i = 0; i < this[kat].length; i++) {
            string += "\n" + kat + ' ';
            for (var sub in this[kat][i]) {
                for(var x = 0; x < this[kat][i][sub].length; x++) {
                    string += delimiter + sub + this[kat][i][sub][x];
                }
            }
        }
        return string;
    };

    if(idn) // close work window and return to old
    {
        __zdbCloseWorkWindow(myWindowId);
        application.disableScreenUpdate(false);
    }
    // back to source format
    if('P' != format) application.activeWindow.command('s '+format,false);

    if(application.activeWindow.windowID != myWindowId) {
		__zdbCloseWorkWindow(myWindowId);
	}
    return _rec;
}


/**
* Liest ein Feldinhalt in ein Object
* Bsp.:
* 039E $bf$aFortsetzung von$9942987667$8--Cbvz--Deutsche Zentralbücherei für Blinde zu Leipzig: DZB-Nachrichten
* wird zu
* {
*   "039E":
*   {
*      "b": ["f"],
*      "a": ["Fortsetzung von"],
*      "9": ["942987667"],
*      "8": ["--Cbvz--Deutsche Zentralbücherei für Blinde zu Leipzig: DZB-Nachrichten"]
*   }
* }
*
* Zugriff: obj['039E'][9][0] --> "942987667"
* Zugriff: obj['039E']['b'][0] --> "f"
*
* 017A $aee$amg$anw wird zu
* {
*   "017A":
*   {
*       "a": ["ee","mg","nw"]
*   }
* }
* Zugriff: obj['017A']['a'][0] --> "ee"
* Zugriff: obj['017A']['a'][1] --> "mg"
*/
function __zdbParseField(field){
    var _field = {};
    var arr = field.match(/^([^\s]+)\s(.+)/);
    var split = arr[2].split(delimiter);
    var subfield = {};
    for(var x = 1; x < split.length; x++)
    {
        if(subfield[split[x][0]])
        {
            subfield[split[x][0]].push(split[x].slice(1));
        }
        else
        {
            subfield[split[x][0]] = [split[x].slice(1)];
        }

    }
    _field[arr[1]] = subfield;
    return _field;
}

/**
* Liest Expansion in ein Object
*
* Bsp.: --Abvz--International Legal Center$xAllgemeine Unterteilung$gNew York, NY$BVerfasser: [????test]
* wird zu
* {
*   norm: {
*           a: "International Legal Center",
*           x: "Allgemeine Unterteilung",
*           g: "New York, NY",
*           B: "Verfasser"
*   },
*   tit: "????test"
* }
*
* weitere Tests:
* --Abvz--: Adreß- und Geschäftshandbuch für den k[öniglich] b[ayerischen] Markt Berchtesgaden und Berchtesgadener-Land
*
* --Abvz--International Legal Center$xAllgemeine Unterteilung$gNew York, NY$BVerfasser: Adreß- und Geschäftshandbuch für den k[öniglich] b[ayerischen] Markt Berchtesgaden und Berchtesgadener-Land
*
* --Abvz--International Legal Center$xAllgemeine Unterteilung$gNew York, NY$BVerfasser: [????test]
*
* --Abvz--: [????test]
*
* --Advz--Magyar Tudományos Akadémia$bTörténettudományi Osztály [Tb1]$BVerfasser: Értekezések a Történettudományi Osztály köréb?l
*/
function __zdbParseExpansion(exp){
    var split;
    var _exp = {};
    var re = /(?:--[^-]+--)([^:]*)(?::\s(?:(?:\[(.+)\])|(?:(.+)))?)?/;
    var matches =  re.exec(exp);
    if(matches) {
        // Titel nach :\s
        if(matches[2]) {
            _exp.tit = matches[2];
        } else {
            _exp.tit = matches[3];
        }
        //Normdaten
        if(matches[1])
        {
            _exp.norm = {};
            split = matches[1].split('$');
            for(var i = 0; i < split.length; i++)
            {
                if(0 == i)
                {
                    _exp.norm.a = split[i];
                }
                else
                {
                    _exp.norm[split[i][0]] = split[i].slice(1);
                }
            }
        }
    }
    return _exp;
}

/**
 * Extracts and processes the expansion data from the 'P3VTX' variable in the active application window.
 * The function performs a series of string replacements and cleanups to format the data.
 *
 * @returns {string} The processed and unescaped expansion data.
 */
function __zdbGetExpansionFromP3VTX(){
    satz = application.activeWindow.variable('P3VTX')
        .replace('<ISBD><TABLE>','')
        .replace('<\/TABLE>','')
        .replace(/<BR>/g,"\n")
        .replace(/^$/gm,'')
        .replace(/^Eingabe:.*$/gm,'')
        .replace(/^Mailbox:.*$/gm,'')
        .replace(/<a[^<]*>/g,'')
        .replace(/<\/a>/g,'')
        .replace(/\r/g, "\n")
        .replace(/\u001b./g,''); // replace /n (Zeilenumbruch) entfernt,
    // weil hier die $8 Expansion durch Zeilenbruch abgetrennt wurde
    return __zdbUnescapeHtml(satz);
}

/**
 * Replaces HTML escaped chars to unescaped
 * @param {string} text with html escaped chars
 * @return {string} text with unescaped chars
 */
function __zdbUnescapeHtml(text){
    var map = {
        '&amp;' : '&',
        '&lt;' : '<',
        '&gt;': '>',
        '&quot;' : '"',
        '&#039;' : "'",
        '&nbsp;' : " "
    };
    return text.replace(/&amp;|&lt;|&gt;|&quot;|&#039;|&nbsp;/g, function(m) { return map[m]; });
}

/**
 * Retrieves a record in a specified format and mode from the application.
 *
 * @param {string} format - The format of the record to retrieve. Must be either 'P' or 'D'.
 * @param {boolean} extmode - If true, retrieves the expanded record using a specific method; 
 *                            otherwise, retrieves the title directly.
 * @returns {string|boolean} The retrieved record as a string with a newline appended, or `false` 
 *                           if an error occurs or the screen check fails.
 *
 * @throws {Error} Alerts the user if the provided format is invalid.
 */
function __zdbGetRecord(format, extmode){

    var scr = __zdbCheckScreen(['7A','8A'],'Parallelausgabe');
    if(false == scr) return false;

    var satz = null;

    if ( (format != 'P') && (format != 'D') ) {
        return alert('Funktion getRecord mit falschem Format "' + format
                    + "\"aufgerufen.\n"
                    + 'Bitte wenden Sie sich an Ihre Systembetreuer.');
    }
    application.activeWindow.command('show ' + format, false);
    if (extmode) {
        satz = __zdbGetExpansionFromP3VTX();
    } else {
        satz = application.activeWindow.copyTitle();
        //satz = satz.replace(/\r/g,'');
    }
    if (scr == '7A')
        application.activeWindow.simulateIBWKey('FE');
    else
    if (format == 'P')
        application.activeWindow.command('show D',false);
    satz = satz + "\n";
    return satz;
}

__zdbArrayUnique = function(arr) {
    var r = [];
    o:for(var i = 0, n = arr.length; i < n; i++)
    {
        for(var x = 0, y = r.length; x < y; x++)
        {
            if(r[x]==arr[i]) continue o;
        }
        r[r.length] = arr[i];
    }
    return r;
}

function __zdbArrayDiff(a1, a2){
    for (var i = 0; i < a2.length; i++) {
        for(var y = 0; y < a1.length; y++)
        {
            if (a2[i] === a1[y])
            {
                a1.splice(y,1);
            }
        }
    }
    return a1;
}

/**
* Check if subfield exists with specific content
* @return {bool}
*/
function __zdbCheckSF(kat,sf,i,c){
    i = i || 0;
    c = c || false;
    if(!_rec[kat]) return false;
    if(!_rec[kat][i][sf]) return false;
    if(c) {
        for(var x in _rec[kat][i][sf]) {
            if(!_rec[kat][i][sf].hasOwnProperty(x)) {continue;}
            if(_rec[kat][i][sf][x] == c) return true;
        }
        return false;
    }
    return true;
}