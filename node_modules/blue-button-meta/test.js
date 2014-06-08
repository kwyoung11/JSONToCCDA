var expect = require('chai').expect;
var assert = require('chai').assert;

var meta = require("./index.js").CCDA;

describe('blue-button-meta.js test', function(){


    it('9 templates', function(){
      expect(Object.keys(meta.templates)).to.have.length(9);
    });

    it('70 sections', function(){
      expect(Object.keys(meta.sections)).to.have.length(70);
    });

    it('76 clinical statements', function(){
      expect(Object.keys(meta.statements)).to.have.length(76);
    });

});