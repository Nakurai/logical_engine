"use strict";
var q = require("q"),
fs = require('fs'),
buckets = require('buckets-js'),
byline = require('byline'),
pred = require('./predicate.js'),
col = require('./collection.js');


/**
 *   Simple example of how a computer could understand
 * 1 Load predicates
 * 2 Load collections and check all the predicates while adding them (further, it will be able to learn on the fly by using the exact same process, allow us to ensure that the ontology is consistent)
 * 3 Load instances and create methods to infer information about them in the data structure
 * 4 At the same time, create an other dictionary linking labels to collections or instances !
 * 
*/
function Engine (){
    this.rulesFile = './rules.txt',
    this.rootNodeName = 'c.thing',
    this.collections = new buckets.Dictionary();
    this.predicates = new buckets.Dictionary();
    this.instances = new buckets.Dictionary();
    this.index = new buckets.MultiDictionary();

}

/**
	Load everything the IA needs to perform well.
	For example, its current state is calculated, its memory and sensors
	are loaded,...
*/
Engine.prototype.prepare = function(){
var that = this;
/*    
    var deferred = q.defer();

    deferred.resolve('ready');

	return deferred.promise;
  */  
 return this.loadPredicates()
 .then(this.loadCollectionsTree.bind(this))
 .then(this.loadCollectionsPredicates.bind(this))
 .then(this.loadCollectionsAttributes.bind(this))
 .then(this.loadIndex.bind(this))
 .then(function(){
    console.log(that.collections.size()+' concepts loaded');
    //console.log(JSON.stringify(that.collections.get('c.thing')));
    var c = that.collections.get('c.airport');
    console.log(JSON.stringify(c));
    
    return 'ready';
 });
};



/**
 * Read a rules' file and load predicates in memory. That allow us to have a full description of what are the valid format for all of them
*/
Engine.prototype.loadPredicates = function () {
	var def = q.defer(),
    start = Date.now();

    
    try {
        var stream = byline.createStream(fs.createReadStream(this.rulesFile)),
        that = this;
        // For each line read, a word structure is stored
        stream.on('data', function(line) {
            line = String(line);
            if(!line.startsWith('//') && line.startsWith('p.')){
                var info = line.split(' ');
                var newP = pred.getInstance();
                newP.leftSideType = info[1],
                newP.rightSideType = info[2];
                
                that.predicates.set(info[0], newP);
            }        
            else{}
        });
        
        // When the file is completely loaded, just display the number of words keeped
        stream.on('end', function() {
            def.resolve();
        });
        
        // If any error occurs
        stream.on('error', function(err) {
            def.reject(err);
        });
    }
    catch(err) {
        def.reject(err);
    }
    
    return def.promise;
};



/**
 * First reading to have all the collections loaded and being able to retrieve the type of all of them.
 * the type of a collection is all its parent until the thing element
 * As the rules aren't always in order, we have to create a temporary dictionay to store the fact that we encountered a child of a parent not yet in the dictionary. Once we stumble upon the parent, the stored child is added to its information
*/
Engine.prototype.loadCollectionsTree = function () {
	var def = q.defer(),
    start = Date.now();

    
    try {
        var stream = byline.createStream(fs.createReadStream(this.rulesFile)),
        that = this,
        tmpParent = new buckets.MultiDictionary();
        
        // For each line read, a word structure is stored
        stream.on('data', function(line) {
            line = String(line);
            var info = line.split(' ');
            if(!line.startsWith('//') && line.startsWith('c.') && info[1] === 'p.is'){
                // Creation of a new collection
                var newC = col.getInstance();
                newC.name = info[0];
                newC.parent = info[2];
                
                // If the current collection had children already loaded, we add these children to its children array
                var arrayOfChildrenAlreadyLoaded = tmpParent.get(info[0]);
                if(arrayOfChildrenAlreadyLoaded !== undefined){
                    newC.children = newC.children.concat(arrayOfChildrenAlreadyLoaded);
                    tmpParent.remove(info[0]);
                }
                that.collections.set(info[0], newC);
                
                
                // Here we add the current collection to its parent's children array. If this parent isn't registered yet, its kept aside in a temporary structure and will be added later
                var parent = that.collections.get(info[2]);
                if(parent !== undefined){
                    parent.children.push(info[0]);
                }
                else{
                    tmpParent.set(info[2], info[0]);
                }
            }        
            else{}
        });
        
        // When the file is completely loaded, just display the number of words keeped
        stream.on('end', function() {
            tmpParent.clear();
            tmpParent = null;
            def.resolve();
        });
        
        // If any error occurs
        stream.on('error', function(err) {
            tmpParent.clear();
            tmpParent = null;
            def.reject(err);
        });
    }
    catch(err) {
        def.reject(err);
    }
    
    return def.promise;
};

/**
 * List all the ancestors of a collection until the root, including itself at index 0 !
 */
