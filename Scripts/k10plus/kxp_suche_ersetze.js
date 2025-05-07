/*
	Autorin:	Karen Hachmann
	Datum:	2024.03
*/
// globale Variable:
var bwholeWord, bCaseSensitive, bLokNormsatz;
var strSuche, strErsetze, strFeldErstes, strFeldLetztes;
var strWennFeld, strWennText, strDannFeld, strDannText;
var strBedingung1, strBedingung2Feld, strBedingung2Text;
var strEbene;
var aktion;
var antwort;
var hinweisVZG, strELN, strUser, strLokFelder, strExeFelder;
var bError, lBearbeitet, lFehler, strFehlerMeldungen = "", strFehlerpfad = "";
var strSatzart, bSatzartErlaubt;
var strMeldungEbene0 = "Sie dürfen die bibliographische Ebene nicht bearbeiten.\nAusnahme: Td- und Te-Sätze dürfen bearbeitet werden.\nWollen Sie fortfahren?"

//---------------------------------------------
function sucheErsetzeDialog(){
	//showDialog(dialogName, dialogStartPointX, dialogStartPointY, dialogWidth, dialogHeight)
	showDialog('ProfD\\Dialogs\\kxp_suche_ersetze_dialog.html', 300, 100, 350, 350);
}
function __frageTabWechsel(){
	var thePrompter = utility.newPrompter();
	antwort = thePrompter.confirmEx("Suche / Ersetze Tool", "Alle Felder dieser Registerkarte werden gelöscht, wenn Sie zu einer anderen wechseln.\nWeitermachen?", "Nein, hier bleiben", "Ja, Felder löschen", "", "", "");
	utility.sentDataToDialog(antwort);
}
function meldungSucheErsetze(meldungstext){
	if (lFehler < 10){
		application.messageBox("Suche / Ersetze im Set", meldungstext, "message-icon");
	} else {
		application.messageBox("Suche / Ersetze im Set", lFehler + " Fehler\nAlle Fehlermeldungen wurden in die Protokolldatei geschrieben.", "message-icon");
	}

}
function sucheErsetzeDialogStart(o){
	var thePrompter = utility.newPrompter();
	//alle drei Aktionen: Ersetzen, Ergaenzen, Loeschen
	//Werte der Variablen zurücksetzen:
	strEbene = "0";
	bwholeWord=false, bCaseSensitive=false, bLokNormsatz=false;
	strSuche="", strErsetze="", strFeldErstes="", strFeldLetztes="";
	strWennFeld="", strWennText="", strDannFeld="", strDannText="";
	strBedingung1="", strBedingung2Feld="", strBedingung2Text="";
	//true und false kommen als String an und müssen zu Boole umgesetzt werden:
	o.idCheckboxWord == "true" ? bwholeWord = true : bwholeWord = false;
	o.idCheckboxCaseSensitive == "true" ? bCaseSensitive = true : bCaseSensitive = false;
	aktion = o.idButtonStart;
	var bRechte = _erweitereRechte();
	//alert("bRechte: " + bRechte);
	//Prüft Datenbank und Felder. Abbruch, wenn Datenbank unbekannt
	if(_sucheErsetzePruefeFelder() == false) return;
	switch (aktion){
		case "Ersetzen":
			if (o.idSuche) strSuche = o.idSuche;
			if (o.idErsetze) strErsetze = o.idErsetze;
			if (o.idFeldErstes) strFeldErstes = o.idFeldErstes;
			if (o.idFeldLetztes) {
				strFeldLetztes = o.idFeldLetztes;
				alert("Inhalt von strFeldLetztes: " + strFeldLetztes)
			} else {
				strFeldLetztes = "";
			}
			//Bedingungen:
			if (o.idBedingung1) strBedingung1 = o.idBedingung1;
			if (o.idBedingung2Feld) strBedingung2Feld = o.idBedingung2Feld;
			if (o.idBedingung2Text) strBedingung2Text = o.idBedingung2Text;
			//hier wird geprüft, ob Benutzer das Feld ändern darf
			strEbene = pruefeEbene(strFeldErstes);//hier wird geprüft, ob Benutzer das Feld einfügen darf
			if (bRechte == false && strEbene == 0){
				antwort = thePrompter.confirmEx("Suche / Ersetze-Tool", strMeldungEbene0, "Ja", "Nein", "", "", "");
				if (antwort == 1) { // 1 = nein
					return;
				}
			}
			break;
		case "Ergaenzen":
			if (o.idWennFeld) strWennFeld = o.idWennFeld;
			if (o.idWennText) strWennText = o.idWennText;
			if (o.idDannFeld) strDannFeld = o.idDannFeld;
			if (o.idDannText) strDannText = o.idDannText;
			//hier wird geprüft, ob beide Felder zu derselben Ebene gehören:
			if (pruefeEbene(strWennFeld) != pruefeEbene(strDannFeld)){
				alert("Aktion kann nicht ausgeführt werden.\nDie beiden Felder " + strWennFeld + " und " + strDannFeld + " gehören zu unterschiedlichen Datensatzebenen.");
				return;
			}
			//hier wird geprüft, ob Benutzer das Feld einfügen darf
			strEbene = pruefeEbene(strDannFeld);
			if (bRechte == false && strEbene == "0"){
				antwort = thePrompter.confirmEx("Suche / Ersetze-Tool", strMeldungEbene0, "Ja", "Nein", "", "", "");
				if (antwort == 1) { // 1 = nein
					return;
				}
			}
			break;
		case "Loeschen":
			if (o.idLoescheFeld) strWennFeld = o.idLoescheFeld;
			if (o.idLoescheText) strWennText = o.idLoescheText;
			//hier wird geprüft, ob Benutzer das Feld löschen darf
			strEbene = pruefeEbene(strWennFeld);
			if (bRechte == false && strEbene == 0){
				antwort = thePrompter.confirmEx("Suche / Ersetze-Tool", strMeldungEbene0, "Ja", "Nein", "", "", "");
				if (antwort == 1) { // 1 = nein
					return;
				}
			}
			break;
	}
	_sucheErsetzeBearbeiteSet();
}

