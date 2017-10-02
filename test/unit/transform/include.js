var assert = require('assert');
var st = require('../../../st.js');
var stringify = require('json-stable-stringify');

var compare = function(actual, expected){
  assert.equal(stringify(actual), stringify(expected));
};

describe('#include', function(){

  /*  
  * #include is useful when:
  * 1. you don't want to parse certain part of a JSON tree => #include will simply attach the 

  When the below markup gets parsed,

  {
    "$jason": {
      "head": {
        "{{#include}}": {
          "templates": {
            "body": {
              "sections": [{
                "items": {
                  "{{#each items}}": {
                    "type": "label",
                    "text": "{{name}}"
                  }
                }
              }]
            }
          }
        }
      }
    }
  }

  It simply returns the following 

  {
    "$jason": {
      "head": {
        "templates": {
          "body": {
            "sections": [{
              "items": {
                "{{#each items}}": {
                  "type": "label",
                  "text": "{{name}}"
                }
              }
            }]
          }
        }
      }
    }
  }

  Why would anyone want to do that?
  This is useful when you want to make sure certain parts of a JSON tree don't get parsed.

  In above example, if the "templates" key wasn't wrapped inside "{{#include}}", it would have resulted in parsing its child all the way down.

  Instead it simply treated its children as a literal string and stopped parsing from that point on.

  */


  describe('prod', function(){
    it('should parse correctly when {} is passed in', function(){
      var template = {
        "{{#include }}": {
          "$jason": {
            "head": {
              "title": "title" 
            },
            "body": {
              "sections": []
            }
          }
        }
      };
      var data = {};
      var actual = st.TRANSFORM.transform(template, data);
      var expected = {
        "$jason": {
          "head": {
            "title": "title" 
          },
          "body": {
            "sections": []
          }
        }
      };
      compare(actual, expected);
    });
    it('mixin', function(){
      var template = {
        "items": {
          "{{#each items}}": {
            "components": ["{{#include mixin.image}}"]
          }
        }
      };
      var data = {
        "mixin": {
          "image": {
            "type": "image",
            "url": "{{url}}"
          }
        }
      };
      var actual = st.TRANSFORM.transform(template, data);
      var expected = {
        "items": {
          "{{#each items}}": {
            "components": [
              {
                "type": "image",
                "url": "{{url}}"
              }
            ]
          }
        }
      };
      compare(actual, expected);
    });
  });

  describe('basic', function(){
    it("string", function(){
      var template = {
        "{{#include}}": "Why, hello there"
      };
      var data = {
        "$jason": "This shouldn't print"
      };
      var actual = st.TRANSFORM.transform(template, data);
      compare(actual, "Why, hello there");
    });
    it("array", function(){
      var template = {
        "{{#include}}": ["A", "B", "C"]
      };
      var data = {
        "$jason": "This shouldn't print"
      };
      var actual = st.TRANSFORM.transform(template, data);
      compare(actual, ["A", "B", "C"]);
    });
    it("object", function(){
      var template = {
        "{{#include}}": {"a": "0", "b": "1", "c": "2"}
      };
      var data = {
        "$jason": "This shouldn't print"
      };
      var actual = st.TRANSFORM.transform(template, data);
      compare(actual, {"a": "0", "b": "1", "c": "2"});
    });
  });

  describe('edge cases', function(){
    it('empty string', function(){
      var template = {
        "{{#include}}": ""
      };
      var data = {
        "$jason": "This shouldn't print"
      };
      var actual = st.TRANSFORM.transform(template, data);
      compare(actual, "");
    });
    it('empty object', function(){
      var template = {
        "{{#include}}": {}
      };
      var data = {
        "$jason": "This shouldn't print"
      };
      var actual = st.TRANSFORM.transform(template, data);
      compare(actual, {});
    });
    it('empty array', function(){
      var template = {
        "{{#include}}": []
      };
      var data = {
        "$jason": "This shouldn't print"
      };
      var actual = st.TRANSFORM.transform(template, data);
      compare(actual, []);
    });
  });

  describe('the child should NOT be parsed', function(){
    it('should work for string', function(){
      var template = {
        "{{#include}}": "{{$jason}}"
      };
      var data = {
        "$jason": "Why hello there"
      };
      var actual = st.TRANSFORM.transform(template, data);
      compare(actual, "{{$jason}}");
    });
    it('should work for object', function(){
      var template = {
        "{{#include}}": {
          "{{#each items}}": {
            "text": "{{name}}"
          }
        }
      };
      var data = {
        "items": [{
          "name": "A"
        }, {
          "name": "B"
        }]
      };
      var actual = st.TRANSFORM.transform(template, data);
      compare(actual, {"{{#each items}}":{"text":"{{name}}"}});
    });
    it('should work for array', function(){
      var template = {
        "{{#include}}": "{{$jason}}"
      };
      var data = {
        "$jason": ["A", "B", "C"]
      };
      var actual = st.TRANSFORM.transform(template, data);
      compare(actual, "{{$jason}}");
    });
  });

	describe('#include with parameters', function(){
		it('correctly parses the hierarchy', function(){
			var template = {
				"{{#include $document.action}}": {
					"$document": {
						"action": {
							"type": "$render"
						}
					}
				}	
			};
			var data = {};
			var actual = st.TRANSFORM.transform(template, data);
			compare(actual, {"type": "$render"});
		});
		it('correctly parses an array subscript notation', function(){
			var template = {
				"{{#include this[0].$document.action}}": [{
					"$document": {
						"action": {
							"type": "$render"
						}
					}
				}, {
					"item": "random_item"
				}]	
			};
			var data = {};
			var actual = st.TRANSFORM.transform(template, data);
			compare(actual, {"type": "$render"});
		});
    it('correctly parses parameters even when the variale with $root context', function(){
			var template = {
        "items": {
          "{{#each $jason.items}}": {
            "text": {
              "{{#include $root.$document.adapter.url}}": {}
            }
          }
        }
      };
			var data = {
        "$document": {
          "adapter": {
            "url": "{{url}}"
          }
        }
      };

      // pass 1: only should parse the #include and leave the rest alone
			var actual = st.TRANSFORM.transform(template, data);
      var expected = {
        "items": {
          "{{#each $jason.items}}": {
            "text": "{{url}}"
          }
        }
      };
			compare(actual, expected);
    });
    it('correctly parses parameters even when the variale with $root context', function(){
			var template = {
        "items": {
          "{{#each $jason.items}}": {
            "{{#include $root.$document.item_stub}}": {},
            "text": "{{name}}"
          }
        }
      };
			var data = {
        "$document": {
          "item_stub": {
            "type": "label",
            "style": {
              "color": "#ff0000",
              "size": "12"
            },
            "text": "placeholder"
          }
        },
        "$jason": {
          "items": [{
            "name": "Batman"
          }, {
            "name": "Superman"
          }]
        }
      };

      // pass 1: only should parse the #include and leave the rest alone
			var actual = st.TRANSFORM.transform(template, data);
      var expected1 = {
        "items": {
          "{{#each $jason.items}}": {
            "type": "label",
            "style": {
              "color": "#ff0000",
              "size": "12"
            },
            "text": "{{name}}"
          }
        }
      };
			compare(actual, expected1);

      // pass 2: parse the rest
			var actual = st.TRANSFORM.transform(actual, data);
      var expected2 = {
        "items": [{
          "type": "label",
          "style": {
            "color": "#ff0000",
            "size": "12"
          },
          "text": "Batman"
        }, {
          "type": "label",
          "style": {
            "color": "#ff0000",
            "size": "12"
          },
          "text": "Superman"
        }]
      };
			compare(actual, expected2);
    });
	});

  describe('support #include as standalone string', function(){
    it('should be able to access the $root context', function(){
      // How to refer to the document itself?
      // This needs to be handled from template side, not from the apps?
      // But template can be used for anything, and it doesn't know what "document" is
      var template = "{{#include $root.wrapper}}";
      var data = {
        "wrapper": {
          "$jason": {
            "head": {
              "title": "hello world"
            },
            "body": {
              "sections": [],
              "layers": []
            }
          }
        }
      };
      var actual = st.TRANSFORM.transform(template,data);
      var expected = {
        "$jason": {
          "head": {
            "title": "hello world"
          },
          "body": {
            "sections": [],
            "layers": []
          }
        }
      };
      compare(actual, expected);
    });
    it('should attach the child template directly without parsing', function(){
      // How to refer to the document itself?
      // This needs to be handled from template side, not from the apps?
      // But template can be used for anything, and it doesn't know what "document" is
      var template = "{{#include $root.wrapper}}";
      var data = {
        "wrapper": {
          "$jason": {
            "head": {
              "title": "hello world",
              "templates": {
                "body": {
                  "sections": {
                    "{{#each $jason}}": {
                      "items": [{
                        "type": "label",
                        "text": "{{name}}"
                      }]
                    }
                  }
                }
              }
            }
          }
        }
      };
      var actual = st.TRANSFORM.transform(template,data);
      var expected = {
        "$jason": {
          "head": {
            "title": "hello world",
            "templates": {
              "body": {
                "sections": {
                  "{{#each $jason}}": {
                    "items": [{
                      "type": "label",
                      "text": "{{name}}"
                    }]
                  }
                }
              }
            }
          }
        }
      };
      compare(actual, expected);
    });
  });
  describe('combine both data and child template', function(){
    it('construct #include by using the child object as well as passed in data', function(){
      // How to refer to the document itself?
      // This needs to be handled from template side, not from the apps?
      // But template can be used for anything, and it doesn't know what "document" is
      var template = {
        "{{#include var stub=$root.wrapper; stub['$jason']['head']['data']=data; return stub;}}": {
          "data": {
            "items": [{
              "name": "tyler",
            }, {
              "name": "christian"
            }, {
              "name": "bill"
            }]
          }
        }
      };
      var data = {
        "wrapper": {
          "$jason": {
            "head": {
              "title": "hello world",
              "templates": {
                "body": {
                  "sections": {
                    "{{#each $jason.items}}": {
                      "items": [{
                        "type": "label",
                        "text": "kill {{name}}"
                      }]
                    }
                  }
                }
              }
            }
          }
        }
      };
      var actual = st.TRANSFORM.transform(template,data);
      console.log(actual);
      var expected = {
        "$jason": {
          "head": {
            "title": "hello world",
            "data": {
              "items": [{
                "name": "tyler",
              }, {
                "name": "christian"
              }, {
                "name": "bill"
              }]
            },
            "templates": {
              "body": {
                "sections": {
                  "{{#each $jason.items}}": {
                    "items": [{
                      "type": "label",
                      "text": "kill {{name}}"
                    }]
                  }
                }
              }
            }
          }
        }
      };
      compare(actual, expected);
    });
  });

  describe('complex structures', function(){
    describe('merging into object', function(){
      it('without conflict', function(){
        var template = {
          "{{#include}}": {
            "firstname": "ethan"
          },
          "lastname": "g"
        };
        var data = { };
        var expected = {
          "firstname": "ethan",
          "lastname": "g"
        };
        var actual = st.TRANSFORM.transform(template, data);
        compare(actual, expected);
      });
      it('override with local in case of conflict', function(){
        var template = {
          "{{#include}}": {
            "firstname": "ethan",
            "lastname": "g"
          },
          "lastname": "gliechtenstein"
        };
        var data = { };
        var expected = {
          "firstname": "ethan",
          "lastname": "gliechtenstein"
        };
        var actual = st.TRANSFORM.transform(template, data);
        compare(actual, expected);
      });
    });
    describe('merging into array', function(){
      describe('string into', function(){
        it('string into string array', function(){
          var template = ["a", {"{{#include}}": "b"}, "c"];
          var data = {
            "$jason": "whatever"
          };
          var expected = ["a", "b", "c"];
          var actual = st.TRANSFORM.transform(template, data);
          compare(actual, expected);
        });
        it('string into object array', function(){
          var template = [{"a":"a"}, {"{{#include}}": "b"}, {"c":"c"}];
          var data = {
            "$jason": "whatever"
          };
          var expected = [{"a":"a"}, "b", {"c":"c"}];
          var actual = st.TRANSFORM.transform(template, data);
          compare(actual, expected);
        });
        it('string into array array', function(){
          var template = [["a"], {"{{#include}}": "b"}, ["c", "d"]];
          var data = {
            "$jason": "whatever"
          };
          var expected = [["a"], "b", ["c","d"]];
          var actual = st.TRANSFORM.transform(template, data);
          compare(actual, expected);
        });
      });
      describe('object into', function(){
        it('object into string array', function(){
          var template = ["a", {"{{#include}}": {"name": "b"}}, "c"];
          var data = {
            "$jason": "whatever"
          };
          var expected = ["a", {"name": "b"}, "c"];
          var actual = st.TRANSFORM.transform(template, data);
          compare(actual, expected);
        });
        it('object into object array', function(){
          var template = [{"a":"a"}, {"{{#include}}": {"name": "b"}}, {"c":"c"}];
          var data = {
            "$jason": "whatever"
          };
          var expected = [{"a":"a"}, {"name": "b"}, {"c":"c"}];
          var actual = st.TRANSFORM.transform(template, data);
          compare(actual, expected);
        });
        it('object into array array', function(){
          var template = [["a"], {"{{#include}}": {"name": "b"}}, ["c","d"]];
          var data = {
            "$jason": "whatever"
          };
          var expected = [["a"], {"name": "b"}, ["c","d"]];
          var actual = st.TRANSFORM.transform(template, data);
          compare(actual, expected);
        });
      });
      describe('array into', function(){
        it('array into string array', function(){
          var template = ["a", {"{{#include}}": ["b", "s"]}, "c"];
          var data = {
            "$jason": "whatever"
          };
          var expected = ["a", ["b", "s"], "c"];
          var actual = st.TRANSFORM.transform(template, data);
          compare(actual, expected);
        });
        it('array into object array', function(){
          var template = [{"a": "a"}, {"{{#include}}": ["b", "s"]}, {"c":"c"}];
          var data = {
            "$jason": "whatever"
          };
          var expected = [{"a":"a"}, ["b", "s"], {"c":"c"}];
          var actual = st.TRANSFORM.transform(template, data);
          compare(actual, expected);
        });
        it('array into array array', function(){
          var template = [["a"], {"{{#include}}": ["b", "s"]}, ["c","d"]];
          var data = {
            "$jason": "whatever"
          };
          var expected = [["a"], ["b", "s"], ["c","d"]];
          var actual = st.TRANSFORM.transform(template, data);
          compare(actual, expected);
        });
      });
    });
  });
});
