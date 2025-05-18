import mongoose from 'mongoose';

const userSchema=new mongoose.Schema({
   fullname:{
    type:String,
    default: null,
    required: true,
    },
   
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    token: {
        type: String, 
    }
 
});

export default mongoose.model('User',userSchema);
