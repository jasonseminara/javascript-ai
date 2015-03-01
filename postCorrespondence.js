/**
 * Attempts to solve the Post Correspondence Problem
 * @description You are given a collection of dominos.
 * Each domino has a string of characters on top and another string on the bottom
 * The alorithm will find whether combinations of dominos may create equal strings
 */
function postCorrespondence(dominos, qMax, depthMax, showStates = false) {
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
    var frontier = [];
    var found = false;

    // preload the frontier with a deep copy of dominos and their positions
    dominos.forEach(function(left, i) {
      frontier.push([left, [i]]);
    });
    // perform the BFS
    // loop through the queue we've created thus far

    console.log("--starting BFS--");

    while (frontier.length && frontier.length <= qMax) {
      console.log("*Frontier: ", frontier)
        // pluck out the oldest item in the queue   
      var item = frontier.shift();
      var left = item[0];

      // bookkeeping for path recovery
      var lpos = item[1];
      var halt = false;
      // loop through the right side of the combinations

      for (var i = 0; i < dominos.length; i++) {
        var right = dominos[i];
        var newState = this.combineDominos(right, left);
        console.log(newState)
        if (this.isValidState(newState) && !(newState in invalidStates)) {

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
            console.log(frontier);
            throw 'MAXITERATIONS';
          }
          if (frontier.length >= qMax) {
            halt = true;
            break;
          }
        } else {
          invalidStates[newState] = 1;
        }
      }
      if (halt) break;
    }

    //loop through the frontier provided by the BFS, and pass it into the dfs
    console.log("**Starting IDDFS", frontier)
    var r = 0;
    for (var node in frontier) {

      var item = frontier[node];
      console.log('***DFS DEQUEUE', r++, item);
      var ids = function(_node, limit) {
        //base case 
        //if(this.isMatch(_node[0])) return _node;
        if (!limit) return;

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
          console.log(newState);
          if (this.isValidState(newState)) {
            console.log("----validState", limit, newState)
              // create a duplicate of the current path array
            var path = lpos.slice(0);
            // push this position into the path
            path.push(i);
            // attach the path to the state object
            var stateObject = [newState, path];

            var solution = ids(stateObject, limit - 1);
          }
        }
      }
      var foundSequence = ids(item, 9);
      //console.log("FOUNDSEQUENCE ", foundSequence);
      if (foundSequence) {
        return foundSequence;
      }
    }

    return false;
  };
  var sequence = this.search();

  if (!sequence) {
    console.log("NO SOLUTION");
    return "NO SOLUTION";
  }


  sequence[1] = sequence[1].map(function(curr, i) {
    return 'D' + (curr + 1);
  });

  if (showStates) {

  }


  /*switch(soln){
    case 'path':
      // return the path
    break;
    

  }*/
  console.log(sequence);
  return sequence;
}

postCorrespondence(['bb/b', 'a/aab', 'abbba/bb'], 5, 50, true);
//postCorrespondence(['b/ba'],4,50,true);
//postCorrespondence(['bbb/bb','a/bb','bb/bba'],5,50,true);
// This is just a sample script. Paste your real code (javascript or HTML) here.

if ('this_is' == /an_example/) {
  of_beautifer();
} else {
  var a = b ? (c % d) : e[f];
}