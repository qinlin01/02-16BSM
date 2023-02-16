/**
 * declare 'clip-two' module with dependencies
 */
'use strict';
// window.onkeydown = function(){if(event.keyCode==13 ) return false;};
window.onkeydown = function(){if(event.keyCode==13 && ( event.srcElement.tagName == "INPUT" && ( event.srcElement.type == "text") )) return false;};

angular.module("lrApp", [
]).
value('froalaConfig', {
  toolbarInline: false,
  placeholderText: 'Enter Text Here'
});