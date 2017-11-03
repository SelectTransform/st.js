var assert = require('assert');
var st = require('../../../st.js');
var stringify = require('json-stable-stringify');
var compare = function(actual, expected){
  assert.equal(stringify(actual), stringify(expected));
};

describe('#each', function(){
  it('correctly runs map function', function(){
    var data = {"items": {"0": {name: "kate", age: "23"}, "1": {name: "Lassie", age: "3"}}};
    var template = {
      "{{#each Object.keys(items).map(function(key){return items[key]})}}": {
        "title": "{{name}}",
        "subtitle": "{{age}}"
      }
    };
    var actual = st.TRANSFORM.run(template, data);
    compare(actual, [{"title": "kate", "subtitle": "23"}, {"title": "Lassie", "subtitle": "3"}]);
  });
  it('correctly returns parsed result when an array is passed', function(){
    var data = {"items": [{name: "kate", age: "23"}, {name: "Lassie", age: "3"}]};
    var template = {
      "{{#each items}}": {
        "title": "{{name}}",
        "subtitle": "{{age}}"
      }
    };
    var actual = st.TRANSFORM.run(template, data);
    compare(actual, [{"title": "kate", "subtitle": "23"}, {"title": "Lassie", "subtitle": "3"}]);
  });
  it('returns original template if the expression is not an array', function(){
    var data = {"items": {name: "kate", age: "23"}, "values": {name: "Lassie", age: "3"}};
    var template = {
      "{{#each items}}": {
        "title": "{{name}}",
        "subtitle": "{{age}}"
      }
    };
    var actual = st.TRANSFORM.run(template, data);
    compare(actual, template);
  });
  describe('#each with index', function() {
    it("primitive", function() {
      var data = {"items": ["a", "b", "c"]}
      var template = {
        "{{#each items}}": {
          "primitive": "{{this}}",
          "index": "{{$index}}"
        }
      };
      var actual = st.TRANSFORM.run(template, data);
      compare(actual, [{"primitive": "a", "index": 0}, {"primitive": "b", "index": 1}, {"primitive": "c", "index": 2}]);
    })
    it("array", function() {
      var data = {"items": [["a"], ["b"], ["c"]]}
      var template = {
        "{{#each items}}": {
          "array": "{{this}}",
          "index": "{{$index}}"
        }
      };
      var actual = st.TRANSFORM.run(template, data);
      compare(actual, [{"array": ["a"], "index": 0}, {"array": ["b"], "index": 1}, {"array": ["c"], "index": 2}]);
    })
    it("object", function() {
      var data = {"items": [{name: "kate", age: "23"}, {name: "Lassie", age: "3"}]};
      var template = {
        "{{#each items}}": {
          "title": "{{name}}",
          "subtitle": "{{age}}",
          "index": "{{$index}}"
        }
      };
      var actual = st.TRANSFORM.run(template, data);
      compare(actual, [{"title": "kate", "subtitle": "23", "index": 0}, {"title": "Lassie", "subtitle": "3", "index": 1}]);
    })
    it("nested array", function() {
      var data = {"items": [["a1", "a2", "a3"], ["b1", "b2", "b3"], ["c1", "c2", "c3"]]}
      var template = {
        "{{#each items}}": {
          "index": "{{$index}}",
          "items": {
            "{{#each this}}": {
              "item": "{{this}}",
              "index": "{{$index}}"
            }
          }
        }
      };
      var actual = st.TRANSFORM.run(template, data);
      var expected = [
        {
          "index": 0,
          "items": [
            { "item": "a1", "index": 0 },
            { "item": "a2", "index": 1 },
            { "item": "a3", "index": 2 }
          ]
        },
        {
          "index": 1,
          "items": [
            { "item": "b1", "index": 0 },
            { "item": "b2", "index": 1 },
            { "item": "b3", "index": 2 }
          ]
        },
        {
          "index": 2,
          "items": [
            { "item": "c1", "index": 0 },
            { "item": "c2", "index": 1 },
            { "item": "c3", "index": 2 }
          ]
        }
      ];
      compare(actual, expected);
    })
    it('use with #merge', function() {
      var template = {
        "users": {
          "{{#each $root.$get.users}}": {
            "{{#merge}}": [
              "{{this}}",
              { "balance": "{{$root.$jason[$index]}}" , "index": "{{$index}}" }
            ]
          }
        }
      };
      var data = {
        "$get": {
          "users": [{
            "id": "0xdef",
            "username": "Alice"
          }, {
            "id": "0xabc",
            "username": "Bob"
          }]
        },
        "$jason": [100, 58]
      }
      var actual = st.TRANSFORM.transform(template, data);
      compare(actual, {
        "users": [{
          "id": "0xdef",
          "username": "Alice",
          "balance": 100,
          "index": 0
        }, {
          "id": "0xabc",
          "username": "Bob",
          "balance": 58,
          "index": 1
        }]
      })
    });
  });
  /*
  it('#each with $index', function() {
    var data = {"items": ['a','b','c','d']};
    var template = {
      "{{#each items}}": {
        "char": "{{this}}",
        "index": "{{$index}}"
      }
    };
    var actual = st.TRANSFORM.run(template, data);
    console.log(actual);
    //compare(actual, template);
    
  })
  */
});
