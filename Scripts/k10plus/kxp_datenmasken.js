/*
* The names of all script-functions must be global unique so that they can be loaded to script-Engine
* (1)
* e.g.
* It might be '__loadFile()' for a number of diloags.
* using '__loadFile_XXXX()' for each dialog, where XXXX is a subject.
* '__loadFile_dataMasks()', '__loadFile_copyMasks()', ....
*
* (2)
* YYYY() and YYYY(o) are not acceptable.
* Using YYYY() and YYYY1(o) instead.
*/

var currentFilename = "";
var dialogTitle = "";
var theFileName = "";
var theFileOutput;
var promptTagName;
var newContents;

/*
* This function is to open 'W4_datenmasken_dialog.html' dialog with position (X, Y) and size (W, H),where X and Y is the start-position and W = width, H = height
* showDialog('HTML-dialog-name', X, Y, W, H);
*/
function Datenmasken_bearbeiten() {
    //showDialog('W4_datenmasken_dialog.html', 200, 10, 650, 440);
    showDialog('ProfD\\Dialogs\\kxp_datenmasken_dialog.html', 200, 10, 400, 240);
    return;
}

/**
 * Attempts to open a data mask file from a set of predefined directories.
 *
 * @param {string} filename - The name of the file to open.
 * @returns {Object|boolean} Returns the file input object if the file is found and opened successfully, otherwise returns false.
 */
function __openDataMaskFile(filename) {
    var theFileInput = utility.newFileInput();
    var paths = [
        "\\datenmasken_eigene\\",
        "\\datenmasken_kxp\\",
        "\\datenmasken_zdb\\"
    ];
    var i;
    for (i = 0; i < paths.length; i++) {
        if (theFileInput.openSpecial("ProfD", paths[i] + filename)) {
            return theFileInput;
        }
    }
    return false;
}

/************ The following functions are used in 'W4_datenmasken_dialog.html' dialog ******************************/
//This function is called from 'W4_datenmasken_dialog.js'
function __loadFileByName_dataMasks(o) {
    try {
        currentFilename = o.idFileList;
        var theFileInput = __openDataMaskFile(currentFilename);

        if (!theFileInput) {
            alert("Datei " + currentFilename + " wurde nicht gefunden.");
            return;
        }
        var theFileContent = "";
        while (!theFileInput.isEOF()) {
            theFileContent += theFileInput.readLine() + "\n";
        }

        theFileInput.close();
        theFileInput = null;
        utility.sentDataToDialog(theFileContent);
    } catch (e) { alert('loadFileByName: ' + e.name + ': ' + e.message); }
}

//This function is called from 'W4_datenmasken_dialog.js'
function __loadFiles_dataMasks() {
    try {
        var arNames = new Array();
        var theDir = getSpecialDirectory("ProfD");
        if (application.activeWindow.getVariable("system") == "ZENTRALKATALOG" || application.activeWindow.getVariable("system") == "ILTIS-APPROVAL") {
            theDir.append("datenmasken_zdb");
        } else {
            theDir.append("datenmasken_kxp");
        }

        if (!theDir.exists()) {
            alert("Die Standard-Datenmasken wurden nicht gefunden.");
            utility.sentDataToDialog("");
            return;
        }

        var theDirEnum = theDir.directoryEntries;
        while (theDirEnum.hasMoreElements()) {
            var theItem = theDirEnum.getNext();
            if (theItem.isFile()) arNames.push(theItem.leafName);
        }

        theDir = getSpecialDirectory("ProfD");
        theDir.append("datenmasken_eigene");
        var found, i;
        if (theDir.exists()) {
            theDirEnum = theDir.directoryEntries;
            while (theDirEnum.hasMoreElements()) {
                var theItem = theDirEnum.getNext();
                if (theItem.isFile()) {
                    found = false;
                    for (i = 0; (i < arNames.length) && !found; i++) {
                        if (arNames[i] == theItem.leafName) {
                            found = true;
                        }
                    }
                    if (!found) arNames.push(theItem.leafName);
                }
            }
        }

        arNames.sort();
        var fileList = "";
        for (i = 0; i < arNames.length; i++) {
            fileList += arNames[i] + "\n";
        }
        utility.sentDataToDialog(fileList);
    } catch (e) { alert('__loadFiles_dataMasks: ' + e.name + ': ' + e.message); }
}

