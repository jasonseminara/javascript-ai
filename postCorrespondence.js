/**
* Attempts to solve the Post Correspondence Problem
* @description You are given a collection of dominos.
* Each domino has a string of characters on top and another string on the bottom
* The alorithm will find whether combinations of dominos may create equal strings
*/
function postCorrespondence(dominos, qMax, depthMax, soln) {

	var maxIterations = 100;

	String.prototype.endsWith = function(suffix) {
    return this.match(suffix+"$") == suffix;
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

  this.isPostfix = function(dom){
  	var str = dom.split('/');
  	return str[1].endsWith(str[0]) || str[0].endsWith(str[1]);
  }


  // checks to see if this is a final state of the alorithm (if the top matches the bottom)
  this.isMatch = function(dom) {
    var str = dom.split('/');
    return str[1] === str[0];
  };

  this.isValidState = this.isPostfix;

  // bfs search of the dominos
	this.bfsSearch = function (){
		var Q =[];
		var found = false;
  	
  	// preload the Q with a deep copy of dominos and their positions
  	dominos.forEach( function( left,i ){
  		Q.push([left,[i]]);
  	});

  	// loop through the queue we've created thus far
		while(Q.length && Q.length <= qMax){
			
			// pluck out the oldest item in the queue 	
			var item = Q.shift();
			var left = item[0];

			// bookkeeping for path recovery
			var lpos = item[1];

			// loop through the right side of the combinations

			for (var i=0;i<dominos.length;i++){
				var right = dominos[i];
				var newState = this.combineDominos(right,left);
				console.log(newState)
				if( this.isValidState( newState ) ){
					
					// create a duplicate of the current path array
					var path = lpos.slice(0);

					// push this position into the path
					path.push(i);

					// attach the path to the state object
					var stateObject  =[ newState, path ];
					
					// push it back into the queue to be further checked in the next iteration
					Q.push(stateObject);
					
					// if we found what we're looking for
					if(this.isMatch(newState)){
						return stateObject;
					}

					
					if(!(--maxIterations)){
						console.log(Q);
						throw 'MAXITERATIONS';
					}
				}
			}
		}

		if(Q.length > qMax){
						console.log(Q)
						throw 'QMAX';
					}


				console.log(Q);
		return false;
	};
	var sequence = this.bfsSearch();
	/*switch(soln){
		case 'path':
			// return the path
			sequence[1] = sequence[1].map( function(curr,i){
				//console.log(curr)
				return 'D'+(curr+1);
			});
		break;
		

	}*/
	return sequence;
}

console.log(postCorrespondence(['c/cca','ac/ba','bb/b','ac/cb'],4,6,'path'));











function newNode( val ){
	return {
		'name'     : val,
		'children' : []
	};
}

function bfs( node, v ){
	var Q = [];
	var seen = [];
	Q.push(node);
	seen.push(node);
	while (Q.length){
		node = Q.shift();
		for (var i in node.children){
			var child = node.children[i];
			if(seen.indexOf(child.name) === -1){
				Q.push(child);
				seen.push(child);
				console.log(child.name);
			}
		}
	}
}





