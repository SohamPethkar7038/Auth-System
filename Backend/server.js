import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';

import connectDB from './config/database.js';


const app=express();

const PORT=process.env.PORT || 5000;

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({Credentials:true}));


app.get('/', (req, res) => {
    res.send("started building backend");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});