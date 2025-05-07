/*
	Autorin:	Karen Hachmann
	Datum:	2025.04
	Parameter: showDialog(dialogName, dialogStartPointX, dialogStartPointY, dialogWidth, dialogHeight)
*/
function recherchestapel() {
	showDialog('ProfD\\Dialogs\\kxp_rechercheStapel.html', 200, 50, 300, 280);
}
function einstellungenKatalogisierung(){
	showDialog('ProfD\\Dialogs\\kxp_einstellungenKatalogisierung_dialog.html', 200, 50, 375, 250);
}
//Eingabeformulare:
function Eingabeformular() {
	var erlaubteFelder = "\n30xx, 4024, 4070, 495x/713x,  4255, 4256, 4278, 7100, 9100";
	var regexpPerson = /30[0-9][0-9]/;
	var regexp4024 = /4024/; //Erscheinungsverlauf (ZDB)
	var regexp4070 = /4070/;
	var regexpUrl = /495[0-1]|409[8-9]|713[3-9]/;
	var regexp4255 = /4255/
	var regexp4256 = /4256/
	var regexp4278 = /4278/
	var regexp7100 = /71[0-9][0-9]/;
	var regexp9100 = /9100/;
	var strVerbund = "";
	if(!application.activeWindow.title){
		__fehler(gPicaUtility.getMessage("MustBeEditing"));
		return false;
	}
	//Jetzt wird das Feld geprüft:
	var strFeld = application.activeWindow.title.tag;
	//application.activeWindow.title.currentField;
	application.activeWindow.title.startOfField(false);
	application.activeWindow.title.endOfField(true);
	application.activeWindow.clipboard = application.activeWindow.title.selection;

	if (regexpPerson.test(strFeld)){
		//showDialog('ProfD\\Dialogs\\kxp_eingabeformular_30XX.html', 400, 100, 600, 550);
		application.messageBox("Eingabeformular", "Eingabeformular für " + strFeld +  " kommt bald!", "message-icon");
		return;
	}
	else if (regexpUrl.test(strFeld)){
		showDialog('ProfD\\Dialogs\\kxp_eingabeformular_url.html', 350, 20, 550, 500);
		return;
	}
	else if (regexp4024.test(strFeld)){
		//showDialog('ProfD\\Dialogs\\kxp_eingabeformular_4024.html', 400, 100, 600, 550);
		application.messageBox("Eingabeformular", "Eingabeformular für " + strFeld +  " kommt bald!", "message-icon");
		return;
	}
	else if (regexp4070.test(strFeld)){
		showDialog('ProfD\\Dialogs\\kxp_eingabeformular_4070.html', 400, 50, 350, 360);
		return;
	}
	else if (regexp4255.test(strFeld)){
		//showDialog('ProfD\\Dialogs\\kxp_eingabeformular_4255.html', 400, 100,  600, 550);
		application.messageBox("Eingabeformular", "Eingabeformular für " + strFeld +  " kommt bald!", "message-icon");
		return;
	}
	else if (regexp4256.test(strFeld)){
		//showDialog('ProfD\\Dialogs\\kxp_eingabeformular_4256.html', 400, 100, 600, 550);
		application.messageBox("Eingabeformular", "Eingabeformular für " + strFeld +  " kommt bald!", "message-icon");
		return;
	}
	else if (regexp4278.test(strFeld)){
		showDialog('ProfD\\Dialogs\\kxp_eingabeformular_4278.html', 50, 50, 750, 360);
		return;
	}
	else if (regexp7100.test(strFeld)){
		if(application.activeWindow.getVariable("P3GOJ") >= 2000){
			//Dialogdatei, Funktion, Breite, Höhe
			showDialog('ProfD\\Dialogs\\kxp_eingabeformular_7100_swb.html', 400, 100, 350, 275);
		} else {
			showDialog('ProfD\\Dialogs\\kxp_eingabeformular_7100_gbv.html', 400, 100, 300, 220);
		}
		return;
	}
	else if (regexp9100.test(strFeld)){
		showDialog('ProfD\\Dialogs\\kxp_eingabeformular_9100.html', 50, 50, 750, 320);
		//WindowID feststellen, damit später dahin zurückgegangen werden kann
		provenienzActiveWindow = application.activeWindow.windowID;
		return;
	}
	else {
		application.messageBox("Eingabeformular Pica3",
			"Es gibt kein Eingabeformular für Feld " + strFeld + ", aber für diese Felder: \n" + erlaubteFelder, "alert-icon");
	}
}
/* alternativ: Ermittlung der Feldinhalte im Script:
function __eingabeformular4070(o) {
	keine spezielle Anpassung für 4070 erforderlich. Stattdessen wird dies ausgefügt: _feldEinfuegen(o)
	var inhaltFeld = "";
	if (o.Feld_v) inhaltFeld +=  "$v" + o.Feld_v;
	if (o.Feld_j) inhaltFeld +=  "$j" + o.Feld_j;
	if (o.Feld_a) inhaltFeld +=  "$a" + o.Feld_a;
	if (o.Feld_d) inhaltFeld +=  "$d" + o.Feld_d;
	if (o.Feld_m) inhaltFeld +=  "$m" + o.Feld_m;
	if (o.Feld_n) inhaltFeld +=  "$n" + o.Feld_n;
	if (o.Feld_i) inhaltFeld +=  "$i" + o.Feld_i;
	if (o.Feld_k) inhaltFeld +=  "$k" + o.Feld_k;
	if (o.Feld_l) inhaltFeld +=  "$l" + o.Feld_l;
	if (o.Feld_p) inhaltFeld +=  "$p" + o.Feld_p;
	if (o.Feld_t) inhaltFeld +=  "$t" + o.Feld_t;
	if (o.Feld_y) inhaltFeld +=  "$y" + o.Feld_y;
	feldEinfuegen(inhaltFeld)
}	*/
function __holeFeldEingabeformular(){
	//keine Prüfung erforderlich, dass Eingabeformular nur im TitelEdit aufgerufen werden kann
	utility.sentDataToDialog(application.activeWindow.title.currentField);
}

