var assert = require('assert');
var st = require('../../../st.js');
var stringify = require('json-stable-stringify');

var compare = function(actual, expected){
  assert.equal(stringify(actual), stringify(expected));
};

// #merge 
// merges attributes from all objects in an array into a single object

describe('merge', function(){
  it('static item + static item', function() {
    var data = {
    };
    var template = {
      "{{#merge}}": [
        {
          "type": "label",
          "text": "Hello"
        },
        {
          "style": {
            "align": "center",
            "size": "15"
          },
          "action": {
            "type": "$render"
          }
        }
      ]
    };
    var actual = st.TRANSFORM.transform(template, data);
    var expected = {
      "type": "label",
      "text": "Hello",
      "style": {
        "align": "center",
        "size": "15"
      },
      "action": {
        "type": "$render"
      }
    }
    compare(actual, expected);
  })
  
  it('dynamic item + dynamic item', function() { 
    var data = {
      numbers: [1,2,3],
      align: "right",
      size: "14"
    };
    var template = {
      "{{#merge}}": [
        {
          "type": "label",
          "text": "Length: {{numbers.length}}"
        },
        {
          "style": {
            "align": "{{align}}",
            "size": "{{size}}"
          },
          "action": {
            "type": "$render"
          }
        }
      ]
    };
    var actual = st.TRANSFORM.transform(template, data);
    var expected = {
      "type": "label",
      "text": "Length: 3",
      "style": {
        "align": "right",
        "size": "14"
      },
      "action": {
        "type": "$render"
      }
    }
    compare(actual, expected);
  });
});
