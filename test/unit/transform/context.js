var assert = require('assert');
var st = require('../../../st.js');
var stringify = require('json-stable-stringify');
var compare = function(actual, expected){
  assert.equal(stringify(actual), stringify(expected));
};

describe("context edge cases", function(){
  it('$root should go away from the result after parsing', function() {
    // during the transformation we inject $root into every traversed object.
    // This should be removed after parsing finishes
    var template = {
      "type": "label",
      "text": "{{text}}"
    };
    var data = {text: "hi"};
    var actual = st.TRANSFORM.transform(template,data);
    var expected = {type: "label", text: "hi"};
    console.log(actual);
    compare(actual, expected);
  });
  it('should render static content inside #each', function(){
    var template = {
      "{{#each $jason}}": {
        "text": "Hi"
      }
    };
    var data = {"$jason": ["a", "b", "c"]};
    var actual = st.TRANSFORM.transform(template,data);
    var expected = [{"text": "Hi"}, {"text": "Hi"}, {"text": "Hi"}];
    compare(actual, expected);
  });
  it("should parse $root correctly", function(){
    var template = {
      "{{#each $jason.family_members}}": {
        "type": "vertical",
        "components": [{
          "type": "label",
          "text": "{{firstname}}"
        }, {
          "type": "label",
          "text": "{{$root.$get.lastname}}"
        }]
      }
    };
    var data = {
      "$jason": {
        "family_members": [{
          "firstname": "Homer"
        }, {
          "firstname": "Marge"
        }, {
          "firstname": "Bart"
        }, {
          "firstname": "Lisa"
        }, {
          "firstname": "Maggie"
        }]
      },
      "$get": {
        "lastname": "Simpson"
      }
    };
    var actual = st.TRANSFORM.transform(template, data);
    var expected = [{
      "type": "vertical",
      "components": [{
        "type": "label",
        "text": "Homer"
      }, {
        "type": "label",
        "text": "Simpson"
      }]
    }, {
      "type": "vertical",
      "components": [{
        "type": "label",
        "text": "Marge"
      }, {
        "type": "label",
        "text": "Simpson"
      }]
    }, {
      "type": "vertical",
      "components": [{
        "type": "label",
        "text": "Bart"
      }, {
        "type": "label",
        "text": "Simpson"
      }]
    }, {
      "type": "vertical",
      "components": [{
        "type": "label",
        "text": "Lisa"
      }, {
        "type": "label",
        "text": "Simpson"
      }]
    }, {
      "type": "vertical",
      "components": [{
        "type": "label",
        "text": "Maggie"
      }, {
        "type": "label",
        "text": "Simpson"
      }]
    }];
    compare(actual, expected);
  });
  it("should stop parsing deeper when a variable fails resolving", function(){
    var template = {
      "{{#each $jason.family_members}}": {
        "type": "vertical",
        "components": [{
          "type": "label",
          "text": "{{firstname}}"
        }, {
          "type": "label",
          "text": "{{$root.$get.lastname}}"
        }]
      }
    };
    var data = {
      "$get": {
        "lastname": "Simpson"
      }
    };
    var actual = st.TRANSFORM.transform(template, data);
    var expected = {
      "{{#each $jason.family_members}}": {
        "type": "vertical",
        "components": [{
          "type": "label",
          "text": "{{firstname}}"
        }, {
          "type": "label",
          "text": "{{$root.$get.lastname}}"
        }]
      }
    };
    compare(actual, expected);
  });
  it('nested each', function(){
    var template = {
      "{{#each categories}}": {
        "{{#each things}}": {
          "type": "label",
          "text": "{{name}}"
        }
      }
    };
    var data = {
      "categories": [{
        "things": [{
          "name": "A"
        }, {
          "name": "B"
        }, {
          "name": "C"
        }]
      }, {
        "things": [{
          "name": "1"
        }, {
          "name": "2"
        }, {
          "name": "3"
        }]
      }]
    };
    var actual = st.TRANSFORM.transform(template, data);
    var expected = [
      [
        {
          "type": "label",
          "text": "A"
        }, {
          "type": "label",
          "text": "B"
        }, {
          "type": "label",
          "text": "C"
        }
      ],
      [
        {
          "type": "label",
          "text": "1"
        }, {
          "type": "label",
          "text": "2"
        }, {
          "type": "label",
          "text": "3"
        }
      ]
    ];
    compare(actual, expected);
  });
  it('parse this correctly', function(){
    var data = {
      "item": "hi"
    };
    var template = "{{var b=this.item; return b;}}";
    var actual = st.TRANSFORM.transform(template, data);
    var expected = "hi";
    compare(actual, expected);
  });
  it('parses complex expression correctly', function(){
    var template = {
      "btoa": "{{var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='; for ( var block, charCode, idx = 0, map = chars, output = ''; str.charAt(idx | 0) || (map = '=', idx % 1); output += map.charAt(63 & block >> 8 - idx % 1 * 8)) { charCode = str.charCodeAt(idx += 3/4); if (charCode > 0xFF) { throw new InvalidCharacterError('btoa failed'); } block = block << 8 | charCode; } return output;}}"
    };
    var actual = st.TRANSFORM.transform(template, {str: 'abc'});
    var expected = {"btoa": "YWJj"};
    compare(actual, expected);
  });
  it('js expression with inline ifs', function(){
    var template = "{{ a>b ? 'aa': 'bb' }}";
    var actual = st.TRANSFORM.transform(template, {a: 3, b:2});
    var expected = "aa";
    compare(actual, expected);
  });

  it('within #each', function(){
    var template = {
      "{{#each items}}": {
        "text": "{{JSON.stringify(this)}}"
      }
    };
    var data = {"items": [{"name": "a"}, {"name": "b"}, {"name": "c"}]};
    var actual = st.TRANSFORM.transform(template, data);
    var expected = [{"text": JSON.stringify({"name": "a"})}, {"text": JSON.stringify({"name": "b"})}, {"text": JSON.stringify({"name": "c"})}];
    compare(actual, expected);
  });

  describe('parsing static JSON with static JSON', function(){
    it('normal', function(){
      var template = {
        "firstname": "homer",
        "lastname": "simpson"
      };
      var data = {
        "hello": "world"
      };
      var actual = st.TRANSFORM.transform(template, data);
      console.log("actual = ", actual);
    });
		describe('edge cases', function(){
			it('edge case - boolean', function(){
				var template = {
					"firstname": "homer",
					"lastname": "simpson",
					"idiot": true
				};
				var data = {
					"hello": "world"
				};
				var actual = st.TRANSFORM.transform(template, data);
				console.log("actual = ", actual);
			});
			it('edge case - null', function(){
				var template = {
					"firstname": "homer",
					"lastname": "simpson",
					"idiot": null
				};
				var data = {
					"hello": "world"
				};
				var actual = st.TRANSFORM.transform(template, data);
				console.log("actual = ", actual);
			});
			it('edge case - undefined', function(){
				var template = {
					"firstname": "homer",
					"lastname": "simpson",
					"idiot": undefined
				};
				var data = {
					"hello": "world"
				};
				var actual = st.TRANSFORM.transform(template, data);
				console.log("actual = ", actual);
			});
			it('edge case - empty object', function(){
				var template = {
					"key": {}
				};
				var data = {
					"hello": "world"
				};
				var actual = st.TRANSFORM.transform(template, data);
				console.log("actual = ", actual);
			});
      it('edge case - parse inside array', function(){
        var data = {
          "$jason": {
            "file_url": "file://"
          }
        }
        var template = {
          "items": [{
            "file_url": "{{$jason.file_url}}",
            "type": "audio"
          }]
        }
        var actual = st.TRANSFORM.transform(template, data);
        console.log(actual);
      })
		});
  });

  it('include', function(){
		var template = {
			"{{#include $root[\"https://api.punkapi.com/v2/beers?brewed_before=11-2012&abv_gt=6\"]}}": { }
		};
		var data = {
			"https://api.punkapi.com/v2/beers?brewed_before=11-2012&abv_gt=6": [{
				"test": "test"
			}]
		};
		var actual = st.TRANSFORM.transform(template, data);
		console.log("actual = ", actual);
  });

	it('parse empty object with another object', function(){
		var template = {
			"model": [{
				"media": {
					"id": 328995,
					"image_uuid": "51a69775-ce1a-4a58-bf53-9299edf05ffc",
					"media_type": "image",
					"metadata": { },
					"original_height": 576,
					"original_width": 1024
				}
			}]
		};
		var data = {
			"$document": {
				"$jason": {
					"head": {},
					"body": {}
				}
			}
		};
		var actual = st.TRANSFORM.transform(template, data);
		console.log("actual = ", JSON.stringify(actual));

	});
	describe('primitives', function(){
		it('null', function(){
			var template = "{{!(Object.prototype.toString.call($get.force_true)=='[object Null]')}}";
			var data = {"$get": {"force_true": null}};
			var actual = st.TRANSFORM.transform(template, data);
			console.log('actual - ', actual);
		});
		it('number', function(){
			var template = "{{3}}";
			var data = {"a":2};
			var actual = st.TRANSFORM.transform(template, data);
			console.log("actual = ", (actual === 3));
		});
		it('boolean', function(){
			var template = "{{a!==a}}";
			var data = {"a": "1"};
			var actual = st.TRANSFORM.transform(template, data);
			console.log("actual = ", (actual === false));
		});
	});

});
