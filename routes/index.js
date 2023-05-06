const express=require('express')

/** these 2 modules for tensorflow.js */
const tf=require('@tensorflow/tfjs')
const toxicity=require('@tensorflow-models/toxicity')
/** these 2 mdoules for NLP implementation */
const natural = require("natural");
const stopword = require("stopword");

const router=express.Router()

/**-----------For NLP--------------------- */
const wordDict = {
    "aren't": "are not",
    "can't": "cannot",
    "couldn't": "could not",
    "didn't": "did not",
    "doesn't": "does not",
    "don't": "do not",
    "hadn't": "had not",
    "hasn't": "has not",
    "haven't": "have not",
    "he'd": "he would",
    "he'll": "he will",
    "he's": "he is",
    "i'd": "I would",
    "i'd": "I had",
    "i'll": "I will",
    "i'm": "I am",
    "isn't": "is not",
    "it's": "it is",
    "it'll": "it will",
    "i've": "I have",
    "let's": "let us",
    "mightn't": "might not",
    "mustn't": "must not",
    "shan't": "shall not",
    "she'd": "she would",
    "she'll": "she will",
    "she's": "she is",
    "shouldn't": "should not",
    "that's": "that is",
    "there's": "there is",
    "they'd": "they would",
    "they'll": "they will",
    "they're": "they are",
    "they've": "they have",
    "we'd": "we would",
    "we're": "we are",
    "weren't": "were not",
    "we've": "we have",
    "what'll": "what will",
    "what're": "what are",
    "what's": "what is",
    "what've": "what have",
    "where's": "where is",
    "who'd": "who would",
    "who'll": "who will",
    "who're": "who are",
    "who's": "who is",
    "who've": "who have",
    "won't": "will not",
    "wouldn't": "would not",
    "you'd": "you would",
    "you'll": "you will",
    "you're": "you are",
    "you've": "you have",
    "'re": " are",
    "wasn't": "was not",
    "we'll": " will",
    "didn't": "did not"
}
router.get('/',(req,resp)=>{
    result={}
    return resp.render('home_page.ejs',result)
})
router.post('/submit',async(req,resp)=>{
    const prompt=req.body.prompt
    
    /*---------------------------BY USING TENSOR.JS ----------------------------- */
    //uncomment these 2 lines below for tensor.js
    // const result=await predictSentimentUsingTensorflowJs(prompt)
    // return resp.render('home_page.ejs',{sentiment:result.sentiment,score:result.score})

    const lexData = convertToStandard(prompt);
    console.log("Lexed Data: ",lexData);
  
    // Convert all data to lowercase
    const lowerCaseData = convertTolowerCase(lexData);
    console.log("LowerCase Format: ",lowerCaseData);
  
    // Remove non alphabets and special characters
    const onlyAlpha = removeNonAlpha(lowerCaseData);
    console.log("OnlyAlpha: ",onlyAlpha);
  
    // Tokenization
    const tokenConstructor = new natural.WordTokenizer();
    const tokenizedData = tokenConstructor.tokenize(onlyAlpha);
    console.log("Tokenized Data: ",tokenizedData);
  
    // Remove Stopwords
    const filteredData = stopword.removeStopwords(tokenizedData);
    console.log("After removing stopwords: ",filteredData);
  
    // Stemming
    const Sentianalyzer =
    new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    const analysis_score = Sentianalyzer.getSentiment(filteredData);
    console.log("Sentiment Score: ",analysis_score);
  
    const sentiment=analysis_score>1.0?'positive':analysis_score>=-1.0?'neutral':'negative'
    return resp.render('home_page.ejs',{sentiment:sentiment,score:analysis_score})
})


/*------------------USING TENSORFLOW.JS----------------------*/
const predictSentimentUsingTensorflowJs=(sentence)=>{
    toxicity.load().then(model=>{
        model.classify(sentence).then(prediction=>{
            console.log(prediction)
            let avg=0//prediction[0].results[0].probabilities[0];
            prediction.forEach(elem=>{
                
                avg+=elem.results[0].probabilities[0]
                

            })
            const score=avg/prediction.length
            const sentiment=score>0.8?'positive':score>=0.75?'neutral':'negative'
            console.log(score,sentiment)
            return {score:score,sentiment:sentiment}
        })
    })
}


/**------------------------------------------USING NLP------------------------------------------------------- */
const convertToStandard = text => {
    const data = text.split(' ');
    data.forEach((word, index) => {
        Object.keys(wordDict).forEach(key => {
            if (key === word.toLowerCase()) {
                data[index] = wordDict[key]
            };
        });
    });
  
    return data.join(' ');
}
  
// LowerCase Conversion
const convertTolowerCase = text => {
    return text.toLowerCase();
}
  
// Pure Alphabets extraction
const removeNonAlpha = text => {
  
    // This specific Regex means that replace all
    //non alphabets with empty string.
    return text.replace(/[^a-zA-Z\s]+/g, '');
}
module.exports=router