function _sucheErsetzePruefeFelder() {
	//hier werden nur einige globale Variable mit Inhalt gefüllt
	var strVerbund = application.activeWindow.getVariable("P3GCN");
	switch(strVerbund){
	case "K10plus":
		hinweisVZG = "Sie haben Felder der bibliographischen Ebene (Titelebene) ausgewählt. " +
			"\nDas Bearbeiten ganzer Sets auf bibliographischer Ebene ist der Verbundzentrale vorbehalten." +
			"\nBitte senden Sie Ihre Korrekturvorschläge an Frau Hachmann: hachmann@gbv.de";
		strELN = "1999|2012|2013|7777";
		strUser = "g9051|g6723";
		strLokFelder = "208[0-9]|3433|348[0-9]|354[0-9]|471[0-9]|476[34]|4790|60[0-9xX][0-9xX]|61[0-9]|6110|65[0-9xX][0-9xX]|9000";
		strExeFelder = "48[0-9][0-9]|6600|67[0-9xX][0-9xX]|68[0-9xX][0-9xX]|E[0-9xX][0-9xX][0-9xX]|71[0-4][0-9]|7200|73[0-9][0-9]|781[0-3]|8[0-6][0-9][0-9]";
		return true;
		break;
	case "DNB":
		hinweisVZG = "Sie haben Felder der bibliographischen Ebene (Titelebene) ausgewählt. " +
			"\nDas Bearbeiten ganzer Sets auf bibliographischer Ebene ist der Zentralredaktion vorbehalten." +
			"\nBitte senden Sie Ihre Korrekturvorschläge an zdb-winibw@sbb.spk-berlin.de";
		strELN = "7777|8007|9001|9006|9002";
		strUser = "6001|6199|6099|6004";
		strLokFelder = "2080|348[01]|354[0-9]|471[056]|476[34]|60[0-9xX][0-9xX]|6100|65[0-9xX][0-9xX]";
		strExeFelder = "480[012]|4820|4822|6700|70[0-9xX][0-9xX]|710[0-9]|7120|713[345678]|714[0-9]|715[09]|7[89]00|8001|803[12345]|8[12]00|844[89]|846[567]|8510|859[45678]";
		return true;
		break;
	default:
		meldungSucheErsetze("Unbekannte Datenbank!");
		return false;
	}
}
function pruefeEbene(strfeld) {
	//gibt die zu bearbeitende Ebene zurück
	var oRegExpFeldLok = new RegExp(strLokFelder);//Felder der Lokalebene
	var oRegExpFeldExe = new RegExp(strExeFelder);//Felder der Exemplarebene
	if (oRegExpFeldLok.test(strfeld) == true) {
		strEbene = "1";
	} else if (oRegExpFeldExe.test(strfeld) == true) {
		strEbene = "2";
	} else {
		strEbene = "0";
	}
	//alert ("Feld: " + strfeld + "\nEbene: " + strEbene);
	return strEbene;
}

