"use strict";
var q = require("q");


/**
    srtrcuture used to manage predicates
*/
function Flights_action (){}

/**
 * returns true or false depending if the collection types are valid on both side among the ancestors of two collections
 */
Flights_action.prototype.isDirect = function(nbStops){
    return nbStops == 0;
};



/*
	The only visible function in this module. It
	only creates a new me and launch it.
*/
var getInstance = function(){
	return new Flights_action();
};

module.exports.getInstance = getInstance;

