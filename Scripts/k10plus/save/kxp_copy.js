/*
	Autorin:	Karen Hachmann
	Konvertiert: ASCII to UTF8
	Datum:	2022.02
*/
function datensatzkopie(){
	//hier gibt's noch mehr zu tun, siehe WinIBW3 !!!
	//Prüfung Vollanzeige oder BroadcastDatenbank:
	var strScreen = application.activeWindow.getVariable("scr");
	var matCode1 = kxpUtility.matCode1();
	var matCode2 = kxpUtility.matCode2();
	var str1505="";
	if (strScreen != "8A" && strScreen != "RF"){
		application.messageBox("Datensatzkopie", "Bitte holen Sie einen Datensatz in die Vollanzeige!", "error-icon");
		return;
	}
	application.activeWindow.titleCopyFile = "%APPDATA%\\OCLC\\WinIBW4\\ttlFiles\\title.ttl";
	if (matCode1 == "T"){
		__datensatzkopieNormdaten();
		return;
	}
	var strTitle = application.activeWindow.copyTitle();
	strTitle = strTitle.replace(/\r/g, "");
	var strDB = application.activeWindow.getVariable("P3GBI");
	if (strDB == "1.2" || strDB == "1.4"){
		__datensatzkopieAndererBestand(strDB);
		return;
	}
	if (strScreen != "RF" && matCode2 == "v"){
		v_Satz_Zs();
		return;
	}
	if (strScreen == "RF"){
		__datensatzkopieExterneDatenbank(strTitle);
		return;
	}
	//Datensatzkopie aus K10plus:
	//alert(application.activeWindow.titleCopyFile)
	application.activeWindow.copyTitle();
	application.activeWindow.command("\\inv 1", false);
	//Status kann seit WinIBW4.5.1 ermittelt werden.
	//alert(application.activeWindow.status);
	if ((application.activeWindow.status == "OK") && (application.activeWindow.title != null)) {
		application.activeWindow.pasteTitle();
	} else {
		__fehler("Sie können dieses Kommando nicht ausführen.");
		return;
	}
	loescheVorFeld("0500");
	kxpUtility.ersetzeHTML();
	//IMD-Felder müssen nicht mehr ergänzt werden
	//nur wenn Unterfelder $T und $U vorkommen, sollen diese beiden Funktionen ausgeführt werden:
	var oRegExpFelderTU = /\$T(\d{2})\$U\D{4}%%/;
	if(oRegExpFelderTU.test(strTitle)){
		application.messageBox("", "für nicht-lateinische Titel noch nicht angepasst", "");
		//fehlt: __DatensatzkopieOrigKat();
		//fehlt: __feld_T_nummerieren();
	}
	__rdaFormat();
	var strIMD = setzeIMD(matCode1);
	strIMD = strIMD.substring(5);//damit nicht 2x "0501"
	kxpUtility.feldEinfuegenNumerisch("0501", strIMD, true);
	kxpUtility.feldEinfuegenNumerisch("1505", "$erda ", true);
	if (application.getProfileInt("Datensatzkopie", "kopieMitEx", 0) == 0){
		__loescheAlleExemplare();
	}
	application.activeWindow.title.startOfBuffer(false);
}
function __datensatzkopieNormdaten(){
	application.activeWindow.copyTitle();
	application.activeWindow.command("\\inv 2", false);
	if ((application.activeWindow.status == "OK") && (application.activeWindow.title != null)) {
		application.activeWindow.pasteTitle();
	} else {
		__fehler("Sie können dieses Kommando nicht ausführen.");
		return;
	}
	loescheVorFeld("005");
}
function __datensatzkopieTiteldaten(){
	if ((application.activeWindow.status == "OK") && (application.activeWindow.title != null)) {
		application.activeWindow.pasteTitle();
	}
}
function __datensatzkopieExterneDatenbank(strTitle){
		var strExtDBid = application.activeWindow.getVariable("P3GRI"); //externe DB-ID
		var strExtDB = application.activeWindow.getVariable("P3GRN"); //externe DB-Name
		//bei BroadcastDatenbank soll fast alles eingefügt werden,
		application.activeWindow.command("\\inv 1", false);
		if ((application.activeWindow.status == "OK") && (application.activeWindow.title != null)) {
			application.activeWindow.title.insertText(strTitle);
			application.activeWindow.title.insertText("\n8910 $bBroadcast-Übernahme aus " + strExtDBid + " " + strExtDB);
			application.activeWindow.title.startOfBuffer(false);
			loescheVorFeld("0500");
			kxpUtility.loescheFeldInhalt(/0500/, 3);
			kxpUtility.loescheFeld(/2040|2199/);
			kxpUtility.ersetzeHTML();
			var str1505 = application.activeWindow.title.findTag("1505", 0, false, true, true);
			if (str1505 == "") {
				//wenn 1505 nicht vorkommt, ergänze 1505 leer:
				kxpUtility.feldEinfuegenNumerisch("1505", " ", true);
			} else if (str1505 != "" && str1505.indexOf("$erda") == -1){
				//wenn 1505 vorkommt, aber nicht $erda darin steht, ergänze 1505 leer:
				application.activeWindow.title.insertText(" ");
			}
			//$7-Links löschen, Ausnahme: $7-Links zur GND:
			application.activeWindow.title.startOfBuffer(false);
			while (application.activeWindow.title.find("$7", true, false, false)== true){
				if(application.activeWindow.title.find("gnd", true, true, false)== false){
					//application.messageBox("","gnd NICHT gefunden" , "");
					application.activeWindow.title.deleteToEndOfLine();
				} else {
					//application.messageBox("","gnd gefunden" , "");
					application.activeWindow.title.endOfField(false);
				}
			}
		}
}
//Hilfsfunktionen für Datensatzkopie
var rdaMeldung = new Array();//für Datensätze, die von RAK zu RDA aufgearbeitet werden.
var iRda; //Zähler der Meldungen
function __rdaFormat()
{
	//Dies ist eine Hilfsfunktion, die von verschiedenen Funktionen verwendet wird.
	//Hier werden Felder (Erfassung vor 2016) nach neuen Regeln überarbeitet.
	var n= 0;
	var letzteZeile;
	var strTag;
	var strBeziehung = "";
	//wieviele Zeilen sollen geprüft werden?
	application.activeWindow.title.endOfBuffer (false);
	letzteZeile = application.activeWindow.title.currentLineNumber;
	application.activeWindow.title.startOfBuffer (false);
	for (n=0; n<= letzteZeile; n++) {
		strTag = application.activeWindow.title.tag;
		application.activeWindow.title.startOfField(false);
		//bei 3000-3002 $B einfügen:
		if ((/300[0-2]/.test(strTag)) && (application.activeWindow.title.currentField.indexOf("$4") == -1)){
			application.activeWindow.title.endOfField(false);
			//Material prüfen:
			var str1140 = application.activeWindow.title.findTag("1140", 0, false, false, false);
			if (str1140.indexOf("muno") != -1 || str1140.indexOf("muto") != -1) {
				application.activeWindow.title.insertText("$BKomponistIn$4cmp");
			} else {
				application.activeWindow.title.insertText("$BVerfasserIn$4aut");
			}
			rdaMeldung[iRda]= "---> " + strTag + " $B und $4 ergänzt.";
			iRda++;
		}
		//30xx in 3010 ändern:
		if (/300[1-2]|301[1-9]|304[0-9]/.test(strTag)){
			application.activeWindow.title.startOfField(false);
			application.activeWindow.title.charRight(4, true);
			application.activeWindow.title.insertText("3010");
			rdaMeldung[iRda]= "---> " + strTag + " ersetzt durch 3010.";
			iRda++;
		}
		//311x in 3110 ändern. Offensichtlich sind alle 321x in 311x umgewandelt worden.
		if (/311[1-9]/.test(strTag)){
			application.activeWindow.title.startOfField(false);
			application.activeWindow.title.charRight(4, true);
			application.activeWindow.title.insertText("3110");
			rdaMeldung[iRda]= "---> " + strTag + " ersetzt durch 3110.";
			iRda++;
		}
		//Noch mal 3000 - 3160 prüfen, ob Beziehungskennzeichen vorhanden:
		if (/3[0-1][0-6][0-9]/.test(strTag)){
			if (application.activeWindow.title.currentField.indexOf("$4") == -1){
				strBeziehung += " " + application.activeWindow.title.tag;
			}
		}
		//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
		if (/321[01]/.test(strTag)){
			var str321x = application.activeWindow.title.currentField;
			if(/<.*?>/.test(str321x)){
				application.activeWindow.title.startOfField(false);
				application.activeWindow.title.endOfField(true);
				application.activeWindow.title.insertText(str321x.replace(/<.*?>/, ""));
				application.activeWindow.title.startOfField(false);
				application.activeWindow.title.charRight(4, true);
				application.activeWindow.title.insertText("3210");
			}
		}
		//zeilenweise abwärts
		application.activeWindow.title.endOfField(false);//wichtig bei mehrzeiligen Inhalten!
		application.activeWindow.title.lineDown (1, false);
	}
	//erst nach der Prüfung aller Felder:
	if (strBeziehung != ""){
		rdaMeldung[iRda]= "---> Bitte ergänzen Sie die Beziehungskennzeichen in: " + strBeziehung;
		iRda++;
	}
}
//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
//Für alle Datenbanken unseres CBS: Kopiere Datensatz zu K10plus:
function kopiereTitelzuK10plus(){
	//vorsichtshalber werden hier mehr DB berücksichtigt als unbedingt nötig
	var strDB = application.activeWindow.getVariable("P3GBI");
	switch(strDB){
		case "1.1":
			datensatzkopie();
			break;
		case "1.2":
			datensatzkopie();
			break;
		case "1.4":
			datensatzkopie();
			break;
		case "1.28":
			__vd17KopiereTitelzuK10plus();
			break;
		case "1.68":
			__IkarKopiereTitelzuK10plus();
			break;
		default:
			__fehler("Für diese Datenbank gibt es keine spezielle Kopierfunktion!");
	}
}
function __datensatzkopieAndererBestand(strDatenbank)
{
	//hier wird ein Titel zum Bestand 1.1 kopiert
	var strTitle = application.activeWindow.copyTitle();
	strTitle = strTitle.replace(/\r/g, "");
	application.activeWindow.command("b 1.1", false);
	application.activeWindow.command("\\inv 1", false);
	if (!application.activeWindow.title){
		application.messageBox("Fehler", "Datensatz kann nicht eingefügt werden. ", "error-icon");
		return;
	}
	application.activeWindow.title.insertText(strTitle);
	application.activeWindow.title.startOfBuffer(false);
	loescheVorFeld("0500");
	kxpUtility.ersetzeHTML();
	//beim Kopieren aus 1.2 soll in den Vorkommnissen von 4971 $t am Ende des Feldes gelöscht werden
	application.activeWindow.title.startOfBuffer(false);
	var i=0;
	while (application.activeWindow.title.findTag("4971", i, true, true, true)!= "") {
		if (application.activeWindow.title.find("$t", true, true, false) == true){
			application.activeWindow.title.endOfField(true);
			application.activeWindow.title.deleteSelection();
		}
		i++;
	}
	application.activeWindow.title.startOfBuffer(false);
	application.activeWindow.showMessage ("Der Datensatz wurde aus '" + strDatenbank + "' in die K10plus Katalogisierungsdatenbank kopiert.", 3);
}
//VD17-Kopie:
function __vd17KopiereTitelzuK10plus()
{
	var strBibl="";
	var strZeile, lZeile;
	var regExpGND = /\d{4} (!\d{8,9}[\d|x|X]!.*; ID: gnd\/).*/;
	var regExpReihe = /416[0-9] #.*#(!(\d{8,9}[\d|x|X])!.*)\$l.*/;
	if (__anzeigeVoll() == false) return;
	kxpUtility.formatD();
	var strPPN = application.activeWindow.getVariable("P3GPP");
	var strTitle = __zdbGetExpansionFromP3VTX();
	application.activeWindow.command("b 1.1", false);
	strBibl = stringTrim(application.activeWindow.getVariable("P3GUL"));
	if (strBibl != "2028"){
		application.activeWindow.command("login vd17alle vd17copy", false);
		if (application.activeWindow.status != "OK"){
			__fehler("Login mit Kennung 'vd17alle' leider erfolglos!");
			return false;
		}
	}
	application.activeWindow.command ("\\inv 1", false);
	//hier wird nicht pasteTitle ausgeführt, also nicht über title.ttl Felder entfernt
	application.activeWindow.title.insertText(strTitle);
	loescheVorFeld("0500");
	var str2191 = application.activeWindow.title.findTag("2191", 0, false, true, true);
	kxpUtility.loescheFeld(/0999|2191|3220|5570|7800|790[0-9]/);
	application.activeWindow.title.endOfBuffer(false);
	lZeile = application.activeWindow.title.currentLineNumber;
	application.activeWindow.title.startOfBuffer(false);
	for (var i=0; i<=lZeile; i++){
		strZeile = application.activeWindow.title.currentField;
		if (regExpReihe.test(strZeile)){
			application.activeWindow.title.startOfField(false);
			application.activeWindow.title.endOfField(true);
			strZeile = strZeile.replace(RegExp.$1, "$7vd17ppn"+ RegExp.$2)
			application.activeWindow.title.insertText(strZeile);
		}
		if (regExpGND.test(strZeile)){
			application.activeWindow.title.startOfField(false);
			application.activeWindow.title.endOfField(true);
			strZeile = strZeile.replace(RegExp.$1, "$7gnd")
			application.activeWindow.title.insertText(strZeile);
		}
		application.activeWindow.title.lineDown(1, false);
	}
	application.showMessage("Sie sind als VD17 eingeloggt und haben einen Titel zu K10plus kopiert.", 3);
	application.appendMessage("Sie können mit dieser Kennung weitere Titel kopieren.", 3);
	application.appendMessage("Zum Anhängen von Exemplardaten loggen Sie sich bitte mit Ihrer Bibliothekskennung ein!", 3);
	application.activeWindow.title.startOfBuffer (false);
	application.activeWindow.title.findTag("0500", 0, true, true, true);
	application.activeWindow.title.startOfField(false);
	application.activeWindow.title.charRight(8, false);
	application.activeWindow.title.charLeft(1, true);
	application.activeWindow.title.insertText("v" +
		"\n2191 VD17 " + str2191 +
		"\n2112 VD17: " + strPPN +
		"\n2199 vd17ppn" + strPPN +
		"\n2240 GBV: VDS" + strPPN);
}
function __IkarKopiereTitelzuK10plus(){
	var strBibl="";
	var strZeile, lZeile;
	var regExpGND = /\d{4} (!\d{8,9}[\d|x|X]!.*; ID: gnd\/).*/;
	var regExpReihe = /416[0-9] #.*#(!(\d{8,9}[\d|x|X])!.*)\$l.*/;
	var regExpBeziehungenA = /424[13] .*(!(\d{8,9}[\d|x|X])!.*).*/;
	var regExpBeziehungenB = /4256 .*(!(\d{8,9}[\d|x|X])!.*).*/;
	if (__anzeigeVoll() == false) return;
	kxpUtility.formatD();
	var strPPN = application.activeWindow.getVariable("P3GPP");
	var strTitle = __zdbGetExpansionFromP3VTX();
	application.activeWindow.command("b 1.1", false);
	strBibl = stringTrim(application.activeWindow.getVariable("P3GUL"));
	if (strBibl != "2015"){
		application.activeWindow.command("login ikar_alle 5U8A", false);
		if (application.activeWindow.status != "OK"){
			__fehler("Login mit Kennung 'ikar_alle' leider erfolglos!");
			return false;
		}
	}
	application.activeWindow.command ("\\inv 1", false);
	application.activeWindow.title.insertText(strTitle);
	loescheVorFeld("0500");
	kxpUtility.loescheFeld(/0999|2199|3220|5570|7800|790[0-9]/);
	application.activeWindow.title.endOfBuffer(false);
	lZeile = application.activeWindow.title.currentLineNumber;
	application.activeWindow.title.startOfBuffer(false);
	for (var i=0; i<=lZeile; i++){
		strZeile = application.activeWindow.title.currentField;
		if (regExpReihe.test(strZeile) || regExpBeziehungenA.test(strZeile) || regExpBeziehungenB.test(strZeile)){
			application.activeWindow.title.startOfField(false);
			application.activeWindow.title.endOfField(true);
			strZeile = strZeile.replace(RegExp.$1, "$7ikarppn"+ RegExp.$2)
			application.activeWindow.title.insertText(strZeile);
		}
		if (regExpGND.test(strZeile)){
			application.activeWindow.title.startOfField(false);
			application.activeWindow.title.endOfField(true);
			strZeile = strZeile.replace(RegExp.$1, "$7gnd")
			application.activeWindow.title.insertText(strZeile);
		}
		application.activeWindow.title.lineDown(1, false);
	}
	application.showMessage("Sie sind als IKAR eingeloggt und haben einen Titel zu K10plus kopiert.", 3);
	application.appendMessage("Sie können mit dieser Kennung weitere Titel kopieren.", 3);
	application.appendMessage("Zum Anhängen von Exemplardaten loggen Sie sich bitte mit Ihrer Bibliothekskennung ein!", 3);
	application.activeWindow.title.startOfBuffer (false);
	application.activeWindow.title.startOfBuffer(false);
	application.activeWindow.title.findTag("0500", 0, true, true, true);
	application.activeWindow.title.startOfField(false);
	application.activeWindow.title.charRight(8, false);
	application.activeWindow.title.charLeft(1, true);
	application.activeWindow.title.insertText("v" +
		"\n2112 IKAR: " + strPPN +
		"\n2199 ikarppn" + strPPN +
		"\n2240 GBV: IKA" + strPPN);
}
function __ebookPoolKopiereTitelzuK10plus(){
	__datensatzkopieAndererBestand("1.2")
}
