import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import DBConnection from './database/db.js'; // ✅ Correct path now
import Problem from './models/problem.js';    // Make sure this path is correct

dotenv.config();

const seedProblems = async () => {
  try {
    await DBConnection(); // uses your db.js logic

    const dataPath = path.join('./data/problem.json');
    const data = fs.readFileSync(dataPath, 'utf-8');
    const problems = JSON.parse(data);

    // Optional: Clean the collection before inserting
    await Problem.deleteMany({});
    await Problem.insertMany(problems);

    console.log(`${problems.length} problems added successfully.`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedProblems();
