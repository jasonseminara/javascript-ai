/**
* @author Jason Seminara (js4308@cs.nyu.edu) N12517906 
* @date 2015-03-24 
* @Name Programming assignment #2
* @Description Javascript/Nodejs implementation of the back-end of a logistics solver
* @see http://www.cs.nyu.edu/faculty/davise/ai/dp-ex.pdf
*/

(function() {
  var fs=require("fs");
  function parseIncomingDataFile(inputData) {
      var a,newData=[];

      // walk over the incoming data and read everything until we hit the ZERO
      while (a = inputData.shift(), a != "0") {
        
        newData[a]a.trim().split(' '));
      }

      // the remainder is the back matter for the back-end
      return [newData,inputData]
    }

  function determineTruthiness(bools,atoms){

  }


    (function main(){

      var fileContents,parsedInputData;
      if (process.argv.length < 3) {
        console.log('Usage: node ' + process.argv[1] + ' FILENAME');
        process.exit(1);
      }

      fileContents  = fs.readFileSync(process.argv[2]).toString().split('\n');


    })()


})()