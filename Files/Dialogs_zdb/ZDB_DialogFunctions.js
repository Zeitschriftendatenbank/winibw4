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