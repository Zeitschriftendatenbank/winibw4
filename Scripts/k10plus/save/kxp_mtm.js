/*
	Autorin:	Karen Hachmann
  Konvertiert: ASCII to UTF8
	Datum:	2021.08
*/
function fSatz_MTM(){
	//alert("fSatz_MTM")
	var strMat, strPPN;
	var str4000 = "";
	var str4150 = "";
	var str4160 = "";
	var str4170 = "";
	var str050x = "";
	var i = 0;
	if (__anzeigeKurzVoll() == false) return;
	kxpUtility.formatD();
	var matcode2 = kxpUtility.matCode2();
	//Prüfung ob Funktion von einer c-Satz oder f-Satz aus ausgeführt wird:
	if (matcode2 == "f" || matcode2 == "F") {
		__FSatzKopieren();
		return;
	}
	if (matcode2 != "c" ) {
		application.messageBox("F-Satz (MTM)", "An den Datensatztyp 0500 " + application.activeWindow.materialCode + " können Sie keinen F-/f-Satz hängen." +
			"\nAusgangspunkt für diese Funktion muss ein c- oder F-/f-Satz sein.", "error-icon");
		return;
	}
	strMat = kxpUtility.matCode1(); //Materialcode für f-Satz übernehmen
	strPPN = application.activeWindow.getVariable("P3GPP");
	application.activeWindow.titleCopyFile = "%APPDATA%\\OCLC\\WinIBW4\\ttlFiles\\mtm.ttl";
	//var strTitle = application.activeWindow.copyTitle();
	application.activeWindow.copyTitle();
	var zeilenMitExpansion = __zdbGetExpansionFromP3VTX();
	var allePerKor = zeilenMitExpansion.match(/\n3[0-1][0-9][0-9] !\d{8,9}[\d|x|X]!.*/g);
	application.activeWindow.command("\\inv 1", false);
	if ((application.activeWindow.status == "OK") && (application.activeWindow.title != null)) {
		application.activeWindow.pasteTitle();
	}
	//application.activeWindow.title.endOfBuffer(false);
	//application.activeWindow.title.insertText(strTitle);
	//alert(application.activeWindow.titleCopyFile)
	//__loescheFelderTitelkopie();
	//__loescheFelderEbene1und2();
	//__exemplarDatumLoeschen();
	//wenn Unterfelder $T und $U vorkommen, sollen diese beiden Funktionen ausgeführt werden:
	var oRegExpFelderTU = /(\$T\d{2}\$U\D{4}%%)/;
	/*todo: if(oRegExpFelderTU.test(strTitle)){
		__DatensatzkopieOrigKat();
		__feld_T_nummerieren();
	}*/
	//Für oKat als Schleife: Alle 4000er für 4150 einsammeln
	var alle4000oKat = new Array();
	do {
		str4000 = application.activeWindow.title.findTag("4000", 0, false, true, true);
		if (str4000 != "") {
			if(str4000.indexOf("$U")!=-1){
				alle4000oKat.push(str4000.substr(0,12));
			}
			application.activeWindow.title.deleteLine(1);
			//4000 $d soll nicht zu 4150 übernommen werden:
			str4000 = str4000.replace(/\$d.*\$/, "$");//ersetze $d bis zum nächsten Dollar
			str4000 = str4000.replace(/\$d.*/, "");//ersetze $d bis zum Ende
			//falls str4150 schon einen Inhalt hat:
			if (str4150 != ""){
				str4150 = str4150 + "\n4150 " + str4000 + "$l";
			} else {
				str4150 = str4150 + str4000 + "$l";
			}
		}
	} while (str4000 != "");
	var str4000oKat = alle4000oKat.join("\n4000 ");
	// Schriftenreihe:
	str4170 = application.activeWindow.title.findTag("4170", 0, true, true, true);
	if (str4170 != "" ) {
		var l4170 = str4170.length;
		var lgezaehlt = str4170.indexOf("$l");
		// Falls gezählt, dann 4180 einfügen:
		if (lgezaehlt != -1){
			application.activeWindow.title.endOfField(false);
			application.activeWindow.title.insertText("\n4180 ##");
		}
	}
	kxpUtility.isbnCut();
	if (strMat == "Z"){
		kxpUtility.loescheFeld(/050[1-3]/);
	}
	kxpUtility.feldEinfuegenNumerisch("1100", "", true);
	//wenn 0500 B, S oder Z, soll 1130 leer eingefügt werden.
	if(/[BSZ]/.test(strMat) == true){
		kxpUtility.feldEinfuegenNumerisch("1130", "", true);
	}
	//in ttl gibt es INSERT, aber es kann nur Text in schon vorhandenen Feldern ergänzen.
	kxpUtility.feldEinfuegenNumerisch("1500", "", true);
	kxpUtility.feldEinfuegenNumerisch("1505", "$erda", true);
	kxpUtility.feldEinfuegenNumerisch("1700", "", true);
	kxpUtility.feldEinfuegenNumerisch("2000", "", true);
	kxpUtility.feldEinfuegenNumerisch("3210", "", true);
	kxpUtility.feldEinfuegenNumerisch("3211", "", true);
	kxpUtility.feldEinfuegenNumerisch("4000", str4000oKat, true);
	kxpUtility.feldEinfuegenNumerisch("4020", "", true);
	kxpUtility.feldEinfuegenNumerisch("4030", "", true);
	kxpUtility.feldEinfuegenNumerisch("4060", "", true);
	kxpUtility.feldEinfuegenNumerisch("4061", "", true);
	kxpUtility.feldEinfuegenNumerisch("4150", str4150, true);
	kxpUtility.feldEinfuegenNumerisch("4151", "", true);
	//bei nicht-lateinischen Schriften soll 4160 mehrfach eingefügt werden
	//hierfür wird der Inhalt von 4150 geprüft:
	var i = 0;
	var suche4150 = "";
	do {
		suche4150 = application.activeWindow.title.findTag("4150", i, false, true, true);
		if (suche4150!="" && oRegExpFelderTU.test(suche4150)){
			str4160 = str4160 + "\n4160 " + suche4150.substr(0,12) + "##!" + strPPN + "!$l";
		}
		i++;
	} while (suche4150 != "");
	if (str4160 != ""){
		kxpUtility.feldEinfuegenNumerisch("4160", str4160.substr(6), true);
	} else {
		kxpUtility.feldEinfuegenNumerisch("4160", "##!" + strPPN + "!" + "$l", true);
	}
	//prüfe, ob Exemplarangaben aus übergeordneter Aufnahme übernommen werden sollen
	if (application.getProfileInt("Bandsatz", "mitEx", 0) == 0){
		__loescheAlleExemplare();
	}
	kxpUtility.deleteEmptyLines();
	application.activeWindow.title.startOfBuffer(false);
	application.activeWindow.title.findTag("0500", 0, false, true, true);
	application.activeWindow.title.startOfField(false);
	if (strMat != "Z"){
		application.activeWindow.title.charRight(6, false);
	} else {
		//bei Medienkombination wird "Z" gelöscht
		application.activeWindow.title.charRight(5, false);
	}
	application.activeWindow.title.deleteToEndOfLine();
	application.activeWindow.title.insertText ("F/f");
	if (allePerKor){
		application.showMessage(allePerKor.join(""), 1)
	}
}

