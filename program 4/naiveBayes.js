/**
  * Performs a Naive Bayes Text Classification on a body of text; 
  * Tries to guess the category of a given text
  * @author Jason Seminara, N12517906
  * @since 2015-05-05
  * @see http://cs.nyu.edu/courses/spring15/CSCI-GA.2560-001/prog4.pdf
  * @for New York University : CSCI-GA.2560-001 : Artificial Intelligence : Ernest Davis
  * 

  *
  * @INSTRUCTIONS
  * This is a node.js executable. 
  * Execute by passing the two required args in the command line:
  * 1. N (the count of records to use as the training set)
  * 2. stopwordsFileName (the filename of the text file that defines the words to skip during the learning phase)
  * e.g.
  * node naiveBayes.js 5 stopwords.txt
  *
  
  *
  * @returns tabular output of the category prediction of the given set of biographies, including the overall accuracy of the predictions:
  * (eg) 
  * Benjamin Disraeli.  Prediction: Writer.  Wrong.
  * Government: 0.44     Music: 0.07     Writer: 0.48
  * George Eliot.  Prediction: Writer.  Right.
  * Government: 0.01     Music: 0.07     Writer: 0.91
  * Barbara Jordan.  Prediction: Government.  Right.
  * Government: 0.97.    Music: 0.03.    Writer: 0.00
  * Clara Schumann.  Prediction: Music.  Right
  * Government: 0.01.    Music: 0.98.    Writer: 0.01
  * Overall accuracy: 3 out of 4 = 0.75.
  *

*/


