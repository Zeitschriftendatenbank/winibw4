/*
	Autorin:	Karen Hachmann
	Konvertiert: ASCII to UTF8
	Datum:	2021.04
	Hierfür brauchen wir keine eigene Funktion, weil es dafür schon eine Scriptanweisung vorgibt:
	Feldinhalt in der Vollanzeige eines Datensatzes ermitteln:
	var str4000 = application.activeWindow.findTagContent("4000", 0, false)
*/
//für VZG-Tests:
function VZG_Test(){
	return;
	alert("libID: " + application.activeWindow.getVariable("libID") +
		"\nANr: " + application.activeWindow.getVariable("ANr") +
		"\nP3V00: " + application.activeWindow.getVariable("P3V00"));
}

function __warnung(meldungstext){
	application.messageBox("Warnung", meldungstext, "alert-icon");
}

function __fehler(meldungstext){
	application.messageBox("Fehler", meldungstext, "error-icon");
}

function __meldung(meldungstext){
	application.messageBox("Information", meldungstext, "message-icon");
}

function __frage(meldungstext)
{
	application.messageBox("Frage", meldungstext, "question-icon");
}
function alert(meldung){
	application.messageBox("Alert", meldung, "alert-icon");
}
function __alleMeldungen() {
	var count = utility.messages().count;
	var alleTexte="";
	for (var i = 0; i< count; i++){
		alleTexte = alleTexte + utility.messages().item(i).text + "\n";
		//application.messageBox("message-text", utility.messages().item(i).text, "");
		//application.messageBox("message-text", utility.messages().item(i).type, "");
	}
	return alleTexte;
}

function __meineBibGBV(){
	//Anwendung: if (meineBibGBV() == "1999")
	 var strBib = stringTrim(application.activeWindow.getVariable("P3GOI"));
	 return strBib;
}
function __meineBibSWB(){
	var strBib = application.activeWindow.getVariable("P3GUM");
	var lBlank = strBib.indexOf(" ");
	if (lBlank > 0)	strBib = strBib.substring(0, lBlank);
	return strBib;
}
function Titel_in_K10plus_anzeigen(){
	var strPPN = application.activeWindow.getVariable("P3GPP");
	var strURL="https://kxp.k10plus.de/DB=2.1/PPNSET?PPN=" + strPPN;
	application.shellExecute (strURL, "open", "");
}
function Titel_in_WorldCat_anzeigen(){
	var strURL;
	var strOCN = application.activeWindow.getVariable("P3VOC");
	if (strOCN!=""){
		strURL="https://www.worldcat.org/search?q=" + strOCN + "&qt=results_page";
		application.shellExecute (strURL, "open", "");
	} else {
		application.messageBox("OCN in WorldCat-URL", "In diesem Datensatz kommt keine OCN vor.", "message-icon");
	}
}
function __ppnPruefung(zeile){
	//prüft, ob im String ein PPN-Link vorkommt
	var regExpPPN = /!(\d{8,9}[\d|x|X])!/;
	if (regExpPPN.test(zeile) == true){
		regExpPPN.exec(zeile);
		return RegExp.$1;
	} else {return "";}
}
function PPN_mit_Ausrufezeichen(){
	//KH 29.04.21
	//kopiert die PPN des angezeigten Datensatzes mit !...!
	var strScreen = application.activeWindow.getVariable("scr");
	if (strScreen !="7A" && strScreen !="8A"){
		application.messageBox("PPN kopieren", "Bitte rufen Sie einen Datensatz in die Anzeige!", "alert-icon");
	} else {
		application.activeWindow.clipboard = "!" + application.activeWindow.getVariable("P3GPP") + "!";
		application.activeWindow.showMessage("Die PPN wurde in den Zwischenspeicher geschrieben.", 3);
	}
}
function __isbnTeilen(strIsbn)
{
	//wird evtl. nicht mehr benötigt wegen Formatänderung?
	//String bis Unterfeld $:
	if (strIsbn.indexOf("$") != -1){
		strIsbn = strIsbn.substr(0, strIsbn.indexOf("$"));
	}
	//wenn im Feld $0 und $A fehlen, ist die Länge kleiner als 7 Zeichen
	if (strIsbn.length <= 7) {
		return "2000 ";
	} else {
	//neuer Array:
		//Wenn Bindestriche vorkommen:
		if(strIsbn.indexOf("-")!=-1){
			var teilIsbn = strIsbn.split("-");
			if (teilIsbn.length <= 4){
				return teilIsbn[0] + "-" + teilIsbn[1] + "-";
			}
			if (teilIsbn.length >= 5){
				return teilIsbn[0] + "-" + teilIsbn[1] + "-"+ teilIsbn[2] + "-";
			}
		} else {
			return strIsbn;
		}
	}
}

