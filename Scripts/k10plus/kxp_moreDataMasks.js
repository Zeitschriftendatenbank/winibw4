/*
*	The function 'runScript' is defined in the 'W4DialogFunctions.js' file.
*   The 'W4DialogFunctions.js' file is included in 'W4_exemplarmasken_dialog.html'.
*   Therefore, the 'W4DialogFunctions.js' file must be in the same location as 'W4_moreDataMasks_dialog.html'
*
*   There are a number of functions in the 'W4DialogFunctions.js' file. These functions can be used in the dialogs to co-operate with WinIBW4.
*/

/*
* This function is to open 'W4_moreDatenmasken_dialog.html' dialog with position (X, Y) and size (W, H),where X and Y is the start-position and W = width, H = height
* showDialog('HTML-dialog-name', X, Y, W, H);
*/
function Datenmasken_Gesamtauswahl() {
    //showDialog('W4_moreDatenmasken_dialog.html', 350, 0, 260, 270);
    showDialog('ProfD\\Dialogs\\kxp_moreDatenmasken_dialog.html', 350, 0, 260, 270);
}

/************ The following functions are used in 'W4_moreDatenmasken_dialog.html' dialog ******************************/
//This function is callled from 'W4_moreDatenmasken_dialog.js'
//----------------------------------------------------------------------------
function __loadFiles_moreDataMasks() {
	try {
		var arNames = new Array(); // Array to store the names of the files in the list

		// Get the user's datamasken:
		var theDir = getSpecialDirectory("ProfD");
		theDir.append("datenmasken_eigene");
		var found;
		var i;
		var theDirEnum;
		if (theDir.exists()) {
			theDirEnum = theDir.directoryEntries;
			while (theDirEnum.hasMoreElements()) {
				var theItem = theDirEnum.getNext();
				if (theItem.isFile()) {
					for (found = false, i = 0; (i < arNames.length) && !found; i++) {
						found = (arNames[i] == theItem.leafName);
					}
					if (!found) arNames.push(theItem.leafName);
				}
			}
		}

		// Get the standard datamasken:
		//theDir = getSpecialDirectory("BinDir");
		getSpecialDirectory("ProfD");
		//theDir.append("defaults");
		theDir.append("datenmasken_kxp");
		if (theDir.exists()) {
			theDirEnum = theDir.directoryEntries;
			while (theDirEnum.hasMoreElements()) {
				var theItem = theDirEnum.getNext();
				if (theItem.isFile()) {
					for (found = false, i = 0; (i < arNames.length) && !found; i++) {
						found = (arNames[i] == theItem.leafName);
					}
					if (!found) arNames.push(theItem.leafName);
				}
			}
		}


		// sort the file names
		arNames.sort();

		var fileList = "";
		for (var i = 0; i < arNames.length; i++) {
			fileList += arNames[i] + "\n";
		}

		utility.sentDataToDialog(fileList);
	} catch (e) { alert('LoadFiles: ' + e.name + ': ' + e.message); }
}

var currentFilename;
//This function is callled from 'W4_moreDatenmasken_dialog.js'
function __selectFile_moreDataMasks(o) {
	currentFilename = o.idFileList;
	var theFile = getSpecialDirectory("ProfD");
	theFile.append("datenmasken_eigene");
	theFile.append(currentFilename);
	if (!theFile.exists()) {
		//var theFile = getSpecialDirectory("BinDir");
		var theFile = getSpecialDirectory("ProfD");
		theFile.append("datenmasken_kxp");
		theFile.append(currentFilename);
		if (!theFile.exists()) {
			alert("Datei" + currentFilename + " wurde nicht gefunden.");
		}
	}
}

//This function is called from 'W4_moreDatenmasken_dialog.js'
function __MoreDatenmaskeEinfuegen_moreDataMasks() {
	__DatenmaskeEinfuegen(currentFilename);
}
