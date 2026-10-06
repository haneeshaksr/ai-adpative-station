import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {
  loadDatabase,
  saveDatabase,
  resetDatabaseToSeed,
  User,
  Question,
  KnowledgeNode,
} from './db';
import { askAITutor } from './ai';
import { processAssessmentSubmission } from './adaptive';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'smart-station-super-secure-jwt-key-2026';

// Middleware to verify JWT and attach user
export interface AuthRequest extends Request {
  user?: User;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const db = loadDatabase();
    const user = db.users.find((u) => u._id === decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found or session invalid' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Optional auth middleware for routes that can work for guest or authenticated
export function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const db = loadDatabase();
      const user = db.users.find((u) => u._id === decoded.userId);
      if (user) {
        req.user = user;
      }
    } catch (e) {
      // ignore
    }
  }
  next();
}

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

router.post('/auth/register', (req: Request, res: Response) => {
  const {
    name,
    email,
    phone,
    password,
    role,
    educationLevel,
    stream,
    institution,
    preferredLanguage,
    studentLinkingCode,
    subjectsTaught,
  } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password and role are required' });
  }

  const db = loadDatabase();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser: User = {
    _id: `usr_${role}_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    phone: phone || '',
    passwordHash,
    role: role as any,
    institution: institution || 'Apex STEM Academy',
    educationLevel: educationLevel || 'Grade 10 / High School',
    stream: stream || 'Science & Mathematics',
    preferredLanguage: preferredLanguage || 'English',
    studentLinkingCode: role === 'student' ? `STU-${name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
    linkedStudentIds: [],
    subjectsTaught: subjectsTaught || (role === 'teacher' ? ['Mathematics', 'Physics'] : []),
    streak: 1,
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  // If parent provided a studentLinkingCode on register, link immediately
  if (role === 'parent' && studentLinkingCode) {
    const student = db.users.find((u) => u.studentLinkingCode === studentLinkingCode);
    if (student) {
      newUser.linkedStudentIds = [student._id];
    }
  }

  db.users.push(newUser);

  // If student, seed initial knowledge profile
  if (role === 'student') {
    db.knowledgeProfiles[newUser._id] = [
      {
        topic: 'Algebra',
        subject: 'Mathematics',
        mastery: 50,
        status: 'NEEDS PRACTICE',
        assessmentsTaken: 0,
        lastAssessed: new Date().toISOString(),
        history: [{ date: new Date().toISOString().split('T')[0], mastery: 50 }],
      },
      {
        topic: 'Trigonometry',
        subject: 'Mathematics',
        mastery: 40,
        status: 'NEEDS ATTENTION',
        assessmentsTaken: 0,
        lastAssessed: new Date().toISOString(),
        history: [{ date: new Date().toISOString().split('T')[0], mastery: 40 }],
      },
      {
        topic: 'Kinematics',
        subject: 'Physics',
        mastery: 55,
        status: 'NEEDS PRACTICE',
        assessmentsTaken: 0,
        lastAssessed: new Date().toISOString(),
        history: [{ date: new Date().toISOString().split('T')[0], mastery: 55 }],
      },
    ];
  }

  saveDatabase(db);

  const token = jwt.sign({ userId: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
  const { passwordHash: _, ...safeUser } = newUser;

  return res.status(201).json({
    token,
    user: safeUser,
  });
});

router.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = loadDatabase();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Update streak / last active
  user.lastActive = new Date().toISOString();
  saveDatabase(db);

  const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { passwordHash: _, ...safeUser } = user;

  return res.json({
    token,
    user: safeUser,
  });
});

router.get('/auth/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const { passwordHash: _, ...safeUser } = req.user!;
  return res.json({ user: safeUser });
});

router.put('/auth/profile', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const user = db.users.find((u) => u._id === req.user!._id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { name, phone, educationLevel, stream, preferredLanguage, institution } = req.body;
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (educationLevel) user.educationLevel = educationLevel;
  if (stream) user.stream = stream;
  if (preferredLanguage) user.preferredLanguage = preferredLanguage;
  if (institution) user.institution = institution;

  saveDatabase(db);
  const { passwordHash: _, ...safeUser } = user;
  return res.json({ user: safeUser });
});

