var ZDB = {
    anfangsfenster: '', // auto Suchbox
    delimiter: '\u0192', // Unterfeldzeichen 'ƒ' = \u0192
    charCode: 402, // Unterfeldzeichen 'ƒ' = 402, Unterfeldzeichen '$' = 36
    _rec: {} // global varibale holding the JSON record
}

/**
 * Retrieves the first value from an array field
 * @param {array|string} arr - Array or key to access from _rec
 * @param {string} key - Field key to retrieve
 * @return {*} First value or null if not found

ZDB.first = function (arr, key) {
    if ('string' === typeof arr) {
        arr = this._rec[arr];
    }
    return (arr && arr[0] && arr[0][key]) ? arr[0][key][0] : null;
}
*/

/**
 * Checks if a field exists in an array
 * @param {array|string} arr - Array or key to access from _rec
 * @param {string} key - Field key to check
 * @return {boolean} True if field exists
 */
ZDB.has = function (arr, key) {
    if ('string' === typeof arr) {
        arr = this._rec[arr];
    }
    return (arr && arr[0] && arr[0][key]);
}

/**
 * Pushes a value to array if value is truthy
 * @param {array} arr - Target array
 * @param {*} val - Value to push if truthy
 */
ZDB.pushIf = function (arr, val) {
    if (val) arr.push(val);
}

/**
 * Replaces all occurrences in text using regex
 * @param {string} text - Text to process
 * @param {regex} re - Regular expression pattern
 * @param {string} val - Replacement value
 * @return {string} Text with replacements
 */
ZDB.replAll = function (text, re, val) {
    return text.replace(re, val);
}

/**
* Retrieves ZDBID from the current view or edit mode
* @param {string} idn optional
* @return {string|boolean} ZDBID or false
*/
ZDB.getZDB = function (idn) {
    idn = idn || false;
    if (idn) {
        var myWindowId = activeWindow.windowID;
        MISC.wait('\\ZOE idn ' + idn, true);
    }

    var strScreen = MISC.checkScreen(['8A', 'MT', 'IT'], 'getZDB');
    if (!strScreen) return false;

    var format = MISC.format();
    var cat = { D: '2110', DA: '2110', P: '006Z' };
    var zdbid;

    if (format === 'P') {
        // P-format: ZDB id stored in tag defined by `cat` (006Z)
        zdbid = (strScreen === 'MT' || strScreen === 'IT')
            ? ZDB.getSubfield(activeWindow.title.findTag(cat['P'], 0, false, true, false), 'a')
            : ZDB.getSubfield(__Trim(activeWindow.findTagContent(cat['P'], 0, true)), 'a');
    } else if (format === 'D' || format === 'DA') {
        // D/DA formats: need to parse the field
        zdbid = (strScreen === 'MT' || strScreen === 'IT')
            ? activeWindow.title.findTag(cat['D'], 0, false, true, false)
            : activeWindow.findTagContent(cat['D'], 0, false);
    } else {
        Notify.error('Unsupported format: ' + format);
        if (idn) activateWindow(myWindowId);
        return false;
    }

    if (idn) {
        activateWindow(myWindowId);
    }

    if (!zdbid) return false;
    return zdbid.replace(/\s+/g, '');
}

/**
* Expansion object to RDA fields
* @param {object} e created from __parseExpansion()
* @return {string} RDA fields
*/
ZDB.expansionToText = function (e) {
    var text = '';
    if (e.norm) {
        text = '$l' + e.norm.a;
    }
    return text += '$t' + e.tit;
}

ZDB.checkScreen = function (options, header, message) {
    return MISC.checkScreen(options, header, message);
}

ZDB.JSON = function (idn) {
    return JSON.create(idn);
}

