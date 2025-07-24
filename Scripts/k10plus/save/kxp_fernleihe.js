//	Datei:	kxp_fernleihe.js
//	Autorin:	Karen Hachmann, VZG
//	Datum:	2023.02
function Fernleihstatistik() {
	//in WinIBW4 getestet: OK
	// Infos: c:\Users\Hachmann\Documents\WinIBW3\scripting_und_XUL\Fernleihstatistik auf FTP.docx
	application.shellExecute ("https://nextcloud.gbv.de/nextcloud/index.php/s/RgNj79KfNXnCLWy", "open", "");
}
//--------------------------------------------------------------------------------------
//---- FLS-Script uebernommen von HEBIS
function FernleiheZeigeVflLeitweg()
{
	//Fernleihnummer wird nicht mehr aus ANr sondern aus P3V00 geholt
	//Kommando zum Testen: sel emp bib 8110
	var anr = application.activeWindow.getVariable("P3V00");
	if (anr.length != 10){
		__fehler ("Keine K10plus-Bestellnummer ermittelbar. \nSie müssen diese Funktion aus " +
			"der Vollanzeige der Fernleihbestellung aufrufen.");
	}
	else {
		application.shellExecute("https://cbsill.k10plus.de/zeige_vfl_leitweg?ANr=" + anr, "open", "");
	}
}
//--------------------------------------------------------------------------------------

function FernLeiheZeigeVflLeitwegTest()
{
	//Test im CBST7: sel emp bib 8110
	//in WinIBW4 getestet: Interne Variable libID und ANr werden nicht erkannt
	//ANr ersetzt durch P3V00
	//libID ersetzt durch P3GOI
	if (__meineBibGBV() != "1999") return;
	var anr = application.activeWindow.getVariable("P3V00");
	if (anr.length != 10){
		__fehler ("Keine K10plus-Bestellnummer ermittelbar. \nSie müssen diese Funktion aus " +
			"der Vollanzeige der Fernleihbestellung aufrufen.");
	}
	else {
		application.shellExecute("http://cbst7.gbv.de:8080/cgi-bin/vuefl/zeige_vfl_leitweg.pl?ANr=" + anr, "open", "");
	}
}
function ZetteldruckUebergangsloesung(){
	//in WinIBW4 getestet: OK
	//02.2023: Regina Willwerth denkt, dass diese Funktion noch von wenigen Bibliotheken verwendet wird
	var derName, password, report="";
	if (application.activeWindow.getVariable("scr") == "UD" ){
		derName = application.activeWindow.getVariable("P3VU1");
		password = application.activeWindow.getVariable("P3VU4");
		if (derName) report = report + "BenutzerIn:\t" + derName;
		if (password) report = report + "\n" + "Passwort:\t" + password;
		// Output to clipboard
		application.activeWindow.clipboard = report;
		application.activeWindow.showMessage ("Benutzername und Passwort befinden sich jetzt im Zwischenspeicher", 3);
	} else {
		application.messageBox("Zetteldruck", "Diese Funktion kann nur Schirm 'Benutzer eingeben' verwendet werden!", "error-icon");
	}
}