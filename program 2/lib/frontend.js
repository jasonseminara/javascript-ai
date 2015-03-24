/**
* @author Jason Seminara (js4308@cs.nyu.edu) N12517906 
* @date 2015-03-24 
* @Name Programming assignment #2
* @Description Javascript/Nodejs implementation of the front-end of a logistics solver
* @see http://www.cs.nyu.edu/faculty/davise/ai/dp-ex.pdf
*/

(function() {
  var kb, fs=require("fs");
  /**
  * @description parse the incoming knowledgebase file
  */
  function parseIncomingDataFile(inputData) {

    var a,row,input = {};


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
    return 
  }

  function buildKnowledgeBase(inputData, _axioms) {
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


  function flattenForFile(axiomsAsSymbols,symbolMap){
    //first get them into an array so we can have them in order
    var a = [0];
    for(var s in symbolMap){
      a[symbolMap[s]]=symbolMap[s]+' : '+s;
    }
   
    fs.writeFile("output-front-end.txt", axiomsAsSymbols.join('\n')+'\n'+a.join('\n'), function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
    });
  }


  /**
  * MAIN ENTRY
  */

  (function main(){

    // filesystem utils
    var fileContents,kb,axioms,parsedInputData,symbolMap;
    if (process.argv.length < 3) {
      console.log('Usage: node ' + process.argv[1] + ' FILENAME');
      process.exit(1);
    }

    // Read the file and print its contents.
    fileContents  = fs.readFileSync(process.argv[2]).toString().split('\n');
    axioms        = fs.readFileSync('kb.txt').toString().split('\n');
    
    // this takes the file from the command line and parses it
    parsedInputData = parseIncomingDataFile(fileContents);

    kb = buildKnowledgeBase(parsedInputData,axioms);

    // create an At(X,L,I) node for each start state;
    parsedInputData.startState.forEach(function(state) {
      // add it to the top of the kb
      parsedInputData.locations.forEach(function(loc){
        if(state[1] == loc){
          kb.unshift('At('+ state[0]+','+loc+',0)');
        }else{
          kb.unshift('-At('+ state[0]+','+loc+',0)');
        }
      });
    });

    // create an At(X,L,I) node for each start state;
    parsedInputData.goal.forEach(function(state) {
      // add it to the top of the kb
      parsedInputData.locations.forEach(function(loc){
        if(state[1] == loc){
          kb.unshift('At('+ state[0]+','+loc+','+parsedInputData.timeLimit+')');
        }else{
          kb.unshift('-At('+ state[0]+','+loc+','+parsedInputData.timeLimit+')');
        }
      });
    });

    //console.log(kb,parsedInputData.goal);
    symbolMap = parseSymbols(kb);

    axiomsAsSymbols = convertToSymbols(kb,symbolMap);

    console.log(flattenForFile(axiomsAsSymbols,symbolMap));
    return axiomsAsSymbols;

  })();
})();