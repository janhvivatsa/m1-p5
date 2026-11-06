/**
 * Express Server for Hallucination-Aware Information Assistant
 * 
 * Serves the frontend static files and provides API endpoints for:
 * - /api/health (System status check)
 * - /api/ask (Two-stage DeepSeek AI generation and claim verification)
 * - /api/reanalyze (Re-evaluating claims when additional reference context is provided)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const deepseekService = require('./deepseek');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve frontend static assets from public/
app.use(express.static(path.join(__dirname, '../public')));

/**
 * GET /api/health
 * Health check & configuration status
 */
app.get('/api/health', (req, res) => {
  const isKeyConfigured = deepseekService.hasValidApiKey();
  res.json({
    status: 'ok',
    service: 'Hallucination-Aware Information Assistant API',
    model: deepseekService.model,
    deepseekConfigured: isKeyConfigured,
    mode: isKeyConfigured ? 'Live DeepSeek AI' : 'Demonstration Evaluation Engine',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/ask
 * Processes a question with optional context and response type.
 * Executes Stage 1 (Generation) and Stage 2 (Hallucination Audit).
 */
app.post('/api/ask', async (req, res) => {
  try {
    const { question, context, responseType } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({
        error: 'Question is required and must be a non-empty string.'
      });
    }

    const trimmedQuestion = question.trim();
    const trimmedContext = context && typeof context === 'string' ? context.trim() : '';
    const selectedType = responseType || 'General Knowledge';

    console.log(`[Ask API] Processing query: "${trimmedQuestion.slice(0, 60)}..." (Type: ${selectedType})`);

    const result = await deepseekService.processQuestion(
      trimmedQuestion,
      trimmedContext,
      selectedType
    );

    return res.json(result);
  } catch (error) {
    console.error('[Ask API Error]:', error.message);
    return res.status(500).json({
      error: error.message || 'An unexpected error occurred during AI processing.',
      details: error.response?.data || null
    });
  }
});

/**
 * POST /api/reanalyze
 * Re-analyzes an existing answer against newly supplied user reference context.
 */
app.post('/api/reanalyze', async (req, res) => {
  try {
    const { question, answer, additionalContext } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        error: 'Both question and answer are required for reanalysis.'
      });
    }

    if (!additionalContext || additionalContext.trim().length === 0) {
      return res.status(400).json({
        error: 'Please provide supporting reference text or context for reanalysis.'
      });
    }

    console.log(`[Reanalyze API] Re-auditing question: "${question.slice(0, 60)}..."`);

    const result = await deepseekService.reanalyzeWithContext(
      question.trim(),
      answer.trim(),
      additionalContext.trim()
    );

    return res.json(result);
  } catch (error) {
    console.error('[Reanalyze API Error]:', error.message);
    return res.status(500).json({
      error: error.message || 'Failed to reanalyze answer.',
      details: error.response?.data || null
    });
  }
});

// Fallback route for Single Page Application navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Hallucination-Aware Information Assistant (M1-P5)`);
  console.log(` Server active on: http://localhost:${PORT}`);
  console.log(` DeepSeek API Key Configured: ${deepseekService.hasValidApiKey() ? 'YES (Live DeepSeek)' : 'NO (Demo Evaluation Mode)'}`);
  console.log(`====================================================`);
});
