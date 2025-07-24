var currentFilename = "";
var theFileOutput;
var newContents;

/*
* This function is to open 'W4_exemplarmasken_dialog.html' dialog with position (X, Y) and size (W, H),where X and Y is the start-position and W = width, H = height
* showDialog('HTML-dialog-name', X, Y, W, H);
*/
function Exemplarmasken_bearbeiten() {
	//showDialog('W4_exemplarmasken_dialog.html', 100, 10, 650, 330);
	showDialog('ProfD\\Dialogs\\kxp_exemplarmasken_dialog.html', 100, 10, 350, 250);
}

/************ The following functions are used in 'W4_exemplarmasken_dialog.html' dialog ******************************/
//This function is called from 'kxp_exemplarmasken_dialog.js'
function __loadFiles_copyMasks() {
	try {
		var arNames = new Array(); // Array to store the names of the files in
		// Get the directory with default Exemplarmasken:
		//Exemplarmasken sollen nicht bereitgestellt werden
	//	var theDir = getSpecialDirectory("BinDir");
		var theDir = getSpecialDirectory("ProfD");
		if(application.activeWindow.getVariable("P3GOJ") >= 2000){
			theDir.append("exemplarmasken_swb");
		} else {
			theDir.append("exemplarmasken_kxp");
		}
		if (!theDir.exists()) {
			alert("Die K10plus-Exemplarmasken wurden nicht gefunden.")
			return;
		}

		var theDirEnum = theDir.directoryEntries;
		while (theDirEnum.hasMoreElements()) {
			var theItem = theDirEnum.getNext();
			//var theFile = theItem.QueryInterface(Components.interfaces.nsIFile);
			if (theItem.isFile()) arNames.push(theItem.leafName);
		}
		// Get the user's datamasken:
		theDir = getSpecialDirectory("ProfD");
		theDir.append("exemplarmasken_eigene");
		var found;
		var i;
		if (theDir.exists()) {
			theDirEnum = theDir.directoryEntries;
			while (theDirEnum.hasMoreElements()) {
				var theItem = theDirEnum.getNext();
				//var theFile = theItem.QueryInterface(Components.interfaces.nsIFile);
				if (theItem.isFile()) {
					for (found = false, i = 0; (i < arNames.length) && !found; i++) {
						found = (arNames[i] == theItem.leafName);
					}
					if (!found) arNames.push(theItem.leafName);
				}
			}
		}

		arNames.sort();

		var fileList = "";
		for (var i = 0; i < arNames.length; i++) {
			fileList += arNames[i] + "\n";
		}

		utility.sentDataToDialog(fileList);
	} catch (e) { alert('loadFiles: ' + e.name + ': ' + e.message); }
}

//This function is called from 'W4_exemplarmasken_dialog.js'
function __loadFileByName_copyMasks(o) {
	try {
		currentFilename = o.idFileList;
		var theFileInput = utility.newFileInput();
		var derPfad = "";
		if(application.activeWindow.getVariable("P3GOJ") >= 2000){
			derPfad = "\\exemplarmasken_swb\\";
		} else {
			derPfad = "\\exemplarmasken_kxp\\";
		}
		if (!theFileInput.openSpecial("ProfD", "\\exemplarmasken_eigene\\" + currentFilename)) {
			if (!theFileInput.openSpecial("ProfD", derPfad + currentFilename)) {
				alert("Datei " + currentFilename + " wurde nicht gefunden.");
				utility.sentDataToDialog("");
				return;
			}
		}

		var theFileContent;
		for (theFileContent = ""; !theFileInput.isEOF();) {
			theFileContent += theFileInput.readLine() + "\n"
		}

		theFileInput.close();
		theFileInput = null;
		utility.sentDataToDialog(theFileContent);
	} catch (e) { alert('loadFileByName: ' + e.name + ': ' + e.message); }
}

//This function is called from 'W4_exemplarmasken_dialog.js'
function __FrageSpeichern_copyMasks(o) {
	currentFilename = o.idFileList;
	__FrageSpeichern1_copyMasks(o);
}