function __DatenmaskeSpeichern(isEditAreaEmpty) {
    try {
        if (currentFilename == "") return false;

        var theDir = getSpecialDirectory("ProfD");
        if (theDir) {
            theDir.append("datenmasken_eigene");
            if (!theDir.exists()) {
                theDir.create("DIRECTORY_TYPE");
                if (!theDir.exists()) {
                    alert("Verzeichnis für Datenmasken konnte nicht erstellt werden!");
                    return false;
                }
            }
        }

        if (isEditAreaEmpty) {
            newContents = "";
        }

        var theFileOutput = utility.newFileOutput();
        theFileOutput.createSpecial("ProfD", "\\datenmasken_eigene\\" + currentFilename);
        theFileOutput.setTruncate(true);
        theFileOutput.write(newContents);

        theFileOutput.close();
        theFileOutput = null;
        return true;
    } catch (e) { alert('** ' + e.name + ': ' + e.message); }
}

function __FrageSpeichern_dataMasks(o) {
    currentFilename = o.idFileList;
    newContents = utility.restoreStringData(o.idFileEdit);

    var prompt = utility.newPrompter();
    if (prompt.confirmEx("Speichern?", "Änderungen in " + currentFilename
        + " speichern?", "Ja", "Nein", "", "", false) == 0) {
        if (__DatenmaskeSpeichern(false)) {
            utility.sentDataToDialog(currentFilename);
            return;
        }
    }
    utility.sentDataToDialog("");
}

function __cmdDatenmaskeFileNew_dataMasks() {
    var prompter = utility.newPrompter();
    dialogTitle = "Neue Datenmaske";
    promptTagName = "Bitte geben Sie einen Namen ein:";

    theFileName = "";
    while (theFileName == "") {
        if (!prompter.prompt(dialogTitle, promptTagName, "", "", "")) {
            utility.sentDataToDialog("");
            return;
        }

        theFileName = prompter.getEditValue();
        if (theFileName == "") {
            utility.sentDataToDialog("");
            return;
        }

        __makeFileNameValid();
        if (__fileExists()) {
            var msg = "Die Datei '" + theFileName + "' besteht bereits. Bitte wählen Sie einen andere Namen.";
            prompter.alert(dialogTitle, msg);
            theFileName = "";
        }
    }
    currentFilename = theFileName;
    if (__DatenmaskeSpeichern(true)) {
        utility.sentDataToDialog(currentFilename);
    } else {
        utility.sentDataToDialog("");
    }
}

function __cmdDatenmaskeFileSaveAs_dataMasks(o) {
    newContents = o.idFileEdit;
    newContents = utility.restoreStringData(newContents);

    var prompter = utility.newPrompter();
    dialogTitle = "Speichern unter";
    promptTagName = "Bitte geben Sie einen Namen ein:";

    theFileName = "";
    while (theFileName == "") {
        if (!prompter.prompt(dialogTitle, promptTagName, "", "", "")) {
            utility.sentDataToDialog("");
            return;
        }

        theFileName = prompter.getEditValue();
        if (theFileName == "") {
            utility.sentDataToDialog("");
            return;
        }

        __makeFileNameValid();
        if (__fileExists()) {
            var msg = "Die Datei '" + theFileName + "' besteht bereits. Bitte wählen Sie einen andere Namen.";
            prompter.alert(dialogTitle, msg);
            theFileName = "";
        }
    }
    currentFilename = theFileName;
    if (__DatenmaskeSpeichern(false)) {
        utility.sentDataToDialog(currentFilename);
    } else {
        utility.sentDataToDialog("");
    }
}

