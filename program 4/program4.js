(function learn(bios,N,stopwords){
	var bios = [];
	var stopwords = [];

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
	  	.map( function(obj){
		  	var temp = obj.split(/\s*\n\s*/);		/* split each record into lines,  */
		  	return {
		  		name	: temp.shift(),				/* In each biography, the first line is the name of the person.*/
		  		cat		: temp.shift(),				/* The second line is the category (a single word). */
		  		desc  : temp.join(' ')			/* The remaining lines are the biography. */
		  	};
		  });
	  	//console.log(bios)
	}

	function readStopWords(data){
		stopwords = data.toString().trim().split(/[\n\s]+/);
		console.log(stopwords);
	}

	var readFileContents = function (err,data,callback){
		if(err) throw err;
		callback(data);
		if(--fileCount===0){
			events.emit('fileProcessingFinished');
		};
		return;
	}

	events.on('fileProcessingFinished',function(){
		var trainingSet = bios.slice(0,N).map(function(i,e){
			console.log(i,e);
			throw '';
		});
		var testSet = bios.slice(N);
		//console.log(trainingSet.length);
		console.log(testSet);
		// bios


		console.log('fileProcessingFinished');
	});

	
	fs.readFile( 'stopwords.txt' ,{encoding:'utf8'}, function(e,d){readFileContents(e,d,readStopWords)});
	fs.readFile( 'bioCorpus.txt' ,{encoding:'utf8'}, function(e,d){readFileContents(e,d,readBio)});


})(1,8);
