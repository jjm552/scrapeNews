// Require mongoose
var mongoose = require("mongoose");

// Create Schema class
var Schema = mongoose.Schema;

// Article schema
var ArticleSchema = new Schema({
    title: {
        type: String,
        require: true
    },
    link: {
        type: String,
        required: true
    },
    byLine: {
        type: String,
    },
    articleDateTime: {
        type: String,
        required: true
    },
    articleImage: {
        type: String
    },
    saved: {
        type: Boolean,
        default: false
    },
    notes: [{
        type: Schema.Types.ObjectId,
        ref: "Note"
    }]
});

// Creat the Article model woth the ArticleSchema
var Article = mongoose.model("Article", ArticleSchema);

// Export model
module.exports = Article;