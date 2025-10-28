/**
 * Recursively deserializes a string created by __zdb_serialize_recursive back into its original data structure.
 *
 * @param {string} str The serialized string to parse.
 * @returns {any} The parsed data (object, array, or primitive).
 */
function __zdb_deserialize_recursive(str) {
    if (typeof str !== 'string') {
        return str; // Return non-string values as is
    }

    if (str.length > 1 && str.substring(0, 2) === 'P:') {
        return str.substring(2); // It's a primitive type
    }

    if (str.length > 1 && str.substring(0, 2) === 'A:') {
        var arr = [];
        var parts = str.substring(2).split('@@@');
        for (var i = 0; i < parts.length; i++) {
            arr.push(__zdb_deserialize_recursive(parts[i]));
        }
        return arr;
    }

     if (str.length > 1 && str.substring(0, 2) === 'O:') {
        var obj = {};
        var parts = str.substring(2).split('@@@');
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i].split(':::');
            var key = part[0];
            var value = part[1];
            obj[key] = __zdb_deserialize_recursive(value);
        }
        return obj;
    }

    return str; // Handle other cases or return as is
}


/**
 * Prepare hidden form fields with directory and path values and invoke the backend script to retrieve file content.
 *
 * Ensures a form element accessible via document.getElementsByName('form')[0] exists, then ensures two hidden
 * inputs (id/name 'zdbTheDir' and 'zdbThePath') are present on that form. Sets their values to the provided
 * dir and path arguments, respectively, and finally calls runScript('__zdbGetFileContent') returning its result.
 *
 * Note: This function performs DOM mutations (may create and append hidden inputs) and relies on the presence
 * of a global runScript function. If the expected form or runScript are not present, the function may throw.
 *
 * @param {string} dir - The directory value to be written to the hidden input 'zdbTheDir'.
 * @param {string} path - The path value to be written to the hidden input 'zdbThePath'.
 * @returns {*} The value returned by runScript('__zdbGetFileContent') — type depends on that implementation.
 * @throws {TypeError} If the form element named 'form' is not present (so appendChild will fail).
 * @throws {ReferenceError} If runScript is not defined in the global scope.
 */
function __zdb_getFileContent(dir, path, noComments, noBlanks) {
    if (typeof noComments === 'undefined') noComments = false;
    if (typeof noBlanks === 'undefined') noBlanks = false;
    var form = document.getElementsByName('form')[0];
    var inputDir = document.getElementById('zdbTheDir');
    if (!inputDir) {
        inputDir = document.createElement('input');
        inputDir.type = 'hidden';
        inputDir.id = 'zdbTheDir';
        inputDir.name = 'zdbTheDir';
        form.appendChild(inputDir);
    }
    inputDir.value = dir;

    var inputPath = document.getElementById('zdbThePath');
    if (!inputPath) {
        inputPath = document.createElement('input');
        inputPath.type = 'hidden';
        inputPath.id = 'zdbThePath';
        inputPath.name = 'zdbThePath';
        form.appendChild(inputPath);
    }
    inputPath.value = path;

    var inputNoComments = document.getElementById('zdbNoComments');
    if (!inputNoComments) {
        inputNoComments = document.createElement('input');
        inputNoComments.type = 'hidden';
        inputNoComments.id = 'zdbNoComments';
        inputNoComments.name = 'zdbNoComments';
        form.appendChild(inputNoComments);
    }
    inputNoComments.value = noComments ? '1' : '0';

    var inputNoBlanks = document.getElementById('zdbNoBlanks');
    if (!inputNoBlanks) {
        inputNoBlanks = document.createElement('input');
        inputNoBlanks.type = 'hidden';
        inputNoBlanks.id = 'zdbNoBlanks';
        inputNoBlanks.name = 'zdbNoBlanks';
        form.appendChild(inputNoBlanks);
    }
    inputNoBlanks.value = noBlanks ? '1' : '0';

    return runScript('__zdbGetFileContent');
}