function __cmdDatenmaskeFileDelete_dataMasks(o) {
    currentFilename = o.idFileList;
    if (currentFilename == "") return;

    var theFile = getSpecialDirectory("ProfD");
    theFile.append("datenmasken_eigene");
    theFile.append(currentFilename);
    dialogTitle = "Datei löschen";
    if (theFile.exists()) {
        var prompter = utility.newPrompter();
        if (!prompter.confirm(dialogTitle, "Möchten Sie die Datei '" + currentFilename + "' wirklich löschen?")) {
            utility.sentDataToDialog(false);
            return;
        }
        currentFilename = "";
        utility.sentDataToDialog(theFile.remove());
        return;
    }
    utility.sentDataToDialog(false);
}

function __canDelete_dataMasks(o) {
    var theFile = getSpecialDirectory("ProfD");
    theFile.append("datenmasken_eigene");
    theFile.append(o.idFileList);
    utility.sentDataToDialog(theFile.exists());
}

function __makeFileNameValid() {
    if (theFileName.lastIndexOf(".txt") == -1) {
        theFileName = theFileName + ".txt";
    }
}

function __fileExists() {
    var theFile = getSpecialDirectory("ProfD");
    theFile.append("datenmasken_eigene");
    theFile.append(theFileName);
    return theFile.exists();
}

/*********The functions above are used in 'W4_datenmasken_dialog.html' dialog ******************************/

function __DatenmaskeEinfuegen(maskenName) {
    var theFileInput = utility.newFileInput();
    var thePrompter = utility.newPrompter();
    var antwort, dasKommando = "", kommandoTitel, kommandoNorm;
    var titel;
    kommandoTitel = "\\inv 1";
    kommandoNorm = "\\inv 2";

    theFileInput = __openDataMaskFile(maskenName);

    if (!theFileInput) {
        alert("Datei " + maskenName + " wurde nicht gefunden.");
        return;
    }
    var datenmaskenZeile = "";
    titel = "";
    while (!theFileInput.isEOF()) {
        datenmaskenZeile = theFileInput.readLine() + "\n";
        if (datenmaskenZeile.substr(0, 4) == "0500") {
            dasKommando = kommandoTitel;
        }
        if (datenmaskenZeile.substr(0, 4) == "005 ") {
            dasKommando = kommandoNorm;
        }
        titel += datenmaskenZeile;
    }
    theFileInput.close();
    var editing = (application.activeWindow.title != null);
    if (!editing && dasKommando == "") {
        antwort = thePrompter.select("Feld 0500 / 005 fehlt in Datenmaske", "Wollen Sie Titel- oder Normdaten erfassen?", "Titeldaten\nNormdaten");
        if (!antwort) {
            return;
        }
        if (antwort == "Titeldaten") {
            dasKommando = kommandoTitel;
        } else if (antwort == "Normdaten") {
            dasKommando = kommandoNorm;
        }
    }
    if (dasKommando != "") {
        application.activeWindow.command(dasKommando, editing);
    }
    if (application.activeWindow.title) {
        application.activeWindow.title.insertText(titel);
        application.activeWindow.title.startOfBuffer(false);
        if (application.activeWindow.title.find("++", false, false, false) == true) {
            application.activeWindow.title.deleteSelection();
        }
    } else {
        application.messageBox("Fehler", "Datenmaske kann jetzt nicht eingefügt werden!", "error-icon");
        return;
    }
}

