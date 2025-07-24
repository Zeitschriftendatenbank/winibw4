/*
	Autorin:	Karen Hachmann
  Konvertiert: ASCII to UTF8
	Datum:	2022.04
	Verwendet die Linkingfunktionen aus standard_linking.js ergänzt um weitere Features
	gPicaLink umbenannt in gKxpLink, ansonsten gleich
	Ergänzt: freieLinkSuche
*/
var gKxpLink =
 {
	strSerie: "",
	aktuelleSerie: "",
	aktuelleZaehlung: "",
	searchTag: "",
	searchTerm: "",
	bSerie: false,
	szZaehlungHR: "",
	szUnterreihe: "",
	szZaehlungUR: "",
	regexpTranslit: /\$T\d{2}\$U\w{4}%%/,
	regexpTranslit_L: /\$T\d{2}\$U\w{4}\$L\w{3}%%/,
	// search a link; bExact as opposite to truncated
	searchLink:	function(bExact) {
		if (this.initialize() == false) {
			this.cleanup();
			return false;
		}
		this.__searched = true;
		var strMatCode = gPicaUtility.getMaterialType();
		if (strMatCode == "") {
			application.messageBox(gPicaUtility.getMessage("LinkTitle"),
								   gPicaUtility.getMessage("NoDocType"),
								   "error-icon");
			this.cleanup();
			return false;
		}

		if (application.activeWindow.title == null) {
			this.cleanup();
			return false;
		}

		// check if we have a selection
		if (application.activeWindow.title.selection == "") {
			// no selection, select whole field
			application.activeWindow.title.startOfField(false);
			application.activeWindow.title.wordRight(1, false);
			application.activeWindow.title.endOfField(true);
		}
		this.searchTag = application.activeWindow.title.tag;
		this.searchTerm = application.activeWindow.title.selection;

		if (this.pruefung() == false){
			application.messageBox("Suche Link", "Prüfung ergab einen Fehler. Es kann nicht gesucht werden.", "error-icon");
			return;
		}

		var strCommand = gPicaUtility.buildLinkCommand(bExact, strMatCode, this.searchTag + " " + this.searchTerm);
		application.activeWindow.clipboard = strCommand;
		application.activeWindow.command(strCommand, true);
		// check if the command only returned a message
		// if so, cleanup the object, so we can not paste nonsens
		if (application.receivedMessageOnly) {
		  // If no linking is found, return false
			this.restoreWindows();
			this.cleanup();
			return false;
		} else {
		    // if the linking is found, return true
			this.__found = true;
			return true;
		}
	},
	pruefung: function(){
		var regexp418x = /418[0-9]/;
		if (regexp418x.test(this.searchTag) == true) {
			this.bSerie = true;
			if (this.serienPruefung() == false){
				return false;
			}
		}
		if (this.regexpTranslit_L.test(this.searchTerm) == true){
			this.searchTerm = this.searchTerm.substr(17);
		}
		if (this.regexpTranslit.test(this.searchTerm) == true){
			this.searchTerm = this.searchTerm.substr(12);
		}
	},
	serienPruefung: function(){
		var thePrompter = utility.newPrompter();
		var strFeld = application.activeWindow.title.tag;
		var str417x;
		var strSerienTitel1, strSerienZaehlung1;
		var strSerienTitel2, strSerienZaehlung2;
		this.szZaehlungHR = "$l";
		this.szUnterreihe = "$p";
		this.szZaehlungUR = "$m";
		// Sortierzählung eingegeben?
		if (application.activeWindow.title.currentField.indexOf("#") == -1){
			application.messageBox("Suche Link", "Bitte geben Sie zuerst die Sortierzählung in ## ein!", "error-icon");
			return;
		}
		//Vierte Position von 418x:
		strFeld = strFeld.charAt(3);
		strFeld = "417" + strFeld;
		// Inhalt von Feld 417x wird ermittelt:
		str417x = application.activeWindow.title.findTag(strFeld, 0, false, false, false);
		if (str417x == "") {
			application.messageBox("Suche Link", "Feld " + strFeld + " wurde nicht gefunden!", "error-icon");
			return;
		}
		if (this.regexpTranslit.test(str417x) == true){
			str417x = str417x.substring(12);//Unterfelder $T und $U werden abgeschnitten
		}
		//Es wird nicht zwischen 4170 mit unterschiedlichen Schriftcodes unterschieden, d. h. es wird das 1. Vorkommnis gesucht
		//beide Schriftcodes sollen dieselbe Schriftenreihe finden
		var lPosUR = str417x.indexOf(this.szUnterreihe);
		// Serie ohne Unterserie:
		if (lPosUR == -1){
			// Prüfung, ob Serie gezählt:
			if (str417x.indexOf(this.szZaehlungHR) == -1 ){
				application.messageBox("Suche Link", "In Feld " + strFeld + " wurde kein Steuerzeichen '$l' gefunden.\n" +
					"Ohne dieses Zeichen kann die Zählung nicht per Script ermittelt werden.", "error-icon");
				return;
			} else {
				this.holeTitelUndZaehlung(str417x, "HR");
			}
		} else {
			// Serie mit Unterserie
			var strSerie1 = str417x.substring(0, lPosUR);
			this.holeTitelUndZaehlung(strSerie1, "HR");
			strSerienTitel1 = this.aktuelleSerie;
			strSerienZaehlung1 = this.aktuelleZaehlung;

			var strSerie2 = str417x.substring(lPosUR+2);
			this.holeTitelUndZaehlung(strSerie2, "UR");
			strSerienTitel2 = this.aktuelleSerie;
			strSerienTitel2 = strSerienTitel2.replace(/^ /, ""); //führende Blanks entfernen
			strSerienZaehlung2 = this.aktuelleZaehlung;
			// Beide sind gezählt: Haupt- und Unterreihe
			if ((strSerie1.indexOf(this.szZaehlungHR) != -1) && (strSerie2.indexOf(this.szZaehlungUR) != -1)){
				var auswahlSerie = thePrompter.select("Select", "Welche Schriftenreihe möchten Sie suchen?", strSerienTitel1 + "\n" + strSerienTitel2);
				if (!auswahlSerie) {
					return; // Benutzer hat den Dialog abgebrochen
				} else if(auswahlSerie == strSerienTitel1) {
					this.aktuelleSerie = strSerienTitel1;
					this.aktuelleZaehlung = strSerienZaehlung1;
				} else if(auswahlSerie == strSerienTitel2) {
					this.aktuelleSerie = strSerienTitel1 + " " + strSerienTitel2;
					this.aktuelleZaehlung = strSerienZaehlung2;
				}
			}
			else if ((strSerie1.indexOf(this.szZaehlungHR) == -1) && (strSerie2.indexOf(this.szZaehlungUR) == -1)){
				application.messageBox("Suche Link", "In Feld " + strFeld + " wurde weder Steuerzeichen '$l' noch '$m' gefunden.\n" +
					"Ohne diese Zeichen kann die Zählung nicht per Script ermittelt werden.", "error-icon");
				return;
			}
			// Hauptreihe gezählt, UR nicht:
			else if ((strSerie1.indexOf(this.szZaehlungHR) != -1) && (strSerie2.indexOf(this.szZaehlungUR) == -1)){
				this.aktuelleSerie = strSerienTitel1;
				this.aktuelleZaehlung = strSerienZaehlung1;
			}
			// Hauptreihe nicht gezählt. UR gezählt. UR soll mit Hauptreihe gesucht werden.
			else if ((strSerie1.indexOf(this.szZaehlungHR) == -1) && (strSerie2.indexOf(this.szZaehlungUR) != -1)){
				this.aktuelleSerie = strSerienTitel1 + " " + strSerienTitel2;
				this.aktuelleZaehlung = strSerienZaehlung2;
				//application.messageBox("", str417x, "");
			}
		}
		//entferne Zeichen, die die Recherche stören könnten:
		this.aktuelleSerie = this.aktuelleSerie.replace(/\/|\$h|\[|\]|@| - /g," ");
		this.searchTerm = this.aktuelleSerie;
		return true;
	},
	holeTitelUndZaehlung: function(strSerie, typSerie){
		var serienArray = "";
		this.aktuelleSerie = "";
		this.aktuelleZaehlung = "";
		if (typSerie == "HR") {
			serienArray = strSerie.split(this.szZaehlungHR);
		} else {
			serienArray = strSerie.split(this.szZaehlungUR);
		}
		this.aktuelleSerie = serienArray[0];
		this.aktuelleZaehlung = serienArray[1];
		//alert("holeTitelUndZaehlung\nthis.aktuelleSerie: " + this.aktuelleSerie + "\nthis.aktuelleZaehlung: " + this.aktuelleZaehlung);
	},
	freieLinkSuche:	function() {
		//Beginn und Ende wie searchLink
		if (this.initialize() == false) {
			this.cleanup();
			return false;
		}
		this.__searched = true;
		if (application.activeWindow.title == null) {
			this.cleanup();
			return false;
		}
		var strSelection = application.activeWindow.title.selection;
		if (strSelection != "") {
			application.activeWindow.clipboard = strSelection;
		} else{
			//wenn nichts im Datensatz markiert, muss clipboad leer sein, sonst wird der zuletzt gespeicherte Kram verwendet!
			application.activeWindow.clipboard = "";
		}
		showDialog('ProfD\\Dialogs\\kxp_suchBoxFreieLinksuche.html', 100, 100, 350, 125);
		if (application.receivedMessageOnly) {
			this.restoreWindows();
			this.cleanup();
			return false;
		} else {
		    // if the linking is found, return true
			this.__found = true;
			return true;
		}
	},

	// will paste the link if we are valid
	pasteLink:	function () {
		// make sure we searched
		if (!this.__searched) {
			application.messageBox(gPicaUtility.getMessage("LinkTitle"),
								   gPicaUtility.getMessage("MustHaveSearched"),
								   "error-icon");
			return false;
		}

		// make sure we found something
		if (!this.__found) {
			application.messageBox(gPicaUtility.getMessage("LinkTitle"),
								   gPicaUtility.getMessage("MustHaveFound"),
								   "error-icon");
			return false;
		}

		// make sure we do not link to ourselves
		if (application.activeWindow.windowID == this.__activeWindow) {
			application.messageBox(gPicaUtility.getMessage("LinkTitle"),
								   gPicaUtility.getMessage("PasteImpossible"),
								   "error-icon");
			return false;
		}

		var matType = gPicaUtility.getMaterialType();
		var ppn = application.activeWindow.getVariable("P3GPP");
		var fensterSuchergebnis = application.activeWindow.windowID;
		//alert("Ausgangspunkt Linking: " + fensterSuchergebnis)
		application.closeWindow(fensterSuchergebnis);
		application.activateWindow(this.__activeWindow);
		gPicaUtility.insertLink(matType, ppn);

		if (this.bSerie == true){
			//__blanksVorangehendeLoeschen();
			application.activeWindow.title.endOfField(false);
			//alert("this.szZaehlungHR: " + this.szZaehlungHR + "\nthis.aktuelleZaehlung: " + this.aktuelleZaehlung);
			application.activeWindow.title.insertText(this.szZaehlungHR + this.aktuelleZaehlung);
		}
		this.restoreWindows();
		this.cleanup();
		this.__searched = false;
		return true;
	},
	// user decides not to link
	dontPasteLink:	function () {
		application.activateWindow(this.__activeWindow);
		this.restoreWindows();
		this.cleanup();
		this.__searched = false;
		return true;
	},

	initialize: function () {
		this.__found = false;
		this.__searched = false;

		// check if we are editing a record
		if (!application.activeWindow.title) {
			var title = gPicaUtility.getMessage("LinkTitle");
			var msg   = gPicaUtility.getMessage("MustBeEditing");
			application.messageBox(title, msg, "error-icon");
			this.cleanup();
			return false;
		}

		// save the active window
		this.__activeWindow = application.activeWindow.windowID;
		//alert("Ausgangspunkt Suche: " + this.__activeWindow)

		return true;
	},

	restoreWindows: function() {
		application.activateWindow(this.__activeWindow);
	},

	cleanup: function() {
		this.__found = false;
		this.__activeWindow = null;
		//application.closeWindow(this.__activeWindow);
		this.bSerie = false;
	},

	// "private" member for storing our state
	__searched: false,
	__found: false,
	__activeWindow: null
 };

function linkSuchen()
 {
	return gKxpLink.searchLink(false);
 }

function linkSuchenExakt()
 {
	return gKxpLink.searchLink(true);
 }

function linkHerstellen()
 {
	return gKxpLink.pasteLink();
 }

function nichtLinken()
 {
	return gKxpLink.dontPasteLink();
 }

function freieLinksuche()
{
	return gKxpLink.freieLinkSuche(false);
}

