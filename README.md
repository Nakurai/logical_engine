AI REASONING
===============================

Purpose
-------------------------------
Finding patterns in large amount of data is whay machine learning allowsus to do, but what about thereferences we already knows since we are born or so, because our senses and the simple daily life taught us so ?
How do a machine could know that "human" usually means two arms and two legs ? That if I want to say that the grass is purple, it means something unusual happens ?
This program is a small attempt at designing such a database and the inherent logic of it. Already existing resources already exists (like dbpedia, schema.org and so on) and could fill the hierarchical links between components; I don't know yet about the logical reasoning.

In any case, I figured it would be a good exercise to probe the challenges of this kind of organisation, how to tackle them, to be aware of more mature opportunities...or simply enrich it later

Files description
-------------------------------
actions/ - a folder with all the possible actions of the program. We are understanding the world according to what we are able to do, even the smallest action. We have crafted different abilities and talents, and we are rsponding to the world according to these abilities. From the apparently easiest ones (breathing) to the most complex (rocket science or baking bread)
public/ - public resources for the website pages. For now, it's empty
view/ - layout of the webpages. For now, it's empty
collection.js - each thing in this word in a concept. "Car" is a word used to refer to the concept of "car", ie a mean of transport with four wheels and at least two doors. This file define the structure of a concept, and all relevant operation that could be done on it
engine.js - where everything's happening for now, load all the resources and contain the logic. For further development, this file's content should be splitted
package.json - trivial
predicate.js - predicate are links of different nature between two concepts (parents, defining attributes and so on...). This file create the structure of a predicate and all useful methods to do so
rules.txt - the knowledge base itself with a few examples. For further development, it would be smart to split this file by domain, and loading only the core rules every times
server.js - the web server of the project. for now, does not serve any page


