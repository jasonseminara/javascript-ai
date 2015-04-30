(function learn(bios,N,stopwords){
	var bios = [];
	var stopwords = {};
	var trainingStats = {rawcount:{},stats:{}};

	var fs = require('fs');
	var events = new (require('events')).EventEmitter;
	var files = ['stopwords.txt','bioCorpus.txt'];
	var fileCount = 2;


	function readBio(data) {
		// split into records 
	  bios = data.toString()
	    .trim() 										/* trim off any whitespace that could potentially become a null record*/
	  	.split(/\s*\n{2,}\s*/) 			/* Separate biographies are separated by 1 or more blank lines. */
	  	
	  	//console.log(bios)
	}

	/**
	* Parse the stopwords data file
	*/ 
	function readStopWords(data){
		// convert it into a O(n) lookup hash
		stopwords = data.toString()     /* just to make sure it's a real string */
			.trim()												/* trim off any whitespace that could potentially become a null record*/
			.split(/[\n\s]+/)							/* split on any NL or spaces */
			.reduce(function(a,b){
				a[b] = true;
				return a;
			},{});
		return;
	}

	function readFileContents (err,data,callback){
		if(err) throw err;
		callback(data);
		if(--fileCount===0){
			events.emit('fileProcessingFinished');
		};
		return;
	}


	function tabulateWords(cat,cleanword,counter) {
		if(typeof counter[cleanword] === 'undefined'){
			counter[cleanword] = {};
		}
		if(typeof counter[cleanword][cat] === 'undefined'){
			counter[cleanword][cat] = 1;
		}

	}


	events.on('fileProcessingFinished',function(){
		var wordsRemoved =[];
		// walk through the stopwords and remove any stopwords

		var trainingSet = bios.slice(0,N)
			.map( function(el){
		  	var temp = el.toLowerCase().split(/\n/);		/* split each record into lines, */  
		  	var name = temp.shift().trim();  /* In each biography, the first line is the name of the person.*/
		  	var cat  = temp.shift().trim();  /* The second line is the category (a single word). */
		  	var desc = temp.join(' ')       /* The remaining lines are the biography. */
		  		.split(/\s+/)									/* we just joined the multiple arrays into one long string, now let's split on spaces */
		  		.reduce( function(a,el){      /* remove small words and junk from the words */
		  			var cleanword = el.replace(/[^a-z]/g,'');

		  			// if the words are longer than 2
		  			// AND not in the startwords lookup, 
		  			// start counting them
						if(cleanword.length > 2 && !stopwords[cleanword]){
							
							tabulateWords(cat,cleanword,trainingStats.rawcount);
							//push this into the set
							a.push(cleanword);
						}
						return a;

		  		},[])
		  	

		   	return {
		   		name	: name,				
		   		cat		: cat,				
		   		desc  : desc			
		   	};
		  })


		  //console.log(trainingSet)
			//throw '';
	
		var testSet = bios.slice(N);
		//console.log(trainingSet.length);
		//console.log(testSet);
		// bios


		console.log(trainingStats);
		console.log('fileProcessingFinished');
	});

	
	fs.readFile( 'stopwords.txt' ,{encoding:'utf8'}, function(e,d){readFileContents(e,d,readStopWords)});
	fs.readFile( 'bioCorpus.txt' ,{encoding:'utf8'}, function(e,d){readFileContents(e,d,readBio)});


})(1,8);
