require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const app = express();

app.use(express.json());


mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));





// signup route

app.post('/signup', async (req, res) => {
    try {
      const { name, email, pwd } = req.body;
  
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: "User with this email already exists" });
  
      const hashedPassword = await bcrypt.hash(pwd, 10);
  
      const user = new User({ name, email, pwd: hashedPassword });
      await user.save();
  
      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error creating user", error: error.message });
    }
  });

//   login route
app.post('/login', async (req, res) => {
    try {
      const { email, pwd } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Invalid credentials" });
  
      const isPasswordValid = await bcrypt.compare(pwd, user.pwd);
      if (!isPasswordValid) return res.status(400).json({ message: "Invalid credentials" });
  
      const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: "Error logging in", error: error.message });
    }
  });
    


// my controller for verifying token .. 

app.post('/verify-token', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return res.json({
            isValid: true,
            userId: decoded.userId,
            message: 'Token is valid',
        });
    } catch (error) {
        
        return res.status(401).json({ isValid: false, message: 'Token is invalid or expired' });
    }
});


const PORT = 3006;
app.listen(PORT, () => console.log(`Token verification service running on port ${PORT}`));
