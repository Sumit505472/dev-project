import express from 'express';
import dotenv from 'dotenv';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


import DBConnection from './database/db.js';    
import User from './models/user.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
const app=express();


dotenv.config();
DBConnection();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.get("/",(req,res)=>{
res.send("hello world");
});

const saltRounds=10;

app.post("/register",async(req,res)=>{
    
    try{
        const {fullname,email,password}=req.body;
        //check if all fields are provided
        if(!(fullname && email && password)){
            return res.status(400).send("Please fill all the required fields");
        }
        //check if user already exists in the database(db.js)
        const userExists=await User.findOne({email});
        if(userExists){
            return res.status(400).send("User already exists with this email");
        }
    
        //now hashed the user password
        const hashedPassword=await bcrypt.hash(password,saltRounds);
    
        //save the user in db
        const newUser=await User.create({
            fullname,
            email,
            password:hashedPassword,
        });
        //create a token
        const token=jwt.sign(
            { id:newUser._id,email},
            process.env.SECRET_KEY,
            {expiresIn:"1d"}
        );
        //send the token in the response
        newUser.token=token;
        newUser.password=undefined;
        res.status(200).json({
            message: "You have successfully registered",
            user:newUser,
        });
    
    }catch(error){
    console.error("Registration failed",error);
    res.status(500).send("Something went wrong");
    }
});
app.post("/login",async(req,res)=>{
    try{
        const {email,password}=req.body;
        if(!(email && password)){
            return res.status(400).send("Please fill all the required fields");
        }
        //now we will check  given email is registered or not
        const userExists=await User.findOne({email});
        if(!userExists){
            return res.status(404).send("User not found with this email,enter correct email");
        }
        //now we will check the password given by user is correct or not
        const enteredPassword=await bcrypt.compare(password,userExists.password);
        if(!enteredPassword){
            return res.status(400).send("Password is incorrect ,enter correct password");
        }
        //now we will create a token
        const token=jwt.sign({id:userExists._id},process.env.SECRET_KEY,{expiresIn:"1d"});
        
        userExists.token=token;
        userExists.password=undefined;

        //store cookies
        const options = {
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            httpOnly: true, //only manipulate by server not by client/user
        };

        //send the token
        res.status(200).cookie("token", token, options).json({
            message: "You have successfully logged in!",
            success: true,
            token,
        });

    }catch(error){
        console.error("Login failed",error);
        res.status(500).send("Something went wrong");
    }


});

app.listen(process.env.PORT,()=>{
    console.log("server is running on port ",process.env.PORT);
});