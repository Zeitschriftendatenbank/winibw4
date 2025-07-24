/*
	Autorin:	Karen Hachmann
	Konvertiert: ASCII to UTF8
	Datum:	2022.03
	Aufsätze, Rezensionen
*/
//-------------------------------------------------------------
var bUwMonografie, strUwJahr, strUwDocType1, strUwDocType2;
var strIMD, alleSchriften, uwInhalt4070, uwPPNLink;
var str4950;
var aktuellesFenster;
var bSucheRezension;
var vortextRezension=""; //Global definiert, denn es wird auch in den Beziehungen-Scripten verwendet!
//-------------------------------------------------------------

function UnselbstaendigesWerk()
{
	//14.03.22: Für WinIBW4 angepasst. Läuft!
	var uwFelder;
	var str1130="", str1140="", str2051="", str2199="", str5057="";
	var pos2 = "s"; //Ausnahme bei OLC, s.u.
	if (__anzeigeKurzVoll() == false) return;
	/*if (__uwAnzeige() == false){
		application.messageBox ("Unselbständiges Werk", "Bitte wählen Sie zuerst den Datensatz aus,\n" +
			"an den Sie ein unselbständiges Werk hängen wollen!", "alert-icon");
		return;
	}*/
	kxpUtility.formatD();
	var strTitle = application.activeWindow.copyTitle();
	//oKat:
	var alle4000 = vollanzeigeAlleVorkommnisse("4000");
	var alle4000oKat = new Array();
	var str4000oKat = "";
	if (alle4000){
		for (var i=0; i<alle4000.length; i++){
			if(alle4000[i].indexOf("$U")!=-1){
				alle4000oKat.push(alle4000[i].substr(0,9));
			}
		}
		str4000oKat = alle4000oKat.join("\n");
	}
	strUwJahr = application.activeWindow.findTagContent("1100", 0, false).substring(0,4);
	if (__uwPruefeMaterial() == true) {
		str1130 = application.activeWindow.findTagContent("1130", 0, false);
		if (str1130  != ""){
			str1130 = "\n1130 " + str1130;
		}
		str1140 = application.activeWindow.findTagContent("1140", 0, false);
		if (str1140  != ""){
			str1140 = "\n1140 " + str1140;
			if (kxpUtility.matCode2()=="b" || kxpUtility.matCode2() == "d"){
				//Wenn 0500 2. Pos. "b" oder "d", soll der Inhalt von 1140 nicht zum unselbständiges Werk übernommen werden.
				str1140 = "";
			}
		}
		//Besonderheiten in Online-Contents B 1.200:
		if (application.activeWindow.getVariable("P3GBI") == "1.200"){
			pos2 = "o";
			//Inhalt aus 2185 der Zss in 2199 des UW
			str2199 = application.activeWindow.findTagContent("2185", 0, false);
			if (str2199  != ""){
				str2199 = "\n2199 " + str2199;
			}
			str5057 = application.activeWindow.findTagContent("5057", 0, false);
			if (str5057  != ""){
				str5057 = "\n5057 " + str5057;
			}
		}
		//Bei elektr. Ressourcen:
		if (strUwDocType1 == "O") {
			str2051 = "\n2051 ";
		}
		if (strUwDocType2 == "b") {
			strUwJahr = "";//Bei Zeitschriften soll kein Jahr übernommen werden.
		}
		//alleSchriften = alleSchriftenArray(strTitle);
		__uwFelderInhalte();
		uwFelder = "0500 " + strUwDocType1 + pos2 + "u" +
			"\n" + strIMD +
			"\n1100 " + strUwJahr +
			str1130 +
			str1140 +
			"\n1500 " +
			"\n1505 $erda" +
			str2051 +
			str2199 +
			"\n3000 " +
			"\n4000 " + str4000oKat +
			"\n4061 " +
			"\n4070 " + uwInhalt4070 +
			str4950 +
			"\n4201 " +
			"\n4207 " +
			"\n4241 Enthalten in!" + uwPPNLink + "!" +
			str5057
			;
		__uwEinfuegen(uwFelder)
	}
}

