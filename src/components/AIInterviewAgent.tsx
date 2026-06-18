import React, { useState, useEffect } from 'react';
import { Student, TopicKey, InterviewAttempt, TOPIC_LABELS, TOPIC_COLORS } from '../types';
import { 
  Brain, 
  Award, 
  Lock, 
  Unlock, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  MessageSquare, 
  Send, 
  ChevronRight, 
  RefreshCw, 
  Sparkles, 
  BookOpen, 
  ArrowLeft,
  ThumbsUp,
  FileText,
  Clock,
  ShieldCheck,
  UserCheck,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIInterviewAgentProps {
  students: Student[];
  currentStudentId: string;
  userRole: 'teacher' | 'student';
  onUpdateStudent: (updated: Student) => void;
}

const TOPIC_SEQUENCE: TopicKey[] = [
  'python',
  'pandas',
  'numpy',
  'machineLearning',
  'dl',
  'nlp',
  'genai'
];

export default function AIInterviewAgent({
  students,
  currentStudentId,
  userRole,
  onUpdateStudent
}: AIInterviewAgentProps) {
  // Find currently active student
  const activeStudent = students.find(s => s.id === currentStudentId);

  // Topic selection & Session management states
  const [selectedTopic, setSelectedTopic] = useState<TopicKey>('python');
  const [activeSession, setActiveSession] = useState<{
    topic: TopicKey;
    attemptRound: number;
    questionIndex: number; // 0, 1, 2
    transcript: { role: 'agent' | 'student'; text: string }[];
    currentInput: string;
    isSubmitting: boolean;
    lastFeedback: string;
  } | null>(null);

  // Graded assessment output view
  const [selectedReport, setSelectedReport] = useState<{
    topic: TopicKey;
    attempt: InterviewAttempt;
  } | null>(null);

  // Server credentials active states
  const [isGeminiConfigured, setIsGeminiConfigured] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Check backend server config on mount
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setIsGeminiConfigured(!!data.hasGeminiKey);
      })
      .catch(err => {
        console.warn('Could not query secure /api/config context:', err);
      });
  }, []);

  if (!activeStudent) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-md" id="no-student-selected">
        <Brain className="w-14 h-14 text-slate-300 mx-auto mb-4" />
        <h3 className="text-base font-bold text-slate-850">No Student Verified</h3>
        <p className="text-xs text-slate-505 leading-relaxed mt-2">
          Please select or verify a student session in the Portal sidebar first to activate full-stack conversational interviews.
        </p>
      </div>
    );
  }

  // Helper: check if a topic is passed (any attempt with >= 60%)
  const isTopicPassed = (student: Student, topic: TopicKey): boolean => {
    const attempts = student.interviews?.[topic] || [];
    return attempts.some(att => att.score >= 60);
  };

  // Helper: get high score for a topic
  const getTopicHighScore = (student: Student, topic: TopicKey): number => {
    const attempts = student.interviews?.[topic] || [];
    if (attempts.length === 0) return 0;
    return Math.max(...attempts.map(att => att.score));
  };

  // Helper: check if the topic is unlocked
  // Gated sequentially: Unlocked if it is the first ('python') OR the preceding topic is passed (>= 60)
  const isTopicUnlocked = (student: Student, topic: TopicKey): boolean => {
    const index = TOPIC_SEQUENCE.indexOf(topic);
    if (index <= 0) return true; // first topic always unlocked
    const previousTopic = TOPIC_SEQUENCE[index - 1];
    return isTopicPassed(student, previousTopic);
  };

  // Count overall progress statistics
  const passedCount = TOPIC_SEQUENCE.filter(t => isTopicPassed(activeStudent, t)).length;

  // Handle beginning a fresh interview round
  const handleStartInterview = async (topic: TopicKey, round: number) => {
    if (userRole === 'teacher') return; // Teachers cannot write interviews
    setApiError(null);
    setActiveSession({
      topic,
      attemptRound: round,
      questionIndex: 0,
      transcript: [],
      currentInput: '',
      isSubmitting: true,
      lastFeedback: ''
    });

    try {
      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, round })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Server rejected starting request.');

      setActiveSession(prev => prev ? {
        ...prev,
        isSubmitting: false,
        transcript: [{ role: 'agent', text: data.question }]
      }: null);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Connection crashed. Is GEMINI_API_KEY set?');
      setActiveSession(null);
    }
  };

  // Handle continuing conversational response submission
  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !activeSession.currentInput.trim() || activeSession.isSubmitting) return;

    const studentAnswer = activeSession.currentInput.trim();
    const updatedTranscript = [
      ...activeSession.transcript,
      { role: 'student' as const, text: studentAnswer }
    ];

    setActiveSession(prev => prev ? {
      ...prev,
      transcript: updatedTranscript,
      currentInput: '',
      isSubmitting: true
    } : null);

    try {
      // POST content to check if interview completed or request next Q
      const res = await fetch('/api/interview/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeSession.topic,
          history: updatedTranscript,
          studentAnswer
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Evaluation turn failed.');

      // Attach the verified real-world benchmark answer to the student's message
      const studentTurnIndex = updatedTranscript.length - 1;
      if (studentTurnIndex >= 0 && data.correctBenchmarkAnswer) {
        updatedTranscript[studentTurnIndex].benchmarkAnswer = data.correctBenchmarkAnswer;
      }

      if (data.isCompleted) {
        // Run full evaluation
        await handleRunEvaluation(activeSession.topic, activeSession.attemptRound, [
          ...updatedTranscript,
          { role: 'agent' as const, text: `Thank you for your response. Your grading is being generated.` }
        ]);
      } else {
        setActiveSession(prev => prev ? {
          ...prev,
          questionIndex: prev.questionIndex + 1,
          isSubmitting: false,
          lastFeedback: data.feedback,
          transcript: [
            ...updatedTranscript,
            { role: 'agent', text: data.nextQuestion }
          ]
        } : null);
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Transcript pipeline error.');
      setActiveSession(prev => prev ? { ...prev, isSubmitting: false } : null);
    }
  };

  // Execute full transcript grading with strict JSON feedback
  const handleRunEvaluation = async (topic: TopicKey, round: number, finalTranscript: { role: 'agent' | 'student'; text: string; benchmarkAnswer?: string }[]) => {
    if (!activeSession) return;
    try {
      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          history: finalTranscript
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Grading panel failed.');

      // Save evaluation attempt back into active student object
      const freshAttempt: InterviewAttempt = {
        round,
        score: data.score,
        passed: data.passed,
        feedback: data.generalFeedback,
        strengths: data.strengths || [],
        improvements: data.improvements || [],
        history: finalTranscript.filter(t => !t.text.includes("grading is being generated")), // clean history
        detailedReview: data.detailedReview || [],
        date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      };

      const updatedInterviews = { ...(activeStudent.interviews || {}) };
      const previousAttempts = updatedInterviews[topic] || [];
      
      // Filter out existing attempt of the same round just in case of retry
      const filteredAttempts = previousAttempts.filter(att => att.round !== round);
      updatedInterviews[topic] = [...filteredAttempts, freshAttempt].sort((a, b) => a.round - b.round);

      const updatedStudent: Student = {
        ...activeStudent,
        interviews: updatedInterviews
      };

      onUpdateStudent(updatedStudent);
      setSelectedReport({ topic, attempt: freshAttempt });
      setActiveSession(null);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Assessment generation failed.');
      setActiveSession(prev => prev ? { ...prev, isSubmitting: false } : null);
    }
  };

  return (
    <div className="space-y-6" id="ai-interview-module-root">
      {/* Dynamic Header Block */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-600/5 rounded-full blur-2xl -ml-20 -mb-20"></div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-400">
              <Sparkles size={12} className="animate-pulse text-blue-400" />
              <span>Full-Stack AI Interview Panel (Vite + Gemini CJS Bundle)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-none text-white">
              AI Technical Evaluation Center
            </h1>
            <p className="text-xs text-slate-350 leading-relaxed max-w-xl font-medium">
              Validate your actual module competency through strict 3-question live technical interviews. Get assessed on detail, methodology, and coding principles by our automated reviewer.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-[11px] font-mono font-bold text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-800">
                <Clock size={11} className="text-blue-500" /> Wait Scale: ~3-5s
              </span>
              <span className="flex items-center gap-1.5 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-800">
                <ShieldCheck size={11} className="text-emerald-500" /> Pass Grade: 60% Required
              </span>
              <span className="flex items-center gap-1.5 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-800">
                <RefreshCw size={11} className="text-purple-500" /> Attempts: 3 per Subject
              </span>
            </div>
          </div>

          <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 text-center space-y-1.5 shrink-0 min-w-[200px]">
            <div className="w-10 h-10 bg-blue-600/15 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-400 mx-auto">
              <Brain size={20} className="animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Curriculum Cleared</p>
              <h3 className="text-2xl font-black font-mono tracking-tight mt-0.5 text-white">
                {passedCount} <span className="text-xs text-slate-400 font-medium font-mono">/ {TOPIC_SEQUENCE.length}</span>
              </h3>
            </div>
            {/* Simple progress metric */}
            <div className="w-full bg-slate-800/80 h-1 rounded-full p-0 overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                style={{ width: `${(passedCount / TOPIC_SEQUENCE.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="bg-rose-50 border border-rose-150 p-4 rounded-xl flex items-start gap-3 text-xs text-rose-800 font-medium font-sans shadow-sm" id="interview-api-error">
          <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-extrabold text-rose-900">API Pipeline Lockout Detected</p>
            <p className="leading-relaxed">{apiError}</p>
            <p className="text-[10px] text-rose-500 font-semibold font-mono mt-2">
              Note: The AI Interviewer runs real serverside Gemini calls. Ensure you configured your GEMINI_API_KEY in Settings &gt; Secrets first to communicate, then click Verify Key.
            </p>
          </div>
        </div>
      )}

      {/* Conditionally view layout panels based on active states */}
      <AnimatePresence mode="wait">
        {selectedReport ? (
          /* ==================== SCREEN 3: GRADED ACTION REPORT CARD ==================== */
          <motion.div
            key="report-card-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xl shadow-slate-200/30"
            id="evaluation-report-view"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <button
                onClick={() => setSelectedReport(null)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-extrabold pr-3 py-1 cursor-pointer transition-colors"
              >
                <ArrowLeft size={14} /> Back to Topics Grid
              </button>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 font-extrabold uppercase">ASSESSMENT COMPLETED</span>
                <p className="text-xs font-bold text-slate-500 font-mono mt-0.5">{selectedReport.attempt.date}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Left Score Block */}
              <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-6 text-center flex flex-col justify-center items-center space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-800 leading-none">
                    {TOPIC_LABELS[selectedReport.topic]}
                  </h3>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Attempt {selectedReport.attempt.round} Scorecard</p>
                </div>

                <div className="relative flex items-center justify-center">
                  {/* Circular Score Gauge */}
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="54" fill="transparent" stroke="#E2E8F0" strokeWidth="8" />
                    <circle 
                      cx="64" cy="64" r="54" fill="transparent" 
                      stroke={selectedReport.attempt.score >= 60 ? '#10B981' : '#F43F5E'} 
                      strokeWidth="8" 
                      strokeDasharray={2 * Math.PI * 54}
                      strokeDashoffset={2 * Math.PI * 54 * (1 - selectedReport.attempt.score / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black font-mono text-slate-900 leading-none">
                      {selectedReport.attempt.score}%
                    </span>
                    <span className="text-[8px] font-mono font-black text-slate-400 uppercase tracking-wider mt-1">Technical Core</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className={`inline-flex px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                    selectedReport.attempt.passed 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' 
                      : 'bg-rose-50 text-rose-700 border border-rose-250'
                  }`}>
                    {selectedReport.attempt.passed ? 'QUALIFIED (PASS)' : 'UNQUALIFIED (FAIL)'}
                  </span>
                  <p className="text-[10px] text-slate-400 leading-normal max-w-[200px] mx-auto text-center font-semibold">
                    {selectedReport.attempt.passed 
                      ? 'Congratulations! This fulfills academic mastery requisites and unlocks eligibility for standard sequential units.' 
                      : 'Requires minimum 60% score to qualify as competent. Revise the guidelines and retry another available session round.'}
                  </p>
                </div>
              </div>

              {/* Right Assessment Blocks */}
              <div className="md:col-span-2 space-y-5">
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">General Review Overview</h4>
                  <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl text-xs text-slate-700 leading-relaxed font-medium">
                    {selectedReport.attempt.feedback}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
                      <ThumbsUp size={12} /> Demostrated Strengths
                    </h4>
                    <ul className="space-y-1.5">
                      {selectedReport.attempt.strengths.map((str, idx) => (
                        <li key={idx} className="bg-emerald-50/40 border border-emerald-100/60 text-xs text-slate-750 p-3 rounded-lg flex gap-2">
                          <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                          <span className="font-medium leading-normal">{str}</span>
                        </li>
                      ))}
                      {selectedReport.attempt.strengths.length === 0 && (
                        <p className="text-[11px] text-slate-450 italic mt-1 pl-1">No major strengths highlighted.</p>
                      )}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-purple-650 flex items-center gap-1.5">
                      <TargetAndBullet size={12} /> Key Recommendations
                    </h4>
                    <ul className="space-y-1.5">
                      {selectedReport.attempt.improvements.map((imp, idx) => (
                        <li key={idx} className="bg-purple-50/40 border border-purple-100/60 text-xs text-slate-750 p-3 rounded-lg flex gap-2">
                          <span className="text-purple-500 font-bold shrink-0 mt-0.5">Focus</span>
                          <span className="font-medium leading-normal">{imp}</span>
                        </li>
                      ))}
                      {selectedReport.attempt.improvements.length === 0 && (
                        <p className="text-[11px] text-slate-450 italic mt-1 pl-1">Perfect score. No improvements suggested!</p>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>            {/* Question-By-Question Detailed Real-World Review Book */}
            <div className="pt-4 border-t border-slate-150 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-emerald-500" size={18} />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-800">
                  Curriculum Detailed Review & Verified Benchmarks
                </h4>
              </div>

              {selectedReport.attempt.detailedReview && selectedReport.attempt.detailedReview.length > 0 ? (
                <div className="space-y-6">
                  {selectedReport.attempt.detailedReview.map((item, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-mono font-black">
                            {item.questionNum}
                          </span>
                          <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest">
                            Syllabus Element Evaluated
                          </span>
                        </div>
                        <span className="text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 px-2.5 py-1 rounded-full font-black">
                          REAL-WORLD BENCHMARK ACTIVE
                        </span>
                      </div>

                      {/* Question Text */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block font-mono">Question Asked</span>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-sans">
                          {item.questionText}
                        </p>
                      </div>

                      {/* Student Submitted Answer */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold text-blue-500 uppercase tracking-widest block font-mono">Your Submitted Answer</span>
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed bg-blue-50/10 p-4 rounded-xl border border-blue-105/30 whitespace-pre-wrap font-sans">
                          {item.studentAnswer || "(No answer recorded)"}
                        </p>
                      </div>

                      {/* Verified Benchmark Answer */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1 font-mono">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                          Ideal Real-World Validated Answer Key
                        </span>
                        <div className="text-xs font-semibold text-slate-805 leading-relaxed bg-emerald-50/40 p-4 rounded-xl border border-emerald-150 whitespace-pre-wrap font-sans">
                          {item.correctBenchmarkAnswer}
                        </div>
                      </div>

                      {/* Score alignment evaluation check */}
                      <div className="bg-purple-50/50 border border-purple-100 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                        <span className="text-purple-500 text-xs shrink-0 mt-0.5 font-bold">Focus</span>
                        <div>
                          <p className="text-[9px] font-mono leading-none tracking-widest uppercase text-purple-650 font-black mb-1">Alignment Audit Review</p>
                          <p className="font-semibold text-[11px] leading-relaxed text-slate-600">{item.evaluation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Fallback simple log sequence if detailedReview is unavailable */
                <div className="bg-slate-900 rounded-xl p-5 text-white space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="text-blue-400" size={16} />
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-200">Interview Transcript Logs</h4>
                  </div>
                  <div className="space-y-3 font-medium max-h-[350px] overflow-y-auto pr-1">
                    {selectedReport.attempt.history.map((turn, tIdx) => (
                      <div key={tIdx} className={`p-3 rounded-lg border text-xs leading-relaxed ${
                        turn.role === 'agent' 
                          ? 'bg-slate-800/80 border-slate-700/60 text-slate-250 text-left' 
                          : 'bg-blue-900/10 border-blue-900/30 text-blue-250 text-right font-semibold'
                      }`}>
                        <p className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest mb-1">
                          {turn.role === 'agent' ? 'Interviewer Vinay' : `${activeStudent.name}`}
                        </p>
                        <p>{turn.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all hover:shadow-md cursor-pointer uppercase tracking-wider"
              >
                Back to Dashboard Grid
              </button>
            </div>
          </motion.div>
        ) : activeSession ? (
          /* ==================== SCREEN 2: ACTIVE CONVERSATIONAL PORTAL ==================== */
          <motion.div
            key="active-session-view"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-white rounded-3xl border border-slate-200/85 overflow-hidden shadow-2xl shadow-slate-350/20"
            id="active-interview-chat-portal"
          >
            {/* Header Area */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/15 border border-blue-500/30 text-blue-400 rounded-xl flex items-center justify-center">
                  <Bot size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight">{TOPIC_LABELS[activeSession.topic]} Interview</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest font-mono">
                    Attempt Round #{activeSession.attemptRound} / QUESTION {activeSession.questionIndex + 1} OF 3
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono">
                {activeSession.isSubmitting && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-[9px] font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.2 rounded-full uppercase tracking-wider">
                    <span className="w-1 h-1 rounded-full bg-blue-400 animate-ping"></span> Evaluating...
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Abandon current interview attempt? No progress will be saved.")) {
                      setActiveSession(null);
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:text-rose-400 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Terminate Attempt
                </button>
              </div>
            </div>

            {/* Conversation Flow Terminal */}
            <div className="p-6 h-[400px] overflow-y-auto bg-slate-50 space-y-4 flex flex-col justify-between" id="chat-scroller">
              <div className="space-y-4">
                {/* Introduction system prompt banner */}
                <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-2xl flex items-start gap-2.5 text-[11px] text-blue-750 leading-relaxed font-semibold">
                  <Sparkles size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  <p>
                    Please reply to the examiner as accurately as possible. The AI agent evaluates your technical terms, syntax accuracy, and core understanding of {TOPIC_LABELS[activeSession.topic]}. Keep replies practical and robust.
                  </p>
                </div>

                <AnimatePresence initial={false}>
                  {activeSession.transcript.map((turn, tIdx) => (
                    <motion.div
                      key={tIdx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 max-w-4xl ${turn.role === 'agent' ? '' : 'ml-auto flex-row-reverse'}`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold border-l-2 ${
                        turn.role === 'agent' 
                          ? 'bg-slate-900 text-white border-blue-500' 
                          : 'bg-blue-600 text-white border-blue-400 font-mono'
                      }`}>
                        {turn.role === 'agent' ? 'EX' : 'ST'}
                      </div>

                      {/* Msg container to allow rendering correct benchmark key below candidate response */}
                      <div className="space-y-2 max-w-xl">
                        <div className={`p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          turn.role === 'agent' 
                            ? 'bg-white border border-slate-200/90 text-slate-800 text-left' 
                            : 'bg-blue-600 text-white text-left font-semibold'
                        }`}>
                          <p className="text-[9px] font-mono font-black text-slate-450 mb-1">
                            {turn.role === 'agent' ? 'AI Reviewer Vinay' : 'My Response'}
                          </p>
                          <p className="whitespace-pre-wrap">{turn.text}</p>
                        </div>

                        {/* Inline Benchmark Answer Key Display */}
                        {turn.role === 'student' && turn.benchmarkAnswer && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-emerald-50 border border-emerald-250 p-4 rounded-xl text-left text-[11px] leading-relaxed text-slate-800 space-y-1 shadow-sm"
                          >
                            <p className="text-[9px] font-mono font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Verified Real-World Answer Key
                            </p>
                            <p className="text-slate-700 whitespace-pre-wrap font-sans leading-relaxed selection:bg-emerald-100">{turn.benchmarkAnswer}</p>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {activeSession.lastFeedback && !activeSession.isSubmitting && (
                  <div className="border border-emerald-100 bg-emerald-50/50 p-2.5 px-3.5 rounded-xl text-[11px] font-medium text-slate-700 flex items-center gap-2 max-w-lg mt-2">
                    <span className="shrink-0 text-emerald-500 font-bold">✨ Feedback on last:</span>
                    <p className="italic leading-normal text-slate-600">&ldquo;{activeSession.lastFeedback}&rdquo;</p>
                  </div>
                )}

                {activeSession.isSubmitting && (
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border-l-2 border-blue-500 flex items-center justify-center text-white text-xs font-bold font-mono">
                      EX
                    </div>
                    <div className="bg-slate-100 border border-slate-200/60 p-4 rounded-2xl flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest font-mono ml-1">Analyzing transcript...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input area */}
            <form onSubmit={handleSubmitResponse} className="bg-white p-4 border-t border-slate-150">
              <div className="flex gap-3">
                <textarea
                  value={activeSession.currentInput}
                  onChange={(e) => setActiveSession(prev => prev ? { ...prev, currentInput: e.target.value } : null)}
                  placeholder="Type your comprehensive technical answer to the agent here..."
                  disabled={activeSession.isSubmitting}
                  className="flex-1 min-h-[50px] max-h-[120px] bg-slate-55 border border-slate-200 focus:border-blue-500 rounded-2xl p-3 outline-none text-xs font-semibold leading-relaxed text-slate-800 placeholder-slate-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitResponse(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!activeSession.currentInput.trim() || activeSession.isSubmitting}
                  className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-extrabold flex items-center gap-1.5 shrink-0 self-end transition-all shadow-sm disabled:shadow-none cursor-pointer"
                >
                  <span>Submit</span>
                  <Send size={13} />
                </button>
              </div>
              <div className="flex justify-between items-center text-[9px] text-slate-400 font-medium font-mono pt-2 pl-1 uppercase tracking-wide">
                <span>Hold SHIFT+ENTER to insert newline</span>
                <span>Wait pipeline active</span>
              </div>
            </form>
          </motion.div>
        ) : (
          /* ==================== SCREEN 1: THE ACCESSIBLE SUBJECT GRID ==================== */
          <motion.div
            key="dashboard-overview-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Subject Selector & Quick Progress Board */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Selector List */}
              <div className="lg:col-span-1 space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80">
                <div className="px-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-loose">
                  Curriculum Unit Sequence
                </div>

                <div className="space-y-2">
                  {TOPIC_SEQUENCE.map((topic, i) => {
                    const isUnlocked = isTopicUnlocked(activeStudent, topic);
                    const isPassed = isTopicPassed(activeStudent, topic);
                    const matchesSelected = selectedTopic === topic;
                    const highGrade = getTopicHighScore(activeStudent, topic);

                    return (
                      <button
                        key={topic}
                        onClick={() => setSelectedTopic(topic)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs flex items-center justify-between gap-3 cursor-pointer ${
                          matchesSelected
                            ? 'bg-slate-900 border-slate-900 text-white font-bold shadow-md shadow-slate-900/10'
                            : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Circle dot indicators */}
                          <span 
                            className="w-2 h-2 rounded-full shrink-0" 
                            style={{ backgroundColor: matchesSelected ? '#3B82F6' : TOPIC_COLORS[topic] }}
                          ></span>
                          <div className="space-y-0.5">
                            <p className="font-bold">{TOPIC_LABELS[topic]}</p>
                            <p className={`text-[10px] uppercase font-mono tracking-wider font-extrabold ${matchesSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                              Module {i + 1}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isPassed ? (
                            <span className="text-[10px] font-bold font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                              ✓ {highGrade}%
                            </span>
                          ) : highGrade > 0 ? (
                            <span className="text-[10px] font-bold font-mono text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-lg">
                              {highGrade}%
                            </span>
                          ) : !isUnlocked ? (
                            <Lock size={12} className={matchesSelected ? 'text-slate-600' : 'text-slate-400'} />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Topic Details & Attempt Matrix */}
              <div className="lg:col-span-2 space-y-6">
                {(() => {
                  const isUnlocked = isTopicUnlocked(activeStudent, selectedTopic);
                  const isPassed = isTopicPassed(activeStudent, selectedTopic);
                  const topicAttempts = activeStudent.interviews?.[selectedTopic] || [];
                  const sequenceIndex = TOPIC_SEQUENCE.indexOf(selectedTopic);

                  return (
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6">
                      {/* Topic Title card header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span 
                            className="inline-block w-4 h-1.5 rounded-full"
                            style={{ backgroundColor: TOPIC_COLORS[selectedTopic] }}
                          ></span>
                          <h2 className="text-lg font-black tracking-tight text-slate-800 leading-tight">
                            {TOPIC_LABELS[selectedTopic]} Assessment
                          </h2>
                          <p className="text-xs text-slate-500 font-medium">
                            Unit sequential progression item {sequenceIndex + 1} of {TOPIC_SEQUENCE.length}.
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-3 py-1.5 rounded-xl uppercase tracking-wider ${
                            isPassed 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' 
                              : isUnlocked
                                ? 'bg-blue-50 text-blue-700 border border-blue-150'
                                : 'bg-slate-50 text-slate-500 border border-slate-150'
                          }`}>
                            {isPassed ? (
                              <><CheckCircle size={11} /> Passed Module</>
                            ) : isUnlocked ? (
                              <><Unlock size={11} /> Eligible</>
                            ) : (
                              <><Lock size={11} /> Locked</>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* locked notification card */}
                      {!isUnlocked && (
                        <div className="bg-slate-50 border border-slate-200 text-xs p-5 rounded-xl space-y-3 font-semibold text-slate-600">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                            <Lock size={18} />
                          </div>
                          <div className="space-y-1">
                            <p className="font-extrabold text-slate-800">Unit Study Progress Locked</p>
                            <p className="font-medium text-slate-500 leading-relaxed">
                              You are currently not eligible to start this interview panel. To unlock this module, you must first pass the preceding academic level: <strong className="text-slate-800">{TOPIC_LABELS[TOPIC_SEQUENCE[sequenceIndex - 1]]}</strong> with a minimum score of <strong className="text-emerald-600">60%</strong>.
                            </p>
                          </div>
                        </div>
                      )}

                      {isUnlocked && (
                        <div className="space-y-5">
                          {/* Requisites reminder */}
                          <div className="bg-blue-50/50 border border-blue-100/60 p-4 rounded-xl text-xs text-slate-700 leading-relaxed font-semibold">
                            <h4 className="text-blue-900 font-bold mb-1">📋 Assessment Regulations</h4>
                            <p className="font-medium text-[11px] text-slate-600 leading-relaxed">
                              Each student can write the interview up to 3 separate times (Round 1, Round 2, Round 3). Scoring a minimum of <strong>60%</strong> in <strong>any</strong> attempt qualifies the subject and authorizes immediate access to subsequent curriculum locks!
                            </p>
                          </div>

                          {/* Round 1-2-3 Slots Matrix Grid */}
                          <div className="space-y-3.5">
                            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Interview Sessions Logs</h4>

                            <div className="space-y-3">
                              {[1, 2, 3].map((round) => {
                                const attemptObj = topicAttempts.find(att => att.round === round);
                                const isRoundAvailable = isUnlocked && (!attemptObj || attemptObj.score < 60);

                                return (
                                  <div 
                                    key={round}
                                    className={`p-4 border rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 transition-all ${
                                      attemptObj
                                        ? attemptObj.score >= 60
                                          ? 'bg-emerald-50/20 border-emerald-100/60 hover:bg-emerald-50/30'
                                          : 'bg-rose-50/20 border-rose-100/60 hover:bg-rose-50/30'
                                        : 'bg-slate-50/40 border-slate-200 hover:bg-slate-50/80 hover:shadow-xs'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3.5 text-xs">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono transition-colors shrink-0 ${
                                        attemptObj
                                          ? attemptObj.score >= 60
                                            ? 'bg-emerald-500 border border-emerald-400/30 text-white'
                                            : 'bg-rose-500 border border-rose-400/30 text-white'
                                          : 'bg-slate-200 text-slate-700'
                                      }`}>
                                        R{round}
                                      </div>

                                      <div className="space-y-1">
                                        <h5 className="font-black text-slate-800">
                                          Session Attempt Round {round}
                                        </h5>
                                        <p className="text-[10px] text-slate-450 font-bold font-mono">
                                          {attemptObj 
                                            ? `Scored ${attemptObj.score}% on ${attemptObj.date}` 
                                            : 'No evaluation records on database.'}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                      {/* Status display */}
                                      {attemptObj ? (
                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() => setSelectedReport({ topic: selectedTopic, attempt: attemptObj })}
                                            className="px-3.5 py-1.5 border border-slate-200 hover:bg-white text-slate-600 hover:text-slate-800 font-extrabold text-[10px] rounded-lg cursor-pointer transition-colors"
                                          >
                                            View Report card
                                          </button>
                                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase font-mono ${
                                            attemptObj.score >= 60 
                                              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200/50' 
                                              : 'bg-rose-500/10 text-rose-600 border border-rose-200/50'
                                          }`}>
                                            {attemptObj.score >= 60 ? 'PASS' : 'FAIL'}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-[10px] text-slate-400 font-bold font-mono uppercase bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg">
                                          Untested
                                        </span>
                                      )}

                                      {/* Play / retry button */}
                                      {userRole === 'student' && isRoundAvailable && (
                                        <button
                                          type="button"
                                          onClick={() => handleStartInterview(selectedTopic, round)}
                                          className="px-4 py-1.5 bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1 cursor-pointer transition-all shrink-0 hover:scale-101 hover:shadow-sm"
                                        >
                                          <Play size={10} fill="currentColor" /> {attemptObj ? 'Retry' : 'Start'}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple bullet helper component
function TargetAndBullet({ className, size }: { className?: string; size: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
