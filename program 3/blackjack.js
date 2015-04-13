function Blackjack(nCards, lTarget, uTarget){
  var xT= 0; // Current Totals for X.
  var yT= 0; // Current Totals for Y.

  // Play[xT][yT]: Boolean[lTarget][lTarget]
  // Optimal move for X when Y did not pass on previous move.
  // 1 if X should draw, 0 if pass.  
  var play = [[]]

  // prob[xT][yT][2]: Boolean[lTarget][lTarget][2]
  // probability that X will win from state xT,yT if he makes move P
  var prob = [[[]]];

  /*// init all arrays with -Inf
  for(var i=0; i<lTarget; i++){
    play[i] = [];
    prob[i] = [];

    for(var j=0; j<lTarget; j++){
      play[i][j] = -Infinity;
      prob[i][j] = [];

      // prob is a 3d array, len=2
      for(var k=0;k<2;k++){
        prob[i][j][k] = -Infinity; 
      }
    }
  }*/



  // 
  for(var i=2*lTarget-2; i>=0; i--){

   for(var j=i+1-lTarget; j<lTarget && j>=0;j++){
      xT = j;
      yT = i-j;
      console.log(xT,yT,i,j);

    //   //prob[i][j][1]= xT;
    }
  }



  return {play:play,prob:prob};

}
Blackjack(2,21);