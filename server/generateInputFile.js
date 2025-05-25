
import {fileURLToPath} from "url";
import fs from "fs";
import path from "path";
import {v4 as uuid} from "uuid";


const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);


const dirInput=path.join(__dirname,"inputs");
if(!fs.existsSync(dirInput)){
    fs.mkdirSync(dirInput, {recursive:true});
}
const generateInputFile=(input)=>{
  
const jobId=uuid();
const inputFileName=`${jobId}.txt`;
const inputFilePath=path.join(dirInput,inputFileName);
fs.writeFileSync(inputFilePath,input);
return inputFilePath;
    

 
};
export default generateInputFile;