// ==========================================
// 2. STUDENT DASHBOARD & KNOWLEDGE PROFILE
// ==========================================

router.get('/students/dashboard', authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const db = loadDatabase();

  const profile = db.knowledgeProfiles[userId] || [];
  const attempts = db.assessmentAttempts.filter((a) => a.userId === userId);
  const recommendations = db.recommendations.filter((r) => r.userId === userId && !r.completed);

  // Calculate overall mastery
  const totalMastery = profile.length > 0 ? Math.round(profile.reduce((acc, curr) => acc + curr.mastery, 0) / profile.length) : 65;

  const masteredCount = profile.filter((p) => p.status === 'MASTERED').length;
  const weakCount = profile.filter((p) => p.status === 'NEEDS ATTENTION' || p.status === 'NEEDS PRACTICE').length;
  const weakTopics = profile.filter((p) => p.status === 'NEEDS ATTENTION' || p.status === 'NEEDS PRACTICE');

  // Total learning hours (simulated from assessments + sessions)
  const learningMinutes = attempts.reduce((acc, curr) => acc + (curr.timeTakenSeconds || 0), 0) / 60 + 120;
  const learningHours = (learningMinutes / 60).toFixed(1);

  // Recent assessment score
  const recentAttempt = attempts[0] || null;

  // Next recommended activity
  const nextActivity = recommendations[0] || {
    title: 'Adaptive Assessment: Quadratic Equations',
    type: 'practice',
    subject: 'Mathematics',
    topic: 'Algebra',
    reason: 'Build your foundational problem-solving speed',
  };

  // Learning activity chart data (last 7 days)
  const weeklyActivity = [
    { day: 'Mon', minutes: 45, assessments: 2 },
    { day: 'Tue', minutes: 60, assessments: 1 },
    { day: 'Wed', minutes: 30, assessments: 1 },
    { day: 'Thu', minutes: 80, assessments: 3 },
    { day: 'Fri', minutes: 55, assessments: 2 },
    { day: 'Sat', minutes: 90, assessments: 4 },
    { day: 'Sun', minutes: 40, assessments: 1 },
  ];

  return res.json({
    student: {
      name: req.user!.name,
      educationLevel: req.user!.educationLevel,
      stream: req.user!.stream,
      streak: req.user!.streak,
      linkingCode: req.user!.studentLinkingCode,
    },
    stats: {
      overallMastery: totalMastery,
      learningStreak: req.user!.streak,
      assessmentsCompleted: attempts.length,
      weakTopicsCount: weakCount,
      masteredTopicsCount: masteredCount,
      learningHours,
      recentScore: recentAttempt ? recentAttempt.score : 85,
    },
    nextActivity,
    knowledgeNodes: profile,
    weakTopics,
    recommendations: recommendations.slice(0, 5),
    recentAttempts: attempts.slice(0, 5),
    weeklyActivity,
  });
});

router.get('/knowledge-profile', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const profile = db.knowledgeProfiles[req.user!._id] || [];
  return res.json({ profile });
});

// ==========================================
// 3. SUBJECTS & TOPICS
// ==========================================

