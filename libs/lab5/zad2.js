/*jshint globalstrict: true devel: true */
'use strict';

var _ = require("underscore)");

String.prototype.nbsp = function(){
  console.log(this)
  return 'a'
};

var s = "ala i as poszli w las";

s.nbsp();