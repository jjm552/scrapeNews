var request = require("request");
var cheerio = require("cheerio");

console.log("\n***********************************\n" +
            "Grabbing every thread name and link\n" +
            "from ars technica main page:" +
            "\n***********************************\n");

request("https://arstechnica.com/", function(error,response,html){
    var $ = cheerio.load(html);
    var results = [];

    $("article.tease").each(function(i,element){
        
    });

});