function _erweitereRechte() {
	var bUserErlaubt = false;
	var bBibliothekErlaubt = false;
	//Prüfe ELN:
	//1999 = VZG, 2012 = GND, 2013 = PND
	//7777 = ELN des GBV in der DNB
	var oRegExpELN = new RegExp(strELN);
	// WinIBW4 kann die Variable libID nicht lesen
	//bBibliothekErlaubt = oRegExpELN.test(application.activeWindow.getVariable("libID"));
	bBibliothekErlaubt = oRegExpELN.test(application.activeWindow.getVariable("P3GUL"));
	//alert("Bibliothek erlaubt? " + bBibliothekErlaubt);

	// Prüfe User:
	var oRegExpUser = new RegExp(strUser);
	//alert(application.activeWindow.getVariable("P3GUK"))
	bUserErlaubt = oRegExpUser.test(application.activeWindow.getVariable("P3GUK"));
	//alert("Benutzer erlaubt? " + bUserErlaubt);

	//im Bestand 1.86 (BMS) dürfen Kennungen g3241k001, g9551 Ebene0 bearbeiten
	if (application.activeWindow.getVariable("P3GBI") == "1.86"){
		oRegExpUser = new RegExp("g3241k001|g9551");
		//ergebnis3 = oRegExpUser.test(application.activeWindow.getVariable("P3GUK"));
		bUserErlaubt = oRegExpUser.test(application.activeWindow.getVariable("P3GUK"));
	}
	//alert("bBibliothekErlaubt: " + bBibliothekErlaubt +"\nbUserErlaubt: " + bUserErlaubt);
	if (bBibliothekErlaubt == true || bUserErlaubt == true) {
		return true;
	}
	return false;
}

function _sucheErsetzeBearbeiteSet(){
	var lSetsize;
	var datensatzNr = 0;
	var strScreen;
	var thePrompter = utility.newPrompter();
	bError = false;
	lBearbeitet = 0;
	lFehler = 0;
	strFehlerMeldungen = "";
	bSatzartErlaubt = true;
	var strMeldungAnDialog;
	var Schlussmeldung;
	try {
		if (__anzeigeKurzVoll() == false) return;
		/*strScreen = application.activeWindow.getVariable("scr");
		if (strScreen != "7A" && strScreen != "8A") {
			bError = true;
			meldungSucheErsetze("Datensatz muss sich in der Kurz- oder Vollanzeige befinden!");
			return;
		}*/
		lSetsize = application.activeWindow.getVariable("P3GSZ");
		antwort = thePrompter.confirmEx("Suche / Ersetze-Tool", "Wollen Sie jetzt alle " + lSetsize + " Datensätze bearbeiten?", "Ja", "Nein", "", "", "");
		//antwort 1 = nein:
		if (antwort == 1) {
			return;
		}
		//Set bearbeiten:
		for (datensatzNr = 1; datensatzNr <= lSetsize; datensatzNr += 1) {
			application.activeWindow.command("\\too " + datensatzNr, false);
			//welche Ebene darf bearbeitet werden?
			if (strEbene == "2") {
					bearbeiteEbene2(aktion);
			} else {
				bearbeiteEbene0und1(aktion);
			}
		}
		Schlussmeldung = "";
		lBearbeitet == 1 ? Schlussmeldung = " Datensatz bearbeitet" : Schlussmeldung = " Datensätze bearbeitet";
		if (strFehlerMeldungen != ""){
			schreibeFehlerdatei(strFehlerMeldungen);
			meldungSucheErsetze(lFehler  + " Fehlermeldung(en): " + strFehlerMeldungen);
			strMeldungAnDialog = lBearbeitet + Schlussmeldung +  "\n" + lFehler + " Fehler\nFehlermeldungen in Datei:\n" + strFehlerpfad;
		} else {
			strMeldungAnDialog = lBearbeitet + Schlussmeldung +  "\n" + lFehler + " Fehler";
		}
		if (bSatzartErlaubt == false){
			meldungSucheErsetze(lBearbeitet + Schlussmeldung + "\nSie dürfen nur Td- und Te-Sätze bearbeiten.");
		}
		utility.sentDataToDialog(strMeldungAnDialog);
	} catch (e) {
		application.messageBox("Fehler 1", e, "");
	}
}

