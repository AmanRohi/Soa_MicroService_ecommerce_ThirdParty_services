const mongoose = require("mongoose")
const User = require("./User");

const PaymentSchema = new mongoose.Schema({
    amount:Number,
    User:{type:mongoose.Schema.Types.ObjectId,
        ref:'User'},
});

const Payment = mongoose.model("payment", PaymentSchema);

module.exports=Payment;

