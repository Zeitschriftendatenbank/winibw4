/*
    Autorin:	Karen Hachmann
    Konvertiert: ASCII to UTF8
    Datum:	2022.04 alle Funktionen für WinIBW4 angepasst
*/
function f_Satz_mR() {
    // ehemals Aaup
    __Band("f", application.activeWindow.getVariable("P3GPP"));
}

function v_Satz_Zs() {
    // ehemals Avu
    __Band("v", application.activeWindow.getVariable("P3GPP"));
}

function __Band(Bd0500, strPPN) {
    // für WinIBW4 angepasst
    // Führt Prüfungen aus und legt den Band an.
    var strFeld, str1500 = "", str4170 = "", str4180 = "";
    // regulärer Ausdruck für oKat PicaPlus:
    var oRegExpFelderTU = /(\u0192T\d{2}\u0192U\D{4})/;
    var alle4170oKat = new Array();
    var alleSchriften = new Array();
    var alle4005oKat = new Array();
    var i = 0, j = 0, k = 0;
    var feld_a = "", feld_h = "", feld_l = "", feld_p = "";
    var str4005 = "";
    var strTitelFelder;
    var platzhalter = "j000,b,s";
    var strIMD = "";
    // Profil: 0 bedeutet ohne Platzhalter
    if (application.getProfileInt("Bandsatz", "mitPlatzhalter", 0) == 0) {
        platzhalter = "";
    }
    if (__anzeigeKurzVoll() == false) return;
    kxpUtility.formatD();
    var strMat1 = kxpUtility.matCode1();
    if (strMat1 == "T") {
        return;
    }
    // Wenn Bandsatz in der Vollanzeige, wird jetzt eine Kopie ausgeführt:
    if ((kxpUtility.matCode2() == "f" && Bd0500 == "f") ||
        (kxpUtility.matCode2() == "v" && Bd0500 == "v")) {
        __BandKopie();
        return;
    }
    if (kxpUtility.matCode2() != "b" && kxpUtility.matCode2() != "d") {
        application.messageBox("Band", "Bitte prüfen Sie beim angezeigten Datensatz Feld 0500 2. Position!\n" +
            "Ausgangspunkt Eingeben " + Bd0500 + "-Satz: Datensatz mit 0500 2. Position = 'b' oder 'd'.\n" +
            "Ausgangspunkt Kopieren " + Bd0500 + "-Satz: Datensatz mit 0500 2. Position = " + Bd0500, "error-icon");
        return;
    }
    // 0501, 0502, 0503:
    strIMD = setzeIMD(strMat1);
    // Informationen werden aus PicaPlusFormat geholt:
    kxpUtility.formatP();
    var strTitle = application.activeWindow.copyTitle();
    var zeile = strTitle.split("\n");
    // alert(zeile.join())
    for (i = 0; i < zeile.length; i++) {
        strFeld = zeile[i].substr(0, 4);
        // Feld 4000:
        if (strFeld == "021A") {
            if (oRegExpFelderTU.test(zeile[i])) {
                alle4170oKat[j] = holePicaPlusfeld(zeile[i], "T", "$T");
                alle4170oKat[j] += holePicaPlusfeld(zeile[i], "U", "$U");
                alle4170oKat[j] += holePicaPlusfeld(zeile[i], "a", "%%");
                alle4170oKat[j] += holePicaPlusfeld(zeile[i], "e", "$h");
                alle4170oKat[j] += holePicaPlusfeld(zeile[i], "h", "$h");
                alleSchriften[j] = holePicaPlusfeld(zeile[i], "T", "$T") + holePicaPlusfeld(zeile[i], "U", "$U");
                // alert(j + ": " + alle4170oKat[j])
                j++;
            } else {
                str4170 = holePicaPlusfeld(zeile[i], "a", "");
                str4170 += holePicaPlusfeld(zeile[i], "e", "$h");
                str4170 += holePicaPlusfeld(zeile[i], "h", "$h");
            }
        }
        // Feld 4005:
        if (strFeld == "021C") {
            feld_l = holePicaPlusfeld(zeile[i], "l", "");
            feld_a = holePicaPlusfeld(zeile[i], "a", "");
            if (feld_l != "" && feld_a != "") {
                feld_a = ", " + feld_a;
            }
            feld_h = holePicaPlusfeld(zeile[i], "h", "$h");
            str4005 = "$p" + feld_l + feld_a + feld_h;
            // mit oKat_
            if (oRegExpFelderTU.test(zeile[i])) {
                alle4005oKat[k] = str4005;
                k++;
            }
        }
    }
    // UR: ohne
    if (str4005 == "") {
        str4170 += "$l";
        for (i = 0; i < alle4170oKat.length; i++) {
            alle4170oKat[i] += "$l";
        }
    } else {
        // 4170 mit UR
        str4170 += str4005 + "$m";
        for (i = 0; i < alle4170oKat.length; i++) {
            if (alle4005oKat[i]) {
                // wenn für dieses Vorkommnis von 4170 auch 4005 vorkommt, dann $m:
                alle4170oKat[i] += alle4005oKat[i] + "$m";
            } else {
                // wenn für dieses Vorkommnis von 4170 keine 4005 vorkommt, dann $l:
                alle4170oKat[i] += "$l";
            }
        }
    }
    // 4180:
    if (alle4170oKat.length > 0) {
        str4170 = alle4170oKat.join("\n4170 ");
        for (i = 0; i < alle4170oKat.length; i++) {
            str4180 += "\n4180 " + alleSchriften[i] + "%%#" + platzhalter + "#!" + strPPN + "!$l";
        }
    } else {
        str4180 = "\n4180 #" + platzhalter + "#!" + strPPN + "!$l";
    }

    // Informationen werden aus diagnostischem Format geholt:
    kxpUtility.formatD();
    str1500 = application.activeWindow.findTagContent("1500", 0, true);
    if (str1500 != "") {
        str1500 = "\n" + str1500;
    } else {
        str1500 = "\n1500 ";
    }
    // jetzt wird der Titel eingefügt:
    if (Bd0500 == "f" && kxpUtility.matCode2() == "b") {
        strTitelFelder = "0500 " + strMat1 + Bd0500 +
            "\n" + strIMD +
            "\n1100 " +
            str1500 +
            "\n1505 $erda" +
            "\n1700 " +
            "\n2000 " +
            "\n4030 " +
            "\n4060 " +
            "\n4170 " + str4170 +
            str4180 +
            "\n4171 " +
            "\n4181 ##";
    } else if (Bd0500 == "f" && kxpUtility.matCode2() == "d") {
        strTitelFelder = "0500 " + strMat1 + Bd0500 +
            "\n" + strIMD +
            "\n1100 " +
            str1500 +
            "\n1505 $erda" +
            "\n1700 " +
            "\n2000 " +
            "\n4030 " +
            "\n4060 " +
            "\n4170 " + str4170 +
            str4180;
    } else if (Bd0500 == "v") {
        strTitelFelder = "0500 " + strMat1 + Bd0500 +
            "\n" + strIMD +
            "\n1100 " +
            "\n1505 $erda" +
            str1500 +
            "\n2000 " +
            "\n4170 " + str4170 +
            str4180;
    }
    application.activeWindow.command("\\inv t", false);
    if (!application.activeWindow.title) return;
    application.activeWindow.title.insertText(strTitelFelder);
    // Bei O-Aufnahmen ergänzen:
    if (strMat1 == "O") {
        kxpUtility.feldEinfuegenNumerisch("2050", "", true);
        kxpUtility.feldEinfuegenNumerisch("4950", "", true);
    }
    // Profil: 1 bedeutet mit Exemplar, keine Einstellungen = 0
    // wenn nicht auf 0, d.h. auf 1 oder nichts eingestellt:
    if (application.getProfileInt("Bandsatz", "mitEx", 0) == 1) {
        __exemplarmaskeEinfuegen("_fsatz_mR");
    }
    // zum Schluss wird der Cursor hinter Feld 1100 positioniert:
    application.activeWindow.title.startOfBuffer(false);
    application.activeWindow.title.findTag("0500", 0, true, true, true);
    application.activeWindow.title.endOfField(false);
}

