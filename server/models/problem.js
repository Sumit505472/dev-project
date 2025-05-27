// i will add problem once i build the basic online judge
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const testCaseSchema = new mongoose.Schema({
    input: { type: String, required: true },
    output: { type: String, required: true }
  });
  
 
const problemSchema=new mongoose.Schema({

    title:{
        type:String,
        required:true,
    },
    difficulty:{
    type:String,
    required:true,
    },
    question_description:{
        type:String,
        required:true,

    },
    question_number:{
        type:Number,
        required:true,
    },
    input_format:{
        type:String,
        required:true,
    },
    output_format:{
        type:String,
        required:true,
    },
    tags: [{
        type: String,
        required: true,
      }],
    constraints:{
        type:String,
        required:true,
    },
    Note:{
        type:String,  
    },
    test_cases:[testCaseSchema],
    time_limit:{
        type:Number,
        required:true,
        default:1
    },
    memory_limit:{
        type:Number,
        required:true,
        default:256
    }
 
});
export default mongoose.model('Problem',problemSchema);
