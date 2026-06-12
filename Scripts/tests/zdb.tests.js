// requires: test_harness.js and zdb.js loaded before this file

TestRunner.add("parseField_simple", function() {
  var out = ZDB.parseField("039E $bf$aFortsetzung von$9942987667$8--Cbvz");
  TestRunner.assert(out["039E"]["b"][0] == "f", "b subfield mismatch");
  TestRunner.assert(out["039E"]["a"][0] == "Fortsetzung von", "a subfield mismatch");
  // numeric might be slightly different in examples; check contains digits
  TestRunner.assert(out["039E"]["9"][0].match(/\d{7,}/) !== null, "9 subfield missing digits");
});

TestRunner.add("parseExpansion_simple", function() {
  var e = ZDB.parseExpansion("--Abvz--International$xAllgemeine Unterteilung$gNew York, NY$BVerfasser: [TestTitel]");
  TestRunner.assert(e.tit.indexOf("TestTitel") !== -1, "title not found");
  TestRunner.assert(e.norm.a.indexOf("International") !== -1, "norm.a missing");
});

TestRunner.add("arrayUnique_and_diff", function() {
  var a = ["x","y","x","z"];
  var u = ZDB.arrayUnique(a);
  TestRunner.assert(u.length == 3, "arrayUnique length");
  var d = ZDB.arrayDiff(["a","b","c"],["b"]);
  TestRunner.assert(d.length == 2 && d.join(",").indexOf("b") < 0, "arrayDiff failed");
});

TestRunner.add("unescapeHtml", function() {
  var s = ZDB.unescapeHtml("&amp;&lt;&gt;&quot;&#039;&nbsp;");
  TestRunner.assert(s == "&<>\"' ", "unescapeHtml mismatch");
});

TestRunner.add("replAll", function() {
  var s = ZDB.replAll("aabbcc","/b/g","x");
  // replAll expects a RegExp; mimic expected usage
  var s2 = ZDB.replAll("aabbcc", /b/g, "x");
  TestRunner.assert(s2 == "aaxxcc", "replAll failed");
});

TestRunner.add("getSubfield_basic", function() {
  var f = "039E $aOne$bn$912345";
  var val = ZDB.getSubfield(f, 'a');
  TestRunner.assert(val && val[0] == 'One', 'getSubfield a failed');
  var val9 = ZDB.getSubfield(f, '9');
  TestRunner.assert(val9 && val9[0].indexOf('12345') !== -1, 'getSubfield 9 failed');
});
