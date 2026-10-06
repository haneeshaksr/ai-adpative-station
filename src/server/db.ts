import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Types for data models
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  institution?: string;
  educationLevel?: string;
  stream?: string;
  preferredLanguage?: string;
  studentLinkingCode?: string; // for students to give to parents
  linkedStudentIds?: string[]; // for parents
  subjectsTaught?: string[]; // for teachers
  streak: number;
  lastActive: string;
  createdAt: string;
}

export interface Question {
  _id: string;
  subject: string;
  chapter: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  correctAnswer: number; // index 0-3
  explanation: string;
  marks: number;
  timeLimitSeconds: number;
  formula?: string;
  tags?: string[];
}

export interface AssessmentAttempt {
  _id: string;
  userId: string;
  subject: string;
  chapter: string;
  topic: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  timeTakenSeconds: number;
  difficultyProgression: ('easy' | 'medium' | 'hard')[];
  answers: {
    questionId: string;
    questionText: string;
    selectedAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
    timeSpentSeconds: number;
    explanation: string;
  }[];
  topicBreakdown: { [topic: string]: { correct: number; total: number; percentage: number } };
  createdAt: string;
}

export interface KnowledgeNode {
  topic: string;
  subject: string;
  mastery: number; // 0 to 100
  status: 'MASTERED' | 'GOOD' | 'NEEDS PRACTICE' | 'NEEDS ATTENTION';
  assessmentsTaken: number;
  lastAssessed: string;
  history: { date: string; mastery: number }[];
}

export interface VideoItem {
  _id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  durationMinutes: number;
  thumbnail: string;
  videoUrl: string;
  description: string;
  uploadedBy: string;
  views: number;
}

export interface Recommendation {
  _id: string;
  userId: string;
  type: 'video' | 'practice' | 'quiz' | 'ai_tutor' | 'notes';
  title: string;
  reason: string;
  subject: string;
  topic: string;
  priority: 'high' | 'medium' | 'low';
  targetUrl?: string;
  actionText: string;
  completed: boolean;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'assessment' | 'achievement' | 'alert' | 'recommendation' | 'content';
  read: boolean;
  createdAt: string;
}

export interface AwarenessCard {
  _id: string;
  category: 'Environmental Awareness' | 'Cyber Safety' | 'Social Responsibility' | 'Health & Wellbeing';
  title: string;
  description: string;
  keyPoints: string[];
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
  iconName: string;
}