function bearbeiteEbene0und1(aktion) {
	//alert("bearbeiteEbene0und1")
	//bearbeite die bibliographische bzw. lokale Ebene:
	var strKommando = "";
	if (strEbene == "1") {
		strKommando = "\\mut l";
		strSatzart = "Lokalsätzen";
	} else {
		strKommando = "\\mut";
		strSatzart = "Datensätzen";
	}
	var strMat = application.activeWindow.materialCode;
	if (!_erweitereRechte() && strMat != "Te" && strMat != "Td" && strEbene != "1") {
		bSatzartErlaubt = false;
		return;
	}
	application.activeWindow.command(strKommando, false);
	doAktion(aktion);
}
function bearbeiteEbene2(aktion) {
	//alert("bearbeiteEbene2")
	//bearbeite Exemplare
	strSatzart = "Exemplarsätzen";
	var strTitle = application.activeWindow.getVariable('P3CLIP');
	//var strTitle = application.activeWindow.copyTitle();
	var regexpExe = /\n(E[0-9][0-9][0-9])/g;
	var alleExe  = new Array();
	var exNr;
	var i = 0;
	alleExe = strTitle.match(regexpExe);
	//wenn keine Exemplare vorhanden:
	if (!alleExe) {
		return;
	}
	for (i; i < alleExe.length; i += 1) {
		exNr = alleExe[i].substring(3, 5);
		//alert("Exemplar: " + exNr);
		application.activeWindow.command("\\mut e" + exNr, false);
		//Wenn Status nicht "OK", liegt es ggf. daran, dass die Kennung keine Befugnisse zum Ändern
		//des Exemplares mit Selektionszeichen einer anderen Bibliothek hat.
		if (application.activeWindow.status == "OK") {
			//alert("Aktion: " + aktion + "\nBearbeite Exemplar Nr.: " + exNr);
			doAktion(aktion);
		}
	}
}

function doAktion(aktion) {
	//alert(aktion);
	switch (aktion) {
	case 'Ersetzen':
		_bearbeiteZeilenErsetzen();
		break;
	case 'Ergaenzen':
		_bearbeiteZeilenErgaenzen();
		break;
	case 'Loeschen':
		_bearbeiteZeilenLoeschen();
		break;
	}
	application.activeWindow.simulateIBWKey("FR");
	_zaehleDatensaetze();
}

