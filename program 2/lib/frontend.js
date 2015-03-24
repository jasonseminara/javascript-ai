(function() {

  function parseIncomingFile(){

    if (process.argv.length < 3) {
      console.log('Usage: node ' + process.argv[1] + ' FILENAME');
      process.exit(1);
    }
    
    // Read the file and print its contents.

    // filesystem utils
    var a,row
    , fs = require("fs")
    // read in the knowledge base
    , kb = fs.readFileSync('kb.txt').toString().split('\n')
    , axioms = []
    , filename = process.argv[2]
    , input = {}
    , inputData = fs.readFileSync(filename).toString().split('\n');

    
    input.arcs      = []
    input.goal      = []

    input.locations = inputData.shift().trim().split(' ') // line 0
    input.items     = inputData.shift().trim().split(' ') // line 1
    input.trucks    = inputData.shift().trim().split(' ') // line 2
    input.timeLimit = +inputData.shift() // line 3
    
    inputData.shift() //START
    input.startState = []
    
    // loop through the remainder of the file; stop if we've hit the goal state
    while (a = inputData.shift(), a != "GOAL"){
      
      row = a.trim().split(' ');

      // these are pairs of either trucks/locations or items/locations 
      if(input.trucks.indexOf(row[0]) !== -1 || input.items.indexOf(row[0]) !== -1){  
        input.startState.push(row);
      }else{
        // don't split the arcs; we'll fix them up later
        input.arcs.push(a.trim());
      }
    }
    
    // we've made it into the 'GOAL' section, push in the remainder of the goal states
    while(a = inputData.shift()){
      input.goal.push( a.trim().split(' '));
    } 

    // the arcs may come in triples or doubles. If it's a triple, split it up into in/out arcs
    // a b c => (a,b),(a,c)
    input.arcs = input.arcs.reduce( function(arr, arc ) {
      var tail;
      arc = arc.split(' ');
      tail = arc.shift();

      arc.forEach( function( head ){
        arr.push([tail,head]);
      });
      return arr;
    },[]);

    return input;
  }
  




    
console.log(parseIncomingFile())

throw '';
  function atom(symbol){
    return symbol.replace(/^(~|-)/,'');
  };

  function parseSymbols(sentences){
    var hashMap = {};
    var i=1;
    // var symbols = sentences.split(/[\n\s]/);
    //console.log(symbols);
    sentences.forEach(function(symbols){
      symbols.split(' ').forEach(function(symbol){  
        //console.log(symbol);
        if(!(atom(symbol) in hashMap)){
          //symbolArray.push(symbol)
          hashMap[atom(symbol)] = i++;
        }
      });
    });
    
    //console.log(hashMap)
    return hashMap;
  };  
  console.log(atom)
 // return parseSymbols(a);
})();

