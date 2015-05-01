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

  var fs = require('fs');
  var events = new(require('events')).EventEmitter;
  var files = ['stopwords.txt', 'bioCorpus.txt'];
  var fileCount = 2;


  function readBio(data) {
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


  function tabulateWords(cat, cleanword, counter) {
    if (typeof counter[cleanword] === 'undefined') {
      counter[cleanword] = {};
    }
    if (typeof counter[cleanword][cat] === 'undefined') {
      counter[cleanword][cat] = 0;
    }
    counter[cleanword][cat]++;

    /*if(typeof counter[cat] === 'undefined'){
      counter[cat] = {};
    }
    if(typeof counter[cat][cleanword] === 'undefined'){
      counter[cat][cleanword] = 1;
    }
    counter[cat][cleanword]++;*/
  }

  function computeProbabilities(rc){

      var PC = function(freq_c, totalCats){
        return ((freq_c ? freq_c:0)+0.1) / (1+totalCats*0.1);
      };
      
      var PWC = function(freq_wc){
        return (freq_wc + 0.1) / (1+2*0.1);
      };

      var LC = function (prob_cats) {
        return -(Math.log(prob_cats));
      }

      var LWC = function (pwc) {
        return -(Math.log(pwc));
      }

      //var rc = ts.rawcount;
      // now that we've tabulated all the counts, start workingout all the probabilities
      for (var word in rc.words){
        ts.freq.words[word]={};
        ts.prob.words[word]={};
        ts.lg.words[word]={};
        for(var cat in rc.cats){
          // freq of words per cat = total amount of words per cat / total amount of cats
          ts.freq.words[word][cat] = (rc.words[word][cat] ? rc.words[word][cat]:0) / rc.cats[cat];
          ts.prob.cats[cat]        = PC(ts.freq.cats[cat],Object.keys(rc.cats).length);
          ts.prob.words[word][cat] = PWC(ts.freq.words[word][cat]);
          ts.lg.cats[cat]        = LC(ts.prob.cats[cat]);
          ts.lg.words[word][cat] = LWC(ts.prob.words[word][cat]);
        }
      };
      return;
    }
 

  events.on('fileProcessingFinished', function() {
    var wordsRemoved = [];
    var trainingSet = bios.slice(0, N)
      .map(function(el) {
        var wordsSeen = {};
        /* split each record into lines, */
        var temp = el.toLowerCase().split(/\n/);
        /* In each biography, the first line is the name of the person.*/
        var name = temp.shift().trim();
        /* The second line is the category (a single word). */
        var cat = temp.shift().trim();
        /* The remaining lines are the biography. */
        var desc = temp.join(' ')
          .split(/\s+/) /* we just joined the multiple arrays into one long string, now let's split on spaces */
          .reduce(function(a, el) {

            // This is the pass through the bio of one record
            /* remove small words and junk from the words */
            var cleanword = el.replace(/[^a-z]/g, '');
            // if the words are longer than 2
            // AND not in the startwords lookup, 
            // start counting them
            if (cleanword.length > 2 && !stopwords[cleanword]) {
              if (!wordsSeen[cleanword]) {
                tabulateWords(cat, cleanword, ts.rawcount.words);
                wordsSeen[cleanword] = 1;
              } else {
                wordsSeen[cleanword]++;
              }
              //push this into the set
              a.push(cleanword);
            }

            //console.log(wordsSeen);
            return a;

          }, []);

        // tabulate the category frequency distribution
        ts.rawcount.cats[cat] = ts.rawcount.cats[cat] ? ts.rawcount.cats[cat] + 1 : 1;
        ts.freq.cats[cat] = ts.freq.cats[cat] ? ts.freq.cats[cat] + 1 / N : 1 / N;


        return {
          name: name,
          cat: cat,
          desc: desc
        };
      })
      
    computeProbabilities(ts.rawcount);

    
    //console.log(trainingSet)
    //throw '';

    var testSet = bios.slice(N);
    //console.log(trainingSet.length);
    //console.log(testSet);
    // bios


    console.log(ts);
    console.log('fileProcessingFinished');
  });


  fs.readFile('stopwords.txt', {  encoding: 'utf8'}, function(e, d) {  
    readFileContents(e, d, readStopWords);
  });

  fs.readFile('bioCorpus.txt', {  encoding: 'utf8'}, function(e, d) {  
    readFileContents(e, d, readBio);
  });


})(1, 9);