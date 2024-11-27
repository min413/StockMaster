// server.js

'use strict'
import routes from "./routes/index.js";
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import axios from 'axios'

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api', routes);

app.get('/', (req, res) => {
    console.log("back-end initialized")
    res.send('back-end initialized')
  });

app.post('/get-stock-data', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:5600/get-stock-data', req.body);
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/get-news-titles', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5600/get-news-titles');
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/get-historical-data/:symbol', async (req, res) => {
    try {
        const response = await axios.get(`http://localhost:5600/get-historical-data/${req.params.symbol}`);
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/get-stock-news', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:5600/get-stock-news', req.body);
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/get-stock-risk', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:5600/get-stock-risk', req.body);
        res.json(response.data);
    } catch (error) {
        console.error("Error in /get-stock-risk endpoint:", error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/predict-risk', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:5600/predict-risk', req.body);
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/visualize-risk', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:5600/visualize-risk', req.body);
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/cluster-risk', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:5600/cluster-risk', req.body);
        res.json(response.data);
    } catch (error) {
        console.error("Error in /cluster-risk endpoint:", error.message);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