const SUBJECTS_DATA = [
  {
    id: 'math',
    name: 'Mathematics',
    icon: 'Calculator',
    color: '#00E5FF',
    chapters: [
      {
        name: 'Algebra',
        topics: ['Linear Equations', 'Quadratic Equations', 'Polynomials', 'Arithmetic Progressions'],
      },
      {
        name: 'Trigonometry',
        topics: ['Trigonometric Ratios', 'Trigonometric Identities', 'Heights and Distances'],
      },
      {
        name: 'Coordinate Geometry',
        topics: ['Distance Formula', 'Section Formula', 'Area of Triangles', 'Slope and Lines'],
      },
      {
        name: 'Statistics & Probability',
        topics: ['Mean, Median, Mode', 'Cumulative Frequency', 'Probability Laws'],
      },
    ],
  },
  {
    id: 'physics',
    name: 'Physics',
    icon: 'Zap',
    color: '#3B82F6',
    chapters: [
      {
        name: 'Kinematics',
        topics: ['Uniform Motion', 'Accelerated Motion', 'Vectors & Projectiles'],
      },
      {
        name: 'Laws of Motion',
        topics: ["Newton's First Law", "Newton's Second Law", 'Friction & Circular Dynamics'],
      },
      {
        name: 'Work, Energy & Power',
        topics: ['Kinetic & Potential Energy', 'Conservation of Energy', 'Power Calculations'],
      },
      {
        name: 'Optics',
        topics: ['Reflection & Mirrors', 'Refraction & Lenses', 'Wave Optics'],
      },
    ],
  },
  {
    id: 'chem',
    name: 'Chemistry',
    icon: 'FlaskConical',
    color: '#8B5CF6',
    chapters: [
      {
        name: 'Atomic Structure',
        topics: ['Bohr Model', 'Quantum Numbers', 'Electron Configuration'],
      },
      {
        name: 'Chemical Bonding',
        topics: ['Ionic vs Covalent', 'Lewis Structures', 'Molecular Polarity'],
      },
      {
        name: 'Periodic Table',
        topics: ['Periodic Trends', 'Ionization Energy', 'Electronegativity'],
      },
      {
        name: 'Chemical Reactions',
        topics: ['Balancing Equations', 'Stoichiometry', 'Acids, Bases & Salts'],
      },
    ],
  },
  {
    id: 'cs',
    name: 'Computer Science',
    icon: 'Cpu',
    color: '#10B981',
    chapters: [
      {
        name: 'Data Structures',
        topics: ['Arrays and Lists', 'Stacks and Queues', 'Trees and Graphs'],
      },
      {
        name: 'Algorithms',
        topics: ['Binary Search', 'Sorting Algorithms', 'Big-O Complexity'],
      },
      {
        name: 'Object-Oriented Programming',
        topics: ['Encapsulation & Abstraction', 'Inheritance & Polymorphism'],
      },
      {
        name: 'Databases & Web Systems',
        topics: ['Relational Schemas', 'Indexing & Queries', 'Client-Server Architecture'],
      },
    ],
  },
];

router.get('/subjects', (req: Request, res: Response) => {
  return res.json({ subjects: SUBJECTS_DATA });
});

// ==========================================
// 4. QUESTIONS BANK (CRUD for Teachers/Admin)
// ==========================================

router.get('/questions', (req: Request, res: Response) => {
  const { subject, chapter, topic, difficulty, search } = req.query;
  const db = loadDatabase();

  let filtered = db.questions;
  if (subject) filtered = filtered.filter((q) => q.subject.toLowerCase() === String(subject).toLowerCase());
  if (chapter) filtered = filtered.filter((q) => q.chapter.toLowerCase() === String(chapter).toLowerCase());
  if (topic) filtered = filtered.filter((q) => q.topic.toLowerCase().includes(String(topic).toLowerCase()));
  if (difficulty) filtered = filtered.filter((q) => q.difficulty === difficulty);
  if (search) {
    const s = String(search).toLowerCase();
    filtered = filtered.filter((q) => q.question.toLowerCase().includes(s) || q.topic.toLowerCase().includes(s));
  }

  return res.json({ questions: filtered, total: filtered.length });
});

router.post('/questions', authMiddleware, (req: AuthRequest, res: Response) => {
  if (req.user!.role !== 'teacher' && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Only teachers and admins can create questions' });
  }

  const { subject, chapter, topic, difficulty, question, options, correctAnswer, explanation, marks, timeLimitSeconds, formula, tags } = req.body;
  if (!subject || !chapter || !topic || !question || !options || correctAnswer === undefined) {
    return res.status(400).json({ error: 'Missing required question fields' });
  }

  const db = loadDatabase();
  const newQ: Question = {
    _id: `q_custom_${Date.now()}`,
    subject,
    chapter,
    topic,
    difficulty: difficulty || 'medium',
    question,
    options,
    correctAnswer: Number(correctAnswer),
    explanation: explanation || 'Standard step-by-step solution.',
    marks: Number(marks) || 3,
    timeLimitSeconds: Number(timeLimitSeconds) || 75,
    formula,
    tags: tags || [],
  };

  db.questions.push(newQ);
  saveDatabase(db);

  return res.status(201).json({ question: newQ });
});

