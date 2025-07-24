/*
	Autorin:	Karen Hachmann
	Konvertiert: ASCII to UTF8
	Datum:	2022.09
*/
function isbnScanSuche()
{
	//Anwender scannen ISBN
	//ISBN wird in Kommandozeile eingefügt und gesucht
	if (application.CommandLine() != ""){
		var strSuche = "f isb " + application.CommandLine();
		application.activeWindow.command(strSuche, false);
		//hier nochmal einfügen, damit sichtbar:
		application.activeWindow.commandLine = "";
	} else {
		__fehler("Bitte scannen Sie zuerst die ISBN. \nDanach führen Sie diese Funktion für die Suche der ISBN aus.")
	}
}