//This function is called from 'W4_exemplarmasken_dialog.js'
function __FrageSpeichern1_copyMasks(o) {
	newContents = o.idFileEdit;
	newContents = utility.restoreStringData(newContents);
	newContents = o.idFileEditExxx + "\n" + newContents;

	var prompt = utility.newPrompter();
	if (prompt.confirmEx("Speichern?", "Änderungen in " + currentFilename
		+ " speichern?", "YES", "NO", "", "", false) == 0) {
		__exemplarmaskeSpeichern();
	}
}

//This function is called from 'W4_exemplarmasken_dialog.js'
function __FrageSpeichern2_copyMasks() {
	var prompt = utility.newPrompter();
	if (prompt.confirmEx("Speichern?", "Änderungen speichern?", "YES", "NO", "", "", false) == 0) {
		utility.sentDataToDialog(true);
	} else {
		utility.sentDataToDialog(false);
	}
}

//This function is called from 'W4_exemplarmasken_dialog.js'
function __auswahlSpeichern_copyMasks(o) {
	currentFilename = o.idFileList;
	newContents = o.idFileEdit;
	newContents = utility.restoreStringData(newContents);
	newContents = o.idFileEditExxx + "\n" + newContents;
	__exemplarmaskeSpeichern();
}

//----------------------------------------------------------------------------
function __exemplarmaskeSpeichern() {
	try {
		if (currentFilename == "") return false;

		// Get the user's profile subdirectory for the Exemplarmasken, and create if
		// if necessary:
		var theDir = getSpecialDirectory("ProfD");
		if (theDir) {
			theDir.append("exemplarmasken_eigene");
			if (!theDir.exists()) {
				// the directory doesn't exist yet, create it
				theDir.create("DIRECTORY_TYPE");
				if (!theDir.exists()) {
					alert("Verzeichnis für eigene Exemplarmasken konnte nicht erstellt werden!");
					return false;
				}
			}
		}

		// Open (or create) the output file in the user's profile directory,
		// and store the new contents:
		var theFileOutput = utility.newFileOutput();
		theFileOutput.createSpecial("ProfD", "\\exemplarmasken_eigene\\" + currentFilename);
		theFileOutput.setTruncate(true);
		theFileOutput.write(newContents);

		theFileOutput.close();
		theFileOutput = null;
		return true;
	} catch (e) { alert('** ' + e.name + ': ' + e.message); }
}

//This function is called from 'W4_exemplarmasken_dialog.js'
//Neu: In
/*function wikiWinibw()
{
	application.shellExecute("https://wiki.k10plus.de/x/KgD3B", "open", "");
}*/

/*********The functions above are used in 'W4_exemplarmasken_dialog.html' dialog ******************************/