function __UnselbstaendigesWerkKopieren()
{
	//Funktion wird aufgerufen, wenn Funktion UnselbstaendigesWerk() bei einem UW ausgeführt wird.
	var str4241;
	//Lokal- und Exemplar-Bereich löschen: in uw.ttl, Eintragen des  Pfades der Titelkopie-Datei:
	application.activeWindow.titleCopyFile = "%APPDATA%\\OCLC\\WinIBW4\\ttlFiles\\uw.ttl";
	application.activeWindow.copyTitle();
	application.activeWindow.command ("\\inv t", false);
	if (!application.activeWindow.title) return;
	application.activeWindow.title.pasteTitle();
	str4241 = application.activeWindow.title.findTag("4241", 0, false, true, false);
	if (str4241 != ""){
		str4241 = str4241.replace(/In!|In:!|In: !|Enthalten in:!/,"Enthalten in!");
		application.activeWindow.title.insertText(str4241);
		application.activeWindow.title.startOfField(false);
		if(application.activeWindow.title.find("%", true, true, true) == true){
			application.activeWindow.title.deleteToEndOfLine();
		}
	}
	application.activeWindow.title.findTag("4070", 0, true, true, false);
	application.activeWindow.title.endOfField(false);
	application.showMessage("Unselbständiges Werk kopiert. Für Neuaufnahme bitte aufmerksam bearbeiten!", 3);
}
function __uwPruefeMaterial()
{
	//Prüfung, ob Vollanzeige und richtige Materialart
	bUwMonografie = false;
	//Titelsatz in der Anzeige?
	strUwDocType1 = kxpUtility.matCode1();
	if (strUwDocType1 == "T" ) {
		application.messageBox ("Unselbständiges Werk", "Bitte rufen Sie zuerst eine Titelaufnahme auf!", "alert-icon");
		return false;
	}
	//UnselbstaendigesWerk in der Anzeige?
	strUwDocType2 = kxpUtility.matCode2();
	if (strUwDocType2 == "o" || strUwDocType2 == "s" ) {
		//Funktion verzweigt zu einer Datensatzkopie:
		__UnselbstaendigesWerkKopieren();
		return false;
	}
	if (strUwDocType2 == "c" ) {
		application.messageBox ("Unselbständiges Werk", "Bitte verknüpfen Sie das unselbständige Werk mit dem f-Satz der " +
			"mehrteiligen Monografie!", "alert-icon");
		return false;
	}
	//alle Prüfungen bestanden:
	return true;
}
function __uwFelderInhalte()
{
	var i;
	uwInhalt4070="";
	str4950="";
	if (strUwDocType2 == "b" ) {
		uwInhalt4070 = "$v$j$a$p"
	} else {
		bUwMonografie = true;
		if (strUwJahr != "" ) {
			uwInhalt4070 = "$j" + strUwJahr + "$p";
		} else {
			uwInhalt4070 = "$j$p";
		}
	}
	uwPPNLink = application.activeWindow.getVariable("P3GPP");
	var strMat = kxpUtility.matCode1();
	strIMD = setzeIMD(strMat);
	if(strMat == "O"){
		str4950 = "\n4950 ";
	}
}

function __uwEinfuegen(uwFelder)
{
	application.activeWindow.command ("\\inv t", false);
	if (!application.activeWindow.title) return;
	application.activeWindow.title.insertText(uwFelder);
	application.activeWindow.title.startOfBuffer(false);
	//Cursor soll bei Monos zu 1500 und bei Zeitschriften zu 1100
	if (bUwMonografie == true) {
		application.activeWindow.title.findTag("1500", 0, true, true, false);
	} else {
		application.activeWindow.title.findTag("1100", 0, true, true, false);
	}
	application.activeWindow.title.endOfField (false);
}

