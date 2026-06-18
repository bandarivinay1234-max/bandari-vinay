import React, { useState, useEffect } from 'react';
import { Student, TopicKey, PreApprovedRecord } from './types';
import { INITIAL_STUDENTS, INITIAL_PRE_APPROVED_RECORDS } from './initialData';
import DashboardOverview from './components/DashboardOverview';
import StudentList from './components/StudentList';
import StudentDetails from './components/StudentDetails';
import StudentForm from './components/StudentForm';
import DailyQuizCenter from './components/DailyQuizCenter';
import StudentOnboardingImport from './components/StudentOnboardingImport';
import AIInterviewAgent from './components/AIInterviewAgent';
import { getCategoryForDay } from './dailyQuestions';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  Plus, 
  AlertTriangle, 
  BookOpen, 
  Layers,
  Award,
  Lock,
  Unlock,
  Shield,
  UserCheck,
  UploadCloud,
  FileText,
  CheckCircle,
  Download,
  Sparkles,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Load state from localStorage on first boot
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('STUDENT_DB_METRICS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (err) {
        console.error('Failed to parse cached student records:', err);
      }
    }
    return INITIAL_STUDENTS;
  });

  // Current active role select state
  const [userRole, setUserRole] = useState<'teacher' | 'student'>(() => {
    const saved = localStorage.getItem('ACADEMY_USER_ROLE');
    return (saved as 'teacher' | 'student') || 'teacher';
  });

  // Currently selected student identifier when role === 'student'
  const [activeStudentForQuiz, setActiveStudentForQuiz] = useState<string>(() => {
    const saved = localStorage.getItem('ACADEMY_ACTIVE_STUDENT_FOR_QUIZ');
    return saved || (INITIAL_STUDENTS.length > 0 ? INITIAL_STUDENTS[0].id : '');
  });

  // Global locked topics matrix (teacher only can toggle)
  const [lockedTopics, setLockedTopics] = useState<Record<TopicKey, boolean>>(() => {
    const saved = localStorage.getItem('LOCKED_TOPICS_METRICS');
    if (saved) return JSON.parse(saved);
    return {
      python: false,
      pandas: false,
      numpy: false,
      machineLearning: true, // locked initially
      dl: true,              // locked initially
      nlp: true,             // locked initially
      genai: true,           // locked initially
    };
  });

  // Locked/unlocked state for Days 1 to 30 of Python plan
  const [unlockedDays, setUnlockedDays] = useState<Record<number, boolean>>(() => {
    const saved = localStorage.getItem('UNLOCKED_DAYS_METRICS');
    if (saved) return JSON.parse(saved);
    // default: unlock Days 1 to 10
    const initial: Record<number, boolean> = {};
    for (let i = 1; i <= 10; i++) {
      initial[i] = true;
    }
    return initial;
  });

  // Persist state updates
  useEffect(() => {
    localStorage.setItem('STUDENT_DB_METRICS', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('ACADEMY_USER_ROLE', userRole);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem('ACADEMY_ACTIVE_STUDENT_FOR_QUIZ', activeStudentForQuiz);
  }, [activeStudentForQuiz]);

  useEffect(() => {
    localStorage.setItem('LOCKED_TOPICS_METRICS', JSON.stringify(lockedTopics));
  }, [lockedTopics]);

  useEffect(() => {
    localStorage.setItem('UNLOCKED_DAYS_METRICS', JSON.stringify(unlockedDays));
  }, [unlockedDays]);

  // Master pre-approved database mapping matches
  const [preApprovedRecords, setPreApprovedRecords] = useState<PreApprovedRecord[]>(() => {
    const saved = localStorage.getItem('PRE_APPROVED_RECORDS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed)) {
          return parsed;
        }
      } catch (err) {
        console.error('Failed to parse preapproved cache:', err);
      }
    }
    return INITIAL_PRE_APPROVED_RECORDS;
  });

  useEffect(() => {
    localStorage.setItem('PRE_APPROVED_RECORDS', JSON.stringify(preApprovedRecords));
  }, [preApprovedRecords]);

  // Tab and details management state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'dailyQuiz' | 'aiInterview'>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Teacher password credentials control
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [teacherKeyInput, setTeacherKeyInput] = useState('');
  const [loginErrorMessage, setLoginErrorMessage] = useState('');

  // Student secure login control
  const [studentRoleIdInput, setStudentRoleIdInput] = useState('');
  const [studentPhoneInput, setStudentPhoneInput] = useState('');
  const [studentLoginError, setStudentLoginError] = useState('');
  const [studentLoginSuccess, setStudentLoginSuccess] = useState('');
  const [isStudentVerifying, setIsStudentVerifying] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationStep, setVerificationStep] = useState('');

  const handleStudentLoginSubmit = async () => {
    setStudentLoginError('');
    setStudentLoginSuccess('');
    const trimmedId = studentRoleIdInput.trim().toUpperCase();
    const trimmedPhone = studentPhoneInput.trim();

    if (!trimmedId) {
      setStudentLoginError('Please enter Student ID.');
      return;
    }
    if (!trimmedPhone) {
      setStudentLoginError('Please enter matching Phone Number.');
      return;
    }

    // Begin animated database matching checks
    setIsStudentVerifying(true);
    setVerificationProgress(15);
    setVerificationStep('Querying registered student directory...');

    await new Promise(resolve => setTimeout(resolve, 550));
    setVerificationProgress(45);
    setVerificationStep('Searching registrar pre-approval records...');

    await new Promise(resolve => setTimeout(resolve, 600));
    setVerificationProgress(75);
    setVerificationStep('Correlating matches & crypto-hash signature keys...');

    await new Promise(resolve => setTimeout(resolve, 500));
    setVerificationProgress(100);
    setVerificationStep('Establishing active academy lounge workspace...');

    await new Promise(resolve => setTimeout(resolve, 300));

    // 1. Check in registered student roster first
    const matchedRoster = students.find(
      s => s.roleId.toUpperCase().trim() === trimmedId
    );

    // 2. Check if a match exists in master pre-approved database
    const matchedPreApproval = preApprovedRecords.find(
      pa => pa.idNumber.toUpperCase().trim() === trimmedId && pa.phoneNumber.trim() === trimmedPhone
    );

    setIsStudentVerifying(false);

    if (matchedRoster) {
      const rosterPhone = matchedRoster.phoneNumber || '';
      const phoneMatches = rosterPhone === trimmedPhone || (matchedPreApproval && matchedPreApproval.phoneNumber === trimmedPhone);

      if (!phoneMatches && matchedRoster.phoneNumber) {
        setStudentLoginError('Credential mismatch: Phone number does not match registered profile.');
        return;
      }

      if (matchedRoster.isApproved === false) {
        if (phoneMatches) {
          // AUTO-APPROVE
          setStudents(prev => prev.map(s => s.id === matchedRoster.id ? { ...s, isApproved: true, phoneNumber: trimmedPhone } : s));
          setActiveStudentForQuiz(matchedRoster.id);
          setSelectedStudentId(null);
          setStudentRoleIdInput('');
          setStudentPhoneInput('');
          setStudentLoginSuccess(`Verified! details matched correctly. Approved!`);
          alert(`Verification Successful!\n\nWelcome back, ${matchedRoster.name}!\n\nWe successfully matched your Student ID ${trimmedId} and Phone ${trimmedPhone} with our registered student database. Your workspace has been approved and activated!`);
        } else {
          setStudentLoginError('Credential mismatch: The mobile phone number entered does not match our registration records for this Student ID.');
        }
      } else {
        // Log in
        if (!matchedRoster.phoneNumber) {
          setStudents(prev => prev.map(s => s.id === matchedRoster.id ? { ...s, phoneNumber: trimmedPhone } : s));
        }
        setActiveStudentForQuiz(matchedRoster.id);
        setSelectedStudentId(null);
        setStudentRoleIdInput('');
        setStudentPhoneInput('');
        setStudentLoginSuccess(`Welcome back, ${matchedRoster.name}!`);
      }
    } else {
      // 3. Not in roster: can we auto-register from pre-approved database?
      if (matchedPreApproval) {
        const generatedId = `student-auto-${Date.now()}`;
        const newStudent: Student = {
          id: generatedId,
          name: matchedPreApproval.name,
          email: matchedPreApproval.email || `${matchedPreApproval.name.toLowerCase().replace(/\s+/g, '.')}@datascience.edu`,
          roleId: trimmedId,
          phoneNumber: trimmedPhone,
          batch: 'Advanced AI & Data Science - Batch A',
          avatarStyle: 'from-blue-500 to-indigo-600',
          enrollmentDate: new Date().toISOString().split('T')[0],
          status: 'active',
          isApproved: true, // AUTO APPROVED!
          topics: {
            python: 75,
            pandas: 72,
            numpy: 70,
            machineLearning: 60,
            dl: 50,
            nlp: 50,
            genai: 55
          },
          weeklyReports: [],
          monthlyReports: [],
          dailyQuizScores: {}
        };

        setStudents(prev => [newStudent, ...prev]);
        setActiveStudentForQuiz(generatedId);
        setSelectedStudentId(null);
        setStudentRoleIdInput('');
        setStudentPhoneInput('');
        setStudentLoginSuccess(`Registered & Auto-Approved for ${matchedPreApproval.name}!`);
        alert(`Direct Match Found!\n\nWelcome ${matchedPreApproval.name}! Since your Student ID and Phone match the pre-approved database, your academy workspace is fully activated with instant auto-approval.`);
      } else {
        setStudentLoginError('No matching pre-approved record found. Verify details, or contact your instructor.');
      }
    }
  };

  // Securely enforce student workspace restrictions to prevent leaks
  useEffect(() => {
    if (userRole === 'student') {
      setActiveTab('dailyQuiz');
      setSelectedStudentId(null);
    }
  }, [userRole]);

  // Form management state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);

  // Interactive delete confirmation prompt
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  // Select active student object
  const activeStudent = students.find((s) => s.id === selectedStudentId);

  // Student list mutations
  const handleSaveStudent = (savedStudent: Student) => {
    if (userRole === 'student') {
      alert("Error: Students are authorized to read only and cannot override student record profiles.");
      return;
    }
    const exists = students.some((s) => s.id === savedStudent.id);
    if (exists) {
      setStudents((prev) => prev.map((s) => (s.id === savedStudent.id ? savedStudent : s)));
    } else {
      setStudents((prev) => [savedStudent, ...prev]);
    }
    setIsFormOpen(false);
    setEditingStudent(undefined);
  };

  const handleEditStudentPress = (student: Student) => {
    if (userRole === 'student') {
      alert("Error: Student profiles can only be amended by teachers.");
      return;
    }
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  const handleDeleteStudent = (id: string) => {
    if (userRole === 'student') {
      alert("Error: Only verified teachers are permitted to purge student records.");
      return;
    }
    setDeleteConfirmationId(id);
  };

  const confirmDeleteStudent = () => {
    if (userRole === 'student') {
      alert("Error: Unauthorized deletion attempt.");
      return;
    }
    if (deleteConfirmationId) {
      setStudents((prev) => prev.filter((s) => s.id !== deleteConfirmationId));
      if (selectedStudentId === deleteConfirmationId) {
        setSelectedStudentId(null);
      }
      setDeleteConfirmationId(null);
    }
  };

  const handleToggleStudentApproval = (id: string) => {
    if (userRole === 'student') {
      alert("Error: Only verified instructors can alter registry approval states.");
      return;
    }
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isApproved: s.isApproved === false } : s))
    );
  };

  const handleImportStudents = (newStudents: Student[]) => {
    if (userRole === 'student') {
      alert("Error: Students are not authorized to write or import registry credentials.");
      return;
    }
    setStudents((prev) => [...newStudents, ...prev]);
  };

  // Lock/Unlock triggers
  const handleToggleTopicLock = (topic: TopicKey, isLocked: boolean) => {
    setLockedTopics(prev => ({
      ...prev,
      [topic]: isLocked
    }));
  };

  const handleToggleDayLock = (day: number) => {
    setUnlockedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const handleBulkUnlockDays = (daysToUnlock: number[]) => {
    setUnlockedDays(prev => {
      const next = { ...prev };
      daysToUnlock.forEach(d => {
        next[d] = true;
      });
      return next;
    });
  };

  // Sync test results write-only
  const handleSaveQuizResult = (studentId: string, day: number, rawScore: number) => {
    setStudents((prev) => prev.map((s) => {
      if (s.id === studentId) {
        const currentScores = s.dailyQuizScores || {};
        const isAlreadyDone = currentScores[day] !== undefined;
        if (isAlreadyDone) return s; // block rewrites

        const updatedScores = {
          ...currentScores,
          [day]: rawScore
        };

        // Recalculate category competence scores
        const category = getCategoryForDay(day);
        const currentSkill = s.topics[category] ?? 70;
        // Dynamically compute percentage based on score magnitude to support both 5-question (retroactive) and new 10-question daily scores
        const testPercent = rawScore <= 5 ? Math.round((rawScore / 5) * 100) : Math.round((rawScore / 10) * 100);
        
        // Blend in test performance beautifully (15% weight update)
        const blendedScore = Math.min(100, Math.max(0, Math.round(currentSkill * 0.85 + testPercent * 0.15)));

        // Append to weekly records to show progression curve
        const copyWeekly = [...s.weeklyReports];
        if (copyWeekly.length > 0) {
          const currentWeek = copyWeekly[copyWeekly.length - 1];
          currentWeek.quizScore = Math.round((currentWeek.quizScore + testPercent) / 2);
        }

        return {
          ...s,
          topics: {
            ...s.topics,
            [category]: blendedScore
          },
          dailyQuizScores: updatedScores,
          weeklyReports: copyWeekly
        };
      }
      return s;
    }));
  };

  // Helper values
  const studentToDelete = students.find((s) => s.id === deleteConfirmationId);

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-800 flex overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Sleek Navigation Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 border-r border-slate-800 relative z-30">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/60">
          <div 
            onClick={() => { setSelectedStudentId(null); setActiveTab('dashboard'); }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8.5 h-8.5 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black group-hover:scale-105 transition-transform">
              <GraduationCap size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">DS-Academy</h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">AI & Analytics</p>
            </div>
          </div>
        </div>

        {/* 🔑 ACCESS PERSONA CONTROL CARD */}
        <div className="p-4 mx-3 mt-4 mb-2 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
            <Shield size={12} className="text-blue-500" />
            <span>Portal Access Role</span>
          </div>
          
          <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (userRole === 'student') {
                  setTeacherKeyInput('');
                  setLoginErrorMessage('');
                  setShowLoginModal(true);
                }
              }}
              className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase transition-all tracking-wide cursor-pointer ${
                userRole === 'teacher'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {userRole === 'teacher' ? '✓ Teacher' : 'Teacher'}
            </button>
            <button
              type="button"
              onClick={() => {
                setUserRole('student');
                setSelectedStudentId(null);
                setActiveTab('dailyQuiz');
                setActiveStudentForQuiz(''); // Reset selected quiz student for security on log out/role swap
              }}
              className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase transition-all tracking-wide cursor-pointer ${
                userRole === 'student'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Student
            </button>
          </div>

          {userRole === 'student' && (
            <div className="space-y-2 pt-2 border-t border-slate-800/40">
              {activeStudentForQuiz && students.some(s => s.id === activeStudentForQuiz) ? (
                <div className="space-y-2">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1">
                    <p className="text-[9px] text-slate-550 font-bold uppercase tracking-wider flex items-center gap-1">
                      <UserCheck size={10} className="text-emerald-500" />
                      <span>Active Student Session</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <p className="text-slate-200 font-bold">
                        {students.find(s => s.id === activeStudentForQuiz)?.name}
                      </p>
                    </div>
                    <p className="text-[9px] text-slate-400 font-mono">
                      ID: {students.find(s => s.id === activeStudentForQuiz)?.roleId}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStudentForQuiz('');
                      setSelectedStudentId(null);
                    }}
                    className="w-full py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-rose-450 font-extrabold rounded text-[9px] tracking-wide uppercase transition-all cursor-pointer"
                  >
                    Exit Session
                  </button>
                </div>
              ) : isStudentVerifying ? (
                <div className="space-y-3.5 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-left" id="student-verifying-sidebar">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Database Querying...</p>
                  </div>
                  
                  {/* Progress Line */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[8px] font-mono text-slate-500">
                      <span>SECURE PIPELINE</span>
                      <span className="text-blue-400 font-bold">{verificationProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${verificationProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Task Step details */}
                  <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/80">
                    <p className="text-[8px] text-blue-500 font-extrabold uppercase tracking-wide font-mono">Operations Log:</p>
                    <p className="text-[10px] text-slate-350 font-medium leading-snug mt-0.5">
                      {verificationStep}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 p-1 bg-slate-950/30 rounded-lg" id="student-login-sidebar">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Shield size={10} className="text-blue-500" />
                    <span>Secure Verification Gate</span>
                  </p>
                  
                  {/* Student ID */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-semibold text-slate-400 block">Student ID Number</label>
                    <input
                      type="text"
                      placeholder="e.g. STU-2026-901"
                      value={studentRoleIdInput}
                      onChange={(e) => {
                        setStudentRoleIdInput(e.target.value);
                        if (studentLoginError) setStudentLoginError('');
                        if (studentLoginSuccess) setStudentLoginSuccess('');
                      }}
                      className="w-full bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded py-1.5 px-2 outline-none font-semibold focus:border-blue-500 font-mono"
                    />
                  </div>

                  {/* Student Phone Number */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-semibold text-slate-400 block">Matching Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 9876543901"
                      value={studentPhoneInput}
                      onChange={(e) => {
                        setStudentPhoneInput(e.target.value);
                        if (studentLoginError) setStudentLoginError('');
                        if (studentLoginSuccess) setStudentLoginSuccess('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleStudentLoginSubmit();
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded py-1.5 px-2 outline-none font-semibold focus:border-blue-500 font-mono"
                    />
                  </div>

                  {studentLoginError && (
                    <p className="text-[9px] text-rose-500 font-semibold leading-tight bg-rose-500/10 p-1.5 rounded border border-rose-500/20">
                      {studentLoginError}
                    </p>
                  )}

                  {studentLoginSuccess && (
                    <p className="text-[9px] text-emerald-400 font-semibold leading-tight bg-emerald-500/10 p-1.5 rounded border border-emerald-500/20">
                      {studentLoginSuccess}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleStudentLoginSubmit}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 font-extrabold text-white rounded text-[10px] uppercase transition-all tracking-wide cursor-pointer shadow-sm shadow-blue-500/25"
                  >
                    Match & Verify Access
                  </button>
                  <p className="text-[8px] text-slate-500 hover:text-slate-450 leading-normal text-center bg-slate-950/20 p-1.5 rounded-md">
                    Note: Matching details automates student onboarding and yields immediate active-status approval.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Actions Menu */}
        <nav className="flex-1 py-3 overflow-y-auto space-y-1 px-3">
          <div className="px-3 mb-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            Portal Navigation
          </div>
          {userRole === 'teacher' && (
            <>
              <button
                onClick={() => { setSelectedStudentId(null); setActiveTab('dashboard'); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border-l-3 ${
                  !activeStudent && activeTab === 'dashboard'
                    ? 'bg-slate-800 text-white border-blue-500 font-bold'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <LayoutDashboard size={15} className={!activeStudent && activeTab === 'dashboard' ? 'text-blue-500' : ''} />
                <span>Overview Dashboard</span>
              </button>

              <button
                onClick={() => { setSelectedStudentId(null); setActiveTab('students'); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border-l-3 ${
                  !activeStudent && activeTab === 'students'
                    ? 'bg-slate-800 text-white border-blue-500 font-bold'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Users size={15} className={!activeStudent && activeTab === 'students' ? 'text-blue-500' : ''} />
                <span>Student Database</span>
              </button>
            </>
          )}

          <button
            onClick={() => { setSelectedStudentId(null); setActiveTab('dailyQuiz'); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border-l-3 ${
              !activeStudent && activeTab === 'dailyQuiz'
                ? 'bg-slate-800 text-white border-blue-500 font-bold'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Award size={15} className={!activeStudent && activeTab === 'dailyQuiz' ? 'text-blue-500' : ''} />
            <span>Daily Practice Tests</span>
          </button>

          <button
            onClick={() => { setSelectedStudentId(null); setActiveTab('aiInterview'); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border-l-3 ${
              !activeStudent && activeTab === 'aiInterview'
                ? 'bg-slate-800 text-white border-blue-500 font-bold'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Brain size={15} className={!activeStudent && activeTab === 'aiInterview' ? 'text-blue-500' : ''} />
            <span>AI Interview Agent</span>
          </button>

          <div className="px-3 pt-6 mb-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            Curriculum Core
          </div>

          {[
            { label: 'Python Engine', key: 'python' },
            { label: 'Pandas Analytics', key: 'pandas' },
            { label: 'NumPy Arrays', key: 'numpy' },
            { label: 'Machine Learning', key: 'machineLearning' },
            { label: 'Deep Learning', key: 'dl' },
            { label: 'GenAI & LLMs', key: 'genai' },
          ].map((topic, i) => (
            <div 
              key={i} 
              onClick={() => { setSelectedStudentId(null); setActiveTab('dailyQuiz'); }}
              className="group flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-100 hover:bg-slate-800/20 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${lockedTopics[topic.key as TopicKey] ? 'bg-slate-500' : 'bg-blue-500'}`}></span>
                <span className={lockedTopics[topic.key as TopicKey] ? 'text-slate-500 line-through' : ''}>{topic.label}</span>
              </div>
              <span className="text-[9px] text-slate-600 font-mono group-hover:text-slate-400">
                {lockedTopics[topic.key as TopicKey] ? <Lock size={10} /> : `M${i+1}`}
              </span>
            </div>
          ))}

          {userRole === 'teacher' && (
            <>
              <div className="px-3 pt-6 mb-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Report Actions
              </div>
              <button
                onClick={() => { if (students.length > 0) setSelectedStudentId(students[0].id); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <BookOpen size={14} className="text-slate-500" />
                <span>Weekly Summaries</span>
              </button>
              <button
                onClick={() => { if (students.length > 0) setSelectedStudentId(students[0].id); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <Layers size={14} className="text-slate-500" />
                <span>Monthly Insights</span>
              </button>
            </>
          )}
        </nav>

        {/* Sidebar Footer Account block */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-8.5 h-8.5 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 uppercase">
              {userRole === 'teacher' ? 'TC' : 'ST'}
            </div>
            <div className="text-xs">
              <p className="font-bold text-slate-200">{userRole === 'teacher' ? 'Instructor Portal' : 'Student Access'}</p>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                {userRole === 'teacher' ? 'Root Admin' : students.find(s => s.id === activeStudentForQuiz)?.roleId || 'Token'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Content viewport area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Sleek Sub-Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-8 shrink-0 relative z-10 shadow-sm shadow-slate-100/10">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
              {activeStudent 
                ? `${activeStudent.name}'s Academic Dashboard` 
                : activeTab === 'dashboard' 
                  ? 'Performance Analytics Matrix' 
                  : activeTab === 'dailyQuiz'
                    ? 'Daily Practice Tests Lounge'
                    : 'Enrollment Database'}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {activeStudent 
                ? 'Comprehensive report, grade distribution, and weekly submission insights.' 
                : activeTab === 'dashboard'
                  ? 'Real-time cohort performance and modular competence maps.'
                  : activeTab === 'dailyQuiz'
                    ? '30-Day Python Practice Program: complete quizzes to build mastery.'
                    : 'Manage and track registered students within the sandbox program.'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {activeStudent && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-xl">
                <BookOpen size={13} className="text-slate-400" />
                <span className="text-slate-400">Students</span>
                <span>/</span>
                <span className="text-slate-700 truncate max-w-[124px]">{activeStudent.name}</span>
              </span>
            )}

            {!activeStudent && userRole === 'teacher' && (
              <button
                onClick={() => { setEditingStudent(undefined); setIsFormOpen(true); }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm hover:shadow-blue-100 cursor-pointer"
              >
                <Plus size={15} />
                Register New Student
              </button>
            )}
          </div>
        </header>

        {/* Content Portal - Scrollable */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="transition-all duration-300">
              {activeStudent ? (
                <StudentDetails
                  student={activeStudent}
                  userRole={userRole}
                  onBack={() => setSelectedStudentId(null)}
                  onUpdateStudent={handleSaveStudent}
                />
              ) : activeTab === 'aiInterview' ? (
                userRole === 'student' && (!activeStudentForQuiz || !students.some(s => s.id === activeStudentForQuiz)) ? (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-8 max-w-md mx-auto text-center space-y-6 shadow-xl shadow-slate-200/35" id="student-lockout-screen-interview">
                    <div className="w-14 h-14 bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                      <Shield size={22} className="text-blue-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Secure Academy Student Portal</h3>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                        Verify your registered student ID number and phone details to synchronize academic progress and launch AI interviews.
                      </p>
                    </div>

                    <div className="space-y-4 text-left">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Student ID Number</label>
                        <input
                          type="text"
                          placeholder="e.g. STU-2026-901"
                          value={studentRoleIdInput}
                          onChange={(e) => {
                            setStudentRoleIdInput(e.target.value);
                            if (studentLoginError) setStudentLoginError('');
                            if (studentLoginSuccess) setStudentLoginSuccess('');
                          }}
                          className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 text-xs text-slate-800 rounded-xl py-2.5 px-3.5 outline-none font-bold transition-colors font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Registered Phone Number</label>
                        <input
                          type="text"
                          placeholder="e.g. 9876543901"
                          value={studentPhoneInput}
                          onChange={(e) => {
                            setStudentPhoneInput(e.target.value);
                            if (studentLoginError) setStudentLoginError('');
                            if (studentLoginSuccess) setStudentLoginSuccess('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleStudentLoginSubmit();
                            }
                          }}
                          className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 text-xs text-slate-800 rounded-xl py-2.5 px-3.5 outline-none font-bold transition-colors font-mono"
                        />
                      </div>
                    </div>

                    {studentLoginError && (
                      <div className="text-[11px] text-rose-600 font-semibold leading-tight bg-rose-50 border border-rose-100/80 p-3 rounded-xl text-left font-sans flex items-start gap-2">
                        <span className="shrink-0 mt-0.5">⚠️</span>
                        <span>{studentLoginError}</span>
                      </div>
                    )}

                    {studentLoginSuccess && (
                      <div className="text-[11px] text-emerald-750 font-semibold leading-tight bg-emerald-50 border border-emerald-100/80 p-3 rounded-xl text-left font-sans flex items-start gap-2">
                        <span className="shrink-0 mt-0.5">✨</span>
                        <span>{studentLoginSuccess}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleStudentLoginSubmit}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 font-extrabold text-white rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-sm shadow-blue-500/25"
                    >
                      Verify & Access Workspace
                    </button>
                  </div>
                ) : userRole === 'student' && students.find(s => s.id === activeStudentForQuiz)?.isApproved === false ? (
                  <div className="space-y-8" id="student-pending-approval-screen-interview">
                    <div className="bg-white rounded-2xl border border-orange-200 p-6 max-w-md mx-auto text-center space-y-3 shadow-sm shadow-orange-100/10">
                      <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto border border-orange-100 shadow-inner">
                        <AlertTriangle size={20} className="animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-800 tracking-tight">Workspace Approval Required</h3>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          Hi, <strong className="text-slate-800">{students.find(s => s.id === activeStudentForQuiz)?.name}</strong>! Your account is active, but you must submit prior academic history details to unlock full study modules.
                        </p>
                      </div>
                    </div>
                    {(() => {
                      const activeStud = students.find(s => s.id === activeStudentForQuiz);
                      if (activeStud) {
                        return (
                          <StudentOnboardingImport 
                            student={activeStud} 
                            onSaveImportedData={(data) => {
                              setStudents(prev => prev.map(s => s.id === activeStudentForQuiz ? { ...s, importedData: data, isApproved: true } : s));
                            }} 
                          />
                        );
                      }
                      return null;
                    })()}
                  </div>
                ) : (
                  <AIInterviewAgent
                    students={students}
                    currentStudentId={userRole === 'student' ? activeStudentForQuiz : (students[0]?.id || '')}
                    userRole={userRole}
                    onUpdateStudent={(updatedStudent) => {
                      setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
                    }}
                  />
                )
              ) : activeTab === 'dailyQuiz' ? (
                userRole === 'student' && (!activeStudentForQuiz || !students.some(s => s.id === activeStudentForQuiz)) ? (
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-8 max-w-md mx-auto text-center space-y-6 shadow-xl shadow-slate-200/35" id="student-lockout-screen">
                    {isStudentVerifying ? (
                      <div className="space-y-6 py-4 animate-pulse" id="lockout-verifying-status">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border border-blue-100 shadow-inner">
                          <Brain size={28} className="text-blue-500 animate-bounce" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-600">Verifying Database Records</h3>
                          <p className="text-xs text-slate-500 font-semibold font-mono bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                            {verificationStep}
                          </p>
                        </div>
                        {/* Progress Meter */}
                        <div className="space-y-1.5 max-w-xs mx-auto">
                          <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
                            <span>SECURE PIPELINE</span>
                            <span>{verificationProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60 p-0.5">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
                              style={{ width: `${verificationProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-14 h-14 bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                          <Shield size={22} className="text-blue-500" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Secure Academy Student Portal</h3>
                          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                            Verify your registered student ID number and phone details to synchronize academic progress and launch quizzes.
                          </p>
                        </div>

                        <div className="space-y-4 text-left">
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Student ID Number</label>
                            <input
                              type="text"
                              placeholder="e.g. STU-2026-901"
                              value={studentRoleIdInput}
                              onChange={(e) => {
                                setStudentRoleIdInput(e.target.value);
                                if (studentLoginError) setStudentLoginError('');
                                if (studentLoginSuccess) setStudentLoginSuccess('');
                              }}
                              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 text-xs text-slate-800 rounded-xl py-2.5 px-3.5 outline-none font-bold transition-colors font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Registered Phone Number</label>
                            <input
                              type="text"
                              placeholder="e.g. 9876543901"
                              value={studentPhoneInput}
                              onChange={(e) => {
                                setStudentPhoneInput(e.target.value);
                                if (studentLoginError) setStudentLoginError('');
                                if (studentLoginSuccess) setStudentLoginSuccess('');
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleStudentLoginSubmit();
                                }
                              }}
                              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 text-xs text-slate-800 rounded-xl py-2.5 px-3.5 outline-none font-bold transition-colors font-mono"
                            />
                          </div>
                        </div>

                        {studentLoginError && (
                          <div className="text-[11px] text-rose-600 font-semibold leading-tight bg-rose-50 border border-rose-100/80 p-3 rounded-xl text-left font-sans flex items-start gap-2">
                            <span className="shrink-0 mt-0.5">⚠️</span>
                            <span>{studentLoginError}</span>
                          </div>
                        )}

                        {studentLoginSuccess && (
                          <div className="text-[11px] text-emerald-700 font-semibold leading-tight bg-emerald-50 border border-emerald-100/80 p-3 rounded-xl text-left font-sans flex items-start gap-2">
                            <span className="shrink-0 mt-0.5">✨</span>
                            <span>{studentLoginSuccess}</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleStudentLoginSubmit}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 font-extrabold text-white rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-sm shadow-blue-500/25"
                        >
                          Verify & Access Workspace
                        </button>
                      </>
                    )}
                  </div>
                ) : userRole === 'student' && students.find(s => s.id === activeStudentForQuiz)?.isApproved === false ? (
                  <div className="space-y-8" id="student-pending-approval-screen">
                    <div className="bg-white rounded-2xl border border-orange-200 p-6 max-w-md mx-auto text-center space-y-3 shadow-sm shadow-orange-100/10">
                      <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto border border-orange-100 shadow-inner">
                        <AlertTriangle size={20} className="animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-800 tracking-tight">Workspace Approval Required</h3>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          Hi, <strong className="text-slate-800">{students.find(s => s.id === activeStudentForQuiz)?.name}</strong>! Your account is active, but you must submit your prior academic history for review to unlock exam writing privileges.
                        </p>
                      </div>
                    </div>
                    {(() => {
                      const activeStud = students.find(s => s.id === activeStudentForQuiz);
                      if (activeStud) {
                        return (
                          <StudentOnboardingImport 
                            student={activeStud} 
                            onSaveImportedData={(data) => {
                              setStudents(prev => prev.map(s => s.id === activeStudentForQuiz ? { ...s, importedData: data } : s));
                            }} 
                          />
                        );
                      }
                      return null;
                    })()}
                  </div>
                ) : (
                  <DailyQuizCenter
                    students={students}
                    currentStudentId={userRole === 'student' ? activeStudentForQuiz : (students[0]?.id || '')}
                    userRole={userRole}
                    lockedTopics={lockedTopics}
                    onUnlockTopic={handleToggleTopicLock}
                    unlockedDays={unlockedDays}
                    onToggleDayLock={handleToggleDayLock}
                    onBulkUnlockDays={handleBulkUnlockDays}
                    onSaveQuizResult={handleSaveQuizResult}
                  />
                )
              ) : activeTab === 'dashboard' ? (
                <DashboardOverview
                  students={students}
                  userRole={userRole}
                  lockedTopics={lockedTopics}
                  onToggleTopicLock={handleToggleTopicLock}
                  onSelectStudent={(id) => setSelectedStudentId(id)}
                  onOpenAddModal={() => { setEditingStudent(undefined); setIsFormOpen(true); }}
                />
              ) : (
                <StudentList
                  students={students}
                  userRole={userRole}
                  onSelectStudent={(id) => setSelectedStudentId(id)}
                  onEditStudent={handleEditStudentPress}
                  onDeleteStudent={handleDeleteStudent}
                  onOpenAddModal={() => { setEditingStudent(undefined); setIsFormOpen(true); }}
                  onToggleApproval={handleToggleStudentApproval}
                  onImportStudents={handleImportStudents}
                  preApprovedRecords={preApprovedRecords}
                  onUpdatePreApprovedRecords={setPreApprovedRecords}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modals & Dialog Portals */}
      <AnimatePresence>
        {/* Profile additions and editor form */}
        {isFormOpen && (
          <StudentForm
            student={editingStudent}
            onSave={handleSaveStudent}
            onClose={() => { setIsFormOpen(false); setEditingStudent(undefined); }}
          />
        )}

        {/* Interactive Delete confirmation card */}
        {deleteConfirmationId && studentToDelete && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 text-center space-y-4"
              id="delete-confirmation-dialog"
            >
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-800">Remove Student Record?</h3>
                <p className="text-xs text-slate-500">
                  This will permanently delete <strong className="text-slate-700">{studentToDelete.name}</strong> ({studentToDelete.roleId}) and all their associated grades, weekly logging metrics, and monthly feedback text. This action is irreversible.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmationId(null)}
                  id="cancel-delete-btn"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteStudent}
                  id="confirm-delete-btn"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm hover:shadow-rose-100"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 🔐 Secure Teacher Passcode Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden"
              id="teacher-auth-modal"
            >
              <div className="bg-slate-900 p-5 text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/25 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Instructor Access Gate</h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Access level auth required</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your secure instructor passcode sequence to unlock standard grading records, student registration capabilities, and dashboard matrix controllers.
                </p>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Enter Passcode Key</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={teacherKeyInput}
                    onChange={(e) => {
                      setTeacherKeyInput(e.target.value);
                      if (loginErrorMessage) setLoginErrorMessage('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        // Submit login code
                        if (teacherKeyInput === 'vinay@8534') {
                          setUserRole('teacher');
                          setSelectedStudentId(null);
                          setActiveTab('dashboard');
                          setShowLoginModal(false);
                          setTeacherKeyInput('');
                          setLoginErrorMessage('');
                        } else {
                          setLoginErrorMessage('Incorrect teacher key sequence. Access Denied!');
                        }
                      }
                    }}
                    className="w-full text-slate-800 text-sm border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold"
                    autoFocus
                  />
                </div>

                {loginErrorMessage && (
                  <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-start gap-2 text-[11px] text-rose-700 font-medium">
                    <span className="shrink-0 text-rose-500 font-bold">⚠️</span>
                    <span>{loginErrorMessage}</span>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 border-t border-slate-100 p-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setTeacherKeyInput('');
                    setLoginErrorMessage('');
                  }}
                  className="flex-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (teacherKeyInput === 'vinay@8534') {
                      setUserRole('teacher');
                      setSelectedStudentId(null);
                      setActiveTab('dashboard');
                      setShowLoginModal(false);
                      setTeacherKeyInput('');
                      setLoginErrorMessage('');
                    } else {
                      setLoginErrorMessage('Incorrect teacher key sequence. Access Denied!');
                    }
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 text-xs font-bold transition-all shadow-sm hover:shadow-blue-100 cursor-pointer"
                >
                  Verify Key
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
