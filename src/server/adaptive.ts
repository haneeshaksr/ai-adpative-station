import {
  AssessmentAttempt,
  DatabaseSchema,
  KnowledgeNode,
  Question,
  Recommendation,
  NotificationItem,
} from './db';

// Computerized Adaptive Testing (CAT) state machine
export function getNextQuestionDifficulty(
  currentDifficulty: 'easy' | 'medium' | 'hard',
  lastAnswerCorrect: boolean,
  streak: number
): 'easy' | 'medium' | 'hard' {
  if (lastAnswerCorrect) {
    if (streak >= 2 && currentDifficulty === 'medium') {
      return 'hard';
    }
    if (currentDifficulty === 'easy') {
      return 'medium';
    }
    return currentDifficulty; // stays at hard
  } else {
    // Answer was incorrect
    if (currentDifficulty === 'hard') {
      return 'medium';
    }
    if (currentDifficulty === 'medium') {
      return 'easy';
    }
    return 'easy';
  }
}

// Adaptive score calculation and Knowledge Profile Bayesian updating
export function processAssessmentSubmission(
  db: DatabaseSchema,
  userId: string,
  subject: string,
  chapter: string,
  topic: string,
  submittedAnswers: {
    questionId: string;
    selectedAnswer: number;
    timeSpentSeconds: number;
  }[]
): {
  attempt: AssessmentAttempt;
  updatedProfile: KnowledgeNode[];
  newRecommendations: Recommendation[];
} {
  let correctCount = 0;
  let totalWeightedScore = 0;
  let maxPossibleScore = 0;
  const detailedAnswers: AssessmentAttempt['answers'] = [];
  const difficultyProgression: ('easy' | 'medium' | 'hard')[] = [];
  const topicStats: { [top: string]: { correct: number; total: number } } = {};

  const totalTimeTaken = submittedAnswers.reduce((acc, curr) => acc + (curr.timeSpentSeconds || 0), 0);

  for (const sub of submittedAnswers) {
    const q = db.questions.find((item) => item._id === sub.questionId);
    if (!q) continue;

    difficultyProgression.push(q.difficulty);
    const isCorrect = sub.selectedAnswer === q.correctAnswer;
    if (isCorrect) correctCount++;

    const weight = q.difficulty === 'hard' ? 4 : q.difficulty === 'medium' ? 3 : 2;
    maxPossibleScore += weight;
    if (isCorrect) {
      totalWeightedScore += weight;
    }

    if (!topicStats[q.topic]) {
      topicStats[q.topic] = { correct: 0, total: 0 };
    }
    topicStats[q.topic].total += 1;
    if (isCorrect) {
      topicStats[q.topic].correct += 1;
    }

    detailedAnswers.push({
      questionId: q._id,
      questionText: q.question,
      selectedAnswer: sub.selectedAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
      difficulty: q.difficulty,
      timeSpentSeconds: sub.timeSpentSeconds,
      explanation: q.explanation,
    });
  }

  const accuracy = submittedAnswers.length > 0 ? Math.round((correctCount / submittedAnswers.length) * 100) : 0;
  const scaledScore = maxPossibleScore > 0 ? Math.round((totalWeightedScore / maxPossibleScore) * 100) : accuracy;

  const topicBreakdown: AssessmentAttempt['topicBreakdown'] = {};
  for (const [topName, stats] of Object.entries(topicStats)) {
    topicBreakdown[topName] = {
      correct: stats.correct,
      total: stats.total,
      percentage: Math.round((stats.correct / stats.total) * 100),
    };
  }

  const attempt: AssessmentAttempt = {
    _id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    subject,
    chapter,
    topic,
    score: scaledScore,
    totalMarks: 100,
    accuracy,
    timeTakenSeconds: totalTimeTaken,
    difficultyProgression,
    answers: detailedAnswers,
    topicBreakdown,
    createdAt: new Date().toISOString(),
  };

  db.assessmentAttempts.unshift(attempt);

  // Update user's knowledge profile
  if (!db.knowledgeProfiles[userId]) {
    db.knowledgeProfiles[userId] = [];
  }
  const userProfile = db.knowledgeProfiles[userId];

  // Find or create knowledge node
  let node = userProfile.find((n) => n.topic === topic || n.topic === chapter);
  const nowStr = new Date().toISOString().split('T')[0];

  if (node) {
    // Bayesian exponential moving average adjustment: 60% historical + 40% new scaled performance
    const newMastery = Math.min(100, Math.max(10, Math.round(node.mastery * 0.55 + scaledScore * 0.45)));
    node.mastery = newMastery;
    node.assessmentsTaken += 1;
    node.lastAssessed = new Date().toISOString();
    node.status = getMasteryStatus(newMastery);
    node.history.push({ date: nowStr, mastery: newMastery });
  } else {
    const status = getMasteryStatus(scaledScore);
    node = {
      topic: topic || chapter,
      subject,
      mastery: scaledScore,
      status,
      assessmentsTaken: 1,
      lastAssessed: new Date().toISOString(),
      history: [{ date: nowStr, mastery: scaledScore }],
    };
    userProfile.push(node);
  }

  // Generate dynamic, stored recommendations based on this outcome
  const newRecs = generateRecommendationsForAssessment(db, userId, subject, topic || chapter, node.mastery, node.status);

  // Send notifications
  createAssessmentNotifications(db, userId, subject, topic || chapter, scaledScore, node.mastery);

  return {
    attempt,
    updatedProfile: userProfile,
    newRecommendations: newRecs,
  };
}

