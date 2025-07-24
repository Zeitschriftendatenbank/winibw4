/*	Datei:	k10_beziehungen.js
	Autorin:	Karen Hachmann
	Datum:	2022.03 Schritt für Schritt anpassen.
	Überarbeitet bis Zeile: 163
*/
var beziehungenFehlerAusgangspunkt = "Bitte führen Sie diese Funktion aus, wenn \n" +
			"* ein Datensatz sich in der Vollanzeige befindet, der ein Beziehungsfeld mit einer PPN enthält, oder\n" +
			"* zwei Datensätze in einer Kurzliste angezeigt werden, die miteinander verlinkt werden sollen.";

function elektronischeReproduktion()
{
	//Für Reproduktionen, d.h. digitalisierte Ausgaben einer Druckschrift
	//KopieAndereAusgabe("O", "andereAusgElektronischeReproduktion", "4256");
	//die Anwender wollen, dass alles genauso ausgeführt wird wie bei VD18
	//es soll nur einen andere Datenmaske verwendet werden.
	elektronischeReproduktion_mitSpeichern("andereAusgElektronischeReproduktion.txt");
}
function elektronischeReproduktionVD18()
{
	//Für Reproduktionen, d.h. digitalisierte Ausgaben einer Druckschrift
	//KopieAndereAusgabe("O", "andereAusgElektronischeReproduktion", "4256");
	//die Anwender wollen, dass alles genauso ausgeführt wird wie bei VD18
	//es soll nur einen andere Datenmaske verwendet werden.
	elektronischeReproduktion_mitSpeichern("andereAusgVD18.txt");
}

function paralleleOnlineausgabe()
{
	//Wenn von 0500 O ausgeführt, soll eine Druckschrift 0500 A angelegt werden, ansonsten 0500 O
	if(kxpUtility.matCode1() == "O"){
		KopieAndereAusgabe("A", "andereAusgParalleleDruckausgabe.txt", "4243");
	} else {
		KopieAndereAusgabe("O", "andereAusgParalleleOnlineausgabe.txt", "4243");
	}
}

function gleichePhysischeFormReproduktion()
{
	//Für Reproduktionen, d.h. Nachdrucke oder Faksimile einer Druckschrift
	//Prüfe Material:
	var strMat = kxpUtility.matCode1();
	KopieAndereAusgabe(strMat, "", "4255");
}
function mikroformReproduktion()
{
	KopieAndereAusgabe("E", "andereAusgMikroform.txt", "4256");
}
//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

