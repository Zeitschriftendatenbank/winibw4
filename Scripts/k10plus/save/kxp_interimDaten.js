//	Datei:	kxp_interimsDaten.js
//	Autorin:	Karen Hachmann
function interimsNormsatzMailbox(){
	//Rufe Dialogformular auf, mit dem interimistische Normdaten in einen Mailboxsatz geschrieben werden
	if(application.activeWindow.getVariable("P3GCN") == "K10plus"){
		showDialog('ProfD\\Dialogs\\kxp_interimNormsatzMailbox_dialog.html', 100, 100, 350, 250);
	} else {
		__fehler("Diese Funktion soll nur in K10plus ausgeführt werden!");
	}
}

function interimsReiheMailbox(){
	//Rufe Dialogformular auf, mit dem interimistische Reihe in einen Mailboxsatz geschrieben werden
	if(application.activeWindow.getVariable("P3GCN") == "K10plus"){
		showDialog('ProfD\\Dialogs\\kxp_interimReiheMailbox_dialog.html', 100, 100, 350, 200);
	} else {
		__fehler("Diese Funktion soll nur in K10plus ausgeführt werden!");
	}
}

function __datensatzInTextboxEinfuegen(o){
	//diese Funktion wird in kxp_interimNormsatzMailbox_dialog.js  und kxp_interimReiheMailbox_dialog.js aufgerufen
	//Datenmasken werden gelesen und an den Dialog geschickt. Dort wird die Datenmaske in einer Textbox angezeigt.
	try {
		var currentFilename = o.idListeSatztypen;
		//alert("Meldung im Script: " + currentFilename)
		var theFileInput = utility.newFileInput();
		if (!theFileInput.openSpecial("ProfD", "\\datenmasken_eigene\\" + currentFilename)) {
			if (!theFileInput.openSpecial("ProfD", "\\datenmasken_kxp\\" + currentFilename)) {
				__fehler("Datei " + theFileInput.getPath() + currentFilename + " wurde nicht gefunden.");
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
	} catch (e) { alert('__datensatzInTextboxEinfuegen: ' + e.name + ': ' + e.message); }
}
function __datensatzKopierenInTextboxEinfuegen(o){
	try {
		if (application.activeWindow.title){
			__fehler("Datensatz kann nicht im Editiermodus kopiert werden!")
			return;
		}
		var strDatensatz = __zdbGetExpansionFromP3VTX();
		if (strDatensatz.indexOf("005 T") != -1) {
			strDatensatz = editiereNormsatz(strDatensatz);
		} else {
			strDatensatz = editiereReihe(strDatensatz);
		}
		utility.sentDataToDialog(strDatensatz);
	} catch (e) { alert('__datensatzKopierenInTextboxEinfuegen: ' + e.name + ': ' + e.message); }
}
function editiereNormsatz(strTitle){
	var i, n;
	var strFeld;
	var regexFeld = /Ein|Tit|Ver|00[1236AK]|035|039|79[6-8]/;
	var regexPPN = /(!\d{8,10}(?:x|X|\d)!)/;
	var regexExpansionGNDid = / ; ID: .*\$?/;
	var regexExpansionUF = /\$.{1}/g;
	var regexDollar = /\$7/; //$7-Link
	var zeilen = strTitle.split("\n");
	for (i=0; i<zeilen.length; i++){
		zeilen[i] = stringTrim(zeilen[i]);
		strFeld = zeilen[i].substring(0,3);
		if (zeilen[i].length == 0) {
			zeilen.splice(i,1);
			i--;//Array Zeilen wird kleiner
		}
		if (regexFeld.test(strFeld) || regexDollar.test(zeilen[i])) {
			zeilen.splice(i,1);
			i--;//Array Zeilen wird kleiner
		}
		if (strFeld == "005"){
			zeilen[i] = zeilen[i].substr(0,6);
		}
		if (strFeld.substr(0,1) == "5"){
			//alert(strFeld);
		}
		if (regexPPN.test(zeilen[i])) {
			//Beispiel: 511 !183866436!Olympische Spiele$n16$d1956$cMelbourne ; ID: gnd/2144865-6$4rela
			zeilen[i]=zeilen[i].replace(regexPPN,"");
			zeilen[i]=zeilen[i].replace(regexExpansionGNDid,""); //lösche GND-ID, auch folgende Relationen verschwinden ($4)
			zeilen[i]=zeilen[i].replace(/\$P/, "");
			zeilen[i]=zeilen[i].replace(regexExpansionUF," "); //Unterfeld durch Blank ersetzen
		}
	}
	return zeilen.join("\n");
}
function editiereReihe(strTitle){
	var i, n;
	var strFeld;
	var regexFeld = /000[01236AK]|0100|0110|0200|0210|0230|2065|2110|2112|2199|2240/;
	var regexPPN = /(!\d{8,10}(?:x|X|\d)!)/; //PPN-Link
	var regexExpansionGNDid = / ; ID: .*\$?/;
	var regexExpansionUF = /\$.{1}/g;
	var regexDollar = /\$7/; //$7-Link
	var zeilen = strTitle.split("\n");
	for (i=0; i<zeilen.length; i++){
		zeilen[i] = stringTrim(zeilen[i]);
		strFeld = zeilen[i].substring(0,4);
		//alert("Zeile: " +zeilen[i] + "\nstrFeld: " + strFeld)
		if (zeilen[i].length == 0) {
			zeilen.splice(i,1);
			i--;//Array Zeilen wird kleiner
		}
		//if (regexFeld.test(strFeld) || regexPPN.test(zeilen[i]) || regexDollar.test(zeilen[i])) {
		if (regexFeld.test(strFeld) || regexDollar.test(zeilen[i])) {
			//alert("Lösche: " + zeilen[i])
			zeilen.splice(i,1);
			i--;//Array Zeilen wird kleiner
		}
		if (strFeld.substr(0,1) == "5"){
			//alert(strFeld);
		}
		if (regexPPN.test(zeilen[i])) {
			zeilen[i]=zeilen[i].replace(regexPPN,"");
			zeilen[i]=zeilen[i].replace(regexExpansionGNDid,""); //lösche GND-ID, auch folgende Relationen verschwinden ($4)
			zeilen[i]=zeilen[i].replace(/\$P/, "");
			zeilen[i]=zeilen[i].replace(regexExpansionUF," "); //Unterfeld durch Blank ersetzen
		}
	}
	return zeilen.join("\n");
}
function __schreibeMailboxsatz(o){
	var strDatensatz = utility.restoreStringData(o.idDatensatz);
	//alert(strDatensatz)
	var mailboxEmpfaenger = o.idEmpfaenger;
	var str8900 = "";
	var strNorm = "";
	var auswahlNormtyp = "";
	var strMailbox = "";
	strDatensatz = strDatensatz.replace(/\d{3} \n/g,""); //leere Felder löschen
	strDatensatz = strDatensatz.replace(/\n/g,"||"); //Zeilenumbrüche ersetzen
	var strDatum = __datumMailbox();
	var strScreen = application.activeWindow.getVariable("scr");
	if (strScreen.charAt(0) == "I" || strScreen.charAt(0) == "M"){
		__warnung("Bitte speichern Sie zuerst den Datensatz und führen Sie die Funktion danach nochmal aus.")
		return;
	}
	var strMatCode = kxpUtility.matCode1();
	//nur bei Titeldaten soll die PPN verwendet werden:
	if (strScreen == "8A" && strMatCode != "T"){
		str8900 = "\n8900 !" + application.activeWindow.getVariable("P3GPP") + "!";
	}
	//jetzt wird der Mailboxsatz angelegt:
	application.activeWindow.command("\\inv 1", false);
	if (!application.activeWindow.title){
		__warnung("Keine Rechte zum Erfassen eines Datensatzes!");
		return;
	}
	strMailbox = "0500 amy" +
		str8900 +
		"\n8901 " + strDatum + " : " + mailboxEmpfaenger +
		"\n8902 ";
	application.activeWindow.title.insertText(strMailbox + strDatensatz);
}
function __datumMailbox()
{
	//Form: TTMMJJ
	var heute = new Date();

	var strJahr = heute.getFullYear();
	strJahr = String(strJahr);
	strJahr = strJahr.substring(2, 4);

	var strMonat = heute.getMonth();
	strMonat = strMonat + 1;
	if (strMonat <10){strMonat = "0" + strMonat};

	var strTag = heute.getDate();
	if (strTag <10){strTag = "0" + strTag};

	var datum = strTag + "-" + strMonat + "-" + strJahr ;
	return datum;
}

function interimsNormsatzGND(){
	//für WinIBW4 angepasst
	interimsAufnahme("\\inv 2");
}

function interimsReiheZDB(){
	interimsAufnahme("\\inv 1");
}
//----Diese Funktion wird von interimsnormsatzGND und interimReiheZDB verwendet:
function interimsAufnahme(dasKommando){
	//für WinIBW4 angepasst, aber noch nicht mit ZDB getestet
	var regexp8902 = /\n8902 (.*)/;
	//Anwender muessen den Mailboxsatz vorher kopieren, so dass er im Zwischenspeicher ist
	if(application.activeWindow.getVariable("P3GCN") != "DNB"){
		__fehler("Sie sind nicht bei der DNB angemeldet!")
		return;
	}
	// Zwischenspeicher wird in eine Variable geschrieben:
	var strDatensatz = application.activeWindow.clipboard;
	//Prüfung Mailboxsatz:
	if (strDatensatz.indexOf("0500 am") != -1 && regexp8902.test(strDatensatz) == true){
		strDatensatz = RegExp.$1;
		strDatensatz = strDatensatz.replace(/\|\|/g, "\n");
		//alert(strDatensatz)
		//trim
	} else {
		__fehler("Im Zwischenspeicher befindet sich kein Mailboxsatz sondern dies: \n'" + strDatensatz +
				"'\n\nBitte kopieren Sie zuerst einen Mailboxsatz!");
		return;
	}
	application.activeWindow.command(dasKommando, false);
	if(!application.activeWindow.title){
			return false;
	}
	application.activeWindow.title.insertText(strDatensatz);
	application.activeWindow.showMessage("Der im Zwischenspeicher befindliche Inhalt wurde eingefügt.", 3);
}