function _bearbeiteZeilenErsetzen() {
	//Zuerst werden die Zeilen gezählt, dann wandert das Script durch
	//den ganzen Datensatz und vergleicht die Felder mit den Vorgaben des Anwenders
	//bei der find-Anweisung steht lineOnly immer auf true, weil jede Zeile einzeln
	//untersucht werden soll
	//var regex = false;
	//var regexBed1 = false;
	var zeilenNr;
	//var bed1 = true;
	//var current;
	//var replaced;
	var lZeilen;
	var strTag;
	application.activeWindow.title.endOfBuffer(false);
	lZeilen = application.activeWindow.title.currentLineNumber;
	application.activeWindow.title.startOfBuffer(false);

	//alle Zeilen im Datensatz prüfen:
	for (zeilenNr = 1; zeilenNr <= lZeilen; zeilenNr += 1) {
		strTag = application.activeWindow.title.tag;
		//alert("Aktuelles Feld: " + strTag)// + "\nFeldErstes: " + strFeldErstes + "\nFeldLetztes: " + strFeldLetztes);
		//alle Vorkommnisse im Feld werden ersetzt:
		if (strFeldLetztes == "") strFeldLetztes = strFeldErstes;
		if (strTag >= strFeldErstes && strTag <= strFeldLetztes) {
			//alert("Jetzt wird ersetzt");
			if (__pruefeBedingungen() == true){
				application.activeWindow.title.startOfField(false);
				//Wenn nur wortweise gesucht werden soll, erkennt WinIBW4 nicht den Beginn des nächsten Unterfeldes mit $=Dollar, z. B. 7100 $a123$du: Kann 123 nicht als Wort erkennen
				while (application.activeWindow.title.find(strSuche, bCaseSensitive, true, bwholeWord) == true) {
					application.activeWindow.title.insertText(strErsetze);
				}
			}
		}
		application.activeWindow.title.lineDown(1, false);
	}
}
function __pruefeBedingungen(){
	var bBedingung = false;
	var strFeld = "";
	var i = 0;
	//1 true: wenn keine Bedingungen gesetzt:
	if (strBedingung1 == "" && strBedingung2Feld == "") return true;
	//2 true: wenn in demselben Feld der gesuchte Text vorkommt;
	if (strBedingung1 != "" && application.activeWindow.title.find(strBedingung1, bCaseSensitive, true, bwholeWord) == true) return true;
	//3 true: wenn anderes Feld mit passendem Text vorkommt:
	if (strBedingung2Feld != "" ){
		//alle Vorkommnisse prüfen
		do {
			strFeld = application.activeWindow.title.findTag(strBedingung2Feld, i, false, false, false);
			if (strFeld.indexOf(strBedingung2Text) != -1) bBedingung = true;
			i++;
		} while (strFeld != "")
		if (bBedingung == true) return true;
	}
}
function _bearbeiteZeilenErgaenzen(){
	//Wenn das Feld gefunden wird, dessen Inhalt geprüft werden soll, wird gleich darunter das neue Feld eingefügt
	//das funktioniert nur wenn beide Felder zur selben Ebene gehören.
	//So kann mehrmals ergänzt werden
	var zeilenNr;
	var lZeilen;
	var strTag, strInhalt;
	application.activeWindow.title.endOfBuffer(false);
	lZeilen = application.activeWindow.title.currentLineNumber;
	application.activeWindow.title.startOfBuffer(false);
	//alle Zeilen im Datensatz prüfen:
	for (zeilenNr = 1; zeilenNr <= lZeilen; zeilenNr += 1) {
		strTag = application.activeWindow.title.tag;
		strInhalt = application.activeWindow.title.currentField;
		strInhalt = strInhalt.substr(5);//ab Pos. 5
		//alert(strTag  + "\n" + strInhalt)
		//alle Zeilen werden geprüft und Feld ergänzt:
		if (strTag == strWennFeld && application.activeWindow.title.find(strWennText, bCaseSensitive, true, bwholeWord)==true){
			application.activeWindow.title.endOfField(false);
			application.activeWindow.title.insertText("\n" + strDannFeld + " " + strDannText);
		}
		application.activeWindow.title.lineDown(1, false);
	}
}

function _bearbeiteZeilenLoeschen(){
	var zeilenNr;
	//var bed1 = true;
	//var current;
	//var replaced;
	var lZeilen;
	var strTag, strInhalt;
	application.activeWindow.title.endOfBuffer(false);
	lZeilen = application.activeWindow.title.currentLineNumber;
	application.activeWindow.title.startOfBuffer(false);

	//alle Zeilen im Datensatz prüfen:
	for (zeilenNr = 1; zeilenNr <= lZeilen; zeilenNr += 1) {
		strTag = application.activeWindow.title.tag;
		strInhalt = application.activeWindow.title.currentField;
		strInhalt = strInhalt.substr(5);//ab Pos. 5
		//alert(zeilenNr  + "\n" + strTag  + "\n" + strInhalt)
		//alle Zeilen werden geprüft und Feld ergänzt:
		if (strTag == strWennFeld && application.activeWindow.title.find(strWennText, bCaseSensitive, true, bwholeWord)==true){
			application.activeWindow.title.deleteLine(1);
			lZeilen -= 1;
		} else {
			application.activeWindow.title.lineDown(1, false);
		}
	}
}
function _zaehleDatensaetze() {
	var strPPN, i;
	if (application.activeWindow.status == "ERROR") {
		bError = true;
		lFehler += 1;
		strPPN = application.activeWindow.getVariable("P3GPP");
		strFehlerMeldungen += "\r\nPPN: " + strPPN + " / Meldung: " + __alleMeldungen();
		application.activeWindow.simulateIBWKey("FE");
	} else if (/OK|Warnung/.test(__alleMeldungen())) {
		//Wann "Warnung" vorkommt, ist mir gerade nicht bekannt, evtl. im CBS von DNB oder ZDB?
		lBearbeitet += 1;
	}
}

//-----------------------------
function schreibeFehlerdatei(fehler){
	var currentFilename = "error_" +__datumUhrzeit() + ".txt";
	var theFileOutput = utility.newFileOutput();
	theFileOutput.createSpecial("ProfD", "\\listen\\" + currentFilename);
	theFileOutput.setTruncate(true);
	theFileOutput.write(fehler);
	theFileOutput.close();
	strFehlerpfad = theFileOutput.getPath() + "\\" + currentFilename;
}