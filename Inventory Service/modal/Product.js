const mongoose = require("mongoose")
const User = require("./User");

const ProductSchema = new mongoose.Schema({
    name:String,
    price:Number,
    stock:Number
});

const Product = mongoose.model("product", ProductSchema);

module.exports=Product;

