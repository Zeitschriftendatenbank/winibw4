/*
	Autorin:	Karen Hachmann
	Konvertiert: ASCII to UTF8
	Datum:	2022.03
*/
//--------- Dublettenumlenkung------
var strZielPPN;

function DubletteZielsatzBestimmen()
{
	if (__pruefungZielQuelle() == true){
		strZielPPN = application.activeWindow.getVariable("P3GPP");
		application.activeWindow.clipboard = strZielPPN;
		application.messageBox("ZielsatzBestimmen", "PPN des Zielsatzes: " + strZielPPN, "message-icon");
	}
}

function DubletteQuellsatzUmlenken()
{
	//Bei der Verwendung von zwei Instanzen von WinIBW4 wird der Inhalt der Variablen strZielPPN nicht übergeben.
	//Deshalb verwende ich hier zusätzlich das Clipboard
	var umlenkFeld, umlenkText;
	var regExpPPN = /(\d{8,9}[\d|x|X])/;
	//Falls mit zwei Instanzen gearbeitet wird: Variable strZielPPN ist leer, aber PPN ist evtl. im Zwischenspeicher
	var strZielPPN = application.activeWindow.clipboard;
	//alert(regExpPPN.test(strZielPPN) )
	if (regExpPPN.test(strZielPPN) == false){
		application.messageBox("QuellsatzUmlenken", "Im Zwischenspeicher befindet sich keine PPN sondern dies:\n---" + strZielPPN + "---\nBitte zuerst die PPN des Zielsatzes bestimmen!", "error-icon");
		return;
	}
	// Vergleich von ZielPPN mit QuellPPN
	if (application.activeWindow.getVariable("P3GPP") == strZielPPN) {
		application.messageBox("QuellsatzUmlenken", "Zielsatz und Quellsatz sind gleich." +
			"\nUmlenkung kann nicht ausgeführt werden.", "error-icon");
		return;
	}
	if (__pruefungZielQuelle() == true){
		//die Variable strZielPPN bleibt erhalten, falls mehrere Datensätze auf denselben umgelenkt werden sollen
		kxpUtility.matCode1() == "T" ? umlenkFeld = "169" : umlenkFeld = "1698";
		if (kxpUtility.matCode1() != "T" && kxpUtility.matCode2() == "c") {
			umlenkText = "Umlenkung MTM nach: ";
		} else if (kxpUtility.matCode1() != "T" && (kxpUtility.matCode2() == "b" || kxpUtility.matCode2() == "d")) {
			umlenkText = "Umlenkung SER nach: ";
		} else {
			umlenkText = "Umlenkung nach: ";
		}
		application.activeWindow.command("\\mut", false);
		if (application.activeWindow.status == "OK"){
			kxpUtility.feldEinfuegenNumerisch(umlenkFeld, umlenkText + "!" + strZielPPN + "!", true);
		}
	}
	//danach wieder PPN ins Clipboard schreiben, damit mehrere Titel auf dieselbe PPN umgelenkt werden können:
	application.activeWindow.clipboard = strZielPPN
}

//Unterfunktion für Dublettenumlenkung:
function __pruefungZielQuelle()
{
	var strTitle, anzeigeFormat;
	if (__anzeigeKurzVoll() == false) return;
	kxpUtility.formatD()
	strTitle = application.activeWindow.copyTitle();
	//application.messageBox("ZielsatzBestimmen", strTitle, "message-icon");
	if ((strTitle.indexOf("\n1698 ") != -1) || (strTitle.indexOf("\n169 ") != -1)){
		application.messageBox("Prüfung Dublettenzusammenführung", "Der gewünschte Datensatz " +
		"enthält schon eine Umlenkung! ", "error-icon");
		return false;
	}
	return true;
}
//---------Ende Dublettenumlenkung------
function ppnListe(){
	// Alle PPNs des Sets werden gesammelt und in den Zwischenspeicher geschrieben.
	if (__anzeigeKurzVoll() == false) return;
	var thePrompter = utility.newPrompter();
	var alleppn = new Array();
	var antwort;
	var setSize = application.activeWindow.getVariable("P3GSZ");
	if (setSize > 200) {
		antwort = thePrompter.confirmEx("PPN-Liste", "Das Set enthält " + setSize +
			" Datensätze. \nDas Erstellen der PPN-Liste wird eine kleine Weile dauern.\n"+
			"Wollen Sie trotzdem weitermachen?", "Ja", "Nein", "", "", "")
		if (antwort == 1) {return}
	}
	var nr=0;
	for (nr=1; nr <= setSize; nr++){
		application.activeWindow.command("s " + nr, false);
		alleppn[nr] = application.activeWindow.getVariable("P3GPP");
	}
	alleppn.shift();//entfernt das 0. Glied der Kette, das leer ist
	application.activeWindow.clipboard = alleppn.join("\r\n");
	//Ausgabe in eine Datei:
	var theFileOutput = utility.newFileOutput();
	var strDateiName = "ppnListe_" + __datumUhrzeit() + ".txt";
	theFileOutput.createSpecial("ProfD", "\\listen\\" + strDateiName);
	theFileOutput.setTruncate(true);
	theFileOutput.write(alleppn.join("\r\n"));
	theFileOutput.close();
	theFileOutput = null;
	//Pfad als String für die Ausgabe in einer Meldung:
	var strListenPfad = getSpecialPath("ProfD", "\\listen\\");
	application.messageBox ("PPN-Liste", "Alle PPNs wurden eingesammelt und in den " +
		"Zwischenspeicher geschrieben.\n Die PPNs wurden außerdem in dieser Datei gespeichert: " + strListenPfad + strDateiName, "message-icon");
}
function urlKommentar8910(){
	var strDatum = __datumJJJJMMTT();
	var str8910 = "";
	if (application.activeWindow.getVariable("scr") == "8A"){
		application.activeWindow.command("k", false);
	}
	if (!application.activeWindow.title){
		__fehler("Diese Funktion können Sie ausführen, wenn sich ein Titel im Bearbeitungsstatus oder der Vollanzeige befindet.");
		return;
	}
	var strISIL = __holeISIL();
	if (strISIL == "DE-601"){
		strISIL = strISIL.replace(/DE-601/, "VZG");
	}	else if (strISIL == "DE-576"){
		strISIL = strISIL.replace(/DE-576/, "BSZ");
	}
	var thePrompter = utility.newPrompter();
	var antwort = thePrompter.select("Feld 8910", "Welchen Text wollen Sie einfügen?", "URL-Änderung\nGültige URL nicht zu ermitteln");
	if (!antwort) {
		//Wenn Benutzer den Dialog mit Escape verlässt, soll nichts eingefügt werden.
		__meldung("8910 wird nicht eingefügt.")
		return;
	} else if (antwort == "URL-Änderung"){
		str8910 = "$a" + strDatum + " URLKORR$b" + strISIL + ": " + antwort;
	} else {
		str8910 = "$a" + strDatum + " URLOHNE$b" + strISIL + ": " + antwort;
	}
	kxpUtility.feldEinfuegenNumerisch("8910", str8910, false);
}