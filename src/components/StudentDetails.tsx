import React, { useRef, useState } from 'react';
import { Student, TOPIC_LABELS, TOPIC_COLORS, TopicKey, WeeklyReport } from '../types';
import { ArrowLeft, Mail, Award, Calendar, BookOpen, Clock, Download, CheckCircle, Flame, Plus, Briefcase, FileText, Sparkles, Shield, UserCheck, Brain, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface StudentDetailsProps {
  student: Student;
  onBack: () => void;
  onUpdateStudent: (updated: Student) => void;
  userRole?: 'teacher' | 'student';
}

export default function StudentDetails({ student, onBack, onUpdateStudent, userRole = 'teacher' }: StudentDetailsProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showAddWeekForm, setShowAddWeekForm] = useState(false);

  // Editable topic mastery levels for pre-evaluation adjustments
  const [adjustedTopics, setAdjustedTopics] = useState<Record<TopicKey, number>>({
    python: student.topics.python,
    pandas: student.topics.pandas,
    numpy: student.topics.numpy,
    machineLearning: student.topics.machineLearning,
    dl: student.topics.dl,
    nlp: student.topics.nlp,
    genai: student.topics.genai,
  });

  // Keep state synced if student prop rotates
  React.useEffect(() => {
    setAdjustedTopics({
      python: student.topics.python,
      pandas: student.topics.pandas,
      numpy: student.topics.numpy,
      machineLearning: student.topics.machineLearning,
      dl: student.topics.dl,
      nlp: student.topics.nlp,
      genai: student.topics.genai,
    });
  }, [student]);

  // Screening dashboard overlay for unapproved profiles
  if (student.isApproved === false) {
    const data = student.importedData;
    
    // Formula-based auto-assess metrics derived from uploaded portfolio
    const priorHours = data?.priorCodingHours || 0;
    const gpaVal = data?.gpa ? parseFloat(data.gpa) || 3.0 : 3.0;
    
    let domainCompatibility = 50;
    if (data?.primaryDomain.includes('Machine Learning') || data?.primaryDomain.includes('AI')) {
      domainCompatibility = 96;
    } else if (data?.primaryDomain.includes('Computer Science') || data?.primaryDomain.includes('Statistical')) {
      domainCompatibility = 87;
    } else {
      domainCompatibility = 70;
    }

    const readinessScore = Math.min(100, Math.round((gpaVal / 4.0) * 45 + (priorHours / 250) * 35 + (domainCompatibility * 0.20)));
    
    let analysisRecommendation = 'Approve access but mandate introductory homework modules.';
    let riskLevel = 'LOW';
    let riskBg = 'bg-emerald-50 text-emerald-800 border-emerald-100/60';
    
    if (readinessScore >= 82) {
      analysisRecommendation = 'Fast-track credentials setup. Immediate readiness verified.';
      riskLevel = 'MINIMAL RISK';
    } else if (readinessScore >= 62) {
      analysisRecommendation = 'Proceed with approval. Optional peer tutoring suggested.';
      riskLevel = 'MODERATE RISK';
      riskBg = 'bg-amber-50 text-amber-800 border-amber-100/60';
    } else {
      analysisRecommendation = 'Approve access but mandate introductory homework modules.';
      riskLevel = 'AMBIGUOUS';
      riskBg = 'bg-rose-50 text-rose-800 border-rose-100/60';
    }

    const handleApproveWithOffsets = () => {
      const updatedStudent: Student = {
        ...student,
        isApproved: true,
        status: 'active',
        topics: {
          python: adjustedTopics.python,
          pandas: adjustedTopics.pandas,
          numpy: adjustedTopics.numpy,
          machineLearning: adjustedTopics.machineLearning,
          dl: adjustedTopics.dl,
          nlp: adjustedTopics.nlp,
          genai: adjustedTopics.genai,
        }
      };
      onUpdateStudent(updatedStudent);
    };

    return (
      <div className="space-y-8 pb-12 text-left" id="student-credential-screening-hub">
        {/* Back navigation */}
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors shadow-sm cursor-pointer w-fit"
          >
            <ArrowLeft size={16} />
            Back to Registry
          </button>
        </div>

        {/* Screening Core Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Profile overview containing topic offset sliders */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex flex-col items-center justify-center text-center">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${student.avatarStyle} flex items-center justify-center text-white text-3xl font-bold shadow-md`}>
                  {student.name.charAt(0)}{student.name.split(' ')[1]?.charAt(0)}
                </div>
                <h2 className="text-xl font-bold text-slate-800 mt-4">{student.name}</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{student.roleId}</p>

                <div className="flex gap-2 mt-4">
                  <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider">
                    PENDING APPROVAL
                  </span>
                  <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-[10px] font-semibold">
                    {student.batch.split(' - ')[0]}
                  </span>
                </div>
              </div>

              <hr className="border-slate-50" />

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  <span className="text-xs truncate select-all">{student.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar size={16} className="text-slate-400" />
                  <span className="text-xs">Enrolled: {student.enrollmentDate}</span>
                </div>
              </div>
            </div>

            {/* Adjustable Curriculum Offsets - Enables analysis adaptation */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Brain size={14} className="text-blue-500" />
                  Course Mastery Tuning
                </h3>
                <p className="text-[10px] text-slate-450 leading-relaxed">
                  Tweak starting proficiency settings based on your analysis of user coursework.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {(Object.keys(adjustedTopics) as TopicKey[]).map((topicKey) => (
                  <div key={topicKey} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-semibold text-slate-600">{TOPIC_LABELS[topicKey]}</span>
                      <span className="font-mono font-bold text-blue-600 bg-blue-50/50 px-1.5 py-0.5 rounded">
                        {adjustedTopics[topicKey]}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={adjustedTopics[topicKey]}
                      onChange={(e) => setAdjustedTopics(prev => ({ ...prev, [topicKey]: parseInt(e.target.value) }))}
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Incoming Performance Logs and Automated Analytics */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Top Analysis Header Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl text-white shadow-md relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-1/4 translate-x-1/8">
                <Award size={360} />
              </div>
              <div className="space-y-2 max-w-lg">
                <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <Sparkles size={20} className="text-blue-200" />
                  Credentials Portfolio Analysis Panel
                </h3>
                <p className="text-xs text-blue-100 leading-relaxed font-medium">
                  Review student credentials and verify compatibility benchmarks. Approved candidates are granted immediate access to the Day 1–200 daily exams.
                </p>
              </div>
            </div>

            {/* Imported credentials data layout */}
            {data ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
                
                {/* Visual grid checklist */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between min-h-[90px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Academics GPA</span>
                    <span className="text-lg font-bold font-mono text-slate-800 focus:outline-none">{data.gpa}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between min-h-[90px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Hours</span>
                    <span className="text-lg font-bold font-mono text-slate-800">{data.priorCodingHours} hrs</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between min-h-[90px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Primary Focus</span>
                    <span className="text-xs font-bold text-slate-700 truncate" title={data.primaryDomain}>{data.primaryDomain}</span>
                  </div>
                </div>

                {/* Academic Statement block */}
                <div className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-600 flex items-center gap-1.2">
                    <FileText size={13} className="text-slate-450" />
                    <span>Candidate Submission Summary</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold italic">
                    "{data.experienceSummary}"
                  </p>
                </div>

                {/* AI Feasibility & Readiness Assessment circle */}
                <div className="border border-blue-100 bg-blue-50/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  
                  {/* Readiness Circle & Metrics */}
                  <div className="flex items-center gap-5">
                    
                    {/* Circle visual percentage */}
                    <div className="relative w-18 h-18 flex items-center justify-center">
                      <svg className="w-18 h-18 transform -rotate-90">
                        <circle cx="36" cy="36" r="32" className="stroke-blue-100 fill-none" strokeWidth="6" />
                        <circle 
                          cx="36" 
                          cy="36" 
                          r="32" 
                          className="stroke-blue-600 fill-none transition-all duration-1000 ease-in-out" 
                          strokeWidth="6"
                          strokeDasharray={201}
                          strokeDashoffset={201 - (201 * readinessScore / 100)}
                        />
                      </svg>
                      <span className="absolute text-sm font-extrabold text-blue-800 font-mono">{readinessScore}%</span>
                    </div>

                    <div className="space-y-1">
                      <span className="p-1 px-2 text-[8px] font-bold tracking-wider text-blue-700 bg-blue-100 rounded-md">
                        AUTOMATED ADMISSION RECOMMENDATION
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-800 leading-tight">
                        {analysisRecommendation}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                        Evaluated against Course Batch A syllabus pre-requisites.
                      </p>
                    </div>
                  </div>

                  {/* Risk Profile badge */}
                  <div className={`p-3 rounded-xl border font-bold text-xs flex items-center gap-2 px-4 shrink-0 shadow-sm ${riskBg}`}>
                    <Shield size={14} />
                    <span>{riskLevel}</span>
                  </div>
                </div>

                {data.parsedRecordsCount !== undefined && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100/60 rounded-xl text-emerald-800 text-[11px] font-medium flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-600" />
                    <span>Dynamic credentials logs parsed successfully. {data.parsedRecordsCount} modules imported into database parity.</span>
                  </div>
                )}

                {/* Verify / Approve Action Controller */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    onClick={onBack}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Hold Application
                  </button>
                  <button
                    onClick={handleApproveWithOffsets}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-md hover:shadow-emerald-100/50 flex items-center gap-2 cursor-pointer"
                  >
                    <UserCheck size={14} />
                    Verify & Grant Study Lounge Approval
                  </button>
                </div>
              </div>
            ) : (
              // Empty state log when student has not yet entered credentials
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-4 shadow-sm shadow-slate-100/10">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                  <AlertTriangle size={20} className="animate-pulse" />
                </div>
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h4 className="text-sm font-bold text-slate-800">Awaiting Student Portfolio Submission</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    The student has not yet uploaded their academic background files or metrics logs. You can wait for their submit, or select bypass mode below to approve them directly.
                  </p>
                </div>
                <div className="pt-4 flex items-center justify-center">
                  <button
                    onClick={handleApproveWithOffsets}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer"
                  >
                    <UserCheck size={14} />
                    Bypass Review & Approve Access Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // New weekly report form states
  const [attendance, setAttendance] = useState(100);
  const [quizScore, setQuizScore] = useState(85);
  const [hours, setHours] = useState(12);
  const [submissions, setSubmissions] = useState(100);

  // Transform scores for radar mapping
  const topicData = (Object.keys(student.topics) as TopicKey[]).map((key) => ({
    subject: TOPIC_LABELS[key],
    Score: student.topics[key],
    color: TOPIC_COLORS[key],
  }));

  // Average Score Calculation
  const totalTopics = Object.keys(student.topics).length;
  const sumScores = Object.values(student.topics).reduce((a, b) => a + b, 0);
  const averageScore = Math.round((sumScores / totalTopics) * 10) / 10;

  // Grade Assessment
  let letterGrade = 'F';
  let gradeColor = 'text-rose-600 bg-rose-50 border-rose-100';
  if (averageScore >= 92) {
    letterGrade = 'A+';
    gradeColor = 'text-emerald-700 bg-emerald-50 border-emerald-100';
  } else if (averageScore >= 85) {
    letterGrade = 'A';
    gradeColor = 'text-blue-700 bg-blue-50 border-blue-100';
  } else if (averageScore >= 78) {
    letterGrade = 'B';
    gradeColor = 'text-amber-700 bg-amber-50 border-amber-100';
  } else if (averageScore >= 70) {
    letterGrade = 'C';
    gradeColor = 'text-orange-700 bg-orange-50 border-orange-100';
  } else {
    gradeColor = 'text-rose-700 bg-rose-50 border-rose-100';
  }

  // Handle PDF Export using html2canvas & jsPDF
  const exportPDF = async () => {
    const reportElement = reportRef.current;
    if (!reportElement) return;

    setIsExporting(true);

    try {
      // Temporarily show/format target to ensure crystal clear image extraction
      const canvas = await html2canvas(reportElement, {
        scale: 2.5, // Ultra-sharp high DPI resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 12; // crisp header spacing

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`student_report_${student.name.replace(/\s+/g, '_')}_2026.pdf`);
    } catch (err) {
      console.error('Failed to export student assessment:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Add customized week update log
  const handleAddWeekLog = (e: React.FormEvent) => {
    e.preventDefault();
    const nextWeekNumber = student.weeklyReports.length + 1;
    
    let statsStatus: WeeklyReport['status'] = 'good';
    if (quizScore >= 90) statsStatus = 'excellent';
    else if (quizScore >= 75) statsStatus = 'good';
    else if (quizScore >= 60) statsStatus = 'average';
    else statsStatus = 'needs-improvement';

    const newLog: WeeklyReport = {
      weekNumber: nextWeekNumber,
      attendanceRate: attendance,
      quizScore,
      hoursSpent: hours,
      submissionRate: submissions,
      status: statsStatus,
    };

    // Construct updated MonthlyReports automatically based on average shifts
    const updatedWeeks = [...student.weeklyReports, newLog];
    
    const updatedStudent: Student = {
      ...student,
      weeklyReports: updatedWeeks,
    };

    onUpdateStudent(updatedStudent);
    setShowAddWeekForm(false);
    // Reset inputs
    setAttendance(100);
    setQuizScore(80);
    setHours(10);
    setSubmissions(100);
  };

  return (
    <div id={`student-details-${student.id}`} className="space-y-8 pb-12">
      {/* Back button & Primary actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          id="back-to-list-btn"
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors shadow-sm cursor-pointer w-fit"
        >
          <ArrowLeft size={16} />
          Back to Students
        </button>

        <div className="flex gap-3">
          <button
            onClick={exportPDF}
            id="export-pdf-action"
            disabled={isExporting}
            className={`flex items-center gap-2 text-sm font-semibold text-white px-5 py-2 rounded-xl shadow-sm transition-all cursor-pointer ${
              isExporting
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-100/50'
            }`}
          >
            <Download size={16} className={isExporting ? 'animate-bounce' : ''} />
            {isExporting ? 'Compiling PDF...' : 'Download Academic Report (PDF)'}
          </button>
        </div>
      </div>

      {/* Primary detail view split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Sidebar */}
        <div className="space-y-6">
          
          {/* Card profile summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col items-center justify-center text-center">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${student.avatarStyle} flex items-center justify-center text-white text-3xl font-bold shadow-md`}>
                {student.name.charAt(0)}{student.name.split(' ')[1]?.charAt(0)}
              </div>
              <h2 id="student-profile-name" className="text-xl font-bold text-slate-800 mt-4">{student.name}</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{student.roleId}</p>

              <div className="flex gap-2 mt-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  student.status === 'active' 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : student.status === 'on-leave'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {student.status.toUpperCase()}
                </span>
                <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-xs font-medium">
                  {student.batch.split(' - ')[0]}
                </span>
              </div>
            </div>

            <hr className="border-slate-50" />

            {/* Demographics table */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-600">
                <Mail size={16} className="text-slate-400" />
                <span className="text-sm truncate select-all">{student.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Calendar size={16} className="text-slate-400" />
                <span className="text-sm">Enrolled: {student.enrollmentDate}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Briefcase size={16} className="text-slate-400" />
                <span className="text-sm">Cohorts: {student.batch}</span>
              </div>
            </div>

            <hr className="border-slate-50" />

            {/* Grading metrics */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Calculated GPA</p>
                <p className="text-2xl font-bold font-mono text-slate-800 mt-0.5">{averageScore}%</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${gradeColor}`}>
                {letterGrade}
              </div>
            </div>
          </div>

          {/* Curriculum Mastery Grid */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-widest">Syllabus Breakdown</h3>
            <div className="space-y-3">
              {Object.keys(student.topics).map((topic) => {
                const key = topic as TopicKey;
                const score = student.topics[key];
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">{TOPIC_LABELS[key]}</span>
                      <span className="font-mono font-bold text-slate-800">{score}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${score}%`, 
                          backgroundColor: TOPIC_COLORS[key] 
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Analytics & Reporting Dashboard Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Weekly trends chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Weekly Performance Curve</h3>
                <p className="text-xs text-slate-500 mt-0.5">Quiz scores and hours dedicated over weekly iterations</p>
              </div>
              
              {userRole === 'teacher' && (
                <button
                  onClick={() => setShowAddWeekForm(!showAddWeekForm)}
                  className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  Add Weekly Log
                </button>
              )}
            </div>

            {/* Expansible Weekly log submission form */}
            {showAddWeekForm && (
              <form onSubmit={handleAddWeekLog} className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fadeIn">
                <div className="space-y-1">
                  <label htmlFor="log-attendance" className="block text-[10px] uppercase font-bold text-slate-500">Attendance (%)</label>
                  <input 
                    type="number" n-min="0" n-max="100" 
                    id="log-attendance"
                    value={attendance} 
                    onChange={e => setAttendance(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono focus:border-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="log-quiz" className="block text-[10px] uppercase font-bold text-slate-500">Quiz Grade (%)</label>
                  <input 
                    type="number" n-min="0" n-max="100" 
                    id="log-quiz"
                    value={quizScore} 
                    onChange={e => setQuizScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono focus:border-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="log-hours" className="block text-[10px] uppercase font-bold text-slate-500">Study Hours</label>
                  <input 
                    type="number" n-min="0" n-max="100" 
                    id="log-hours"
                    value={hours} 
                    onChange={e => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono focus:border-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="log-submission" className="block text-[10px] uppercase font-bold text-slate-500">Homework Sub (%)</label>
                  <input 
                    type="number" n-min="0" n-max="100" 
                    id="log-submission"
                    value={submissions} 
                    onChange={e => setSubmissions(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono focus:border-slate-800 focus:outline-none"
                  />
                </div>
                <div className="col-span-2 sm:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-200/40">
                  <button 
                    type="button" 
                    onClick={() => setShowAddWeekForm(false)}
                    className="bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Save Log
                  </button>
                </div>
              </form>
            )}

            <div id="student-weekly-trend-chart" className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={student.weeklyReports} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis 
                    dataKey="weekNumber" 
                    tickFormatter={(val) => `Week ${val}`}
                    tick={{ fill: '#64748B', fontSize: 11 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    yAxisId="left"
                    domain={[0, 100]} 
                    tick={{ fill: '#64748B', fontSize: 11 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 25]} 
                    tick={{ fill: '#64748B', fontSize: 11 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #ECEFF1', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
                    labelFormatter={(label) => `Week ${label} Performance`}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="quizScore" 
                    name="Quiz Grades (%)"
                    stroke="#2563eb" 
                    strokeWidth={3} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="hoursSpent" 
                    name="Study Hours"
                    stroke="#10B981" 
                    strokeWidth={2.5} 
                    dot={{ r: 4 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly milestones reports list */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Teacher Monthly Summararies</h3>
            
            <div className="space-y-4">
              {student.monthlyReports.map((report, idx) => (
                <div key={idx} className="bg-slate-50/60 p-5 rounded-xl border border-slate-100 flex flex-col sm:flex-row gap-4 items-start">
                  <div className="sm:w-1/4">
                    <p className="text-xs font-bold text-slate-400 font-mono tracking-wide">{report.month.toUpperCase()}</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">{report.overallProgress}%</p>
                    <p className="text-[10px] text-slate-600 font-medium">Monthly Assessment Score</p>
                  </div>
                  
                  <div className="sm:w-3/4 space-y-2">
                    <div className="flex gap-4 text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1">
                        <BookOpen size={13} />
                        GPA Average: {report.avgScore}%
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle size={13} />
                        Completed Projects: {report.completedProjects}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed italic bg-white p-3.5 rounded-lg border border-slate-100">
                      "{report.feedback}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/************************************************************************
       * HIDDEN PRINTABLE CONTAINER FOR CRYSTAL-CLEAR PDF COMPILATION
       ************************************************************************/}
      <div className="absolute -left-[9999px] top-0 pointer-events-none">
        <div 
          ref={reportRef} 
          className="w-[794px] min-h-[1110px] bg-white p-12 relative flex flex-col justify-between text-slate-800 border-[16px] border-slate-900"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          {/* A4 Report Header Content */}
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b-2 border-slate-100 pb-5">
              <div>
                <span className="bg-slate-900 text-white font-mono text-[9px] font-bold tracking-widest px-2.5 py-1 rounded">
                  DATA SCIENCE & AI CURRICULUM
                </span>
                <h1 className="text-2xl font-black text-slate-900 mt-2.5 tracking-tight">ACADEMIC PERFORMANCE REPORT</h1>
                <p className="text-slate-500 text-xs mt-1">Generated formally on {new Date().toLocaleDateString('en-US')}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900 font-mono">STU-ACADEMY-2026</p>
                <p className="text-[10px] text-slate-600 mt-0.5">Report ID: {student.roleId}</p>
              </div>
            </div>

            {/* Subject Meta Cards */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-lg border border-slate-100">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase">STUDENT PROFILE</p>
                <p className="text-base font-bold text-slate-900">{student.name}</p>
                <p className="text-xs text-slate-600">{student.email}</p>
              </div>
              <div className="space-y-1.5 text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">COHORT / COHORT PROGRAM</p>
                <p className="text-xs font-semibold text-slate-800">{student.batch}</p>
                <p className="text-xs text-slate-500">Enrollment Date: {student.enrollmentDate}</p>
              </div>
            </div>

            {/* Middle Section: Scores Map & Mastery Matrix */}
            <div className="grid grid-cols-5 gap-6 pt-2">
              
              {/* Mastery Grades table */}
              <div className="col-span-3 space-y-4">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Syllabus Competency Matrix</h2>
                <div className="border border-slate-100 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-3">Technical Course Module</th>
                        <th className="py-2.5 px-3 text-right">Percentage Mastery</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {Object.keys(student.topics).map((topic) => {
                        const key = topic as TopicKey;
                        const score = student.topics[key];
                        return (
                          <tr key={key}>
                            <td className="py-2 px-3 font-medium text-slate-700">{TOPIC_LABELS[key]}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{score}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* High Score Cards (Circle Indicator) */}
              <div className="col-span-2 flex flex-col justify-between border border-slate-100 rounded-lg p-5 bg-white text-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Grade Point Average</p>
                  <p className="text-5xl font-black text-indigo-600 font-mono mt-4">{averageScore}%</p>
                  <p className="text-sm font-bold text-slate-700 mt-2">Class Classification: Rating {letterGrade}</p>
                </div>
                
                <div className="pt-4 border-t border-slate-50 text-center text-[10px] leading-relaxed text-slate-600 mt-2">
                  Academic indicators demonstrate structural competence in coding environments, algorithmic thinking patterns, and deep AI alignments.
                </div>
              </div>
            </div>

            {/* Historical weekly logs inside the Report */}
            <div className="space-y-3 pt-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Recent Classroom Activity Metrics</h2>
              <div className="grid grid-cols-4 gap-3">
                {student.weeklyReports.slice(0, 4).map((w, idx) => (
                  <div key={idx} className="border border-slate-100 p-3 rounded-lg text-center bg-slate-50/60">
                    <p className="text-[9px] font-bold text-slate-500 font-mono">WEEK {w.weekNumber}</p>
                    <p className="text-base font-extrabold text-slate-800 font-mono mt-1">{w.quizScore}%</p>
                    <p className="text-[9px] text-slate-600 mt-0.5">Study: {w.hoursSpent} Hours</p>
                    <span className="text-[8px] bg-indigo-50 text-indigo-700 rounded px-1 py-0.5 mt-1 inline-block font-bold">
                      {w.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback summary */}
            <div className="space-y-2.5 pt-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Instructors Assessment Feedback</h2>
              <div className="bg-slate-50/80 p-4 rounded-lg border border-slate-100 space-y-3">
                {student.monthlyReports.map((mr, idx) => (
                  <div key={idx} className="text-xs leading-relaxed">
                    <p className="font-extrabold text-slate-800 font-mono">{mr.month.toUpperCase()} Milestone:</p>
                    <p className="text-slate-600 italic mt-0.5">"{mr.feedback}"</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Footer signature area */}
          <div className="flex justify-between items-end pt-5 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
            <div>
              <p>Certified Academic Record</p>
              <p className="text-slate-500 mt-0.5">Advanced Data & AI Analytics Platform</p>
            </div>
            <div className="text-right">
              <p className="font-none italic border-b border-slate-800 pb-1 w-28 ml-auto text-slate-600 font-serif">A. Johnston</p>
              <p className="mt-1 text-[8px] uppercase font-bold text-slate-500">Authorized Lead Evaluator</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
