function picaCopyRecord() {

    if (application.activeWindow.getVariable("scr") == "RF" /* long pres remote */ || application.activeWindow.getVariable("scr") == "RB" /* short pres remote */ ) {
            // external database             
             application.activeWindow.command("\\rem \\too " + gConfig.getFormat(), false);
	} else {
            // cbs database            
            application.activeWindow.command("\\too " + gConfig.getFormat(), false);          
	}
	
	application.activeWindow.copyTitle();

	var matCode = application.activeWindow.materialCode;
	var forceDocType = matCode.substr(0, 2);

	if (gConfig.needSystemSwitch()) {
		application.activeWindow.command("\\sys 1; \\bes 1", false);
	}
	
	application.activeWindow.materialCode = forceDocType;
	
	if (gPicaUtility.isAuthority(matCode)) {
		// insert authority
		application.activeWindow.command("\\inv 2", false);
	} else {
		// insert title
		application.activeWindow.command("\\inv 1", false);
	}
	
	if ((application.activeWindow.status == "OK") && (application.activeWindow.title != null)) {
		application.activeWindow.pasteTitle();
	}
}
