// requires: test_harness.js and zdb.js loaded before this file
var ZDB;
var TestRunner;
TestRunner.add("parseExpansion_simple", function() {
  var e = ZDB.parseExpansion("--Abvz--International$xAllgemeine Unterteilung$gNew York, NY$BVerfasser: [TestTitel]");
  TestRunner.assert(e.tit.indexOf("TestTitel") !== -1, "title not found");
  TestRunner.assert(e.norm.a.indexOf("International") !== -1, "norm.a missing");
});

TestRunner.add("zdb_replAll", function() {
  var s = ZDB.replAll("aabbcc","/b/g","x");
  // replAll expects a RegExp; mimic expected usage
  var s2 = ZDB.replAll("aabbcc", /b/g, "x");
  TestRunner.assert(s2 == "aaxxcc", "replAll failed");
});

TestRunner.add("zdb_getSubfield_basic", function() {
  var f = "039E $aOne$bn$912345";
  var val = ZDB.getSubfield(f, 'a');
  TestRunner.assert(val && val[0] == 'One', 'getSubfield a failed');
  var val9 = ZDB.getSubfield(f, '9');
  TestRunner.assert(val9 && val9[0].indexOf('12345') !== -1, 'getSubfield 9 failed');
});


TestRunner.add('zdb_getZDB PPN 016569318', function () {
    var ok = TestRunner.runWithKennung('6098', '\\ZOE idn 016569318', 'ZDB getZDB');
    if (!ok) throw { skip: true };
    var z = ZDB.getZDB();
    TestRunner.assertEqual(z, '1127711-7', 'ZDB id mismatch for PPN 016569318');
});