import mongoose from 'mongoose';
//i am creating schema for submission of code ,language,
const submissionSchema=new mongoose.Schema({
    language:{
        type:String,
        required:true
    },
    code:{
    type:String ,
    required:true
    },
    testcase :{
        type:String,
        required:true
    },
    testOutput :{
        type:String,
        required:true
    },
    compilerOutput :{
        type:String,
        required:true
    }


});
export default mongoose.model("Submission",submissionSchema);