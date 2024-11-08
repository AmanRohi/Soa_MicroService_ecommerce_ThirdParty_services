
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

const Notification = require("./modal/Notification");
const User = require("./modal/User");
// unique id of user , text , rating 
app.post("/notification", async (req, res) => {
    try {
        const { text,userId } = req.body;

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Create a new feedback document
        const notification = new Notification({
            text,
            User: userId
        });

        // Save the feedback to the database
        await notification.save();
        console.log("Notification Send Successfully by the service !! ");
        
        res.status(201).json({ message: "Notification Send Successfully !", notification });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error sending notification !!", error });
    }
});



const PORT=3002;
app.set("port", process.env.port || 3002)
app.listen(app.get("port"), async() => {
  try{     
    console.log(`Notification service running on port ${PORT}`)
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDbConnected`);
    }
    catch(error){
        console.log("Unsucess :"+error);
    }
});