router.delete('/questions/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  if (req.user!.role !== 'teacher' && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const db = loadDatabase();
  const initialLen = db.questions.length;
  db.questions = db.questions.filter((q) => q._id !== req.params.id);

  if (db.questions.length === initialLen) {
    return res.status(404).json({ error: 'Question not found' });
  }

  saveDatabase(db);
  return res.json({ success: true, message: 'Question removed from question bank' });
});

// ==========================================
// 5. ADAPTIVE ASSESSMENT ENGINE
// ==========================================

// Prepares an assessment session for a student based on topic and adaptive difficulty
router.post('/assessments/start', authMiddleware, (req: AuthRequest, res: Response) => {
  const { subject, chapter, topic, questionCount = 5 } = req.body;
  const db = loadDatabase();

  const userProfile = db.knowledgeProfiles[req.user!._id] || [];
  const node = userProfile.find((n) => n.topic === topic || n.subject === subject);
  const baselineMastery = node ? node.mastery : 60;

  // Filter available questions
  let pool = db.questions;
  if (subject) pool = pool.filter((q) => q.subject.toLowerCase() === subject.toLowerCase());
  if (chapter) pool = pool.filter((q) => q.chapter.toLowerCase() === chapter.toLowerCase());
  if (topic) pool = pool.filter((q) => q.topic.toLowerCase().includes(topic.toLowerCase()));

  if (pool.length === 0) {
    // Fall back to general subject questions
    pool = db.questions.filter((q) => q.subject.toLowerCase() === (subject || 'Mathematics').toLowerCase());
  }

  // Initial difficulty based on baseline mastery
  let initialDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
  if (baselineMastery < 45) initialDifficulty = 'easy';
  else if (baselineMastery >= 75) initialDifficulty = 'hard';

  // Sort pool to start with questions matching initial difficulty
  const sortedPool = [...pool].sort((a, b) => {
    if (a.difficulty === initialDifficulty && b.difficulty !== initialDifficulty) return -1;
    if (b.difficulty === initialDifficulty && a.difficulty !== initialDifficulty) return 1;
    return 0;
  });

  const selectedQuestions = sortedPool.slice(0, Math.min(pool.length, Number(questionCount)));

  // Return questions without exposing correctAnswer
  const sanitizedQuestions = selectedQuestions.map((q) => {
    const { correctAnswer: _, explanation: __, ...safeQ } = q;
    return safeQ;
  });

  return res.json({
    assessmentId: `session_${Date.now()}`,
    subject: subject || 'Mathematics',
    chapter: chapter || 'Algebra',
    topic: topic || 'Adaptive Test',
    initialDifficulty,
    baselineMastery,
    totalQuestions: sanitizedQuestions.length,
    questions: sanitizedQuestions,
  });
});

router.post('/assessments/submit', authMiddleware, (req: AuthRequest, res: Response) => {
  const { subject, chapter, topic, answers } = req.body;
  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Answers array required' });
  }

  const db = loadDatabase();
  const result = processAssessmentSubmission(
    db,
    req.user!._id,
    subject || 'Mathematics',
    chapter || 'General',
    topic || 'General Practice',
    answers
  );

  saveDatabase(db);

  return res.json({
    success: true,
    attempt: result.attempt,
    updatedKnowledgeProfile: result.updatedProfile,
    newRecommendations: result.newRecommendations,
  });
});

router.get('/assessments/history', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const attempts = db.assessmentAttempts.filter((a) => a.userId === req.user!._id);
  return res.json({ attempts });
});

router.get('/assessments/attempt/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const attempt = db.assessmentAttempts.find((a) => a._id === req.params.id);
  if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
  return res.json({ attempt });
});

// ==========================================
// 6. RECOMMENDATION ENGINE
// ==========================================

router.get('/recommendations', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const userRecs = db.recommendations.filter((r) => r.userId === req.user!._id);
  return res.json({ recommendations: userRecs });
});

router.put('/recommendations/:id/complete', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const rec = db.recommendations.find((r) => r._id === req.params.id && r.userId === req.user!._id);
  if (!rec) return res.status(404).json({ error: 'Recommendation not found' });

  rec.completed = true;
  saveDatabase(db);
  return res.json({ success: true, recommendation: rec });
});

