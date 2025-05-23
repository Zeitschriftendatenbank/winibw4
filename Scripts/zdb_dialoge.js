if (Array.isArray == null) {
    Array.isArray = function (arr) {
        return Object.prototype.toString.call(arr) === "[object Array]";
    };
}

if (!Array.prototype.indexOf) {
    Array.indexOf = function(searchElement, fromIndex) {
        var k;
        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }
        var o = Object(this);
        var len = o.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = fromIndex | 0;
        if (n >= len) {
            return -1;
        }
        k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
        while (k < len) {
            if (k in o && o[k] === searchElement) {
                return k;
            }
            k++;
        }
        return -1;
    };
}

function GetScriptEngineInfo(){
   var s;
   s = ""; // Build string with necessary info.
   s += ScriptEngine() + " Version ";
   s += ScriptEngineMajorVersion() + ".";
   s += ScriptEngineMinorVersion() + ".";
   s += ScriptEngineBuildVersion();
   alert(s);
}


function zdb_AutomatischeSuchBox() {
    if (false == __zdbCheckScreen(['MT', 'IT', 'IE'], 'AutomatischeSuchBox')) return false;
    anfangsfenster = application.activeWindow.windowID; // globale Variable, die vom Skript HoleIDN verwendet wird
    showDialog('ProfD\\Dialogs\\ZDB_AutomatischeSuchBox.html');
    return true;
}

function zdb_BibliothekDefinieren() {
    showDialog('ProfD\\Dialogs\\ZDB_dialogBibliothekDefinieren.html');
}

function zdb_DigiConfig() {
    showDialog('ProfD\\Dialogs\\ZDB_dialogDigitalisierungConfig.html', 100, 100, 400, 500);
}

function zdb_Erscheinungsverlauf() {
    showDialog('ProfD\\Dialogs\\ZDB_dialogErscheinungsverlauf.html', 100, 100, 400, 500);
}



function __zdb_parse4024() {
    //alert('zdb_parse4024');
    //__zeigeEigenschaften(o);
    //alert('test serialize: ' + __zdb_serialize_recursive([{ bj: '1995' }]));
    var feld4024, split4024, bb, bj, bh, bm, bt, eb, ej, eh, em, et, group, splitter;
    var groups = [];
    var getChained = function (chain, splitter, where) {
        //alert('getChained: ' + chain);
        var split;
        if (splitter.test(chain)) {
            split = chain.split('/');
            return ('b' === where) ? split[0] : split[split.length - 1];
        } else {
            return chain;
        }
    }
    if ("" !== (feld4024 = activeWindow.title.findTag('4024', 0, false, true, false))) {
        if ("-" === feld4024.substr(feld4024.length - 1)) {
            groups.push({lfd: '-'});
        }
        split4024 = feld4024.split('$0;');
        splitter = /\$/;
        for (var s in split4024) {
            if(split4024.hasOwnProperty()) {
                continue;
            }
            //alert('s '+ s);
            group = {};
            if (bb = split4024[s].match(/\$d([^\$]+)/)) {
                group['bb'] = getChained(bb[1], splitter, 'b');
            }
            if (bj = split4024[s].match(/\$j([^\$]+)/)) {
                group['bj'] = getChained(bj[1], splitter, 'b');
            }
            if (bh = split4024[s].match(/\$e([^\$]+)/)) {
                group['bh'] = getChained(bh[1], splitter, 'b');
            }
            if (bm = split4024[s].match(/\$c([^\$]+)/)) {
                group['bm'] = getChained(bm[1], splitter, 'b');
            }
            if (bt = split4024[s].match(/\$b([^\$]+)/)) {
                group['bt'] = getChained(bt[1], splitter, 'b');
            }
            if (eb = split4024[s].match(/\$n([^\$]+)/)) {
                group['eb'] = getChained(eb[1], splitter, 'e');
            }
            if (ej = split4024[s].match(/\$k([^\$]+)/)) {
                group['ej'] = getChained(ej[1], splitter, 'e');
                if (2 === group['ej'].length) {
                    group['ej'] = ej[1].substr(0, 2) + group['ej'];
                }
            }
            if (eh = split4024[s].match(/\$o([^\$]+)/)) {
                group['eh'] = getChained(eh[1], splitter, 'e');
            }
            if (em = split4024[s].match(/\$m([^\$]+)/)) {
                group['em'] = getChained(em[1], splitter, 'e');
            }
            if (et = split4024[s].match(/\$l([^\$]+)/)) {
                group['et'] = getChained(et[1], splitter, 'e');
            }
            //__zeigeEigenschaften(group);
            groups.push(group);
        }
    }
    //activeWindow.clipboard = __zdb_serialize_recursive(groups);
    utility.sentDataToDialog(__zdb_serialize_recursive(groups));
}

