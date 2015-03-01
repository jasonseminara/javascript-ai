/**
 * Attempts to solve the Post Correspondence Problem
 * @description You are given a collection of dominos.
 * Each domino has a string of characters on top and another string on the bottom
 * The alorithm will find whether combinations of dominos may create equal strings
 */
function postCorrespondence(dominos, qMax, depthMax, showStates) {
  var maxIterations = 1000;
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

  this.invalidStates = {};
  this.isValidState = this.isPostfix;

  // bfs search of the dominos
  this.search = function() {

    var frontier  = [];
    var found     = false;
    var halt      = false;

    // preload the frontier with a deep copy of dominos and their positions
    dominos.forEach(function(left, i) {
      frontier.push([left, [i]]);
    });
    // perform the BFS
    // loop through the queue we've created thus far

    // console.log("--starting BFS--");
    while (!halt && frontier.length ) {
      // console.log("*Frontier: ", frontier)
        // pluck out the oldest item in the queue   
      var item = frontier.shift();
      var left = item[0];

      // bookkeeping for path recovery
      var lpos = item[1];
      // 
      
      
      // loop through the right side of the combinations
      for (var i = 0; i < dominos.length; i++) {
        var right = dominos[i];
        var newState = this.combineDominos(right, left);
        // console.log(newState)

        if(newState in invalidStates) continue;
        // check to see if the state is valid and if we haven't seen this state before
        if (this.isValidState(newState)) {

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
            // console.log(frontier);
            halt = true;
          }
          if (frontier.length >= qMax) {
            halt = true;
            break;
          }
        } else {
          invalidStates[newState] = 0;
        }
      }
    }
    
    // die here if we've exceeded our allowable max iterations over the array
    //if (!maxIterations) return false;
    
    halt=false;
    //loop through the frontier provided by the BFS, and pass it into the dfs
    // console.log("**Starting IDDFS", frontier)
    

    // perform the iddfs by increasing the depth we plunge by one each time 
    maxIterations = 10000;
    for(var j=1; j<=depthMax;j++){
      if(halt)break;
      // walk over the items in the frontier. These are the starting points for the IDDFS
      for (var node in frontier) {

        var item = frontier[node];
        // console.log('***DFS DEQUEUE', j, item);
        if(halt)break;
        var dfs = function(_node, limit) {
          // console.log(maxIterations)
          //base case 
          if (limit<=0 ){
            return;
          }  
          if(--maxIterations <=0) {
            halt=true;
            return;
          }
          var left = item[0];

          // if we found what we're looking for
          if (this.isMatch(left)) {
            return left;
          }
          // bookkeeping for path recovery
          var lpos = item[1];

          for (var i = 0; i < dominos.length; i++) {
            var right = dominos[i];
            var newState = this.combineDominos(right, left);
            
            if(newState in invalidStates) continue;
            // console.log(newState);

            if (this.isValidState(newState)) {
              // console.log("--dfs--validState", limit, newState)
                // create a duplicate of the current path array
              var path = lpos.slice(0);
              // push this position into the path
              path.push(i);
              // attach the path to the state object
              var stateObject = [newState, path];

              var solution = dfs(stateObject, limit - 1);
            }else {
              invalidStates[newState] = 1;
            }

          }
        }


        // execute the DFS here
        var foundSequence = dfs(item, j);
        //console.log("FOUNDSEQUENCE ", foundSequence);
        
        if (foundSequence) {
          return foundSequence;
        }
      }
    }
    

    return false;
  };




  // trigger the search 
  var sequence = this.search();

//console.log(maxIterations,sequence,depthMax,invalidStates);
  // we've halted at predefined limit
  if(maxIterations<0) {
    console.log("NO SOLUTION FOUND IN 100000 ITERATIONS");
    return "NO SOLUTION FOUND IN 100000 ITERATIONS"
  }

  // if we don't have a solution , but we still within our search limits, then no solution exists
  if(!sequence && depthMax) {
    console.log("NO SOLUTION AT THIS DEPTH");
    return "NO SOLUTION AT THIS DEPTH"
  }

  //otherwise, we've halted at predefined limit
  if(!sequence && !maxIterations){
    console.log("NO SOLUTION");
    return "NO SOLUTION";
  }



  // determine whether to output the states/paths of the dominos in the soln
  if (showStates) {
    sequence[1] = sequence[1].map(function(curr, i) {
      return 'D' + (curr + 1);
    });
    console.log(sequence);
    return sequence;
  }else{
    console.log(sequence[0]);
    return sequence[0];
  }

}

//postCorrespondence(["c/cca", "ac/ba","bb/b","ac/cb"], 5, 50,true);
//postCorrespondence(['bb/b', 'a/aab', 'abbba/bb'], 5, 50, true);
//postCorrespondence(['b/ba'],4,50,true);
postCorrespondence(['bbb/bb','a/bb','bb/bba'],5,50,true);