function getMasteryStatus(mastery: number): KnowledgeNode['status'] {
  if (mastery >= 80) return 'MASTERED';
  if (mastery >= 60) return 'GOOD';
  if (mastery >= 40) return 'NEEDS PRACTICE';
  return 'NEEDS ATTENTION';
}

export function generateRecommendationsForAssessment(
  db: DatabaseSchema,
  userId: string,
  subject: string,
  topic: string,
  mastery: number,
  status: KnowledgeNode['status']
): Recommendation[] {
  const newRecs: Recommendation[] = [];

  // Remove stale active recommendations for this specific topic to refresh
  db.recommendations = db.recommendations.filter(
    (r) => !(r.userId === userId && r.topic === topic && !r.completed)
  );

  if (mastery < 50) {
    // High priority remediation
    newRecs.push({
      _id: `rec_${Date.now()}_1`,
      userId,
      type: 'video',
      title: `Concept Reinforcement: Foundational Video on ${topic}`,
      reason: `Your recent assessment scored ${mastery}%. A visual refresher will rebuild your foundation.`,
      subject,
      topic,
      priority: 'high',
      targetUrl: '/videos',
      actionText: 'Watch Recommended Video',
      completed: false,
      createdAt: new Date().toISOString(),
    });

    newRecs.push({
      _id: `rec_${Date.now()}_2`,
      userId,
      type: 'ai_tutor',
      title: `Interactive AI Tutor Deep-Dive for ${topic}`,
      reason: `Ask questions and work through step-by-step examples tailored to your level.`,
      subject,
      topic,
      priority: 'high',
      targetUrl: '/ai-tutor',
      actionText: 'Launch AI Tutor',
      completed: false,
      createdAt: new Date().toISOString(),
    });

    newRecs.push({
      _id: `rec_${Date.now()}_3`,
      userId,
      type: 'practice',
      title: `Low-Difficulty Diagnostic Practice (${topic})`,
      reason: 'Rebuild confidence with guided basic problems.',
      subject,
      topic,
      priority: 'medium',
      targetUrl: '/assessments',
      actionText: 'Start Practice',
      completed: false,
      createdAt: new Date().toISOString(),
    });
  } else if (mastery < 80) {
    // Intermediate reinforcement
    newRecs.push({
      _id: `rec_${Date.now()}_4`,
      userId,
      type: 'practice',
      title: `Medium-Difficulty Problem Set for ${topic}`,
      reason: `You have good fundamentals (${mastery}%). Push towards mastery with multi-step questions.`,
      subject,
      topic,
      priority: 'medium',
      targetUrl: '/assessments',
      actionText: 'Practice Set',
      completed: false,
      createdAt: new Date().toISOString(),
    });

    newRecs.push({
      _id: `rec_${Date.now()}_5`,
      userId,
      type: 'video',
      title: `Advanced Application Video: ${topic}`,
      reason: 'See real-world problem formulations and shortcuts.',
      subject,
      topic,
      priority: 'low',
      targetUrl: '/videos',
      actionText: 'View Video',
      completed: false,
      createdAt: new Date().toISOString(),
    });
  } else {
    // High mastery -> challenge & advance
    newRecs.push({
      _id: `rec_${Date.now()}_6`,
      userId,
      type: 'quiz',
      title: `Olympiad / Challenge Assessment: ${topic}`,
      reason: `Outstanding performance (${mastery}%)! Solidify your mastery with rigorous questions.`,
      subject,
      topic,
      priority: 'medium',
      targetUrl: '/assessments',
      actionText: 'Take Challenge',
      completed: false,
      createdAt: new Date().toISOString(),
    });
  }

  db.recommendations.unshift(...newRecs);
  return newRecs;
}

function createAssessmentNotifications(
  db: DatabaseSchema,
  userId: string,
  subject: string,
  topic: string,
  score: number,
  newMastery: number
) {
  const student = db.users.find((u) => u._id === userId);
  const studentName = student ? student.name : 'Student';

  // Student notification
  const notifStudent: NotificationItem = {
    _id: `notif_${Date.now()}_s`,
    userId,
    title: `Assessment Completed: ${topic}`,
    message: `You scored ${score}%. Your updated Knowledge Profile mastery is now ${newMastery}%. Check your personalized recommendations!`,
    type: 'assessment',
    read: false,
    createdAt: new Date().toISOString(),
  };
  db.notifications.unshift(notifStudent);

  // Parent notification if student is linked
  const linkedParents = db.users.filter(
    (u) => u.role === 'parent' && (u.linkedStudentIds || []).includes(userId)
  );
  for (const parent of linkedParents) {
    const parentAlert: NotificationItem = {
      _id: `notif_${Date.now()}_p_${parent._id}`,
      userId: parent._id,
      title: `${studentName}'s Assessment Result`,
      message: `${studentName} finished a ${subject} assessment (${topic}) scoring ${score}%. Current mastery: ${newMastery}%.`,
      type: score < 50 ? 'alert' : 'achievement',
      read: false,
      createdAt: new Date().toISOString(),
    };
    db.notifications.unshift(parentAlert);
  }

  // Teacher notification
  const teachers = db.users.filter(
    (u) => u.role === 'teacher' && (u.subjectsTaught || []).includes(subject)
  );
  for (const teacher of teachers) {
    const teacherAlert: NotificationItem = {
      _id: `notif_${Date.now()}_t_${teacher._id}`,
      userId: teacher._id,
      title: `Student Activity: ${subject}`,
      message: `${studentName} completed assessment on ${topic} with ${score}% score.`,
      type: 'assessment',
      read: false,
      createdAt: new Date().toISOString(),
    };
    db.notifications.unshift(teacherAlert);
  }
}
