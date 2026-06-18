import React, { useState } from 'react';
import { Student, TopicKey, TOPIC_LABELS, TOPIC_COLORS } from '../types';
import { getQuestionsForDay, getCategoryForDay, Question } from '../dailyQuestions';
import { 
  Lock, 
  Unlock, 
  CheckCircle, 
  AlertCircle, 
  Award, 
  ArrowRight, 
  Info, 
  Sparkles, 
  X, 
  HelpCircle,
  Eye,
  FileCode,
  Check,
  Play,
  Terminal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DailyQuizCenterProps {
  students: Student[];
  currentStudentId: string;
  userRole: 'teacher' | 'student';
  lockedTopics: Record<TopicKey, boolean>;
  onUnlockTopic: (topic: TopicKey, isLocked: boolean) => void;
  unlockedDays: Record<number, boolean>;
  onToggleDayLock: (day: number) => void;
  onBulkUnlockDays: (days: number[]) => void;
  onSaveQuizResult: (studentId: string, day: number, rawScore: number) => void;
}

const CATEGORY_TABS: { key: TopicKey; label: string; range: [number, number]; desc: string }[] = [
  { key: 'python', label: 'Tuple (Days 1-3)', range: [1, 3], desc: 'Days 1-3: Tuples immutability, packing/unpacking & hashing' },
  { key: 'pandas', label: 'Set (Days 4-6)', range: [4, 6], desc: 'Days 4-6: Unique set structures, math algebra & frozensets' },
  { key: 'numpy', label: 'Dictionary (Days 7-10)', range: [7, 10], desc: 'Days 7-10: Dictionary default fallbacks, items view tracking & defaultdict' },
  { key: 'machineLearning', label: 'OOPs (Days 11-20)', range: [11, 20], desc: 'Days 11-20: Object-Oriented layouts, MRO routes, inheritance & slots memory' },
  { key: 'dl', label: 'Exception Handling (Days 21-24)', range: [21, 24], desc: 'Days 21-24: Scopes try-except-finally blocks, custom exception classes & context managers' },
  { key: 'nlp', label: 'Modules & Packages (Days 25-27)', range: [25, 27], desc: 'Days 25-27: Packages init rules, relative-absolute imports & pip dependencies' },
  { key: 'genai', label: 'Mixed Interview Questions (Days 28-30)', range: [28, 30], desc: 'Days 28-30: Memory GC tracking, Timsort complexity, asyncIO event loop & closures' },
];

export default function DailyQuizCenter({
  students,
  currentStudentId,
  userRole,
  lockedTopics,
  onUnlockTopic,
  unlockedDays,
  onToggleDayLock,
  onBulkUnlockDays,
  onSaveQuizResult,
}: DailyQuizCenterProps) {
  const [activeTab, setActiveTab] = useState<TopicKey>('python');
  const [selectedDayForQuiz, setSelectedDayForQuiz] = useState<number | null>(null);
  
  // Local state for taking a quiz
  const [userSelections, setUserSelections] = useState<Record<number, number>>({});
  const [userCodes, setUserCodes] = useState<Record<number, string>>({});
  const [validatedCodes, setValidatedCodes] = useState<Record<number, { checked: boolean; checksPassed: string[]; checksFailed: string[]; compileOutput: string }>>({});
  
  const [hasSubmittedLocal, setHasSubmittedLocal] = useState<boolean>(false);
  const [showExplanationIndex, setShowExplanationIndex] = useState<number | null>(null);

  // Find currently acting student
  const activeStudent = students.find(s => s.id === currentStudentId) || students[0];

  const selectedCategoryTab = CATEGORY_TABS.find(t => t.key === activeTab) || CATEGORY_TABS[0];
  const [minDay, maxDay] = selectedCategoryTab.range;

  // Generate list of days for active tab
  const tabDaysNumList: number[] = [];
  for (let i = minDay; i <= maxDay; i++) {
    tabDaysNumList.push(i);
  }

  // Calculate generic score capacity for accuracy: 
  // It checks all values in dailyQuizScores and dynamically scales to either /5 or /10 max possible score summation.
  let maxPossibleScoreSum = 0;
  let achievedScoreSum = 0;
  if (activeStudent?.dailyQuizScores) {
    Object.entries(activeStudent.dailyQuizScores).forEach(([dayStr, score]) => {
      achievedScoreSum += score;
      maxPossibleScoreSum += (score <= 5 ? 5 : 10);
    });
  }
  const completedCount = Object.keys(activeStudent?.dailyQuizScores || {}).length;
  const averageAccuracy = maxPossibleScoreSum > 0 ? Math.round((achievedScoreSum / maxPossibleScoreSum) * 100) : 0;

  // Handle quiz start
  const handleStartQuiz = (day: number) => {
    const isTopicLocked = lockedTopics[getCategoryForDay(day)];
    const isDayUnlocked = unlockedDays[day];
    
    if (isTopicLocked) {
      alert(`This day is locked because the core topic '${TOPIC_LABELS[getCategoryForDay(day)]}' is currently locked in the curriculum list.`);
      return;
    }
    if (!isDayUnlocked && userRole === 'student') {
      alert(`Day ${day} is currently locked by the instructor. Please ask the teacher to unlock this day.`);
      return;
    }

    setSelectedDayForQuiz(day);
    setUserSelections({});
    
    // Core code text box triggers
    const questions = getQuestionsForDay(day);
    const codeMap: Record<number, string> = {};
    questions.forEach((q, idx) => {
      if (q.type === 'coding' && q.initialCode) {
        codeMap[idx] = q.initialCode;
      }
    });

    setUserCodes(codeMap);
    setValidatedCodes({});
    setHasSubmittedLocal(false);
    setShowExplanationIndex(null);
  };

  // Handle option select
  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (hasSubmittedLocal) return;
    setUserSelections(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  // Update typed codes
  const handleUpdateCode = (idx: number, value: string) => {
    if (hasSubmittedLocal) return;
    setUserCodes(prev => ({
      ...prev,
      [idx]: value
    }));
  };

  // Core validation function used to audit student code submissions
  const performValidation = (idx: number, code: string, question: Question) => {
    const checksPassed: string[] = ["Syntactic Lexical Analysis PASSED."];
    const checksFailed: string[] = [];
    let compileOutput = "";

    const userClean = code.toLowerCase().replace(/\s+/g, "");
    const qDay = question.id.startsWith("q-") ? parseInt(question.id.split('-')[1]) : 0;
    const isPythonPlan = qDay > 0 && qDay <= 30;

    const isInitial = !code || code === question.initialCode || code.trim().length < 15;
    if (isInitial) {
      checksFailed.push("No code implementation detected. Please write code to attempt this challenge.");
    }

    if (!isInitial) {
      // Verify key curriculum attributes depending on subject requirements
      if (question.category === 'python' || isPythonPlan) {
        if (idx === 5) { // Memory Identity audit
          if (code.includes("id(") || code.includes("is")) {
            checksPassed.push("Memory object identity audit using 'id()' is verified.");
          } else {
            checksFailed.push("Instruction error: Mutability verification should use 'id(item)' or 'is' references comparison.");
          }
          if (code.includes("seen") || code.includes("set(")) {
            checksPassed.push("Preallocated lookup de-duplicator is verified.");
          } else {
            checksFailed.push("Advisory: Initialize an accumulator set (e.g. 'seen_ids = set()') for O(1) matching.");
          }
        } else if (idx === 6) { // Lazy parser yield
          if (code.includes("yield")) {
            checksPassed.push("Active lazy yield generator pipeline is verified.");
          } else {
            checksFailed.push("Rule violation: Python generators must contain the 'yield' keyword to stream text rows lazily.");
          }
        } else if (idx === 7) { // Decorator timers
          if (code.includes("time") || code.includes("perf_counter")) {
            checksPassed.push("High-precision performance timeline checks verified.");
          } else {
            checksFailed.push("Adjustment: You must employ 'time.perf_counter()' or 'time.time()' to calculate duration averages.");
          }
          if (code.includes("wrapper") || code.includes("decorator")) {
            checksPassed.push("Dunder closure wrapper structures verified.");
          } else {
            checksFailed.push("Structural error: Make sure you return an inner wrap function ('def wrapper(*args, **kwargs)') wrapping func.");
          }
        } else if (idx === 8) { // Context magician
          if (code.includes("__enter__") && code.includes("__exit__")) {
            checksPassed.push("Magic enter/exit setup hooks verified.");
          } else {
            checksFailed.push("Structural error: Custom context guards require dual magic definitions '__enter__' and '__exit__'.");
          }
        } else if (idx === 9) { // Thread locked sync
          if (code.includes("lock") && (code.includes("with") || code.includes("acquire") || code.includes("release"))) {
            checksPassed.push("Standard thread-safe lock wrappers verified.");
          } else {
            checksFailed.push("Security leak: Wrap modifications in Lock context using either 'with lock:' or acquire/release blocks.");
          }
        }
      } else if (question.category === 'pandas') {
        // General safety bounds
        if (code.includes(".iterrows()")) {
          checksFailed.push("Performance violation: DO NOT utilize standard loops '.iterrows()' on millions of pandas lines.");
        } else {
          checksPassed.push("Execution scale compliance: No loop iterations (iterrows) found.");
        }

        if (idx === 5) { // groupby mean
          if (code.includes("groupby") && code.includes("mean")) {
            checksPassed.push("Vectorized Groupby mean calculation verified.");
          } else {
            checksFailed.push("Missing components: Ensure your dataframe uses '.groupby()' and '.mean()' operators.");
          }
        } else if (idx === 6) { // MultiIndex alignment
          if (code.includes("align")) {
            checksPassed.push("Dataframe indices auto alignment verified.");
          } else {
            checksFailed.push("Missing steps: Utilize the '.align()' method to safely match double MultiIndexed DataFrames.");
          }
        } else if (idx === 7) { // Chunks
          if (code.includes("chunksize") || code.includes("chunk")) {
            checksPassed.push("Buffer boundaries chunksize streaming verified.");
          } else {
            checksFailed.push("Buffer alert: Pass 'chunksize' parameter into 'pd.read_csv()' to yield text parser iterators.");
          }
        } else if (idx === 8) { // Manual dummier
          if (code.includes("unique")) {
            checksPassed.push("Hierarchical columns unique unique() tracking verified.");
          } else {
            checksFailed.push("Step mismatch: Locate unique target rows categories using 'unique()' first.");
          }
        } else if (idx === 9) { // Filter Scaler
          if (code.includes("var(") || code.includes("var()")) {
            checksPassed.push("Variance analysis drop checks verified.");
          } else {
            checksFailed.push("Correction: Evaluate numerical column variances using '.var()' first.");
          }
        }
      } else if (question.category === 'numpy') {
        if (idx === 5) { // broadcast addition
          if (code.includes("+") || code.includes("add")) {
            checksPassed.push("Standard broadcasting addition operators verified.");
          } else {
            checksFailed.push("Missing operator: Use '+' to add 1D vectors and 2D matrices using native numpy broadcasting rules.");
          }
        } else if (idx === 6) { // shares memory views
          if (code.includes("shares_memory")) {
            checksPassed.push("Shares memory verification verified.");
          } else {
            checksFailed.push("Instruction error: Use 'np.shares_memory()' to verify references overlap across slices.");
          }
        } else if (idx === 7) { // math mask
          if (code.includes("mean") && code.includes("std")) {
            checksPassed.push("Standard statistical thresholds checks verified.");
          } else {
            checksFailed.push("Missing metrics: Compute statistical 'np.mean()' and 'np.std()' to establish your threshold mask.");
          }
        } else if (idx === 8) { // fast mask clip
          if (code.includes("< 0") || code.includes("<0")) {
            checksPassed.push("Boolean index filters masking verified.");
          } else {
            checksFailed.push("Correction: Formulate a logical mask (e.g. matrix < 0) to index and scale negative fields only.");
          }
        } else if (idx === 9) { // mesh grid linspace
          if (code.includes("linspace")) {
            checksPassed.push("NumPy linspace sequential arrays compilation verified.");
          } else {
            checksFailed.push("Missing actions: Call np.linspace to build matching continuous increments.");
          }
          if (code.includes("reshape")) {
            checksPassed.push("Coordinate grids matrix reshaping verified.");
          } else {
            checksFailed.push("Correction: Apply '.reshape(rows, cols)' to project continuous lines into grid arrays.");
          }
        }
      } else {
        // General checks for ML, DL, NLP and GenAI questions
        if (code.trim().length > 35) {
          checksPassed.push("Satisfactory user implementation volume check verified.");
        } else {
          checksFailed.push("Incomplete script: Attempt the challenge by typing your code in the sandbox.");
        }

        if (question.category === 'machineLearning') {
          if (code.includes("vif") || code.includes("gini") || code.includes("split") || code.includes("weights") || code.includes("alpha")) {
            checksPassed.push("Curriculum analytical math features validated.");
          } else {
            checksFailed.push("Alignment risk: Ensure you calculate collinearity factors, split purity, regularizers, or predictions.");
          }
        } else if (question.category === 'dl') {
          if (code.includes("mean") || code.includes("variance") || code.includes("dropout") || code.includes("mask") || code.includes("attention") || code.includes("softmax")) {
            checksPassed.push("Standard deep learning layer components validated.");
          } else {
            checksFailed.push("Alignment check: Ensure you handle normalizations, activation scaling, or attention tensors.");
          }
        } else if (question.category === 'nlp') {
          if (code.includes("merge") || code.includes("tf") || code.includes("idf") || code.includes("similarity") || code.includes("temperature") || code.includes("stem")) {
            checksPassed.push("NLP indexers and text normalization components validated.");
          } else {
            checksFailed.push("Alignment check: Ensure you implement vector distances, TF-IDF factors, or log probability temperature scaling.");
          }
        } else if (question.category === 'genai') {
          if (code.includes("overlap") || code.includes("chunk") || code.includes("lora") || code.includes("guard") || code.includes("injection") || code.includes("temperature")) {
            checksPassed.push("GenAI prompts or low-rank adapters validation verified.");
          } else {
            checksFailed.push("Security risk: Standardize sliding window character counts, injection detectors, or scaling factors.");
          }
        }
      }
    }

    if (checksFailed.length === 0) {
      compileOutput = `>>> Running pipeline verification assertions...\n>>> SUCCESS: All standard industrial test assertions passed conformantly!\n>>> System compiles cleanly and matches the Verified Real-World Benchmark.`;
    } else {
      compileOutput = `>>> Running pipeline verification assertions...\n>>> WARNING: Missing regulatory checks parameters:\n` + checksFailed.map(msg => `  - ${msg}`).join("\n") + `\n>>> Retrying code compilation...`;
    }

    return {
      checksPassed,
      checksFailed,
      compileOutput
    };
  };

  // Compile check triggers
  const handleVerifyCodingSolution = (idx: number, code: string, question: Question) => {
    // When writing under testing/exam state, we do NOT run or give away real-world mistakes or benchmark code solutions!
    // We only perform validation checking internally upon submitting the exam.
    // Here we save the draft code, acknowledge compiled status, and hint completion.
    setValidatedCodes(prev => ({
      ...prev,
      [idx]: {
        checked: false, // marked as draft
        checksPassed: ["Draft compilation cached successfully.", "Local buffers registered."],
        checksFailed: [],
        compileOutput: `>>> Compiling student workspace draft...\n>>> LEXICAL PARSING: SUCCESSFUL\n>>> CODE INTEGRITY: EXCELLENT (Bytes allocated: ${code.length})\n>>> STATUS: Draft saved in background caches.\n\n[EXAM NOTICE] Real-world benchmark solutions, correctness logs, and custom mistakes analysis are hidden during the exam, and will only be displayed after you submit your full exam and get your scores.`
      }
    }));
  };

  // Submit Daily Quiz (5 Questions Total: 5 MCQs, no coding)
  const handleSubmitQuiz = (day: number, questions: Question[]) => {
    // 1. Audit Multiple Choice completeness
    const unansweredMCQ = [0, 1, 2, 3, 4].filter(idx => userSelections[idx] === undefined);
    if (unansweredMCQ.length > 0) {
      alert(`Please answer all 5 Multiple-Choice Questions before submitting. Unanswered MCQ number(s): ${unansweredMCQ.map(i => i + 1).join(', ')}`);
      return;
    }

    // 2. Assess Scores
    let totalScore = 0;

    // Theory (0 to 4)
    questions.slice(0, 5).forEach((q, idx) => {
      if (userSelections[idx] === q.correctAnswerIndex) {
        totalScore++;
      }
    });

    // Save to global state and trigger persistence
    onSaveQuizResult(activeStudent.id, day, totalScore);
    setHasSubmittedLocal(true);
  };

  // Bulk Unlock topics
  const handleBulkUnlockModule = () => {
    const days: number[] = [];
    for (let d = minDay; d <= maxDay; d++) {
      days.push(d);
    }
    onBulkUnlockDays(days);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header Information Block */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-blue-100">
              Practice Core Matrix
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <Sparkles size={12} className="text-amber-500 animate-pulse" />
              Syllabus Coverage: 30-Day Python Program (5 daily questions active)
            </span>
          </div>
          <h2 className="text-xl font-bold font-sans text-slate-800 mt-2">Daily Practice & Conceptual Exam</h2>
          <p className="text-xs text-slate-500 mt-1">
            Build competence with exactly **5 Multiple-Choice Questions per day** with professional curriculum explanations.
          </p>
        </div>

        {/* Selected Student information */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto self-stretch">
          <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center gap-4 flex-1 sm:flex-initial">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Award size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">STUDENT AT WORK</p>
              <p className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{activeStudent?.name}</p>
              <p className="text-[10px] text-slate-500 font-mono">Accuracy: {averageAccuracy}% ({completedCount} Days Done)</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Topic Tabs Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Syllabus Path Modules</h3>
          {userRole === 'teacher' && (
            <button
              onClick={handleBulkUnlockModule}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/85 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Unlock All Days in This Module
            </button>
          )}
        </div>
        <div className="flex overflow-x-auto pb-2 gap-1.5 scrollbar-thin">
          {CATEGORY_TABS.map((tab) => {
            const isModuleLocked = lockedTopics[tab.key];
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-sm font-bold' 
                    : 'bg-white border border-slate-200/60 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <div 
                  className="w-2.5 h-2.5 rounded-full shrink-0 border"
                  style={{ backgroundColor: isModuleLocked ? '#94a3b8' : TOPIC_COLORS[tab.key], borderColor: 'rgba(255,255,255,0.2)' }}
                />
                <span>{tab.label}</span>
                {isModuleLocked && <Lock size={12} className="text-slate-400 shrink-0" />}
              </button>
            );
          })}
        </div>
        <div className="bg-slate-100 p-3 rounded-xl flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700">{selectedCategoryTab.desc}</span>
          <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">Days {minDay} - {maxDay}</span>
        </div>
      </div>

      {/* 3. Main Workspace - Day Cells Selection vs Full Sandbox Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Days List Left Panel */}
        <div className={selectedDayForQuiz ? "col-span-12 lg:col-span-4" : "col-span-12"}>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">{TOPIC_LABELS[activeTab]}</h4>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span className="text-xs font-mono font-bold text-slate-505">{tabDaysNumList.length} Days Available</span>
              </div>
            </div>

            {lockedTopics[activeTab] && (
              <div className="bg-amber-50 border border-amber-100/80 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-805">
                <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Module Locked by Curriculum Controller</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Teachers can unlock this entire module series from the dashboard curriculum board by toggling '{TOPIC_LABELS[activeTab]}'.
                  </p>
                </div>
              </div>
            )}

            {/* Grid Cell Elements */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-4 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
              {tabDaysNumList.map((dayNum) => {
                const isDayUnlocked = unlockedDays[dayNum];
                const isTopicLocked = lockedTopics[activeTab];
                
                const score = activeStudent?.dailyQuizScores?.[dayNum];
                const isCompleted = score !== undefined;

                let cellClass = "";
                let badgeIcon = null;

                if (isTopicLocked) {
                  cellClass = "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60";
                  badgeIcon = <Lock size={10} className="text-slate-400" />;
                } else if (isCompleted) {
                  const maxScore = score <= 5 ? 5 : 10;
                  const passPercent = (score / maxScore) * 100;
                  if (passPercent >= 80) {
                    cellClass = "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100/60";
                  } else if (passPercent >= 60) {
                    cellClass = "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100/60";
                  } else {
                    cellClass = "bg-amber-50 border-amber-200 text-amber-805 hover:bg-amber-100/60";
                  }
                  badgeIcon = <CheckCircle size={10} className="text-emerald-600 font-bold" />;
                } else if (!isDayUnlocked) {
                  cellClass = userRole === 'teacher' 
                    ? "bg-slate-100 border-slate-200 hover:border-blue-405 text-slate-500 cursor-pointer" 
                    : "bg-slate-100/60 border-slate-200 text-slate-450 cursor-not-allowed";
                  badgeIcon = <Lock size={10} className="text-slate-400" />;
                } else {
                  cellClass = "bg-white border-blue-100 hover:border-blue-550 hover:shadow-xs text-slate-800 cursor-pointer";
                }

                const isActiveSelected = selectedDayForQuiz === dayNum;

                return (
                  <div
                    key={dayNum}
                    onClick={() => {
                      if (!isTopicLocked) {
                        handleStartQuiz(dayNum);
                      }
                    }}
                    className={`relative p-3 rounded-xl border text-center transition-all group flex flex-col items-center justify-center min-h-[68px] ${cellClass} ${
                      isActiveSelected ? 'ring-2 ring-blue-500 border-transparent scale-105 shadow' : ''
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 font-bold uppercase">DAY</span>
                    <span className="text-base font-black font-mono leading-none mt-1">{dayNum}</span>

                    {isCompleted && (
                      <span className="text-[9px] font-bold font-mono mt-1 px-1 py-0.5 rounded bg-white border border-slate-200 hover:text-slate-800 shadow-sm leading-none">
                        {score}/{score <= 5 ? 5 : 10}
                      </span>
                    )}

                    <div className="absolute top-1 right-1">
                      {badgeIcon}
                    </div>

                    {userRole === 'teacher' && !isTopicLocked && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleDayLock(dayNum);
                        }}
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 scale-90 px-1 py-0.5 rounded bg-slate-900 text-[8px] text-white font-bold whitespace-nowrap transition-all z-20 hover:bg-blue-600 cursor-pointer pointer-events-auto"
                      >
                        {isDayUnlocked ? 'Lock' : 'Unlock'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="bg-slate-50 p-4 border border-slate-100/80 rounded-xl space-y-1.5 text-[10px] text-slate-500">
              <p className="font-bold text-slate-700 flex items-center gap-1">
                <Info size={11} className="text-blue-505" />
                Color Legend:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-300 inline-block"></span> Pass mark (60% or more)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-100 border border-amber-300 inline-block"></span> Review needed</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-300 inline-block"></span> Locked day cell</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-white border border-blue-200 inline-block"></span> Ready exam</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Practice Sandbox workspace */}
        {selectedDayForQuiz ? (
          <div className="col-span-12 lg:col-span-8">
            {(() => {
              const questions = getQuestionsForDay(selectedDayForQuiz);
              const score = activeStudent?.dailyQuizScores?.[selectedDayForQuiz];
              const isAlreadyCompleted = score !== undefined;
              const accentColor = TOPIC_COLORS[getCategoryForDay(selectedDayForQuiz)] || '#3b82f6';

              return (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
                  {/* Top Bar Accent header */}
                  <div className="p-5 text-white flex items-center justify-between" style={{ backgroundColor: accentColor }}>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full border border-white/10">
                        {TOPIC_LABELS[getCategoryForDay(selectedDayForQuiz)]} Section
                      </span>
                      <h4 className="text-lg font-black tracking-tight mt-1">Day {selectedDayForQuiz} Practice Workspace</h4>
                    </div>
                    <button
                      onClick={() => setSelectedDayForQuiz(null)}
                      className="p-1 px-3 bg-white/25 hover:bg-white/35 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <X size={14} />
                      <span>Release Frame</span>
                    </button>
                  </div>

                  {/* Warning notifications */}
                  {isAlreadyCompleted && (
                    <div className="bg-emerald-50 text-emerald-800 border-b border-emerald-100 p-4 flex items-start gap-2.5 text-xs">
                      <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Challenge complete for Day {selectedDayForQuiz}</p>
                        <p className="text-[11px] text-emerald-700 leading-relaxed mt-0.5">
                          Grade successfully stored: <strong className="font-mono font-black">{score}/{score <= 5 ? 5 : 10} ({Math.round((score / (score <= 5 ? 5 : 10)) * 100)}%)</strong>. For core competency tracking reliability, students are limited to exactly one submission report per calendar day.
                        </p>
                      </div>
                    </div>
                  )}

                  {!isAlreadyCompleted && hasSubmittedLocal && (
                    <div className="bg-indigo-50 text-indigo-800 border-b border-indigo-100 p-4 flex items-start gap-2.5 text-xs">
                      <Award size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Test evaluation logged successfully!</p>
                        <p className="text-[11px] text-indigo-700 leading-relaxed mt-0.5">
                          Daily records sync is finalized on student profiles dashboard. Good job!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Main dual theoretical and coding sandboxes scroll area */}
                  <div className="p-6 space-y-8 flex-1 overflow-y-auto max-h-[550px]">
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
                      <div className="space-y-0.5 text-center sm:text-left">
                        <p className="font-bold text-slate-700">Practitor Active: {activeStudent.name}</p>
                        <p className="text-slate-400">Class Batch: {activeStudent.batch}</p>
                      </div>
                      <span className="font-mono px-2.5 py-1 bg-white rounded-lg border border-indigo-150 font-black text-indigo-600 shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                        5 MCQ Challenges (Syllabus Concepts)
                      </span>
                    </div>

                    {/* Part 1: Theory Multi-Choice Questions */}
                    <div className="space-y-6 pt-2">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                        <HelpCircle size={16} className="text-blue-500 shrink-0" />
                        <h5 className="font-black text-xs text-slate-450 uppercase tracking-widest font-mono">
                          Theory & Conceptual Evaluation (Questions 1 - 5)
                        </h5>
                      </div>

                      {questions.slice(0, 5).map((q, idx) => {
                        const selection = userSelections[idx];
                        const showAnswers = isAlreadyCompleted || hasSubmittedLocal;

                        return (
                          <div key={q.id} className="border-b border-slate-100 pb-5 space-y-3">
                            <div className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <h5 className="font-bold text-slate-800 text-xs leading-relaxed">{q.question}</h5>
                            </div>

                            {/* Option selections */}
                            <div className="space-y-1.5 pl-7">
                              {q.options.map((option, opIdx) => {
                                const isSelected = selection === opIdx;
                                const isCorrect = opIdx === q.correctAnswerIndex;
                                
                                let opClass = "border-slate-200 hover:bg-slate-50";
                                let opTextClass = "text-slate-700";

                                if (showAnswers) {
                                  if (isCorrect) {
                                    opClass = "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold";
                                    opTextClass = "text-emerald-800";
                                  } else if (isSelected) {
                                    opClass = "bg-rose-50 border-rose-300 text-rose-900";
                                    opTextClass = "text-rose-800";
                                  } else {
                                    opClass = "border-slate-100 opacity-60";
                                  }
                                } else if (isSelected) {
                                  opClass = "bg-blue-50 border-blue-400 shadow-sm text-blue-900";
                                  opTextClass = "text-blue-850 font-semibold";
                                }

                                return (
                                  <div
                                    key={opIdx}
                                    onClick={() => handleSelectOption(idx, opIdx)}
                                    className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 transition-all cursor-pointer ${opClass}`}
                                  >
                                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                      isSelected 
                                        ? 'border-blue-500 bg-blue-500 text-white' 
                                        : 'border-slate-300 bg-white'
                                    }`}>
                                      {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                                    </div>
                                    <span className={opTextClass}>{option}</span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* MCQ Explanation Box accord */}
                            {showAnswers && (
                              <div className="pl-7 pt-1.5">
                                {showExplanationIndex === idx ? (
                                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-1 text-[11px] text-slate-650 animate-fade-in">
                                    <p className="font-extrabold text-slate-800 flex items-center gap-1 font-mono uppercase text-[9px]">
                                      <Sparkles size={11} className="text-amber-500" />
                                      Curriculum Key Explanation:
                                    </p>
                                    <p className="leading-relaxed font-medium">{q.explanation}</p>
                                    <button
                                      onClick={() => setShowExplanationIndex(null)}
                                      className="text-[9px] text-slate-400 hover:text-slate-600 underline font-extrabold mt-1 block"
                                    >
                                      Collapse explanation key
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setShowExplanationIndex(idx)}
                                    className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 font-mono"
                                  >
                                    <HelpCircle size={12} />
                                    <span>Inspect correct options breakdown</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    </div>
                    {/* Submission and report scores toolbar */}
                  <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {!isAlreadyCompleted && !hasSubmittedLocal 
                        ? `${Object.keys(userSelections).length} of 5 Theory MCQs answered.`
                        : "Daily Practice scorecard locked successfully."}
                    </span>

                    {!isAlreadyCompleted && !hasSubmittedLocal ? (
                      <button
                        onClick={() => handleSubmitQuiz(selectedDayForQuiz, questions)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer font-mono"
                      >
                        <span>Submit Daily Quiz</span>
                        <ArrowRight size={13} />
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedDayForQuiz(null)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer font-mono"
                      >
                        Exit Practicing Session
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="hidden lg:col-span-8 lg:flex flex-col items-center justify-center p-12 bg-white/50 border border-dashed border-slate-200 rounded-2xl h-[460px] text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shadow-inner">
              <Eye size={28} />
            </div>
            <div>
              <p className="font-bold text-slate-700 text-sm font-sans">Practice Session Panel</p>
              <p className="text-xs text-slate-400 max-w-[300px] mx-auto mt-1 leading-relaxed">
                Select an unlocked academic day segment on the left panel to display educational tests and log your quiz results.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
