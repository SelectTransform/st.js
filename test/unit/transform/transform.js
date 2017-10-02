var assert = require('assert');
var st = require('../../../st.js');
var stringify = require('json-stable-stringify');
var compare = function(actual, expected){
  assert.equal(stringify(actual), stringify(expected));
};

describe("TRANSFORM.run", function() {
  describe('template edge cases', function(){
    it('should be able to escape double curly braces', function(){
      var template = "{{var jsobj = {func: function() { return 'foo'; } }; return jsobj.func();}}";
      var data = {};
      var actual = st.TRANSFORM.run(template,data);
      compare(actual, "foo");
    });
    it("parses empty string correctly", function(){
      var data = {
        "text": ""
      }
      var template = {
        "text": ""
      }
      var actual = st.TRANSFORM.transform(template, data);
      compare(actual, template);
    })
    it("works when a template expression is used for both key and value", function(){
      var data = {
        "key": "this is key",
        "value": "this is value"
      }
      var template = {
        "{{key}}": "{{value}}"
      }
      var actual = st.TRANSFORM.transform(template, data);
      compare(actual, {"this is key": "this is value"});
    })
    it('should correctly parse regular expression', function(){
      var template = "{{price.amount.toFixed(2).replace(/(\\d)(?=(\\d{3})+\\.)/g, '$1,')}}";
      var data = {"price": {"amount": 1000000}};
      var actual = st.TRANSFORM.run(template,data);
      compare(actual, "1,000,000.00");
    });
    describe("template is static json", function() {
      it("boolean value should be preserved", function() {
        var data = {
          "what": "ever"
        }
        var template = {
          bool: true
        }
        var actual = st.TRANSFORM.transform(template, data);
        compare(actual, {bool: true});
      });
      it("static json should stay exactly the same", function() {
        var data = {
          $jason: {
            head: {
              title: "HI"
            },
            body: {
              sections: [{
                items: [{
                  type: "label",
                  text: "HI"
                }]
              }]
            }
          }
        }
        var template = {
          $jason: {
            head: {
              title: "HI"
            },
            body: {
              sections: [{
                items: [{
                  type: "label",
                  text: "HI"
                }]
              }]
            }
          }
        };
        var actual = st.TRANSFORM.transform(template, data);
        compare(actual, template);
      });
      it("null value should be preserved", function() {
        var data = {
          "what": "ever"
        }
        var template = {
          bool: null
        }
        var actual = st.TRANSFORM.transform(template, data);
        compare(actual, {bool: null});
      });
    })
  });
});
describe('TRANSFORM.fillout', function() {
  describe("string interpolation should work", function(){
    it('should correctly parse when a template is used along with static string', function(){
      var actual = st.TRANSFORM.fillout(
        {"user": "tom"},
        "This is {{user}}"
      );
      compare(actual, "This is tom");
    });
  });
  describe("handling multiple templates in a string", function(){
    it('should correctly parse multiple templates in a string', function(){
      var actual = st.TRANSFORM.fillout(
        {"users": ["tom", "jane", "obafe"]},
        "This is an {{users[0]}} and {{users[1]}}"
      );
      compare(actual, "This is an tom and jane");
    });
    it('should correctly parse multiple templates in a string', function(){
      var template = "{{$jason.title}} and {{$jason.description}}";
      var data = {"$jason": {"title": "This is a title", "description": "This is a description"}};
      var actual = st.TRANSFORM.fillout(data, template);
      var expected = "This is a title and This is a description";
      compare(actual, expected);
    });
  });
  describe("Handling null/undefined cases", function(){
    // Handling Exception cases
    // When the parsed result is null, it could be an error.
    // But also it could be that the current run is not meant to parse the template
    // and may need to be parsed by another dataset, so we should keep the 
    // template as is
    it('should not parse broken template', function(){
      var template = {
        "$frame": "NSRect: {{0, 0}, {375, 284}}",
        "inline": "true",
        "url": "https://vjs.zencdn.net/v/oceans.mp4"
      };
      var data = {"$cache": {}};
      var actual = st.TRANSFORM.fillout(data, template);
      compare(actual, template);
    });
    it('should return the template string when the result is null', function(){
      var actual1 = st.TRANSFORM.fillout(
        {"users": ["tom", "jane", "obafe"]},
        "This is an {{users[0]}}"
      );
      var actual2 = st.TRANSFORM.fillout(
        {"users": ["tom", "jane", "obafe"]},
        "This is an {{items[0]}}"
      );
      compare(actual1, "This is an tom");
      compare(actual2, "This is an {{items[0]}}");
    });
  });
  describe("Handling objects and array results", function(){
    it('should return an actual array if the result is an array', function(){
      var actual = st.TRANSFORM.fillout( {"a": ['item1','item2']}, "{{a}}");
      compare(actual, ['item1', 'item2']);
    });
    it('standalone this where this is object', function(){
      var actual = st.TRANSFORM.fillout( {"a": {"key": 'item1'}}, "{{a}}");
      compare(actual, {"key": "item1"});
    });
  });
  describe("handling map", function(){
    it('correctly runs map function', function(){
      var data = {"items": {"0": {name: "kate", age: "23"}, "1": {name: "Lassie", age: "3"}}};
      var actual = st.TRANSFORM.fillout(data, "{{Object.keys(items).map(function(key){return items[key].name;})}}");
      compare(actual, ["kate", "Lassie"]);
    });
    it('correctly parses a map loop: *this* edition', function(){
      var data =  ["1", "2", "3"];
      var template = "{{this.map(function(item){ return {db: item}; }) }}";
      var actual = st.TRANSFORM.fillout(data, template);
      compare(actual, [{"db": "1"}, {"db": "2"}, {"db": "3"}]);
    });
    it('correctly parses a map loop: $jason edition', function(){
      var data =  {"$jason": ["1", "2", "3"]};
      var template = "{{$jason.map(function(item){return {db: item};})}}";
      var actual = st.TRANSFORM.fillout(data, template);
      compare(actual, [{"db": "1"}, {"db": "2"}, {"db": "3"}]);
    });
    it('correctly parses a local variable inside of a map loop', function(){
      var data =  {"$params": {"title": "title", "url": "url"}, "$jason": ["1", "2", "3"]};
      var template = "{{$jason.map(function(item){return {db: item, title: $params.title, url: $params.url};})}}";
      var actual = st.TRANSFORM.fillout(data, template);
      compare(actual, [{"db": "1", "title": "title", "url": "url"}, {"db": "2", "title": "title", "url": "url"}, {"db": "3", "title": "title", "url": "url"}]);
    });
  });
  describe("Handling 'this'", function(){
    it('standalone this where this is array', function(){
      var actual = st.TRANSFORM.fillout( ['item1','item2'], "This is an {{this}}");
      compare(actual, "This is an item1,item2");
    });
    it('standalone this where this is string', function(){
      var actual = st.TRANSFORM.fillout( "item1", "This is an {{this}}");
      compare(actual, "This is an item1");
    });
    it('standalone this where this is object', function(){
      var actual = st.TRANSFORM.fillout( {"key": 'item1'}, "This is an {{this}}");
      compare(actual, "This is an [object Object]");
    });
    it('attributes for this', function(){
      var actual = st.TRANSFORM.fillout(
        {"item": "item1"},
        "This is an {{this.item}}"
      );
      compare(actual, "This is an item1");
    });
    it('when this is an array', function(){
      var actual = st.TRANSFORM.fillout(
        ['item1', 'item2', 'item3'],
        "This is an {{this[1]}}"
      );
      compare(actual, "This is an item2");
    });
  });
  describe("Handling 'fillout' exceptions", function(){
    it('should handle try to wrap the expression in an immediately invoked function and try one more time', function(){
      var actual1 = st.TRANSFORM.fillout(
        {a: []},
        "{{a.push(\"2\"); return a;}}"
      );
      compare(actual1, ["2"]);

      var actual2 = st.TRANSFORM.fillout(
        {a: ["1"]},
        "{{a.push(\"2\"); return a;}}"
      );
      compare(actual2, ["1","2"]);

      var actual3 = st.TRANSFORM.fillout(
        {a: ["1"]},
        "{{a.push(\"2\"); return a}}"
      );
      compare(actual3, ["1","2"]);
    });
    it('should handle try to wrap the expression in an immediately invoked function and try one more time, for even more complex expressions', function(){
      var actual = st.TRANSFORM.fillout(
        {created_at: 1475369605422},
        "{{var d = new Date(created_at); var day = d.getUTCDay(); var daymap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']; var realDay = daymap[parseInt(day)]; var h = d.getUTCHours(); var m = d.getUTCMinutes(); var suffix = (h > 11 ? 'pm' : 'am'); var hh = (h > 12 ? h - 12 : h); var mm = (m > 9 ? m : '0'+m); return realDay + ' ' + hh + ':' + mm + ' ' + suffix;}}"
      );
      compare(actual, "Sunday 0:53 am");
    });
    it('should return a blank space when the evaluated value is null or false', function(){
      var actual = st.TRANSFORM.fillout(
        {a: false},
        "This is a [{{a}}]"
      );
      compare(actual, "This is a []");

      var actual2 = st.TRANSFORM.fillout(
        {a: null},
        "This is a [{{a}}]"
      );
      compare(actual2, "This is a []");
    });
    it('should return blank space when an evaluatable expression is passed in and evaluates to false or null' , function(){
      var actual = st.TRANSFORM.fillout(
        ['item1', 'item2', 'item3', null, false],
        "This is an [{{this[3]}}]"
      );
      compare(actual, "This is an []");

      var actual2 = st.TRANSFORM.fillout(
        ['item1', 'item2', 'item3', null, false],
        "This is a [{{this[4]}}]"
      );
      compare(actual2, "This is a []");
    });
    it('should not fill in the template if a null or false primitive is explicitly passed in', function(){
      var actual = st.TRANSFORM.fillout(
        null,
        "This is a {{this}}"
      );
      compare(actual, "This is a {{this}}");

      var actual2 = st.TRANSFORM.fillout(
        false,
        "This is a {{this}}"
      );
      compare(actual2, "This is a {{this}}");
    });
    it('should return the template when an evaluatable expression is passed in but cannot be evaluated (undefined)' , function(){
      var actual = st.TRANSFORM.fillout(
        ['item1', 'item2', 'item3'],
        "This is an {{unexisting_variable[4]}}"
      );
      compare(actual, "This is an {{unexisting_variable[4]}}");

      var actual2 = st.TRANSFORM.fillout(
        ['item1', 'item2', 'item3'],
        "This is an {{this[4]}}"
      );
      compare(actual2, "This is an {{this[4]}}");
    });
  });
});

