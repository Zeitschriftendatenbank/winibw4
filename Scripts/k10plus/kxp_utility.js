/*
	Autorin: Karen Hachmann, VZG
	Datum:   2021.04
*/
var kxpUtility =
{
	loescheFeld: function(regexpTag){
		//prüfe alle Zeilen eines Datensatze und entferne Felder
		//Anwenden: kxpUtility.loescheFeld(/20[0-1][0-9]/);
		//nicht mit Flag /g aufrufen!!!
		var i = 0;
		var lastLine = this.letzteZeile();
		for (i=0; i<= lastLine; i++) {
			if (regexpTag.test(application.activeWindow.title.tag)){
				//alert("i: " + i + "\nLösche: " + application.activeWindow.title.tag);
				application.activeWindow.title.deleteLine(1);
				i--;
			}
			else {
				application.activeWindow.title.endOfField(false);
				application.activeWindow.title.lineDown(1, false);
			}
		}
	},
	loescheFeldInhalt: function(regexpTag, lPos){
		//Löscht den Inhalt eines Feldes ab der als Ziffer genannten Position
		//Zweiter Parameter zählt ab Feldinhalt.
		//kxpUtility.loescheFeldInhalt(/2000|3000/, 20);
		//kann auch ohne den zweiten Parameter angegeben werden:
		//kxpUtility.loescheFeldInhalt(/2000|3000/);
		var i = 0;
		var lastLine = this.letzteZeile();
		//wenn ohne Zahl aufgerufen:
		if (isNaN(lPos)) lPos = 0;
		for (i=0; i<= lastLine; i++) {
			if (regexpTag.test(application.activeWindow.title.tag)){
				//wenn lPos größer als der Rest der Zeile, dann nicht die Folgezeile löschen
				var lZeile = application.activeWindow.title.currentField.length;
				var lTag = application.activeWindow.title.tag.length;
				var lBeginn = lTag  + lPos;
				//application.messageBox("", application.activeWindow.title.tag +"\nZeilenlänge: " + lZeile +"\nBeginn Löschung: " +lBeginn, "");
				if (lBeginn < lZeile){
					application.activeWindow.title.startOfField(false);
					application.activeWindow.title.charRight(lBeginn, false);
					application.activeWindow.title.deleteToEndOfLine();
				}
			}
			application.activeWindow.title.lineDown (1, false);
		}
	},
	loescheFeldInhaltString: function(regexpTag, strPos){
		//löscht den Inhalt eines Feldes beginnend mit dem genannten String in strPos
		//Anwenden: kxpUtility.loescheFeldInhaltString(/4000/, "$h");
		var i = 0;
		var lastLine = this.letzteZeile();
		for (i=0; i<= lastLine; i++) {
			if (regexpTag.test(application.activeWindow.title.tag) && application.activeWindow.title.find(strPos, true, true, false) == true){
				application.activeWindow.title.deleteToEndOfLine();
			}
			application.activeWindow.title.lineDown (1, false);
		}
	},
	ersetzeFeldInhaltString: function(regexpTag, regexpString1, regexpString2){
		//Ersetzt den Inhalt eines Feldes: Feld, Suchstring, Ersetzestring
		//Anwenden: kxpUtility.ersetzeFeldInhaltString(/4160/, /#.*?#/, "##");
		var i = 0, strAllField;
		var lastLine = this.letzteZeile();
		for (i=0; i<= lastLine; i++) {
			if (regexpTag.test(application.activeWindow.title.tag)){
				application.activeWindow.title.endOfField(true);
				strAllField = application.activeWindow.title.selection;
				//application.messageBox("", regexpString1.test(strAllField) + " strAllField: " + strAllField, "");
				if (regexpString1.test(strAllField)){
					//application.messageBox("", regexpString1 +"\n"+ regexpString2, "");
					strAllField = strAllField.replace(regexpString1, regexpString2);
					application.activeWindow.title.insertText(strAllField);
					//application.messageBox("", strAllField, "");
				}
			}
			application.activeWindow.title.lineDown (1, false);
		}
	},
	loescheIdentnummern: function(){
		//kxpUtility.loescheIdentnummern();
		var n = 0;
		//lösche alles außer 2000: d.h. 200x, 20xx, 2xxx
		//bei den Persistent Identifierern soll das Feld 205x ohne Inhalt stehen bleiben.
		var lastLine = this.letzteZeile();
		for (n=0; n<= lastLine; n++) {
			if (/200[1-9]|20[1-46-9][0-9]|2[1-9][0-9][0-9]/.test(application.activeWindow.title.tag)){
				application.activeWindow.title.deleteLine (1);
			} else if (/205[0-3]/.test(application.activeWindow.title.tag)){
				application.activeWindow.title.startOfField(false);
				application.activeWindow.title.wordRight(1, false);
				application.activeWindow.title.deleteToEndOfLine();
				application.activeWindow.title.lineDown (1, false);
			} else {
				application.activeWindow.title.endOfField(false);
				application.activeWindow.title.lineDown (1, false);
			}
		}
	},
	letzteZeile: function (){
		//Gibt die Anzahl der Zeilen zurück
		//kxpUtility.letzteZeile();
		application.activeWindow.title.endOfBuffer (false);
		var lastLine = application.activeWindow.title.currentLineNumber;
		application.activeWindow.title.startOfBuffer (false);
		return lastLine;
	},
	feldEinfuegenNumerisch: function(strTag, strContent, bPruefe){
		//Fügt ein neues Feld in numerischer Ordnung ein
		//Parameter: Feld als String, Inhalt als String, true: prüfe und füge nur ein, wenn Feld noch nicht vorkommt, false = füge ohne Prüfung ein
		//kxpUtility.feldEinfuegenNumerisch("1505", "$erda", true);
		//kxpUtility.feldEinfuegenNumerisch("1505", "", false);
		//alert("einfügen: " + strTag + "\nPrüfe: " + bPruefe)
		var i=0, currentTag="";
		application.activeWindow.title.startOfBuffer(false);
		if (bPruefe == true && application.activeWindow.title.findTag(strTag, 0, true, true, true) == "" || bPruefe == false){
			var lastLine = this.letzteZeile();
			for (i=0; i<=lastLine; i++){
				currentTag = application.activeWindow.title.tag;
				//fügt Feld vor der nächst höheren oder in der letzten Zeile ein:
				if ((!isNaN(currentTag) && currentTag > strTag) || application.activeWindow.title.currentLineNumber == lastLine){
					application.activeWindow.title.startOfField(false);
					application.activeWindow.title.insertText(strTag + " " + strContent + "\n");
					break;
				}
				application.activeWindow.title.endOfField(false);
				application.activeWindow.title.lineDown(1, false);
			}
		}
	},
	formatD: function(){
		//Präsentationsformat prüfen und auf "d" umstellen
		//Anwenden: kxpUtility.formatD()
		if (application.activeWindow.getVariable("P3GPR") != "D") {
			application.activeWindow.command ("\\too d", false);
		}
	},
	formatP: function(){
		//Präsentationsformat prüfen und auf "P" umstellen
		//Anwenden: kxpUtility.formatP()
		if (application.activeWindow.getVariable("P3GPR") != "P") {
			application.activeWindow.command ("\\too p", false);
		}
	},
	matCode1: function(){
		//nennt Pos. 1 von 002@
		//Anwenden: kxpUtility.matCode1()
		return application.activeWindow.materialCode.substr(0,1)
	},
	matCode2: function(){
		//nennt Pos. 2 von 002@
		//Anwenden: kxpUtility.matCode2()
		return application.activeWindow.materialCode.substr(1,1)
	},
	ppnPruefung: function(zeile){
		//Rückgabewert: PPN, wenn im String ein PPN-Link vorkommt, sonst: ""
		//Anwenden: kxpUtility.ppnPruefung(application.activeWindow.title.currentField);
		var regExpPPN = /!(\d{8,9}[\d|x|X])!/;
		if (regExpPPN.test(zeile) == true){
			regExpPPN.exec(zeile);
			return RegExp.$1;
		} else {return "";}
	},
	alleZeilenArray: function(){
		//gibt alle Zeilen des in der Vollanzeige befindlichen Datensatzes als Array aus.
		application.activeWindow.copyTitle();
		return application.activeWindow.clipboard.split("\n");;
	},
	felderSammeln: function(regexpFelder){
		//Im Edit-Schirm sammelt diese Funktion alle Vorkommnisse der genannten Felder ein.
		//gibt einen String zurück, wenn mehrere Felder, dann mit Zeilenumbruch
		//Anwenden: kxpUtility.felderSammeln(/2275|2276|2277/);
		var n = 0;
		var theLine, lastLine;
		var strFelder = "";
		if (!application.activeWindow.title) {
			__fehler(gPicaUtility.getMessage("MustBeEditing"));
			return false;
		}
		lastLine = this.letzteZeile();
		for (n=0; n<= lastLine; n++) {
			theLine = application.activeWindow.title.currentField;
			if(regexpFelder.test(application.activeWindow.title.tag) == true){
				strFelder = strFelder + "\n" + theLine;
			}
			application.activeWindow.title.endOfField(false);//wichtig bei mehrzeiligen Inhalten!
			application.activeWindow.title.lineDown (1, false);
		}
		return strFelder;
	},
	isbnCut: function(regexpFelder){
		//ISBNs auf die Verlagsnummer kürzen
		//Anwenden: kxpUtility.isbnCut();
		var sucheISBN;
		var n=0;
		application.activeWindow.title.startOfBuffer(false);
		do {
			sucheISBN = application.activeWindow.title.findTag("2000", n, true, true, true);
			if (sucheISBN != "" && application.activeWindow.title.find("$", false, true, false) == true){
				application.activeWindow.title.deleteToEndOfLine();
			}
			n++;
		} while (sucheISBN != "")
	},
	deleteEmptyLines: function(){
		//Lösche Leerzeilen
		//Anwenden: kxpUtility.deleteEmptyLines();
		var i = 0;
		var lastLine;
		application.activeWindow.title.endOfBuffer (false);
		lastLine = application.activeWindow.title.currentLineNumber;
		application.activeWindow.title.startOfBuffer (false);
		for (i=0; i<= lastLine; i++) {
			if (application.activeWindow.title.currentField.length==0){
				application.activeWindow.title.deleteLine (1);
			} else {
				application.activeWindow.title.endOfField(false);
				application.activeWindow.title.lineDown (1, false);
			}
		}
	},
	ersetzeHTML: function(){
		//Anwenden: kxpUtility.ersetzeHTML();
		application.activeWindow.title.startOfBuffer (false);
		application.activeWindow.title.replaceAll("&lt;", "<", false, false);
		application.activeWindow.title.startOfBuffer (false);
		application.activeWindow.title.replaceAll("&gt;", ">", false, false);
	}
}