function Datenmaske_Aa_Druckwerk() {
    __DatenmaskeEinfuegen("Aa_Druckwerk.txt");
}
function Datenmaske_Aa_Karten() {
    __DatenmaskeEinfuegen("Aa_Karten.txt");
}
function Datenmaske_Aa_Noten() {
    __DatenmaskeEinfuegen("Aa_Noten.txt");
}
function Datenmaske_Ac_MTM() {
    __DatenmaskeEinfuegen("Ac_MTM.txt");
}
function Datenmaske_Ba() {
    __DatenmaskeEinfuegen("Ba.txt");
}
function Datenmaske_Oa() {
    __DatenmaskeEinfuegen("Oa.txt");
}
function Datenmaske_Sa() {
    __DatenmaskeEinfuegen("Sa.txt");
}
function Datenmaske_Tb_Koerperschaft() {
    __DatenmaskeEinfuegen("Tb_Koerperschaft.txt");
}
function Datenmaske_Tf_Konferenz() {
    __DatenmaskeEinfuegen("Tf_Konferenz.txt");
}
function Datenmaske_Tg_Geografikum() {
    __DatenmaskeEinfuegen("Tg_Geografikum.txt");
}
function Datenmaske_Tk_RVK() {
    __DatenmaskeEinfuegen("Tk_RVK.txt");
}
function Datenmaske_Tn_Name() {
    __DatenmaskeEinfuegen("Tn_Name.txt");
}
function Datenmaske_Tp_Person() {
    __DatenmaskeEinfuegen("Tp_Person.txt");
}
function Datenmaske_Ts_Sachbegriff() {
    __DatenmaskeEinfuegen("Ts_Sachbegriff.txt");
}
function Datenmaske_Ts3e() {
    __DatenmaskeEinfuegen("Ts3e.txt");
}
function Datenmaske_Tu_Werk() {
    __DatenmaskeEinfuegen("Tu_Werk.txt");
}
function Datenmaske_Tu_WerkMusik() {
    __DatenmaskeEinfuegen("Tu_WerkMusik.txt");
}

function __pruefeZDB() {
    var strSystem = application.activeWindow.getVariable("system");
    if (strSystem != "ZENTRALKATALOG" && strSystem != "ILTIS-APPROVAL") {
        application.messageBox("ZDB-Funktionen", strSystem + "\nSie können diese Funktion nur in der ZDB ausführen!", "alert-icon");
    } else {
        return true;
    }
}

function Datenmaske_ZDB_Ab() {
    if (__pruefeZDB()) {
        __DatenmaskeEinfuegen("ZDB_Ab");
    }
}
function Datenmaske_ZDB_Ad() {
    if (__pruefeZDB()) {
        __DatenmaskeEinfuegen("ZDB_Ad");
    }
}
function Datenmaske_ZDB_Ob() {
    if (__pruefeZDB()) {
        __DatenmaskeEinfuegen("ZDB_Ob");
    }
}
function Datenmaske_ZDB_Od() {
    if (__pruefeZDB()) {
        __DatenmaskeEinfuegen("ZDB_Od");
    }
}

function Anwenderdatenmaske01() {
    __DatenmaskeEinfuegen("anwenderdatenmaske01.txt");
}
function Anwenderdatenmaske02() {
    __DatenmaskeEinfuegen("anwenderdatenmaske02.txt");
}
function Anwenderdatenmaske03() {
    __DatenmaskeEinfuegen("anwenderdatenmaske03.txt");
}
function Anwenderdatenmaske04() {
    __DatenmaskeEinfuegen("anwenderdatenmaske04.txt");
}
function Anwenderdatenmaske05() {
    __DatenmaskeEinfuegen("anwenderdatenmaske05.txt");
}
function Anwenderdatenmaske06() {
    __DatenmaskeEinfuegen("anwenderdatenmaske06.txt");
}
function Anwenderdatenmaske07() {
    __DatenmaskeEinfuegen("anwenderdatenmaske07.txt");
}
function Anwenderdatenmaske08() {
    __DatenmaskeEinfuegen("anwenderdatenmaske08.txt");
}
function Anwenderdatenmaske09() {
    __DatenmaskeEinfuegen("anwenderdatenmaske09.txt");
}
function Anwenderdatenmaske10() {
    __DatenmaskeEinfuegen("anwenderdatenmaske10.txt");
}