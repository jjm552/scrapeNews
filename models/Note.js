// Require mongoose
var mongoose = require("mongoose");

// Create a schema class
var Schema = mongoose.Schema;

// Note Schema
var NoteSchema = new Schema({
   
    body: {
        type: String
    }
});

var Note = mongoose.model("Note", NoteSchema);

module.exports = Note;