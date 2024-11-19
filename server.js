const express = require('express');
const bodyParser = require('body-parser');
const xlsx = require('xlsx');
const path = require('path');

const app = express();

// Path to the Excel file
const EXCEL_FILE = path.join(__dirname, 'questions_answers.xlsx');

// Load the Excel file
let data = [];
try {
    const workbook = xlsx.readFile(EXCEL_FILE);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    data = sheetData.map((row) => ({
        question: row.Question ? row.Question.toLowerCase().trim() : '',
        answer: row.Answer || '',
    }));
} catch (error) {
    console.error(`Error loading Excel file: ${error.message}`);
    process.exit(1);
}

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'static'))); // For serving static files like index.html

// Serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Endpoint to get the answer
app.get('/api/get-answer', (req, res) => {
    const userQuestion = (req.query.question || '').toLowerCase().trim();

    if (!userQuestion) {
        return res.status(400).json({ error: 'No question provided' });
    }

    // Find the answer
    const result = data.find((entry) => entry.question === userQuestion);

    if (result) {
        res.json({ answer: result.answer });
    } else {
        res.json({ answer: "Sorry, I don't have an answer." });
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});