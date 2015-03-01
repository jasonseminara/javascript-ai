# README #

This is Programming Assignment 1 for Artificial Intelligence, Spring 2015
@Author Jason Seminara (js4308@cs.nyu.edu)
@date 2015-02-29
@language javascript
N12517906
CSCI-GA.2560-001


### Application Description ###

* This application attempts to solve the Post Correspondence Problem by first performing a queue-limited Breadth First Search and then performing a Iterative Depth-first search on the resulting queue. 
* The initial queue size and DFS iteration limit are defined by the user.
* There is an upper limit of 500000 iterations in each of the BFS and DFS portions of the application. 


### Function Signature and Parameters ###

* The application comes in the form of a non-outputting function. To return output to the user, please wrap your call in console.log();
*postCorrespondence(dominos, qMax, depthMax, showStates, debug)
 * **dominoes** _(string array)_ : an array of domino strings, in the form 'top/bottom' (e.g. ['aa/bb','bb/aa'])
 * **qMax** _(integer)_ : a positive integer representing the maximum size of the queue used during the BFS portion of the search.
 * **depthMax** _(integer)_ : a positive integer representing the maximum depth of iterative deepening during the DFS portion of the search.
 * **showStates** _(boolean)_ : turns on reporting of the states of the dominos found during the search.
 * **debug** _(boolean)_ : (optional) turns on debugging. Shows the current state of processing.  



### How do I execute this? ###

* This JavaScript application was coded for Nodejs v0.12.0, but can be run within the console area of most major modern browsers.
* No special packages are required, only the JavaScript language.
* The application comes in the form of a non-outputting function. To return output to the user, please wrap your call in console.log();


### Usage Examples ###
Any one of the following will execute the application:
* console.log( postCorrespondence( ['bb/b', 'a/aab', 'abbba/bb'], 5, 50, true) );
* console.log( postCorrespondence( ['bbb/bb','a/bb','bb/bba'],5,50,true) );
* console.log( postCorrespondence( ['b/a','a/b'],5,50,true) );
* console.log( postCorrespondence( ['b/ba'],4,50,true,debug) );
* console.log( postCorrespondence( ['b/bb'],3,10,true,debug) );

### Output ###
If a pattern is found:
  * The application will output the first match of equal strings that it finds. If the 'showStates' flag is set to true, it will also display the states of each domino in the sequence. 
If a pattern is not found:
  * The application will output an appropriate erroe message:
    * **NO SOLUTION AT THIS DEPTH** No solution was found within _depthMax_ iterations of iterative deepening portion of the search.
    * **NO SOLUTION FOUND IN 500000 ITERATIONS** This means that inner limit of iterations has been exhausted and the program has returned without a solution.
    * **"NO SOLUTION** The program exited normally (within bounds), but did not find a solution. 


### Author ###

* Jason Seminara (js4308@cs.nyu.edu)
