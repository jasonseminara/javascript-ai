/**
  * Simluates the calculation of the probability of taking action on each turn of a blackjack-like simulation
  * @author Jason Seminara, N12517906
  * @since 2015-04-14
  * 

  *
  * @INSTRUCTIONS
  * This is a node.js executable. 
  * Execute by passing the three required args in the command line nCards, lTarget, uTarget
  * e.g.
  * node blackjack.js 10 21 23
  *
  
  *
  * @returns 3 matrices: 
  * (1) the optimal move for player X in the case where player Y did not pass on the previous move, where XT and YT are the current totals for X and Y: Play[XT,YT]=1 if X should draw, 0 if he should pass
  * (2) the probability of winning if X passes in state XT,YT;
  * (3) the probability of winning if X draws in state XT,YT;
  *

*/

function Blackjack(nCards, lTarget, uTarget){
  var xT= 0; // Current Totals for X.
  var yT= 0; // Current Totals for Y.

  // Play[xT][yT]: Boolean[lTarget][lTarget]
  // Optimal move for X when Y did not pass on previous move.
  // 1 if X should draw, 0 if pass.  
  var play = new Array(lTarget);

  // prob[xT][yT][2]: Boolean[lTarget][lTarget][2]
  // probability that X will win from state xT,yT if he makes move P
  var prob = new Array(lTarget);

  // init all arrays with 0
  for(var i=0; i<lTarget; i++){
    play[i] = [0];
    prob[i] = [0];

    for(var j=0; j<lTarget; j++){
      prob[i][j] = [0,0];
    }
  }

  function computeProbOfDraw(xT,yT){
    var probWinning = 0;
    var probYwins   = 0;

    for(var card = 1; card<=nCards; card++){
      
      if(xT+card > uTarget){
        probYwins=1;
      }
      else if(xT+card >= lTarget){
        probYwins=0;
      }else{
        probYwins = prob[yT][xT+card][play[yT][xT+card]]
      }
      probWinning = probWinning+(1-probYwins)/nCards;
        //console.log("probWinning",probWinning);
    }
    return probWinning;
  }

  

  // walk over the arrays, fill out the 2d grid from the [lTarget,lTarget] to [0,0]
  for(var sum=2*lTarget-2; sum>=0; sum--){
    for(xT = sum+1-lTarget; xT<lTarget; xT++){
      
      yT = sum-xT;

      // we want to fill up the upper-left diagonal of the table, 
      // but the math used to do so creates lots of negatives. 
      // skip over them to grab the valid positive ones.
      if( yT<0 || xT<0 ) continue;
      
      //console.log(xT,yT);
      
      // the prob of winning if X passes in state xT,yT
      prob[xT][yT][0] = (xT<=yT) ? 0 : 1-prob[yT][xT][1];

      // the prob of winning if X draws in state xT,yT
      prob[xT][yT][1] = computeProbOfDraw(xT,yT);
      
      // we have to cast to integer here (not Boolean) b/c we need to use this value as a key on prob[x][y][bool]   
      play[xT][yT] = (prob[xT][yT][1] > prob[xT][yT][0])?1:0;

    }

  }
  return {play:play,prob:prob};

}

/**
* Converts a 3D array to an array of 2D arrays indexed by the last dimension 
* arr[x][y][z] => arr[z][x][y]
*/
function convertTo2D(matrix){
  // the user will be giving us a 3d array, in which we'll be slicing across the Z-axis up like bread;
  // leaving us with z [x,y] matrices 
  
  // let's slice this bread
  var slices = [];
  for(var k = 0; k<matrix[0][0].length; k++){
    slices[k]=[];
    for(var i = 0;i< matrix.length;i++){
      slices[k][i]=[];
      for(var j = 0;j< matrix[i].length;j++){
        slices[k][i][j]=matrix[i][j][k];
      }
    }
  }
  return slices;
}



/**
* TEST the array dimension step-down algorithm
*/
function test_convertTo2D(len){
  var a = new Array(len);
  // init all arrays with -Inf
  for(var i=0; i<len; i++){
    a[i] = [];
    for(var j=0; j<len; j++){
      a[i][j] = [];
      for(var k=0; k<len; k++){
        a[i][j][k] = k;
      }
    }
  }
  slices = convertTo2D(a);
  console.log(a);
  console.log(slices);
}



// 
var a = Blackjack(process.argv[2],process.argv[3],process.argv[4]);
console.log(a.play);

// output the 3d array as an array of 2d arrays
slices = convertTo2D(a);
console.log(slices[0]);
console.log(slices[1]);
