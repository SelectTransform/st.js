var assert = require('assert');
var st = require('../../../st.js');
var _ = require("underscore");
var stringify = require('json-stable-stringify');

var compare = function(actual, expected){
  assert.equal(stringify(actual), stringify(expected));
};

/*****

  #let API:

  takes an array of 2 items as argument.

  item 0: The variables to assign
  item 1: The template to transform

  Warning: make sure to use unique variable names, otherwise you may override unexpected variables and it may fail.

*****/

describe('$parent', function(){
  it("without #let assignment the context is different therefore transform doesn't work", function() {
    let data = {
      "verbs": ["buy", "use", "break", "fix"],
      "object": "it"
    }
    let template = {
      "{{#each verbs}}": "{{this}} {{object}}"
    }
    let actual = st.TRANSFORM.transform(template,data);
    let expected = [
      'buy {{object}}',
      'use {{object}}',
      'break {{object}}',
      'fix {{object}}'
    ];
    compare(actual, expected);
  })
  it("WITH #let assignment, variables exist all throughout the transform", function() {
    let data = {
      "verbs": ["buy", "use", "break", "fix"],
      "object": "it"
    }
    let template = {
      "{{#let}}": [{
          "object": "{{object}}"
        },
        {
          "{{#each verbs}}": "{{this}} {{object}}"
        }
      ]
    }
    let actual = st.TRANSFORM.transform(template,data);
    let expected = [
      'buy it',
      'use it',
      'break it',
      'fix it'
    ];
    compare(actual, expected);
  })
  it("works through multiple loops all the way to the leaf node", function() {
    let data = {
      "verses": [
        ["buy", "use", "break", "fix"],
        ["charge", "point", "zoom", "press"]
      ],
      "object": "it"
    }
    let template = {
      "{{#let}}": [{
          "object": "{{object}}"
        },
        {
          "{{#each verses}}": {
            "{{#each this}}": "{{this}} {{object}}"
          }
        }
      ]
    }
    let actual = st.TRANSFORM.transform(template,data);
    let expected = [
      [ 'buy it', 'use it', 'break it', 'fix it' ],
      [ 'charge it', 'point it', 'zoom it', 'press it' ]
    ];
    compare(actual, expected);
  })
  it("using external library", function() {
    let data = {
      "items": [{
        "children": ["A", "A", "B", "C", "C", "D", "E", "E"]
      }, {
        "children": ["A", "A", "A", "A"]
      }]
    }
    let template = {
      "{{#let}}": [
        {
          "_": _
        },
        {
          "{{#each items}}": {
            "{{#each _.uniq(children)}}": {
              "text": "{{this}}"
            }
          }
        }
      ]
    }
    let actual = st.TRANSFORM.transform(template,data);
    let expected = [
      [ 
        { text: 'A' },
        { text: 'B' },
        { text: 'C' },
        { text: 'D' },
        { text: 'E' }
      ],
      [ 
        { text: 'A' }
      ]
    ]
    compare(actual, expected);
  })
  it("#each", function() {
    let data = {
      items: [{
        name: "Alice",
        items: ["A", "L", "I"]
      }, {
        name: "Bob",
        items: ["B", "O", "B"]
      }]
    }
    let template = {
      "{{#each items}}": {
        "{{#let}}": [
          {
            "$parent": "{{this}}",
            "$parent_index": "{{$index}}"
          },
          {
            "{{#each items}}": "{{$parent.name}} {{$parent_index.toString()}} {{this}}"
          }
        ]
      }
    }
    var actual = st.TRANSFORM.transform(template,data);
    var expected = [
      ["Alice 0 A", "Alice 0 L", "Alice 0 I"],
      ["Bob 1 B", "Bob 1 O", "Bob 1 B"]
    ]
    compare(actual, expected);
  })
})
