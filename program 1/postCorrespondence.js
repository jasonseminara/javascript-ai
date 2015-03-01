/**
 * Attempts to solve the Post Correspondence Problem
 * @description You are given a collection of dominos.
 * Each domino has a string of characters on top and another string on the bottom
 * The alorithm will find whether combinations of dominos may create equal strings
 */
function postCorrespondence(dominos, qMax, depthMax, showStates, debug) {
  var maxIterations = 200000;
  
  if (typeof(showStates) === 'undefined') showStates = false;

  String.prototype.endsWith = function(suffix) {
    return this.match(suffix + "$") == suffix;
  };

  String.prototype.startsWith = function(prefix) {
    return this.indexOf(prefix) === 0;
  }

  // takes two domino strings and combines their top and bottom
  // returns one string
  this.combineDominos = function(d1, d2) {
    var left = d1.split('/');
    var right = d2.split('/');
    return left[0] + right[0] + '/' + left[1] + right[1];
  };

  // checks to see if either the top of the domino is either 
  this.isPrefix = function(dom) {
    var str = dom.split('/');
    return str[1].startsWith(str[0]) || str[0].startsWith(str[1]);
  };

  this.isPostfix = function(dom) {
    var str = dom.split('/');
    return str[1].endsWith(str[0]) || str[0].endsWith(str[1]);
  }


  // checks to see if this is a final state of the alorithm (if the top matches the bottom)
  this.isMatch = function(dom) {
    var str = dom.split('/');
    return str[1] === str[0];
  };

  this.getInvalidFragment = function(state){
    var str,invalidFragment;
    str = state.split('/');

    if(str[0].length > str[1].length){
      invalidFragment = str[0].slice(0,-str[1]);
    }else{
      invalidFragment = str[1].slice(0,-str[0]);
    }

    return invalidFragment.length? invalidFragment:state;
  };

  
  this.isValidState = this.isPostfix;
  this.invalidStates = {};
  // bfs search of the dominos
  this.search = function() {
    var combineDominos, halt, i, j, k, left, len, len1, lpos, maxIetrations, right;
    var frontier  = [];
    var found     = false;
    var halt      = false;

    // preload the frontier with a deep copy of dominos and their positions
    for (i = j = 0, len = dominos.length; j < len; i = ++j) {
      left = dominos[i];
      frontier.push([left, [i]]);
    }
    // perform the BFS
    // loop through the queue we've created thus far

    if (debug) console.log("--starting BFS--");
    while (!halt && frontier.length ) {
      if (debug) console.log("*Frontier: ", frontier)
        // pluck out the oldest item in the queue   
      var item = frontier.shift();
      left = item[0];

      // bookkeeping for path recovery
      var lpos = item[1];
      // 
      
      
      // loop through the right side of the combinations
      for (var i = 0; i < dominos.length; i++) {
        var right = dominos[i];
        var newState = this.combineDominos(right, left);
        if (debug) console.log(newState);
        if (debug) console.log(this.getInvalidFragment(newState));
        // check to see if the state is valid and if we haven't seen this state before
        if (this.isValidState(newState) && !(this.getInvalidFragment(newState) in this.invalidStates)) {

          // create a duplicate of the current path array
          var path = lpos.slice(0);

          // push this position into the path
          path.push(i);

          // attach the path to the state object
          var stateObject = [newState, path];

          // push it back into the queue to be further checked in the next iteration
          frontier.push(stateObject);

          // if we found what we're looking for
          if (this.isMatch(newState)) {
            return stateObject;
          }


          if (!(--maxIterations)) {
            // if (debug) console.log(frontier);
            halt = true;
          }
          if (frontier.length >= qMax) {
            halt = true;
            break;
          }
        } else {
          this.invalidStates[this.getInvalidFragment(newState)] = 0;
          continue;
        }
      }
    }
    
    // die here if we've exceeded our allowable max iterations over the array
    //if (!maxIterations) return false;
    
    halt=false;
    //loop through the frontier provided by the BFS, and pass it into the dfs
    if (debug) console.log("**Starting IDDFS", frontier)
    

    // perform the iddfs by increasing the depth we plunge by one each time 
    maxIterations = 500000;
    for(var j=1; j<=depthMax;j++){
      if(halt)break;
      // walk over the items in the frontier. These are the starting points for the IDDFS
      for (var node in frontier) {

        var item = frontier[node];
        if (debug) console.log('***DFS DEQUEUE', j, item);
        if(halt || found)break;
        var dfs = function(_node, limit) {
          if(found) return _node;
          if (debug) console.log(maxIterations)
          //base case 
          if (limit<=0 ){
            return;
          }  
          if(--maxIterations <=0) {
            halt=true;
            return;
          }
          var left = _node[0];

          // if we found what we're looking for
          if (this.isMatch(left)) {
            return _node;
          }
          // bookkeeping for path recovery
          var lpos = _node[1];

          for (var i = 0; i < dominos.length; i++) {
            var right = dominos[i];
            var newState = this.combineDominos(right, left);
            
            
            if (debug) console.log(newState);

            if (this.isValidState(newState) && !(this.getInvalidFragment(newState) in this.invalidStates)) {
              if (debug) console.log("--dfs--validState", newState.length, i, limit, newState)
                // create a duplicate of the current path array
              var path = lpos.slice(0);
              // push this position into the path
              path.push(i);
              // attach the path to the state object
              var stateObject = [newState, path];

              var solution = dfs(stateObject, limit - 1);

              // RETURN SOLUTION HERE
              if(solution) return solution;
            }else {
              this.invalidStates[this.getInvalidFragment(newState)] = 1;
            }
          }
        }


        // execute the DFS here
        var foundSequence = dfs(item, j);
        //if (debug) console.log("FOUNDSEQUENCE ", foundSequence);
        
        if (foundSequence) {
          return foundSequence;
        }
      }
    }
    

    return false;
  };




  // trigger the search 
  var sequence = this.search();
    if (debug) console.log(this.invalidStates);
//if (debug) console.log(maxIterations,sequence,depthMax,invalidStates);
  // we've halted at predefined limit
  if(maxIterations<0) {
    return "NO SOLUTION FOUND IN 500000 ITERATIONS"
  }

  // if we don't have a solution , but we still within our search limits, then no solution exists
  if(!sequence && depthMax) {
    return "NO SOLUTION AT THIS DEPTH"
  }

  //otherwise, we've halted at predefined limit
  if(!sequence && !maxIterations){
    return "NO SOLUTION";
  }



  // determine whether to output the states/paths of the dominos in the soln
  if (showStates) {
    sequence[1] = sequence[1].map(function(curr, i) {
      return 'D' + (curr + 1);
    });
    return sequence;
  }else{
    return sequence[0];
  }

}

