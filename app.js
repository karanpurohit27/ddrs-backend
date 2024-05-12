const express =require('express');
const app=express();
const PORT=5000;
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(bodyParser.json());
app.use(cors());
const crypto = require('crypto');
const secretKey = crypto.randomBytes(32).toString('hex');
app.get('/',(req,res)=>{
    res.send("hello")
})
const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://karanpurohit2710:Karan123@cluster0.offcxdk.mongodb.net/';

mongoose.connect(MONGODB_URI, {
    useUnifiedTopology: true
 })
 .then(() => console.log('Connected to MongoDB'))
 .catch(err => console.error('Error connecting to MongoDB:', err));


 const { Schema, model } = require('mongoose');

 // Define the user schema
 const userSchema = new Schema({
     email: {
         type: String,
         required: true,
         unique: true // Ensures uniqueness of email addresses
     },
     password: {
         type: String,
         required: true
     }
 });

 
 // Create a User model from the user schema
 const User = model('User', userSchema);

 const fileSchema = new mongoose.Schema({
    amount: {
      type: Number,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  });
  
const File = mongoose.model('File', fileSchema);
app.post('/files', async (req, res) => {
    try {
      const email=req.body.email;
      const amount=req.body.amount;
      const size=req.body.size;
      const newFile = new File({ amount, size,email });
      await newFile.save();
      res.status(201).json(newFile);
    } catch (err) {
      res.status(500).json({ message: err.message });
      console.log(err)
    }
});

 app.post('/signup', async (req, res) => {
    try {
        const email=req.body.email;
        const password=req.body.password;
        console.log(email)
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        // Check if the username already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists.' });
        }

        // Create a new user instance
        const newUser = new User({ email , password });

        // Save the user to the database
        await newUser.save();

        // Respond with a success message
        res.status(201).json({ message: 'User created successfully.' });
    } catch (error) {
        // Handle any errors
        console.log("err")
        console.log(error.message)
        res.status(500).json({ message: error.message });
    }
});
app.get('getfiles', async (req, res) => {
    try {
      console.log("getting")
      const files = await File.find();
      res.json(files);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

const jwt = require('jsonwebtoken');

app.post('/login', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Compare passwords
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        // Generate a JWT token
        const token = jwt.sign({ userId: user._id, email: user.email }, secretKey, { expiresIn: '1h' });
        // Respond with the token
        res.json({ token });
    } catch (error) {
        // Handle any errors
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
});




app.listen(PORT,()=>{
    console.log(`server is runnning on ${PORT}`)
})