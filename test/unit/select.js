var assert = require('assert');
var ST = require('../../st.js');
var stringify = require('json-stable-stringify');
var compare = function(actual, expected){
  assert.equal(stringify(actual), stringify(expected));
};

const data = {
  items: [{
    type: "image",
    url: "https://header.url"
  }, {
    type: "horizontal",
    components: [{
      type: "image",
      url: "https://avatar.url"
    }, {
      type: "vertical",
      components: [{
        type: "label",
        text: "Ethan"
      }, {
        type: "image",
        url: "http://content.url"
      }]
    }]
  }]
};
const template = {
  "{{#each items}}": {
    "type": "{{type}}",
    "haschildren": "{{'components' in this ? true : false}}"
  }
}
const template2 = {
  "src": "{{type}}({{url}})",
  "protocol": "{{url.split(':')[0]}}"
}
const template3 = {
  "type": "{{type}}({{text}})"
}
describe('SELECT object', function(){
  describe('select', function(){
    describe('root', function() {
      it('simple object', function(){
        var template = {"head": {"title": "hi"}, "body": {}};
        var actual = ST.SELECT.select(template);    
        compare(actual.values(), [{"title": "hi"}, {}]);
        compare(actual.root(), {"head": {"title": "hi"}, "body": {}});
      });
      it('nested object', function() {
        var selected = ST.SELECT.select(data);
        compare(selected.objects(), [data]);
        compare(selected.keys(), ["items"]);
        compare(selected.values(), [data.items]);
        compare(selected.paths(), ["[\"items\"]"]);
      })
      describe('select root and parse', function() {
        it('parse', function() {
          var generated = ST.SELECT.select(template).transform(data);
          compare(generated.objects(), [[{
            "type": "image",
            "haschildren": false
          }, {
            "type": "horizontal",
            "haschildren": true
          }]])
          compare(generated.keys(), [0, 1]);
          compare(generated.values(), [{
            "type": "image",
            "haschildren": false
          }, {
            "type": "horizontal",
            "haschildren": true
          }])
          compare(generated.paths(), ['[0]', '[1]']);
          compare(generated.root(), [{
            "type": "image",
            "haschildren": false
          }, {
            "type": "horizontal",
            "haschildren": true
          }]);
        })
        it('transformWith', function() {
          var generated = ST.SELECT.select(data).transformWith(template);
          // same as above example
          compare(generated.objects(), [[{
            "type": "image",
            "haschildren": false
          }, {
            "type": "horizontal",
            "haschildren": true
          }]])
          compare(generated.keys(), [0, 1]);
          compare(generated.values(), [{
            "type": "image",
            "haschildren": false
          }, {
            "type": "horizontal",
            "haschildren": true
          }])
          compare(generated.paths(), ['[0]', '[1]']);
          compare(generated.root(), [{
            "type": "image",
            "haschildren": false
          }, {
            "type": "horizontal",
            "haschildren": true
          }]);
        })
      })
    })


    describe('select subtree', function() {
      describe('select only', function() {
        // takes a look at a key pattern, and whenever it matches the function,,
        // sets the selections array that looks like this:
        //  [{
        //    "key": "$load"
        //    "value":  {
        //      "..."
        //    },
        //    "path": {
        //      ...
        //    }
        //  }, ...]


        // select anything that passes a function

        it('returns a selected formatted object', function(){
          var template = {"head": {"title": "hi"}, "body": {}};
          var actual = ST.SELECT.select(template, function(item){
            return /tle/.test(item);
          });
          compare(actual.values(), ["hi"]);
          compare(actual.keys(), ["title"]);
          compare(actual.paths(), ["[\"head\"]"]);
          compare(actual.objects(), [{"title": "hi"}]);
          compare(actual.root(), template);
        });
        it('select by key', function() {
          console.log("#####################33 Data = ", data, "\n");
          var selected = ST.SELECT.select(data, function(key, val) {
            return key === 'url';
          });
          console.log("#selected root = ", selected.$selected_root);
          console.log("------------------ objects = ", selected.objects());
          /*
          compare(selected.objects(), [{
            type: "image",
            url: "https://header.url"
          }, {
            type: "image",
            url: "https://avatar.url"
          }, {
            type: "image",
            url: "http://content.url"
          }])
          compare(selected.keys(), ["url", "url", "url"]);
          compare(selected.values(), ["https://header.url", "https://avatar.url", "http://content.url"])
          compare(selected.root(), data);
          */
        })
        it('select by value', function() {
          var selected = ST.SELECT.select(data, function(key, val) {
            return /https?:/.test(val);
          });
          console.log("objects = ", selected.objects());
          console.log("keys = ", selected.keys());
          console.log("paths = ", selected.paths());
          console.log("values = ", selected.values());
        })
      })
      describe('select and parse', function() {
        it('select template and parse', function() {
          var template = {
            "key1": {
              "{{#each items}}": {
                "type": "{{type}}",
                "haschildren": "{{'components' in this ? true : false}}"
              }
            },
            "key2": {
              "some": "random"
            }
          };
          var data = {
            items: [{
              type: "image",
              url: "https://header.url"
            }, {
              type: "horizontal",
              components: [{
                type: "image",
                url: "https://avatar.url"
              }, {
                type: "vertical",
                components: [{
                  type: "label",
                  text: "Ethan"
                }, {
                  type: "image",
                  url: "http://content.url"
                }]
              }]
            }]
          };
          var selectedData = ST.SELECT.select(data, function(key, val) {
            return key === 'type';
          }).objects();
          compare(selectedData, [{
              "type": "image", "url": "https://header.url"
            }, {
              "type": "horizontal", "components": [{
                type: "image",
                url: "https://avatar.url"
              }, {
                type: "vertical",
                components: [{
                  type: "label",
                  text: "Ethan"
                }, {
                  type: "image",
                  url: "http://content.url"
                }]
              }]
            }, {
              type: "image", url: "https://avatar.url"
            }, {
              type: "vertical", 
              components: [{
                type: "label",
                text: "Ethan"
              }, {
                type: "image",
                url: "http://content.url"
              }]
            }, {
              type: "label", text: "Ethan"
            }, {
              type: "image", url: "http://content.url"
            }]
          )



          var selectedTemplate = ST.SELECT.select(template, function(key, val) {
            return /#each/.test(key);
          });
          compare(selectedTemplate.objects(), [{
            "{{#each items}}": {
              "type": "{{type}}",
              "haschildren": "{{'components' in this ? true : false}}"
            }
          }])
          compare(selectedTemplate.keys(), [ "{{#each items}}" ]);
          compare(selectedTemplate.values(), [ {
            "type": "{{type}}",
            "haschildren": "{{'components' in this ? true : false}}"
          }]);
          compare(selectedTemplate.paths(), ["[\"key1\"]"]);


          var generated = selectedTemplate.transform({items: selectedData}).root()
          var expected = {
            key1: [{
              "type": "image", "haschildren": false
            }, {
              "type": "horizontal", "haschildren": true
            }, {
              "type": "image", "haschildren": false
            }, {
              "type": "vertical", "haschildren": true
            }, {
              "type": "label", "haschildren": false
            }, {
              "type": "image", "haschildren": false
            }],
            key2: {
              "some": "random"
            }
          }
          compare(generated, expected);
        })
        describe('parseWith', function() {
          it('once', function() {
            const data = {
              items: [{
                type: "image",
                url: "https://header.url"
              }, {
                type: "horizontal",
                components: [{
                  type: "image",
                  url: "https://avatar.url"
                }, {
                  type: "vertical",
                  components: [{
                    type: "label",
                    text: "Ethan"
                  }, {
                    type: "image",
                    url: "http://content.url"
                  }]
                }]
              }]
            };
            var selected = ST.SELECT.select(data, function(key, val) {
              return /https?:/.test(val);
            });
            var generated = selected.transformWith(template2);
            console.log("Root = ", generated.root());
            console.log("objects = ", generated.objects());
            compare(generated.objects(), [{
              "src": "image(https://header.url)",
              "protocol": "https"
            }, {
              "src": "image(https://avatar.url)",
              "protocol": "https"
            }, {
              "src": "image(http://content.url)",
              "protocol": "http"
            }])

            compare(generated.keys(), ["url", "url", "url"]);
            compare(generated.values(), ["https://header.url", "https://avatar.url", "http://content.url"]);
            compare(generated.paths(), ["[\"items\"][0]", "[\"items\"][1][\"components\"][0]", "[\"items\"][1][\"components\"][1][\"components\"][1]"]);
          })
          it('twice', function() {
            var labelParsed = ST.SELECT.select(data, function(key, val) {
              return val === 'label';
            }).transformWith(template3).root();

            var generated = ST.SELECT.select(labelParsed, function(key, val) {
              return /https?:/.test(val)
            }).transformWith(template2);
            console.log("objects = ", generated.objects());
            console.log("keys = ", generated.keys());
            console.log("paths = ", generated.paths());
            console.log("values = ", generated.values());
            console.log("root = ", JSON.stringify(generated.root(), null, 2));
          })
        })
      })
    })

    describe('key matching', function(){
      describe('function testing', function(){
        it('simple test', function(){
          var template = {
            "head": {
              "title": "first head",
              "head": {
                "title": "second head",
                "head": {
                  "title": "third head"
                }
              }
            }
          };
          var actual = ST.SELECT.select(template, function(key){
            return key == 'head';
          });
          var expected = [{
            "title": "first head",
            "head": {
              "title": "second head",
              "head": {
                "title": "third head"
              }
            }
          }, {
            "title": "second head",
            "head": {
              "title": "third head"
            }
          }, {
            "title": "third head"
          }];
          compare(actual.values(), expected);
          compare(actual.root(), template);
        });
        it('regex testing', function(){
          var template = {
            "$jason": {
              "head": {
                "{{#include}}": {
                  "templates": {
                    "body": {
                      "sections": [{
                        "header": {
                          "type": "horizontal",
                          "components": [{
                            "{{#include}}": {
                              "type": "image",
                              "url": "{{$jason.image}}"
                            },
                            "class": "avatar"
                          }]
                        },
                        "items": {
                          "{{#each $jason.items}}": {
                            "type": "label",
                            "text": {
                              "{{#include}}": "{{name}}"
                            }
                          }
                        }
                      }]
                    }
                  }
                }
              }
            }
          };
          var actual = ST.SELECT.select(template, function(key, value){
            return /#include/.test(key);
          });
          var expected = {
            keys: ["{{#include}}", "{{#include}}", "{{#include}}"],
            paths: ["[\"$jason\"][\"head\"]", "[\"$jason\"][\"head\"][\"{{#include}}\"][\"templates\"][\"body\"][\"sections\"][0][\"header\"][\"components\"][0]", "[\"$jason\"][\"head\"][\"{{#include}}\"][\"templates\"][\"body\"][\"sections\"][0][\"items\"][\"{{#each $jason.items}}\"][\"text\"]"],
            values: [
              {
                "templates": {
                  "body": {
                    "sections": [{
                      "header": {
                        "type": "horizontal",
                        "components": [{
                          "{{#include}}": {
                            "type": "image",
                            "url": "{{$jason.image}}"
                          },
                          "class": "avatar"
                        }]
                      },
                      "items": {
                        "{{#each $jason.items}}": {
                          "type": "label",
                          "text": {
                            "{{#include}}": "{{name}}"
                          }
                        }
                      }
                    }]
                  }
                }
              },
              {
                "type": "image",
                "url": "{{$jason.image}}"
              }, 
              "{{name}}"
            ],
            objects: [
              {
                "{{#include}}": {
                  "templates": {
                    "body": {
                      "sections": [{
                        "header": {
                          "type": "horizontal",
                          "components": [{
                            "{{#include}}": {
                              "type": "image",
                              "url": "{{$jason.image}}"
                            },
                            "class": "avatar"
                          }]
                        },
                        "items": {
                          "{{#each $jason.items}}": {
                            "type": "label",
                            "text": {
                              "{{#include}}": "{{name}}"
                            }
                          }
                        }
                      }]
                    }
                  }
                }
              },
              {
                "{{#include}}": {
                  "type": "image",
                  "url": "{{$jason.image}}"
                },
                "class": "avatar"
              },
              {
                "{{#include}}": "{{name}}"
              }
            ]
          };
          compare(actual.keys(), expected.keys);
          compare(actual.paths(), expected.paths);
          compare(actual.values(), expected.values);
          compare(actual.objects(), expected.objects);
          compare(actual.root(), template);
        });
        it('regex testing and parse', function(){
          var template = {
            "$jason": {
              "head": {
                "{{#include}}": {
                  "templates": {
                    "body": {
                      "sections": [{
                        "header": {
                          "type": "horizontal",
                          "components": [{
                            "{{#include}}": {
                              "type": "image",
                              "url": "{{$jason.image}}"
                            },
                            "class": "avatar"
                          }]
                        },
                        "items": {
                          "{{#each $jason.items}}": {
                            "type": "label",
                            "text": {
                              "{{#include}}": "{{name}}"
                            }
                          }
                        }
                      }]
                    }
                  }
                }
              }
            }
          };
          var actual = ST.SELECT.select(template, function(key, value){
            return /#include/.test(key);
          }).transform({}).root();
          var expected = {
            "$jason": {
              "head": {
                "templates": {
                  "body": {
                    "sections": [{
                      "header": {
                        "type": "horizontal",
                        "components": [{
                          "type": "image",
                          "url": "{{$jason.image}}",
                          "class": "avatar"
                        }]
                      },
                      "items": {
                        "{{#each $jason.items}}": {
                          "type": "label",
                          "text": "{{name}}"
                        }
                      }
                    }]
                  }
                }
              }
            }
          };
          compare(actual, expected);
        });
      });
    });
    describe('value matching', function(){
      // look for values only

      it('extract out all urls', function(){
        var data = {
          "body": {
            "style": {
              "background": "http://background_url"
            },
            "sections": [{
              "items": [{
                "type": "image",
                "url": "http://hero_image_url"
              }, {
                "type": "horizontal",
                "components": [{
                  "type": "image",
                  "url": "http://avatar_url",
                  "class": "avatar"
                }, {
                  "type": "label",
                  "text": "This is a username"
                }]
              }]
            }]
          }
        };
        var actual = ST.SELECT.select(data, function(key, value){
          return /http:/.test(value);
        });
        var expected = {
          keys: ["background", "url", "url"],
          paths: ["[\"body\"][\"style\"]", "[\"body\"][\"sections\"][0][\"items\"][0]", "[\"body\"][\"sections\"][0][\"items\"][1][\"components\"][0]"],
          values: ["http://background_url", "http://hero_image_url", "http://avatar_url"],
          objects: [{
            "background": "http://background_url"
          }, {
            "type": "image",
            "url": "http://hero_image_url"
          }, {
            "type": "image",
            "url": "http://avatar_url",
            "class": "avatar"
          }]
        };
        compare(actual.keys(), expected.keys);
        compare(actual.paths(), expected.paths);
        compare(actual.values(), expected.values);
        compare(actual.objects(), expected.objects);
      });
    });
    describe('key + value matching', function(){
      // find objects that match certain combinations of key and value
      it('find all label items', function(){
        var data = {
          "body": {
            "sections": [{
              "header": {
                "type": "label",
                "text": "{{users.length}} Users"
              },
              "items": {
                "{{#each users}}": {
                  "type": "horizontal",
                  "components": [{
                    "type": "image",
                    "url": "http//blablah"
                  }, {
                    "type": "vertical",
                    "components": [{
                      "type": "label",
                      "text": "{{username}}"
                    }, {
                      "type": "label",
                      "text": "{{content}}"
                    }]
                  }]
                }
              }
            }]
          }
        };
        var actual = ST.SELECT.select(data, function(key, value){
          return key=='type' && value=='label';
        });
        var expected = {
          keys: ["type", "type", "type"],
          paths: [
            "[\"body\"][\"sections\"][0][\"header\"]",
            "[\"body\"][\"sections\"][0][\"items\"][\"{{#each users}}\"][\"components\"][1][\"components\"][0]",
            "[\"body\"][\"sections\"][0][\"items\"][\"{{#each users}}\"][\"components\"][1][\"components\"][1]"
          ],
          values: ["label", "label", "label"],
          objects: [{
            "type": "label",
            "text": "{{users.length}} Users"
          }, {
            "type": "label",
            "text": "{{username}}"
          }, {
            "type": "label",
            "text": "{{content}}"
          }]
        };
        compare(actual.keys(), expected.keys);
        compare(actual.paths(), expected.paths);
        compare(actual.values(), expected.values);
        compare(actual.objects(), expected.objects);
      });
      it('selective parsing - only parse those inside the loop', function(){
        var template = {
          "body": {
            "sections": [{
              "header": {
                "type": "label",
                "text": "{{users.length}} Users"
              },
              "items": {
                "{{#each users}}": {
                  "type": "horizontal",
                  "components": [{
                    "type": "image",
                    "url": "http//blablah"
                  }, {
                    "type": "vertical",
                    "components": [{
                      "type": "label",
                      "text": "{{username}}"
                    }, {
                      "type": "label",
                      "text": "{{content}}"
                    }]
                  }]
                }
              }
            }]
          }
        };
        var data = {
          "users": [{
            "username": "Dog",
            "content": "Woof"
          }, {
            "username": "Duck",
            "content": "Quack"
          }]
        };
        var actual = ST.SELECT.select(template, function(key, value){
          return /#each/.test(key);
        }).transform(data).root();
        console.log("Actual = ", actual);
        var expected = {
          "body": {
            "sections": [{
              "header": {
                "type": "label",
                "text": "{{users.length}} Users"
              },
              "items": [{
                "type": "horizontal",
                "components": [{
                  "type": "image",
                  "url": "http//blablah"
                }, {
                  "type": "vertical",
                  "components": [{
                    "type": "label",
                    "text": "Dog"
                  }, {
                    "type": "label",
                    "text": "Woof"
                  }]
                }]
              }, {
                "type": "horizontal",
                "components": [{
                  "type": "image",
                  "url": "http//blablah"
                }, {
                  "type": "vertical",
                  "components": [{
                    "type": "label",
                    "text": "Duck"
                  }, {
                    "type": "label",
                    "text": "Quack"
                  }]
                }]
              }]
            }]
          }
        };
        compare(actual, expected);

/*
        var actual2 = ST.include(template, data);
        compare(actual2, expected);
        */

      });
      it('selective parsing inside #each, using $root', function(){
				var template = {
					"{{#each $jason}}": {
            "type": "vertical",
            "components": [{
              "type": "image",
              "url": "{{#include $root.$document.adapter.image}}"
            }, {
              "type": "label",
              "text": "{{#include $root.$document.adapter.title}}"
            }]
          }
        };
        var data = {
          "$document": {
            "adapter": {
              "image": "{{image}}",
              "title": "{{name}}",
              "subtitle": "{{status}}"
            }
          }
        };
        var actual = ST.TRANSFORM.transform(template, data);
        var expected = {
					"{{#each $jason}}": {
            "type": "vertical",
            "components": [{
              "type": "image",
              "url": "{{image}}"
            }, {
              "type": "label",
              "text": "{{name}}"
            }]
          }
        };
        compare(actual, expected);
      });
      it('edge case include', function(){
        var template = {
          "items": {
            "{{#each $jason}}": [{
              "{{#if ('type' in this) && (type=='horizontal') }}": "horizontal"
            }, {
              "{{#else}}": "vertical"
            }]
          }
        };
        var data = {
          "$jason": [{
            "type": "horizontal"
          }, {
            "type": "non-horizontal"
          }]
        };
        var expected = {"items": ["horizontal", "vertical"]};
        var actual = ST.SELECT.select(template).transform(data).root();
        compare(actual, expected);
      });
      it('selective parsing - only parse {{content}}', function(){
        var template = {
          "body": {
            "sections": [{
              "header": {
                "type": "label",
                "text": "{{$root.users.length}} Users"
              },
              "items": {
                "{{#each users}}": {
                  "type": "horizontal",
                  "components": [{
                    "type": "image",
                    "url": "http//blablah"
                  }, {
                    "type": "vertical",
                    "components": [{
                      "type": "label",
                      "text": "{{username}}"
                    }, {
                      "type": "label",
                      "text": "{{$root.global_name}}"
                    }]
                  }]
                }
              }
            }]
          }
        };
        var data = {
          "global_name": "power",
          "users": [{
            "username": "Dog",
            "content": "Woof"
          }, {
            "username": "Duck",
            "content": "Quack"
          }]
        };
        var actual = ST.SELECT.select(template, function(key, value){
          return /\$root/.test(value);
        }).transform(data).root();

        var expected = {
          "body": {
            "sections": [{
              "header": {
                "type": "label",
                "text": "2 Users"
              },
              "items": {
                "{{#each users}}": {
                  "type": "horizontal",
                  "components": [{
                    "type": "image",
                    "url": "http//blablah"
                  }, {
                    "type": "vertical",
                    "components": [{
                      "type": "label",
                      "text": "{{username}}"
                    }, {
                      "type": "label",
                      "text": "power"
                    }]
                  }]
                }
              }
            }]
          }
        };
        compare(actual, expected);

/*
        var actual2 = ST.include(template, data);
        compare(actual2, expected);
        */
      })
    });
  });
  describe("test cases", function() {
    it("select data and parseWith", function() {
      var data = {
        "item": { "url": "http://localhost", "text": "localhost" },
        "items": [
          { "url": "file://documents", "text": "documents" },
          { "url": "https://blahblah.com", "text": "blah"  }
        ],
        "nestedItems": {
          "childItems": [{
            "url": "http://hahaha.com",
            "text": "haha"
          }, {
            "url": "https://hohoho.com",
            "text": "hoho"
          }]
        }
      };
      var parsed = ST.select(data, function(key, val) {
        return key === 'url';
      }).transformWith({
        tag: "<a href='{{url}}'>{{text}}</a>"
      });

      var root = parsed.root();
      console.log(JSON.stringify(root, null, 2));
    })
    it("partial template", function() { 
      var template = {
        "$jason": {
          "body": {
            "sections": [{
              "items": {
                "{{#each items}}": {
                  "type": "{{type}}",
                  "url": "{{url}}"
                }
              }
            }]
          }
        }
      };
      var selected = ST.select(template, function(key, val) {
        return key === 'type';
      });

      var finalTemplate = selected.transform({
        "type": "image"
      }).root();

      compare(finalTemplate, {
        "$jason": {
            "body": {
              "sections": [{
                "items": {
                  "{{#each items}}": {
                    "type": "image",
                    "url": "{{url}}"
                  }
                }
              }]
            }
          }
        }
      )
    })
    it("basic query", function() {
      var data = {
        links: [
          { "remote_url": "http://localhost" },
          { "file_url": "file://documents" },
          { "remote_url": "https://blahblah.com" }
        ],
        preview: "https://image",
        metadata: "This is a link collection"
      };

      var selection = ST.select(data, function(key, val) {
        return /https?:/.test(val);
      })

      var selected_objects = selection.objects();
      compare(selected_objects, [
        { "remote_url": "http://localhost" },
        { "remote_url": "https://blahblah.com" },
        { 
          links: [
            { "remote_url": "http://localhost" },
            { "file_url": "file://documents" },
            { "remote_url": "https://blahblah.com" }
          ],
          preview: "https://image",
          metadata: "This is a link collection"
        }
      ])

      var selected_values = selection.values();
      compare(selected_values, ["http://localhost", "https://blahblah.com", "https://image"])

      var selected_keys = selection.keys();
      compare(selected_keys, ["remote_url", "remote_url", "preview"])

      var selected_paths = selection.paths();
      compare(selected_paths, [
        "[\"links\"][0]",
        "[\"links\"][2]",
        ""
      ])
    })
  })
});