describe('TRANSFORM.transform (JSON.transform)', function(){
  it('complex expression', function(){
    var template = "{{var uri = $jason.data_uri; var b64 = uri.split(',').pop(); return b64;}}";
    var data = {
      "$jason": {
        "data_uri": "data://abc,def"
      }
    };
    var actual = st.TRANSFORM.transform(template, data);
    var expect = "def";
    compare(actual, expect);
  });
  it('should handle return correctly even with $root', function(){
    var template = {
      "{{#each items}}": {
        "item": "{{var a=1; return $root.$get.name; }}"
      }
    }
    var data = {
      "$get": {
        "name": "E"
      },
      "items": ["a", "b"]
    };
    var actual = st.TRANSFORM.transform(template, data);
    var expect = [{
      "item": "E"
    }, {
      "item": "E"
    }];
    compare(actual, expect);
  });
	describe('pass args as string', function(){
		it("should correctly handle string only templates", function(){
			var template = "{{$jason}}";
			var data = JSON.stringify({
				"$jason": "Val"
			});
			var actual = st.TRANSFORM.transform(template, data, null, true);
			var expect = JSON.stringify("Val");
			compare(actual, expect);
		});
		it("should correctly handle string only templates", function(){
			var template = "{{$jason}}";
			var data = JSON.stringify({
				"$jason": {
					"title": "Title",
					"description": "Description"
				}
			});
			var actual = st.TRANSFORM.transform(template, data, null, true);
			var expect = JSON.stringify({
				"title": "Title",
				"description": "Description"
			});
			compare(actual, expect);
		});
	});
	it("should correctly handle string only templates", function(){
		var template = "{{$jason}}";
		var data = {
			"$jason": "Val"
		};
    var actual = st.TRANSFORM.transform(template, data);
    var expect = "Val";
    compare(actual, expect);
	});
	it("should correctly handle string only templates", function(){
		var template = "{{$jason}}";
		var data = {
			"$jason": {
				"title": "Title",
				"description": "Description"
			}
		};
    var actual = st.TRANSFORM.transform(template, data);
    var expect = {
			"title": "Title",
			"description": "Description"
		};
    compare(actual, expect);
	});
  describe('closure', function(){
    it('$get inside $get', function(){
      var data = {"$get": {
        "urls": [ "url1", "url2" ],
        "item": "item"
      }};
      var template = {
        "{{#each $get.urls}}": {
          "text": "{{$root.$get.item}}"
        }
      };
      var actual = st.TRANSFORM.transform(template, data);
      var expect = [{"text": "item"}, {"text": "item"}];
      compare(actual, expect);
    });
    it('should correctly handle closure', function(){
      var template = {"sections": [{
        "items": {
          "{{#each $jason.items}}": {
            "type": "vertical",
            "components": [{
              "type": "label",
              "text": "{{name}}"
            }, {
              "type": "label",
              "text": "{{$root.$get.common}}"
            }]
          }
        }
      }]};
      var data = {
        "$jason": {
          "items": [{
            "name": "John"
          }, {
            "name": "Kat"
          }, {
            "name": "Sherry"
          }]
        },
        "$get": {
          "common": "people"
        }
      };
      var actual = st.TRANSFORM.transform(template, data);
      var expect = {"sections": [{
        "items": [{
          "type": "vertical",
          "components": [{
            "type": "label",
            "text": "John"
          }, {
            "type": "label",
            "text": "people"
          }]
        }, {
          "type": "vertical",
          "components": [{
            "type": "label",
            "text": "Kat"
          }, {
            "type": "label",
            "text": "people"
          }]
        }, {
          "type": "vertical",
          "components": [{
            "type": "label",
            "text": "Sherry"
          }, {
            "type": "label",
            "text": "people"
          }]
        }]
      }]};
      compare(actual, expect);
    });
  });
  describe('real world tests', function(){
    it('test1', function(){
      var template = {"result" : {
          "head": {
            "title": "{{title}}",
            "description": "{{description}}"
          },
          "body": {
              "sections": {
                "{{#each posts}}": {
                  "header": {
                    "type": "label",
                    "text": "[App] {{name}}"
                  },
                  "cards": {
                    "{{#each makers}}": {
                      "type": "vertical",
                      "items": [
                        {
                          "type": "label",
                          "text": "{{name}}"
                        }, {
                          "type": "label",
                          "text": "by {{username}}"
                        }, {
                          "type": "label",
                          "text": "{{headline}}"
                        }
                      ]
                    }
                  }
                }
              }
          }
        }
      };
      var data = {
        "title": "Product Hunt",
        "description": "Website to post products",
        "posts": [{
          "name": "ethan",
          "makers": [{
            "name": "Ethan",
            "username": "gliechtenstein",
            "headline": "I built Ethan, RubCam, TextCast, Jason"
          }]
        }, {
          "name": "Robin",
          "makers": [{
            "name": "Justin",
            "username": "jcrandall",
            "headline": "co-founder, Robin"
          }]
        }]
      };
      var actual = st.TRANSFORM.transform(template, data);
      var expect = {"result": {
        "head": {
          "title": "Product Hunt",
          "description": "Website to post products"
        },
        "body": {
          "sections": [{
            "header": {
              "type": "label",
              "text": "[App] ethan"
            },
            "cards": [{
              "type": "vertical",
              "items": [{
                "type": "label",
                "text": "Ethan"
              }, {
                "type": "label",
                "text": "by gliechtenstein"
              }, {
                "type": "label",
                "text": "I built Ethan, RubCam, TextCast, Jason"
              }]
            }]
          }, {
            "header": {
              "type": "label",
              "text": "[App] Robin"
            }, 
            "cards": [{
              "type": "vertical",
              "items": [{
                "type": "label",
                "text": "Justin"
              }, {
                "type": "label",
                "text": "by jcrandall"
              }, {
                "type": "label",
                "text": "co-founder, Robin"
              }]
            }]
          }]
        }
      }};
      compare(actual, expect);
    });
    it('should correctly get rid of an array item if its null', function(){
      var template = [
        {
          "cards": []
        },
        [{
          "{{#if highlights.length>0}}": {
              "header": {
                "type": "label",
                "text": "Permissions",
                "style": {
                  "padding": "10",
                  "font": "HelveticaNeue-CondensedBold",
                  "color": "#000000",
                  "size": "11"
                }
              }
          }
        }],
        {
          "cards": ["a","b"]
        }
      ];

      var data = {"highlights": []};
      var actual = st.TRANSFORM.transform(template, data);
      compare(actual, [ { cards: [] }, { cards: [ 'a', 'b' ] } ]);
    });

    it("should correctly access 'this' attribute for each item in an array", function(){
      var template = {
        "{{#each $jason}}": {
          "type": "label",
          "text": "{{this}}"
        }
      };
      var data = {"$jason": ["tom", "jerry"]};
      var actual = st.TRANSFORM.transform(template, data);
      var expected = [{
        "type": "label",
        "text": "tom"
      }, {
        "type": "label",
        "text": "jerry"
      }];
      compare(actual, expected);
    });

    it('should correctly process multiple template expressions in one string', function(){
      var template = {
        "type": "label",
        "text": "{{$jason.title}} and {{$jason.description}}"
      };
      var data = {"$jason": {"title": "This is a title", "description": "This is a description"}};
      var actual = st.TRANSFORM.transform(template, data);
      var expected = {
        "type": "label",
        "text": "This is a title and This is a description"
      };
      compare(actual, expected);
    });

    it('should be able to process complex expression as long as it doesnt evaluate to exception', function(){
      var template = [
        {
          "{{#if $cache && ('tweets' in $cache) && $cache.tweets && Array.isArray($cache.tweets) && $cache.tweets.length > 0}}": {
            "options": {
              "data": {
                "$jason": "{{$cache}}"
              }
            },
            "type": "$render"
          }
        },
        {
          "{{#else}}": {
            "trigger": "fetch"
          }
        }
      ];
      var data = {"$cache": {}};
      var actual = st.TRANSFORM.transform(template, data);
      compare(actual, {"trigger": "fetch"});
    });
    it('should not try to parse when theres a broken template', function(){
      var template = {
        "$frame": "NSRect: {{0, 0}, {375, 284}}",
        "inline": "true",
        "url": "https://vjs.zencdn.net/v/oceans.mp4"
      };
      var data = {"$cache": {}};
      var actual = st.TRANSFORM.transform(template, data);
      compare(actual, template);
    });
  });

  describe("Handling objects and array results", function(){
    it('should return an actual array if the result is an array', function(){
      var actual = st.TRANSFORM.transform( "{{a}}", {"a": ['item1','item2']});
      compare(actual, ['item1', 'item2']);
    });
    it('standalone this where this is object', function(){
      var actual = st.TRANSFORM.transform( "{{a}}", {"a": {"key": 'item1'}});
      compare(actual, {"key": "item1"});
    });
  });
});