//----------------------------------------------
// Rezensionen erfassen:
function Rezension()
{
	if (__anzeigeKurzVoll() == false) return;
	kxpUtility.formatD();
	UnselbstaendigesWerk();
	//Anpassungen für Rezensionen:
	var strIDNRezension = "!106186019!"; //IDN des Normsatzes 'Rezension' im Bestand 1.1
	if (application.activeWindow.getVariable("P3GBI") == "1.86"){
		strIDNRezension = "!00205888X!"; //IDN des Normsatzes 'Rezension' im Bestand 1.86
	}
	application.activeWindow.title.findTag("1100", 0, true, true, false);
	application.activeWindow.title.endOfField(false);
	application.activeWindow.title.insertText("\n1131 " + strIDNRezension);
	//Für den Fall, dass Anwender den Schritt "RezensiertesWerkSuchen" auslassen und nur über die Kommandozeile suchen.
	aktuellesFenster = application.activeWindow.windowID;
	return;
}
//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
function RezensiertesWerkSuchen()
{
	if (!application.activeWindow.title){
		application.messageBox("Rezension", "Die Rezension muss sich in einem Bearbeitungsschirm befinden!", "error-icon")
		return;
	}
	aktuellesFenster = application.activeWindow.windowID;
	showDialog('ProfD\\Dialogs\\kxp_suchBox.html', 100, 100, 280, 90);
	bSucheRezension = true;

}
function freieLinkKommandoRezension(o){
		application.activeWindow.command(o.idErgebnis, false);
}
//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
function RezensiertesWerkLinken()
{
	var strTitle;
	var lpos;
	var strZaehlung;
	//var alleSchriften; // auch in WinIBW3 nicht realisiert
	var alleSchriften, i=0, j=0;
	//lt. AD sollen Personen aus 3000,1,2 und 3010
	//und Körperschaften aus 3100 übernommen werden
	var strRezVerf="", strPer3050= new Array(), strKor3150="";
	var strPer4000="", strKor4000="", strTit4000="", strTit4150, strTitelfingiert="";
	var strFeld, strFeldlang;
	var i;
	if (bSucheRezension != true){
		application.messageBox("Rezensiertes Werk linken", "Es muss zuerst gesucht werden!", "error-icon");
		return;
	}
	if (__anzeigeVoll() == false) return;
	/*if (application.activeWindow.getVariable("scr") != "8A"){
		application.messageBox("Rezensiertes Werk linken", "Das rezensierte Werk muss sich in der Vollanzeige befinden.", "error-icon");
		return;
	}*/
	//Inhalte aus dem rezensierten Werk übernehmen:
	strTitle = application.activeWindow.copyTitle();
	//alleSchriften = alleSchriftenArray(strTitle); //wird hier noch nicht weiter berücksichtigt
	var zeile = strTitle.split("\n");
	for (i=0; i<zeile.length; i++){
		strFeld = zeile[i].substring(0,4);
		if (strFeld == "3000" || strFeld == "3001"|| strFeld == "3002"){
			strRezVerf = zeile[i].substring(5);
			lpos = strRezVerf.indexOf("$B");
			if (lpos != -1){
				strRezVerf = strRezVerf.substring(0, lpos);
			}
			strPer3050[j] = strRezVerf;
			j++;
		}
		if (strFeld == "3010" && (feldAnalysePicaDrei(zeile[i], "B") == "VerfasserIn" || feldAnalysePicaDrei(zeile[i], "B") == "ZusammenstellendeR")){
			strRezVerf = zeile[i].substring(5);
			lpos = strRezVerf.indexOf("$B");
			strRezVerf = strRezVerf.substring(0, lpos);
			strPer3050[j] = strRezVerf;
			j++;
		}
		if (strFeld == "3100"){
			strKor3150 = zeile[i].substring(5);
			lpos = strKor3150.indexOf("$B");
			if (lpos != -1){
				strKor3150 = strKor3150.substring(0, lpos);
			}
		}
	}
	//aus PicaPlus:
	application.activeWindow.command ("s p", false);
	var satz = __zdbGetExpansionFromP3VTX();//kopiert den Titel incl. Expansionen.
	var zeile = satz.split("\n");
	for (i=0; i < zeile.length; i++){
		strFeld = zeile[i].substr(0,4);
		strFeldlang = zeile[i].substr(0,7);
		//alert("Jede Zeile: " + zeile[i])
		//Feld 4000
		if (strFeld == "021A") {
			//alert("4000: " + strFeld)
			strTit4000 = feldAnalysePicaPlus(zeile[i], "a");
			strTit4000 = strTit4000.replace(/@/,"")
		}
		//Feld 4150, wenn es 4000 nicht gibt:
		if (strFeldlang == "036C/00"){
			strTit4150 = holePicaPlusfeld(zeile[i], "a", "");
			strZaehlung = holePicaPlusfeld(zeile[i], "l", ". ");
			if(strTit4000 == "") {
				strTit4000 = strTit4150 + strZaehlung; //nur Gesamttitel
			} else {
				strTit4000 = strTit4150 + strZaehlung + ", " + strTit4000; //Gesamttitel + Bandtitel
			}
		}
		//Feld 3000
		if (strFeld == "028A" ) {
			strPer4000 = holePersonenString(zeile[i], true);
		}
		//Feld 3100
		if (strFeld == "029A") {
			strKor4000 = holeKoerperschaftenString(zeile[i]);
		}
	}
	if(strPer4000 !="" && strKor4000 !=""){
		strPer4000 = strPer4000 + "; " + strKor4000;
	}
	if(strPer4000 !=""){
		strPer4000 = strPer4000 + ", ";
	}
	//vorübergehend festgelegt auf diesen Text:
	vortextRezension = "Rezension von";
	//vorübergehend hier definiert:
	var strBeziehungsFeld = "";
	strTitelfingiert = "[" + vortextRezension + ": " + strPer4000  + strTit4000 + "]";
	application.activeWindow.command ("s d", false);

	//es gibt die Beziehungenscripte noch nicht!
	//alert("Es gibt die Beziehungenscripte noch nicht!")
	/*
	if (vortextRezension != null) {
		strBeziehungsFeld = reziprokerLink.bildeStringBeziehungen("4261", "");
		//alert(strBeziehungsFeld);
	} else {
		return;//ohne Vortext geht es nicht.
	}
	*/
	//Fenster aktivieren, von der die Suche begonnen wurde:
	application.activateWindow(aktuellesFenster);
	deleteSelection();
	//Jetzt wird eingefügt:
	application.activeWindow.title.startOfBuffer(false);
	for (var i = 0; i < strPer3050.length; i++){
		kxpUtility.feldEinfuegenNumerisch("3050", strPer3050[i] + "$BVerfasserIn des Bezugswerks$4ant", false);
	}
	if(strKor3150!=""){
		kxpUtility.feldEinfuegenNumerisch("3150", strKor3150 + "$BVerfasserIn des Bezugswerks$4ant", true);
	}
	//wenn 4000 leer ist, dann füge fingierten Titel aus dem rezensierten Werk ein:
	//nur wenn vortextRezension = "Rezension von". Bei anderen Materialien wird kein Titel fingiert.
	if (vortextRezension == "Rezension von"){
		var suche4000 = application.activeWindow.title.findTag("4000", 0, true, true, false);
		if (suche4000 == ""){
			//wenn 4000 nicht vorkommt:
			kxpUtility.feldEinfuegenNumerisch("4000", strTitelfingiert, true);
		} else if (suche4000.length < 6){
			//wenn 4000 vorkommt und leer:
			application.activeWindow.title.endOfField(false);
			application.activeWindow.title.insertText(strTitelfingiert);
		}
	}
	application.activeWindow.title.endOfField(false);
	application.activeWindow.title.endOfBuffer(false);
	application.activeWindow.title.insertText("\n" + strBeziehungsFeld);
}
//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
var vortext4261Nummer=0;
function RezensionReziprokLinken()
{
	if (__anzeigeVoll() == false) return;
	/*if(application.activeWindow.getVariable("scr") != "8A"){
		application.messageBox("Rezension reziprok linken", "Diese Funktion kann nur ausgehend von einem Datensatz in der Vollanzeige ausgeführt werden!", "error-icon");
		return;
	}*/
	if(application.activeWindow.findTagContent("4261", 0, true) == ""){
		application.messageBox("4261 reziprok linken", "Im angezeigten Datensatz kommt keine 4261 vor!", "error-icon");
		return;
	}
	//Jetzt geht's los:
	var strFeld;
	var strPPN = application.activeWindow.getVariable("P3GPP");
	application.activeWindow.command ("s p", false);
	var satz = __zdbGetExpansionFromP3VTX();//kopiert den Titel incl. Expansionen.
	var zeile = satz.split("\n");
	var alle4261 = new Array();
	var allePPN = new Array();
	var i=0, n=0, x=0;
	var strBeziehungsFeldPPN;
	for (i=0; i < zeile.length; i++){
		strFeld = zeile[i].substr(0,4);
		if (strFeld == "039P") {
			alle4261[n] = zeile[i];
			n++;
		}
	}
	//alert(alle4261.join("\n"));
	for (x=0; x < alle4261.length; x++){
		vortext4261Nummer = x;
		strBeziehungsFeld = reziprokerLink.bildeStringBeziehungen("4261", "");
		strBeziehungsFeldPPN = feldAnalysePicaPlus(alle4261[x], "9");
		allePPN[x] = strBeziehungsFeldPPN;
		//Zielsatz suchen:
		application.activeWindow.command("f ppn " + strBeziehungsFeldPPN + ";k d", false);
		reziprokerLink.einfuegenBeziehungsfeld("4261", strBeziehungsFeld, strPPN);
		//zurück zur Rezension:
		application.activeWindow.command("f ppn " + strPPN, false);
	}
	//Zum Schluss alle suchen:
	application.activeWindow.command("f ppn " + strPPN + " or " + allePPN.join(" or "), false);
	application.activeWindow.command("s k426*", false);
	application.activeWindow.showMessage ("Zur Rezension reziprok verlinkte(r) Titel. " +
		"Wenn der Link nicht schon vorhanden war, dann wurde er soeben ergänzt. Weiter mit Kommando 's k'!", 3);
}
function Sonderdruck(){
	//Für Sonderdrucke einer Druckschrift
	if (__anzeigeVoll() == false) return;
	/*if (application.activeWindow.getVariable("scr") != "8A" ){
		application.messageBox("Achtung", "Bitte holen Sie den Datensatz in die Vollanzeige", "error-icon");
		return;
	}*/
	if(/a|b|f|F/.test(kxpUtility.matCode2()) == false){
		__fehler("Bitte starten Sie die Funktion von einer Aufnahme ausgehend, die in 0500 an Pos. 2 mit 'a, b, f oder F' codiert ist!");
		return;
	}
	var strFeld="";
	var strFeldlang="";
	var strFeldInhalt;
	var b4030 = false;
	var str4241 = "";
	var strFeld_l = "";
	var strFeld_t = "";
	var strFeld_g = "";
	var strFeld_d = "";
	var strFeld_e = "";
	var strFeld_f = "";
	var strFeld_p = "";
	var matCodeQuelle="";
	var str3100="";
	var str4150="";
	var strVorhandenerVortext = "";
	//var thePrompter = utility.newPrompter();
	application.activeWindow.command ("s p", false);
	var satz = __zdbGetExpansionFromP3VTX();//kopiert den Titel incl. Expansionen.
	var zeile = satz.split("\n");
	//Jetzt Datensatz zeilenweise analysieren, i ist Zähler der Titelzeilen:
	for (var i=0; i < zeile.length; i++){
		strFeld = zeile[i].substr(0,4);
		strFeldlang = zeile[i].substr(0,7);
		//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
		//Feld 0500
		if (strFeld == "002@" ) {
			matCodeQuelle = feldAnalysePicaPlus(zeile[i], "0");
			matCodeQuelle = matCodeQuelle.substr(0,1);
		}
		//Feld 1100 Feld n oder a auswerten:
		if (strFeld == "011@" ) {
			strFeld_f = holePicaPlusfeld(zeile[i], "n", "$f");
			if(strFeld_f == ""){
				strFeld_f = holePicaPlusfeld(zeile[i], "a", "$f");
				//nur $a soll mit $b kombiniert werden:
				var str1100b = holePicaPlusfeld(zeile[i], "b", "");
				if (str1100b){
					strFeld_f = strFeld_f + "-" + str1100b;
				}
			}
		}
		//Feld 3000
		if (strFeld == "028A" ) {
			strFeld_l = holePersonenString(zeile[i], false);
		}
		//Feld 3100
		if (strFeld == "029A") {
			//alert(zeile[i]);
			str3100 = holeKoerperschaftenString(zeile[i]);
			//Falls es schon Personennamen gibt, dann Körperschaft dahinter einfügen:
			if (strFeld_l != ""){
				strFeld_l = strFeld_l + "; " + str3100;
			} else {
				strFeld_l = str3100;
			}
		}
		//Feld 4000
		if (strFeld == "021A" ) {
			strFeld_t = feldAnalysePicaPlus(zeile[i], "a");
			//str4000Verfasser = holePicaPlusfeld(zeile[i], "h", " / ");
		}
		//Feld 4005
		if (strFeld == "021C" ) {
			strFeld_t = strFeld_t + ". " + feldAnalysePicaPlus(zeile[i], "a");
		}
		//Feld 4150
		var strTit4150="", strZaehlung="";
		if (strFeldlang == "036C/00"){
			strTit4150 = holePicaPlusfeld(zeile[i], "a", "");
			strZaehlung = holePicaPlusfeld(zeile[i], "l", ". ");
			if(strFeld_t == "") {
				strFeld_t = strTit4150 + strZaehlung; //nur Gesamttitel
			} else {
				strFeld_t = strTit4150 + strZaehlung + ", " + strFeld_t; //Gesamttitel + Bandtitel
			}
		}
		//Feld 4020
		if (strFeld == "032@" ) {
			strFeld_g = holePicaPlusfeld(zeile[i], "a", "$g");
			strFeld_g = abkuerzungRakRDA(strFeld_g);
		}
		//Feld 4030, nur das 1. Vorkommnis soll ausgewertet werden
		if (strFeld == "033A" && b4030 == false) {
			//Ort
			strFeld_d = holePicaPlusfeld(zeile[i], "p", "$d");
			//Verlag
			strFeld_e = holePicaPlusfeld(zeile[i], "n", "$e");
			//nach dem 1. Ausfüllen auf true setzen, damit keine weiteren Vorkommnisse von 4030 übernommen werden.
			b4030 = true;
		}
	}
	if (strFeld_l!= ""){
		strFeld_l = stringTrim(strFeld_l);//bei Expansionen von Körperschaften kommt ein Blank mit
		strFeld_l = "$l" + strFeld_l;
	}
	if (strFeld_t!= ""){
		strFeld_t = strFeld_t.replace(/@/g, "");
		strFeld_t = "$t" + strFeld_t;
	}
	application.activeWindow.command ("s d", false);
	//K10Plus: Bei Sonderdrucken soll grundsätzlich kein PPN-Link und auch kein indirekter Link eingefügt werden:
	str4241 = "4241 Sonderdruck aus" + strFeld_l + strFeld_t + strFeld_g + strFeld_d + strFeld_e + strFeld_f + strFeld_p;
	//__DatenmaskeEinfuegen("andereAusgSonderdruck");
	//stattdessen:
	application.activeWindow.command ("e t", false);
	application.activeWindow.title.insertText("0500 Aau\n0501 Text$btxt" +
		"\n0502 ohne Hilfsmittel zu benutzen$bn\n0503 Band$bnc" +
		"\n1100 \n1131 \n1140 so\n1500 \n1505 $erda\n1700 \n3000 \n3010 \n3100 \n3110 \n3210 \n4000 \n4030 \n4060 \n4061 \n4201 \n" +
		str4241);
}