//---------------------------------------------------
var bExemplareSet = false;
function ExemplarmaskeA() {
	//der Wert "_a" wird in den Parametern uebergeben und in der
	//aufgerufenen Funktion in die Variable exMaskeNr geschrieben
	__exemplarmaskeEinfuegen("_a");
}
function ExemplarmaskeB() {
	__exemplarmaskeEinfuegen("_b");
}
function ExemplarmaskeC() {
	__exemplarmaskeEinfuegen("_c");
}
function ExemplarmaskeD() {
	__exemplarmaskeEinfuegen("_d");
}
function ExemplarmaskeE() {
	__exemplarmaskeEinfuegen("_e");
}
function ExemplarmaskeF() {
	__exemplarmaskeEinfuegen("_f");
}
function ExemplarmaskeG() {
	__exemplarmaskeEinfuegen("_g");
}
function ExemplarmaskeH() {
	__exemplarmaskeEinfuegen("_h");
}
function ExemplarmaskeI() {
	__exemplarmaskeEinfuegen("_i");
}
function ExemplarmaskeK() {
	__exemplarmaskeEinfuegen("_k");
}
function ExemplarmaskeOpus() {
	__exemplarmaskeEinfuegen("_opus");
}
function ExemplarmaskeZDB() {
	__exemplarmaskeEinfuegen("_zdb");
}
function __ExemplarmaskeSet() {
	//wird von function exemplareAnhaengenSet() verwendet.
	bExemplareSet = true;
	__exemplarmaskeEinfuegen("_set");
}
//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
function __exemplarmaskeEinfuegen(exMaskeNr) {
	//application.messageBox("exMaskeNr", exMaskeNr, "");
	var thePrompter = utility.newPrompter();
	var lExMaximal = 999;
	var bUrl = false;
	var exUrl = application.getProfileString("Exemplareingabe", "exUrl", "");
	var naechstesEx = "";
	var maskenInhalt = "";
	var exKommando = "";
	var checkboxExEingabe = application.getProfileInt("Exemplareingabe", "checkboxExEingabe", 0);
	var material = "";
	var lErstesEx = application.getProfileInt("Exemplareingabe", "exNrAnfang", 0);
	if (!lErstesEx) {
		lErstesEx = 1;
	}
	var lLetztesEx = application.getProfileInt("Exemplareingabe", "exNrEnde", 0);
	if (lLetztesEx == "") {
		lLetztesEx = lExMaximal;
	}
	//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
	maskenInhalt = __exemplarMaskeLesen(exMaskeNr);
	if (maskenInhalt == "") return; // wenn die Maske nicht existiert, meldet die Funktion "" zurück
	var maskenInhalt = maskenInhalt.replace(/\+\+/, "_cursor_"); //++ wird durch _cursor_ ersetzt,
	//damit nicht in einem Titel vorkommende ++ gelöscht werden
	var regexpScreens = /7A|8A|IT|MT|IE|ME/;
	var strScreen = application.activeWindow.getVariable("scr");
	//alert(strScreen)
	if (strScreen.search(regexpScreens) == -1) {
		application.messageBox("Exemplar anhängen", "In der Anzeige befinden sich keine Titel." +
			"\nAnhängen von Exemplaren jetzt nicht möglich.", "error-icon");
		return;
	}
	//Schirm "Exemplar eingeben" oder "Exemplar ändern":
	//in diesem Fall kann keine URL aus der Titelaufnahme übernommen werden.
	if (strScreen == "IE" || strScreen == "ME") {
		var exNrSchirm = application.activeWindow.getVariable("P3GLV");
		//application.messageBox("exNrSchirm", exNrSchirm, "");
		naechstesEx = exNrSchirm.substr(1, 2);
	}
	//application.messageBox("naechstesEx1", naechstesEx, "");
	//alert(lErstesEx + "\n" + lLetztesEx)
	//Schirm: Vollanzeige
	if (strScreen == "8A" || strScreen == "7A") {
		kxpUtility.formatD();
		naechstesEx = __rechneNaechstesEx("8A", lErstesEx, lLetztesEx);
		//application.messageBox("naechstesEx2", naechstesEx, "");
		material = kxpUtility.matCode1();
	}
	if (application.activeWindow.title) {
		material = application.activeWindow.title.findTag("0500", 0, false, false, false);
		material = material.charAt(0);
	}
	//alert(lErstesEx  + "\n" + lLetztesEx)
	//Schirm Titel eingeben/ändern
	if (strScreen == "IT" || strScreen == "MT") {
		naechstesEx = __rechneNaechstesEx(strScreen, lErstesEx, lLetztesEx);
	}
	if (naechstesEx > lLetztesEx) {
		application.messageBox("Exemplarmasken", "Es sollen nur Exemplare bis zur " +
			"Exemplarnummer " + lLetztesEx + " erfasst werden. \n" +
			"Prüfen Sie ggf. Ihre Voreinstellungen bei den Exemplarmasken! ", "error-icon")
		return;
	}
	//Eingabe im Exemplaredit-Schirm, wenn es in den Benutzereinstellungen steht oder wenn Exe an ein Set gehängt werden sollen.
	if (checkboxExEingabe == 1 || bExemplareSet == true) {
		exKommando = "\\inv e" + (naechstesEx);
	} else {
		exKommando = "\\mut"
	}
	if (application.activeWindow.getVariable("scr") == "8A") {
		application.activeWindow.command(exKommando, false);
	}
	if (!application.activeWindow.title) {
		application.messageBox("Exemplar anhängen", "Die Funktion 'Anhängen von Exemplaren' kann nicht ausgeführt werden.", "error-icon");
		return;
	}
	naechstesEx = String(naechstesEx);
	//alert("naechstesEx: " + naechstesEx + "\nLänge: " + naechstesEx.length);
	if (naechstesEx.length == 1) {
		naechstesEx = "00" + naechstesEx;
	}
	if (naechstesEx.length == 2) {
		naechstesEx = "0" + naechstesEx;
	}
	application.activeWindow.title.endOfBuffer(false);
	application.activeWindow.title.insertText("\nE" + naechstesEx + " " + maskenInhalt);
	if (material == "O"){
		//bei elektronischen Aufnahmen soll evtl. URL in das Exemplar kopiert werden
		if (exUrl == ""){
			var antwort = thePrompter.confirmEx("URL übertragen", "Wollen Sie die URL aus Feld 4950 zum Exemplarfeld 7133 übertragen?", "YES", "NO", "", "", false);
			if (antwort == 0){
				bUrl = true;
			}
		} else if (exUrl == "mit"){
			bUrl = true;
		}
	}
	if (material == "O" && bUrl == true){
		__urlExemplar();
	}
	//Suche Position von "_cursor_":
	application.activeWindow.title.startOfBuffer(false);
	var suchePlus = application.activeWindow.title.find("_cursor_", false, false, false);
	if (suchePlus == true) {
		//Entfernen der Zeichenfolge _cursor_, der Cursor bleibt hier stehen:
		application.activeWindow.title.deleteSelection();
	} else {
		//wenn nichts gefunden, dann soll der Cursor wieder zum Ende des Datensatzes:
		application.activeWindow.title.endOfBuffer(false);
	}
	//diese Information wird von den Profildiensten für die Eingabe der Order im ACQ benötigt:
	return naechstesEx;
}