function KopieAndereAusgabe(matCodeZiel, dieMaske, strLinkingFeld)
{
try {
	//Mit dieser Funktion werden Reproduktionen in anderer physischer Form erstellt, z. B. im Rahmen von Digitalisierungsprojekten
	var str1505="", str2000="";
	var lDollar=0;
	var matCode1 = kxpUtility.matCode1();
	var strSerie = "";
	var thePrompter = utility.newPrompter();
	var antwort = "";
	if (__anzeigeVoll() == false) return;
	kxpUtility.formatD();
	var matCode2 = kxpUtility.matCode2();
	//bei Bänden und Aufsätzen muss in der übergeordneten Aufnahme die PPN der parallelen Aufnahmen geholt werden.
	if (matCode2 == "f" || matCode2 == "F" || matCode2 == "s"){
		if(holePPNHierarchisch(strLinkingFeld)==false){
			return;
		}
	}
	//hier wird der Link in 4243 oder 4256 eingefügt:
	var strReziprokerLink = reziprokerLink.bildeStringBeziehungen(strLinkingFeld, matCodeZiel);
	var strTitle = application.activeWindow.copyTitle();
	var str4043 = application.activeWindow.findTagContent("4043", 0, false)
	var str4060 = application.activeWindow.findTagContent("4060", 0, false)
	var alleSignaturen = new Array();
	var strSignatur = "";
	alleSignaturen = vollanzeigeAlleVorkommnisse("7100", false);
	//Titel eingeben:
	application.activeWindow.command("\\inv 1", false);
	if (application.activeWindow.status != "OK" ) {
		//__fehler("Bitte beachten Sie die Fehlermeldung: " + __alleMeldungen());
		__fehler("Bitte beachten Sie die Fehlermeldung!");
		return;
	}
	//Hier wird der kopierte Titel eingefügt:
	application.activeWindow.title.insertText(strTitle);
	//ISBN zu 2003 verschieben, aber NICHT bei gleicher physischer Form
	application.activeWindow.title.startOfBuffer(false);
	var b0599slot = application.activeWindow.title.find("0599 SLoT", false, false, false);
	var str4241 = application.activeWindow.title.findTag("4241", 0, true, true, true);
	if (str4241 != ""){
		//lösche Feld $x
		application.activeWindow.title.insertText(str4241.replace(/\$x.*/, ""));
	}
	if(strLinkingFeld == "4255"){
		//bei gleicher physischer Form soll die vorhandene 2000 soll übernommen werden
		//und darüber eine leere 2000. Ersatz durch 2_0_0_0, damit die folgende Löschfunktion nicht greift
		application.activeWindow.title.replaceAll("\r2000 ", "\r2_0_0_0 \r2_0_0_0 ", false, false);
	} else {
		while (application.activeWindow.title.findTag("2000", 0, false, true, true) != ""){
			str2000 = application.activeWindow.title.findTag("2000", 0, false, true, true);
			//Alle Unterfelder mit $ beginnend entfernen:
			lDollar = str2000.indexOf("$");
			if (lDollar > 0){
				str2000 = str2000.substring(0, lDollar);
				application.activeWindow.title.insertText(str2000);
			}
			//2000 wird 2003
			application.activeWindow.title.startOfField(false);
			application.activeWindow.title.charRight(5, true);
			if (matCodeZiel == "A"){
				application.activeWindow.title.insertText("2003 |o|");
			} else {
				application.activeWindow.title.insertText("2003 |p|");
			}
		}
	}
	if(strLinkingFeld == "4243" && matCodeZiel == "O"){
		//nur bei elektronischen Parallelausgaben. Wenn in der Druckausgabe 2003 |o| vorkommt, soll die ISBN in 2000 ohne |o| übernommen werden.
		application.activeWindow.title.replaceAll("2003 |o|", "2_0_0_0 ", false, false); //2000 soll nicht gelöscht werden. 2_0_0_0 wird weiter unten korrigiert
		//Mewes Juni 21: Nicht übernehmen: 0575, 3487, 3489, 4022, 4048, 4065, 4066, 4067, 4068, 4244, 5058
		kxpUtility.loescheFeld(/0575|348[79]|4022|4048|406[235678]|4220|4244|5058/);
		kxpUtility.loescheFeldInhalt(/418[0-9]/);
	}
	//Online-Ausgabe wird Druckschrift
	if(strLinkingFeld == "4243" && matCodeZiel == "A"){
		application.activeWindow.title.replaceAll("2003 |p|", "2_0_0_0 ", false, false); //2000 soll nicht gelöscht werden. 2_0_0_0 wird weiter unten korrigiert
		kxpUtility.loescheFeld(/1101/);
		kxpUtility.loescheFeldInhalt(/417[0-9]|418[0-9]/);
	}
	kxpUtility.ersetzeHTML();
	//RDA-gerecht bearbeiten:
	__rdaFormat();
	if(strLinkingFeld == "4243" || strLinkingFeld == "4256"){
		kxpUtility.loescheFeld(/0502|0503/);
	}
	if (dieMaske != "andereAusgVD18.txt"){
		kxpUtility.loescheFeld(/0701/);
	}
	//diese Felder sollen übernommen werden, danach lösche alle 2xxx-Felder
	var IDsBehalten=kxpUtility.felderSammeln(/2190|2191|2192|2275|2277/);
	strSerie=kxpUtility.felderSammeln(/418[0-9]/);
	//Diese Felder löschen
	kxpUtility.loescheFeld(/0247|0599|0999|1110|1130|1208|200[01259]|20[1-9][0-9]|2[1-9][0-9][0-9]|4033|418[0-9]|4971|4218|4225|4233|4236|4243|4256|4261|4262|4278|4700|4701|4712|4715|490[0134]|4958|62[0-9][0-9]|8910|9100/);
	application.activeWindow.title.startOfBuffer(false);
	application.activeWindow.title.replaceAll("2_0_0_0", "2000", false, false); //weiter oben war 2003 |o| zu 2000 verschoben worden.
	__loescheAlleExemplare();
	loescheVorFeld("0500");
	if (application.activeWindow.title.tag == "0500"){
		application.activeWindow.title.deleteLine(1);
	}
	//weil bei diesen beiden nicht gespeichert werden muss, kann ich diese Kennzeichnung machen:
	if (dieMaske == "andereAusgParalleleDruckausgabe.txt" || dieMaske == "andereAusgParalleleOnlineausgabe.txt"){
		application.activeWindow.title.insertText("---- Felder aus dem kopierten Datensatz: ----\n");
	}
	//erst hier werden die Zeilen aus der Datenmaske eingefügt: --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
	//Neu: Datenmaske wird oberhalb des kopierten Titels eingefügt.
	application.activeWindow.title.startOfBuffer(false);
	if (dieMaske != ""){
		__DatenmaskeEinfuegen(dieMaske);
	}
	if (matCode2 == "c"){
		kxpUtility.loescheFeld(/4068/);
	}
	//wenn in der Datenmaske 4065 $a vorkommt, dann ergänze strSignatur in $a
	//wird vor Allem für VD18 genutzt
	var str4065 = application.activeWindow.title.findTag("4065", 0, true, true, true);
	if (str4065 != ""){
		if (matCode2 == "c" || matCode2 == "s"){
			//bei c- und s-Sätzen 4065 entfernen,  wird lt. SUB Gö nicht gebraucht.
			application.activeWindow.title.deleteLine(1);
		} else {
			if (str4065.indexOf("$a") !=-1){
				//wir brauchen nur Unterfeld $a:
				for(var n=0; n < alleSignaturen.length; n++){
					alleSignaturen[n] = feldAnalysePicaDrei(alleSignaturen[n], "a");
				}
				switch(alleSignaturen.length){
					case 0:
						strSignatur="";
						break;
					case 1:
						strSignatur=alleSignaturen[0];
						break;
					default:
						antwort = thePrompter.select("Welche Signatur soll in 4065 eingefügt werden?", "Klicken Sie auf 'Abbrechen', wenn Sie keine Signatur einfügen wollen!", alleSignaturen.join("\n"));
						if (!antwort) {
							// Benutzer hat den Dialog abgebrochen, es wird keine Signatur eingefügt:
							strSignatur = "";
						} else {
							strSignatur = antwort;
						}
				}
				application.activeWindow.title.insertText(str4065.replace(/\$a/, "$a" + strSignatur));
			}
		}
	}
	if(IDsBehalten!=""){
		//Einfügen an der passenden nummerischen Stelle
		//1-4 = Feld, 6... = Inhalt des Feldes
		kxpUtility.feldEinfuegenNumerisch(IDsBehalten.substr(1,4), IDsBehalten.substr(6), true);
	}
	kxpUtility.feldEinfuegenNumerisch("0500", matCodeZiel + matCode2 + "u", true);
	//wenn 0501 fehlt, ergänze 0501 Text$btxt
	if (application.activeWindow.title.findTag("0501", 0, true, true, true) == ""){
		if(matCode1 == "A"){
			kxpUtility.feldEinfuegenNumerisch("0501", "Text$btxt", true);
		} else {
			kxpUtility.feldEinfuegenNumerisch("0501", "", true);
		}
	}
	if(strLinkingFeld == "4255"){
		kxpUtility.feldEinfuegenNumerisch("0502", "ohne Hilfsmittel zu benutzen$bn\n0503 Band$bnc", true);
	}
	//bei Reproduktionen:
	if(strLinkingFeld == "4256"){
		if(b0599slot == true){
			kxpUtility.feldEinfuegenNumerisch("0599", "SLoT", true);
		}
		if (strSerie!=""){
			schriftenreihenLink(strSerie);
		}
		var str2192 = application.activeWindow.title.findTag("2192", 0, true, true, true);
		if (str2192 != "" && str2192.indexOf("-") !=-1){
			//Julia Neumann: Nummer nicht zitierfähig. Wenn in 2192 ein Bindestrich vorkommt, soll das Feld gelöscht werden
			application.activeWindow.title.deleteLine(1);
		}
	}
	if(matCodeZiel == "O"){
		kxpUtility.feldEinfuegenNumerisch("0502", "Computermedien$bc", true);
		kxpUtility.feldEinfuegenNumerisch("0503", "Online-Ressource$bcr", true);
	}
	if(matCodeZiel == "E"){
		kxpUtility.feldEinfuegenNumerisch("0502", "", true);
		kxpUtility.feldEinfuegenNumerisch("0503", "", true);
	}
	//Der Inhalt von 1505 soll nur übernommen werden, wenn darin "$erda" vorkommt:
	str1505 = application.activeWindow.title.findTag("1505", 0, true, true, true);
	if(str1505 == ""){
		kxpUtility.feldEinfuegenNumerisch("1505", "", true);
	} else {
		//wenn es 1505 gibt, aber nicht "$erda" vorkommt, wird der Inhalt gelöscht
		if(str1505.indexOf("$erda")==-1){
			application.activeWindow.title.startOfField(false);
			application.activeWindow.title.charRight(5, false);
			application.activeWindow.title.deleteToEndOfLine();
		}
	}
	if(matCodeZiel == "A"){
		kxpUtility.loescheFeldInhalt(/4060|417[0-9]|418[0-9]/);
		kxpUtility.loescheFeld(/406[123]|4950|4971/);
		kxpUtility.feldEinfuegenNumerisch("0502", "ohne Hilfsmittel zu benutzen$bn", true);
		kxpUtility.feldEinfuegenNumerisch("0503", "Band$bnc", true);
		kxpUtility.feldEinfuegenNumerisch("2000", "", true);
	}
	//bei gleicher physischer Form:
	//leere 1700 einfügen, Inhalt von 4030 löschen:
	if(strLinkingFeld == "4255"){
		kxpUtility.feldEinfuegenNumerisch("1700", "", true);
		kxpUtility.loescheFeld(/417[0-9]|418[0-9]/);
		kxpUtility.loescheFeldInhalt(/4030/);
	}
	// bei parallelen Onlineausgaben soll in 4060 dies stehen: 4060 1 Online-Ressource (24 Seiten)
	if (dieMaske == "andereAusgParalleleDruckausgabe.txt" || dieMaske == "andereAusgParalleleOnlineausgabe.txt"){
		kxpUtility.loescheFeld(/5589|960[045]|9628|9699/);
		__loescheFeld5xxxDollarA();
	}
	if (dieMaske == "andereAusgParalleleOnlineausgabe.txt"){
		//gehe zu 4060 und überschreibe den Inhalt.
		str4060 = application.activeWindow.title.findTag("4060", 0, false, true, true);
			if (str4060 != ""){
			application.activeWindow.title.insertText("1 Online-Ressource (" + str4060 + ")");
		}
	}
	application.activeWindow.title.endOfField(false);
	//Einfügen des reziproken Links in 4243, 4255 oder 4256:
	kxpUtility.feldEinfuegenNumerisch(strLinkingFeld, strReziprokerLink.substring(5), true);
	if (matCode2 == "f" || matCode2 == "F" || matCode2 == "s"){
		hierarchischPPNtauschen(matCode2);
	}
	application.activeWindow.title.findTag("1100", 0, true, true, true);
	application.activeWindow.title.startOfField(false);
	application.activeWindow.title.charRight(5, false);
	application.activeWindow.showMessage ("Datensatz kopiert:", 3);
	if(strLinkingFeld != "4255"){
		application.activeWindow.appendMessage ("Sie sehen hier sowohl Inhalte aus der Datenmaske " + dieMaske + " wie auch Felder, die aus dem kopierten Titel übernommen wurden.", 3);
	}
	if(str4043!=""){
		application.activeWindow.appendMessage ("Die Inhalte von Feld 4043 können, falls gewünscht, per Hand in 3010 oder 3110 umgearbeitet werden.", 3);
	}
	//kxpUtility.deleteEmptyLines();
	application.activeWindow.title.startOfBuffer(false);
}
catch(e) {
	//hier wird der Fehler nur gemeldet,
	//es können aber auch andere Aktionen durchgeführt werden
	application.messageBox ("try/catch", e, "error-icon");
	}
}

