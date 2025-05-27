import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import {v4 as uuid} from "uuid";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);//__dirname gives the path of the current directory

const outputPath = path.join(__dirname, "outputs");
//C:\Users\Sumit\Desktop\onlinecompiler\backend\outputs

//here a folder created with name outputs in which.exe file will get stored

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });//recursive :true mean if parent folder(onlinecompiler,backend,or output )is not created then node.js will also create it f2fd182e621b2b1f4f400c744a6f260c179a16c3
}

// 'C:\\Users\\Sumit\\Desktop\\onlinecompiler\\backend\\codes\\5aab0e21-ef55-46a7-bfca-26354d058178.cpp'
const executeCpp = (filePath,inputFilePath) => {
    const jobId = path.basename(filePath).split(".")[0];//5aab0e21-ef55-46a7-bfca-26354d058178
    const output_filename = `${jobId}.exe`;//5aab0e21-ef55-46a7-bfca-26354d058178.exe
    const outPath = path.join(outputPath, output_filename);//C:\Users\Sumit\Desktop\onlinecompiler\backend\outputs\5aab0e21-ef55-46a7-bfca-26354d058178.exe

    return new Promise((resolve, reject) => {
        exec(`g++ "${filePath}" -o "${outPath}" && "${outPath}" < "${inputFilePath}"`
            ,
            
             (error, stdout, stderr) => {
                if (error) {
                    return reject({ error: error.message, stderr });
                }
                
                // Allow warnings in stderr but still resolve output
                resolve(stdout);
        });

       
    });
}

export default executeCpp;
//functionality
//code.cpp->(after compiling)->code.exe(windows)->output




