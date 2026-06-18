import { Student, TOPIC_LABELS, TOPIC_COLORS, TopicKey } from '../types';
import { Users, GraduationCap, Clock, CheckCircle2, TrendingUp, ChevronRight, Award, AlertCircle, Lock, Unlock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface DashboardOverviewProps {
  students: Student[];
  onSelectStudent: (id: string) => void;
  onOpenAddModal: () => void;
  userRole?: 'teacher' | 'student';
  lockedTopics?: Record<TopicKey, boolean>;
  onToggleTopicLock?: (topic: TopicKey, isLocked: boolean) => void;
}

export default function DashboardOverview({ 
  students, 
  onSelectStudent, 
  onOpenAddModal,
  userRole = 'teacher',
  lockedTopics = {
    python: false,
    pandas: false,
    numpy: false,
    machineLearning: true,
    dl: true,
    nlp: true,
    genai: true
  },
  onToggleTopicLock = () => {}
}: DashboardOverviewProps) {
  // Aggregate stats
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active').length;
  const onLeaveStudents = students.filter(s => s.status === 'on-leave').length;

  // Track overall averages
  const subjects: { key: TopicKey; label: string }[] = [
    { key: 'python', label: 'Tuple Operations' },
    { key: 'pandas', label: 'Set Structures' },
    { key: 'numpy', label: 'Dictionary Mapping' },
    { key: 'machineLearning', label: 'Object-Oriented OOPs' },
    { key: 'dl', label: 'Exception Handling' },
    { key: 'nlp', label: 'Modules & Packages' },
    { key: 'genai', label: 'Mixed Interview Questions' },
  ];

  // Calculate subject-wise classroom averages
  const subjectAverages = subjects.map(sub => {
    const sum = students.reduce((acc, curr) => acc + (curr.topics[sub.key] || 0), 0);
    const avg = totalStudents > 0 ? sum / totalStudents : 0;
    return {
      subject: sub.label,
      Abbreviation: sub.key.toUpperCase(),
      Average: Math.round(avg * 10) / 10,
      color: TOPIC_COLORS[sub.key],
    };
  });

  // Calculate class GPA (average score of all scores)
  let sumAllScores = 0;
  let countAllScores = 0;
  students.forEach(s => {
    Object.values(s.topics).forEach(score => {
      sumAllScores += score;
      countAllScores += 1;
    });
  });
  const classAverage = countAllScores > 0 ? Math.round((sumAllScores / countAllScores) * 10) / 10 : 0;

  // Calculate average attendance & submission from the latest weeks
  let sumWeeklyAttendance = 0;
  let sumWeeklySubmissions = 0;
  let countWeeks = 0;
  
  students.forEach(s => {
    s.weeklyReports.forEach(w => {
      sumWeeklyAttendance += w.attendanceRate;
      sumWeeklySubmissions += w.submissionRate;
      countWeeks += 1;
    });
  });

  const avgAttendance = countWeeks > 0 ? Math.round(sumWeeklyAttendance / countWeeks) : 0;
  const avgSubmission = countWeeks > 0 ? Math.round(sumWeeklySubmissions / countWeeks) : 0;

  // Identify top students based on overall topic average
  const rankedStudents = students.map(s => {
    const sum = Object.values(s.topics).reduce((a, b) => a + b, 0);
    const avg = sum / 7;
    return { ...s, topicAverage: Math.round(avg * 10) / 10 };
  }).sort((a, b) => b.topicAverage - a.topicAverage);

  const topStudents = rankedStudents.slice(0, 3);
  const strugglingStudents = rankedStudents.filter(s => s.topicAverage < 80).slice(0, 3);

  // Custom tooltips
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg">
          <p className="text-xs font-semibold text-slate-300">{payload[0].name}</p>
          <p className="text-sm font-mono font-bold text-white mt-0.5">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="dashboard-overview" className="space-y-8">
      {/* 1. Classroom Summary Cards */}
      <h2 className="sr-only">Dashboard Key Summary Metrics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Registered */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Registered Class</p>
            <p className="text-2xl font-bold font-mono text-slate-800">{totalStudents}</p>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {activeStudents} actively learning
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 text-slate-700 rounded-xl">
            <Users size={24} />
          </div>
        </div>

        {/* Global Level average */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Class Grade Average</p>
            <p className="text-2xl font-bold font-mono text-slate-800">{classAverage}%</p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <TrendingUp size={12} className="text-slate-400" />
              Over 7 curriculums
            </p>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <GraduationCap size={24} />
          </div>
        </div>

        {/* Assignment Submissions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Assignment Rate</p>
            <p className="text-2xl font-bold font-mono text-slate-800">{avgSubmission}%</p>
            <p className="text-xs text-emerald-600 font-medium">
              Target benchmark &gt; 85%
            </p>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Attendance Index */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Live Attendance</p>
            <p className="text-2xl font-bold font-mono text-slate-800">{avgAttendance}%</p>
            <p className="text-xs text-slate-500">
              Weekly live sessions tracker
            </p>
          </div>
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* 2. Visual Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Course performance bar chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Class Syllabus Mastery</h3>
              <p className="text-xs text-slate-500 mt-0.5">Average scores of all students across subjects</p>
            </div>
          </div>

          <div id="dashboard-bar-chart" className="h-[320px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={subjectAverages}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="subject" 
                  tick={{ fill: '#64748B', fontSize: 11 }} 
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tickFormatter={(val) => val.split(' ')[0]} // Show first word to keep clean
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fill: '#64748B', fontSize: 11 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={CustomTooltip} cursor={{ fill: '#F8FAFC' }} />
                <Bar 
                  dataKey="Average" 
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]} 
                  maxBarSize={38}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar analysis of curriculum footprint */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Curriculum Footprint</h3>
            <p className="text-xs text-slate-500 mt-0.5">Balance distribution of data science modules</p>
          </div>

          <div id="dashboard-radar-chart" className="h-[260px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectAverages}>
                <PolarGrid stroke="#F1F5F9" />
                <PolarAngleAxis 
                  dataKey="Abbreviation" 
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar 
                  name="Class Average" 
                  dataKey="Average" 
                  stroke="#2563eb" 
                  fill="#3b82f6" 
                  fillOpacity={0.15} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center text-xs text-slate-500 px-2">
            Math foundation (NumPy/Pandas) is highly synced with ML theory. GenAI leads with modern engagement.
          </div>
        </div>
      </div>

      {/* 3. Class Standout & Attention Required */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Top Performers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Award className="text-amber-500" size={18} />
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-widest">Class Standouts (Highest GPA)</h3>
          </div>

          <div className="space-y-3">
            {topStudents.map((s, idx) => (
              <div 
                key={s.id}
                onClick={() => onSelectStudent(s.id)}
                className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-slate-100/50 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 font-mono font-bold text-xs border border-amber-100">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{s.name}</h4>
                    <p className="text-xs text-slate-400 font-mono">{s.roleId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold font-mono text-slate-800">{s.topicAverage}%</p>
                    <p className="text-[10px] text-slate-400">Class Average</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Underachieving or needs review */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-rose-500" size={18} />
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-widest">Action Required (GPA &lt; 80%)</h3>
          </div>

          {strugglingStudents.length === 0 ? (
            <div className="h-[210px] flex flex-col items-center justify-center text-center p-4">
              <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Excellent Class Cohort</p>
              <p className="text-xs text-slate-400 max-w-[240px] mt-1">All registered students are currently tracking above the 80% competency line!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {strugglingStudents.map((s) => (
                <div 
                  key={s.id}
                  onClick={() => onSelectStudent(s.id)}
                  className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-slate-100/50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 font-bold text-xs border border-rose-100">
                      Need
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{s.name}</h4>
                      <p className="text-xs text-slate-400 font-mono">{s.roleId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold font-mono text-rose-600">{s.topicAverage}%</p>
                      <p className="text-[10px] text-slate-400">Suggest Review</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🔐 CURRICULUM ACCESSIBILITY MANAGER / LOCK MATRIX */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <Lock size={15} className="text-slate-600 animate-pulse" />
            Curriculum Syllabus Access Matrix
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {userRole === 'teacher' 
              ? "Instructor Override: Toggle locks below to instantly grant or lock down access to modular subjects." 
              : "Topic Access Gateways: Locked subjects require an instructor's auth key to initiate daily tests."}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {subjects.map((sub) => {
            const isLocked = lockedTopics[sub.key];
            return (
              <div 
                key={sub.key} 
                className={`p-4 rounded-xl border transition-all text-center flex flex-col justify-between min-h-[120px] ${
                  isLocked 
                    ? 'bg-slate-50 border-slate-200 text-slate-500' 
                    : 'bg-white border-blue-100 shadow-sm text-slate-800 hover:border-blue-300'
                }`}
              >
                <div>
                  <div 
                    className="w-2.5 h-2.5 rounded-full mx-auto" 
                    style={{ backgroundColor: isLocked ? '#94a3b8' : TOPIC_COLORS[sub.key] }}
                  />
                  <p className="text-[11px] font-bold mt-2 leading-tight uppercase font-mono truncate" title={sub.label}>
                    {sub.key}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5 truncate">
                    {sub.label.split(' ')[0]}
                  </p>
                </div>

                <div className="pt-2 w-full">
                  {userRole === 'teacher' ? (
                    <button
                      type="button"
                      onClick={() => onToggleTopicLock(sub.key, !isLocked)}
                      className={`w-full py-1 rounded text-[9px] font-extrabold uppercase transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        isLocked 
                          ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200' 
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50'
                      }`}
                    >
                      {isLocked ? <Lock size={9} /> : <Unlock size={9} />}
                      {isLocked ? 'Locked' : 'Active'}
                    </button>
                  ) : (
                    <span className={`inline-flex items-center justify-center w-full gap-1 text-[9px] font-extrabold py-1 rounded border uppercase ${
                      isLocked ? 'bg-rose-50/50 text-rose-600 border-rose-150' : 'bg-emerald-50/50 text-emerald-700 border-emerald-150'
                    }`}>
                      {isLocked ? 'Locked' : 'Open'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
