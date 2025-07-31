function __zdbYesNo(msgtxt) {
    return utility.newPrompter().confirm('Ihre Entscheidung', msgtxt);
}

function __zdbGetFormat() {
    var format = "";
    var p3gpr = activeWindow.getVariable('P3GPR');
    var p3gdb = activeWindow.getVariable('P3GDB');
    if (p3gpr) {
        format = p3gpr;
    } else if (p3gdb) {
        format = p3gdb;
    }
    format = format.toUpperCase();
    return format;
}

/**
* Retrieves ZDBID from the current view or edit mode
* @param {string} idn optional
* @return {string|boolean} ZDBID or false
*/
function __zdbGetZDB(idn) {
    idn = idn || false;
    if (idn) {
        var myWindowId = activeWindow.windowID;
        activeWindow.commandLine('\zoe idn ' + idn);
    }

    var strScreen = __zdbCheckScreen(['8A', 'MT', 'IT'], 'Merke ZDBID');
    if (!strScreen) return false;

    var format = __zdbGetFormat();
    var cat = { 'D': '2110', 'DA': '2110', 'P': '006Z' }[format];
    var zdbid;

    if (format !== 'P') {
        zdbid = (strScreen === 'MT' || strScreen === 'IT')
            ? activeWindow.title.findTag(cat, 0, false, false, true)
            : activeWindow.findTagContent(cat, 0, false).trim();
    } else {
        var field = (strScreen === 'MT' || strScreen === 'IT')
            ? __zdbParseField(activeWindow.title.findTag(cat, 0, true, false, true))
            : __zdbParseField(activeWindow.findTagContent(cat, 0, true));
        zdbid = field[cat][0][0];
    }

    if (idn) {
        activateWindow(myWindowId);
    }

    return zdbid.replace(/\s+/g, '');
}