function __eingabeformular7100_gbv(o) {
	var inhaltFeld7100 = "";
	if (o.idFeld_b) inhaltFeld7100 +=  "" + o.idFeld_b; //ohne $b
	if (o.idFeld_j) inhaltFeld7100 +=  "$j" + o.idFeld_j;
	if (o.idFeld_e) inhaltFeld7100 +=  "$e" + o.idFeld_e;
	if (o.idFeld_f) inhaltFeld7100 +=  "$f" + o.idFeld_f;
	if (o.idFeld_a) inhaltFeld7100 +=  "$a" + o.idFeld_a;
	if (o.idFeld_d) inhaltFeld7100 +=  "$d" + o.idFeld_d;
	if (o.idFeld_i == "true") inhaltFeld7100 += "$ic";
	if (application.activeWindow.title.currentField.length > 5){
		ueberschreiben7100(inhaltFeld7100);
	} else {
		einfuegen7100(inhaltFeld7100);
	}
}
function __eingabeformular7100_swb(o) {
	var inhaltFeld7100 = "";
	if (o.idFeld_B) inhaltFeld7100 +=  "$B" + o.idFeld_B;
	if (o.idFeld_e) inhaltFeld7100 +=  "$e" + o.idFeld_e;
	if (o.idFeld_f) inhaltFeld7100 +=  "$f" + o.idFeld_f;
	if (o.idFeld_a) inhaltFeld7100 +=  "$a" + o.idFeld_a;
	if (o.idFeld_c) inhaltFeld7100 +=  "$c" + o.idFeld_c;
	if (o.idFeld_g) inhaltFeld7100 +=  "$g" + o.idFeld_g;
	if (o.idFeld_D) inhaltFeld7100 +=  "$D" + o.idFeld_D;
	if (o.idFeld_J) inhaltFeld7100 +=  "$J" + o.idFeld_J;
	if (o.idFeld_l) inhaltFeld7100 +=  "$l" + o.idFeld_l;
	//alert(inhaltFeld7100)
	if (application.activeWindow.title.currentField.length > 5){
		ueberschreiben7100(inhaltFeld7100);
	} else {
		einfuegen7100(inhaltFeld7100);
	}
}

