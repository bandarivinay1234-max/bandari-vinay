export type TopicKey = 'python' | 'pandas' | 'numpy' | 'machineLearning' | 'dl' | 'nlp' | 'genai';

export interface TopicScores {
  python: number;
  pandas: number;
  numpy: number;
  machineLearning: number;
  dl: number;
  nlp: number;
  genai: number;
}

export interface WeeklyReport {
  weekNumber: number;
  attendanceRate: number; // percentage 0-100
  quizScore: number;      // score 0-100
  hoursSpent: number;     // actual study hours
  submissionRate: number; // percentage 0-100
  status: 'excellent' | 'good' | 'average' | 'needs-improvement';
}

export interface MonthlyReport {
  month: string;           // e.g., 'Month 1', 'Month 2'
  avgScore: number;        // index-wide score
  completedProjects: number; // count
  overallProgress: number;  // 0-100 percentage
  feedback: string;        // teacher comments
}

export interface StudentImportedData {
  gpa: string;
  priorCodingHours: number;
  primaryDomain: string;
  experienceSummary: string;
  pastedJsonNotes?: string;
  submittedAt: string;
  parsedRecordsCount?: number;
}

export interface InterviewDetail {
  questionNum: number;
  questionText: string;
  studentAnswer: string;
  correctBenchmarkAnswer: string;
  evaluation: string;
}

export interface InterviewAttempt {
  round: number; // 1, 2, or 3
  score: number; // 0-100
  passed: boolean;
  feedback: string;
  strengths: string[];
  improvements: string[];
  history: { role: 'agent' | 'student'; text: string; benchmarkAnswer?: string }[];
  detailedReview?: InterviewDetail[];
  date: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  roleId: string;          // Student ID format (e.g. STU-2026-001)
  batch: string;           // e.g. "Data Science Elite A"
  avatarStyle: string;     // color scheme class
  topics: TopicScores;
  weeklyReports: WeeklyReport[];
  monthlyReports: MonthlyReport[];
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'on-leave';
  isApproved?: boolean;
  dailyQuizScores?: Record<number, number>; // Maps day number (1-200) to raw score (0-5)
  importedData?: StudentImportedData;
  phoneNumber?: string;
  interviews?: Partial<Record<TopicKey, InterviewAttempt[]>>;
}

export interface PreApprovedRecord {
  id: string;
  idNumber: string;
  phoneNumber: string;
  name: string;
  email: string;
  notes?: string;
}

export const TOPIC_LABELS: Record<TopicKey, string> = {
  python: 'Tuple Operations',
  pandas: 'Set Structures',
  numpy: 'Dictionary Mapping',
  machineLearning: 'Object-Oriented OOPs',
  dl: 'Exception Handling',
  nlp: 'Modules & Packages',
  genai: 'Mixed Interview Questions',
};

export const TOPIC_COLORS: Record<TopicKey, string> = {
  python: '#3776AB',
  pandas: '#150458',
  numpy: '#4D77CF',
  machineLearning: '#FF6F61',
  dl: '#8E44AD',
  nlp: '#1ABC9C',
  genai: '#F39C12',
};
