var assert = require('assert');
var st = require('../../../st.js');
var stringify = require('json-stable-stringify');

var compare = function(actual, expected){
  assert.equal(stringify(actual), stringify(expected));
};

// TODO: #concat
// #concat [a,b]= [a,b]
// #concat [a,[b,c]]= [a,b,c]
// #concat [[b,c],d]= [b,c,d]
// #concat [a,[b,c],d]= [a,b,c,d]
// #concat [[a,b],[c,d]]= [a,b,c,d]

describe('concat', function(){
  it('concat should only trigger if all of its children successfully parses', function() {
    var data = {
      numbers: [1,2,3,4,5]
    }
    var template = {
      "items": {
        "{{#concat}}": [
          {
            "type": "label",
            "text": "header"
          },
          {
            "{{#each numbers}}": {
              "type": "label",
              "text": "{{item}}"
            }
          }
        ]
      }
    }
    var actual = st.TRANSFORM.transform(template, data);
    compare(actual, template);
  })
  it('item + array', function() { 
    var data = {
      numbers: [1,2,3,4,5]
    };
    var template = {
      "items": {
        "{{#concat}}": [
          {
            "type": "label",
            "text": "header"
          },
          {
            "{{#each numbers}}": {
              "type": "label",
              "text": "{{this}}"
            }
          }
        ]
      }
    };
    var actual = st.TRANSFORM.transform(template, data);
    var expected = {
      items: [{
        "type": "label",
        "text": "header"
      }, {
        "type": "label",
        "text": 1
      }, {
        "type": "label",
        "text": 2
      }, {
        "type": "label",
        "text": 3
      }, {
        "type": "label",
        "text": 4
      }, {
        "type": "label",
        "text": 5
      }]
    }
    compare(actual, expected);
  });
  it('item + item', function() { 
    var data = {
      numbers: [1,2,3,4,5]
    };
    var template = {
      "items": {
        "{{#concat}}": [
          {
            "type": "label",
            "text": "header"
          },
          {
            "type": "label",
            "text": "{{numbers.toString()}}"
          }
        ]
      }
    };
    var actual = st.TRANSFORM.transform(template, data);
    var expected = {
      items: [{
        "type": "label",
        "text": "header"
      }, {
        "type": "label",
        "text": "1,2,3,4,5"
      }]
    }
    compare(actual, expected);
  });
  it('array + item', function() { 
    var data = {
      numbers: [1,2,3,4,5]
    };
    var template = {
      "items": {
        "{{#concat}}": [
          {
            "{{#each numbers}}": {
              "type": "label",
              "text": "{{this}}"
            }
          },
          {
            "type": "label",
            "text": "header"
          }
        ]
      }
    };
    var actual = st.TRANSFORM.transform(template, data);
    var expected = {
      items: [{
        "type": "label",
        "text": 1
      }, {
        "type": "label",
        "text": 2
      }, {
        "type": "label",
        "text": 3
      }, {
        "type": "label",
        "text": 4
      }, {
        "type": "label",
        "text": 5
      }, {
        "type": "label",
        "text": "header"
      }]
    }
    compare(actual, expected);
  });
  it('array + array', function() { 
    var data = {
      numbers: [1,2,3,4,5]
    };
    var template = {
      "items": {
        "{{#concat}}": [
          {
            "{{#each numbers}}": {
              "type": "label",
              "text": "{{this}}"
            }
          },
          {
            "{{#each numbers}}": {
              "type": "label",
              "text": "{{this}}"
            }
          }
        ]
      }
    };
    var actual = st.TRANSFORM.transform(template, data);
    var expected = {
      items: [{
        "type": "label",
        "text": 1
      }, {
        "type": "label",
        "text": 2
      }, {
        "type": "label",
        "text": 3
      }, {
        "type": "label",
        "text": 4
      }, {
        "type": "label",
        "text": 5
      }, {
        "type": "label",
        "text": 1
      }, {
        "type": "label",
        "text": 2
      }, {
        "type": "label",
        "text": 3
      }, {
        "type": "label",
        "text": 4
      }, {
        "type": "label",
        "text": 5
      }]
    }
    compare(actual, expected);
  });
  it('array + item + array', function() { 
    var data = {
      numbers: [1,2,3,4,5]
    };
    var template = {
      "items": {
        "{{#concat}}": [
          {
            "{{#each numbers}}": {
              "type": "label",
              "text": "{{this}}"
            }
          },
          {
            "numbers": "{{numbers.toString()}}"
          },
          {
            "{{#each numbers}}": {
              "type": "label",
              "text": "{{this}}"
            }
          }
        ]
      }
    };
    var actual = st.TRANSFORM.transform(template, data);
    var expected = {
      items: [{
        "type": "label",
        "text": 1
      }, {
        "type": "label",
        "text": 2
      }, {
        "type": "label",
        "text": 3
      }, {
        "type": "label",
        "text": 4
      }, {
        "type": "label",
        "text": 5
      }, {
        "numbers": "1,2,3,4,5"
      }, {
        "type": "label",
        "text": 1
      }, {
        "type": "label",
        "text": 2
      }, {
        "type": "label",
        "text": 3
      }, {
        "type": "label",
        "text": 4
      }, {
        "type": "label",
        "text": 5
      }]
    }
    compare(actual, expected);
  });
});
