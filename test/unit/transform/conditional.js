var assert = require('assert');
var st = require('../../../st.js');
var stringify = require('json-stable-stringify');

var compare = function(actual, expected){
  assert.equal(stringify(actual), stringify(expected));
};

describe('Conditional.run', function(){
  it('should correctly return array when array', function(){
    var template = [
      { 
        "{{#if Array.isArray($jason) && !($jason.errors || $jason.error)}}": {
          "options": {
            "tweets": "{{$jason}}"
          },
          "type": "$render"
        }
      },
      {
        "{{#else}}": {
          "type": "$oauth.unauth"
        }
      }
    ];
    var data = {
      "$jason": ["Ethan", "John"]
    };
    var actual = st.Conditional.run(template,data);
    var expect = { 
      "options": {
        "tweets": ["Ethan", "John"]
      },
      "type": "$render"
    };
    compare(actual, expect);
  });
  it('should correctly return array when array', function(){
    var template = [
      { 
        "{{#if Array.isArray($jason) && !($jason.errors || $jason.error)}}": {
          "options": {
            "tweets": "{{$jason}}"
          },
          "type": "$render"
        }
      },
      {
        "{{#else}}": {
          "type": "$oauth.unauth"
        }
      }
    ];
    var data = {
      "$jason": [{"name": "Ethan"}, {"name": "John"}]
    };
    var actual = st.Conditional.run(template,data);
    var expect = { 
      "options": {
        "tweets": [{"name": "Ethan"}, {"name": "John"}]
      },
      "type": "$render"
    };
    compare(actual, expect);
  });
  it('should return null if expression evaluates to false or null', function(){
    var template = [{
      "{{#if website_url.length > 2}}": {
        "type": "label",
        "style": {
          "font": "HelveticaNeue",
          "size": "12",
          "color": "#cacaca"
        },
        "text": "{{website_url}}"
      }
    }];
    var data = {"website_url": "A"};
    var actual = st.Conditional.run(template,data);
    compare(actual, null);
  });
  it('should return null if the expression evaluates to false or null', function(){
    var template = [{
      "{{#if headline.length > 0}}": {
        "type": "label",
        "style": {
          "font": "HelveticaNeue",
          "size": "12",
          "color": "#cacaca"
        },
        "text": "{{headline}}"
      }
    }, {
      "{{#else}}": {
        "type": "label",
        "style": {
          "font": "HelveticaNeue",
          "size": "12",
          "color": "#cacaca"
        },
        "text": "User"
      }
    }];
    var data = {"headline": ""};
    var actual = st.Conditional.run(template,data);
    compare(actual, {"type": "label", "style": {"font": "HelveticaNeue", "size": "12", "color": "#cacaca"}, "text": "User"});
  });

  it('should return the original template if the expression couldnt be evaluated with the data', function(){
    var template = [{
      "{{#if website_url}}": {
        "type": "label",
        "style": {
          "font": "HelveticaNeue",
          "size": "12",
          "color": "#cacaca"
        },
        "text": "{{website_url}}"
      }
    }];
    var data = {"name": "ethan"};
    var actual = st.Conditional.run(template,data);
    compare(actual, template);
  });
  it('should return the original template if the expression couldnt be evaluated with the data', function(){
    var template = [{
      "{{#if headline}}": {
        "type": "label",
        "style": {
          "font": "HelveticaNeue",
          "size": "12",
          "color": "#cacaca"
        },
        "text": "{{headline}}"
      }
    }, {
      "{{#else}}": {
        "type": "label",
        "style": {
          "font": "HelveticaNeue",
          "size": "12",
          "color": "#cacaca"
        },
        "text": "User"
      }
    }];
    var data = {"name": "ethan"};
    var actual = st.Conditional.run(template,data);
    compare(actual, template);
  });
  it('should return the template if any of the explored expressions cannot be evaluated', function(){
    var template = [{
      "{{#if headline}}": {
        "type": "label",
        "style": {
          "font": "HelveticaNeue",
          "size": "12",
          "color": "#cacaca"
        },
        "text": "{{headline}}"
      }
    }, {
      "{{#elseif name}}": {
        "type": "label",
        "style": {
          "font": "HelveticaNeue",
          "size": "12",
          "color": "#cacaca"
        },
        "text": "{{name}}"
      }
    }, {
      "{{#else}}": {
        "type": "label",
        "style": {
          "font": "HelveticaNeue",
          "size": "12",
          "color": "#cacaca"
        },
        "text": "User"
      }
    }];
    var data = {"name": "ethan"};
    var actual = st.Conditional.run(template,data);
    compare(actual, template);
  });
  it('should return the first expression that is evaluatable and evaluates to truthy value', function(){
    var template = [{
      "{{#if name=='john'}}": {
        "type": "label",
        "style": {
          "font": "HelveticaNeue",
          "size": "12",
          "color": "#cacaca"
        },
        "text": "{{name}}"
      }
    }, {
      "{{#elseif name}}": {
        "type": "label",
        "style": {
          "font": "HelveticaNeue",
          "size": "12",
          "color": "#cacaca"
        },
        "text": "{{name}}"
      }
    }, {
      "{{#else}}": {
        "type": "label",
        "style": {
          "font": "HelveticaNeue",
          "size": "12",
          "color": "#cacaca"
        },
        "text": "User"
      }
    }];
    var data = {"name": "ethan"};
    var actual = st.Conditional.run(template,data);
    compare(actual, {"type": "label", "style": {"font": "HelveticaNeue", "size": "12", "color": "#cacaca"}, "text": "ethan"});
  });
  it('should run the else branch if it reaches that point with all its preceding items evaluating to falsy values', function(){
    var template = [{
      "{{#if name=='john'}}": {
        "type": "label",
        "style": {
          "font": "HelveticaNeue",
          "size": "12",
          "color": "#cacaca"
        },
        "text": "{{name}}"
      }
    }, {
      "{{#elseif name.length == 0}}": {
        "type": "label",
        "style": {
          "font": "HelveticaNeue",
          "size": "12",
          "color": "#cacaca"
        },
        "text": "{{name}}"
      }
    }, {
      "{{#else}}": {
        "type": "label",
        "style": {
          "font": "HelveticaNeue",
          "size": "12",
          "color": "#cacaca"
        },
        "text": "User"
      }
    }];
    var data = {"name": "ethan"};
    var actual = st.Conditional.run(template,data);
    compare(actual, {"type": "label", "style": {"font": "HelveticaNeue", "size": "12", "color": "#cacaca"}, "text": "User"});
  });
  describe('should correctly handle string interpolation', function(){
    it('should evaluate and pick the first option when the condition is true', function(){
      var template = [
        {
          "{{#if /http.?:\\/\\//.test($get.url)}}": {
            "url": "{{$get.url}}"
          },
        },
        {
          "{{#else}}": {
            "url": "https://jasonbase.com/things/{{$get.url}}"
          }
        }
      ];
      var data = {"$get": {"url": "https://hahaha"}};
      var actual = st.Conditional.run(template, data);
      compare(actual, {"url": "https://hahaha"});
    });
    it('should evaluate and pick the second option when the condition is false', function(){
      var template = [
        {
          "{{#if /http.?:\\/\\//.test($get.url)}}": {
            "url": "{{$get.url}}"
          },
        },
        {
          "{{#else}}": {
            "url": "https://jasonbase.com/things/{{$get.url}}"
          }
        }
      ];
      var data = {"$get": {"url": "ABC"}};
      var actual = st.Conditional.run(template, data);
      compare(actual, {"url": "https://jasonbase.com/things/ABC"});
    });
  });
});

