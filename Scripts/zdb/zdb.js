var ZDB = {
    anfangsfenster : '', // auto Suchbox
    delimiter : '\u0192', // Unterfeldzeichen 'ƒ' = \u0192
    charCode : 402, // Unterfeldzeichen 'ƒ' = 402, Unterfeldzeichen '$' = 36
    _rec : {} // global varibale holding the JSON record
}

ZDB._first = function (arr, key) {
    if ('String' == typeof arr) {
        arr = this._rec[arr];
    }
    return (arr && arr[0] && arr[0][key]) ? arr[0][key][0] : null;
}

ZDB._has = function (arr, key) {
    if ('String' == typeof arr) {
        arr = this._rec[arr];
    }
    return (arr && arr[0] && arr[0][key]);
}

ZDB._pushIf = function (arr, val) {
    if (val) arr.push(val);
}

ZDB._replAll = function (text, re, val) {
    return text.replace(re, val);
}

ZDB._format = function (f) {
    if (typeof f === 'undefined' || f === null) {
        this.format = activeWindow.getVariable('P3GPR').toUpperCase();
        if(!this.format) {
            this.format = activeWindow.getVariable('P3GDB').toUpperCase();
        }
        return this.format;
    }
    activeWindow.command('s ' + f, false);
}

/**
* Retrieves ZDBID from the current view or edit mode
* @param {string} idn optional
* @return {string|boolean} ZDBID or false
*/
ZDB._getZDB = function (idn) {
    idn = idn || false;
    if (idn) {
        var myWindowId = activeWindow.windowID;
        activeWindow.commandLine('\zoe idn ' + idn);
    }

    var strScreen = this._checkScreen(['8A', 'MT', 'IT'], '_getZDB');
    if (!strScreen) return false;

    var format = this._format();
    var cat = { 'D': '2110', 'DA': '2110', 'P': '006Z' }[format];
    var zdbid;

    if (format !== 'P') {
        zdbid = (strScreen === 'MT' || strScreen === 'IT')
            ? activeWindow.title.findTag(cat, 0, false, false, true)
            : __Trim(activeWindow.findTagContent(cat, 0, false));
    } else {
        var field = (strScreen === 'MT' || strScreen === 'IT')
            ? this._parseField(activeWindow.title.findTag(cat, 0, true, false, true))
            : this._parseField(activeWindow.findTagContent(cat, 0, true));
        zdbid = field[cat][0][0];
    }

    if (idn) {
        activateWindow(myWindowId);
    }

    return zdbid.replace(/\s+/g, '');
}

/**
* Expansion object to RDA fields
* @param {object} e created from __parseExpansion()
* @return {string} RDA fields
*/
ZDB._expansionToText = function (e) {
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
ZDB._toJSON = function (idn) {
    this._rec = {};
    idn = idn || false;

    // save format
    var format = this._format();

    var myWindowId = activeWindow.windowID;

    if (idn) // get zdb id of a different title in a work window
    {
        activeWindow.command('f idn ' + idn, true);
    }

    if ('P' != format) this._format('P');

    var rec = this._getExpansionFromP3VTX();
    // get array of lines
    var arrLines = rec.match(/(.+)/gm);
    // for each line
    var i = 0;
    while (i < arrLines.length) {
        var _line = this._parseField(arrLines[i]);
        // key is the category
        for (var key in _line) {
            if (_line.hasOwnProperty(key)) {
                // if key already exists
                if (this._rec.hasOwnProperty(key)) {
                    this._rec[key].push(_line[key]);
                } else { // key does not exist
                    // always create an array
                    this._rec[key] = [_line[key]];
                }
            }
        }
        i++;
    }

    this._rec.katToString = function (kat) {
        var string = '',
            i;
        for (i = 0; i < this[kat].length; i++) {
            string += "\n" + kat + ' ';
            for (var sub in this[kat][i]) {
                for (var x = 0; x < this[kat][i][sub].length; x++) {
                    string += this.delimiter + sub + this[kat][i][sub][x];
                }
            }
        }
        return string;
    };

    // back to source format
    if ('P' != format) this._format(format);

    if (activeWindow.windowID != myWindowId) {
        activateWindow(myWindowId);
    }
    return this._rec;
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
ZDB._parseField = function (field) {
    var _field = {};
    var arr = field.match(/^([^\s]+)\s(.+)/);
    if (!arr || arr.length < 3) {
        // Return empty object or handle error gracefully
        return {};
    }
    var del = ('P' == this._format()) ? this.delimiter : '$';
    var split = arr[2].split(del);

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
ZDB._parseExpansion = function (exp) {
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
ZDB._getExpansionFromP3VTX = function () {
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
    return this._unescapeHtml(satz);
}

/**
 * Replaces HTML escaped chars to unescaped
 * @param {string} text with html escaped chars
 * @return {string} text with unescaped chars
 */
ZDB._unescapeHtml = function (text) {
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
ZDB._getRecord = function (format, extmode) {
    var scr = this._checkScreen(['7A', '8A'], '_getRecord');
    if (!scr) return false;
    var satz = null;

    this._format(format);
    if (extmode) {
        satz = this._getExpansionFromP3VTX();
    } else {
        satz = activeWindow.copyTitle();
        //satz = satz.replace(/\r/g,'');
    }
    if (scr == '7A')
        activeWindow.simulateIBWKey('FE');
    else
        if (format == 'P')
            this._format('D');
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
ZDB._arrayUnique = function (arr) {
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
ZDB._arrayDiff = function (a1, a2) {
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
ZDB._checkSF = function (kat, sf, I, C) {
    var i = I || 0;
    var c = C || false;

    if (typeof this._rec[kat] === 'undefined') return false;
    if (typeof this._rec[kat][i][sf] === 'undefined') return false;

    if (c) {
        var x = 0;
        while (x < this._rec[kat][i][sf].length) {
            if (this._rec[kat][i][sf][x] == c) return true;
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
ZDB._insertSubfield = function (field, subfield, content, pos, occ) {
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
ZDB._checkScreen = function (options, header, message) {
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
    if(!strScreen) {
        strScreen = 'XX'; // assume login screen if scr is empty
    }
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
            messageBox(header, message, 'error-icon');
        }
        return false;
    }
    return strScreen;
}

/**
 * Retrieves the value of a specific subfield from a MARC field string.
 *
 * @param {string} field - The MARC field string to parse.
 * @param {string} sfTag - The subfield tag to retrieve (e.g., 'a', 'b').
 * @returns {*} The value of the specified subfield, or undefined if not found.
 */
ZDB._getSubfield = function (field, sfTag) {
    var fieldTag = /^(.{3,4})\s/.exec(field);
    var subfields = this._parseField(field);
    return subfields[fieldTag][sfTag];
}

/**
 * Kategorie 'EXXX x' wird automatisch befüllt
 * @param string content
 * @param function|undefined callback
 */
ZDB._exemplarErfassen = function (content, callback) {
    var exNum = this._EXXX();
    if (!this._checkScreen(['MT', 'IE'])) {
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
ZDB._exemplarNummern = function () {
     this._format('D');
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

ZDB._EXXX = function () {
    var record,
        num;
    if (this._checkScreen(['MT'])) {
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

