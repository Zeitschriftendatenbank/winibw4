function SET(logFilename, format, eigeneBibliothek) {
    this.format           = format || 'd';
    this.setSize          = activeWindow.getVariable("P3GSZ");
    this.next             = 1;
    this.current          = 1;
    this.next_ex          = 0;
    this.current_ex       = 0;
    this.eigeneBibliothek = eigeneBibliothek || false;
    this.logger           = new LOGGER(logFilename) || false;
}

SET.prototype = {
    nextTit:
        function () {
            this.current = this.next;
            if (this.current <= this.setSize) {
                activeWindow.command("\\too " + this.format + " " + this.current, false);
                this.ex_numbers();
                this.next += 1;
                return this.current;
            }
            return false;
        },
    edit:
        function (ex) {
            var exe = ex || '';
            activeWindow.command("\\mut " + this.format + " " + exe, false);
            if ('MEMT'.indexOf(activeWindow.getVariable("src")) == -1) {
                throw new Error(this.getMessages());
            }
            return activeWindow.title;
        },
    nextEx:
        function (eigeneBibliothek) {
            this.eigeneBibliothek = eigeneBibliothek || this.eigeneBibliothek;
            if (!this.eigeneBibliothek) {
                throw new Error('IDN der eigenen Bibliothek ist nicht definiert');
            }
            if (!this.alleExe) {
                this.ex_numbers();
            }
            this.current_ex = this.next_ex;
            if (this.current_ex < this.alleExe.length) {
                //this.exNum = this.alleExe[this.current_ex].substring(3, 5),
                this.exNum = this.alleExe[this.current_ex];
                var ex = this.edit('e' + this.exNum);
                
                this.next_ex += 1;
                if (!this.test_eigene(ex, this.eigeneBibliothek)) {
                    activeWindow.simulateIBWKey('FR'); // exit Exemplar
                    return this.nextEx();
                }
                return ex;
            }
            return false;
        },
    test_eigene:
        function (ex, eigeneBibliothek) {
            this.eigeneBibliothek = eigeneBibliothek;
            var kat, i, regex;
            switch (this.format) {
            case 'd':
                kat = '4800';
                regex = new RegExp('!(.+)!');
                break;
            case 'p':
                kat = '247C';
                regex = new RegExp(delimiter + '9(.+)' + delimiter + '8');
                break;
            }
            ex.findTag(kat, 0, false, true, false);
            var idn = regex.exec(ex.selection);
            if (this.eigeneBibliothek.constructor == Array) {
                for (i = 0; i < this.eigeneBibliothek.length; i += 1) {
                    if (this.eigeneBibliothek[i] == idn[1]) {
                        return true;
                    }
                }
                return false;
            }
            if (this.eigeneBibliothek.indexOf(idn[1]) == -1) {
                return false;
            }
            return true;
        },
    ex_numbers:
        function () {
            this.next_ex = 0;
            this.current_ex = 0;
            var regexpExe,
                strTitle =  activeWindow.getVariable("P3CLIP"),
                match;
            switch (this.format) {
            case "d":
                regexpExe = new RegExp("\nE0([0-9][0-9])", 'g');
                break;
            case "p":
                regexpExe = new RegExp("\n208@\/([0-9][0-9])", 'g');
                break;
            }
            this.alleExe = [];
            while ((match = regexpExe.exec(strTitle)) !== null) {
                this.alleExe.push(match[1]);
              } 
        },
    getMessages:
        function () {
            var messageText = "",
                i,
                msgs = utility.messages();
            if (msgs.count > 0) {
                for (i = 0; i < msgs.count; i += 1) {
                    messageText += msgs.item(i).text + ";";
                }
            } else {
                return '';
            }
            return messageText;
        },
    save:
        function (save, message) {
            if(false === this.logger) {
                throw("Es wurde kein LOG-File angegeben.");
            }
            message = message || false;
            save = save || true;
            if (save == false) {
                // return undone but write error to a log file
                activeWindow.simulateIBWKey("FE");
            } else {
                activeWindow.simulateIBWKey("FR");
            }

            var status = activeWindow.status,
                cbsMessage = this.getMessages();

            if(status == 'OK') {
                if(message) {
                    message = status + "\t" + cbsMessage + "\t" + message;
                }
            } else {
                // an error occured
                //return undone but write error to a log file
                activeWindow.simulateIBWKey("FE");
                message = status + "\t" + cbsMessage;
            }

            if(message) {
                this.logger.log(message);
            }
        },
    log:
        function(message) {
            this.logger.log(message);
        }
};

function LOGGER (fileName, path, delimiter) {
    this.setLogFile(fileName, path);
    this.delimiter = delimiter || "\t";
}

LOGGER.prototype = {
    setLogFile:
        function (fileName, path) {
            this.fileName        = fileName || 'LOG';
            this.path            = path     || '\\listen';
            this.theRelativePath = this.path + "\\" + this.fileName;
        },
    log:
        function (message) {
            var out = utility.newFileOutput();
            out.createSpecial("ProfD", this.theRelativePath);
            var idn = activeWindow.getVariable("P3GPP");
            out.writeLine(new Date() + this.delimiter + idn + this.delimiter + message);
            out.close();
        }
};

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