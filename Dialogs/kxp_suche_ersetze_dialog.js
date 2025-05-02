var tabContents, tabLinks;
var bContentsChanged = false;
var regexpExxx = /^E[0-9][0-9][0-9]$/;

function openTab(evt, tabName) {
	//Aufruf in html: openTab(event, 'idTabEins')
	var i;
	if (bContentsChanged == true){
		var strAntwort = runScript('__frageTabWechsel()');
		//0 = nein, bleiben / 1 = ja, alles Löschen
		if (strAntwort == "0"){
			return;
		} else {
			allesZuruecksetzen();
		}
	}
	tablinks = document.getElementsByClassName("tablinks");
	for (i = 0; i < tabLinks.length; i++) {
		tabLinks[i].className = tabLinks[i].className.replace(" active", "");
	}
	tabContents = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabContents.length; i++) {
		tabContents[i].style.display = "none";
	}
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
	switch(tabName){
		case "idTabEins":
			document.getElementById("idSuche").focus();
			document.getElementById("idButtonStart").value = "Ersetzen"
			break;
		case "idTabZwei":
			document.getElementById("idWennFeld").focus();
			document.getElementById("idButtonStart").value = "Ergaenzen"
			break;
		case "idTabDrei":
			document.getElementById("idLoescheFeld").focus();
			document.getElementById("idButtonStart").value = "Loeschen"
			break;
	}
}
function onLoad(){
	tabLinks = document.getElementsByClassName("tablinks");
	//erster Tab wird aktiviert:
	document.getElementById('idButtonTabEins').click();
	////document.getElementById('idTabEins').style.display = "block"; //wird nicht gebraucht
	document.getElementById("idSuche").focus();
	setGroesse();
	//nicht alle ELN dürfen die 3. Registerkarte sehen:
	var oRegExpELN = new RegExp("1999|2012|2013|7777");
	// WinIBW4 kann die Variable libID nicht lesen
	if (oRegExpELN.test(getValueOfVariable("P3GUL")) == false){
		document.getElementById("idButtonTabDrei").hidden = true;
	}
	//meinTest0();
}
function setGroesse(){
	var lSetsize = getValueOfVariable("P3GSZ");
	document.getElementById("idHinweisSetsize").style.color = 'green';
	document.getElementById("idHinweisSetsize").innerHTML = "Setgröße: " + lSetsize + "&nbsp;&nbsp;&nbsp;&nbsp;";
}
function meinTest0(){
	document.getElementById("idSuche").value = "2022";
	document.getElementById("idErsetze").value = "202222";
	document.getElementById("idFeldErstes").value = "7100";
}
function meinTest2(){
	//zum Testen soll der 2. Tab ausgefüllt sein
	document.getElementById("idButtonTabZwei").click();
	document.getElementById("idWennFeld").value = "7100";
	document.getElementById("idWennText").value = "$a123";
	document.getElementById("idDannFeld").value = "8100";
	document.getElementById("idDannText").value = "test";
}
function onAccept(){
	closeDialog();
}
function onCancel() {
	closeDialog();
}

function starteAktion(){
	setGroesse();
	var aktion = document.getElementById("idButtonStart").value;
	var strErgebnis;
	var pruefung = true;
	document.getElementById("idErgebnis").hidden = true;
	switch (aktion){
		case "Ersetzen":
			pruefung = pruefeFormularErsetzen();
			break;
		case "Ergaenzen":
			pruefung = pruefeFormularErgaenzen();
			break;
		case "Loeschen":
			pruefung = pruefeFormularLoeschen();
			break;
	}
	if (pruefung == false){
		return;
	} else {
		//alert ("Prüfung: " + pruefung);return;
		//nach dem Aufruf des Scriptes stürzt WinIBW ab
		strErgebnis = runScript('sucheErsetzeDialogStart');
		if (strErgebnis != ""){
			document.getElementById("idErgebnis").hidden = false;
			document.getElementById("idPfad").innerText = strErgebnis;
		}
	}
}