/**
 * Recursively serializes data (arrays, objects, or primitive types) into a string.
 * Arrays are joined with '@@@'. Objects are converted to key:::value pairs,
 * also joined with '@@@'.  Nested arrays and objects are recursively serialized.
 * Primitive types are converted to strings.  Avoids circular references.
 *
 * @param {any} data The data to serialize.
 * @param {Array} [seen=[]] An array to track visited objects to prevent circular references.
 * @returns {string} The serialized string representation of the data.
 */
function __zdb_serialize_recursive(data, seen) {
    seen = seen || [];

    if (typeof data === 'object' && data !== null) {
        if (Array.indexOf(data, seen) !== -1) {
            return "[Circular Reference]"; // Prevent circular references
        }
        seen.push(data);
    }

    if (Array.isArray(data)) {
        var serializedElements = [];
        for (var i = 0; i < data.length; i++) {
            serializedElements.push('A:' + __zdb_serialize_recursive(data[i], seen)); // Prefix 'A:' for arrays
        }
        return serializedElements.join('@@@');
    } else if (typeof data === 'object' && data !== null) {
        var result = [];
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                result.push('O:' + key + ':::' + __zdb_serialize_recursive(data[key], seen)); // Prefix 'O:' for objects
            }
        }
        return result.join('@@@');
    } else {
        return 'P:' + String(data); // Prefix 'P:' for primitive types
    }
}

function __zdb_paste4024(o) {
    __zeigeEigenschaften(o);
    var bb, bj, bh, bm, bt, eb, ej, eh, em, et, feld4024, _feld4024 = [];
    for (var g = 1; g <= count; g++) {
        feld4024 = "";
        bb = "";
        bj = "";
        bh = "";
        bm = "";
        bt = "";
        eb = "";
        ej = "";
        eh = "";
        em = "";
        et = "";
        if ("" !== (bb = document.getElementById('bb' + g).value)) {
            feld4024 += "$d" + bb;
        }
        if ("" !== (bh = document.getElementById('bh' + g).value)) {
            feld4024 += "$e" + bh;
        }
        if ("" !== (bt = document.getElementById('bt' + g).value)) {
            feld4024 += "$b" + bt;
        }
        if ("" !== (bm = document.getElementById('bm' + g).value)) {
            feld4024 += "$c" + bm;
        }
        if ("" !== (bj = document.getElementById('bj' + g).value)) {
            feld4024 += "$j" + bj;
        }
        if ("" !== (eb = document.getElementById('eb' + g).value)) {
            feld4024 += "$n" + eb;
        }
        if ("" !== (eh = document.getElementById('eh' + g).value)) {
            feld4024 += "$o" + eh;
        }
        if ("" !== (et = document.getElementById('et' + g).value)) {
            feld4024 += "$l" + et;
        }
        if ("" !== (em = document.getElementById('em' + g).value)) {
            feld4024 += "$m" + em;
        }
        if ("" !== (ej = document.getElementById('ej' + g).value)) {
            feld4024 += "$k" + ej;
        }
        if ("" !== feld4024) _feld4024.push(feld4024);
    }
    // Simulated title field operations:
    var titleField = activeWindow.title;
    var current4024 = titleField.findTag ? titleField.findTag('4024', 0, true, true, false) : "";
    if ("" !== current4024) {
        titleField.deleteLine(1);
    } else {
        titleField.endOfField(false);
        titleField.insertText("\n");
    }
    titleField.insertText('4024 ' + _feld4024.join('$0;'));
    if (document.getElementById('lfd').checked) {
        var ende = _feld4024[_feld4024.length - 1];
        if (ende.match(/\$o|\$l|\$m|\$n|\$k/)) {
            alert("Da ein Wert in der letzten Endgruppe vorhanden ist, wird die Angabe 'laufend' ignoriert.");
            titleField.insertText("\n");
        } else {
            titleField.insertText("$6-\n");
        }
    } else {
        titleField.insertText("\n");
    }
    return true;
}