/**
* Expansion object to RDA fields
* @param {object} e created from __zdbParseExpansion()
* @return {string} RDA fields
*/
function __zdbExpansionToText(e) {
    var text = '';
    if (e.norm) {
        text = '$l' + e.norm.a;
    }
    return text += '$t' + e.tit;
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
function __zdbJSON(idn) {
    var _rec = {};
    idn = idn || false;

    // save format
    var format = __zdbGetFormat();

    var myWindowId = activeWindow.windowID;

    if (idn) // get zdb id of a different title in a work window
    {
        activeWindow.command('f idn ' + idn, true);
    }

    if ('P' != __zdbGetFormat()) activeWindow.command('s p', false);

    var rec = __zdbGetExpansionFromP3VTX();
    // get array of lines
    var arrLines = rec.match(/(.+)/gm);
    // for each line
    var i = 0;
    while (i < arrLines.length) {
        var _line = __zdbParseField(arrLines[i]);
        // key is the category
        for (var key in _line) {
            if (_line.hasOwnProperty(key)) {
                // if key already exists
                if (_rec.hasOwnProperty(key)) {
                    _rec[key].push(_line[key]);
                } else { // key does not exist
                    // always create an array
                    _rec[key] = [_line[key]];
                }
            }
        }
        i++;
    }

    _rec.katToString = function (kat) {
        var string = '',
            i;
        for (i = 0; i < this[kat].length; i++) {
            string += "\n" + kat + ' ';
            for (var sub in this[kat][i]) {
                for (var x = 0; x < this[kat][i][sub].length; x++) {
                    string += zdb.delimiter + sub + this[kat][i][sub][x];
                }
            }
        }
        return string;
    };

    // back to source format
    if ('P' != format) activeWindow.command('s ' + format, false);

    if (activeWindow.windowID != myWindowId) {
        activateWindow(myWindowId);
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
function __zdbParseField(field) {
    var _field = {};
    var arr = field.match(/^([^\s]+)\s(.+)/);
    if (!arr || arr.length < 3) {
        // Return empty object or handle error gracefully
        return {};
    }

    var split = arr[2].split(zdb.delimiter);

    var subfield = {};
    var x = 1;
    while (x < split.length) {
        if (!split[x] || split[x].length === 0) {
            x++;
            continue;
        }
        // In JScript, use .charAt(0) instead of [0] for first character
        var sfTag = split[x].charAt(0);
        var sfValue = split[x].slice(1);
        if (typeof subfield[sfTag] !== 'undefined') {
            subfield[sfTag].push(sfValue);
        } else {
            subfield[sfTag] = [sfValue];
        }
        x++;
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
function __zdbParseExpansion(exp) {
    var split;
    var _exp = {};
    var re = /(?:--[^-]+--)([^:]*)(?::\s(?:(?:\[(.+)\])|(?:(.+)))?)?/;
    var matches = re.exec(exp);
    if (matches) {
        // Titel nach :\s
        if (matches[2]) {
            _exp.tit = matches[2];
        } else {
            _exp.tit = matches[3];
        }
        //Normdaten
        if (matches[1]) {
            _exp.norm = {};
            split = matches[1].split('$');
            for (var i = 0; i < split.length; i++) {
                if (0 == i) {
                    _exp.norm.a = split[i];
                }
                else {
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
function __zdbGetExpansionFromP3VTX() {
    var satz = activeWindow.getVariable('P3VTX')
        .replace('<ISBD><TABLE>', '')
        .replace('<\/TABLE>', '')
        .replace(/<BR>/g, "\n")
        .replace(/^$/gm, '')
        .replace(/^Eingabe:.*$/gm, '')
        .replace(/^Mailbox:.*$/gm, '')
        .replace(/<a[^<]*>/g, '')
        .replace(/<\/a>/g, '')
        .replace(/\r/g, "\n")
        .replace(/\u001b./g, ''); // replace /n (Zeilenumbruch) entfernt,
    // weil hier die $8 Expansion durch Zeilenbruch abgetrennt wurde
    return __zdbUnescapeHtml(satz);
}

/**
 * Replaces HTML escaped chars to unescaped
 * @param {string} text with html escaped chars
 * @return {string} text with unescaped chars
 */
function __zdbUnescapeHtml(text) {
    var map = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'",
        '&nbsp;': " "
    };
    return text.replace(/&amp;|&lt;|&gt;|&quot;|&#039;|&nbsp;/g, function (m) { return map[m]; });
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
function __zdbGetRecord(format, extmode) {
    var scr = __zdbCheckScreen(['7A', '8A'], 'zdbGetRecord');
    if (false == scr) return false;

    var satz = null;

    if ((format != 'P') && (format != 'D')) {
        return alert('Funktion getRecord mit falschem Format "' + format
            + "\"aufgerufen.\n"
            + 'Bitte wenden Sie sich an Ihre Systembetreuer.');
    }
    activeWindow.command('show ' + format, false);
    if (extmode) {
        satz = __zdbGetExpansionFromP3VTX();
    } else {
        satz = activeWindow.copyTitle();
        //satz = satz.replace(/\r/g,'');
    }
    if (scr == '7A')
        activeWindow.simulateIBWKey('FE');
    else
        if (format == 'P')
            activeWindow.command('show D', false);
    satz = satz + "\n";
    return satz;
}

/**
 * Returns a new array containing only the unique elements from the input array.
 * Preserves the order of the first occurrence of each element.
 *
 * @param {Array} arr - The array to filter for unique values.
 * @returns {Array} A new array with duplicate values removed.
 */
function __zdbArrayUnique(arr) {
    var r = [];
    o: for (var i = 0, n = arr.length; i < n; i++) {
        for (var x = 0, y = r.length; x < y; x++) {
            if (r[x] == arr[i]) continue o;
        }
        r[r.length] = arr[i];
    }
    return r;
}

/**
 * Removes all elements from the first array (`a1`) that are present in the second array (`a2`).
 * Modifies the original `a1` array and returns it.
 *
 * @param {Array} a1 - The array to remove elements from.
 * @param {Array} a2 - The array containing elements to remove from `a1`.
 * @returns {Array} The modified `a1` array with elements removed.
 */
function __zdbArrayDiff(a1, a2) {
    for (var i = 0; i < a2.length; i++) {
        for (var y = 0; y < a1.length; y++) {
            if (a2[i] === a1[y]) {
                a1.splice(y, 1);
            }
        }
    }
    return a1;
}

/**
* Check if subfield exists with specific content
* @return {bool}
*/
function __zdbCheckSF(kat, sf, I, C) {
    var i = I || 0;
    var c = C || false;
    
    if (typeof zdb._rec[kat] === 'undefined') return false;
    if (typeof zdb._rec[kat][i][sf] === 'undefined') return false;
    
    if (c) {
        var x = 0;
        while (x < zdb._rec[kat][i][sf].length) {
            if (zdb._rec[kat][i][sf][x] == c) return true;
            x++;
        }
        return false;
    } 
    return true;
}

/**
* Inserts a subfield with content
*
* @param {string} field the field for the subfield
* @param {string} subfield the subfield tag
* @param {string} content the content of the subfield
* @param {string} pos optional: the subfield position 0 ... x
* @param {string} pos optional: the occurence of a repeatable field 0 ... x
*/
function __zdbInsertSubfield(field, subfield, content, pos, occ) {
    var data = '',
        splitted = [];
    if (typeof occ === 'undefined') {
        occ = 0;
    }
    if ('' == (data = activeWindow.title.findTag(field, occ, false, true, false))) {
        return false;
    }
    splitted = data.split('$');
    if (typeof pos === 'undefined') {
        splitted.push(subfield + content);
        if ('a' != splitted[0][0]) {
            splitted[0] = 'a' + splitted[0];
        }
        splitted.sort();
        splitted[0] = splitted[0].substr(1);
    } else {
        splitted.splice(pos, 0, subfield + content);
    }
    activeWindow.title.insertText(splitted.join('$'));
}

/**
* Checks weather screen variable is one of options
* pops up alert with message if not
*
* @param {array} options possible screen variables
* @param {string} header of popup
* @param {string} message optional
* @return {string}|{bool} screen variable or false
*/
function __zdbCheckScreen(options, header, message) {

    var map = {
        '8A': 'Vollanzeige',
        '7A': 'Trefferliste',
        'MT': 'Editiermodus',
        'IT': 'Titelneuaufnahme',
        'IE': 'Exemplarneuaufnahme',
        '00': 'Loginmaske',
        'GN': 'Setansicht',
        'SC': 'Indexansicht',
        'FI': 'Datenbankinfo',
        'FS': 'Bestandsauswahl',
        'MI': 'Norm-Korrekturmodus'
    };
    var strScreen = activeWindow.getVariable('scr');
    var opt = options.join('#');
    if (opt.indexOf(strScreen) < 0) {
        var arr = [];
        for (var e in map) {
            if (!map.hasOwnProperty(e)) { continue; }
            if (opt.indexOf(e) > -1) arr.push(map[e]);
        }
        var list = arr.join(', ');
        if (typeof header !== 'undefined') {
            message = message || 'Die Funktion kann nur aus ' + list + ' aufgerufen werden.';
            messageBox(header, message, 'alert-icon');
        }
        return false;
    }
    return strScreen;
}