function pruefeFormularErsetzen(){
	var warnungFormular=""
	if (document.getElementById("idSuche").value.length == 0){
		document.getElementById("idSuche").style.backgroundColor = 'orange';
		document.getElementById("idSuche").focus();
		warnungFormular = "\n'Suche' ist leer!";
	} else {
		document.getElementById("idSuche").style.backgroundColor = 'white';
	}

	var strFeldErstes = document.getElementById("idFeldErstes").value;
	if ((strFeldErstes.length != 4 && strFeldErstes.length != 3) || (isNaN(strFeldErstes) && regexpExxx.test(strFeldErstes) == false)){
		document.getElementById("idFeldErstes").style.backgroundColor = 'orange';
		document.getElementById("idFeldErstes").focus();
		warnungFormular = warnungFormular + "\nIn 'von Feld' muss eine 3- oder 4-stellige Ziffer eingetragen werden!";
	} else {
		document.getElementById("idFeldErstes").style.backgroundColor = 'white';
	}

	//Feld ist nicht obligatorisch. Wenn vorhanden, dann muss die Länge 4 sein:
	var strFeldLetztes = document.getElementById("idFeldLetztes").value;
	if (strFeldLetztes != "" && strFeldErstes.length != strFeldLetztes.length){
		warnungFormular = warnungFormular + "\nLänge der beiden Felder uneinheitlich!\n" + strFeldErstes  + "/" + strFeldLetztes;
	}
	if (strFeldLetztes != "" && ((strFeldLetztes.length != 3 && strFeldLetztes.length != 4) || isNaN(strFeldLetztes))){
		document.getElementById("idFeldLetztes").style.backgroundColor = 'orange';
		document.getElementById("idFeldLetztes").focus();
		var lStellen = strFeldErstes.length;
		warnungFormular = warnungFormular + "\nIn 'bis Feld' tragen Sie bitte eine " + lStellen + "-stellige Ziffer ein!\n";
	} else if (strFeldLetztes != "" && strFeldLetztes <= strFeldErstes){
		document.getElementById("idFeldLetztes").style.backgroundColor = 'orange';
		document.getElementById("idFeldLetztes").focus();
		warnungFormular = warnungFormular + "\n'bis Feld' muss größer als 'von Feld' sein!\n";
	} else {
		document.getElementById("idFeldLetztes").style.backgroundColor = 'white';
	}
	if (document.getElementById("idErsetze").value.length == 0){
		//noch zu klären, ob einzelne Kennungen Text löschen dürfen, also Ersetzefeld leer sein darf
		document.getElementById("idErsetze").focus();
		warnungFormular = "Feld 'Ersetze' ist leer! Ersetzung wird nicht ausgeführt.";
	}
	if (warnungFormular!= ""){
		alert(warnungFormular)
		return false;
	} else {
		return true;
	}
}

function pruefeFormularErgaenzen(){
	var bFehler = false;
	if (document.getElementById("idWennFeld").value.length == 0){
		document.getElementById("idWennFeld").style.backgroundColor = 'orange';
		bFehler = true;
	}
	if (document.getElementById("idWennText").value.length == 0 ){
		document.getElementById("idWennText").style.backgroundColor = 'orange';
		bFehler = true;
	}
	if (document.getElementById("idDannFeld").value.length == 0 ){
		document.getElementById("idDannFeld").style.backgroundColor = 'orange';
		bFehler = true;
	}
	if (document.getElementById("idDannText").value.length == 0 ){
		document.getElementById("idDannText").style.backgroundColor = 'orange';
		bFehler = true;
	}
	if (bFehler == true){
		alert("Bitte alle 4 Felder ausfüllen!")
		return false;
	}
}

function pruefeFormularLoeschen(){
	var bFehler = false;
	if (document.getElementById("idLoescheFeld").value.length == 0){
		document.getElementById("idLoescheFeld").style.backgroundColor = 'orange';
		bFehler = true;
	}
	if (document.getElementById("idLoescheText").value.length == 0 ){
		document.getElementById("idLoescheText").style.backgroundColor = 'orange';
		bFehler = true;
	}
	if (bFehler == true){
		alert("Bitte beide Felder ausfüllen!")
		return false;
	}
}
//------------------------------------------

function allesZuruecksetzen(){
	document.getElementById("idErgebnis").hidden = true;
	lAlle = document.getElementsByTagName('input').length;
	for (var i=0; i < lAlle; i++){
		document.getElementsByTagName('input')[i].value = "";
		document.getElementsByTagName('input')[i].checked = false;
		document.getElementsByTagName('input')[i].style.backgroundColor = 'white'
	}
	bContentsChanged = false;
}