function dp(atoms) {
  var s,v,atom;
  s = [];
  v = {};
  atom = function(a) {
    return Math.abs(a);
  };
  atoms = s = atoms.map(function(el) {
    return el.split(' ').map(Number);
  });

  this.hasSingletons = function(set) {
    var sgl = set.some(function(clause) {
      return clause.length === 1;
    });
    console.log("FOUND SINGLETON:",sgl);

    return sgl
  };

  this.get_pure_literals = function(atoms) {
    var pl = {},literals = [];

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
    console.log('got pure literals',literals)
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
    console.log('obvious_assigned',v);
    return v;
  };

  this.pluck = function(s , pred, out_fn){
    for (var i in s) {
      for (var j in s[i]) {
        if (pred(s,i,j)) {
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
     if(s[i].length===1){
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

    return s.filter(function(c) {

      // if ((A in C and V[A]=TRUE) or (~A in C and V[A]==FALSE))
      // then delete C from S
      if(((c.indexOf(a) > -1) && (v[a] === true) || (c.indexOf(-a) > -1) && (v[a] === false))){
        console.log('propagatd: removed',c);
      }

      return !((c.indexOf(a) > -1) && (v[a] === true) || (c.indexOf(-a) > -1) && (v[a] === false));

    }).map(function(c) {

      // if(A in C and V[A]==FALSE) then delete A from C
      // if (~A in C and V[A]==TRUE) then delete ~A from C;
      return c.filter(function(el) {
        var res = !((el === a && v[a] === false) || (el === -a && v[a] === true));
        if(!res){
         console.log('propagatd: removed atom',el,"from",c,'because v[',a,']', v[a])
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
    console.log('call dp1',s,v);
    var a, literals, singletons, keepLooping;
    // take the incoming string disjunctions, convert them to a 2d array
    s = duplicate2DArray(s);
    v = JSON.parse(JSON.stringify( v ));

    keepLooping = 1;
    // Loop as long as there are easy cases to cherry pick */
    while (keepLooping) {

      console.log("LOOP",keepLooping++);
      /*  BASE OF THE RECURSION: SUCCESS OR FAILURE */
      // Success: All clauses are satisfied
      if (typeof s != "undefined" && s != null && s.length == 0) {

        atoms.forEach(function(a) {
          var key = atom(a);
          if (!(key in v)) {
            v[key] = true;
          }
        });

        //if V[A] == UNBOUND then assign V[A] either TRUE or FALSE;
        return v;
      }
      /* some clause in S is empty */
      else if (containsEmptyNode(s)) {
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
        console.log(s,v);
        a = getSingleton(s);
        console.log('singleton-->',a)
        v = obvious_assign(a, v);
        s = propagate(a, s, v);

        console.log('forced assignment',s)
        /* No easy cases found */
      } else {
        keepLooping = 0;
        console.log('stopped looping')
      }
    }

    /* PICK SOME ATOM AND TRY EACH ASSIGNMENT IN TURN */
    var a = pickNextAtom(s, v); 

    /* Try one assignment */
    v[a] = true;
    console.log('BRANCHING',a,s,v);
    var s1 = propagate(a, s, v);
    var vnew = dp1(s1, v);
    if (typeof vnew != 'undefined') {
      return vnew;
    }

    /* IF V[A] := TRUE didn't work, try V[A} := FALSE; */
    v[a] = false;
    console.log('BRANCHING',a,s,v);
    var s1 = propagate(a, s, v);
    return dp1(s1, v);
  };




  return dp1(s, v);
}
dp(["1 2 3","1 -2 -3","1 -4","-2 -3 -4","-1 -2 3","6 5","6 -5","2 -6","-3 -6"])
