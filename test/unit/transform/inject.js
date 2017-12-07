var assert = require('assert');
var ST = require('../../../st.js');
var stringify = require('json-stable-stringify');
var compare = function(actual, expected){
  assert.equal(stringify(actual), stringify(expected));
};

describe("SELECT.inject", function() {
  it('underscore', function() {
    const _ = require('underscore')
    const data = {
      data: [1,2,3,3,3,4,4,4,4,5]
    }
    const res = ST.select(data).inject({_:_}).transformWith({
      "result": "{{_.uniq(data)}}"
    }).root()
    compare(res, {"result": [1,2,3,4,5]})
  })
  it('multiple libraries: underscore + he', function() {
    const _ = require('underscore')
    const he = require('he');
    const data = {
      data: [1,2,3,3,3,4,4,4,4,5]
    }
    const res = ST.select(data).inject({
      _:_,
      he: he
    }).transformWith({
      "_": "{{_.uniq(data)}}",
      "he": "{{he.decode('no man&#39;s land')}}"
    }).root()
    compare(res, {"_": [1,2,3,4,5], "he": "no man's land"})
  })
})