debug = true;
/* from hw 1 */
// /* example #1 */ console.log(postCorrespondence(['bb/b', 'a/aab', 'abbba/bb'], 5, 50, true));
// /* example #2 */ console.log(postCorrespondence(['bbb/bb','a/bb','bb/bba'],5,50,true));
// /* example #3 */ console.log(postCorrespondence(['b/a','a/b'],5,50,true));
// /* example #4 */ console.log(postCorrespondence(['b/ba'],4,50,true,debug));
// /* example #5 */ console.log(postCorrespondence(['b/bb'],3,10,true,debug));


/* from http://people.ksp.sk/~kuko/pcp */
// /* easy #1 */ console.log(postCorrespondence(['abc/ab','aca/ca','b/acab'],1,10,true, debug));
// /* easy #2 */ console.log(postCorrespondence(['a/baa','ab/aa','bba/bb'],5,50,true, debug));
// /* easy #3 */ console.log(postCorrespondence(['bab/a','a/aba','ab/b','ba/b'],5,50,true, debug));
// /* easy #4 */ console.log(postCorrespondence(['ab/a','bbaaba/a','b/bbbb','bb/ab'],5,50,false));
// /* easy #5 */ console.log(postCorrespondence(['baa/b','a/baa','b/aa'],5,50,true));

// this has a solution, but it's outside the range of the max allowed iterations 
// /* hard #1 */ console.log(postCorrespondence(['a/b','ab/a','b/bab'],10,50,true, true));

