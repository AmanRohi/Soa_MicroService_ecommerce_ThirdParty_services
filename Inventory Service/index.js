
require('dotenv').config();
const mongoose=require("mongoose");
const express = require('express');
const { ethers } = require("ethers");
const cors = require("cors")

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
    cors({
      origin: "*",
      credentials: true, //access-control-allow-credentials:true
      optionSuccessStatus: 200,
    })
  )

const Product = require("./modal/Product");
// unique id of user , text , rating 
app.get("/inventory/:productId", async (req, res) => {
    try {
        
        const productId = req.params.productId;

        // Check if the user exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        console.log("Stock Check Done !!");
        console.log(product);
        res.status(201).json({ message: "Product Found successfully", product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error finding Product !!", error });
    }
});

app.post("/updateInventory", async (req, res) => {
    try {
        
        const {quantity,productId} = req.body;
        // Check if the user exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        product.stock-=(quantity);
        await product.save();
        console.log("Product Stock Updated !!");
        res.status(201).json({ message: "Product Stock Updated successfully", product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error finding Product !!", error });
    }
});



const PORT=3005;
app.set("port", process.env.port || 3005)
app.listen(app.get("port"), async() => {
  try{     
    console.log(`Inventory service running on port ${PORT}`)
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDbConnected`);
    }
    catch(error){
        console.log("Unsucess :"+error);
    }
});