import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const  aiCodeReview=async(code)=> {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `
    Review the following code and provide a detailed explanation of the code.
    Code: ${code}
    `,
  });
  const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "No review generated.";
  
  return text;

}

export default aiCodeReview;