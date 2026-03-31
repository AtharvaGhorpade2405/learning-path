const Groq = require('groq-sdk');
const LearningPath = require('../models/LearningPath');
const User = require('../models/User');
const { llmOutputSchema } = require('../validators/pathSchemas');

let _groq;
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
}

// @desc    Generate a new learning path via AI
// @route   POST /api/paths/generate
const generatePath = async (req, res) => {
  try {
    const { topic, currentKnowledge, days } = req.body;

    // Fetch user's NSQF career profile
    const user = await User.findById(req.user._id);
    const baseNsqf = user?.careerProfile?.baseNsqfScore;
    const parsedExperience = user?.careerProfile?.parsedExperience || [];

    // Build NSQF context block if user has a profile
    let nsqfContext = '';
    if (baseNsqf) {
      nsqfContext = `
NSQF CONTEXT:
The user has a general background at NSQF Level ${baseNsqf}.
Their key experiences: ${parsedExperience.length > 0 ? parsedExperience.join(', ') : 'Not specified'}.
The user explicitly stated they know: "${currentKnowledge}".

First, determine their *Current NSQF Level* specifically for the topic "${topic}" they want to learn. Then, generate a roadmap strictly designed to elevate them from their current level to the *Next* NSQF level for this topic. Each "Day" in the roadmap must align with standard NSQF competency requirements (e.g., knowledge, skills, aptitude).

In your response, include two top-level fields:
- "startingNsqfLevel": The user's current NSQF level for this specific topic (integer, 1-10)
- "targetNsqfLevel": The NSQF level they will reach after completing this roadmap (integer, 1-10)
- "roadmap": The array of Day objects
`;
    }

    const systemPrompt = `You are an expert curriculum designer. Create a detailed, step-by-step learning roadmap grouped by days.

The user wants to learn: "${topic}"
Their current knowledge context: "${currentKnowledge}"
Available timeframe: ${days} day(s)
${nsqfContext}
Carefully read their current knowledge context. Adapt the roadmap STRICTLY based on what they already know (skip basics if they already know them, or start from scratch if they are a complete beginner).

Generate a structured learning path spanning exactly ${days} day(s). The response must be a JSON object with:
${baseNsqf ? '- "startingNsqfLevel": integer (1-10) — the user\'s current NSQF level for this topic\n- "targetNsqfLevel": integer (1-10) — the target NSQF level after completing this roadmap\n' : ''}- "roadmap": an array of Day objects

Each Day object must have:
- "day": The day number (integer, starting from 1)
- "title": A short, descriptive title for the Day summarizing what it teaches (e.g., "Introduction to HTML & the DOM")
- "lessons": An array of lesson objects

Each lesson object must have:
- "title": A concise, clear lesson title
- "description": A 1-2 sentence explanation of what the learner will achieve
- "resources": An array of 1-3 specific, highly relevant resource objects.

Each resource object MUST HAVE:
- "title": The name of the resource
- "url": A REAL, valid URL to the resource (e.g., https://developer.mozilla.org...). Suggest free resources only and make sure that the URLs you provide are valid and do not return a 404 error. Use the web search tool for this task.

Return ONLY a valid JSON object. No markdown, no explanation

Example output format:
{
  ${baseNsqf ? '"startingNsqfLevel": 3,\n  "targetNsqfLevel": 4,\n  ' : ''}"roadmap": [
    {
      "day": 1,
      "title": "Introduction to HTML Basics",
      "lessons": [
        {
          "title": "Learn HTML Basics",
          "description": "Understand the structure of HTML documents.",
          "resources": [
            { "title": "MDN HTML Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/HTML" }
          ]
        }
      ]
    }
  ]
}`;

    const chatCompletion = await getGroq().chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Generate a custom learning path for "${topic}" based on this context: "${currentKnowledge}". It must span exactly ${days} days. Return ONLY valid JSON.`,
        },
      ],
      model: 'groq/compound',
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

    // Extract NSQF levels if present
    let startingNsqfLevel = parsed.startingNsqfLevel || null;
    let targetNsqfLevel = parsed.targetNsqfLevel || null;

    // Extract the roadmap array from the response
    let stepsArray;
    if (Array.isArray(parsed)) {
      stepsArray = parsed;
    } else if (parsed.roadmap && Array.isArray(parsed.roadmap)) {
      stepsArray = parsed.roadmap;
    } else {
      // Try to extract an array from the first key that is an array
      const firstKey = Object.keys(parsed).find((k) => Array.isArray(parsed[k]));
      if (firstKey) {
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
      currentKnowledge,
      days,
      startingNsqfLevel,
      targetNsqfLevel,
      skillNsqfLevel: startingNsqfLevel, // Initialize at starting level
      roadmap: validation.data.map((dayObj) => ({
        day: dayObj.day,
        title: dayObj.title,
        lessons: dayObj.lessons.map((lesson) => ({
          title: lesson.title,
          description: lesson.description,
          resources: lesson.resources,
          completed: false,
        })),
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
const getUserPaths = async (req, res) => {
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
const getPathById = async (req, res) => {
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

// @desc    Toggle lesson completion
// @route   PATCH /api/paths/:id/days/:dayIndex/lessons/:lessonIndex
const toggleLessonComplete = async (req, res) => {
  try {
    const { id, dayIndex, lessonIndex } = req.params;
    const dIdx = parseInt(dayIndex, 10);
    const lIdx = parseInt(lessonIndex, 10);

    const path = await LearningPath.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!path) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    if (dIdx < 0 || dIdx >= path.roadmap.length) {
      return res.status(400).json({ message: 'Invalid day index' });
    }

    const targetDay = path.roadmap[dIdx];

    if (lIdx < 0 || lIdx >= targetDay.lessons.length) {
      return res.status(400).json({ message: 'Invalid lesson index' });
    }

    targetDay.lessons[lIdx].completed = !targetDay.lessons[lIdx].completed;
    await path.save();

    res.json(path);
  } catch (error) {
    console.error('Toggle lesson error:', error);
    res.status(500).json({ message: 'Failed to update lesson' });
  }
};

// @desc    Delete a learning path
// @route   DELETE /api/paths/:id
const deletePath = async (req, res) => {
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

module.exports = { generatePath, getUserPaths, getPathById, toggleLessonComplete, deletePath };
