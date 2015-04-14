



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

  // init all arrays with -Inf
  for(var i=0; i<lTarget; i++){
    play[i] = [0];
    prob[i] = [-Infinity];

    for(var j=0; j<lTarget; j++){
      prob[i][j] = [0,0];

      for(var k=0; k<2; k++){
        prob[i][j][k]=0;
      }
    }
  }

  function computeProb(xT,yT){
    var probWinning = -Infinity;
    var probYwins   = -Infinity;

    for(var card in nCards){
      if(xT+card > uTarget){
        probYwins=1;
      }
      else if(xT+card >= lTarget){
        probYwins=0;
      }else{
        probYwins = prob[yT] [xT+card] [Play[yT][xT+card]]
      }
      probWinning = probWinning+(1-probYwins)/nCards;
    }
    return probWinning;
  }

  computeProb(99,66);


/*  // walk over the arrays, fill out the 2d grid from the [lTarget,lTarget] to [0,0]
  for(var sum=2*lTarget-2; sum>0; sum--){
    for(xT = sum+1-lTarget; xT<lTarget ;xT++){
      
      yT = sum-xT;

      // we want to fill up the upper-left diagonal of the table, 
      // but the math used to do so creates lots of negatives. 
      // skip over them to grab the valid positive ones.
      if(yT<0 || xT<0) continue;
      
      //console.log(xT,yT,sum,j);
      
      play[xT][yT] = xT +':'+yT;
      //prob[xT][yT][1] = 5.6;

      //prob[i][j][1]= xT;
    }
  }*/



  return {play:play,prob:prob};

}
a = Blackjack(2,21,22);
console.log(a.play)