function elektronischeReproduktion_mitSpeichern(datenmaske)
{
try {
	//Reproduktion in elektronischer Form
	//A-Aufnahme wird kopiert, O-Satz angelegt und gespeichert
	//zum Schluss werden beide Ausgaben in einem Set angezeigt.
	if (__anzeigeVoll() == false) return;
	kxpUtility.formatD();
	var thePrompter = utility.newPrompter();
	var antwort;
	var zeilen = new Array();
	var strPPNAsatz = application.activeWindow.getVariable("P3GPP");
	var strPPNOsatz="";
	var strFeld;
	var i,j=0;
	//als regulärer Ausdruck, damit ich wortweise prüfen kann:
	var oRegEx0599 = /\bvd18\b|\b\u0192bvd18\b/;
	var b0599=false;
	var str4000="", str4950="", str4160="";
	var strAlle4043 = "";
	var matCode2 = kxpUtility.matCode2();
	//Prüfung Materialcode:
	if(kxpUtility.matCode1() == "O"){
		__fehler("Funktion kann nicht bei einer O-Aufnahme ausgeführt werden.");
		return;
	}
	if (matCode2 == "f" || matCode2 == "F" || matCode2 == "s"){
		if(holePPNHierarchisch("4256")==false){
			return;
		}
	}
	kxpUtility.formatP();
	zeilen = application.activeWindow.copyTitle().split("\n");
	//Druckschrift prüfen:
	for (i=0; i<zeilen.length; i++){
		strFeld = zeilen[i].substring(0,4);
		//4256 schon vorhanden?
		if (strFeld == "039I" && (zeilen[i].indexOf("Reproduktion") !=-1)){
			__meldung("Im Datensatz kommt 4256 mit einem Link zur Reproduktion schon vor.");
			//jetzt Abbruch???
			kxpUtility.formatD();
			return;
			antwort = thePrompter.confirmEx("VD18", "Im Datensatz kommt 4256 mit einem Link zur Reproduktion schon vor." +
			"\nWollen Sie trotzdem fortfahren?", "Ja", "Nein", "", "", "")
			// 0 = Ja / 1 = Nein
			if (antwort == 1){
				kxpUtility.formatD();
				return;
			}
		}
		//0599 schon vorhanden mit "vd18"?
		if (strFeld == "009@" && oRegEx0599.test(zeilen[i]) == true){
			b0599 = true;
		}
	}
	kxpUtility.formatD();
	//Nur VD18: 0599 in der Druckschrift einfügen:
	if(datenmaske == "andereAusgVD18" && b0599==false){
		application.activeWindow.command("k d", false);
		if (!application.activeWindow.title) { return;}
		//Wenn es 0599 schon gibt, wird Text angefügt, ansonsten neue 0599 ergänzt
		if (application.activeWindow.title.findTag("0599", 0, true, true, true) != ""){
			application.activeWindow.title.endOfField(false);
			application.activeWindow.title.insertText("; vd18");
		} else {
			application.activeWindow.title.endOfBuffer(false);
			application.activeWindow.title.insertText("\n0599 vd18");
		}
		application.activeWindow.simulateIBWKey ("FR");
		if (application.activeWindow.status != "OK"){
			__fehler("'0599 vd18' wurde eingefügt, aber Titel ließ sich nicht speichern." +
					"\nBitte korrigieren Sie den angezeigten Datensatz, bevor Sie die Reproduktion erstellen!");
			return;
		}
	}
	kxpUtility.formatD();
	if (application.activeWindow.findTagContent("1100", 0, false) == ""){
		antwort = thePrompter.confirmEx("Funktion Elektronische Reproduktion", "Im Datensatz kommt kein Feld 1100 vor. \nOhne Feld 1100 werden Sie den Datensatz nicht speichern können." +
			"\nWollen Sie trotzdem fortfahren?", "Ja", "Nein", "", "", "")
		// 0 = Ja / 1 = Nein
		if (antwort == 1){
			kxpUtility.formatD();
			return;
		}
	}
	//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
	// Titel anlegen:
	KopieAndereAusgabe("O", datenmaske, "4256");
	//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
	//Prüfung der Datenmaske im editSchirm:
	if (application.activeWindow.title.findTag("E001", 0, true, true, true) == ""){
		//Das Escape funktioniert hier falsch, es wird nachgefragt, ob gespeichert werden soll!!!
		//application.activeWindow.simulateIBWKey ("FE");
		__fehler("Bitte ergänzen Sie Feld E001 in Ihrer Datenmaske " + datenmaske +".\nReproduktion wurde nicht angelegt.");
		//evtl. wieder hier mit return abbrechen!!!
		//return;
	}
	var str4950 = application.activeWindow.title.findTag("4950", 0, true, true, true);
	//nun werden noch weitere Felder bearbeitet
	if (!application.activeWindow.title) { return;}
	application.activeWindow.title.startOfBuffer(false);
	if (application.activeWindow.title.findTag("0500", 0, true, true, true) != ""){
		application.activeWindow.title.startOfField(false);
		application.activeWindow.title.charRight(7,false);
		application.activeWindow.title.charRight(1,true);
		if (datenmaske=="andereAusgVD18"){
			application.activeWindow.title.insertText("v\n");
			application.activeWindow.title.insertText("0599 vd18\n");
		} else {
			application.activeWindow.title.insertText("u\n");
		}
	}
	application.activeWindow.title.endOfField(false);
	application.activeWindow.title.endOfField(false);//damit nichts überschrieben wird.
	while (application.activeWindow.title.findTag("4043", 0, true, true, true) != ""){
		strAlle4043 += application.activeWindow.title.currentField + "\n";
		application.activeWindow.title.deleteLine(1);
		//am Ende der Funktion wird der Inhalt ausgewertet!
	}
	if (application.activeWindow.title.findTag("4256", 0, true, true, true) != ""){
		//eigentlich Blödsinn, hier lösche ich 4256, um später das reziproke Linking auszuführen,
		//in der Schlussmeldung sollen beide Vorkommnisse von 4256 gezeigt werden.
		application.activeWindow.title.deleteLine(1);
	}
	//O-Satz speichern. Wenn OK, dann PPN kopieren
	application.activeWindow.simulateIBWKey ("FR");
	if (application.activeWindow.status != "OK"){
		__fehler("Titel konnte nicht gespeichert werden. \nBitte beachten Sie die Fehlermeldung!");
		return;
	}
	strPPNOsatz = application.activeWindow.getVariable("P3GPP");
	//Jetzt O-Datensatz noch mal bearbeiten
	application.activeWindow.command("k d", false);
	//PPN einfügen in 2051 und 4950:
	if (application.activeWindow.title.findTag("2051", 0, true, true, true) != ""){
		//In der Datenmaske steht in 2051 'PPN-', d. h. 'PPN-' soll durch PPN ersetzt werden:
		if(application.activeWindow.title.find("ppn-", false, true, false)==true){
			application.activeWindow.title.insertText(strPPNOsatz);
		}
		//In der Datenmaske steht in 2051 'PPN', d. h. nach 'PPN' soll die PPN ergänzt werden:
		if(application.activeWindow.title.find("ppn", false, true, false)==true){
			application.activeWindow.title.charRight(1, false);
			application.activeWindow.title.charLeft(1, false);
			application.activeWindow.title.insertText(strPPNOsatz);
		}
	}
	if (application.activeWindow.title.findTag("4950", 0, true, true, true) != ""){
		//In der Datenmaske steht in 4950 'PPN-', d. h. 'PPN-' soll durch PPN ersetzt werden:
		if(application.activeWindow.title.find("ppn-", false, true, false)==true){
			application.activeWindow.title.insertText(strPPNOsatz);
		}
		//In der Datenmaske steht in 4950 'PPN', d. h. nach 'PPN' soll die PPN ergänzt werden:
		if(application.activeWindow.title.find("ppn", false, true, false)==true){
			application.activeWindow.title.charRight(1, false);
			application.activeWindow.title.charLeft(1, false);
			application.activeWindow.title.insertText(strPPNOsatz);
		}
		str4950 = application.activeWindow.title.findTag("4950", 0, false, true, true);
		application.activeWindow.title.endOfBuffer(false);
		application.activeWindow.title.insertText("7133 " + str4950);
	}
	application.activeWindow.simulateIBWKey ("FR");
	if (application.activeWindow.status != "OK"){
		__fehler("Titel ließ sich nicht speichern.");
		return;
	}
	//jetzt Set mit A- und O-Aufnahme bilden und reziprok linken:
	application.activeWindow.command("f ppn  " + strPPNAsatz + " or " + strPPNOsatz, false);
	if (application.activeWindow.getVariable("P3GSZ") == 2){
		// nicht gut, weil ich hier eine Fehlerprüfung ergänzt habe: reziprokLinkenFeld4256();
		//stattdessen:
		reziprokerLink.ergaenzeBeziehungenStart("4256");
	}
	if (matCode2 == "v"){
		application.messageBox("Funktion Elektronische Reproduktion","Hinweis zu Av-Sätzen: " +
			"\nIn 418x wurde der Link zur übergeordneten DRUCKSCHRIFT verwendet." +
			"\nBitte korrigieren Sie die Links zur übergeordneten O-Aufnahme per Hand!", "error-icon");
	}
	if(strAlle4043 != ""){
		application.activeWindow.clipboard = strAlle4043;
		application.messageBox("Funktion Elektronische Reproduktion","Im Zwischenspeicher befinden sich alle Vorkommnisse des alten Feldes 4043. \n" +
			strAlle4043 +
			"Bitte rufen Sie die neue O-Aufnahme auf. \nFügen Sie den Inhalt des Zwischenspeichers mit Strg+v ein. " +
			"\nDanach ersetzen Sie Feld 4043 entweder durch 3010 oder 3110!", "message-icon");
	}
}
catch(e) {
	application.messageBox ("try/catch", e, "error-icon");
	}
}
//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
//mit diesen Funktionen werden die Beziehungsfelder 4241, 4242, 4243, 4244, 4255, 4256, 4248, 4249 eingefügt
var reziprokerLink = {
	schlussMeldung: "",
	strSprache:"",
	ergaenzeBeziehungenStart: function(feld){
		var strBeziehungsFeld;
		var strBeziehungsFeldPPN;
		var strPPN = application.activeWindow.getVariable("P3GPP");
		var thePrompter = utility.newPrompter();
		var einleitenderText4248 = "";
		var alleMeldungen = "";
		var strScreen = application.activeWindow.getVariable("scr");
		//4243 und 4255:
		if (feld =="4243" || feld =="4255"){
			if ((strScreen != "7A" && strScreen != "8A") || (strScreen == "7A" && application.activeWindow.getVariable("P3GSZ") != "2")) {
				__fehler(beziehungenFehlerAusgangspunkt);
				return;
			}
		} else if (feld =="4248" || feld =="4249"){
			if(strScreen != "7A"){
				application.messageBox(feld + " reziprok linken", "Diese Funktion kann nur ausgehend von zwei Datensätzen in der Kurzanzeige ausgeführt werden!", "error-icon");
				return;
			}
		}
		//Schritte, die in der Vollanzeige ausgeführt werden:
		if (strScreen == "8A"){
			//prüfe ob Beziehungsfeld 42xx vorkommt:
			if (application.activeWindow.findTagContent(feld, 0, true) == ""){
				//application.messageBox(feld + " reziprok linken", "Feld " + feld + " kommt im Datensatz nicht vor!", "error-icon");
				__fehler(beziehungenFehlerAusgangspunkt);
				return;
			} else {
				//prüfe ob  PPN vorkommt:
				strBeziehungsFeldPPN = this.pruefeFeldVorhanden(feld);
				if (strBeziehungsFeldPPN == ""){
					__fehler("Feld " + feld + " kommt vor, enthält aber keinen PPN-Link. \n"+
						"So kann der zu verlinkende Datensatz nicht gefunden werden.");
					return;
				}
				//alles ist gut, es geht weiter
				strPPN = application.activeWindow.getVariable("P3GPP");
				strBeziehungsFeld = this.bildeStringBeziehungen(feld, "");
				if (strBeziehungsFeld.indexOf("???") !=-1){
					return;
				}
				//alert("strPPN: " + strPPN + "\nstrBeziehungsFeld: \n" + strBeziehungsFeld);
				//hier wird jetzt der Zielsatz gesucht:
				application.activeWindow.command("f ppn " + strBeziehungsFeldPPN + ";k d", false);
				this.einfuegenBeziehungsfeld(feld, strBeziehungsFeld, strPPN);
				//zum Schluss beide anzeigen:
				application.activeWindow.command("f ppn " + strPPN + " or " + strBeziehungsFeldPPN, false);
			}
			//Ende Vollanzeige 8A:
			return;
		}
		//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
		//Ablauf, wenn 2 Datensätze in Kurzanzeige:
		if (strScreen == "7A" && application.activeWindow.getVariable("P3GSZ") == "2" ) {
			//Titel 1 auswerten:
			application.activeWindow.command ("s 1", false);
			strBeziehungsFeld = this.bildeStringBeziehungen(feld, "");
			if (strBeziehungsFeld.indexOf("???") !=-1){
				return;
			}
			if (feld == "4248"){
				einleitenderText4248 = thePrompter.select("4248 reziprok linken", "Bitte wählen Sie den Text für die Beziehungskennzeichnung aus!",
					"Parallele Sprachausgabe\nÜbersetzt als\nÜbersetzung von\nSynchronfassung\nSynchronfassung von");
				if(einleitenderText4248 == null){
					__fehler("Es wurde nicht reziprok gelinkt.");
					return;
				}
				strBeziehungsFeld = strBeziehungsFeld.replace(/4248 /,"4248 " + einleitenderText4248);
				switch (einleitenderText4248){
					case "Parallele Sprachausgabe":
						//wenn 1500 im Titel vorkommt
						if(this.strSprache != ""){
							this.strSprache = sprachenLang(this.strSprache)//umwandeln des Codes in Volltext
							strBeziehungsFeld = strBeziehungsFeld.replace(/Parallele Sprachausgabe/,"Parallele Sprachausgabe" + this.strSprache);
						}
						break;
				//Anwender hat den Text für Titel 1 gewählt. Einleitender Text für Titel 2 ist dann wie folgt.
				//Bei Titel 2 wird nicht wieder gefragt.
					case "Übersetzt als":
						strBeziehungsFeld = strBeziehungsFeld.replace(/Übersetzt als/,"Übersetzung von");
						break;
					case "Übersetzung von":
						strBeziehungsFeld = strBeziehungsFeld.replace(/Übersetzung von/,"Übersetzt als");
						break;
					case "Synchronfassung von":
						strBeziehungsFeld = strBeziehungsFeld.replace(/Synchronfassung von/,"Synchronfassung");
						break;
					case "Synchronfassung":
						strBeziehungsFeld = strBeziehungsFeld.replace(/Synchronfassung/,"Synchronfassung von");
						break;
				}
			}
			strPPN = application.activeWindow.getVariable("P3GPP");
			//Titel 2 bearbeiten:
			application.activeWindow.command ("k 2 d", false);
			//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
			//ruft die Funktion zum Einfügen des Feldes auf und übergibt den String für das Feld und die PPN
			this.einfuegenBeziehungsfeld(feld, strBeziehungsFeld, strPPN);
			alleMeldungen = "\nTitel 2" + this.schlussMeldung;
			//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
			//Titel 2 auswerten:
			application.activeWindow.command ("s 2", false);
			//Informationen aus dem 2. Titel für die Bildung des Beziehungsfeldes:
			strBeziehungsFeld = this.bildeStringBeziehungen(feld, "");
			if (feld == "4248"){
				//gleich wird Titel 1 bearbeitet. Hier wird der vorhin gewählte einleitende Text verwendet.
				strBeziehungsFeld = strBeziehungsFeld.replace(/4248 /,"4248 " + einleitenderText4248);
				if (einleitenderText4248 == "Parallele Sprachausgabe"){
					//wenn 1500 im Titel vorkommt:
					if(this.strSprache != ""){
						this.strSprache = sprachenLang(this.strSprache)
						strBeziehungsFeld = strBeziehungsFeld.replace(/Parallele Sprachausgabe/,"Parallele Sprachausgabe" + this.strSprache);
					}
				}
			}
			strPPN = application.activeWindow.getVariable("P3GPP");
			//Titel 1 bearbeiten:
			application.activeWindow.command ("k 1 d", false);
			//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
			//ruft die Funktion zum Einfügen von des Beziehungsfeldes auf und übergibt den String für das Feld und die PPN
			this.einfuegenBeziehungsfeld(feld, strBeziehungsFeld, strPPN);
			alleMeldungen = "Titel 1" + this.schlussMeldung + alleMeldungen;
			//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
			//zum Schluss beide Titel in die Kurzanzeige holen:
			application.activeWindow.command ("s k", false);
			application.messageBox("Reziprok linken", alleMeldungen, "message-button");
		}
	},
	ergaenzeBeziehungenStart4256: function(feld){
		var i=0, lTitelNrA = 0;
		var matDieserTitel="", matZielsatz="", strPPN="";
		//vorbereitende Prüfung. Setsize ist 2.
		for(i = 1; i <= 2; i++){
			application.activeWindow.command("s " + i + " d", false);
			//Prüfung, ob altes Linkingfeld vorhanden:
			if(application.activeWindow.findTagContent("4243", 0, true) == ""){
				__meldung("4243 in Datensatz " + i + " enthalten. \nBitte prüfen!");
			}
			matDieserTitel = kxpUtility.matCode1();
			if(/A|B|C|H|K|M|V|Z/.test(matDieserTitel) == true){
				strPPN = application.activeWindow.getVariable("P3GPP");
				lTitelNrA = i;
			} else {
				//dann ist dies der Satz, bei dem 4256 eingetragen werden soll
				matZielsatz = matDieserTitel;
			}
		}
		if (/E|O|S/.test(matZielsatz) == false || lTitelNrA == 0){
			application.activeWindow.command ("s k", false);
			__fehler("Kein reziprokes Linking möglich! \nIn diesem Set muss es je einen Titel mit Material A|B|C|H|K|M|V|Z \nund einen mit Material E|O|S geben!");
			return;
		} else {
			application.activeWindow.command ("s " + lTitelNrA + " d", false);
			strBeziehungsFeld = this.bildeStringBeziehungen("4256", matZielsatz);
			//jetzt 4256 im anderen Titel ergänzen:
			if (lTitelNrA == 1){
				application.activeWindow.command ("k 2 d", false);
			} else {
				application.activeWindow.command ("k 1 d", false);
			}
			this.einfuegenBeziehungsfeld("4256", strBeziehungsFeld, strPPN);
			//und jetzt reziprok weiter:
			this.ergaenzeBeziehungenStart("4256");
		}
	},
	pruefeFeldVorhanden: function(feld){
		//Titel wird im PicaPlusformat geprüft:
		kxpUtility.formatP()
		var strFeld="", feldPlus="";
		//Array alle Zeilen
		var satz = __zdbGetExpansionFromP3VTX();//kopiert den Titel incl. Expansionen.
		var zeile = satz.split("\n");
		var strFeldPPN="";
		var i = 0;
		switch (feld) {
			case "4243":
				feldPlus = "039D";
				break;
			case "4255":
				feldPlus = "039H";
				break;
			case "4256":
				feldPlus = "039I";
				break;
			case "4261":
				feldPlus = "039P";
				break;
		}
		//Jetzt Datensatz zeilenweise analysieren, i ist Zähler der Titelzeilen:
		for (i=0; i < zeile.length; i++){
			strFeld = zeile[i].substr(0,4);
			if (strFeld == feldPlus) {
				strFeldPPN = feldAnalysePicaPlus(zeile[i], "9");
			}
		}
		kxpUtility.formatD();
		return strFeldPPN;
	},
	bildeStringBeziehungen: function(feld, matCodeZiel){
		//Titel wird im PicaPlusformat geprüft:
		kxpUtility.formatP();
		var strFeld="";
		var strFeldlang="";
		var strPPN = application.activeWindow.getVariable("P3GPP");
		//Array alle Zeilen
		var satz = __zdbGetExpansionFromP3VTX();//kopiert den Titel incl. Expansionen.
		var zeile = satz.split("\n");
		var strFeldInhalt;
		var matCodeQuelle="";
		var strFeld_a="", strFeld_i="", strFeld_n="";
		//Rezensionen:
		var alleVortexte4261 = new Array();
		var zaehler4261 = 0;
		var vortext4261 = "";
		var strVorhandenerVortext = "";
		var thePrompter = utility.newPrompter();
		var i = 0;
		//Jetzt Datensatz zeilenweise analysieren:
		for (i=0; i < zeile.length; i++){
			strFeld = zeile[i].substr(0,4);
			strFeldlang = zeile[i].substr(0,7);
			//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
			//Feld 0500
			if (strFeld == "002@" ) {
				matCodeQuelle = feldAnalysePicaPlus(zeile[i], "0");
				matCodeQuelle = matCodeQuelle.substr(0,1);
			}
			//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
			//Nach Auskunft von AD sollen die Identnummern von Vd16/17/18 nicht in strFeld_o übernommen werden!!!
			if (strFeld == "010@" ) {
				this.strSprache = feldAnalysePicaPlus(zeile[i], "a");
			}
			//4255
			if (strFeld == "039H" ) {
				strVorhandenerVortext = feldAnalysePicaPlus(zeile[i], "c");
			}
			//Feld 4261 Vortext ermitteln:
			if (strFeld == "039P" ) {
				//Problem: Was tun, wenn 4261 mehrmals vorkommt?
				vortext4261 = feldAnalysePicaPlus(zeile[i], "i");
				//entfernen, sobald das PicaPlusFormat alle Felder korrekt anzeigt!!!
				var lDollar = vortext4261.indexOf("$");
				if(lDollar != -1){
					vortext4261 = vortext4261.substring(0,lDollar);
				}
				alleVortexte4261[zaehler4261] = vortext4261;
				zaehler4261++;
			}
		} //Ende der zeilenweisen Prüfung
		//Wenn bei Rezensionen 4261 mehrmals vorkommt, muss das richtige Vorkommnis gewählt werden:
		vortext4261 = alleVortexte4261[vortext4261Nummer];
		kxpUtility.formatD()
		//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
		//Rückgabewerte abhängig von dem Feld:
		switch (feld){
			case "4243":
				// D-A-CH AWR für J.4.2, ÄQUIVALENZBEZIEHUNGEN AUF MANIFESTATIONSEBENE, vgl. 3.4.1.3 D-A-CH
				switch (matCodeQuelle) {
					case "A":
						strFeld_n = "$nDruck-Ausgabe";
						break;
					case "E":
						strFeld_n = "$nMikroform-Ausgabe";
						break;
					case "H":
						strFeld_n = "$nHandschrift";
						break;
					case "K":
						strFeld_n = "$nDruck-Ausgabe";
						break;
					case "M":
						strFeld_n = "$nDruck-Ausgabe";
						break;
					case "O":
						strFeld_n = "$nOnline-Ausgabe";
						break;
					case "S":
						strFeld_n = "$nCD-ROM-Ausgabe";
				}
				return "4243 Erscheint auch als" + strFeld_n + "!" + strPPN + "!";
				break;
			case "4248":
				return "4248 !" + strPPN + "!";
				break;
			case "4249":
				return "4249 !" + strPPN + "!";
				//this.schlussMeldung = this.schlussMeldung + "\nBitte ergänzen Sie den Vortext!";
				break;
			case "4255":
				if (strVorhandenerVortext == ""){
					//Meldung erscheint, wenn neuer Titel angelegt wird und auch, wenn 2 Titel reziprok verlinkt werden sollen.
					strFeld_a = thePrompter.select("Einleitender Text für Feld 4255", "Wählen Sie die Beziehungskennzeichnung für Feld 4255 aus. Diese wird nicht in dem angezeigten, sondern dem anderen Titel eingefügt.",
						"Nachdruck von" +
						"\nNachgedruckt als" +
						"\nFaksimile" +
						"\nFaksimile von" +
						"\nDigitale Übertragung von" +
						"\nDigitale Übertragung"
						);
					//erstmal dies verwenden!!!
					strFeld_a = "Digitale Übertragung von";
					if (!strFeld_a){
						__meldung("Bitte wählen Sie eine gültige Beziehungskennzeichnung für Feld 4255!");
						strFeld_a = "???";
					}
				} else {
					switch (strVorhandenerVortext) {
						case "Nachdruck von":
							strFeld_a = "Nachgedruckt als";
							break;
						case "Nachgedruckt als":
							strFeld_a = "Nachdruck von";
							break;
						case "Faksimile von":
							strFeld_a = "Faksimile";
							break;
						case "Faksimile":
							strFeld_a = "Faksimile von";
							break;
						case "Digitale Übertragung von":
							strFeld_a = "Digitale Übertragung";
							break;
						case "Digitale Übertragung":
							strFeld_a = "Digitale Übertragung von";
							break;
						default:
							strFeld_a = "???";
					}
				}
				return "4255 " + strFeld_a + "!" + strPPN + "!";
				break;
			case "4256":
				switch (matCodeZiel) {
					case "E":
						strFeld_a = "Reproduktion von";
						break;
					case "O":
						strFeld_a = "Elektronische Reproduktion von";
						break;
				}
				//Wenn das Feld ermittelt, dann brauchen wir nicht mehr matCodeZiel zu prüfen!
				if (strFeld_a!=""){
					return "4256 " + strFeld_a + "!" + strPPN + "!";
					break;
				}
				//Beziehungsbezeichnung für Reproduktionen, eingetragen wird es im gegenüber stehenden Datensatz
				switch (matCodeQuelle) {
					case "A":
						strFeld_a = "Elektronische Reproduktion von"; //nur bei VD18 korrekt, weil hier immer elektr. Repr. angelegt werden.
						break;
					case "B":
						strFeld_a = "Elektronische Reproduktion von";
						break;
					case "E":
						strFeld_a = "Reproduziert als"; //Mikroform Reproduktion
						break;
					case "H":
						strFeld_a = "Reproduktion von"; //unklar welcher Text geeignet ist
						break;
					case "O":
						strFeld_a = "Elektronische Reproduktion";
						break;
					case "S":
						strFeld_a = "Elektronische Reproduktion"; //auch hier "Elektronische Reproduktion", nicht "CD-ROM"!
						break;
					case "V":
						strFeld_a = "Elektronische Reproduktion von";
						break;
					default:
						strFeld_a = "???";
						break;
				}
				if (strFeld_a == "???"){
					application.activeWindow.command("s k4256", false);
					application.messageBox("4256 reziprok linken", "Datensätze mit diesem Materialcode können mit der gewünschten Funktion nicht bearbeitet werden." +
						"\nIm anderen Datensatz wird kein Feld 4256 eingefügt!", "error-icon");
					return strFeld_a;//gibt "???" zurück
				} else {
					return "4256 " + strFeld_a + "!" + strPPN + "!";
				}
				break;
			case "4261":
				//hier muss unterschieden werden: Wenn 4261 mit vortext4261 vorkommt, dann wird daraus 4262 gebildet:
				if (!vortext4261){
					return "4261 " + vortextRezension + "!" + strPPN + "!";
				} else {
					switch (vortext4261) {
						case "Rezension von":
							strFeld_i = "Rezensiert in";
							break;
						case "Beschreibung von":
							strFeld_i = "Beschrieben in";
							break;
						case "Analyse von":
							strFeld_i = "Analysiert in";
							break;
						case "Evaluierung von":
							strFeld_i = "Beurteilt in";
							break;
						case "Kommentar zu":
							strFeld_i = "Kommentar in";
							break;
						case "Kritik von":
							strFeld_i = "Kritik in";
							break;
						default:
							strFeld_i = "unbekannter Vortext";
					}
					return "4262 " + strFeld_i + "!" + strPPN + "!";
				}
				break;
		}
	},
	einfuegenBeziehungsfeld: function(feld, strBeziehungsFeld, strPPN){
		var suche;
		var i=0;
		var bBeziehungsfeldVorhanden = false;
		//vorher wurde Kommando "k" abgeschickt
		if (application.activeWindow.status != "OK" ) {
			__fehler("Datensatz kann nicht bearbeitet werden!");
			return;
		}
		//Bei Beziehungsfeld 4256 soll Pos. 3 in 0500 geprüft werden:
		if (feld == "4256" && application.activeWindow.title.findTag("0500", 0, false, false, false).substr(2,1) == "v"){
			strBeziehungsFeld = strBeziehungsFeld + "$AK10plus";
		}
		//Prüft, ob Linkingfeld mit der PPN schon vorkommt
		do {
			//bei Rezensionen wird passend zur 4261 die 4262 gesucht:
			if (feld == "4261"){
				suche = application.activeWindow.title.findTag("4262", i, true, true, true);
			} else {
				suche = application.activeWindow.title.findTag(feld, i, true, true, true);
			}
			if (suche != ""){
				//if (application.activeWindow.title.find("$6" + strPPN, false, true, false) == true){
				if (application.activeWindow.title.find("!" + strPPN + "!", false, true, false) == true){
					bBeziehungsfeldVorhanden = true;
					this.schlussMeldung = ": \nVerlinkung zum ausgewählten Titel ist schon in Feld "+ feld + " vorhanden.";
					break;
				}
				i++;
			}
		} while (suche != "");
		//Ende Prüfung
		if (bBeziehungsfeldVorhanden == true){
			//es wurde kein Feld eingefügt, weil schon vorhanden:
			application.activeWindow.simulateIBWKey ("FE");
		} else {
			//jetzt wird Feld eingefügt:
			application.activeWindow.title.endOfBuffer(false);
			application.activeWindow.title.insertText(strBeziehungsFeld);
			application.activeWindow.simulateIBWKey("FR");
			//Prüfung ob erfolgreich gespeichert:
			if (application.activeWindow.status == "OK" ) {
				this.schlussMeldung = ", ergänzt: \n" + strBeziehungsFeld;
			} else {
				application.activeWindow.simulateIBWKey("FE");
				this.schlussMeldung = ": \n!!! Datensatz konnte wegen einer Fehlermeldung nicht gespeichert werden !!!";
			}
		}
	}
};
//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
function reziprokLinkenFeld4243()
{
	reziprokerLink.ergaenzeBeziehungenStart("4243");
}
function reziprokLinkenFeld4248()
{
	reziprokerLink.ergaenzeBeziehungenStart("4248");
}
function reziprokLinkenFeld4249()
{
	//8.1.20: Neues Script für 4249. Es verwendet keine der übrigen Funktionen dieser Datei.
	var strScreen = application.activeWindow.getVariable("scr");
	if ((strScreen != "7A" && strScreen != "8A") || application.activeWindow.getVariable("P3GSZ") != 2){
		application.messageBox("reziprokLinkenFeld4249","Bitte führen Sie diese Funktion von einem Set mit genau zwei Datensätzen aus!","alert-icon");
		return;
	}
	var nrHole, nrArbeite;
	nrArbeite = application.activeWindow.getVariable("P3LNR");
	if(nrArbeite ==1){
		nrHole=2;
	} else {
		nrHole=1;
	}
	//PPN wird aus dem anderen Datensatz geholt:
	application.activeWindow.command("s " + nrHole, false);
	var strPPN = application.activeWindow.getVariable("P3GPP");
	//ausgewählter Datensatz wird bearbeitet:
	application.activeWindow.command("k " + nrArbeite, false);
	application.activeWindow.title.endOfBuffer(false);
	application.activeWindow.title.insertText("4249 \n!"+strPPN+"!");
	application.activeWindow.title.lineUp(1, false);
	application.activeWindow.title.insertText("XXX");
	application.activeWindow.title.startOfField(false);
	application.activeWindow.title.wordRight(1, false);
	application.activeWindow.title.wordRight(1, true);
	//dies noch überarbeiten!!!
	/*var xulFeatures = "centerscreen, chrome, close, titlebar,resizable, modal=no, dependent=yes, dialog=no";
	__open_xul_dialog("chrome://ibw/content/xul/TableFunctionDlg.xul", xulFeatures);*/
	application.activeWindow.appendMessage ("Speichern Sie diesen Datensatz. Danach rufen Sie den zweiten Datensatz auf und gehen genauso vor.", 3);
}
function reziprokLinkenFeld4255()
{
	reziprokerLink.ergaenzeBeziehungenStart("4255");
}
function reziprokLinkenFeld4256()
{
	//Sonderbehandlung von 4256:
	var strmat = kxpUtility.matCode1();
	var strScreen = application.activeWindow.getVariable("scr");
	if(strScreen == "8A" && (strmat== "B" || strmat== "E" || strmat == "O" || strmat == "S")){
		//Vollanzeige, Material E oder O
		reziprokerLink.ergaenzeBeziehungenStart("4256");
	} else if (strScreen == "7A" && application.activeWindow.getVariable("P3GSZ") == 2) {
		//Kurzanzeige, 2 Datensätze
		reziprokerLink.ergaenzeBeziehungenStart4256("4256");
	} else {
		__fehler(beziehungenFehlerAusgangspunkt);
	}
}
//Hier folgen einige Hilfsfunktionen:
function sprachenLang(strSprache){
	var strSprachelang;
	switch(strSprache){
		case "chi":
			strSprachelang = "chinesisch";
			break;
		case "cze":
			strSprachelang = "Tschechisch";
			break;
		case "ger":
			strSprachelang = "deutsch";
			break;
		case "eng":
			strSprachelang = "englisch";
			break;
		case "fre":
			strSprachelang = "französisch";
			break;
		case "hun":
			strSprachelang = "ungarisch";
			break;
		case "ita":
			strSprachelang = "italienisch";
			break;
		case "lat":
			strSprachelang = "latein";
			break;
		case "pol":
			strSprachelang = "polnisch";
			break;
		case "por":
			strSprachelang = "portugiesisch";
			break;
		case "rus":
			strSprachelang = "russisch";
			break;
		case "spa":
			strSprachelang = "spanisch";
			break;
		case "swe":
			strSprachelang = "schwedisch";
			break;
		default:
			strSprachelang="bitte_Sprache_ergänzen";
			application.messageBox("Reziprok linken in 4248", "Bitte ergänzen Sie per Hand die Sprache in Feld 4248, Unterfeld $n!", "error-icon");
	}
	return "$n"+strSprachelang;
}
//--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
//globale Variable bei hierarchischen Aufnahmen:
var strPPNHierarchischA;
var strPPNHierarchischO;
function holePPNHierarchisch(strLinkingFeld){
	//im angezeigten Datensatz die PPN der übergeordneten Aufnahme holen
	//bei f/F-Sätzen aus 036D, bei s-Sätzen aus 039B
	var strLinkingFeldPlus="";
	kxpUtility.formatP();
	var zeilen = application.activeWindow.copyTitle().split("\n");
	var i;
	var strFeld="";
	var matCode2 = kxpUtility.matCode2();
	strPPNHierarchischA="";
	strPPNHierarchischO="";
	//Suche PPN des übergeordneten Datensatzes:
	for (i=0; i<zeilen.length; i++){
		strFeld = zeilen[i].substring(0,4);
		//bei s-, f-, F-Sätzen:
		if ((strFeld == "039B" && matCode2 == "s") || (strFeld == "036D" && (matCode2 == "f" || matCode2 == "F"))){
			strPPNHierarchischA = feldAnalysePicaPlus(zeilen[i], "9");
		}
	}
	//Suche in einem neuen Fenster:
	application.activeWindow.command("f ppn " + strPPNHierarchischA, true);
	kxpUtility.formatP();
	switch(strLinkingFeld){
		case "4243":
			strLinkingFeldPlus = "039D"
			break;
		case "4248":
			strLinkingFeldPlus = "039M"
			break;
		case "4255":
			strLinkingFeldPlus = "039H"
			break;
		case "4256":
			strLinkingFeldPlus = "039I"
			break;
	}
	var strFeld = application.activeWindow.findTagContent(strLinkingFeldPlus, 0, true);
	strPPNHierarchischO = feldAnalysePicaPlus(strFeld, "9");
	if(strPPNHierarchischO == ""){
		kxpUtility.formatD();//Fenster mit übergeordnetem Satz
		__fehler("Das Script möchte in der übergeordneten Aufnahme aus Feld " +
			strLinkingFeld + " die PPN des verlinkten Datensatzes holen." +
			"\nFeld " + strLinkingFeld + " kommt nicht vor. Bevor Sie fortfahren können, " +
			"verlinken Sie bitte den übergeordneten Satz zur Reproduktion, parallelen Ausgabe oder dergleichen!");
		//Neues Fenster wieder schließen:
		application.activeWindow.closeWindow();
		kxpUtility.formatD();//Fenster mit untergeordnetem Satz
		return false;
	}
	//alert("strPPNHierarchischA: " + strPPNHierarchischA + "\nstrPPNHierarchischO: " + strPPNHierarchischO);
	//Neues Fenster wieder schließen:
	application.activeWindow.closeWindow();
	return true;
}