function __isbnKopiereKurz()
{
	//Hilfsfunktion, um ISBNs beim Kopieren auf die Verlagsnummer zu kürzen.
	var suche;
	var alleIsbn = new Array();
	var neueIsbn = new Array();
	var n=0;
	application.activeWindow.title.startOfBuffer(false);
	do {
		//Vorkommnis bleibt 0, weil danach die Zeile gelöscht wird:
		suche = application.activeWindow.title.findTag("2000", 0, true, true, true);
		if (suche != ""){
			alleIsbn[n] = suche;
			application.activeWindow.title.deleteLine(1);
			neueIsbn[n] = __isbnTeilen(alleIsbn[n]);
			n++;
		}
	}
	while (suche != "")
	application.activeWindow.title.insertText(neueIsbn.join("\n") + "\n");
}

function __zdbGetExpansionFromP3VTX(){
    var satz = application.activeWindow.getVariable('P3VTX');
    //alert("!"+satz+"!")
    satz = application.activeWindow.getVariable('P3VTX');
    satz = satz.replace('<ISBD><TABLE>','');
    satz = satz.replace('<\/TABLE>','');
    satz = satz.replace(/<BR>/g,"\n");
    satz = satz.replace(/^$/gm,'');
    satz = satz.replace(/^Eingabe:.*$/gm,'');
    satz = satz.replace(/^Mailbox:.*$/gm,'');
    satz = satz.replace(/^ A.*$/gm,''); //soll Aufsätze treffen, davor ein Blank
    satz = satz.replace(/^B.*$/gm,''); //soll 'Bände' treffen, Umlaut???
    satz = satz.replace(/<a[^<]*>/g,'');
    satz = satz.replace(/<\/a>/g,'');
    satz = satz.replace(/\r/g, "\n");
    satz = satz.replace(/\u001b./g,''); // replace /n entfernt, weil hier die $8 Expansion durch Zeilenbruch abgetrennt wurde
    satz = __zdbUnescapeHtml(satz)
    return satz;
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
function __alleLinks(){
	var satz = __zdbGetExpansionFromP3VTX();
	var alleLinks = satz.match(/.*!\d{8,10}[\d|x|X]!.*/g);
	if (alleLinks){
		//application.showMessage(alleLinks.length + " PPN-Links\n" + alleLinks.join("\n"), 1);
		return alleLinks;
	}
}
function __exemplarDatumLoeschen(){
	var regExpExemplar = /E[0-9][0-9][0-9]/;
	var i, lZeile;
	application.activeWindow.title.endOfBuffer(false);
	lZeile = application.activeWindow.title.currentLineNumber;
	application.activeWindow.title.startOfBuffer(false);
	for (i=0; i<=lZeile; i++){
			if (regExpExemplar.test(application.activeWindow.title.tag)){
				application.activeWindow.title.startOfField(false);
				application.activeWindow.title.wordRight(1, false);
				application.activeWindow.title.charRight(11, true);
				application.activeWindow.title.deleteSelection();
			}
			application.activeWindow.title.endOfField(false);
			application.activeWindow.title.lineDown (1, false);
	}
}
function vollanzeigeAlleVorkommnisse(strfeld){
	//meldet alle Vorkommisse eines Feldes aus der Vollanzeige eines Datensatzes
	var i=0;
	var alleFelder = new Array();
	while (application.activeWindow.findTagContent(strfeld, i, true) != ""){
		alleFelder.push(application.activeWindow.findTagContent(strfeld, i, true));
		i++;
	}
	return alleFelder; //Rückgabe als Array
	//return alleFelder.join("\n");
}
function loescheVorFeld(feld){
	//wird für 005 oder 0500 gebraucht. Löscht alle Zeilen oberhalb des Feldes
	application.activeWindow.title.findTag(feld, 0, true, true, false);
	application.activeWindow.title.startOfField(false)
	application.activeWindow.title.startOfBuffer(true);
	application.activeWindow.title.deleteSelection();
	application.activeWindow.title.endOfField(false);
}
function __loescheAlleExemplare(){
	var regExpExemplar = /E[0-9][0-9][0-9]/;
	var i, lZeile;
	application.activeWindow.title.endOfBuffer(false);
	lZeile = application.activeWindow.title.currentLineNumber;
	application.activeWindow.title.startOfBuffer(false);
	for (i=0; i<=lZeile; i++){
			if (regExpExemplar.test(application.activeWindow.title.tag)){
				application.activeWindow.title.startOfField(false);
				application.activeWindow.title.endOfBuffer(true);
				application.activeWindow.title.deleteSelection();
				return;
			}
			application.activeWindow.title.endOfField(false);
			application.activeWindow.title.lineDown (1, false);
	}
}
function hackSystemVariables(){
	//Clemens Buijs:
	var i, j, varName, varValue, reportG = "", reportV = "", reportL = "";
	var alpha = "!0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	//G:
	for (i = 0; i <= alpha.length; i++) {
		for (j = 0; j <= alpha.length; j++) {
		//	Use P3G for global, P3L for local, P3V for field variables
			varName = "P3G" + alpha.charAt(i) + alpha.charAt(j);
			varValue = application.activeWindow.getVariable(varName);
			if (varValue) reportG = reportG + "- " + varName + ": " + varValue + "\r\n";
		}
	}
	//V:
	for (i = 0; i <= alpha.length; i++) {
		for (j = 0; j <= alpha.length; j++) {
		//	Use P3G for global, P3L for local, P3V for field variables
			varName = "P3V" + alpha.charAt(i) + alpha.charAt(j);
			varValue = application.activeWindow.getVariable(varName);
			if (varValue) reportV = reportV + "- " + varName + ": " + varValue + "\r\n";
		}
	}
	//application.messageBox("V-Variable:", reportV, "message-icon");
	//L:
	for (i = 0; i <= alpha.length; i++) {
		for (j = 0; j <= alpha.length; j++) {
		//	Use P3G for global, P3L for local, P3V for field variables
			varName = "P3L" + alpha.charAt(i) + alpha.charAt(j);
			varValue = application.activeWindow.getVariable(varName);
			if (varValue) reportL = reportL + "- " + varName + ": " + varValue + "\r\n";
		}
	}
	//application.messageBox("L-Variable:", reportL, "message-icon");
	// Output to clipboard
	application.activeWindow.clipboard = reportG + reportV + reportL;
	application.messageBox("hackSystemVariables", "Alle Variablen befinden sich jetzt im Zwischenspeicher \n" + reportG + reportV + reportL, "message-icon");
	//application.activeWindow.appendMessage("Alle Variablen befinden sich jetzt im Zwischenspeicher", 2);
}
function __datum(){
	//Form: JJJJ.MM.TT
	var heute = new Date();

	var strMonat = heute.getMonth();
	strMonat = strMonat + 1;
	if (strMonat <10){strMonat = "0" + strMonat};

	var strTag = heute.getDate();
	if (strTag <10){strTag = "0" + strTag};

	var datum = heute.getFullYear() + "." + strMonat + "." + strTag;
	return datum;
}
function __datumJJJJMMTT(){
	var heute = new Date();
	var strMonat = heute.getMonth();
	strMonat = strMonat + 1;
	if (strMonat <10){strMonat = "0" + strMonat};
	var strTag = heute.getDate();
	if (strTag <10){strTag = "0" + strTag};
	var datum = heute.getFullYear() + strMonat + strTag;
	return datum;
}
function __datumUhrzeit(){
	//das Datum und die Uhrzeit wird Bestandteil des Dateinamens
	var jetzt = new Date();
	var jahr = jetzt.getFullYear();
	var monat = jetzt.getMonth() + 1;
	var strTag = jetzt.getDate();
	var stunde = jetzt.getHours();
	var minute = jetzt.getMinutes();
	var sekunde = jetzt.getSeconds();
	if (monat<10){monat = "0" + monat};
	if (strTag<10){strTag = "0" + strTag} ;
	if (stunde<10){stunde = "0" + stunde};
	if (minute<10){minute = "0" + minute};
	if (sekunde<10){sekunde = "0" + sekunde} ;
	return jahr.toString() + monat.toString() + strTag.toString() + stunde.toString() + minute.toString() + sekunde.toString();
}
function stringTrim(meinString){
	//Lösche Whitespace-Zeichen am Anfang und am Ende eines Strings:
	var regexpZeichen = /^\s|\s$/;
	while (regexpZeichen.test(meinString) == true){
		meinString = meinString.replace(regexpZeichen,"");
	}
	return meinString;
}
function feldAnalysePicaPlus(zeile, strUF){
	/*
	Wird aufgerufen mit Strings im PicaPlus-Format, z. B. eine Zeile des Datensatzes
	Ermittelt den Inhalt des im 2. Parameter angegebenen Unterfeldes nach u192 = ƒ
	feldAnalysePicaPlus(zeile, "b");
	*/
	var analyseString = "";
	var lPos1 = zeile.indexOf("\u0192" + strUF);
	if (lPos1 != -1) {
		analyseString = zeile.substring(lPos1+2);
		var lPos2 = analyseString.indexOf("\u0192"); //Beginn des nächsten Unterfeldes
		if (lPos2 != -1){
			analyseString = analyseString.substring(0, lPos2);
		}
	}
	return analyseString;
}
function feldAnalysePicaDrei(zeile, strUF){
	/* Wird aufgerufen mit einzelnen Strings im Pica3-Format,
     feldAnalysePicaDrei(zeile, "b");
     Inhalt des ersten Unterfeldes, das keine Kennzeichnung mit $ hat:
     feldAnalysePicaDrei(zeile, "");
	 Ermittelt den Inhalt des Unterfeldes nach Dollar
	*/
	var analyseString = "";
	//wenn ein $-Feld genannt wird:
	if (strUF != ""){
			var lPos1 = zeile.indexOf("$" + strUF);
			if (lPos1 != -1) {
				analyseString = zeile.substring(lPos1+2);
				var lPos2 = analyseString.indexOf("$"); //Beginn des nächsten Unterfeldes
				if (lPos2 != -1){
					analyseString = analyseString.substring(0, lPos2);
				}
			}
		} else {
			//es soll das 1. Feld geprüft werden, das nicht mit $ eingeleitet wird.
			if (__matCode1() == "T"){
				analyseString = zeile.substring(4);
			} else {
				analyseString = zeile.substring(5);
			}
			//wenn $T...$U...%% vorkommt, soll nur der danach folgende Feldinhalt zurückgegeben werden:
			analyseString = analyseString.replace(/\$T\d{2}\$U\D{4}%%/, "");
			var lPos2 = analyseString.indexOf("$"); //Beginn des nächsten Unterfeldes
			if (lPos2 != -1){
				analyseString = analyseString.substring(0, lPos2);
			}
	}
	return analyseString;
}
function holePicaPlusfeld(zeile, strSubField, strText){
	/*
	Erhält einzelne Zeilen im PicaPlus-Format und ermittelt den Inhalt des Unterfeldes, fügt davor einleitenden Text ein oder nichts: ""
	u192 = ƒ
	zeile: zeile in PicaPlusformat
	strSubField: Unterfeld
	strText: Text, der VOR dem Rückgabewert eingefügt werden soll
	Beispiel allgemein:
		holePicaPlusfeld(zeile, strSubField, strText);
	Beispiel speziell:
		Aus einem Array-Glied 'zeilen[n]' hole Feld 'A' und schreibe davor 'ISBN ':
		strFeld = holePicaPlusfeld(zeilen[n], "A", "ISBN ");
	*/
	var strInhalt = "";
	var lPos1 = zeile.indexOf("\u0192" + strSubField);
	if (lPos1 != -1) {
		strInhalt = zeile.substring(lPos1+2);
		var lPos2 = strInhalt.indexOf("\u0192"); //Beginn des nächsten Unterfeldes
		if (lPos2 != -1){
			strInhalt = strInhalt.substring(0, lPos2);
		}
	}
	//Vortext einfügen:
	if (strInhalt != ""){
		strInhalt = strText + strInhalt;
	}
	return strInhalt;
}
function holePersonenString(zeile, bLebensdaten){
	//erwartet ein Personenfeld in PicaPlus und true/false wenn Lebensdaten ausgegeben werden sollen
	//holt den Inhalt von 028A aus einem Titel
	//Fügt die Inhalte mit Deskriptionszeichen neu zusammen
	//wird in 4343, 4255, 4256, 4261, 4262 verwendet.
	var strFeld_a = "";
	var strFeld_d = "";
	var strFeld_c = "";
	var strFeld_5 = "";
	var strFeld_P = "";
	var strFeld_n = "";
	var strFeld_l = "";
	var strFeld_h = "";
	var strFeld_8 = "";
	var strName = "";
	var strLebensdaten="";
	var regExpLebensdaten = /\*(.*)\*/;
	//lösche GND-ID:
	zeile = zeile.replace(/ ; ID: .*/,"");
	//Nachname:
	strFeld_a = holePicaPlusfeld(zeile, "a", "");
	//Vorname:
	strFeld_d  = holePicaPlusfeld(zeile, "d", ", ");
	//Präfix:
	strFeld_c  = holePicaPlusfeld(zeile, "c", " ");
	//Lebensdaten, wenn in Unterfeld $h erfasst
	strFeld_h  = holePicaPlusfeld(zeile, "h", ", ");
	//anstelle von $a, d, c kann auch $P, n, l vorkommen:
	//persönlicher Name:
	strFeld_P  = holePicaPlusfeld(zeile, "P", "");
	//Zählung:
	strFeld_n  = holePicaPlusfeld(zeile, "n", " ");
	//Ordnungshilfe:
	strFeld_l  = holePicaPlusfeld(zeile, "l", ", ");
	//Lebensdaten: Zukünftig vielleicht in $h, im Moment aber noch in der Expansion $8 *...*
	strFeld_8  = holePicaPlusfeld(zeile, "8", "");
	strName = strFeld_a + strFeld_d + strFeld_c + strFeld_P;
	if (strName == ""){
		//der Name wird aus $8 geholt:
		strName = strFeld_8.replace(/ \*.*/,"");
		//alert("strName: " + strName);
	}
	//wenn die Lebensdaten nicht in $h stehen, dann sollen sie aus der Expansion geholt werden:
	if (strFeld_h == "" && strFeld_8 != "" && regExpLebensdaten.test(strFeld_8) == true){
		regExpLebensdaten.exec(strFeld_8);
		strLebensdaten = ", " + RegExp.$1;
	}
	//Ausgabe aller Felder (in der Annahme, dass entweder a, d, c oder 5, P, n vorkommen, aber nicht gleichzeitig!
	if (bLebensdaten == true){
		return strName + strFeld_n + strFeld_l + strFeld_h + strLebensdaten;
	} else {
		//Für Lax-Sätze ohne Lebensdaten (Uschi!):
		return strName + strFeld_n + strFeld_l + strFeld_h;
	}
}

function holeKoerperschaftenString(zeile){
	//erwartet ein Körperschaftsfeld in PicaPlus
	//Fügt die Inhalte mit Deskriptionszeichen neu zusammen
	//wird in 4241, 4261, 4262 verwendet.
	var str3100="";
	var lGruppeNDC=0;
	var strGruppeNDC="";
	var regExpFeldG = /\$g(.*?)\$/; //es folgt ein Unterfeld
	var regExpFeldGEnd = /\$g(.*?)$/; // es ist das Ende des Strings
	//Expansion in $8:
	var strFeldInhalt = holePicaPlusfeld(zeile, "8", "");
	strFeldInhalt = strFeldInhalt.replace(/ ; ID: .*/,""); //lösche GND-ID
	//Wenn es keinen PPN-Link gibt:
	if (strFeldInhalt != "" ) {
		str3100 = strFeldInhalt;
	} else {
		str3100 = feldAnalysePicaPlus(zeile, "a");
	}
	//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
	//Inhalt des Feldes $g in der Expansion ($8) in runde Klammern setzen. Vielleicht geht es eleganter, aber so funktioniert's!
	//Beispiel Trainingsdatenbank: 3100 !506845508!Kunst- und Auktionshaus Jan Clausen & Dirk Krüger$gLeipzig ; ID: gnd/10125593-7
	if(regExpFeldG.test(str3100) == true){
		str3100 = str3100.replace("$g" + RegExp.$1, " (" + RegExp.$1 + ")");
	} else if(regExpFeldGEnd.test(str3100) == true){
		str3100 = str3100.replace("$g" + RegExp.$1, " (" + RegExp.$1 + ")");
	}
	//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
	//im String von $8 suche die Felder n, d, c und gebe sie in runden Klammern aus:
	lGruppeNDC = str3100.indexOf("$c");
	if (lGruppeNDC != -1 ) {
		strGruppeNDC = str3100.substr(lGruppeNDC+2)
		str3100 = str3100.substr(0, lGruppeNDC); //der Rest der Zeile
	}
	lGruppeNDC = str3100.indexOf("$d");
	if (lGruppeNDC != -1 ) {
		strGruppeNDC = str3100.substr(lGruppeNDC+2) + " : " + strGruppeNDC;
		str3100 = str3100.substr(0, lGruppeNDC); //der Rest der Zeile
	}
	lGruppeNDC = str3100.indexOf("$n");
	if (lGruppeNDC != -1 ) {
		strGruppeNDC = str3100.substr(lGruppeNDC+2) + " : " + strGruppeNDC
		str3100 = str3100.substr(0, lGruppeNDC); //der Rest der Zeile
	}
	if(strGruppeNDC!=""){
		strGruppeNDC = stringTrim(strGruppeNDC);
		str3100 = str3100 + " (" + strGruppeNDC + ")";
		str3100 = str3100.replace(/ :\)/, ")");
	}
	//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
	//Feld b und x:
	str3100 = str3100.replace(/\$b/g,". ");
	str3100 = str3100.replace(/\$x/g," / ");
	//Wenn jetzt noch $-Unterfeldbezeichnungen vorkommen, sollen sie gelöscht werden
	str3100 = str3100.replace(/\$.{1}/g," ");
	return str3100;
}




