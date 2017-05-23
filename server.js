// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Requiring our Note and Article modles
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");

// Set mongoose to leverage built in JS ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Make public a static dir
app.use(express.static("public"));

//Database configuration with mongoose
mongoose.connect("mongodb://localhost/arsTechnicaScrape");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
    console.log("Mongoose Error: " + error);
});

// Once logged in to the db through mongoos, log a success message
db.once("Open", function() {
    console.log("Mongoose connection successful.");
});

// Routes
// ======

// A GET request to scrape ARS Technicas website
app.get("/scrape", function(req, res) {

    console.log("\n***********************************\n" +
        "Grabbing every article name, link, and byline\n" +
        "from ars technica main page:" +
        "\n***********************************\n");

    request("https://arstechnica.com/", function(error, response, html) {
        var $ = cheerio.load(html);

        $("article.tease").each(function(i, element) {
            var result = {};

            result.title = $(this).children("header").children("h2").children("a").text();
            result.link = $(this).children("a").attr("href");
            result.byLine = $(this).children("header").children("p.byline").children("a").children("span").text();
            result.articleDateTime = $(this).children("header").children("p.byline").children("time").text();

            // Use Article model to create a new entry
            var entry = new Article(result);

            // Save that entry to DB
            entry.save(function(err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(doc);
                }
            });
        });
    });
    res.send("ARS Technica Scraped");
});

// A GET request to return the articles we scraped from the mongoDB
app.get("/articles",function(req,res){
    Article.find({},function(error,doc){
        if(error){
            console.log(error);
        }
        else{
            res.json(doc);
        }
    });
});

// A GET request for a article by id
app.get("/articles/:id",function(req,res){
    Article.findOne({"_id": req.params.id})
    .populate("note")
    .exec(function(error,doc){
        if (error){
            console.log(error);
        }
        else{
            res.pjson(doc);
        }
    });
});


// A POST request to create a new note
app.post("/articles/:id",function(req,res){
    var newNote = new Note(req.body);

    newNote.save(function(error,doc){
        if(error){
            console.log(error);
        }
        else{
            Article.findOneAndUpdate({"_id":req.params.id},{"note":doc._id})
            .exec(function(err,doc){
                if (err){
                    console.log(err);
                }
                else{
                    res.send(doc);
                }
            });
        }
    });
});



// Listen on port 3000
app.listen(3000, function() {
    console.log("App running on port 3000");
});