function __aendereVerbund(){
	var thePrompter = utility.newPrompter();
	var antwort = thePrompter.confirmEx("Eingabeformular 7100", "Welches Eingabeformular möchten Sie verwenden?\nExemplarsyntax des GBV oder SWB.", "GBV", "SWB", "", "", "");
	if (antwort == 0){
		application.writeProfileString("kxp","verbund", "GBV");
	} else {
		application.writeProfileString("kxp","verbund", "SWB");
	}
}

function __feldEinfuegen(o){
	if (o.alleFelder){
		if (application.activeWindow.title.currentField.length == 5){
			application.activeWindow.title.endOfField(false);
		} else {
			application.activeWindow.title.startOfField(false);
			application.activeWindow.title.wordRight(1, false);
			application.activeWindow.title.endOfField(true);
		}
		application.activeWindow.title.insertText(o.alleFelder);
	}
}
function einfuegen7100(inhaltFeld7100)
{
	application.activeWindow.title.endOfField(false);
	application.activeWindow.title.insertText(inhaltFeld7100);
}
function ueberschreiben7100(inhaltFeld7100)
{
	//Feld 7100 in der vorhandenen Zeile überschreiben
	application.activeWindow.title.startOfField (false);
	application.activeWindow.title.charRight (4, false);
	application.activeWindow.title.deleteToEndOfLine();
	application.activeWindow.title.insertText (" " + inhaltFeld7100);
}
function __FrageSpeichern() {
	var prompt = utility.newPrompter();
	if (prompt.confirmEx("Speichern?", "Änderungen speichern?", "YES", "NO", "", "", false) == 0) {
		utility.sentDataToDialog(true);
	} else {
		utility.sentDataToDialog(false);
	}
}
/*
function informationenK10plus() {
	showDialog('ProfD\\Dialogs\\kxp_informationen_dialog.html', 200, 50, 200, 200);
}
//die Funktionen zeigeUrl1 - zeigeUrl4 gehören zur Funktion infoURLs. Dies ist keine elegante Lösung
//aber leider kann ich aus dem Dialog mit runScript keinen Parameter übergeben.
function zeigeUrl1(){
	var dieUrl = "https://wiki.k10plus.de/";
	application.shellExecute(dieUrl, "open", "");
}
function zeigeUrl2(){
	var dieUrl = "https://opus.k10plus.de/frontdoor/deliver/index/docId/434/file/K10plus_Sacherschliessung.pdf";
	application.shellExecute(dieUrl, "open", "");
}
function zeigeUrl3(){
	var dieUrl = "https://wiki.k10plus.de/pages/viewpage.action?pageId=27361358";
	application.shellExecute(dieUrl, "open", "");
}
function zeigeUrl4(){
	var dieUrl = "https://www.gbv.de/bibliotheken/fernleihe/";
	application.shellExecute(dieUrl, "open", "");
} */
function kommandoBox(){
	showDialog('ProfD\\Dialogs\\kxp_kommandoBox.html', 100, 100, 280, 90);
}
function wikiWinibw(o) {
	//diese Funktion wird aus diversen Dialogen heraus aktiviert.
	if (o.url) {
		application.shellExecute(o.url, "open", "");
	}
}
//----- Eingabeformular 9100 (Provenienzen) -----
var provenienzActiveWindow;
var provenienzBeginnZeile;
function provenienzExemplarInfos(o){
	var str7100;
	var str7800;
	var exnr = o.idFeldExnr;
	if (exnr.length == 1){
		exnr = "E00" + exnr;
	} else if (exnr.length == 2){
		exnr = "E0" + exnr;
	} else {
		application.messageBox("Bitte beachten!", exnr + " ist eine ungültige Exemplarnummer!", "error-icon");
		return;
	}
	//alert(exnr);
	//merke dir die Ausgangsposition:
	provenienzBeginnZeile = application.activeWindow.title.currentLineNumber;
	//jetzt wird die Exemplarnummer angesteuert:
	if(application.activeWindow.title.findTag(exnr, 0, false, true, true) == ""){
		application.messageBox("Bitte beachten!", "Exemplar " + exnr + " nicht gefunden!", "error-icon");
		return;
	}
	//Schleife beginnt bei E0xx des gefundenen Exemplares und endet bei 7800:
	//damit keine Endlosschleife entsteht, wird geprüft, ob 7800 vorkommt:
	if (application.activeWindow.title.findTag("7800", 0, false, false, false) =="") {
		application.messageBox("Bitte beachten!", "Es gibt kein gespeichertes Exemplar, deshalb kann keine EPN ermittelt werden.", "error-icon");
		return;
	}
	do {
		application.activeWindow.title.endOfField(false);
		application.activeWindow.title.lineDown(1, false);
		//alert(application.activeWindow.title.tag);
		if (application.activeWindow.title.tag == "7100"){
			str7100 = application.activeWindow.title.currentField;
			str7100 = str7100.substr(5);
			str7100 = feldAnalysePicaDrei(str7100, "a");
		}
		//if (application.activeWindow.title.tag == "7800"){ //funktioniert leider nicht mit geschützem Feld
		if (application.activeWindow.title.currentField.substr(0,4) == "7800"){
			str7800 = application.activeWindow.title.currentField;
			str7800 = str7800.substr(5);
		}
	} while (application.activeWindow.title.tag != "7800");
	if (str7100 == undefined) str7100 = "";
	utility.sentDataToDialog(str7100 + "///" + str7800);
}