ZDB.parseField = function (field) {
    return JSON.parseField(field);
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
ZDB.parseExpansion = function (exp) {
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


ZDB.getExpansionFromP3VTX = function () {
    return MISC.getExpansionFromP3VTX();
}

/**
 * Retrieves a record in a specified format and mode from the application.
 *
 * @param {string} format - The format of the record to retrieve. Must be either 'P' or 'D'.
 * @param {boolean} extmode - If true, retrieves the expanded record using a specific method; 
 *                            otherwise, retrieves the title directly.
 * @returns {string|boolean} The retrieved record as a string with a newline appended, or `false` 
 *                           if an error occurs or the screen check fails.
 */
ZDB.getRecord = function (format, extmode) {
    var scr = this.checkScreen(['7A', '8A'], 'getRecord');
    if (!scr) return false;
    var satz = null;

    MISC.format(format);
    if (extmode) {
        satz = this.getExpansionFromP3VTX();
    } else {
        satz = activeWindow.copyTitle();
        //satz = satz.replace(/\r/g,'');
    }
    if (scr == '7A')
        activeWindow.simulateIBWKey('FE');
    else
        if (format == 'P')
            MISC.format('D');
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
ZDB.arrayUnique = function (arr) {
    return arr.unique();
}

/**
* Check if subfield exists with specific content
* @return {bool}
*/
ZDB.checkSF = function (kat, sf, I, C) {
    var i = I || 0;
    var c = C || false;

    if (typeof this._rec[kat] === 'undefined') return false;
    if (typeof this._rec[kat][i][sf] === 'undefined') return false;

    if (c) {
        var x = 0;
        while (x < this._rec[kat][i][sf].length) {
            if (this._rec[kat][i][sf][x] === c) return true;
            x++;
        }
        return false;
    }
    return true;
}

/**
* Inserts a subfield with content
*
* Script must be in a title or edit window with a record loaded.
*
* @param {string} field the field tag
* @param {string} subfield the subfield tag
* @param {string} content the content of the subfield
* @param {string} pos optional: the subfield position 0 ... x
* @param {string} pos optional: the occurence of a repeatable field 0 ... x
*/
ZDB.insertSubfield = function (field, subfield, content, pos, occ) {
    MISC.checkScreen(['MT', 'IT', 'IE'], 'insertSubfield');
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

ZDB.checkScreen = function (options, header, message) {
    MISC.checkScreen(options, header, message);
}

/**
 * Retrieves the value of a specific subfield from a MARC field string.
 *
 * @param {string} field - The field string to parse.
 * @param {string} sfTag - The subfield tag to retrieve (e.g., 'a', 'b').
 * @returns {*} The value of the specified subfield, or undefined if not found.
 */
ZDB.getSubfield = function (field, sfTag) {
    var tagMatch = /^(.{3,4})\s.+/;
    if(!tagMatch.test(field)) {
        field = '000 ' + field; // prepend dummy tag if not present
    }
    var m = /^(.{3,4})\s/.exec(field);
    if (!m) return undefined;
    var tag = m[1];
    var subfields = this.parseField(field);
    if (!subfields || !subfields[tag]) return undefined;
    return subfields[tag][sfTag];
}

/**
 * Kategorie 'EXXX x' wird automatisch befüllt
 * @param string content
 * @param function|undefined callback
 */
ZDB.exemplarErfassen = function (content, callback) {
    var exNum = this.EXXX();
    //alert("Erfasse Exemplar " + exNum + " mit Inhalt: " + content);
    if (this.checkScreen(['8A'])) {
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
ZDB.exemplarNummern = function () {
     MISC.format('D');
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

ZDB.EXXX = function () {
    var record,
        num;
    if (this.checkScreen(['MT', 'IT'])) {
        activeWindow.title.selectAll();
        record = activeWindow.title.selection;
        activeWindow.title.selectNone();
        activeWindow.endOfBuffer(false);
    } else {
        record = activeWindow.getVariable('P3CLIP');
        if(!record) {
            record = ZDB.getExpansionFromP3VTX();
        }
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

ZDB.getExpansionFromP3VTX = function () {
    return activeWindow.getVariable('P3VTX')
        .replace(/<ISBD><TABLE>|<\/TABLE>/g, '')
        .replace(/\u001b[IN]/g, '')
        .replace(/<BR>/g, '\n')
        .replace(/<\/?a[^>]*>/gm, '')
        .replace(/^Eingabe:.*$|^$/gm, '');
}