// ==========================================
// 7. AI TUTOR & FORMULA EXPLAINER
// ==========================================

router.post('/ai/tutor', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { message, subject, topic, mode = 'chat' } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }

  const db = loadDatabase();
  const profile = db.knowledgeProfiles[req.user!._id] || [];
  const node = profile.find((n) => n.topic === topic || n.subject === subject);
  const weakNodes = profile.filter((n) => n.status === 'NEEDS ATTENTION' || n.status === 'NEEDS PRACTICE');

  const context = {
    studentName: req.user!.name,
    educationLevel: req.user!.educationLevel,
    stream: req.user!.stream,
    subject: subject || 'Mathematics',
    topic: topic || 'Core Principles',
    mastery: node ? node.mastery : 60,
    weakTopics: weakNodes.map((w) => w.topic),
  };

  try {
    const aiResponse = await askAITutor(message, context, mode);
    return res.json(aiResponse);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'AI Tutor failed' });
  }
});

router.post('/ai/explain', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { formula, concept, subject } = req.body;
  const prompt = `Please explain this formula or concept in detail: "${formula || concept}". Provide:
1. Clear statement & meaning of all variables
2. Derivation or conceptual intuition
3. Practical worked example
4. Common pitfalls students encounter`;

  const context = {
    studentName: req.user!.name,
    educationLevel: req.user!.educationLevel,
    subject: subject || 'Mathematics',
    topic: concept || formula,
    mastery: 65,
  };

  try {
    const aiResponse = await askAITutor(prompt, context, 'formula');
    return res.json(aiResponse);
  } catch (err: any) {
    return res.status(500).json({ error: 'Explanation failed' });
  }
});

// ==========================================
// 8. VIDEO LIBRARY
// ==========================================

router.get('/videos', (req: Request, res: Response) => {
  const { subject, topic, search } = req.query;
  const db = loadDatabase();
  let list = db.videos;

  if (subject) list = list.filter((v) => v.subject.toLowerCase() === String(subject).toLowerCase());
  if (topic) list = list.filter((v) => v.topic.toLowerCase().includes(String(topic).toLowerCase()));
  if (search) {
    const s = String(search).toLowerCase();
    list = list.filter((v) => v.title.toLowerCase().includes(s) || v.description.toLowerCase().includes(s));
  }

  return res.json({ videos: list });
});

router.post('/videos/:id/watch', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const video = db.videos.find((v) => v._id === req.params.id);
  if (!video) return res.status(404).json({ error: 'Video not found' });

  video.views += 1;
  saveDatabase(db);
  return res.json({ success: true, views: video.views });
});

// ==========================================
// 9. PROGRESS ANALYTICS
// ==========================================

router.get('/analytics/student', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const userId = req.user!._id;
  const attempts = db.assessmentAttempts.filter((a) => a.userId === userId);
  const profile = db.knowledgeProfiles[userId] || [];

  // Monthly performance progression
  const monthlyProgression = [
    { month: 'Jun', accuracy: 58, score: 62 },
    { month: 'Jul', accuracy: 64, score: 67 },
    { month: 'Aug', accuracy: 71, score: 74 },
    { month: 'Sep', accuracy: 78, score: 81 },
    { month: 'Oct', accuracy: 84, score: 86 },
  ];

  // Subject mastery
  const subjectMastery = [
    { subject: 'Mathematics', mastery: 74, assessments: 12 },
    { subject: 'Physics', mastery: 68, assessments: 8 },
    { subject: 'Chemistry', mastery: 81, assessments: 6 },
    { subject: 'Computer Science', mastery: 88, assessments: 14 },
  ];

  // Difficulty progression stats
  const difficultyDistribution = {
    easy: attempts.reduce((acc, curr) => acc + curr.answers.filter((ans) => ans.difficulty === 'easy').length, 14),
    medium: attempts.reduce((acc, curr) => acc + curr.answers.filter((ans) => ans.difficulty === 'medium').length, 22),
    hard: attempts.reduce((acc, curr) => acc + curr.answers.filter((ans) => ans.difficulty === 'hard').length, 9),
  };

  return res.json({
    totalAssessments: attempts.length,
    averageAccuracy: attempts.length > 0 ? Math.round(attempts.reduce((acc, curr) => acc + curr.accuracy, 0) / attempts.length) : 76,
    strongestTopic: profile.sort((a, b) => b.mastery - a.mastery)[0]?.topic || 'Data Structures',
    weakestTopic: profile.sort((a, b) => a.mastery - b.mastery)[0]?.topic || 'Trigonometry',
    monthlyProgression,
    subjectMastery,
    difficultyDistribution,
    learningStreak: req.user!.streak,
  });
});

