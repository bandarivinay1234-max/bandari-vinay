import React, { useState, useEffect } from 'react';
import { Student, TopicScores, WeeklyReport, MonthlyReport } from '../types';
import { X, Save, Sparkles, Shield } from 'lucide-react';
import { motion } from 'motion/react';

interface StudentFormProps {
  student?: Student; // If provided, we are editing. Otherwise, creating.
  onSave: (student: Student) => void;
  onClose: () => void;
}

export default function StudentForm({ student, onSave, onClose }: StudentFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [batch, setBatch] = useState('Advanced AI & Data Science - Batch A');
  const [status, setStatus] = useState<'active' | 'inactive' | 'on-leave'>('active');
  const [isApproved, setIsApproved] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Topic Scores State
  const [topics, setTopics] = useState<TopicScores>({
    python: 80,
    pandas: 80,
    numpy: 80,
    machineLearning: 75,
    dl: 70,
    nlp: 70,
    genai: 75,
  });

  useEffect(() => {
    if (student) {
      setName(student.name);
      setEmail(student.email);
      setRoleId(student.roleId);
      setBatch(student.batch);
      setStatus(student.status);
      setTopics({ ...student.topics });
      setIsApproved(student.isApproved !== false);
      setPhoneNumber(student.phoneNumber || '');
    } else {
      // Auto-generate some randomized STU-ID for convenience
      const randomId = `STU-2026-${Math.floor(100 + Math.random() * 900)}`;
      setRoleId(randomId);
      setIsApproved(false); // Default to false so they must log in and match to approve
      setPhoneNumber(''); // Default to empty so instructor fills the actual mobile number
    }
  }, [student]);

  const handleScoreChange = (topic: keyof TopicScores, value: number) => {
    // Clamp between 0 and 100
    const clamped = Math.max(0, Math.min(100, isNaN(value) ? 0 : value));
    setTopics((prev) => ({
      ...prev,
      [topic]: clamped,
    }));
  };

  const handleRandomizeScores = () => {
    setTopics({
      python: Math.floor(70 + Math.random() * 30),
      pandas: Math.floor(65 + Math.random() * 35),
      numpy: Math.floor(65 + Math.random() * 35),
      machineLearning: Math.floor(60 + Math.random() * 40),
      dl: Math.floor(55 + Math.random() * 45),
      nlp: Math.floor(55 + Math.random() * 45),
      genai: Math.floor(60 + Math.random() * 40),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    let finalWeeklyReports: WeeklyReport[] = student?.weeklyReports || [];
    let finalMonthlyReports: MonthlyReport[] = student?.monthlyReports || [];

    // If creating a brand new student, populate mock history matched to their grades for fully loaded, gorgeous dashboard charts
    if (!student || finalWeeklyReports.length === 0) {
      const avgGrade = Math.round(
        (topics.python + topics.pandas + topics.numpy + topics.machineLearning + topics.dl + topics.nlp + topics.genai) / 7
      );

      // Create 6 weeks of logs
      finalWeeklyReports = Array.from({ length: 6 }, (_, idx) => {
        const weekNum = idx + 1;
        const randomness = Math.floor(Math.random() * 15) - 7; // -7 to +7
        const quizScore = Math.max(50, Math.min(100, avgGrade + randomness));
        const hours = Math.max(6, Math.min(25, Math.floor((quizScore / 100) * 15) + Math.floor(Math.random() * 5)));
        const submission = Math.max(70, Math.min(100, 90 + Math.floor(Math.random() * 12)));
        
        let reportStatus: WeeklyReport['status'] = 'good';
        if (quizScore >= 90) reportStatus = 'excellent';
        else if (quizScore >= 75) reportStatus = 'good';
        else if (quizScore >= 60) reportStatus = 'average';
        else reportStatus = 'needs-improvement';

        return {
          weekNumber: weekNum,
          attendanceRate: Math.max(80, Math.min(100, 95 + Math.floor(Math.random() * 6))),
          quizScore,
          hoursSpent: hours,
          submissionRate: submission,
          status: reportStatus,
        };
      });

      // Create 2 months of summaries
      finalMonthlyReports = [
        {
          month: 'Month 1 (Fundamentals)',
          avgScore: Math.round((topics.python + topics.pandas + topics.numpy) / 3),
          completedProjects: Math.floor(2 + Math.random() * 2),
          overallProgress: Math.min(100, Math.round((topics.python + topics.pandas + topics.numpy) / 3) + 5),
          feedback: `${name} demonstrated functional proficiency in the foundational modules. Continued focus on structural optimizations is recommended.`,
        },
        {
          month: 'Month 2 (Modern ML & AI)',
          avgScore: Math.round((topics.machineLearning + topics.dl + topics.nlp + topics.genai) / 4),
          completedProjects: Math.floor(2 + Math.random() * 3),
          overallProgress: Math.min(100, Math.round((topics.machineLearning + topics.dl + topics.nlp + topics.genai) / 4) + 4),
          feedback: `Good effort across advanced data modeling and learning pipelines. Showing a healthy curiosity for newly introduced generative models.`,
        },
      ];
    }

    const savedStudent: Student = {
      id: student?.id || `stu-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      roleId: roleId.trim() || `STU-2026-${Math.floor(100 + Math.random() * 900)}`,
      phoneNumber: phoneNumber.trim(),
      batch,
      avatarStyle: student?.avatarStyle || getRandomAvatarGradient(),
      topics,
      weeklyReports: finalWeeklyReports,
      monthlyReports: finalMonthlyReports,
      enrollmentDate: student?.enrollmentDate || new Date().toISOString().split('T')[0],
      status,
      isApproved,
    };

    onSave(savedStudent);
  };

  const getRandomAvatarGradient = () => {
    const gradients = [
      'from-cyan-500 to-blue-600',
      'from-amber-500 to-rose-600',
      'from-emerald-500 to-teal-600',
      'from-indigo-500 to-purple-600',
      'from-orange-500 to-red-600',
      'from-pink-500 to-rose-600',
      'from-violet-500 to-fuchsia-600',
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        id="student-form-modal"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h2 id="modal-title" className="text-xl font-bold text-slate-800">
              {student ? `Edit Profile: ${student.name}` : 'Register New Student'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Provide student profile details and grade cards below.
            </p>
          </div>
          <button
            onClick={onClose}
            id="close-modal-btn"
            className="p-2 cursor-pointer hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Demographics */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
              1. Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="student-name" className="block text-xs font-medium text-slate-600 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="student-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 text-sm"
                  placeholder="Arjun Mehta"
                  required
                />
              </div>

              <div>
                <label htmlFor="student-email" className="block text-xs font-medium text-slate-600 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  id="student-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 text-sm"
                  placeholder="arjun@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="student-id" className="block text-xs font-medium text-slate-600 mb-1">
                  Student Registration ID
                </label>
                <input
                  type="text"
                  id="student-id"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 text-sm font-mono"
                  placeholder="STU-2026-000"
                />
              </div>

              <div>
                <label htmlFor="student-phone" className="block text-xs font-medium text-slate-600 mb-1">
                  Matching Phone Number <span className="text-rose-500">*Mandatory</span>
                </label>
                <input
                  type="text"
                  id="student-phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 text-sm font-mono"
                  placeholder="e.g. 9876543210"
                  required
                />
              </div>

              <div>
                <label htmlFor="student-status" className="block text-xs font-medium text-slate-600 mb-1">
                  Enrollment Status
                </label>
                <select
                  id="student-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 text-sm bg-white"
                >
                  <option value="active">Active Study</option>
                  <option value="on-leave">On Sabbatical / Leave</option>
                  <option value="inactive">Inactive / Graduated</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="student-batch" className="block text-xs font-medium text-slate-600 mb-1">
                  Batch / Cohort
                </label>
                <select
                  id="student-batch"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 text-sm bg-white"
                >
                  <option value="Advanced AI & Data Science - Batch A">Advanced AI & Data Science - Batch A</option>
                  <option value="Practical Data Science - Batch B">Practical Data Science - Batch B</option>
                  <option value="Deep Learning Engineering Bootcamp">Deep Learning Engineering Bootcamp</option>
                  <option value="Generative AI Research Lab">Generative AI Research Lab</option>
                </select>
              </div>

              <div className="sm:col-span-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100/60 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Shield size={14} className="text-blue-500" />
                    <span>Instructor Access Approval</span>
                  </label>
                  <p className="text-[10px] text-slate-500">
                    If unapproved, the student cannot enter their learning lounge and is blocked from taking quizzes.
                  </p>
                </div>
                <button
                  type="button"
                  id="approval-toggle-switch"
                  onClick={() => setIsApproved(!isApproved)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isApproved ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isApproved ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Topic Grades */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                2. Topic Skill Mastery (%)
              </h3>
              <button
                type="button"
                onClick={handleRandomizeScores}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Sparkles size={13} />
                Randomize / AI Guess Scores
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
              Set scores from 0 to 100 for each technical course. New profiles will auto-generate associated historic weekly reporting and project completions matching these ratings.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {/* Python */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <label htmlFor="score-python">Python Scripting</label>
                  <span>{topics.python}%</span>
                </div>
                <div className="flex gap-3 items-center">
                  <input
                    type="range"
                    id="score-python"
                    min="0"
                    max="100"
                    value={topics.python}
                    onChange={(e) => handleScoreChange('python', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <input
                    type="number"
                    value={topics.python}
                    onChange={(e) => handleScoreChange('python', parseInt(e.target.value))}
                    className="w-14 px-1.5 py-1 text-center border rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* NumPy */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <label htmlFor="score-numpy">NumPy Matrix Operations</label>
                  <span>{topics.numpy}%</span>
                </div>
                <div className="flex gap-3 items-center">
                  <input
                    type="range"
                    id="score-numpy"
                    min="0"
                    max="100"
                    value={topics.numpy}
                    onChange={(e) => handleScoreChange('numpy', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <input
                    type="number"
                    value={topics.numpy}
                    onChange={(e) => handleScoreChange('numpy', parseInt(e.target.value))}
                    className="w-14 px-1.5 py-1 text-center border rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Pandas */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <label htmlFor="score-pandas">Pandas Dataframes</label>
                  <span>{topics.pandas}%</span>
                </div>
                <div className="flex gap-3 items-center">
                  <input
                    type="range"
                    id="score-pandas"
                    min="0"
                    max="100"
                    value={topics.pandas}
                    onChange={(e) => handleScoreChange('pandas', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <input
                    type="number"
                    value={topics.pandas}
                    onChange={(e) => handleScoreChange('pandas', parseInt(e.target.value))}
                    className="w-14 px-1.5 py-1 text-center border rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Machine Learning */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <label htmlFor="score-ml">Machine Learning (Scikit)</label>
                  <span>{topics.machineLearning}%</span>
                </div>
                <div className="flex gap-3 items-center">
                  <input
                    type="range"
                    id="score-ml"
                    min="0"
                    max="100"
                    value={topics.machineLearning}
                    onChange={(e) => handleScoreChange('machineLearning', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <input
                    type="number"
                    value={topics.machineLearning}
                    onChange={(e) => handleScoreChange('machineLearning', parseInt(e.target.value))}
                    className="w-14 px-1.5 py-1 text-center border rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Deep Learning */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <label htmlFor="score-dl">Deep Learning & PyTorch (dl)</label>
                  <span>{topics.dl}%</span>
                </div>
                <div className="flex gap-3 items-center">
                  <input
                    type="range"
                    id="score-dl"
                    min="0"
                    max="100"
                    value={topics.dl}
                    onChange={(e) => handleScoreChange('dl', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <input
                    type="number"
                    value={topics.dl}
                    onChange={(e) => handleScoreChange('dl', parseInt(e.target.value))}
                    className="w-14 px-1.5 py-1 text-center border rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* NLP */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <label htmlFor="score-nlp">Natural Language Processing (nlp)</label>
                  <span>{topics.nlp}%</span>
                </div>
                <div className="flex gap-3 items-center">
                  <input
                    type="range"
                    id="score-nlp"
                    min="0"
                    max="100"
                    value={topics.nlp}
                    onChange={(e) => handleScoreChange('nlp', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <input
                    type="number"
                    value={topics.nlp}
                    onChange={(e) => handleScoreChange('nlp', parseInt(e.target.value))}
                    className="w-14 px-1.5 py-1 text-center border rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* GenAI */}
              <div className="space-y-1 sm:col-span-2">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <label htmlFor="score-genai">Generative AI & LLMs (genai)</label>
                  <span>{topics.genai}%</span>
                </div>
                <div className="flex gap-3 items-center">
                  <input
                    type="range"
                    id="score-genai"
                    min="0"
                    max="100"
                    value={topics.genai}
                    onChange={(e) => handleScoreChange('genai', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <input
                    type="number"
                    value={topics.genai}
                    onChange={(e) => handleScoreChange('genai', parseInt(e.target.value))}
                    className="w-14 px-1.5 py-1 text-center border rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              id="cancel-form-btn"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-form-btn"
              className="px-5 py-2.5 rounded-xl bg-blue-600 border border-transparent text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save size={16} />
              {student ? 'Update Profile' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
