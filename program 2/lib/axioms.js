

// ~Move(X,L1,L2,I) OR At(X,L2,I+1)
// ~Load(X,Y,L,I) OR Loaded(X,Y,I+1)
// ~Unload(X,Y,L,I) OR At(X,L,I)
// ~Move(X,L1,L2,I) OR ~At(X,L1,I+1)
// ~Load(X,Y,L,I) OR ~At(X,L,I+1)
// ~Unload(X,Y,L,I) OR ~Loaded(X,Y,I+1)
// ~Move(X,L1,L2,I) OR At(X,L1,I)
// ~Load(X,Y,L,I) OR At(X,L,I)
// ~Load(X,Y,L,I) OR At(Y,L,I)
// ~Unload(X,Y,L,I) OR At(Y,L,I) 
// ~Unload(X,Y,L,I) OR Loaded(X,Y,I)


// ~At(X,L,I) OR At(X,L,I+1) OR Load(X,Truck1,L,I)...
// At(X,L,I-1) OR ~At(X,L,I) OR Unload(X,Truck1,L,I)...

// ~At(X,L,I) OR At(X,L,I+1) OR Move(X,L,L1,I)...
// At(X,L,I) OR ~At(X,L,I+1) OR Move(X,L1,L,I)...

// ~Loaded(X,Y,I) OR ~At(Y,L,I) OR Loaded(X,Y,I+1)) OR Unload(X,Y,L,I)

// Loaded(X,Y,I) OR ~At(Y,L,I) OR ~Loaded(X,Y,I+1) OR Load(X,Y,L,I)

// Move(X,L,L1,I) OR Move(X,L,L2,I)


// **start*
// At(Eggs,A,0)
// At(Truck1,A,0)
// At(Milk,B,0)

// **end**
// At(Eggs,C,3)
// At(Milk,A,3)
var fs  = require("fs");
var kbText = fs.readFileSync('kb.txt').toString().split(' ').split('\n');

console.log(kbText);
throw '';

kb = [
  
  ,'~Move(X,L1,L2,I) At(X,L2,I+1)'
  ,'~Move(Y,L1,L2,I) At(Y,L2,I+1)'
  ,'~Load(X,Y,L,I) Loaded(X,Y,I+1)'
  ,'~Unload(X,Y,L,I) At(X,L,I)'
  ,'~Move(X,L1,L2,I) ~At(X,L1,I+1)'
  ,'~Load(X,Y,L,I) ~At(X,L,I+1)'
  ,'~Unload(X,Y,L,I) ~Loaded(X,Y,I+1)'
  ,'~Move(X,L1,L2,I) At(X,L1,I)'
  ,'~Load(X,Y,L,I) At(X,L,I)'
  ,'~Load(X,Y,L,I) At(Y,L,I)'
  ,'~Unload(X,Y,L,I) At(Y,L,I) '
  ,'~Unload(X,Y,L,I) Loaded(X,Y,I)'
  ,'~Loaded(X,Y,I) ~At(Y,L,I) Loaded(X,Y,I+1) Unload(X,Y,L,I)'
  ,'Loaded(X,Y,I) ~At(Y,L,I) ~Loaded(X,Y,I+1) Load(X,Y,L,I)'
  ,'Move(X,L,L1,I) Move(X,L,L2,I)'
  ,'~At(X,L,I) At(X,L,I+1) YY(Load(X,Y,L,I))'
  ,'At(X,L,I-1) ~At(X,L,I) YY(Unload(X,Y,L,I))'
  ,'~At(X,L,I) At(X,L,I+1) ARCTAIL(Move(X,L1,LL,I))'
  ,'At(X,L,I) ~At(X,L,I+1) ARCHEAD(Move(X,LL,L2,I))'
];

axioms = [];

 atom = function(symbol){
  return symbol.replace(/^(~|-)/,'');
 };
  parseSymbols = function(sentences){
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

items = ['Milk','Eggs'];
trucks = ['Truck1','Truck2'];
arcs = ['A B','B A C','C A'].reduce( function(arr, arc ) {
  var tail;
  arc = arc.split(' ');
  tail = arc.shift();

  arc.forEach( function( head ){
    arr.push([tail,head]);
  });
  return arr;
},[]);



// expansion for trucks
kb = kb.map( function(ax,j,arr){
    var regex = /YY\((.+)\)/;
    var token = /Y(?=\,)/;
    var expand = ax.match(regex);
    //console.log("*******",expansion[1].replace('Y',item));
    if(expand && expand.length >= 2){
      var ex = [];
      trucks.forEach(function(t) {
        ex.push(expand[1].replace(token,(typeof k === 'number')?t[k]:t));
      });
      return ax.replace( regex, ex.join(' ') );
    }else{
      return ax;
    }
});

for(var i=0; i<=3; i++){
    //var arcs = [];
      arcs.forEach( function( arc ){
        items.forEach( function(item){
          trucks.forEach( function(truck){
              kb.forEach( function(ax){

                 var regex = /ARCTAIL\((.+)\)/;
    var token = /LL(?=\,)/;

    var expand = ax.match(regex);
    //console.log("*******",expansion[1].replace('Y',item));
    if(expand && expand.length >= 2){
      var ex = [];
      // get the arcs that have the same tail
      arcs.filter(function(t) {
        return t[0] === arc[0];
      }).forEach(function(t) {
        // generate and replace with the HEAD for each frame axiom 
        console.log("////",t[1],arc[0])
        if(t[1] !== arc[0]){

          ex.push(expand[1].replace(token,t[1]));
        }
      });
      //console.log(ex,ax)
      ax = ax.replace( regex, ex.join(' ') )
      console.log( "*********INSERTED TAIL",ax,arc[0]);
    }

    regex = /ARCHEAD\((.+)\)/;
    token = /LL(?=\,)/;

    expand = ax.match(regex);
    //console.log("*******",expansion[1].replace('Y',item));
    if(expand && expand.length >= 2){
      var ex = [];
      // get the arcs that have the same head
      arcs.filter(function(t) {
        return t[1] === arc[1];
      }).forEach(function(t) {
        //console.log('filter',t,arc)
        // generate and replace with the tail for each frame axiom 
        if(t[0] !== arc[1]){
          ex.push(expand[1].replace(token,t[0]));
        }
      });
      //console.log(ex,ax)
      ax= ax.replace( regex, ex.join(' ') )
    console.log( "*********REPLACED HEAD",ax ,arc[1]);
    }




                axioms.push(
                  ax.replace(/X(?=\,)/g,item)
                  .replace(/Y(?=\,)/g,truck)
                  .replace(/L1(?=\,)/g,arc[0])
                  .replace(/L2(?=\,)/g,arc[1])
                  .replace(/L(?=\,)/g,arc[0])
                  .replace(/I\+1/g,i+1)
                  .replace(/I\-1/g,i-1)
                  .replace(/I/g,i)
                  .replace(/~/g,'-')
                );
            });
          });  
        });
    });
}
parseSymbols(axioms)

axioms = axioms.concat(  [
  'At(Eggs,C,3)'
  ,'At(Milk,A,3)'

  ,'At(Eggs,A,0)'
  ,'-At(Eggs,B,0)'
  ,'-At(Eggs,C,0)'
  ,'At(Truck1,A,0)'
  ,'-At(Truck1,B,0)'
  ,'-At(Truck1,C,0)'
  ,'At(Milk,B,0)'
  ,'-At(Milk,A,0)'
  ,'-At(Milk,C,0)'])
console.log(axioms)