// ==========================================
// 10. PARENT DASHBOARD
// ==========================================

router.get('/parents/dashboard', authMiddleware, (req: AuthRequest, res: Response) => {
  if (req.user!.role !== 'parent' && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Parent access only' });
  }

  const db = loadDatabase();
  const linkedStudentIds = req.user!.linkedStudentIds || [];
  const students = db.users.filter((u) => linkedStudentIds.includes(u._id));

  const studentData = students.map((stu) => {
    const profile = db.knowledgeProfiles[stu._id] || [];
    const attempts = db.assessmentAttempts.filter((a) => a.userId === stu._id);
    const avgScore = attempts.length > 0 ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length) : 78;
    const weakTopics = profile.filter((p) => p.status === 'NEEDS ATTENTION');

    return {
      id: stu._id,
      name: stu.name,
      institution: stu.institution,
      educationLevel: stu.educationLevel,
      streak: stu.streak,
      averageScore: avgScore,
      totalAssessments: attempts.length,
      weakTopics: weakTopics.map((w) => ({ topic: w.topic, mastery: w.mastery })),
      recentAttempts: attempts.slice(0, 3),
      knowledgeProfile: profile,
    };
  });

  // Parent specific alerts
  const parentNotifications = db.notifications.filter((n) => n.userId === req.user!._id);

  return res.json({
    students: studentData,
    alerts: parentNotifications,
  });
});

router.post('/parents/link-student', authMiddleware, (req: AuthRequest, res: Response) => {
  const { linkingCode } = req.body;
  if (!linkingCode) return res.status(400).json({ error: 'Student linking code required' });

  const db = loadDatabase();
  const student = db.users.find((u) => u.studentLinkingCode === linkingCode.trim().toUpperCase());
  if (!student) {
    return res.status(404).json({ error: 'No student found with this linking code. Please check with your student.' });
  }

  const parent = db.users.find((u) => u._id === req.user!._id);
  if (!parent) return res.status(404).json({ error: 'Parent record not found' });

  if (!parent.linkedStudentIds) parent.linkedStudentIds = [];
  if (!parent.linkedStudentIds.includes(student._id)) {
    parent.linkedStudentIds.push(student._id);
  }

  saveDatabase(db);
  return res.json({ success: true, message: `Successfully linked with student ${student.name}!`, student: { name: student.name, email: student.email } });
});

// ==========================================
// 11. TEACHER DASHBOARD
// ==========================================

router.get('/teachers/dashboard', authMiddleware, (req: AuthRequest, res: Response) => {
  if (req.user!.role !== 'teacher' && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Teacher access only' });
  }

  const db = loadDatabase();
  const students = db.users.filter((u) => u.role === 'student');
  const allAttempts = db.assessmentAttempts;

  const totalAssessments = allAttempts.length;
  const avgClassScore = allAttempts.length > 0 ? Math.round(allAttempts.reduce((acc, curr) => acc + curr.score, 0) / allAttempts.length) : 74;

  // Identify class-wide weak topics
  const topicStats: { [topic: string]: { totalMastery: number; count: number } } = {};
  for (const stu of students) {
    const prof = db.knowledgeProfiles[stu._id] || [];
    for (const node of prof) {
      if (!topicStats[node.topic]) topicStats[node.topic] = { totalMastery: 0, count: 0 };
      topicStats[node.topic].totalMastery += node.mastery;
      topicStats[node.topic].count += 1;
    }
  }

  const topicDifficulties = Object.entries(topicStats).map(([topic, data]) => ({
    topic,
    averageMastery: Math.round(data.totalMastery / data.count),
    studentCount: data.count,
    needsIntervention: Math.round(data.totalMastery / data.count) < 60,
  })).sort((a, b) => a.averageMastery - b.averageMastery);

  return res.json({
    metrics: {
      totalStudents: students.length,
      averageClassPerformance: avgClassScore,
      totalAssessmentsCompleted: totalAssessments,
      totalQuestionsInBank: db.questions.length,
      attentionRequiredCount: topicDifficulties.filter((t) => t.needsIntervention).length,
    },
    students: students.map((s) => ({
      _id: s._id,
      name: s.name,
      email: s.email,
      educationLevel: s.educationLevel,
      streak: s.streak,
      lastActive: s.lastActive,
      assessmentsCount: db.assessmentAttempts.filter((a) => a.userId === s._id).length,
    })),
    topicDifficulties,
    recentClassAttempts: allAttempts.slice(0, 10),
  });
});