function __pruefeZDB(){
	//Prüfung wird von manchen ZDB-Funktionen und den Datenmasken verwendet
	//die nur in der ZDB angewendet werden sollen.
	var strSystem = application.activeWindow.getVariable("P3GSY");
	//alert(strSystem);
	//application.activeWindow.clipboard = strSystem;
	if (strSystem != "ZENTRALKATALOG" && strSystem != "ILTIS-APPROVAL"){
		application.messageBox("ZDB-Funktionen", strSystem + "\nSie können diese Funktion nur in der ZDB ausführen!", "alert-icon");
	} else {
		return true;
	}
}
function setzeIMD(strMat1){
	//Inhaltstyp, Medientyp, Datenträgertyp nach RDA
	var strIMD = "";
	switch (strMat1){
		case "A":
			strIMD = "0501 Text$btxt" +
				"\n0502 ohne Hilfsmittel zu benutzen$bn" +
				"\n0503 Band$bnc";
			break;
		case "O":
			strIMD = "0501 Text$btxt" +
				"\n0502 Computermedien$bc" +
				"\n0503 Online-Ressource$bcr";
			break;
		case "S":
			strIMD = "0501 Text$btxt" +
				"\n0502 Computermedien$bc" +
				"\n0503 Computerdisk$bcd";
			break;
		default: strIMD = "0501 " +
				"\n0502 " +
				"\n0503 ";
	}
	//alert("setzeIMD meldet: " + strIMD);
	return strIMD;
}
function abkuerzungRakRDA(strFeld){
	//wandelt RAK-Abkürzungen in vollen Text um
	//kommt in 4060 vor:
	strFeld = strFeld.replace(/Bl\b\.?/g, "Blatt");
	strFeld = strFeld.replace(/ p\b\.?/g, " pages"); //Blank + p, sonst wird auch Wortende p ersetzt
	strFeld = strFeld.replace(/S\b\.?/g, "Seiten");
	//kommt in 4061 vor:
	strFeld = strFeld.replace(/Ill\b\.?/g, "Illustrationen");
	strFeld = strFeld.replace(/zahlr\b\./gi, "");
	strFeld = strFeld.replace(/überw\b\./gi, "");
	strFeld = strFeld.replace(/nur\b/gi, "");
	strFeld = strFeld.replace(/graph. Darst\b\.?/gi, "Illustrationen");
	strFeld = strFeld.replace(/Illustrationen, Illustrationen/, "Illustrationen"); //wenn es 2x ersetzt wurde
	strFeld = strFeld.replace(/Kt\b\.?/g, "Karten");
	strFeld = strFeld.replace(/Notenbeisp\b\.?$/g, "Notenbeispiele");
	//kommt in 4020 vor:
	strFeld = strFeld.replace(/Aufl\b\.?/gi, "Auflage");
	strFeld = strFeld.replace(/Ausg\b\.?/g, "Ausgabe");
	strFeld = strFeld.replace(/bearb\b\./g, "bearbeitete");
	strFeld = strFeld.replace(/ ed\b\./g, " edition");
	strFeld = strFeld.replace(/ erw\b\./g, " erweiterte");
	strFeld = strFeld.replace(/neubearb\b\./g, "neubearbeitete");
	strFeld = strFeld.replace(/Neubearb\b\.?/g, "Neubearbeitung");
	strFeld = strFeld.replace(/unveränd. Nachdr\.?/gi, "unveränderter Nachdruck");
	strFeld = strFeld.replace(/Nachdr\b\.?/g, "Nachdruck");
	strFeld = strFeld.replace(/verb\b\.?/g, "verbesserte");
	strFeld = strFeld.replace(/,+/g, ","); //mehrere Kommata
	return(strFeld);
}
function hilfeFeld()
{
	//Funktion braucht noch den Shortcut Shift-F1!!!
	var bZDB = false;
	var thePrompter = utility.newPrompter();
	var strFeld = "";
	if (application.activeWindow.getVariable("P3GCN") == "DNB"){
		bZDB = true;
		derTitel = "Format-Dokumentation ZDB/GND";
	}
	if(application.activeWindow.title){
		strFeld = application.activeWindow.title.tag;
	}
	thePrompter.prompt("Format-Dokumentation K10Plus", "Zeige mir die Dokumentation zu Feld ...", "", "", false);
	strFeld = thePrompter.getEditValue();
	if (!strFeld) return;
	if (bZDB == true){
		if (strFeld.length == 3){
			application.shellExecute("http://wiki.dnb.de/download/attachments/50759357/" + strFeld + ".pdf", "open", "");
		} else if (strFeld.length == 4){
			application.shellExecute("https://zeitschriftendatenbank.de/fileadmin/user_upload/ZDB/pdf/zdbformat/" + strFeld + ".pdf", "open", "");
		}
	} else {
			application.shellExecute("https://format.k10plus.de/k10plushelp.pl?cmd=kat&val=" + strFeld + "&kattype=Standard", "open", "");
	}
}
function geheZuZeile(zeilenNr){
	//Wegen mehrzeiliger Felder immer ans Ende der Zeile
	zeilenNr = parseInt(zeilenNr,10);
	application.activeWindow.title.startOfBuffer(false);
	for (var i = 1; i < zeilenNr; i++){
		application.activeWindow.title.lineDown(1, false);
		application.activeWindow.title.endOfField(false);
	}
	application.activeWindow.title.startOfField(false);
}
function externeSuche(){
	// Funktioniert noch nicht!!! Es wird nicht das letzte Kommando ermittelt, sondern das vorletzte???
	var strCommand = application.activeWindow.getLastCommand();
	alert(strCommand);
	application.activeWindow.command("ext " + strCommand, false);
	if (application.activeWindow.status == "NOTNOW"){
		application.messageBox("externe Suche", "Vor dem ersten Anwenden dieser Funktion muss eine einzige Recherche über den externen Suchschirm ausgeführt werden (Kommando: ext f)! Erst danach kennt diese Funktion die externen Datenbanken, in denen Ihre Suche wiederholt werden soll.", "alert-icon");
	}
}
function WinIBW4Handbuch(){
	application.shellExecute("https://wiki.k10plus.de/display/K10PLUS/WinIBW4-Handbuch", "open", "");
}
function KatalogisierungsHandbuecher(){
	application.shellExecute("https://wiki.k10plus.de/pages/viewpage.action?pageId=27361358", "open", "");
}
function HandbuchKooperativeSacherschliessung(){
	application.shellExecute("https://opus.k10plus.de/frontdoor/deliver/index/docId/434/file/K10plus_Sacherschliessung.pdf", "open", "");
}
function ZDBformatbeschreibung(){
	application.shellExecute("https://zeitschriftendatenbank.de/erschliessung/zdb-format", "open", "");
}
function DokumentationGBVFernleihe(){
	application.shellExecute("https://www.gbv.de/informationen/bibliotheken/fernleihe", "open", "");
}
function EmailanVerbundzentrale(){
	application.shellExecute("https://www.gbv.de/informationen/bibliotheken/verbundbibliotheken/cbs/06Ansprechpersonen/sendmessageform?mto=CKO0019", "open", "");
}
function MeldungenKopieren(){
	var strMeldung = __alleMeldungen();
	//am Ende Zeilenumbruch entfernen:
	strMeldung = strMeldung.substr(0, strMeldung.length-1);
	strMeldung = strMeldung.replace(/\n/g," / ");
	application.activeWindow.clipboard = "\u0022" + strMeldung + "\u0022"; // u0022 = Quot
	__meldung("Der Meldetext wurde in den Zwischenspeicher kopiert.");
}
function __holeISIL(){
	//holt Bibliotheksprofil in einem neuem Fenster, ermittelt ISIL, schließt Fenster, gibt ISIL zurück.
	application.activeWindow.command("s bib", true);
	var strISIL = application.activeWindow.getVariable("P3VBK");
	application.activeWindow.closeWindow();
	return strISIL;
}