#Naive Bayes Text Classification
Performs a Naive Bayes Text Classification on a body of text; 
Tries to guess the category of a given text

* **Author** Jason Seminara, N12517906 
* **Date** 2015-05-05
* **For** New York University : CSCI-GA.2560-001 : Artificial Intelligence : Ernest Davis
* **See** http://cs.nyu.edu/courses/spring15/CSCI-GA.2560-001/prog4.pdf



##Instructions
This is a node.js executable. (Tested on v0.12.2)

Execute by passing the two required args in the command line (It will always read from a corpus named 'corpus.txt':
1. N (the count of records to use as the training set)
2. stopwordsFileName (the filename of the text file that defines the words to skip during the learning phase)

For example:

    node naiveBayes.js 5 stopwords.txt



##Returns 
Tabular output of the category prediction of the given set of biographies, including the overall accuracy of the predictions:

For Example:


    Benjamin Disraeli.  Prediction: Writer.  Wrong.
    Government: 0.44     Music: 0.07     Writer: 0.48

    George Eliot.  Prediction: Writer.  Right.
    Government: 0.01     Music: 0.07     Writer: 0.91
    
    Barbara Jordan.  Prediction: Government.  Right.
    Government: 0.97.    Music: 0.03.    Writer: 0.00
    
    Clara Schumann.  Prediction: Music.  Right
    Government: 0.01.    Music: 0.98.    Writer: 0.01
    
    Overall accuracy: 3 out of 4 = 0.75.