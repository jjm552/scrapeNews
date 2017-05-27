// Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
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

// Set Handlebars as default templating engine
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Make public a static dir
app.use(express.static("public"));

//Database configuration with mongoose
var databaseUri = 'mongodb://localhost/arsTechnicaScrape';

if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI);
} else {
    mongoose.connect(databaseUri);
}

var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function (error) {
    console.log("Mongoose Error: " + error);
});

// Once logged in to the db through mongoose, log a success message
db.once("Open", function () {
    console.log("Mongoose connection successful.");
});

// Routes
// ======

// A GET request to scrape ARS Technicas website
app.get("/", function (req, res) {
   Article.find({saved: false}, function(err, result){
       if (err){
           console.log(err);
       } else{
           res.render("index", {articles: result});
       }
   });
});

app.get("/scrape", function (req, res) {

    console.log("\n***********************************\n" +
        "Grabbing every article name, link, and byline\n" +
        "from ars technica main page:" +
        "\n***********************************\n");

    request("https://arstechnica.com/", function (error, response, html) {
        var $ = cheerio.load(html);
        var promise = null;
        $("article.tease").each(function (i, element) {
            var result = {};

            result.title = $(this).children("header").children("h2").children("a").text();
            result.link = $(this).children("a").attr("href");
            result.byLine = $(this).children("header").children("p.byline").children("a").children("span").text();
            result.articleDateTime = $(this).children("header").children("p.byline").children("time").text();

            // Use Article model to create a new entry
            var entry = new Article(result);

            // Promise used to wait for scrape results
            promise = entry.save(function (err, doc) {
                if (err) {
                    console.log(err);
                }
            });
        });
        if (promise instanceof Promise) {
            promise.then(function (result) {
                res.send("ARS Technica Scraped");
            });
        } else {
            res.status(400);
            res.send('Error');
        }
    });
});

// A POST request to set article to saved
app.post('/saveArticle', function (req, res) {
    Article.update({ '_id': req.body.articleId }, { $set: { 'saved': true } }, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

// A POST request to set article to not saved
app.post('/removeSavedArticle', function (req, res) {
    Article.update({ '_id': req.body.articleId }, { $set: { 'saved': false } }, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

// A GET request to load saved page
app.get('/saved', function (req, res) {
    Article.find({}, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            res.render("saved", { articles: result });
        }
    });
});


// A GET request for a article by id
app.get("/articles/:id", function (req, res) {
    Article.findOne({ '_id': req.params.id }).populate('notes')
        .exec(function (error, doc) {
            if (error) {
                console.log(error);
            } else {
                res.send(doc);
            }
        });
});


// A POST request to create a new note
app.post("/articles/:id", function (req, res) {
    var newNote = new Note(req.body);

    newNote.save(function (error, doc) {
        if (error) {
            console.log(error);
        } else {
            Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { "notes": doc._id } }, { new: true })
                .exec(function (err, newdoc) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.send(newdoc);
                        console.log(newdoc);
                    }
                });
        }
    });
});

// A DELETE request to remove a note 
app.delete("/deleteNote/:id", function (req, res) {
    Note.remove({'_id': req.params.id }, function (err, doc) {
        if (err) {
            console.log(error);
        } else {
            res.send(doc);
        }
    });
});



// Listen on port 3000
app.listen(3000, function () {
    console.log("App running on port 3000");
});