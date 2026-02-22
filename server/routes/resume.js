// routes/resume.js
// Handles resume analysis via file upload.
// Supports PDF, DOCX, and TXT files.
// Extracts text, calls Gemini AI, and saves result data to Supabase.

const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const { extractSkills } = require('../services/geminiService');
const supabase = require('../services/supabaseClient');

// Configure Multer to store files in memory (RAM)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Helper function to extract text from buffer based on mimetype
async function extractTextFromFile(file) {
    const buffer = file.buffer;
    const mimeType = file.mimetype;

    console.log(`Processing file: ${file.originalname} (${mimeType})`);

    try {
        if (mimeType === 'application/pdf') {
            const data = await pdfParse(buffer);
            return data.text;
        } else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
            const result = await mammoth.extractRawText({ buffer: buffer });
            return result.value;
        } else if (mimeType === 'text/plain') {
            return buffer.toString('utf-8');
        } else {
            throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT.');
        }
    } catch (error) {
        console.error('Text extraction error:', error);
        throw new Error(`Failed to parse file content: ${error.message}`);
    }
}

const authMiddleware = require('../middleware/authMiddleware');

// Temporary GET test route
router.get('/test', (req, res) => {
    res.json({ message: 'Resume route working' });
});

// POST /api/resume/analyze
// Expects: "name" (text) and "resume" (file)
// Protected: Only authenticated users
router.post('/analyze', authMiddleware, upload.single('resume'), async (req, res) => {
    try {
        const { name } = req.body;
        const file = req.file;

        // 1. Validation
        if (!name || !file) {
            return res.status(400).json({
                success: false,
                error: 'Both "name" and "resume" file are required.',
            });
        }

        // 2. Extract text from the uploaded file
        const resumeText = await extractTextFromFile(file);

        if (!resumeText || resumeText.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Could not extract any text from the uploaded file.',
            });
        }

        // 3. Send text to Gemini to get skills
        const skills = await extractSkills(resumeText);

        // 4. Save to Supabase
        // We save the original filename and extracted text for reference
        const { data: insertedUser, error: insertError } = await supabase
            .from('users')
            .insert([
                {
                    name,
                    skills,
                    resume_text: resumeText, // Storing extracted text, not the binary file
                },
            ])
            .select()
            .single();

        if (insertError) throw insertError;

        // 5. Respond to client
        res.status(200).json({
            success: true,
            skills,
            userId: insertedUser.id,
        });
    } catch (error) {
        console.error('Analysis error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

module.exports = router;
