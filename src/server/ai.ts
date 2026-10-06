import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

export interface StudentContext {
  studentName?: string;
  educationLevel?: string;
  stream?: string;
  subject?: string;
  topic?: string;
  mastery?: number;
  weakTopics?: string[];
  recentMistakes?: string[];
}

export interface TutorResponse {
  reply: string;
  followUpSuggestions: string[];
  recommendedAction?: {
    type: 'practice' | 'video' | 'assessment';
    title: string;
    url: string;
  };
  source: 'gemini' | 'rule_fallback';
}

export async function askAITutor(
  userMessage: string,
  context: StudentContext,
  mode: 'chat' | 'explain' | 'hint' | 'example' | 'practice' | 'formula' = 'chat'
): Promise<TutorResponse> {
  const ai = getGeminiClient();

  const masteryLevel = context.mastery !== undefined ? context.mastery : 60;
  let pedagogicalTone = 'balanced and encouraging with guided examples';
  if (masteryLevel < 50) {
    pedagogicalTone = 'gentle, foundational, breaking concepts into micro-steps without jargon';
  } else if (masteryLevel >= 80) {
    pedagogicalTone = 'rigorous, inquisitive, challenging with high-level conceptual nuances and optimization';
  }

  const systemInstruction = `You are the AI Tutor inside the "AI-Powered Adaptive Smart Learning Station".
Your goal is to provide personalized, step-by-step educational coaching.
STUDENT CONTEXT:
- Name: ${context.studentName || 'Student'}
- Grade/Level: ${context.educationLevel || 'High School'}
- Subject: ${context.subject || 'General STEM'}
- Current Topic: ${context.topic || 'General Concepts'}
- Student Topic Mastery: ${masteryLevel}%
- Known Weak Areas: ${(context.weakTopics || []).join(', ') || 'None specified'}
- Recent Errors: ${(context.recentMistakes || []).join('; ') || 'None'}
- Mode Requested: ${mode}
- Pedagogical Tone: ${pedagogicalTone}

GUIDELINES:
1. Always tailor your explanation depth directly to the student's mastery level (${masteryLevel}%).
2. If mastery is low (<50%), start from intuitive real-world analogies, define every symbol clearly, and avoid assuming prior theorems.
3. If mastery is high (>=80%), provide deeper mathematical/scientific proofs and ask a provocative checking question.
4. Format math formulas cleanly (e.g. LaTeX notation like $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$ or plain text equivalent).
5. Conclude your answer with 2 or 3 brief follow-up prompt ideas for the student.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Student message: "${userMessage}". Please guide the student.`,
        config: {
          systemInstruction,
          temperature: 0.6,
        },
      });

      const text = response.text || '';
      if (text.trim()) {
        const followUps = generateSmartFollowUps(context.topic || context.subject || 'this concept', mode);
        return {
          reply: text,
          followUpSuggestions: followUps,
          recommendedAction: getRecommendedActionForContext(context),
          source: 'gemini',
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed, using intelligent rule-based educational fallback:', err);
    }
  }

  // Graceful rule-based educational fallback
  return getEducationalFallbackResponse(userMessage, context, mode);
}

function generateSmartFollowUps(topic: string, mode: string): string[] {
  if (mode === 'formula') {
    return [
      `Show real-world engineering application of ${topic}`,
      `What are the units and dimensions of each variable?`,
      `Give me a practice problem using this formula`,
    ];
  }
  return [
    `Can you give me an intuitive example of ${topic}?`,
    `Walk me through a step-by-step practice problem`,
    `How does this connect to what we learned earlier?`,
  ];
}

function getRecommendedActionForContext(context: StudentContext) {
  if ((context.mastery || 60) < 50) {
    return {
      type: 'video' as const,
      title: `Watch Visual Concept Video on ${context.topic || 'Fundamentals'}`,
      url: '/videos',
    };
  }
  return {
    type: 'practice' as const,
    title: `Try Adaptive Practice Quiz (${context.topic || 'Concept Check'})`,
    url: '/assessments',
  };
}