function hierarchischPPNtauschen(matCode2){
	//bei hierarchischen Aufnahmen: PPN zur übergeordneten Aufnahme tauschen:
	var strLinkFeld="";
	var strLinkString="";
	switch (matCode2){
		case "f":
			strLinkFeld = "4160";
			break;
		case "F":
			strLinkFeld = "4160";
			break;
		case "s":
			strLinkFeld = "4241";
			break;
	}
	application.activeWindow.title.startOfBuffer(false);
	strLinkString = application.activeWindow.title.findTag(strLinkFeld, 0, true, true, true);
	if (strLinkString != ""){
		strLinkString = strLinkString.replace(strPPNHierarchischA, strPPNHierarchischO);
		application.activeWindow.title.insertText(strLinkString);
	}
	//alert(strPPNHierarchischA + "\n" + strPPNHierarchischO)
}
function schriftenreihenLink(strSerie){
	var thePrompter = utility.newPrompter();
	antwort = thePrompter.confirmEx("Frage", "Sollen die Felder 418x mit PPN-Link aus der Vorlage in die "+
		"neue Aufnahme übertragen werden?\n " + strSerie, "Ja", "Nein", "", "", "");
	if(antwort==0){
		//Einfügen an der passenden nummerischen Stelle
		//1-4 = Feld, 6... = Inhalt des Feldes
		kxpUtility.feldEinfuegenNumerisch(strSerie.substr(1,4), strSerie.substr(6), true);
	}
	//temporär ohne Antwort:
	kxpUtility.feldEinfuegenNumerisch(strSerie.substr(1,4), strSerie.substr(6), true);
}

function __einleitenderText(o){
	//alert("Das Ergebnis: " + o.ergebnis)
	return o.ergebnis;
}

function __loescheFeld5xxxDollarA() {
	var regexpFelder = /5[0-9][0-9][0-9]/;
	var n= 0, letzteZeile;
	var zeile="";
	letzteZeile = kxpUtility.letzteZeile();
	for (n=0; n<= letzteZeile; n++) {
		if (regexpFelder.test(application.activeWindow.title.tag)){
			zeile = application.activeWindow.title.currentField;
			if (feldAnalysePicaDrei(zeile, "A")){
				application.activeWindow.title.find("$A", false, true, false);
				application.activeWindow.title.deleteToEndOfLine();
			}
		}
		application.activeWindow.title.endOfField(false);//wichtig bei mehrzeiligen Inhalten!
		application.activeWindow.title.lineDown (1, false);
		application.activeWindow.title.startOfField(false)
	}
}