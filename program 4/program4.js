(function learn(bios,N,stopwords){
	var bios = [];
	var stopwords = [];
	var trainingStats = {};

	var fs = require('fs');
	var events = new (require('events')).EventEmitter;
	var files = ['stopwords.txt','bioCorpus.txt'];
	var fileCount = 2;

	String.prototype.normalize = function() {
		return this
			.trim()										// there might be some trailing whitespace, let's get rid of it
	  	.toLowerCase();						// all text should be normalized to lowercase
	};

	function readBio(data) {
		// split into records 
	  bios = data.toString().trim()
	  							/* The format of this file is as follows: lowercase */
	  	.split(/\s*\n{2,}\s*/) 								/* Separate biographies are separated by 1 or more blank lines. */
	  	
	  	//console.log(bios)
	}

	function readStopWords(data){
		stopwords = data.toString().trim().split(/[\n\s]+/);
		//console.log(stopwords);
	}

	var readFileContents = function (err,data,callback){
		if(err) throw err;
		callback(data);
		if(--fileCount===0){
			events.emit('fileProcessingFinished');
		};
		return;
	}



	function removeStopWords (allwords,badword) {
			// dynamically generate a regexp from the stopword
			var rgx = new RegExp('\\b\('+badword+')\\b','g');
			//console.log(rgx);
			return allwords.replace(rgx,'');
	}

	function tabulateWords(cat,cleanword) {
		if(typeof trainingStats[cat] === 'undefined'){
			trainingStats[cat] = {};
		}
		if(typeof trainingStats[cat][cleanword] === 'undefined'){
			trainingStats[cat][cleanword] = 0;
		}

		// count here
		trainingStats[cat][cleanword]++;

	}


	events.on('fileProcessingFinished',function(){
		var wordsRemoved =[];
		// walk through the stopwords and remove any stopwords

		var trainingSet = stopwords.reduce( removeStopWords , bios.slice(0,N).join('***').toLowerCase())
		  .split('***')
			.map( function(el){

		  	var temp = el.split(/\n/);		/* split each record into lines, */  
		  	var name = temp.shift().trim();  /* In each biography, the first line is the name of the person.*/
		  	var cat  = temp.shift().trim();  /* The second line is the category (a single word). */
		  	var desc = temp.join(' ')       /* The remaining lines are the biography. */
		  		.split(/\s+/)									/* we just joined the multiple arrays into one long string, now let's split on spaces */
		  		.reduce( function(a,el){      /* remove small words and junk from the words */
		  			var cleanword = el.replace(/[^a-z]/g,'');

		  			// if the words are longer than 2, start counting them
						if(cleanword.length > 2){
							tabulateWords(cat,cleanword);
							//push this into the set
							a.push(cleanword);
						}
						return a;

		  		},[])
		  	
		  		console.log(desc,trainingStats);

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


		console.log('fileProcessingFinished');
	});

	
	fs.readFile( 'stopwords.txt' ,{encoding:'utf8'}, function(e,d){readFileContents(e,d,readStopWords)});
	fs.readFile( 'bioCorpus.txt' ,{encoding:'utf8'}, function(e,d){readFileContents(e,d,readBio)});


})(1,8);
