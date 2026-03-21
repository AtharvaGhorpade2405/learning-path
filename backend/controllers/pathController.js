import Groq from 'groq-sdk';
import LearningPath from '../models/LearningPath.js';
import { llmOutputSchema } from '../validators/pathSchemas.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// @desc    Generate a new learning path via AI
// @route   POST /api/paths/generate
export const generatePath = async (req, res) => {
  try {
    const { topic, level, days } = req.body;

    const systemPrompt = `You are an expert curriculum designer. Create a detailed, step-by-step learning roadmap.

The user wants to learn: "${topic}"
Their current level: "${level}"
Available timeframe: ${days} day(s)

Generate a structured learning path with an appropriate number of steps (between 5 and ${Math.min(days, 20)} steps, scaling with the timeframe).

Each step must have:
- "title": A concise, clear step title (e.g., "Master CSS Flexbox")
- "description": A 1-2 sentence description of what the learner will achieve in this step
- "resources": An array of 1-2 specific, real resource suggestions (e.g., article names, YouTube channel names, documentation pages — do NOT include URLs)

Return ONLY a valid JSON array of step objects. No markdown, no code blocks, no explanation — just the raw JSON array.

Example output format:
[
  {
    "title": "Learn HTML Basics",
    "description": "Understand the structure of HTML documents, common tags, and semantic markup.",
    "resources": ["MDN HTML Guide", "freeCodeCamp HTML Course"]
  }
]`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Generate a ${level}-level learning path for "${topic}" that can be completed in ${days} days. Return ONLY valid JSON.`,
        },
      ],
      model: 'gpt-oss-20b',
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    });

    const rawContent = chatCompletion.choices[0]?.message?.content;
    if (!rawContent) {
      return res.status(502).json({ message: 'No response from AI model' });
    }

    // Parse the JSON response
    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      return res.status(502).json({ message: 'AI returned invalid JSON' });
    }

    // The LLM might wrap the array in an object like { steps: [...] } or { roadmap: [...] }
    let stepsArray = parsed;
    if (!Array.isArray(parsed)) {
      // Try to extract an array from the first key
      const firstKey = Object.keys(parsed)[0];
      if (firstKey && Array.isArray(parsed[firstKey])) {
        stepsArray = parsed[firstKey];
      } else {
        return res.status(502).json({ message: 'AI response is not in the expected format' });
      }
    }

    // Validate with Zod
    const validation = llmOutputSchema.safeParse(stepsArray);
    if (!validation.success) {
      console.error('LLM output validation failed:', validation.error.errors);
      return res.status(502).json({
        message: 'AI output failed validation',
        errors: validation.error.errors,
      });
    }

    // Save to database
    const learningPath = await LearningPath.create({
      user: req.user._id,
      topic,
      level,
      days,
      steps: validation.data.map((step) => ({
        title: step.title,
        description: step.description,
        resources: step.resources,
        completed: false,
      })),
    });

    res.status(201).json(learningPath);
  } catch (error) {
    console.error('Generate path error:', error);
    if (error.status === 401 || error.code === 'authentication_error') {
      return res.status(502).json({ message: 'Invalid Groq API key' });
    }
    res.status(500).json({ message: 'Failed to generate learning path' });
  }
};

// @desc    Get all learning paths for logged-in user
// @route   GET /api/paths
export const getUserPaths = async (req, res) => {
  try {
    const paths = await LearningPath.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(paths);
  } catch (error) {
    console.error('Get paths error:', error);
    res.status(500).json({ message: 'Failed to fetch learning paths' });
  }
};

// @desc    Get a single learning path by ID
// @route   GET /api/paths/:id
export const getPathById = async (req, res) => {
  try {
    const path = await LearningPath.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!path) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    res.json(path);
  } catch (error) {
    console.error('Get path error:', error);
    res.status(500).json({ message: 'Failed to fetch learning path' });
  }
};

// @desc    Toggle step completion
// @route   PATCH /api/paths/:id/steps/:stepIndex
export const toggleStepComplete = async (req, res) => {
  try {
    const { id, stepIndex } = req.params;
    const idx = parseInt(stepIndex, 10);

    const path = await LearningPath.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!path) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    if (idx < 0 || idx >= path.steps.length) {
      return res.status(400).json({ message: 'Invalid step index' });
    }

    path.steps[idx].completed = !path.steps[idx].completed;
    await path.save();

    res.json(path);
  } catch (error) {
    console.error('Toggle step error:', error);
    res.status(500).json({ message: 'Failed to update step' });
  }
};

// @desc    Delete a learning path
// @route   DELETE /api/paths/:id
export const deletePath = async (req, res) => {
  try {
    const path = await LearningPath.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!path) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    res.json({ message: 'Learning path deleted' });
  } catch (error) {
    console.error('Delete path error:', error);
    res.status(500).json({ message: 'Failed to delete learning path' });
  }
};
