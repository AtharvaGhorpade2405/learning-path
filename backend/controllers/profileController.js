const Groq = require('groq-sdk');
const User = require('../models/User');
const LearningPath = require('../models/LearningPath');
const { nsqfAnalysisOutputSchema } = require('../validators/profileSchemas');

let _groq;
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// @desc    Analyze user background and calculate NSQF score
// @route   POST /api/profile/analyze
const analyzeProfile = async (req, res) => {
  try {
    const { backgroundText } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Rate-limit: once per day
    if (user.careerProfile?.lastAnalyzedAt) {
      const elapsed = Date.now() - new Date(user.careerProfile.lastAnalyzedAt).getTime();
      if (elapsed < ONE_DAY_MS) {
        const hoursLeft = Math.ceil((ONE_DAY_MS - elapsed) / (60 * 60 * 1000));
        return res.status(429).json({
          message: `You can re-analyze your profile in ${hoursLeft} hour(s). Limit: once per day.`,
        });
      }
    }

    const systemPrompt = `You are an expert in the National Skills Qualifications Framework (NSQF). Analyze the user's provided resume/background text. Extract their key experiences and assign them a realistic 'Base NSQF Score' from 1 to 10 based on their overall professional and educational maturity.

NSQF Level Guidelines:
- Level 1-2: School education, basic skills, no professional experience
- Level 3-4: Diploma/certificate holders, basic vocational training, entry-level work experience
- Level 5-6: Undergraduate degree, 1-3 years of work experience, intermediate skills
- Level 7-8: Postgraduate degree or 4-7 years of experience, advanced skills, some specialization
- Level 9-10: PhD/extensive research, 8+ years of experience, expert-level domain mastery

Return a JSON object with these exact fields:
- "parsedExperience": An array of strings, each being a key experience or qualification (e.g., "B.Tech in Computer Science", "2 years as Frontend Developer")
- "estimatedBaseNsqf": An integer from 1 to 10
- "justification": A short paragraph explaining why you assigned this level`;

    const chatCompletion = await getGroq().chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Analyze this background and determine my NSQF level:\n\n${backgroundText}`,
        },
      ],
      model: 'groq/compound',
      response_format: { type: 'json_object' },
    });

    const rawContent = chatCompletion.choices[0]?.message?.content;
    if (!rawContent) {
      return res.status(502).json({ message: 'No response from AI model' });
    }

    // Clean up the raw content — groq/compound may return markdown-wrapped JSON
    let cleanContent = rawContent.trim();

    // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
    const fenceMatch = cleanContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (fenceMatch) {
      cleanContent = fenceMatch[1].trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(cleanContent);
    } catch {
      // Last resort: try to find a JSON object in the content
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          console.error('Failed to parse NSQF JSON even after extraction:', cleanContent);
          return res.status(502).json({ message: 'AI returned invalid JSON' });
        }
      } else {
        console.error('No JSON object found in NSQF response:', cleanContent);
        return res.status(502).json({ message: 'AI returned invalid JSON' });
      }
    }

    // Handle object wrapping — sometimes the AI wraps the result in a key
    // e.g. { "result": { parsedExperience: [...], ... } }
    if (!parsed.parsedExperience && !parsed.estimatedBaseNsqf) {
      const firstKey = Object.keys(parsed)[0];
      if (firstKey && typeof parsed[firstKey] === 'object' && parsed[firstKey].parsedExperience) {
        parsed = parsed[firstKey];
      }
    }

    // Validate with Zod
    const validation = nsqfAnalysisOutputSchema.safeParse(parsed);
    if (!validation.success) {
      console.error('NSQF analysis validation failed:', validation.error.errors);
      console.error('Parsed object was:', JSON.stringify(parsed, null, 2));
      return res.status(502).json({
        message: 'AI output failed validation',
        errors: validation.error.errors,
      });
    }

    const { parsedExperience, estimatedBaseNsqf, justification } = validation.data;

    // Save to user profile
    user.careerProfile = {
      rawBackgroundText: backgroundText,
      parsedExperience,
      baseNsqfScore: estimatedBaseNsqf,
      nsqfJustification: justification,
      lastAnalyzedAt: new Date(),
    };
    await user.save();

    res.json({
      parsedExperience,
      baseNsqfScore: estimatedBaseNsqf,
      justification,
      lastAnalyzedAt: user.careerProfile.lastAnalyzedAt,
    });
  } catch (error) {
    console.error('Profile analysis error:', error);
    if (error.status === 401 || error.code === 'authentication_error') {
      return res.status(502).json({ message: 'Invalid Groq API key' });
    }
    res.status(500).json({ message: 'Failed to analyze profile' });
  }
};

// @desc    Get career profile for the logged-in user
// @route   GET /api/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('careerProfile');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Also fetch the user's skill-level NSQF scores from their learning paths
    const paths = await LearningPath.find({ user: req.user._id }).select(
      'topic skillNsqfLevel startingNsqfLevel targetNsqfLevel'
    );

    res.json({
      careerProfile: user.careerProfile || {},
      skillLevels: paths
        .filter((p) => p.skillNsqfLevel != null)
        .map((p) => ({
          topic: p.topic,
          level: p.skillNsqfLevel,
          startingLevel: p.startingNsqfLevel,
          targetLevel: p.targetNsqfLevel,
        })),
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

// @desc    Recalculate NSQF levels based on completed roadmaps (manual trigger)
// @route   POST /api/profile/recalculate
const recalculateNsqf = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find all completed learning paths for this user
    const paths = await LearningPath.find({ user: req.user._id });

    let updatedCount = 0;
    for (const path of paths) {
      const isComplete =
        path.roadmap.length > 0 &&
        path.roadmap.every((d) => d.lessons.length > 0 && d.lessons.every((l) => l.completed));

      if (isComplete && path.targetNsqfLevel) {
        // If the path is 100% complete, set skillNsqfLevel to the target
        if (path.skillNsqfLevel !== path.targetNsqfLevel) {
          path.skillNsqfLevel = path.targetNsqfLevel;
          await path.save();
          updatedCount++;
        }
      }
    }

    // Recalculate baseNsqfScore as the average of all skill NSQF levels
    const pathsWithLevels = await LearningPath.find({
      user: req.user._id,
      skillNsqfLevel: { $ne: null },
    });

    if (pathsWithLevels.length > 0) {
      const avgLevel = Math.round(
        pathsWithLevels.reduce((sum, p) => sum + p.skillNsqfLevel, 0) / pathsWithLevels.length
      );
      const newBase = Math.max(user.careerProfile?.baseNsqfScore || 1, avgLevel);
      user.careerProfile.baseNsqfScore = Math.min(newBase, 10);
      await user.save();
    }

    res.json({
      message: `Recalculated NSQF levels. ${updatedCount} skill(s) leveled up.`,
      baseNsqfScore: user.careerProfile.baseNsqfScore,
    });
  } catch (error) {
    console.error('Recalculate NSQF error:', error);
    res.status(500).json({ message: 'Failed to recalculate NSQF levels' });
  }
};

module.exports = { analyzeProfile, getProfile, recalculateNsqf };
