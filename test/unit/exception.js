var assert = require('assert');
var st = require('../../st.js');
var stringify = require('json-stable-stringify');

var compare = function(actual, expected){
  assert.equal(stringify(actual), stringify(expected));
};

describe('JSON.stringify', function(){
  it("the overridden JSON.stringify must be reverted back before returning", function() {
    var before = JSON.stringify.toString();
    var result = st.transform({
      "label": "{{text}}"
    }, {
      "text": "hi"
    })
    var sample_json = JSON.stringify({
      "key": "{{this}}"
    })
    var after = JSON.stringify.toString();
    compare(before, after);
  })
})
