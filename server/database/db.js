import mongoose from 'mongoose';
import dotenv from 'dotenv';
//install using npm i mongoose dotenv

dotenv.config();

const DBConnection=async()=>{
    const MONGO_URI=process.env.MONGO_URL;
    try{
        await mongoose.connect(MONGO_URI,{});
            

        await mongoose.connect(MONGO_URI, {
            
            useUnifiedTopology: true,
            tls: true
          });
          

        console.log("Connected to the database successfully");

    }catch(error){
        console.error("Error while connecting to the database",error);
    }
};
export default DBConnection;
