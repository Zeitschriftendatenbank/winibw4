/*************************************************************************************************
 * 
 *	This file contains more untilities for scripting in WinIBW4
 *
 *************************************************************************************************/
var utility = {
	newFileInput: function () {
		return new __oFileInput();
	},

	newFileOutput: function () {
		return new __oFileOutput();
	},

	newPrompter: function () {
		return new __oPrompter();
	},

	messages: function () {
		return new __oMessages();
	},
		
	sentDataToDialog: function(data) {
		sentDataToDialog(data);
	},

	restoreStringData: function (data) {
		return (data == undefined || data == null || data == "") ? "" : data.replace(/QQQQQQQQQQ/g, "\n");
    }
}

getSpecialDirectory = function (theDirName) {
	return new __oFileSystem(theDirName, 1);              //1 is for 'getSpecialDirectory'
}

getSpecialPath = function (theDirName, theRelativePath) {
	return getPathOfSpecialFile(theDirName, theRelativePath);
}

function __oFileInput() {
	this.open = function (fNameFullPath) {
		return openFile(fNameFullPath);
	}

	this.openSpecial = function (theDirName, theRelativePath) {
		return openSpecialFile(theDirName, theRelativePath);
	}

	this.openViaGUI = function (dialogTitle, initialPath, defaultName, aFilter,	theFilterName) {
		return openFileViaGUI(dialogTitle, initialPath, defaultName, aFilter, theFilterName);
	}

	this.readLine = function () {
		return getLine();
	}

	this.isEOF = function () {
		return isEndOfFile();
	}

	this.getPath = function () {
		return getPathOfFile(1);    //1 is for inputFile
	}

	this.close = function () {
		closeFile(1);              //1 is for inputFile
	}

	this.remove = function () {
		return removeFile(1);      //1 is for inputFile
	}
}

function __oFileOutput() {
	this.create = function(fNameFullPath) {
		return createAndOpenFile(fNameFullPath);
	}

	this.createSpecial = function (theDirName, theRelativePath) {
		return createSpecialFile(theDirName, theRelativePath);
	}

	this.createViaGUI = function (dialogTitle, initialPath, defaultFileName, aFilter, theFilterName) {
		return createFileViaGUI(dialogTitle, initialPath, defaultFileName, aFilter, theFilterName);
	}

	this.setTruncate = function (truncate) {
		setTruncateMode(truncate);
	}

	this.writeLine = function(line) {
		return writeOneLine(line);
	}

	this.write = function (contents) {
		return writeToFile(contents);
	}

	this.getPath = function () {
		return getPathOfFile(2);      //2 is for outputFile
	}	

	this.close = function() {
		closeFile(2);                 //2 is for outputFile
	}

	this.remove = function () {
		return removeFile(2);         //2 is for outputFile
	}
}

function __oPrompter() {
	this.alert = function (title, message) {
		popUpAlert(title, message);
	}

	this.confirm = function (title, text) {
		return showConfirm(title, text, 'question-icon');
	}
	
	this.confirmEx = function (title, text, button0, button1, button2, checkMag, defaultCheck) {
		return showConfirmEx(title, text, button0, button1, button2, checkMag, defaultCheck);
	}
	
	this.prompt = function (title, text, value, checkMag, defaultCheck) {
		return showPrompt(title, text, value, checkMag, defaultCheck);
	}

	this.select = function (title, text, list) {
		return showSelectDLG(title, text, list);
	}

	this.getEditValue = function () {
		return getEditVal();
	}

	this.getCheckValue = function () {
		return getCheckVal();
	}
}

function __oFileSystem(name, createType) {
	this.id = createFileSystemProcessor(name, createType);

	this.append = function (node) {
		appendNode(node, this.id);
	}

	this.create = function (type) {
		createNode(type, this.id);
	}

	this.createUnique = function (type) {
		createUniqueNode(type, this.id);
	}

	this.clone = function () {
		var nodeName = getNodeName(this.id);
		return new __oFileSystem(nodeName, 2);           //2 is for 'clone'
	}

	this.exists = function () {
		return nodeExists(this.id);
	}

	this.isFile = function () {
		return isNodeFile(this.id);
	}

	this.remove = function () {
		removeNode(this.id);
	}

	this.release = function () {
		deleteFileSystemProcessor(this.id);
	}

	this.directoryEntries = new __oDirectoryEntries(this.id);
}

function __oDirectoryEntries(id) {
	this.hasMoreElements = function () {
		return hasMoreEntries(id);
	}

	this.getNext = function () {
		return new __oNextElement(id);
	}
}

function __oNextElement(id) {
	this.leafName = getLeafNameOfEntry(id);
	this.path = getPathOfEntry(id);
	moveToNextEntry(id);                //this has to be after this.leafName and this.path

	this.isFile = function () {
		return isEntryFile(id);
	}

	this.isDirectory = function () {
		return isEntryDirectory(id);
	}

	this.remove = function () {
		removeEntry(id);
	}
}

function __oMessages() {
	this.count = messagesCount();	

	this.item = function(ind) {
		return new __oMessageObj(ind);
    }
}

function __oMessageObj(ind) {
	this.text = messageText(ind);
	this.type = messageType(ind);
}