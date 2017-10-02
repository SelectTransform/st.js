var assert = require('assert');
var st = require('../../st.js');
var stringify = require('json-stable-stringify');

var compare = function(actual, expected){
  assert.equal(stringify(actual), stringify(expected));
};

describe('resolve', function(){
  it('using subscript', function(){
    var data = {
      "title": "hi",
      "body": {
        "items": ["a", "b"]
      }
    };
    compare(st.Helper.resolve(data, "['title']", "bye"), {
      "title": "bye",
      "body": {
        "items": ["a", "b"]
      }
    });
    compare(st.Helper.resolve(data, "['body']['items'][1]", "c"), {
      "title": "bye",
      "body": {
        "items": ["a", "c"]
      }
    });
  });
});