function ZDBidnSuchen() {
    /* Ein in der ZDB gefundener Titelsatz soll im anderen Fenster
       in K10plus gesucht werden (bzw. umgekehrt).
       Der Inhalt von Feld 2110 wird kopiert und als Recherche
       in die Kommandozeile geschrieben. */
    var strTitle, str2110 = "";
    if (__anzeigeKurzVoll() == false) return;
    kxpUtility.formatD();
    // Jetzt Datensatz lesen.
    strTitle = application.activeWindow.copyTitle();
    str2110 = application.activeWindow.findTagContent("2110", 0, true);
    str2110 = feldAnalysePicaDrei(str2110, "");
    if (str2110 == "") {
        application.messageBox("ZDB-Nummer suchen",
            "Im angezeigten Datensatz wurde keine ZDB-Nummer gefunden.", "alert-icon");
    } else {
        application.activeWindow.commandLine = "f zdb " + str2110;
    }
}

function __BandKopie() {
    var strTitle = application.activeWindow.copyTitle();
    application.activeWindow.command("\\inv t", false);
    if (application.activeWindow.status != "OK") {
        __fehler("Bitte Fehlermeldung beachten! \nFunktion abgebrochen.");
        return;
    }
    application.activeWindow.pasteTitle();
    if (application.getProfileInt("Bandsatz", "kopieMitEx", 0) == 0) {
        __loescheAlleExemplare();
    }
    loescheVorFeld("0500");
    // Cursor positionieren:
    application.activeWindow.title.findTag("1100", 0, true, true, false);
    application.activeWindow.title.endOfField(false);
}