function __exemplarMaskeLesen(exMaskeNr) {
	var maskenInhalt;
	var theFileInput = utility.newFileInput();
	var theLine;
	var derPfad = "";
	if(application.activeWindow.getVariable("P3GOJ") >= 2000){
		derPfad = "\\exemplarmasken_swb";
	} else {
		derPfad = "\\exemplarmasken_kxp";
	}
	//der Inhalt der Variablen exMaskeNr wurde von einer der obigen Funktionen
	//ExemplarmaskeA-K als Parameter uebergeben
	var fileName = "\\exemplarmaske" + exMaskeNr + ".txt";
	//alert("Öffne Datei: " + fileName);
	// exemplarmaskendatei im Verzeichnis winibw/profiles/<user>/exemplarmasken oeffnen
	if (!theFileInput.openSpecial("ProfD", "\\exemplarmasken_eigene" + fileName)) {
		//K10plus-Exmasken :
		if (!theFileInput.openSpecial("ProfD", derPfad + fileName)) {
			application.messageBox("Exemplar anhängen", "Exemplarmaske für Exemplar " + exMaskeNr +
				" wurde nicht gefunden.", "error-icon");
			return maskenInhalt = "";
		}
	}
	for (maskenInhalt = ""; !theFileInput.isEOF();) {
		maskenInhalt += theFileInput.readLine() + "\n"
	}
	theFileInput.close();
	return maskenInhalt;
}

function __rechneNaechstesEx(strScreen, lErstesEx, lLetztesEx) {
	var naechstesEx = 0;
	var sucheFeld = "";
	var i, strTag;
	var strTitle = application.activeWindow.copyTitle();
	for (i = lErstesEx; i <= lLetztesEx; i++) {
		if (i < 10) {
			sucheFeld = "E00" + String(i);
		} else if (i >= 10 && i < 100) {
			sucheFeld = "E0" + String(i);
		} else {
			sucheFeld = "E" + String(i);
		}
		//im Editschirm:
		if (strScreen == "IT" || strScreen == "MT") {
			strTag = application.activeWindow.title.findTag(sucheFeld, 0, true, false, false);
			if (strTag == "") {
				break;
			}
		}
		//in der Vollanzeige:
		if (strScreen == "8A") {
			strTag = application.activeWindow.findTagContent(sucheFeld)
			if (strTag == "") {
				break;
			}
		}
	}
	//Rückgabewert ist eine Ziffer:
	return i;
}

