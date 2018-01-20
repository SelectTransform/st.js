var assert = require('assert');
var ST = require('../../../st.js');
var stringify = require('json-stable-stringify');
var compare = function(actual, expected){
  assert.equal(stringify(actual), stringify(expected));
};

describe('#?', function() {
  it("using ternary expression", function() {
    var template = {
      "test1": "{{#? (one === 1 ? one : false) }}",
      "test2": "{{#? (two === 2 ? two : false) }}"
    }
    var data = {
      one: 1,
      two: 3
    }
    var actual = ST.transform(template, data);
    var expected = {
      "test1": 1
    }
    compare(actual, expected);
  })
  it("basic", function() {
    var template = {
      "test1": "{{#? test1}}",
      "test2": "{{#? test2}}"
    }
    var data = {
      test1: "1" 
    }
    var actual = ST.transform(template, data);
    var expected = {
      "test1": "1"
    }
    compare(actual, expected);
  })
  it("example 2", function() {
    var data = {
      notifications: {
        home: 1
      }
    }
    var template = {
      tabs: [{
        text: "home",
        badge: "{{notifications.home}}"
      }, {
        text: "message",
        badge: "{{#? notification.message}}"
      }, {
        text: "invite",
        badge: "{{notification.invite}}"
      }]
    }
    var actual = ST.transform(template, data);
    var expected = {
      tabs: [{
        text: "home",
        badge: 1
      }, {
        text: "message"
      }, {
        text: "invite",
        badge: "{{notification.invite}}"
      }]
    }
    compare(actual, expected);
  })
  /*
  *
  {
    test: [{
      "{{#if 'test' in this}}": "{{test}}"
    }, {
      "{{#else}}": "{{#exclude}}"
    }]
  }

  {
    "{{#when 'test' in this}}": {
      "text": "{{test}}"
    }
  }

  {
    "test": "{{#? test}}"
  }

  {
    test: {
      "{{#if 'test' in this}}": "{{test}}"
    }
  }
  */
});
