
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

const Feedback = require("./Feedback");
const User = require("./User");
// unique id of user , text , rating 
app.post("/feedback", async (req, res) => {
    try {
        const { rating, text, userId } = req.body;

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create a new feedback document
        const feedback = new Feedback({
            rating,
            text,
            User: userId
        });

        // Save the feedback to the database
        await feedback.save();
        console.log("Feedback Saved Successfully !! ");

        // now call the notification service !! 
        const notificationResponse = await fetch("http://localhost:3002/notification", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text:"Feedback Registered Thanks for the valuable feedback !",
                userId// replace with a valid user ID
            })
        });

        if (!notificationResponse.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await notificationResponse.json();
        console.log("Notification Send !!", data);

        res.status(201).json({ message: "Feedback saved successfully & Notification also send successfully !!", feedback });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error saving feedback or while sending notification !!", error });
    }
});



app.set("port", process.env.port || 3001)
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