function NaiveBayes(N, stopwordsFileName) {

  var fs = require('fs'),
    results = [],
    events = new(require('events')).EventEmitter,
    fileCount = 2,
    bios = [],
    stopwords = {},
    ts = {
    rawcount: {
      cats: {},
      words: {}
    },
    freq: {
      cats: {},
      words: {}
    },
    prob: {
      cats: {},
      words: {}
    },
    lg: {
      cats: {},
      words: {}
    }
  };



  function readCorpus(data) {
    // split into records 
    bios = data.toString()
      .trim() /* trim off any whitespace that could potentially become a null record*/
      .split(/\s*\n{2,}\s*/) /* Separate biographies are separated by 1 or more blank lines. */

    //console.log(bios)
  }

  /**
   * Parse the stopwords data file
   */
  function readStopWords(data) {
    // convert it into a O(n) lookup hash
    stopwords = data.toString() /* just to make sure it's a real string */
      .trim() /* trim off any whitespace that could potentially become a null record*/
      .split(/[\n\s]+/) /* split on any NL or spaces */
      .reduce(function(a, b) {
        a[b] = true;
        return a;
      }, {});
    return;
  }


  /**
  * When the last one is read, emit a custom event
  */
  function readFileContents(err, data, callback) {
    if (err) throw err;
    callback(data);
    if (--fileCount === 0) {
      events.emit('fileProcessingFinished');
    };
    return;
  }


  
  /**
  * Encapsulate all the probability/frequency distro fns
  */
  function computeProbabilities(data){
      var rawCount = data.rawcount;
      var epsilon = 0.1;

      var PC = function(freq_c, totalCats){
        return ((freq_c ? freq_c:0)+epsilon) / (1+totalCats*epsilon);
      };
      
      var PWC = function(freq_wc){
        return (freq_wc + epsilon) / (1+2*epsilon);
      };

      var LC = function (prob_cats) {
        return -(Math.log2(prob_cats));
      }

      var LWC = function (pwc) {
        return -(Math.log2(pwc));
      }

      var freqDistro = function (totalWords, totalCats) {
        return (totalWords ? totalWords:0) / (totalCats ? totalCats:0);
      }

      // now that we've tabulated all the counts, start workingout all the probabilities
      Object.keys(rawCount.words).forEach(function(word){
       
        data.freq.words[word] = {};
        data.prob.words[word] = {};
        data.lg.words[word]   = {};
       
        Object.keys(rawCount.cats).forEach(function(cat){
          //console.log(rawCount.cats)

          /* For each classification C, define FreqT (C) = OccT (C)/|T|, 
          the fraction of the biographies that are of category C.*/

          data.freq.cats[cat]         = freqDistro( rawCount.cats[cat] , Object.keys(rawCount.cats).length);
          // freq of words per cat  = total amount of words per cat / total amount of cats
          data.freq.words[word][cat]  = freqDistro( rawCount.words[word][cat] , rawCount.cats[cat]);

          data.prob.cats[cat]         = PC(  data.freq.cats[cat], Object.keys(rawCount.cats).length);
          data.prob.words[word][cat]  = PWC( data.freq.words[word][cat] );

          data.lg.cats[cat]           = LC( data.prob.cats[cat] );
          data.lg.words[word][cat]    = LWC( data.prob.words[word][cat] );
        })
      })
      return;
    }
 



    function incrementWord(cat, word, counter) {
      if (typeof counter[word] === 'undefined') {
        counter[word] = {};
      }
      if (typeof counter[word][cat] === 'undefined') {
        counter[word][cat] = 0;
      }
      return ++counter[word][cat];
    }


    function parseTrainingBio( el) {
      
      // keep track of we've ween
      var wordsSeen = {};
      
      /* split each record into lines, */
      var temp = el.split(/\n/);
      
      /* In each biography, the first line is the name of the person.*/
      var name = temp.shift().trim();

      /* The second line is the category (a single word). */
      var cat = temp.shift().toLowerCase().trim();
      
      /* The remaining lines are the biography. */
      var desc = temp
        .join(' ')     /* The bio may be fragmnted in different lines. Join them into one string so we cna operate on it a one body */ 
        .toLowerCase()
        .split(/\s+/)  
        .reduce( function(a,el){
          // This is the pass through the bio of one record
          /* remove small words and junk from the words */
          var cleanword = el.replace(/[^a-z]/g, '');
          
          // start counting if the words are longer than 2 AND not in the startwords lookup
          if (cleanword.length > 2 && !stopwords[cleanword]) {
            if (!wordsSeen[cleanword]) {
              incrementWord(cat, cleanword, ts.rawcount.words);
              wordsSeen[cleanword] = 1;
            } else {
              wordsSeen[cleanword]++;
            }


            //push this into the set
            a.push(cleanword);
          }

          return a;
        }, []);

      // tabulate the category frequency distribution
      ts.rawcount.cats[cat] = ts.rawcount.cats[cat] ? ts.rawcount.cats[cat] + 1 : 1;
      ts.freq.cats[cat]     = ts.freq.cats[cat]     ? ts.freq.cats[cat] + 1 / N : 1 / N;

      return {
        name: name,
        cat: cat,
        desc: desc
      };
    }


    function parseTestBio( el) {
      // keep track of we've ween
      var wordsSeen = {};
      
      /* split each record into lines, */
      var temp = el.split(/\n/);
      
      /* In each biography, the first line is the name of the person.*/
      var name = temp.shift().trim();

      /* The second line is the category (a single word). */
      var cat = temp.shift().trim();
      
      /* The remaining lines are the biography. */
      var desc = temp
        .join(' ')     /* The bio may be fragmnted in different lines. Join them into one string so we cna operate on it a one body */ 
        .toLowerCase()
        .split(/\s+/) 
        /* we'll use reduce here because the returned set may be smaller that set we're iterating */ 
        .reduce( function(a,el){
          // This is the pass through the bio of one record
          /* remove small words and junk from the words */
          var cleanword = el.replace(/[^a-z]/g, '');
          
          //console.log(a,ls);
          // start counting if the words are longer than 2 AND not in the startwords lookup 
          // AND must be in the training set
          if (cleanword.length > 2 && !stopwords[cleanword] && ts.rawcount.words[cleanword] && !wordsSeen[cleanword]) {
            wordsSeen[cleanword] = 1;
            //push this into the set
            a.push(cleanword);
          }else{
            //console.log('removed word: ',cleanword)
          }

          return a;
        }, []);

      return {
        name: name,
        cat: cat,
        desc: desc
      };
    }

    function outputResults () {
      var correctResults = 0;
      var output = results.reduce( function(a, r){
        var result = r.cat.toLowerCase() === r.prediction.toLowerCase() ? (correctResults++,'Right.') : 'Wrong.';
        a += r.name 
          + '.\tPrediction: ' + r.prediction + '.\t'+ result + '\n'
          + Object.keys(r.stats).reduce(function(a,stat){
            return a + stat + ': ' + r.stats[stat].toFixed(2)+ ' \t';
          },'') 
          + '\n\n';
        return a;
      },'')
      + 'Overall accuracy: '+correctResults+ ' out of '+ results.length + ' = ' + (correctResults/results.length).toFixed(2)
      + '\n';
      console.log(output);
      return;
    }


  /**
  * EVENT HANDLER:
  * When the probabilities are finished processing
  */
  events.on('computeProbabilitiesFinished' , outputResults);



  /**
  * EVENT HANDLER:
  * When the last file finishes processing
  */
  events.on('fileProcessingFinished', function() {

    /****************BEGIn TRAINING SET************/
    bios.slice(0, N).map( parseTrainingBio )
    // compute the probabilities of the words distributions
    // note that we have to do this AFTER all the words have been tabulated so there's no risk of calculating partial counts   
    computeProbabilities( ts );
    /****************END TRAINING SET************/


    /****************BEGIN TEST DATA************/    
    results = bios.slice(N)
      /*  */
      .map( parseTestBio )
      /* for each bio */
      .map( function(el){ 

        // we'll need the localMin for later when we recover the probs of this record 
        var localMin = {val:Math.Infinity};

        // the sum of the recovered probs
        var s = 0;

        /* Calculate the prediction for each category */
        /* Grab the keys as an array, so we can use all the Array chaining magic */
        /* Also, we'll use this array later to reconstitute/classify  the probs */
        var cats = Object.keys(ts.rawcount.cats)
        
        el['stats'] = cats

          /* walk over the known categories */
          .map( function(cat){

            // For each category C, compute L(C|B) = L(C) + 􏰀W ∈B L(W |C).
            var LCB = ts.lg.cats[cat] +            /* L(C|B) */
              el.desc.reduce( function(b,word){    /* W ∈B */
                return b + ts.lg.words[word][cat]; /* SUM(L(W|C)) */
              }, 0);
            
            /* Calculate the local Min; record its key and val */
            localMin = (localMin.val <= LCB) ? localMin : {key:cat,val:LCB};

            /* record the prediction */
            el['prediction'] = localMin.key;
            
            return LCB;
          })

          /* Recover the probabilities; return them positionally; we'll recover the positions next  */
          .map( function( cat ){ 
            // this is the formula for the recovery
            // if (ci−m<7)  xi=2^m−ci else xi=0
            var xi = ((cat-localMin.val)<7) ? Math.pow(2,localMin.val-cat) : 0;
    
            // While we're here, we can accumulate the sum in s
            // It's local to this bio/record and will reset on each record
            s += xi;
            return xi;
          })

          /* Recover the computations xi as a fraction of s  */ 
          .reduce( function(a, xi,i){
            a[cats[i]] = xi/s;
            return a;
          },{});
 
        return el;
      })
    events.emit('computeProbabilitiesFinished');
  });
  /****************END TEST DATA************/



  /***************READ FILES *******************/
  fs.readFile((stopwordsFileName?stopwordsFileName:'stopwords.txt'), {  encoding: 'utf8'}, function(e, d) {  
    readFileContents(e, d, readStopWords);
  });

  fs.readFile('corpus.txt', {  encoding: 'utf8'}, function(e, d) {  
    readFileContents(e, d, readCorpus);
  });

}

//console.log(process.argv.slice(2));
NaiveBayes.apply(this,process.argv.slice(2));
