(function learn(bios, N, stopwords) {
  var bios = [];
  var stopwords = {};
  var ts = {
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
    },
  };

  var ls = {
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
    },
  };


  var fs = require('fs');
  var events = new(require('events')).EventEmitter;
  var files = ['stopwords.txt', 'tinyCorpus.txt'];
  var fileCount = 2;


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

  function readFileContents(err, data, callback) {
    if (err) throw err;
    callback(data);
    if (--fileCount === 0) {
      events.emit('fileProcessingFinished');
    };
    return;
  }


  

  function computeProbabilities(rawCount){
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
      //var rawCount = ts.rawcount;
      // now that we've tabulated all the counts, start workingout all the probabilities
      for (var word in rawCount.words){
        
        ts.freq.words[word]={};
        ts.prob.words[word]={};
        ts.lg.words[word]={};

        for(var cat in rawCount.cats){
          //console.log(rawCount.cats)

          /* For each classification C, define FreqT (C) = OccT (C)/|T|, the fraction of the biographies
that are of category C.*/
          ts.freq.cats[cat]         = freqDistro( rawCount.cats[cat] , Object.keys(rawCount.cats).length);
          // freq of words per cat  = total amount of words per cat / total amount of cats
          ts.freq.words[word][cat]  = freqDistro( rawCount.words[word][cat] , rawCount.cats[cat]);

          ts.prob.cats[cat]         = PC(  ts.freq.cats[cat], Object.keys(rawCount.cats).length);
          ts.prob.words[word][cat]  = PWC( ts.freq.words[word][cat] );

          ts.lg.cats[cat]           = LC( ts.prob.cats[cat] );
          ts.lg.words[word][cat]    = LWC( ts.prob.words[word][cat] );
        }
      };
      return;
    }
 

  events.on('fileProcessingFinished', function() {

    function incrementWord(cat, word, counter) {
      if (typeof counter[word] === 'undefined') {
        counter[word] = {};
      }
      if (typeof counter[word][cat] === 'undefined') {
        counter[word][cat] = 0;
      }
      return ++counter[word][cat];
    }


    function parseTestBio( el) {
        
        // keep track of we've ween
        var wordsSeen = {};
        
        /* split each record into lines, */
        var temp = el.toLowerCase().split(/\n/);
        
        /* In each biography, the first line is the name of the person.*/
        var name = temp.shift().trim();

        /* The second line is the category (a single word). */
        var cat = temp.shift().trim();
        
        /* The remaining lines are the biography. */
        var desc = temp
          .join(' ')     /* The bio may be fragmnted in different lines. Join them into one string so we cna operate on it a one body */ 
          .split(/\s+/)  
          .reduce( function(a,el){
            // This is the pass through the bio of one record
            /* remove small words and junk from the words */
            var cleanword = el.replace(/[^a-z]/g, '');
            
            //console.log(a,ls);
            // start counting if the words are longer than 2 AND not in the startwords lookup AND must be in the training set
            if (cleanword.length > 2 && !stopwords[cleanword] && ts.rawcount.words[cleanword]) {
              if (!wordsSeen[cleanword]) {
                incrementWord(cat, cleanword, ls.rawcount.words);
                wordsSeen[cleanword] = 1;
              } else {
                wordsSeen[cleanword]++;
              }
              //push this into the set
              a.push(cleanword);
            }else{
              console.log('removed word: ',cleanword)
            }

            return a;
          }, []);

        // tabulate the category frequency distribution
        ls.rawcount.cats[cat] = ls.rawcount.cats[cat] ? ls.rawcount.cats[cat] + 1 : 1;
        ls.freq.cats[cat]     = ls.freq.cats[cat]     ? ls.freq.cats[cat] + 1 / N : 1 / N;


        return {
          name: name,
          cat: cat,
          desc: desc
        };
      }

    function parseTrainingBio( el) {
      
      // keep track of we've ween
      var wordsSeen = {};
      
      /* split each record into lines, */
      var temp = el.toLowerCase().split(/\n/);
      
      /* In each biography, the first line is the name of the person.*/
      var name = temp.shift().trim();

      /* The second line is the category (a single word). */
      var cat = temp.shift().trim();
      
      /* The remaining lines are the biography. */
      var desc = temp
        .join(' ')     /* The bio may be fragmnted in different lines. Join them into one string so we cna operate on it a one body */ 
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


    /****************BEGIn TRAINING SET************/
    bios.slice(0, N)
      .map( parseTrainingBio )
      

   // compute the probabilities of the words distributions
   // note that we have to do this AFTER all the words have been tabulated so there's no risk of calculating partial counts   
    computeProbabilities( ts.rawcount );
    
    console.log(ts.freq.words);



    /****************END TRAINING SET************/

    /****************BEGIN TEST DATA************/
    bios.slice(N)
      .map( parseTestBio )
console.log(ls.freq.words);

    //console.log(ts);
    console.log('fileProcessingFinished');
  });


  fs.readFile('stopwords.txt', {  encoding: 'utf8'}, function(e, d) {  
    readFileContents(e, d, readStopWords);
  });

  fs.readFile('tinyCorpus.txt', {  encoding: 'utf8'}, function(e, d) {  
    readFileContents(e, d, readCorpus);
  });


})(1, 5);