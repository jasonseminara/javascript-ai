(function() {
  var inputData,kb,fs=require("fs");
  function parseIncomingDataFile() {

    if (process.argv.length < 3) {
      console.log('Usage: node ' + process.argv[1] + ' FILENAME');
      process.exit(1);
    }

    // Read the file and print its contents.

    // filesystem utils
    var a, row
      // read in the knowledge base
      ,
      axioms = [],
      filename = process.argv[2],
      input = {},
      inputData = fs.readFileSync(filename).toString().split('\n');


    input.arcs = []
    input.goal = []

    input.locations = inputData.shift().trim().split(' ') // line 0
    input.items = inputData.shift().trim().split(' ') // line 1
    input.trucks = inputData.shift().trim().split(' ') // line 2
    input.timeLimit = +inputData.shift() // line 3

    inputData.shift() //START
    input.startState = []

    // loop through the remainder of the file; stop if we've hit the goal state
    while (a = inputData.shift(), a != "GOAL") {

      row = a.trim().split(' ');

      // these are pairs of either trucks/locations or items/locations 
      if (input.trucks.indexOf(row[0]) !== -1 || input.items.indexOf(row[0]) !== -1) {
        input.startState.push(row);
      } else {
        // don't split the arcs; we'll fix them up later
        input.arcs.push(a.trim());
      }
    }

    // we've made it into the 'GOAL' section, push in the remainder of the goal states
    while (a = inputData.shift()) {
      input.goal.push( a.trim().split(' ') );
    }

    // the arcs may come in triples or tuples. If it's a triple, split it up into in/out arc tuples
    // a b c => (a,b),(a,c)
    input.arcs = input.arcs.reduce(function(arr, arc) {
      var tail;
      arc = arc.split(' ');
      tail = arc.shift();

      arc.forEach(function(head) {
        arr.push([tail, head]);
      });
      return arr;
    }, []);

    return input;
  }




  function atom(symbol) {
    return symbol.replace(/^(~|-)?/, '');
  };

  function parseSymbols(sentences) {
    var hashMap = {};
    var i = 1;
    // var symbols = sentences.split(/[\n\s]/);
    //console.log(symbols);
    sentences.forEach(function(symbols) {
      symbols.trim().split(' ').forEach(function(symbol) {
        //console.log(symbol);
        if (!(atom(symbol) in hashMap)) {
          //symbolArray.push(symbol)
          if(atom(symbol) === ' ') {
            console.log(symbols)
            throw symbols;
          }
          hashMap[atom(symbol)] = i++;
        }
      });
    });

    //console.log(hashMap)
    return hashMap;
  };

  /**
  * Takes the knowledgebase and the hashmap of {symbols:numbers}
  * @returns the kb array with each token replaced by a number specified in the symbolMp hash
  */
  function convertToSymbols( kb, symbolMap , flatten) {
    // for each row 'symbols' pair or triple in the kb, 
    return kb.map( function( symbols ) {
      
      // trim off any outerwhitespace, 
      // split the pair/triple/etc on the inner whitespace
      return symbols.trim().split(' ').reduce( function( accumulator, symbol ) {
        
        // each symbol will be of the form -A or A
        // get the pure atom, but ignoring the -()        
        var _atom = atom(symbol); 

        // push into the initializer the token replacement from the symbolMap
        accumulator.push( symbol.replace( _atom, symbolMap[_atom] ))
        return accumulator;

        // here's the accumulator
        // return the array flattened with a ' ' as separators
        // since we're still within the map(), this new string will replace the older one
      },[]).join(' ');
      // we could flatten here too ('\n'), but let the caller figure that out
    }); 
  }

  function readInAxioms(){
    return fs.readFileSync('kb.txt').toString().split('\n');
  }

  function buildKnowledgeBase( _axioms) {
    var arcs      = inputData.arcs,
        items     = inputData.items,
        trucks    = inputData.trucks,
        locations = inputData.locations,
        limit     = inputData.timeLimit

    var kb, i, axioms = [];

    // text expand/replace the trucks in the axioms 
    kb = _axioms.map(function(ax, j, arr) {

      var regex = /YY\((.+)\)/,
        token = /Y(?=\,)/,
        expand = ax.match(regex);
      //console.log("*******",expansion[1].replace('Y',item));
      if (expand && expand.length >= 2) {
        var ex = [];
        trucks.forEach(function(t) {
          ex.push(expand[1].replace(token, (typeof k === 'number') ? t[k] : t));
        });
        return ax.replace(regex, ex.join(' '));
      } else {
        return ax;
      }
    });

    // loop over the timesteps, the items, and the trucks for each KB item
    for (i = 0; i <= limit; i++) {
      //var arcs = [];
      arcs.forEach(function(arc) {

        //store these fns up here so that they don't get recreated too often. 
        // they must, hoever, stay bound to the arc variable
        var findTails = function(t) {
          return t[0] === arc[0];
        };

        var findHeads = function(t) {
          return t[1] === arc[1];
        };

        items.forEach(function(item) {
          trucks.forEach(function(truck) {
            kb.forEach(function(ax) {


              // todo: optimize these two routines into a fn 

              var regex = /ARCTAIL\((.+)\)/;
              var token = /LL(?=\,)/;

              var expand = ax.match(regex);
              //console.log("*******",expansion[1].replace('Y',item));
              if (expand && expand.length >= 2) {
                var ex = [];
                // get the arcs that have the same tail
                arcs.filter(findTails).forEach(function(t) {
                  // generate and replace with the HEAD for each frame axiom 
                 // console.log("////", t[1], arc[0])
                  if (t[1] !== arc[0]) {

                    ex.push(expand[1].replace(token, t[1]));
                  }
                });
                //console.log(ex,ax)
                ax = ax.replace(regex, ex.join(' '))
                //console.log("*********INSERTED TAIL", ax, arc[0]);
              }

              regex = /ARCHEAD\((.+)\)/;
              token = /LL(?=\,)/;

              expand = ax.match(regex);
              //console.log("*******",expansion[1].replace('Y',item));
              if (expand && expand.length >= 2) {
                var ex = [];
                // get the arcs that have the same head
                arcs.filter(findHeads).forEach(function(t) {
                  //console.log('filter',t,arc)
                  // generate and replace with the tail for each frame axiom 
                  if (t[0] !== arc[1]) {
                    ex.push(expand[1].replace(token, t[0]));
                  }
                });
                //console.log(ex,ax)
                ax = ax.replace(regex, ex.join(' '))
                //console.log("*********REPLACED HEAD", ax, arc[1]);
              }


              /*
              * this pushes the newly text-replaced 
              */
              axioms.push(
                ax.replace(/X(?=\,)/g, item)
                .replace(/Y(?=\,)/g, truck)
                .replace(/L1(?=\,)/g, arc[0])
                .replace(/L2(?=\,)/g, arc[1])
                .replace(/L(?=\,)/g, arc[0])
                .replace(/I\+1/g, i + 1)
                .replace(/I\-1/g, i - 1)
                .replace(/I/g, i)
                .replace(/~/g, '-')
              );

            });
          });
        });
      });
    }
    return axioms;
  }

  // this takes the file from the command line and parses it
  inputData = parseIncomingDataFile();

  kb = buildKnowledgeBase(readInAxioms());

  var symbolMap = parseSymbols(kb);

  
  console.log(dp(convertToSymbols(kb,symbolMap)));
    // return parseSymbols(a);


    function dp(atoms) {
  var s, v ,atom;

  atoms = s = atoms.map(function(el) {
    return el.split(' ').map(Number);
  });
  atom = function(a) {
    return Math.abs(a);
  };

  this.hasSingletons = function(set) {
    var sgl = set.some(function(clause) {
      return clause.length === 1;
    });
    console.log("FOUND SINGLETON:", sgl);

    return sgl
  };

  this.get_pure_literals = function(atoms) {
    var pl = {},
      literals = [];

    // we want to put negs/false in the 0th position ; pos/true in the 1st position
    // we'll put the original el value as the value at that position (bonus, free space!)
    // later, any obj (pl[key]) with length 1 will be considered a pure literal
    //
    // note, this could have been done with an array, saving the extra loop down below,
    // but doing so incurs extra overhead for removing the null item from the 
    // array if the literal was positive (inserted at pos 1). 
    //

    atoms.map(function(clause) {
      clause.map(function(el) {
        // get the character w/o the sign
        var key = atom(el);

        // if this is the first time we've seen this atom
        if (!(key in pl)) {
          pl[key] = {};
        }

        // use a ternary here to determine the el's sign
        // ~A = 0 ; A = 1
        pl[key][(el > 0) ? 1 : 0] = el;
      });
    });


    // now that we have the table filled out, 
    // let's return only those that we've seen as only one polarity
    // loop through this object the un-fancy way
    for (var i in pl) {

      // any object with size 1 is our literal
      if (Object.keys(pl[i]).length === 1) {

        // we don't know if the key here is 1 or 0, so the
        // easiest way to get the value of the first item w/o knowing the key name
        // is to loop and grab the val
        for (j in pl[i]) {
          literals.push(pl[i][j]);
          continue;
        }
      }
    }
    console.log('got pure literals', literals)
    return literals;
  };

  //
  // Remove Clauses containing Literals
  //
  this.removeClauses_Literals = function(set, l) {
    // we'll use filter here to remove the anything that has a clause containing a literal
    return set.filter(function(e) {
      return !e.some(function(el) {
        return el === l
      });
    });
  };

  this.obvious_assign = function(l, v) {
    // if l>0, it's true, else false
    v[atom(l)] = l > 0;
    console.log('obvious_assigned', l);
    return v;
  };

  this.pluck = function(s, pred, out_fn) {
    for (var i in s) {
      for (var j in s[i]) {
        if (pred(s, i, j)) {
          return out_fn(s[i][j]);
        }
      }
    }
  }

  //
  // pickNextAtom: picks the first atom not already in v
  //
  /*this.pickNextAtom = function(s,v){
    return pluck(s,function(s,i,j){ return !(atom(s[i][j]) in v)} ,atom);
  };*/

  //
  // getSingleton: picks the first singleton
  //
  /*this.getSingleton = function(s){
    return pluck( s,function(s,i,j){ return s[i][j].length === 1 } ,function(x){return x});
  };*/

  this.pickNextAtom = function(s, v) {
    for (var i in s) {
      for (var j in s[i]) {
        if (!(atom(s[i][j]) in v)) {
          return atom(s[i][j]);
        }
      }
    }
  };

  this.getSingleton = function(s) {
    for (var i in s) {
      if (s[i].length === 1) {
        return s[i]
      }
    }
  };

  this.containsEmptyNode = function(s) {
    return s.some(function(el) {
      return !el.length;
    });
  };


  //
  // Propagate: remove either a clause or an atom from the sentence
  //
  this.propagate = function(a, s, v) {
    // note, this had to be split into two steps (filter,map) because 
    // because the inner modifications (remove atoms) were not propagated to the outer filter when it returned true.
    console.log('propagate:', a);
    return s.filter(function(c) {

      // if ((A in C and V[A]=TRUE) or (~A in C and V[A]==FALSE))
      // then delete C from S
      if (((c.indexOf(a) > -1) && (v[a] === true) || (c.indexOf(-a) > -1) && (v[a] === false))) {
        console.log('propagatd: removed', c);
      }

      return !((c.indexOf(a) > -1) && (v[a] === true) || (c.indexOf(-a) > -1) && (v[a] === false));

    }).map(function(c) {

      // if(A in C and V[A]==FALSE) then delete A from C
      // if (~A in C and V[A]==TRUE) then delete ~A from C;
      return c.filter(function(el) {
        var res = !((el === a && v[a] === false) || (el === -a && v[a] === true));
        if (!res) {
          console.log('propagatd: removed atom', el, "from", c, 'because v[', a, ']', v[a])
        }
        return res;
      });
    });
  };

  this.duplicate2DArray = function(a) {

    console.log(a);

    return a.map(function(b) {
      return b.map(function(c) {
        return c;
      });
    });
  };

  this.dp1 = function(s, v) {
    console.log('call dp1', s, v);
    var a, literals, singletons, keepLooping;
    // take the incoming string disjunctions, convert them to a 2d array
    s = duplicate2DArray(s);
    v = JSON.parse(JSON.stringify(v));

    keepLooping = 1;
    // Loop as long as there are easy cases to cherry pick */
    while (keepLooping) {

      console.log("LOOP", keepLooping++, s);
      /*  BASE OF THE RECURSION: SUCCESS OR FAILURE */
      // Success: All clauses are satisfied
      if (typeof s != "undefined" && s != null && s.length == 0) {
        console.log(atoms);

        var key = pickNextAtom(atoms, v);

        v[key] = true;

        //if V[A] == UNBOUND then assign V[A] either TRUE or FALSE;
        return v;
      }
      /* some clause in S is empty */
      else if (containsEmptyNode(s)) {
        console.log(s, v)
        return;
      }

      /* EASY CASES: PURE LITERAL ELIMINATION AND FORCED ASSIGNMENT */
      literals = get_pure_literals(s);

      /* Pure literal elimination */
      if (literals.length) {
        l = literals.pop();
        v = obvious_assign(l, v);
        s = removeClauses_Literals(s, l);

        /* Forced assignment */
      } else if (hasSingletons(s)) {
        console.log(s, v);
        a = getSingleton(s);

        console.log('singleton-->', a)

        v = obvious_assign(a, v);
        s = propagate(atom(a), s, v);

        console.log('forced assignment', s)
          /* No easy cases found */
      } else {
        keepLooping = 0;
        console.log('stopped looping')
      }
    }

    /* PICK SOME ATOM AND TRY EACH ASSIGNMENT IN TURN */
    var a = pickNextAtom(s, v);
    console.log("Picked", a)

    /* Try one assignment */
    v[a] = true;
    console.log('BRANCHING', a, '=', v[a], s);
    var s1 = propagate(a, s, v);
    var vnew = dp1(s1, v);
    if (typeof vnew != 'undefined') {
      return vnew;
    }

    console.log("**************BACKTRACKING************")
      /* IF V[A] := TRUE didn't work, try V[A} := FALSE; */
    v[a] = false;
    console.log('BRANCHING', a, '=', v[a], s);
    var s1 = propagate(a, s, v);
    return dp1(s1, v);
  };




  return dp1(s, {});
}





})();