
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
app.get("/inventory", async (req, res) => {
    try {
        const productId = req.params;

        // Check if the user exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        res.status(201).json({ message: "Product Found successfully", product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error finding Product !!", error });
    }
});



app.set("port", process.env.port || 3005)
app.listen(app.get("port"), async() => {
  try{     
    console.log(`Server Started on http://localhost:${app.get("port")}`)
    console.log(process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDbConnected`);
    }
    catch(error){
        console.log("Unsucess :"+error);
    }
});