export interface DatabaseSchema {
  users: User[];
  questions: Question[];
  assessmentAttempts: AssessmentAttempt[];
  knowledgeProfiles: { [userId: string]: KnowledgeNode[] };
  videos: VideoItem[];
  recommendations: Recommendation[];
  notifications: NotificationItem[];
  awareness: AwarenessCard[];
  hardwareStatus: {
    stationId: string;
    stationName: string;
    status: 'ONLINE' | 'STANDBY' | 'OFFLINE';
    raspberryPiModel: string;
    osVersion: string;
    cpuTempCelsius: number;
    cpuUsagePercent: number;
    ramUsagePercent: number;
    peripherals: {
      touchscreen: { connected: boolean; resolution: string };
      camera: { connected: boolean; model: string; fps: number };
      microphone: { connected: boolean; status: string };
      speaker: { connected: boolean; volumePercent: number };
      pirSensor: { motionDetected: boolean; status: string };
      oledDisplay: { connected: boolean; currentScreen: string };
      rgbLed: { color: string; brightness: number };
      buzzer: { status: string };
    };
    aiService: { status: string; latencyMs: number };
    databaseService: { status: string; latencyMs: number };
    lastSync: string;
    currentActiveStudentId: string | null;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache synced to disk
let dbState: DatabaseSchema | null = null;

function getInitialSeed(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('password123', salt);

  return {
    users: [
      {
        _id: 'usr_student_1',
        name: 'Alex Rivera',
        email: 'student@example.com',
        phone: '+1 (555) 234-5678',
        passwordHash,
        role: 'student',
        institution: 'Apex STEM Academy',
        educationLevel: 'Grade 10 / High School',
        stream: 'Science & Mathematics',
        preferredLanguage: 'English',
        studentLinkingCode: 'STU-ALEX-9021',
        streak: 7,
        lastActive: new Date().toISOString(),
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        _id: 'usr_student_2',
        name: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '+1 (555) 987-6543',
        passwordHash,
        role: 'student',
        institution: 'Metro Tech High',
        educationLevel: 'Grade 10 / High School',
        stream: 'Science & Mathematics',
        preferredLanguage: 'English',
        studentLinkingCode: 'STU-PRIYA-4311',
        streak: 12,
        lastActive: new Date().toISOString(),
        createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      },
      {
        _id: 'usr_teacher_1',
        name: 'Dr. Evelyn Foster',
        email: 'teacher@example.com',
        phone: '+1 (555) 876-5432',
        passwordHash,
        role: 'teacher',
        institution: 'Apex STEM Academy',
        subjectsTaught: ['Mathematics', 'Physics'],
        streak: 24,
        lastActive: new Date().toISOString(),
        createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
      },
      {
        _id: 'usr_parent_1',
        name: 'Marcus Rivera',
        email: 'parent@example.com',
        phone: '+1 (555) 345-6789',
        passwordHash,
        role: 'parent',
        linkedStudentIds: ['usr_student_1'],
        streak: 5,
        lastActive: new Date().toISOString(),
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
      },
      {
        _id: 'usr_admin_1',
        name: 'System Administrator',
        email: 'admin@example.com',
        phone: '+1 (555) 000-1122',
        passwordHash,
        role: 'admin',
        institution: 'Central EdTech District',
        streak: 35,
        lastActive: new Date().toISOString(),
        createdAt: new Date(Date.now() - 365 * 86400000).toISOString(),
      }
    ],
    questions: [
      // MATHEMATICS - Algebra
      {
        _id: 'q_alg_1',
        subject: 'Mathematics',
        chapter: 'Algebra',
        topic: 'Linear Equations',
        difficulty: 'easy',
        question: 'Solve for x in the equation: 3x - 7 = 14',
        options: ['x = 5', 'x = 7', 'x = 21', 'x = 3'],
        correctAnswer: 1,
        explanation: 'Add 7 to both sides: 3x = 21. Divide by 3: x = 7.',
        marks: 2,
        timeLimitSeconds: 60,
        formula: '3x - 7 = 14',
        tags: ['linear', 'algebra', 'foundations']
      },
      {
        _id: 'q_alg_2',
        subject: 'Mathematics',
        chapter: 'Algebra',
        topic: 'Quadratic Equations',
        difficulty: 'medium',
        question: 'What are the roots of the quadratic equation: x² - 5x + 6 = 0?',
        options: ['x = -2, -3', 'x = 2, 3', 'x = 1, 6', 'x = -1, -6'],
        correctAnswer: 1,
        explanation: 'Factor the quadratic: (x - 2)(x - 3) = 0. Therefore, x = 2 or x = 3.',
        marks: 3,
        timeLimitSeconds: 90,
        formula: 'x^2 - 5x + 6 = 0',
        tags: ['quadratics', 'factoring']
      },
      {
        _id: 'q_alg_3',
        subject: 'Mathematics',
        chapter: 'Algebra',
        topic: 'Quadratic Equations',
        difficulty: 'hard',
        question: 'If the discriminant of ax² + bx + c = 0 is negative (b² - 4ac < 0), what is the nature of the roots?',
        options: [
          'Two distinct real roots',
          'Two equal real roots',
          'Two complex conjugate roots with non-zero imaginary parts',
          'One real root and one imaginary root'
        ],
        correctAnswer: 2,
        explanation: 'When discriminant Δ < 0, the square root involves an imaginary unit i, yielding two complex conjugate roots: (-b ± i√|Δ|)/(2a).',
        marks: 4,
        timeLimitSeconds: 120,
        formula: 'b^2 - 4ac < 0',
        tags: ['quadratics', 'discriminant', 'complex numbers']
      },
      // MATHEMATICS - Trigonometry
      {
        _id: 'q_trig_1',
        subject: 'Mathematics',
        chapter: 'Trigonometry',
        topic: 'Trigonometric Ratios',
        difficulty: 'easy',
        question: 'In a right-angled triangle, if opposite side = 3 and hypotenuse = 5, what is sin(θ)?',
        options: ['3/4', '3/5', '4/5', '5/3'],
        correctAnswer: 1,
        explanation: 'sin(θ) is defined as Opposite / Hypotenuse = 3 / 5 = 0.6.',
        marks: 2,
        timeLimitSeconds: 60,
        formula: '\\sin(\\theta) = \\frac{\\text{Opposite}}{\\text{Hypotenuse}}',
        tags: ['trigonometry', 'basics']
      },
      {
        _id: 'q_trig_2',
        subject: 'Mathematics',
        chapter: 'Trigonometry',
        topic: 'Trigonometric Identities',
        difficulty: 'medium',
        question: 'Simplify the fundamental identity: sin²(x) + cos²(x)',
        options: ['0', '1', 'tan²(x)', '2sin(x)'],
        correctAnswer: 1,
        explanation: 'Pythagorean trigonometric identity proves that sin²(x) + cos²(x) = 1 for all real angles x.',
        marks: 3,
        timeLimitSeconds: 75,
        formula: '\\sin^2(x) + \\cos^2(x) = 1',
        tags: ['trigonometry', 'identities']
      },
      {
        _id: 'q_trig_3',
        subject: 'Mathematics',
        chapter: 'Trigonometry',
        topic: 'Trigonometric Identities',
        difficulty: 'hard',
        question: 'Which of the following is equivalent to cos(2θ)?',
        options: [
          '2cos(θ) - 1',
          'cos²(θ) - sin²(θ)',
          '1 + 2sin²(θ)',
          '2sin(θ)cos(θ)'
        ],
        correctAnswer: 1,
        explanation: 'The double angle formula for cosine is cos(2θ) = cos²(θ) - sin²(θ) = 2cos²(θ) - 1 = 1 - 2sin²(θ).',
        marks: 4,
        timeLimitSeconds: 120,
        formula: '\\cos(2\\theta) = \\cos^2(\\theta) - \\sin^2(\\theta)',
        tags: ['trigonometry', 'double-angle']
      },
      // MATHEMATICS - Coordinate Geometry
      {
        _id: 'q_coord_1',
        subject: 'Mathematics',
        chapter: 'Coordinate Geometry',
        topic: 'Distance Formula',
        difficulty: 'easy',
        question: 'What is the distance between points (0, 0) and (3, 4)?',
        options: ['7', '5', '12', '25'],
        correctAnswer: 1,
        explanation: 'Distance = √((3-0)² + (4-0)²) = √(9 + 16) = √25 = 5.',
        marks: 2,
        timeLimitSeconds: 60,
        formula: 'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}',
        tags: ['coordinate', 'distance']
      },
      {
        _id: 'q_coord_2',
        subject: 'Mathematics',
        chapter: 'Coordinate Geometry',
        topic: 'Slope and Lines',
        difficulty: 'medium',
        question: 'Find the slope of a line passing through (2, 3) and (6, 11).',
        options: ['1', '2', '3', '4'],
        correctAnswer: 1,
        explanation: 'Slope m = (y₂ - y₁) / (x₂ - x₁) = (11 - 3) / (6 - 2) = 8 / 4 = 2.',
        marks: 3,
        timeLimitSeconds: 75,
        formula: 'm = \\frac{y_2 - y_1}{x_2 - x_1}',
        tags: ['slope', 'linear']
      },
      // PHYSICS - Kinematics
      {
        _id: 'q_phys_1',
        subject: 'Physics',
        chapter: 'Kinematics',
        topic: 'Uniform Motion',
        difficulty: 'easy',
        question: 'A car travels 150 km in 3 hours at constant speed. What is its velocity?',
        options: ['45 km/h', '50 km/h', '60 km/h', '30 km/h'],
        correctAnswer: 1,
        explanation: 'Velocity = Distance / Time = 150 km / 3 h = 50 km/h.',
        marks: 2,
        timeLimitSeconds: 60,
        formula: 'v = \\frac{d}{t}',
        tags: ['kinematics', 'velocity']
      },
      {
        _id: 'q_phys_2',
        subject: 'Physics',
        chapter: 'Kinematics',
        topic: 'Accelerated Motion',
        difficulty: 'medium',
        question: 'A body starts from rest (u = 0) and accelerates uniformly at 4 m/s² for 5 seconds. What is its final velocity?',
        options: ['10 m/s', '20 m/s', '50 m/s', '25 m/s'],
        correctAnswer: 1,
        explanation: 'Using first equation of motion: v = u + at = 0 + (4)(5) = 20 m/s.',
        marks: 3,
        timeLimitSeconds: 75,
        formula: 'v = u + at',
        tags: ['acceleration', 'kinematics']
      },
      {
        _id: 'q_phys_3',
        subject: 'Physics',
        chapter: 'Laws of Motion',
        topic: "Newton's Second Law",
        difficulty: 'hard',
        question: 'A net force of 50 N acts on an object of mass 10 kg. What acceleration is produced?',
        options: ['0.2 m/s²', '5 m/s²', '500 m/s²', '25 m/s²'],
        correctAnswer: 1,
        explanation: 'According to Newton’s 2nd Law, F = ma => a = F/m = 50 N / 10 kg = 5 m/s².',
        marks: 3,
        timeLimitSeconds: 90,
        formula: 'F = ma',
        tags: ['dynamics', 'newton']
      },
      // CHEMISTRY - Chemical Bonding
      {
        _id: 'q_chem_1',
        subject: 'Chemistry',
        chapter: 'Chemical Bonding',
        topic: 'Ionic vs Covalent',
        difficulty: 'easy',
        question: 'Which of the following compounds exhibits ionic bonding?',
        options: ['CH₄', 'H₂O', 'NaCl', 'CO₂'],
        correctAnswer: 2,
        explanation: 'NaCl (Sodium chloride) is formed by complete electron transfer from Na to Cl, creating an ionic bond.',
        marks: 2,
        timeLimitSeconds: 60,
        tags: ['bonding', 'chemistry']
      },
      {
        _id: 'q_chem_2',
        subject: 'Chemistry',
        chapter: 'Atomic Structure',
        topic: 'Electron Configuration',
        difficulty: 'medium',
        question: 'What is the electron configuration of Carbon (Atomic number Z = 6)?',
        options: ['1s² 2s² 2p²', '1s² 2s¹ 2p³', '1s² 2p⁴', '2s² 2p⁴'],
        correctAnswer: 0,
        explanation: 'Carbon has 6 electrons. Filling according to Aufbau principle: 1s² 2s² 2p².',
        marks: 3,
        timeLimitSeconds: 75,
        tags: ['atomic', 'electrons']
      },
      // COMPUTER SCIENCE - Data Structures
      {
        _id: 'q_cs_1',
        subject: 'Computer Science',
        chapter: 'Data Structures',
        topic: 'Arrays and Lists',
        difficulty: 'easy',
        question: 'What is the time complexity of accessing an element in an array by its index?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        correctAnswer: 0,
        explanation: 'Array elements are stored in contiguous memory addresses, allowing direct offset calculation in O(1) constant time.',
        marks: 2,
        timeLimitSeconds: 60,
        tags: ['algorithms', 'complexity', 'arrays']
      },
      {
        _id: 'q_cs_2',
        subject: 'Computer Science',
        chapter: 'Algorithms',
        topic: 'Binary Search',
        difficulty: 'medium',
        question: 'What precondition is strictly required before running Binary Search on an array?',
        options: [
          'All elements must be positive',
          'The array must be sorted in ascending or descending order',
          'The array must contain an odd number of items',
          'No duplicate items allowed'
        ],
        correctAnswer: 1,
        explanation: 'Binary search repeatedly halves the search space based on ordering, requiring the array to be monotonically sorted.',
        marks: 3,
        timeLimitSeconds: 75,
        tags: ['binary search', 'algorithms']
      },
      {
        _id: 'q_cs_3',
        subject: 'Computer Science',
        chapter: 'Data Structures',
        topic: 'Stacks and Queues',
        difficulty: 'medium',
        question: 'Which data structure operates on a Last-In, First-Out (LIFO) order?',
        options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
        correctAnswer: 1,
        explanation: 'A Stack follows LIFO, where the last item pushed is the first to be popped.',
        marks: 3,
        timeLimitSeconds: 60,
        tags: ['stacks', 'lifo']
      }
    ],
    assessmentAttempts: [
      {
        _id: 'att_demo_1',
        userId: 'usr_student_1',
        subject: 'Mathematics',
        chapter: 'Algebra',
        topic: 'Quadratic Equations',
        score: 85,
        totalMarks: 100,
        accuracy: 85,
        timeTakenSeconds: 340,
        difficultyProgression: ['easy', 'medium', 'medium', 'hard'],
        answers: [],
        topicBreakdown: {
          'Quadratic Equations': { correct: 4, total: 5, percentage: 80 },
          'Linear Equations': { correct: 5, total: 5, percentage: 100 }
        },
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        _id: 'att_demo_2',
        userId: 'usr_student_1',
        subject: 'Mathematics',
        chapter: 'Trigonometry',
        topic: 'Trigonometric Identities',
        score: 45,
        totalMarks: 100,
        accuracy: 45,
        timeTakenSeconds: 420,
        difficultyProgression: ['medium', 'easy', 'easy', 'medium'],
        answers: [],
        topicBreakdown: {
          'Trigonometric Identities': { correct: 2, total: 5, percentage: 40 },
          'Trigonometric Ratios': { correct: 3, total: 5, percentage: 60 }
        },
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    ],
    knowledgeProfiles: {
      usr_student_1: [
        {
          topic: 'Algebra',
          subject: 'Mathematics',
          mastery: 85,
          status: 'MASTERED',
          assessmentsTaken: 6,
          lastAssessed: new Date(Date.now() - 2 * 86400000).toISOString(),
          history: [
            { date: '2026-09-10', mastery: 55 },
            { date: '2026-09-18', mastery: 68 },
            { date: '2026-09-27', mastery: 78 },
            { date: '2026-10-03', mastery: 85 }
          ]
        },
        {
          topic: 'Coordinate Geometry',
          subject: 'Mathematics',
          mastery: 72,
          status: 'GOOD',
          assessmentsTaken: 4,
          lastAssessed: new Date(Date.now() - 4 * 86400000).toISOString(),
          history: [
            { date: '2026-09-12', mastery: 60 },
            { date: '2026-09-22', mastery: 68 },
            { date: '2026-10-01', mastery: 72 }
          ]
        },
        {
          topic: 'Trigonometry',
          subject: 'Mathematics',
          mastery: 45,
          status: 'NEEDS ATTENTION',
          assessmentsTaken: 3,
          lastAssessed: new Date(Date.now() - 1 * 86400000).toISOString(),
          history: [
            { date: '2026-09-15', mastery: 35 },
            { date: '2026-09-25', mastery: 40 },
            { date: '2026-10-04', mastery: 45 }
          ]
        },
        {
          topic: 'Statistics & Probability',
          subject: 'Mathematics',
          mastery: 61,
          status: 'GOOD',
          assessmentsTaken: 3,
          lastAssessed: new Date(Date.now() - 6 * 86400000).toISOString(),
          history: [
            { date: '2026-09-14', mastery: 50 },
            { date: '2026-09-29', mastery: 61 }
          ]
        },
        {
          topic: 'Kinematics & Motion',
          subject: 'Physics',
          mastery: 78,
          status: 'GOOD',
          assessmentsTaken: 5,
          lastAssessed: new Date(Date.now() - 3 * 86400000).toISOString(),
          history: [
            { date: '2026-09-11', mastery: 62 },
            { date: '2026-10-02', mastery: 78 }
          ]
        },
        {
          topic: 'Laws of Motion',
          subject: 'Physics',
          mastery: 52,
          status: 'NEEDS PRACTICE',
          assessmentsTaken: 2,
          lastAssessed: new Date(Date.now() - 5 * 86400000).toISOString(),
          history: [
            { date: '2026-09-20', mastery: 48 },
            { date: '2026-09-30', mastery: 52 }
          ]
        },
        {
          topic: 'Chemical Bonding',
          subject: 'Chemistry',
          mastery: 81,
          status: 'MASTERED',
          assessmentsTaken: 4,
          lastAssessed: new Date(Date.now() - 4 * 86400000).toISOString(),
          history: [
            { date: '2026-09-16', mastery: 70 },
            { date: '2026-10-01', mastery: 81 }
          ]
        },
        {
          topic: 'Data Structures & Algorithms',
          subject: 'Computer Science',
          mastery: 88,
          status: 'MASTERED',
          assessmentsTaken: 7,
          lastAssessed: new Date(Date.now() - 1 * 86400000).toISOString(),
          history: [
            { date: '2026-09-08', mastery: 72 },
            { date: '2026-09-23', mastery: 82 },
            { date: '2026-10-04', mastery: 88 }
          ]
        }
      ]
    },
    videos: [
      {
        _id: 'vid_trig_1',
        title: 'Mastering Trigonometric Identities: Visual Proofs',
        subject: 'Mathematics',
        topic: 'Trigonometry',
        difficulty: 'easy',
        durationMinutes: 14,
        thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        description: 'Understand sin²(θ) + cos²(θ) = 1 through unit circle geometry and right triangle ratios.',
        uploadedBy: 'Dr. Evelyn Foster',
        views: 1420
      },
      {
        _id: 'vid_alg_1',
        title: 'Quadratic Equations Explained Simply: The Quadratic Formula',
        subject: 'Mathematics',
        topic: 'Algebra',
        difficulty: 'medium',
        durationMinutes: 18,
        thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        description: 'Deriving the formula and learning how discriminant reveals real vs complex roots.',
        uploadedBy: 'Apex Math Dept',
        views: 3105
      },
      {
        _id: 'vid_phys_1',
        title: "Newton's 3 Laws of Motion with Real-World Demonstrations",
        subject: 'Physics',
        topic: 'Laws of Motion',
        difficulty: 'medium',
        durationMinutes: 22,
        thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        description: 'Inertia, F=ma, and action-reaction pairs visualized with high-speed camera experiments.',
        uploadedBy: 'Prof. Julian Vance',
        views: 4890
      },
      {
        _id: 'vid_cs_1',
        title: 'Big-O Notation and Time Complexity Demystified',
        subject: 'Computer Science',
        topic: 'Data Structures & Algorithms',
        difficulty: 'easy',
        durationMinutes: 15,
        thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        description: 'Learn why O(1), O(log n), O(n), and O(n²) matter for scalable algorithms.',
        uploadedBy: 'Dr. Evelyn Foster',
        views: 6200
      },
      {
        _id: 'vid_chem_1',
        title: 'Ionic vs Covalent Bonds: Electronegativity & Molecular Shapes',
        subject: 'Chemistry',
        topic: 'Chemical Bonding',
        difficulty: 'medium',
        durationMinutes: 16,
        thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        description: 'Why atoms share or transfer valence electrons to reach stable octets.',
        uploadedBy: 'Chemistry Guild',
        views: 2840
      },
      {
        _id: 'vid_trig_2',
        title: 'Sine, Cosine, Tangent: The Unit Circle Masterclass',
        subject: 'Mathematics',
        topic: 'Trigonometry',
        difficulty: 'easy',
        durationMinutes: 12,
        thumbnail: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        description: 'Never memorize radian tables again. Understand coordinates directly on the unit circle.',
        uploadedBy: 'Apex Math Dept',
        views: 5120
      }
    ],
    recommendations: [
      {
        _id: 'rec_1',
        userId: 'usr_student_1',
        type: 'video',
        title: 'Watch: Mastering Trigonometric Identities: Visual Proofs',
        reason: 'Your Trigonometry mastery is currently at 45% (Needs Attention).',
        subject: 'Mathematics',
        topic: 'Trigonometry',
        priority: 'high',
        targetUrl: '/videos',
        actionText: 'Watch Video (14m)',
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'rec_2',
        userId: 'usr_student_1',
        type: 'ai_tutor',
        title: 'AI Tutor Session: Deconstruct Sin & Cosine Relationships',
        reason: 'Get step-by-step interactive guidance on double-angle formulas.',
        subject: 'Mathematics',
        topic: 'Trigonometry',
        priority: 'high',
        targetUrl: '/ai-tutor',
        actionText: 'Start AI Session',
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        _id: 'rec_3',
        userId: 'usr_student_1',
        type: 'quiz',
        title: 'Targeted Practice: 5 Foundational Trigonometry Questions',
        reason: 'Build confidence with low-difficulty questions before reassessing.',
        subject: 'Mathematics',
        topic: 'Trigonometry',
        priority: 'medium',
        targetUrl: '/assessments',
        actionText: 'Take Practice Quiz',
        completed: false,
        createdAt: new Date().toISOString()
      }
    ],
    notifications: [
      {
        _id: 'notif_1',
        userId: 'usr_student_1',
        title: 'Knowledge Profile Updated',
        message: 'Your recent Trigonometry assessment scored 45%. We generated a custom remedial study plan for you.',
        type: 'alert',
        read: false,
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        _id: 'notif_2',
        userId: 'usr_student_1',
        title: '7-Day Learning Streak Active! 🔥',
        message: 'Keep going! Complete an activity today to unlock the Bronze Momentum Badge.',
        type: 'achievement',
        read: false,
        createdAt: new Date(Date.now() - 3 * 3600000).toISOString()
      },
      {
        _id: 'notif_3',
        userId: 'usr_parent_1',
        title: 'Alex Needs Support in Trigonometry',
        message: 'Alex scored 45% on Trigonometric Identities. An adaptive learning pathway has been assigned.',
        type: 'alert',
        read: false,
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      {
        _id: 'notif_4',
        userId: 'usr_teacher_1',
        title: 'Class Performance Alert',
        message: '6 students in Grade 10 Math showed difficulty on Trigonometric Identities this week.',
        type: 'alert',
        read: false,
        createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
      }
    ],
    awareness: [
      {
        _id: 'aw_1',
        category: 'Environmental Awareness',
        title: 'Electronic Waste (E-Waste) & Circular Tech',
        description: 'Over 50 million metric tons of electronic waste are generated globally every year. Smart circular design and proper recycling can recover precious metals and protect ecosystems.',
        keyPoints: [
          'Precious metals like gold, copper, and palladium can be recovered from discarded microchips.',
          'Improper disposal leads to toxic lead and cadmium leaching into groundwater systems.',
          'Extending device life cycles by 2 years reduces overall carbon footprint by 30%.'
        ],
        quiz: {
          question: 'What is the most effective individual action to reduce personal e-waste impact?',
          options: [
            'Throwing older phones in regular curbside trash',
            'Repairing and reusing electronics before buying new models',
            'Incinerating unwanted cables at home',
            'Storing infinite broken devices in plastic bags indefinitely'
          ],
          correctAnswer: 1,
          explanation: 'Repairing, repurposing, and utilizing certified electronic recyclers preserves resources and halts toxic landfill contamination.'
        },
        iconName: 'Leaf'
      },
      {
        _id: 'aw_2',
        category: 'Cyber Safety',
        title: 'Phishing Defense and Credential Hygiene',
        description: 'Modern cyberattacks often rely on social engineering rather than software exploits. Recognizing urgent language and fraudulent domains is essential for digital safety.',
        keyPoints: [
          'Always verify the actual sender address and domain spelling before clicking links.',
          'Legitimate institutions never request full passwords or two-factor codes via unverified chat.',
          'Use unique passwords backed by password managers and hardware-based or TOTP 2FA.'
        ],
        quiz: {
          question: 'You receive an urgent email from "support@g00gle-security-alert.com" asking you to reset your password within 10 minutes. What should you do?',
          options: [
            'Click the link immediately to prevent account suspension',
            'Forward the email to all your classmates',
            'Ignore the link, report phishing, and check your security status directly at the official platform URL',
            'Reply with your phone number and current password'
          ],
          correctAnswer: 2,
          explanation: 'Urgency and deceptive lookalike domains are classic hallmarks of credential phishing. Always navigate directly via verified bookmarks.'
        },
        iconName: 'ShieldAlert'
      },
      {
        _id: 'aw_3',
        category: 'Health & Wellbeing',
        title: 'Ergonomics & Cognitive Rest During Deep Study',
        description: 'Prolonged screen exposure without micro-breaks causes visual fatigue and cognitive decline. The 20-20-20 rule and circadian lighting optimize sustained academic retention.',
        keyPoints: [
          'Every 20 minutes, gaze at an object 20 feet away for at least 20 seconds.',
          'Keep your monitor eye-level to maintain neutral cervical spine alignment.',
          'Hydration directly correlates with working memory and reaction time.'
        ],
        quiz: {
          question: 'What does the standard 20-20-20 ergonomic rule prescribe?',
          options: [
            'Study for 20 hours with 20 minutes sleep for 20 days',
            'Every 20 minutes, look at an object 20 feet away for 20 seconds',
            'Drink 20 ounces of water every 20 minutes 20 times',
            'Type 20 words per minute at 20 percent brightness'
          ],
          correctAnswer: 1,
          explanation: 'The 20-20-20 rule relaxes the ciliary muscles in the eyes, preventing digital eye strain and dry eye symptoms.'
        },
        iconName: 'HeartPulse'
      },
      {
        _id: 'aw_4',
        category: 'Social Responsibility',
        title: 'Digital Civility & Algorithmic Literacy',
        description: 'Understanding how recommendation algorithms curate online content helps learners avoid polarization, recognize misinformation, and build constructive online discourse.',
        keyPoints: [
          'Algorithms prioritize high-engagement content, which frequently amplifies sensationalism.',
          'Cross-referencing primary academic sources verifies claims before resharing.',
          'Practicing empathy in digital discussions fosters collaborative learning communities.'
        ],
        quiz: {
          question: 'Why do social media algorithms often prioritize sensational or emotionally charged headlines?',
          options: [
            'Because they are always scientifically proven to be accurate',
            'Because outrage and curiosity drive higher engagement metrics and watch time',
            'Because search engines require sensational language to index pages',
            'Because students requested dramatic headlines'
          ],
          correctAnswer: 1,
          explanation: 'Engagement-driven ranking functions amplify content that evokes strong emotional reactions to maximize platform time-on-page.'
        },
        iconName: 'Users'
      }
    ],
    hardwareStatus: {
      stationId: 'PI5-SMART-STATION-01',
      stationName: 'Raspberry Pi 5 Adaptive Learning Pod',
      status: 'ONLINE',
      raspberryPiModel: 'Raspberry Pi 5 Model B - 8GB RAM',
      osVersion: 'Raspberry Pi OS (Debian 12 Bookworm, 64-bit)',
      cpuTempCelsius: 43.2,
      cpuUsagePercent: 18.5,
      ramUsagePercent: 32.1,
      peripherals: {
        touchscreen: { connected: true, resolution: '1920x1080 (10.1" IPS Multi-touch)' },
        camera: { connected: true, model: 'Sony IMX708 Camera Module 3 (Wide-Angle)', fps: 60 },
        microphone: { connected: true, status: 'Array Active with Noise Suppression' },
        speaker: { connected: true, volumePercent: 75 },
        pirSensor: { motionDetected: true, status: 'Student Present at Station' },
        oledDisplay: { connected: true, currentScreen: 'Displaying Current Learning Streak (7 Days)' },
        rgbLed: { color: '#00E5FF', brightness: 85 },
        buzzer: { status: 'Standby / Haptic feedback on' }
      },
      aiService: { status: 'CONNECTED', latencyMs: 142 },
      databaseService: { status: 'CONNECTED', latencyMs: 14 },
      lastSync: new Date().toISOString(),
      currentActiveStudentId: 'usr_student_1'
    }
  };
}

export function loadDatabase(): DatabaseSchema {
  if (dbState) return dbState;

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      dbState = JSON.parse(raw);
      return dbState!;
    } catch (e) {
      console.warn('Error reading db.json, falling back to seed data:', e);
    }
  }

  dbState = getInitialSeed();
  saveDatabase(dbState);
  return dbState;
}

export function saveDatabase(data?: DatabaseSchema): void {
  if (data) {
    dbState = data;
  }
  if (!dbState) return;

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write db.json:', err);
  }
}

// Reset helper for testing / admin demo reset
export function resetDatabaseToSeed(): DatabaseSchema {
  dbState = getInitialSeed();
  saveDatabase(dbState);
  return dbState;
}
