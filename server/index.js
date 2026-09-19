import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Proxy endpoint for Argovis API
app.get('/api/argovis/argo', async (req, res) => {
    try {
        const { polygon, startDate, endDate, data } = req.query;
        if (!polygon) {
            return res.status(400).json({ error: 'Missing polygon parameter' });
        }
        
        let url = `https://argovis-api.colorado.edu/argo?polygon=${encodeURIComponent(polygon)}`;
        if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
        if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
        if (data) url += `&data=${encodeURIComponent(data)}`;

        const headers = {};
        if (process.env.ARGOVIS_API_KEY) {
            headers['x-argokey'] = process.env.ARGOVIS_API_KEY;
        }

        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            const errBody = await response.text();
            console.error(`Argovis API Error: ${response.status} ${errBody}`);
            return res.status(response.status).json({ error: `Argovis API returned ${response.status}`, details: errBody });
        }
        
        const responseData = await response.json();
        res.json(responseData);
    } catch (error) {
        console.error("Backend Proxy Error:", error);
        res.status(500).json({ error: 'Internal Server Error interfacing with Argovis API' });
    }
});

app.listen(PORT, () => {
    console.log(`FloatChat Secure Backend Proxy running on port ${PORT}`);
    if (!process.env.ARGOVIS_API_KEY) {
        console.warn("WARNING: ARGOVIS_API_KEY is not set. Argovis requests may fail due to usage limits.");
    }
});
