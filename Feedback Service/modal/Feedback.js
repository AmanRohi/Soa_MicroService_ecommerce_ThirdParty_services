const mongoose = require("mongoose")
const User = require("./User");

const FeedbackSchema = new mongoose.Schema({
    rating:Number,
    text:String,
    User:{type:mongoose.Schema.Types.ObjectId,
        ref:'User'},
});

const Feedback = mongoose.model("feedback", FeedbackSchema);

module.exports=Feedback;