function __provenienzHoleISIL() {
	provenienzActiveWindow = application.activeWindow.windowID;
	application.activeWindow.command("s bib", true);
	var strISIL = application.activeWindow.getVariable("P3VBK");
	application.activateWindow(provenienzActiveWindow);
	utility.sentDataToDialog(strISIL);
}
function provenienzRecherchePER(o)
{
	provenienzRechercheGND("f per " + o.idFeld_a + " bbg tp?");
}
function provenienzRechercheKOR(o)
{
	provenienzRechercheGND("f kor " + o.idFeld_a + " bbg (tb? or tg?)");
}
function provenienzRechercheWTU(o)
{
	provenienzRechercheGND("f (wtu " + o.idFeld_a + " OR rl " + o.idFeld_a + ") ent win");
}
function provenienzRechercheGND(strSuche){
	application.activeWindow.command(strSuche, true);
	utility.sentDataToDialog(application.activeWindow.status);
}
function __provenienzHolePPN(){
	var strPPN = application.activeWindow.getVariable("P3GPP")
	utility.sentDataToDialog(strPPN);
}
function __provenienzEinfuegen(){
	var ppnGND = "";
	var strTitle = "";
	var katAnsetzung = "";
	var strAnsetzung = "";
	ppnGND = application.activeWindow.getVariable("P3GPP");
	var strScreen = "";
	//Vollanzeige aufrufen
	if (strScreen == "7A"){
		application.activeWindow.simulateIBWKey("FR");
	}
	if (__anzeigeVoll() == false) return;
	/*if (strScreen != "8A"){
		application.messageBox("Bitte beachten!", "Bitte holen Sie den Datensatz in die Vollanzeige!", "error-icon");
		return;
	}*/
	//Präsentationsformat prüfen und auf "D" umstellen
	if (application.activeWindow.getVariable("P3GPR") != "D") {
		application.activeWindow.command ("\\too d", false);
	}
	//nachfolgend erstellte Ansetzungsform wird nicht mehr für $a verwendet. Wird vorerst hier noch ermittelt und in das Feld eingetragen
	//Programmcode demnächst entfernen?
	strTitle = application.activeWindow.copyTitle();
	//Material:
	switch(application.activeWindow.materialCode.substr(0,2)){
		case "Tb":
			katAnsetzung = "110";
			break;
		case "Tg":
			katAnsetzung = "151";
			break;
		case "Tp":
			katAnsetzung = "100";
			break;
		case "Tu":
			katAnsetzung = "130";
			break;
		default: katAnsetzung = "";
	}
	if (katAnsetzung==""){
		application.messageBox("Bitte beachten!", "Bitte wählen Sie einen Datensatz aus!", "alert-icon");
		return;
	}
	var strAnsetzung = application.activeWindow.findTagContent(katAnsetzung, 0, false)
	//alert("strAnsetzung: " + strAnsetzung)

	strAnsetzung = strAnsetzung.replace(/\$c/," ");
	strAnsetzung = strAnsetzung.replace(/\$[a-zA-Z0-9]/g,", ");
	//es wird auch gewünscht, dass bei 110 das $g ersetzt wird durch (...). Aber wo soll ich die schließende Klammer setzen?
	if(strAnsetzung.substring(0,2) == ", "){
		strAnsetzung = strAnsetzung.substring(2,strAnsetzung.length);
	}
	utility.sentDataToDialog(strAnsetzung);
	//Hier folgten Zeilen in denen die Relation zur ppnGND ermittelt wurden. Wird nicht mehr benötigt?
}
function __provenienzRechercheWerk(o){
		var strSuche=o.idFeld_6;
		if (strSuche != ""){
		//application.activeWindow.command("rec n;f tit " + strSuche, true);
		application.activeWindow.command("rec n;f (tit " + strSuche +
					" OR sw " + strSuche +
					" OR rl " + strSuche +
					" OR nkt " + strSuche + ") AND ent wip", true);
	} else {
		application.messageBox("Bitte beachten!", "Bitte tragen Sie Suchbegriffe ein!", "alert-icon");
		return;
	}
	utility.sentDataToDialog(application.activeWindow.status);
}
function provenienzWikiWerk(o){
	var strSuche=o.idFeld_6;
	application.shellExecute("http://provenienz.gbv.de/index.php?title=Spezial%3ASuche&search=" + strSuche, "open", "");
}
function provenienzSucheTproThesaurus(o){
	application.shellExecute("http://provenienz.gbv.de/T-PRO_Thesaurus_der_Provenienzbegriffe", "open", "");
}
function provenienzWerkEinfuegen(o){
	if (application.activeWindow.getVariable("scr") == "7A"){
		application.activeWindow.command ("\\too d", false);
	}
	//Präsentationsformat prüfen und auf "D" umstellen
	if (application.activeWindow.getVariable("P3GPR") != "D") {
		application.activeWindow.command ("\\too d", false);
	}
	if (application.activeWindow.getVariable("scr") != "8A" || application.activeWindow.materialCode.substr(0,2) != "Tu"){
		application.messageBox("Bitte beachten!", "Diese Funktion kann nur von einem Normsatz (Tu) in der Vollanzeige ausgeführt werden!", "alert-icon");
		return;
	}
	var strTitle = application.activeWindow.copyTitle();
	var str035 = application.activeWindow.findTagContent("035", 0, false)
	str035 = str035.replace(/gnd\//, "");
	utility.sentDataToDialog(str035);
	_provenienzMeinEditschirm();
	//Status kann seit WinIBW4.5.1 ermittelt werden.
	/*
	if(provenienzActiveWindow != "" && application.activeWindow.status != "NOHITS"){
		alert("hier2");
	}

	//application.activeWindow.closeWindow();
	document.getElementById('idFeld_6').value = str035;
	/*bwerkEinfuegen = true;
	//Feld entfernt: document.getElementById('idLabelWerk').value = "GND-ID";
	//nur WinIBW3: application.windows.restoreWindowSnapshot(alleFenster);
	application.activateWindow(provenienzActiveWindow);
	document.getElementById("idLabelErgebnisRelation").setAttribute("style", "background-color: #F2F2F2");
	document.getElementById("idLabelErgebnisRelation").value = "";*/
}

function __provenienzMeinEditschirm(){
	application.activateWindow(provenienzActiveWindow);
}
function provenienzFeldEinfuegen(o){
	application.activateWindow(provenienzActiveWindow);
	geheZuZeile(provenienzBeginnZeile);
	if (o.alleFelder){
		if (application.activeWindow.title.currentField.length == 5){
			application.activeWindow.title.endOfField(false);
		} else {
			application.activeWindow.title.startOfField(false);
			application.activeWindow.title.wordRight(1, false);
			application.activeWindow.title.endOfField(true);
		}
		application.activeWindow.title.insertText(o.alleFelder);
	}
}

//Eingabeformular 4278 Einband:
function rechercheEBDB(o){
	var strSuche=o.idFeld_6ebdb;
	strSuche= strSuche.replace(/ /g, "%20");
	var urlEBDB = "https://www.hist-einband.de/werkzeuge/?v=";
	if (strSuche != ""){
		application.shellExecute (urlEBDB + strSuche, "open", "");
	}
}

function __eingabeformularUrl(o) {
	var inhaltFeldUrl = "";
	if (o.idFeld_u) inhaltFeldUrl +=  "" + o.idFeld_u; //ohne $u
	if (o.idFeld_m) inhaltFeldUrl +=  "$m" + o.idFeld_m;
	if (o.idFeld_n) inhaltFeldUrl +=  "$n" + o.idFeld_n;
	if (o.idFeld_q) inhaltFeldUrl +=  "$q" + o.idFeld_q;
	if (o.idFeld_t) inhaltFeldUrl +=  "$t" + o.idFeld_t;
	if (o.idFeld_v) inhaltFeldUrl +=  "$v" + o.idFeld_v;
	if (o.idFeld_x) inhaltFeldUrl +=  "$x" + o.idFeld_x;
	if (o.idFeld_y) inhaltFeldUrl +=  "$y" + o.idFeld_y;
	if (o.idFeld_z) inhaltFeldUrl +=  "$z" + o.idFeld_z;
	if (o.idFeld_3) inhaltFeldUrl +=  "$3" + o.idFeld_3;
	if (o.idFeld_4) inhaltFeldUrl +=  "$4" + o.idFeld_4;
	if (o.idFeld_5) inhaltFeldUrl +=  "$5" + o.idFeld_5;
	if (o.idFeld_A) inhaltFeldUrl +=  "$A" + o.idFeld_A;
	if (o.idFeld_B) inhaltFeldUrl +=  "$B" + o.idFeld_B;
	if (application.activeWindow.title.currentField.length > 5){
		//Inhalt wird überschrieben
		application.activeWindow.title.startOfField (false);
		application.activeWindow.title.charRight (4, false);
		application.activeWindow.title.deleteToEndOfLine();
		application.activeWindow.title.insertText (" " + inhaltFeldUrl);
	} else {
		//Inhalt wird eingefügt
		application.activeWindow.title.endOfField(false);
		application.activeWindow.title.insertText(inhaltFeldUrl);
	}
}
function __sendeStatusAnDialog(){
	//Script geschrieben, weil die Dialoge den Status nicht ermitteln können.
	utility.sentDataToDialog(application.activeWindow.status);
}