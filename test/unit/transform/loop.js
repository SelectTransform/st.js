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
