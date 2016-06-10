"use strict";
var q = require("q");


/**
    A structure containing meta information about a concept
    for each predicates, a value is filled
    Methods specific to collection are then used to deduce things
    ex: {name:"is", value:"thing"} => a method can grab every parents to create a tree
*/
function Collection (){
    this.name = '';
    this.parent = '';
    this.predicates = [];
    this.attributes = [];
    this.children = [];
}


/**
 * Simply display the list of al the collection's children's name
 */
Collection.prototype.listChildren = function(){
    for(var cpt=0, l=this.children.length; cpt<l; cpt++){
        console.log(this.children[cpt]);
    }
};


/**
 * Here we filter the predicates p#has to get all the possible attributes of the collection
 */
Collection.prototype.getPossibleAttributes = function(){
    return this.predicates.filter(function(p){return p.name === 'p.has';}).map(function(p){return p.value;});
};


/**
 * Returns an array with all the labels associated to this element
 */
Collection.prototype.getLabels = function(){
    return this.attributes.filter(function(a){return a.name === 'c.label';}).map(function(a){return a.value;});
};




/*
	The only visible function in this module. It
	only creates a new me and launch it.
*/
var getInstance = function(){
	return new Collection();
};

module.exports.getInstance = getInstance;