Engine.prototype.listAncestors = function (colName, ancestorsArray){

    var c = this.collections.get(colName);
    if(c !== undefined){
        
        ancestorsArray.push(c.name);
        
        if(c.parent === this.rootNodeName){
            ancestorsArray.push(c.parent);
            return ancestorsArray;
        }
        else{
            return this.listAncestors(c.parent, ancestorsArray);
        }
    }
    else{
        return ancestorsArray;
    }
    
};


/**
 * Now we parse the file again loading, the predicates into the collections after checking they are consistent
 * For now,  each predicate can have only one type of collection left and right
*/
Engine.prototype.loadCollectionsPredicates = function () {
	var def = q.defer(),
    start = Date.now();
    
    try {
        var stream = byline.createStream(fs.createReadStream(this.rulesFile)),
        that = this;
        
        // For each line read, a word structure is stored
        stream.on('data', function(line) {
            line = String(line);
            var info = line.split(' ');
            if(!line.startsWith('//') && line.startsWith('c.') && info[1].startsWith('p.')){
                var c = that.collections.get(info[0]);
                if(c !== undefined){
                    
                    // once the collection has been fetched, we check if the predicate is valid:
                    var p = that.predicates.get(info[1]);
                    // if everything's alright, then BOUM ! new predicate for this collection
                    if(p.isValid(that.listAncestors(info[0], []), that.listAncestors(info[2],[]))){
                        c.predicates.push({name:info[1], value:info[2]});
                        that.collections.set(info[0], c);    
                    }
                    // else, well we indicates that something went wrong
                    else{
                        console.log('invalid predicate '+line);
                    }       
                }
            }
        });
        
        // When the file is completely loaded, just display the number of words keeped
        stream.on('end', function() {
            def.resolve();
        });
        
        // If any error occurs
        stream.on('error', function(err) {
            def.reject(err);
        });
    }
    catch(err) {
        def.reject(err);
    }
    
    return def.promise;
};




/**
 * List all the ancestors of a collection until the root, including itself at index 0 !
 */
Engine.prototype.listAttributes = function (colName, attrArray){

    var c = this.collections.get(colName);
    if(c !== undefined){
        attrArray = attrArray.concat(c.getPossibleAttributes());
        if(c.name === this.rootNodeName){
            return attrArray;
        }
        else{
            return this.listAttributes(c.parent, attrArray);
        }
    }
    else{
        return attrArray;
    }
    
};



/**
 * Normally, all predicates and collections are now settled and consistent. We have to load the 
 * attributes of a collection to see what are their specificities and be able to create a reference
 * of the characteristics
*/
Engine.prototype.loadCollectionsAttributes = function () {
	var def = q.defer(),
    start = Date.now();
    
    try {
        var stream = byline.createStream(fs.createReadStream(this.rulesFile)),
        that = this;
        
        // For each line read, a word structure is stored
        stream.on('data', function(line) {
            line = String(line);
            var info = line.split(' ');
            if(!line.startsWith('//') && line.startsWith('c.') && info[1].startsWith('c.')){
                var c = that.collections.get(info[0]);
                if(c !== undefined){
                    
                    // once the collection has been fetched, we get all the valid attribute of this collection
                    var validAttributes = that.listAttributes(info[0], []);

                    // if the current attribute is valid, then the collection is updated
                    if(validAttributes.indexOf(info[1]) !== -1){
                        c.attributes.push({name:info[1], value:info[2]});
                        that.collections.set(info[0], c);
                    }
                    // else, well we indicates that something went wrong
                    else{
                        console.log('invalid attribute '+line);
                    }       
                }
            }
        });
        
        // When the file is completely loaded, just display the number of words keeped
        stream.on('end', function() {
            def.resolve();
        });
        
        // If any error occurs
        stream.on('error', function(err) {
            def.reject(err);
        });
    }
    catch(err) {
        def.reject(err);
    }
    
    return def.promise;
};




/**
 * Okay, the graph is loaded, but when a sentence is arriving, we only have words to use
 * Here is creatingan index linking all the labels to the concept itself
 * If we want to add an other language, there is only the need to add the labels
 * For now, only one label is allowed
*/
Engine.prototype.loadIndex = function () {
    var def = q.defer(),
    start = Date.now(),
    that = this,
    nbCol = this.collections.size(),
    colParsed = 0;
    
   this.collections.forEach(function(key, col){
        var labels = col.getLabels();
        for(var cpt=0, l=labels.length; cpt<l; cpt++){
            that.index.set(labels[cpt], col.name);
        }
        
        colParsed++;
        if(colParsed === nbCol){
            def.resolve();
        }
   });
    
    return def.promise;
    
};















/*
	The only visible function in this module. It
	only creates a new me and launch it.
*/
var getInstance = function(){
	return new Engine();
};

module.exports.getInstance = getInstance;
