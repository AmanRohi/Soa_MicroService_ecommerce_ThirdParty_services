
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

const verifyTokenWithExternalService = async (token) => {
    try {
        console.log("Invoking User Service !!");
        const tokenResponse = await fetch("http://localhost:3006/verify-token", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({
              token
          })
      });
        const res=tokenResponse.json();
        console.log(res);
        return res;
    } catch (error) {
        throw new Error('Token verification failed');
    }
};

const Feedback = require("./modal/Feedback");
const User = require("./modal/User");
// unique id of user , text , rating 
app.post("/feedback", async (req, res) => {
    try {
        const token = req.header('Authorization')?.split(' ')[1];  
        const verificationResponse = await verifyTokenWithExternalService(token);
        if (!verificationResponse.isValid) {
            return res.status(401).json({ message: "Token is not valid" });
        }

        const userId=(verificationResponse.userId);
        const { rating, text } = req.body;

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



const PORT=3001;
app.set("port", process.env.port || 3001)
app.listen(app.get("port"), async() => {
  try{     
    console.log(`Feedback service running on port ${PORT}`)
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDbConnected`);
    }
    catch(error){
        console.log("Unsucess :"+error);
    }
});