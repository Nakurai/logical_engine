"use strict";
var q = require("q");


/**
    srtrcuture used to manage predicates
*/
function Predicate (){
    this.leftSideType = '';
    this.rightSideType = '';
}

/**
 * returns true or false depending if the collection types are valid on both side among the ancestors of two collections
 */
Predicate.prototype.isValid = function(leftAncestors, rightAncestors){
    return leftAncestors.indexOf(this.leftSideType) !== -1 && rightAncestors.indexOf(this.rightSideType) !== -1;
};



/*
	The only visible function in this module. It
	only creates a new me and launch it.
*/
var getInstance = function(){
	return new Predicate();
};

module.exports.getInstance = getInstance;

