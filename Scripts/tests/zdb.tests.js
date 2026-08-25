// requires: test_harness.js and zdb.js loaded before this file
var ZDB;
var TestRunner;
TestRunner.add("parseExpansion_simple", function() {
  var e = ZDB.parseExpansion("--Abvz--International$xAllgemeine Unterteilung$gNew York, NY$BVerfasser: [TestTitel]");
  TestRunner.assert(e.tit.indexOf("TestTitel") !== -1, "title not found");
  TestRunner.assert(e.norm.a.indexOf("International") !== -1, "norm.a missing");
});

TestRunner.add("zdb_parseExpansion_bracketed_title_and_norm", function() {
  var e = ZDB.parseExpansion("--Abvz--International Legal Center$xAllgemeine Unterteilung$gNew York, NY$BVerfasser: [TestBr]");
  TestRunner.assert(e.tit && e.tit.indexOf("TestBr") !== -1, "bracketed title missing");
  TestRunner.assert(e.norm && e.norm.a && e.norm.a.indexOf("International") !== -1, "norm.a missing");
  TestRunner.assert(e.norm && e.norm.x && e.norm.x.indexOf("Allgemeine") !== -1, "norm.x missing");
  TestRunner.assert(e.norm && e.norm.g && e.norm.g.indexOf("New York") !== -1, "norm.g missing");
  TestRunner.assert(e.norm && e.norm.B && e.norm.B.indexOf("Verfasser") !== -1, "norm.B missing");
});

TestRunner.add("zdb_parseExpansion_unbracketed_title_and_norm", function() {
  var e = ZDB.parseExpansion("--Abvz--International Legal Center$xAllgemeine Unterteilung$gNew York, NY$BVerfasser: Adreß- und Geschäftshandbuch für den k[öniglich] b[ayerischen] Markt");
  TestRunner.assert(e.tit && e.tit.indexOf("Adreß-") !== -1, "unbracketed title missing");
  TestRunner.assert(e.norm && e.norm.a && e.norm.a.indexOf("International") !== -1, "norm.a missing");
});

TestRunner.add("zdb_parseExpansion_only_bracketed_title", function() {
  var e = ZDB.parseExpansion("--Abvz--: [OnlyTitle]");
  TestRunner.assert(e.tit === "OnlyTitle", "only bracketed title mismatch");
  TestRunner.assert(!e.norm, "norm should be undefined");
});

TestRunner.add("zdb_parseExpansion_no_match", function() {
  var e = ZDB.parseExpansion("no marker here");
  TestRunner.assert(typeof e === 'object', "should return object");
  // avoid Object.keys for compatibility; check for any own property
  var hasProp = false;
  for (var k in e) { if (Object.prototype.hasOwnProperty && Object.prototype.hasOwnProperty.call(e, k)) { hasProp = true; break; } }
  TestRunner.assert(hasProp === false, "should be empty object for no match");
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
    var ok = TestRunner.runWithKennung('pica3://ibw0.dnb.de:1042', '6098', '\\ZOE idn 016569318', 'ZDB getZDB');
    if (!ok) throw { skip: true };
    var z = ZDB.getZDB();
    TestRunner.assertEqual(z, '1127711-7', 'ZDB id mismatch for PPN 016569318');
});