function __FSatzKopieren(){
	//Funktion muss noch verfeinert werden.
	//unklar, wieviel von Ebene1 und 2 übernommen werden soll.
	//alert("__FSatzKopieren:\n Diese Funktion wird ausgeführt, wenn fSatz_MTM bei einer f-Stufe ausgeführt wird")
	var str1100;
	var matcode2 = kxpUtility.matCode2();
	application.activeWindow.titleCopyFile = "%APPDATA%\\OCLC\\WinIBW4\\ttlFiles\\mtm.ttl";
	var strTitle = application.activeWindow.copyTitle();
	application.activeWindow.command ("\\inv t", false);
	application.activeWindow.command("\\inv 1", false);
	if ((application.activeWindow.status == "OK") && (application.activeWindow.title != null)) {
		application.activeWindow.pasteTitle();
	}
	loescheVorFeld("0500");
	//nur wenn Unterfelder $T und $U vorkommen, sollen diese beiden Funktionen ausgeführt werden:
	//var oRegExpFelderTU = /\$T(\d{2})\$U\D{4}%%/;
	//if(oRegExpFelderTU.test(strTitle)){
		//__DatensatzkopieOrigKat();
		//__feld_T_nummerieren();
	//}
	kxpUtility.isbnCut();
	//kxpUtility.feldEinfuegenNumerisch("0501", "", true);
	kxpUtility.feldEinfuegenNumerisch("0502", "", true);
	kxpUtility.feldEinfuegenNumerisch("0503", "", true);
	kxpUtility.feldEinfuegenNumerisch("1100", "", true);
	kxpUtility.feldEinfuegenNumerisch("1500", "", true);
	kxpUtility.feldEinfuegenNumerisch("1505", "$erda", true);
	kxpUtility.feldEinfuegenNumerisch("1700", "", true);
	kxpUtility.feldEinfuegenNumerisch("2000", "", true);
//return;
	//F: 3210 leer, 3211 aus F-Satz übernehmen
	//f: 3210 soll nicht vorkommen, 3211 leer
	if (matcode2 == "F"){
		kxpUtility.feldEinfuegenNumerisch("3210", "", true);
		kxpUtility.feldEinfuegenNumerisch("3211", "", true);
	} else if (matcode2 == "f"){
		kxpUtility.loescheFeld(/3211/);
		kxpUtility.feldEinfuegenNumerisch("3211", "", true);
	}
	kxpUtility.feldEinfuegenNumerisch("4020", "", true);
	str1100 = application.activeWindow.title.findTag("1100", 0, false, true, false);
	if (str1100 != ""){
		application.activeWindow.title.endOfField(false);
	}
	application.activeWindow.appendMessage("Angezeigter Band wurde kopiert. Für Neuaufnahme bitte aufmerksam bearbeiten!", 3);
}