function getEducationalFallbackResponse(
  userMessage: string,
  context: StudentContext,
  mode: string
): TutorResponse {
  const topic = context.topic || 'Mathematics & Science';
  const mastery = context.mastery || 50;
  const lowerMsg = userMessage.toLowerCase();

  let explanation = '';

  if (lowerMsg.includes('quadratic') || topic.includes('Algebra') || topic.includes('Quadratic')) {
    explanation = `### Quadratic Equations: Step-by-Step Breakdown 📐

A quadratic equation is any second-degree polynomial equation of standard form:
$$ax^2 + bx + c = 0$$ (where $a \\neq 0$).

#### 1. Intuitive Foundation
The degree 2 indicates that the curve graphs as a **parabola**. The points where the parabola crosses the x-axis are called the **roots** or **zeros**.

#### 2. The Universal Quadratic Formula
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

#### 3. The Discriminant ($\\Delta = b^2 - 4ac$)
- If $\\Delta > 0$: 2 distinct real roots.
- If $\\Delta = 0$: Exactly 1 real repeated root (vertex touches the axis).
- If $\\Delta < 0$: 2 complex conjugate roots.

#### 4. Worked Example: $x^2 - 5x + 6 = 0$
- Here, $a=1, b=-5, c=6$.
- By factoring: $(x-2)(x-3) = 0 \\implies x=2$ or $x=3$.
- By formula: $x = \\frac{5 \\pm \\sqrt{25 - 24}}{2} = \\frac{5 \\pm 1}{2} \\implies x = 3$ or $x = 2$.

${mastery < 50 ? '💡 **Tip for your level:** Focus first on identifying $a, b,$ and $c$ with their correct signs before calculating $b^2 - 4ac$.' : '🚀 **Mastery extension:** Try deriving vertex form $y = a(x-h)^2 + k$ by completing the square.'}`;
  } else if (lowerMsg.includes('trig') || topic.includes('Trigonometry')) {
    explanation = `### Trigonometric Foundations & Identities 📏

Trigonometry explores the relationships between angles and lengths in triangles and circular motion.

#### 1. Right Triangle Ratios (SOH CAH TOA)
- $\\sin(\\theta) = \\frac{\\text{Opposite}}{\\text{Hypotenuse}}$
- $\\cos(\\theta) = \\frac{\\text{Adjacent}}{\\text{Hypotenuse}}$
- $\\tan(\\theta) = \\frac{\\text{Opposite}}{\\text{Adjacent}} = \\frac{\\sin(\\theta)}{\\cos(\\theta)}$

#### 2. The Core Pythagorean Identity
$$\\sin^2(\\theta) + \\cos^2(\\theta) = 1$$
*Proof:* From Pythagoras in a unit circle where $x = \\cos(\\theta)$ and $y = \\sin(\\theta)$, $x^2 + y^2 = 1^2$.

#### 3. Key Strategy
Always look to convert terms involving $\\tan, \\cot, \\sec, \\csc$ into basic $\\sin$ and $\\cos$ components when simplifying equations!`;
  } else if (lowerMsg.includes('motion') || lowerMsg.includes('newton') || topic.includes('Physics') || topic.includes('Kinematics')) {
    explanation = `### Newton's Laws and Classical Kinematics ⚡

#### 1. First Law (Law of Inertia)
An object remains at rest or in uniform linear motion unless acted upon by a non-zero net external force ($\sum F = 0 \\implies a = 0$).

#### 2. Second Law (Fundamental Dynamics)
$$F_{\\text{net}} = m \\cdot a$$
Acceleration is directly proportional to net force and inversely proportional to inertial mass.

#### 3. Kinematic Equations for Constant Acceleration
1. $v = u + at$
2. $s = ut + \\frac{1}{2}at^2$
3. $v^2 = u^2 + 2as$`;
  } else {
    explanation = `### Concept Analysis: ${topic} 🎯

Hello ${context.studentName || 'Student'}! Let's examine **${topic}** step-by-step.

1. **Fundamental Definition**:
   In ${context.subject || 'STEM'}, this concept allows us to quantify system behavior and predict outcomes systematically.

2. **Core Principles**:
   - Establish the known parameters and target variable.
   - Decompose multi-step problems into smaller, verifiable chunks.
   - Cross-check dimensions and units at each transformation.

3. **Targeted Guidance for Your Mastery Level (${mastery}%)**:
   ${mastery < 60 ? 'Take time to work through fundamental definitions before attempting high-speed problem solving. Use visual representations wherever possible.' : 'You have a solid grasp! Push yourself with edge cases and multi-concept synthesis.'}`;
  }

  return {
    reply: explanation,
    followUpSuggestions: [
      `Give me a practice question on ${topic}`,
      `Explain the formula step-by-step`,
      `Show a common mistake students make in ${topic}`,
    ],
    recommendedAction: getRecommendedActionForContext(context),
    source: 'rule_fallback',
  };
}
