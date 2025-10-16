function zdb_DatenmaskeAbxz()
{
     if (__pruefeZDB()) {
         __DatenmaskeEinfuegen("maskeAbxz_zdb.txt");
     }
}


function zdb_DatenmaskeAbxzTr()
{
    __DatenmaskeEinfuegen("\\datenmasken_zdb\\maskeAbxzTr_zdb.txt");
}

function zdb_DatenmaskeObxz()
{
    __DatenmaskeEinfuegen("\\datenmasken_zdb\\maskeObxz_zdb.txt");
}

function zdb_DatenmaskeAdxz()
{
    __DatenmaskeEinfuegen("\\datenmasken_zdb\\maskeAdxz_zdb.txt");
}

function zdb_DatenmaskeOdxz()
{
    __DatenmaskeEinfuegen("\\datenmasken_zdb\\maskeOdxz_zdb.txt");
}

/*function zdb_nutzerMaske() {
    var maskenNr = application.getProfileString("zdb.userdata", "maske", "");
    __DatenmaskeEinfuegen(maskenNr);
}*/