describe('Conditional.is', function(){
  // Condition 0. Must be an array
  it('should be in an array format to qualify as conditinal', function(){
    var invalid = {
      "#if item": {
        "result": "item"
      }
    };
    var actual = st.Conditional.is(invalid);
    compare(actual, false);
  });

  // Condition 1. Must have at least one item
  it('should contain #if, #elsif, or #else to be a conditional', function(){
    var valid = [
      {
        "#if item": {
          "result": "item"
        }
      }
    ];
    var actual = st.Conditional.is(valid);
    compare(actual, true);
  });

  // Condition 2. Each item in the array should be an object of a single key/value pair
  it('Each item in the array should be an object of a single key/value pair', function(){
    var valid = [
      {
        "#if item": {
          "result": "item"
        }
      }
    ];
    var invalid = [
      {
        "#if item": {
          "result": "item"
        },
        "#elseif item": {
          "result": "item"
        }
      }
    ];

    var actual1 = st.Conditional.is(valid);
    var actual2 = st.Conditional.is(invalid);
    compare(actual1, true);
    compare(actual2, false);
  });



  // Condition 3.
  // the first item should have #if as its key
  // the first item should also contain an expression
  it('should start with #if', function(){
    var valid = [
      {
        "#if item": {
          "result": "item"
        }
      }, {
        "#else": {
          "result": "item"
        }
      }
    ];
    var invalid = [
      {
        "#else": {
          "result": "item"
        }
      }, {
        "#if item": {
          "result": "item"
        }
      }
    ];

    var invalid2 = [
      {
        "#if ": {
          "result": "item"
        }
      }
    ];

    var actual1 = st.Conditional.is(valid);
    var actual2 = st.Conditional.is(invalid);
    var actual3 = st.Conditional.is(invalid2);
    compare(actual1, true);
    compare(actual2, false);
    compare(actual3, false);
  });


  // Condition 4.
  // in case there's more than two items, everything between the first and the last item should be #elseif
  it('in case theres more than two items, everything else in between should be #elseif', function(){
    var valid = [
      {
        "#if item": {
          "result": "item"
        }
      }, {
        "#elseif item": {
          "result": "item"
        }
      }, {
        "#else": {
          "result": "item"
        }
      }
    ];
    var invalid1 = [
      {
        "#if item": {
          "result": "item"
        }
      }, {
        "#else": {
          "result": "item"
        }
      }, {
        "#else": {
          "result": "item"
        }
      }
    ];
    var invalid2 = [
      {
        "#if item": {
          "result": "item"
        }
      }, {
        "#if": {
          "result": "item"
        }
      }, {
        "#else": {
          "result": "item"
        }
      }
    ];

    var actual1 = st.Conditional.is(valid);
    var actual2 = st.Conditional.is(invalid1);
    var actual3 = st.Conditional.is(invalid2);
    compare(actual1, true);
    compare(actual2, false);
    compare(actual3, false);
  });


  // Condition 5.
  // in case there's more than one item, it should end with #else or #elseif
  it('in case theres more than one item, it should end with #else or #elseif', function(){
    var valid1 = [
      {
        "#if item": {
          "result": "item"
        }
      }, {
        "#elseif item": {
          "result": "item"
        }
      }, {
        "#else": {
          "result": "item"
        }
      }
    ];
    var valid2 = [
      {
        "#if item": {
          "result": "item"
        }
      }, {
        "#elseif": {
          "result": "item"
        }
      }, {
        "#else": {
          "result": "item"
        }
      }
    ];
    var invalid = [
      {
        "#if item": {
          "result": "item"
        }
      }, {
        "#if": {
          "result": "item"
        }
      }
    ];

    var actual1 = st.Conditional.is(valid1);
    var actual2 = st.Conditional.is(valid2);
    var actual3 = st.Conditional.is(invalid);
    compare(actual1, true);
    compare(actual2, true);
    compare(actual3, false);
  });

});