// ==========================================
// 12. ADMIN DASHBOARD
// ==========================================

router.get('/admin/dashboard', authMiddleware, (req: AuthRequest, res: Response) => {
  if (req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access only' });
  }

  const db = loadDatabase();
  return res.json({
    stats: {
      totalUsers: db.users.length,
      studentsCount: db.users.filter((u) => u.role === 'student').length,
      teachersCount: db.users.filter((u) => u.role === 'teacher').length,
      parentsCount: db.users.filter((u) => u.role === 'parent').length,
      totalQuestions: db.questions.length,
      totalAssessments: db.assessmentAttempts.length,
      totalVideos: db.videos.length,
      hardwareStationStatus: db.hardwareStatus.status,
    },
    users: db.users.map(({ passwordHash, ...safe }) => safe),
    hardware: db.hardwareStatus,
  });
});

router.post('/admin/seed-reset', authMiddleware, (req: AuthRequest, res: Response) => {
  if (req.user!.role !== 'admin') return res.status(403).json({ error: 'Admin access only' });
  const freshDb = resetDatabaseToSeed();
  return res.json({ success: true, message: 'Database reset to seed state successfully', usersCount: freshDb.users.length });
});

// ==========================================
// 13. NOTIFICATIONS
// ==========================================

router.get('/notifications', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  const notifs = db.notifications.filter((n) => n.userId === req.user!._id);
  return res.json({ notifications: notifs, unreadCount: notifs.filter((n) => !n.read).length });
});

router.post('/notifications/read-all', authMiddleware, (req: AuthRequest, res: Response) => {
  const db = loadDatabase();
  for (const n of db.notifications) {
    if (n.userId === req.user!._id) {
      n.read = true;
    }
  }
  saveDatabase(db);
  return res.json({ success: true });
});

// ==========================================
// 14. AWARENESS MODULE
// ==========================================

router.get('/awareness', (req: Request, res: Response) => {
  const db = loadDatabase();
  return res.json({ awareness: db.awareness });
});

// ==========================================
// 15. RASPBERRY PI SMART LEARNING STATION
// ==========================================

router.get('/hardware/status', (req: Request, res: Response) => {
  const db = loadDatabase();
  // Slightly fluctuate telemetry to simulate real live hardware readings
  const telemetry = {
    ...db.hardwareStatus,
    cpuTempCelsius: +(42.5 + Math.random() * 2.5).toFixed(1),
    cpuUsagePercent: +(15.0 + Math.random() * 8.0).toFixed(1),
    lastSync: new Date().toISOString(),
  };
  return res.json({ hardware: telemetry });
});

// ==========================================
// 16. OFFLINE SYNC API
// ==========================================

router.post('/offline/sync', authMiddleware, (req: AuthRequest, res: Response) => {
  const { queuedAssessments } = req.body;
  if (!queuedAssessments || !Array.isArray(queuedAssessments)) {
    return res.status(400).json({ error: 'queuedAssessments array required' });
  }

  const db = loadDatabase();
  let syncedCount = 0;

  for (const item of queuedAssessments) {
    processAssessmentSubmission(
      db,
      req.user!._id,
      item.subject || 'Mathematics',
      item.chapter || 'Offline Chapter',
      item.topic || 'Offline Sync',
      item.answers || []
    );
    syncedCount++;
  }

  saveDatabase(db);
  return res.json({
    success: true,
    syncedCount,
    message: `Synchronized ${syncedCount} offline learning activities with cloud database.`,
  });
});

export default router;
