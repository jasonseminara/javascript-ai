var a = "a At(X,L,I)\nLoaded(Eggs,Truck1,1) Loaded(Eggs,Truck1,2) b c z y At(X,L,I)\nd e f g\nend qwerty a";
(function() {

	var parseSymbols = function(sentences){
		var hashMap = {};
		var symbolArray = [0];
		var symbols = sentences.split(/[\n\s]/);
		//console.log(symbols);
		symbols.map(function(symbol){
			console.log(symbol);
			if(!(symbol in hashMap)){
				symbolArray.push(symbol)
				hashMap[symbol] = symbolArray.length-1;
			}
		});
		
		console.log(hashMap,symbolArray)
		return [hashMap,symbolArray];
	};	

	return parseSymbols(a)
})();

