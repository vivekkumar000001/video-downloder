const express = require('express');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const app = express();
const port = 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/download', async (req, res) => {
    try {
        const { videoUrl } = req.body;
        
        if (!videoUrl) {
            return res.status(400).json({ error: 'Video URL is required' });
        }

        // Generate a unique filename
        const filename = `video_${Date.now()}.mp4`;
        const filePath = path.join(__dirname, 'downloads', filename);

        // Ensure downloads directory exists
        if (!fs.existsSync('downloads')) {
            fs.mkdirSync('downloads');
        }

        // Download the video
        const response = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        writer.on('finish', () => {
            res.json({
                success: true,
                message: 'Video downloaded successfully',
                downloadUrl: `/downloads/${filename}`
            });
        });

        writer.on('error', (err) => {
            throw err;
        });

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ 
            error: 'Failed to download video',
            details: error.message
        });
    }
});

app.get('/downloads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'downloads', filename);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(500).send('Error downloading file');
            }
            
            // Optionally delete the file after download
            // fs.unlinkSync(filePath);
        });
    } else {
        res.status(404).send('File not found');
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});