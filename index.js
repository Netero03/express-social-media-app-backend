// index.js (Entry point of your backend)

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDRlvBeFQdoizNuyKbfbWoIRxNcaGUcarw",
  authDomain: "testapp1-9fcb4.firebaseapp.com",
  projectId: "testapp1-9fcb4",
  storageBucket: "testapp1-9fcb4.appspot.com",
  messagingSenderId: "261353310185",
  appId: "1:261353310185:web:2511d7ddc241df628e2d78"
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import qr from 'qrcode';
import { User } from './models/user.js';

const PORT = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

mongoose.set('strictQuery', false);

app.get('/', (req, res) => {
  res.send('Hello World')
})
// Routes
// Signup route
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    // Validate input fields
    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await firebase.auth().getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with Firebase Authentication (custom email)
    const userRecord = await firebase.auth().createUser({
      email,
      password: hashedPassword,
      displayName: name,
    });

    // Create new user in MongoDB
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
    });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Sign in user with Firebase Authentication (custom email)
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    const token = await userCredential.user.getIdToken();
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Google login route
app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    // Verify Google ID token
    const decodedToken = await firebase.auth().verifyIdToken(idToken);
    const { email, name } = decodedToken;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      // Create new user if not exists
      const newUser = new User({
        name,
        email,
      });
      await newUser.save();
    }

    // Generate JWT token
    const token = jwt.sign({ email }, 'your_secret_key', { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error logging in with Google:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user profile route
app.get('/api/profile/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const userProfile = await User.findById(userId);
    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile route
app.put('/api/profile/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    // Update user profile logic here
    res.status(200).json({ message: 'User profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user profile route
app.delete('/api/profile/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    // Delete user profile logic here
    res.status(200).json({ message: 'User profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Generate QR code route
app.get('/api/qrcode/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const userProfile = await User.findById(userId);
    if (!userProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Generate QR code
    const qrCodeData = `https://localhost:5173/profile/${userId}`;
    qr.toDataURL(qrCodeData, (err, url) => {
      if (err) {
        console.error('Error generating QR code:', err);
        return res.status(500).json({ message: 'Error generating QR code' });
      }
      res.status(200).json({ qrCodeUrl: url });
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// MongoDB connection
mongoose.connect('mongodb+srv://jatinletsgo:8ZzwK33vZ076iqJF@cluster0.97awjld.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));

