var assert = require('assert');
var st = require('../../../st.js');
var stringify = require('json-stable-stringify');
var compare = function(actual, expected){
  assert.equal(stringify(actual), stringify(expected));
};

describe('TRANSFORM.tokenize', function(){
  describe('expression extraction', function(){
    it('should return correct expression', function(){
      var f = "#each $jason.items";
      var fun = st.TRANSFORM.tokenize(f);
      compare(fun.expression, "$jason.items");
    });
    it('should return correct expression even when it contains spaces', function(){
      var f = "#if $jason.items && $jason.items.length > 0";
      var fun = st.TRANSFORM.tokenize(f);
      compare(fun.expression, '$jason.items && $jason.items.length > 0');
    });
  });
  describe('name extraction', function(){
    it('#if', function(){
      var f = "#if $jason.items && $jason.items.length > 0";
      var fun = st.TRANSFORM.tokenize(f);
      compare(fun.name, '#if');
    });
    it('#each', function(){
      var f = "#each channel.items";
      var fun = st.TRANSFORM.tokenize(f);
      compare(fun.name, '#each');
    });
    describe('#include', function(){
      it('no space', function(){
        var f = "#include";
        var fun = st.TRANSFORM.tokenize(f);
        compare(fun.name, '#include');
      });
      it('with preceding space', function(){
        var f = " #include";
        var fun = st.TRANSFORM.tokenize(f);
        compare(fun.name, '#include');
      });
      it('with succeeding space', function(){
        var f = "#include ";
        var fun = st.TRANSFORM.tokenize(f);
        compare(fun.name, '#include');
      });
      it('with arguments which will be thrown out', function(){
        var f = "#include items";
        var fun = st.TRANSFORM.tokenize(f);
        compare(fun.name, '#include');
      });
    });
  });
});