function exemplareAnhaengenSet() {
	var thePrompter = utility.newPrompter();
	var antwort;
	var i = 0;
	var exNeu = 0;
	var alleFehler = "";
	var meldeText;
	if (__anzeigeKurz() == false) return;
	// Größe des Sets ermitteln
	var setSize = application.activeWindow.getVariable("P3GSZ");
	if (setSize > 2000) {
		application.messageBox("exemplareAnhaengenSet", "Setgröße: " + setSize +
			"\nDas Ausführen der Funktion 'exemplareAnhaengenSet' mit mehr als 2000 Titeln ist nicht erlaubt.", "alert-icon");
		return;
	}
	antwort = thePrompter.confirmEx("Set bearbeiten", "Wollen Sie wirklich an alle " + setSize + " Datensätze Exemplare hängen?" +
		"\nEs wird Exemplarmaske 'exemplarmaske_set' verwendet.", "Ja", "Nein", "Exemplarmaske bearbeiten", "", "")
	// 0 = Ja / 1 = Nein / 2 = Exemplarmasken bearbeiten
	if (antwort == 1) {
		return;
	} else if (antwort == 2) {
		application.activeWindow.appendMessage("Bearbeiten Sie die Exemplarmaske 'exemplarmaske_set.txt'", 2);
		Exemplarmasken_bearbeiten();
		return;
	}
	// Wenn 0 = ja, Datensatz für Datensatz aufrufen:
	for (i = 1; i <= setSize; i++) {
		application.activeWindow.command("s " + i, false);
		//Wenn kein Normsatz: Exemplar ergänzen
		if (kxpUtility.matCode1() != "T") {
			__ExemplarmaskeSet();
			//speichern des Exemplarsatzes:
			application.activeWindow.simulateIBWKey("FR");
			if (application.activeWindow.status == "OK") {
				exNeu = exNeu + 1;
			} else {
				meldeText = __alleMeldungen();
				application.activeWindow.simulateIBWKey("FE");
				alleFehler = alleFehler +
					"PPN " + application.activeWindow.getVariable("P3GPP") +
					": " + meldeText;
			}
		} else {
			alleFehler = alleFehler + "PPN " + application.activeWindow.getVariable("P3GPP") +
				": " + "Normsatz\n";
		}
	}
	//wieder zurücksetzen:
	bExemplareSet = false;
	//Kurzanzeige:
	application.activeWindow.command("s k", false);
	application.activeWindow.clipboard = alleFehler;
	application.activeWindow.appendMessage("Ergebnis: " + exNeu + " Exemplare in einem Set von " + setSize + " Titeln.", 3);
	if (alleFehler != "") {
		application.messageBox("Bitte beachten Sie die Fehlermeldungen!", "\nFehlermeldungen: \n" + alleFehler +
			"\n\nDie Liste der Fehlermeldungen befindet sich auch in der Zwischenablage." +
			"\nDie Liste kann mit Strg+v in eine Datei eingefügt werden.", "alert-icon");
	}
}

function __urlExemplar() {
	//im angezeigten Datensatz wird das Feld 4950 gesucht und zu 7133 und 7139 kopiert.
	var oRegExpUrl = /4950|4960|4961/;
	var alleUrl = new Array();
	var i = 0;
	var dieZeile = "";
	var letzteZeile = kxpUtility.letzteZeile();
	var thePrompter = utility.newPrompter();
	var antwort;
	for (var n = 0; n <= letzteZeile; n++) {
		dieZeile = application.activeWindow.title.currentField;
		if (oRegExpUrl.test(application.activeWindow.title.tag) == true && dieZeile.length > 6) {
			//alert(dieZeile + " " + dieZeile.length)
			dieZeile = dieZeile.replace(/4950 /, "7133 ");
			dieZeile = dieZeile.replace(/4960 /, "7139 ");
			alleUrl[i] = dieZeile;
			i++;
		}
		application.activeWindow.title.endOfField(false);//wichtig bei mehrzeiligen Inhalten!
		application.activeWindow.title.lineDown(1, false);
	}
	//alert(alleUrl.join("/"))
	application.activeWindow.title.endOfBuffer(false);
	//wenn es mehr als 1 URL gibt, können die Anwender eine auswählen:
	if (alleUrl.length > 1) {
		alleUrl = alleUrl.join("\n");
		antwort = thePrompter.select("Auswahl URL", "Welche URL soll eingefügt werden?", alleUrl);
		if (!antwort) {
			// Benutzer hat den Dialog abgebrochen:
			return;
		} else {
			application.activeWindow.title.insertText(antwort + "\n");
		}
	} else {
		application.activeWindow.title.insertText(alleUrl[0]);
	}
}


