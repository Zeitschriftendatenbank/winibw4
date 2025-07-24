/*
	Autorin:	Karen Hachmann
	Konvertiert: ASCII to UTF8
	Datum:	2021.12
	Offen: Lesen des Registry-Eintrages und Verwenden der Variablen libID
*/
function Mailbox_alleELN(){
	mailboxSchreiben(true);
}
function Mailbox_ohneELN(){
	mailboxSchreiben(false);
}
function mailboxSchreiben(bELN){
	//Test in WinIBW4 erfolgreich
	var strScreen = application.activeWindow.getVariable("scr");
	var eln = "";
	if (strScreen != "8A" || application.activeWindow.materialCode == "am"){
		application.messageBox("Fehler", "Bitte rufen Sie einen Titel in die Vollanzeige!", "error-icon");
		return;
	}
	var strPPN = application.activeWindow.getVariable("P3GPP");
	if (bELN == true){
		//Mailbox schreiben mit ELN
		eln = elnErmitteln(bELN);
		//wenn keine adressierbaren Bestandsnachweise vorkommen:
		if (eln==""){
			__meldung("Dieser Titel hat keine Besitznachweise von Bibliotheken, die aktiv im K10plus katalogisieren.");
		}
	} else {
		//Mailbox schreiben ohne ELN
		eln = "";
	}
	//Kommando wird in neuem Fenster ausgeführt:
	application.activeWindow.command("\\inv 1", true);
	application.activeWindow.appendMessage("Zum Erfassen des Mailboxsatzes wurde ein neues Fenster geöffnet, das Sie nach dem Speichern wieder schließen können.", 3);
	if (!application.activeWindow.title) return;
	application.activeWindow.title.insertText("0500 amy" +
		"\n8900 !" + strPPN + "!" +
		"\n8901 " + __datumMailbox() + " : " + eln +
		"\n8902 ");
	//ohne ELN: Cursor 1 Zeile nach oben
	if (eln==""){
		application.activeWindow.title.lineUp(1, false);
		application.activeWindow.title.endOfField(false);
	}
}
function __datumMailbox()
{
	//Ausgabe: TT-MM-JJ
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
function datumZukunft(lTage)
{
	//Hier wird das neue Datum ermittelt und in die Form JJJJ-MM-TT gebracht:
	var datum = new Date();
	datum.setDate(datum.getDate() + lTage);
	var strJahr = datum.getFullYear();
	strJahr = String(strJahr);
	var strMonat = datum.getMonth();
	strMonat = strMonat + 1;
	if (strMonat <10){strMonat = "0" + strMonat};
	var strTag = datum.getDate();
	if (strTag <10){strTag = "0" + strTag};
	return strJahr + "-" + strMonat + "-" +  strTag;
}
function elnErmitteln(bELN)
{
	//Test in WinIBW4 soweit erfolgreich
	//offen: libID kann in WinIBW4 nicht gelesen werden: var eigeneELN = application.activeWindow.getVariable("libID");
	//offen: Registryeintrag true muss noch als String in Gänsefüsschen "true" gelesen werden
	//profilMailbox: true=alle ELNs, false=ohne eigene ELN, "" = keine Einstellung vorgenommen
	//profilMailbox = 1: mit eigener ELN
	var profilMailbox = application.getProfileString("Mailbox", "alleELN", "");
	//alert(profilMailbox)
	var strTitle;
	var alleBibliotheken = new Array();
	var nichtVerwenden = new Array();
	var alleEmpfaenger = new Array();
	var strEmpfaenger = "";
	//Beispiele:
	//GBV: [ILN: 22 ELN: 0018 ] SUB+UNI HAMBURG Sigel: 18
	//SWB: [ILN: 2012 ELN: HDINST] INSTITUTE UB HEIDELBERG Sigel: 16/XXX
	var regexpELN = /\[.*ELN: (\d{4}).*\]/g;
	//WinIBW4 erhält Variable libID nicht, stattdessen diese neue Funktion:
	var eigeneELNgbv = __meineBibGBV();
	var eigeneELNswb = __meineBibSWB();
	//alert(eigeneELNgbv +"/"+ eigeneELNswb)
	application.activeWindow.command("\\too da", false); //s da-Kommando durchführen, Anzeige mit allen Exemplardaten
	strTitle = application.activeWindow.copyTitle();
	// [ELN] werden gesucht:
	if (bELN==true){
		alleBibliotheken = strTitle.match(regexpELN);
	}
	//Für GBV: ELNs
	if(alleBibliotheken){
		for (var i=0; i<alleBibliotheken.length; i++) {
			//Bibliotheken mit ILN 4000-4999 oder 267 (DNB) sollen nicht verwendet werden
			//Liste siehe: https://wiki.k10plus.de/x/JYDPG
			//Achtung, am Ende des regulären Ausdrucks, ist das letzte Blank unverzichtbar (hinter der ILN)
			var regExpBiblOhne = /ILN: (14|15|16|78|201|202|267|276|390|608|612|633|677|695|696|751|789|790|1016|1019|1021|1023|1117|2017|4[0-9][0-9][0-9]) /;
			if (regExpBiblOhne.test(alleBibliotheken[i])==true) {
				//alert(alleBibliotheken[i] + " " + regExpBiblOhne.test(alleBibliotheken[i]))
				alleBibliotheken[i] = alleBibliotheken[i].replace(regexpELN, '$1');//nur ELN auswählen
				nichtVerwenden.push(alleBibliotheken[i]);//ELN in Array schreiben
				alleBibliotheken.splice(i,1);
				i=i-1;
			}
		}
		//wenn Bibliotheken nach der vorherigen Aufräumaktion übrig sind:
		if (alleBibliotheken){
			for (var i=0; i<alleBibliotheken.length; i++) {
				alleBibliotheken[i] = alleBibliotheken[i].replace(regexpELN, '$1');
				//Keine ELN > 6000 übernehmen, weil dies keine Bibliotheken sondern Datenlieferanten sind.
				/*if (alleBibliotheken[i] >= 6000) {
					alleBibliotheken.splice(i,1);
					i=i-1; //splice ändert die Länge des Arrays
				}*/
				if (profilMailbox != "true" && alleBibliotheken[i] == eigeneELNgbv.substring(0,4)) {
					alleBibliotheken.splice(i,1);
					i=i-1;
				}
			}
		}
		alleEmpfaenger = alleBibliotheken;
		//application.messageBox("", "verwenden:\n" + alleEmpfaenger.join("\n") + "\nnicht verwenden:\n " + nichtVerwenden.join("\n"), "");
	}
	//Für SWB Feld 7901 auswerten:
	//Beispiel: 7901 KALB:18-01-16
	var regexp7901 = /7901 (.*?):.*/g;
	var alle7901 = strTitle.match(regexp7901);
	if(alle7901){
		for (var i=0; i<alle7901.length; i++) {
			alle7901[i] = alle7901[i].replace(regexp7901, '$1');
			if (profilMailbox != "true" && alle7901[i] == eigeneELNswb) {
				//alert("2: " + alleBibliotheken[i] + "\n" + eigeneELNswb)
				alle7901.splice(i,1);
				i=i-1;
			}
		}
		//beide Arrays zusammenfügen:
		if(alleBibliotheken){
			alleEmpfaenger = alleBibliotheken.concat(alle7901);
		} else {
			alleEmpfaenger = alle7901;
		}
	}
	//sortieren und doppelte entfernen:
	alleEmpfaenger.sort();
	for (var i = 0; i < alleEmpfaenger.length; i++){
		while (alleEmpfaenger[i] == alleEmpfaenger[i-1]){
			alleEmpfaenger.splice(i,1);
			i=i-1;
		}
	}
	//diese SWB-Bibliothek BSZ=ILN 2017 noch entfernen. Wenn mehrere dazukommen mit regulärem Ausdruck arbeiten!
	for (var i = 0; i < alleEmpfaenger.length; i++){
		if (alleEmpfaenger[i] == "BSZ"){
			alleEmpfaenger.splice(i,1);
			i=i-1;
		}
	}
	//hier werden die ELNs entfernt, die nicht adressiert werden sollen:
	for (var i = 0; i < alleEmpfaenger.length; i++){
		for (var j = 0; j < nichtVerwenden.length; j++){
			if (alleEmpfaenger[i] == nichtVerwenden[j]){
				alleEmpfaenger.splice(i,1);
				i=i-1;
			}
		}
	}
	strEmpfaenger = alleEmpfaenger.join("; ");
	application.activeWindow.command("\\too d", false);
	return strEmpfaenger;
}

function UmlenkungEintragenMitMailbox(){
	//Vorgaben von Christian Mewes:
	if (application.activeWindow.getVariable("scr") != "8A" || application.activeWindow.materialCode == "am"){
		application.messageBox("Fehler", "Bitte rufen Sie einen Titel in die Vollanzeige!", "error-icon");
		return;
	}
	var umlenkDatum = datumZukunft(14);
	var strPPN = application.activeWindow.getVariable("P3GPP");
	var zielPPN = application.activeWindow.findTagContent("1698", 0, true);
	zielPPN = kxpUtility.ppnPruefung(zielPPN);
	if (zielPPN==""){
		__fehler("Es kommt kein Umlenkungsfeld 1698 vor!")
		return;
	}
	var strMat = kxpUtility.matCode1();
	// Titel editieren:
	application.activeWindow.command("\\mut", false);
	if(application.activeWindow.title){
		if (strMat == "O"){
			kxpUtility.feldEinfuegenNumerisch("0599", "GBV: ExPruef", true);
		}
		var str1698 = application.activeWindow.title.findTag("1698", 0, false, true, true);
		var lPos = str1698.indexOf("!");
		application.activeWindow.title.startOfField(false);
		application.activeWindow.title.wordRight(1, false);
		application.activeWindow.title.charRight(lPos-1, true);
		application.activeWindow.title.insertText(umlenkDatum + ":");
		application.activeWindow.simulateIBWKey("FR");
		if (application.activeWindow.status != "OK"){
			__fehler("Bitte Fehlermeldung beachten! \nFunktion abgebrochen.");
			return;
		}
	}
	var eln = elnErmitteln(true);
	//wenn keine adressierbaren Bestandsnachweise vorkommen:
	if (eln==""){
		__meldung("Dieser Titel hat keine Besitznachweise von Bibliotheken, die aktiv im K10plus katalogisieren.");
	}
	// Mailbox anlegen in neuem Fenster:
	application.activeWindow.command("\\inv 1", true);
	//application.activeWindow.appendMessage("Zum Erfassen des Mailboxsatzes wurde ein neues Fenster geöffnet, das Sie nach dem Speichern wieder schließen können.", 3);
	if (!application.activeWindow.title) return;
	application.activeWindow.title.insertText("0500 amy" +
		"\n8900 !" + strPPN + "!" +
		"\n8900 !" + zielPPN + "!" +
		"\n8901 " + __datumMailbox() + " : " + eln +
		"\n8902 Liebe KollegInnen, diese Titel-Dublette wird bereinigt. Der Titelsatz mit der PPN " + strPPN + " wird am " + umlenkDatum + " auf den Titelsatz mit der PPN " + zielPPN + " umgelenkt. Bitte leiten Sie entsprechende Maßnahmen in Ihren Lokalsystemen ein. Es wird keine weitere Benachrichtigung versendet. Mit freundlichen Grüßen, ");
	//ohne ELN: Cursor 1 Zeile nach oben
	if (eln==""){
		application.activeWindow.title.lineUp(1, false);
	  application.activeWindow.title.endOfField(false);
	}
}
// Ende Mailbox-Funktionen