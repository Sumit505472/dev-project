import mongoose from 'mongoose';
import dotenv from 'dotenv';
//install using npm i mongoose dotenv

dotenv.config();

const DBConnection=async()=>{
    const MONGO_URI=process.env.MONGO_URL;
    try{
<<<<<<< HEAD
        await mongoose.connect(MONGO_URI,{});
            
=======
        await mongoose.connect(MONGO_URI, {
            
            useUnifiedTopology: true,
            tls: true
          });
          
>>>>>>> 6a66842 (Add problem model, submission schema, seed script, and code execution handlers; setup Vite-based frontend)
        console.log("Connected to the database successfully");

    }catch(error){
        console.error("Error while connecting to the database",error);
    }
};
export default DBConnection;
