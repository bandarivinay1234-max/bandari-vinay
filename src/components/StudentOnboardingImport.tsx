import React, { useState, useRef } from 'react';
import { Student, StudentImportedData } from '../types';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  Download, 
  Sparkles, 
  Shield, 
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  Clock,
  BookOpen
} from 'lucide-react';
import { motion } from 'motion/react';

interface StudentOnboardingImportProps {
  student: Student;
  onSaveImportedData: (importedData: StudentImportedData) => void;
}

export default function StudentOnboardingImport({
  student,
  onSaveImportedData,
}: StudentOnboardingImportProps) {
  // Form fields state
  const [gpa, setGpa] = useState('');
  const [hours, setHours] = useState('50');
  const [domain, setDomain] = useState('Machine Learning Research');
  const [summary, setSummary] = useState('');
  const [pastedJson, setPastedJson] = useState('');
  
  // Drag & drop / upload states
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [parsedRecordsCount, setParsedRecordsCount] = useState<number | undefined>(undefined);
  const [parseError, setParseError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download sample json template
  const handleDownloadTemplate = () => {
    const template = {
      studentId: student.roleId,
      studentName: student.name,
      overallGPA: "3.85",
      totalCodingHours: 240,
      enrolledSpecialty: "Deep Learning & NLP",
      priorModulesCompleted: [
        { name: "Python Core Automation", score: 95 },
        { name: "Matrix Algebra & Vector Calculus", score: 88 },
        { name: "Pandas Exploratory Analysis", score: 92 },
        { name: "Gradient Descent Optimization", score: 81 }
      ]
    };
    
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${student.roleId}_academic_assessment_profile.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper to parse file core contents
  const parseJSONContent = (text: string) => {
    try {
      const data = JSON.parse(text);
      let count = 0;
      if (data.priorModulesCompleted && Array.isArray(data.priorModulesCompleted)) {
        count = data.priorModulesCompleted.length;
      } else {
        // try to scan root keys count
        count = Object.keys(data).length;
      }
      
      setParsedRecordsCount(count);
      setUploadedFileName(uploadedFileName || 'academic_upload.json');
      setParseError('');

      // Auto-populate fields if keys match
      if (data.overallGPA) setGpa(data.overallGPA);
      if (data.totalCodingHours) setHours(String(data.totalCodingHours));
      if (data.enrolledSpecialty) setDomain(data.enrolledSpecialty);
      if (data.priorModulesCompleted) {
        setSummary(`Successfully uploaded academic log with ${count} completed courses. Average course scores indicated high command.`);
      }
    } catch (err) {
      setParseError('Failed to parse file. Please upload a valid JSON template file.');
      setParsedRecordsCount(undefined);
    }
  };

  // Handle drag event
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseJSONContent(text);
      };
      reader.readAsText(file);
    }
  };

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseJSONContent(text);
      };
      reader.readAsText(file);
    }
  };

  const handleManualUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Submit complete form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gpa) {
      alert("Please specify your current or past GPA.");
      return;
    }
    if (!summary) {
      alert("Please provide a brief student assessment description.");
      return;
    }

    onSaveImportedData({
      gpa,
      priorCodingHours: Number(hours) || 0,
      primaryDomain: domain,
      experienceSummary: summary,
      pastedJsonNotes: pastedJson || undefined,
      submittedAt: new Date().toISOString(),
      parsedRecordsCount: parsedRecordsCount
    });
  };

  // Render when already submitted
  if (student.importedData) {
    const data = student.importedData;
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 max-w-4xl mx-auto space-y-6 shadow-sm shadow-slate-100/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold tracking-wider uppercase border border-orange-100">
                Awaiting Instructor Analysis
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Academic Readiness Portfolio</h3>
            <p className="text-xs text-slate-500">Submitted at {new Date(data.submittedAt).toLocaleString()}</p>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-600 font-medium">
            <Shield size={14} className="text-orange-500 shrink-0 animate-pulse" />
            <span>Identity Workspace Credentials Securely Enqueued</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={11} className="text-blue-500" />
              Academic Metrics
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-mono">Past GPA / Grades</span>
                <span className="font-bold text-slate-800 bg-white border border-slate-200 px-2.5 py-0.5 rounded font-mono">{data.gpa}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-mono">Prior Code Hours</span>
                <span className="font-bold text-slate-800 bg-white border border-slate-200 px-2.5 py-0.5 rounded font-mono">{data.priorCodingHours}h</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-mono">Interest Domain</span>
                <span className="font-bold text-slate-800 max-w-[140px] truncate" title={data.primaryDomain}>{data.primaryDomain}</span>
              </div>
              {data.parsedRecordsCount !== undefined && (
                <div className="flex justify-between items-center text-xs bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
                  <span className="text-blue-700 font-bold flex items-center gap-1">
                    <CheckCircle size={12} />
                    Verified Records
                  </span>
                  <span className="font-extrabold text-blue-800 font-mono">{data.parsedRecordsCount} modules</span>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Statement of Educational Interest</h4>
              <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed font-medium">
                "{data.experienceSummary}"
              </p>
            </div>
            
            <div className="p-4 bg-orange-50/40 rounded-xl border border-orange-100/65 flex items-start gap-3">
              <Info size={15} className="text-orange-600 mt-0.5 shrink-0" />
              <div className="space-y-1 text-left">
                <h5 className="text-xs font-bold text-orange-800">What happens next?</h5>
                <p className="text-[11px] text-orange-700/90 leading-relaxed">
                  Your instructor can now view this profile analysis in the <strong>Student Database</strong>. They will analyze your historical academic credentials and grant dynamic exam permissions. You will be notified instantly here once write-approval is toggled!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-8 max-w-4xl mx-auto space-y-6 shadow-sm shadow-slate-100/40 text-left" id="student-onboarding-credentials-form">
      <div className="pb-6 border-b border-slate-100 space-y-1">
        <h3 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <BookOpen className="text-blue-500" size={20} />
          Submit Academic History for Course Verification
        </h3>
        <p className="text-xs text-slate-500">
          Please input or import your external credentials. Instructors analyze high-level readiness profiles to activate your daily test-taking access.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
        
        {/* Left Section: Input Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Average Grade / GPA
              </label>
              <input
                type="text"
                placeholder="e.g. 3.8 / A"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl py-2 px-3 outline-none font-bold focus:border-blue-500 focus:bg-white transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Prior Coding Hours
              </label>
              <input
                type="number"
                placeholder="e.g. 150"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl py-2 px-3 outline-none font-bold focus:border-blue-500 focus:bg-white transition-all font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Primary Area of Study
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl py-2 px-3 outline-none font-bold focus:border-blue-500 focus:bg-white transition-all"
            >
              <option value="Machine Learning Research">Machine Learning Research</option>
              <option value="Computer Science Core">Computer Science Core</option>
              <option value="Statistical Modelling">Statistical Modelling</option>
              <option value="Frontend engineering">Frontend Engineering</option>
              <option value="Backend Database Architectures">Backend Database Architectures</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Academic Background & Experience Summary
            </label>
            <textarea
              placeholder="e.g. Enrolled in Bachelor's of CS. Completed fundamental OOP, Python scripting, and basics of Pandas. Eager to master deep neural models in DS-Academy."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl py-2.5 px-3 outline-none font-medium focus:border-blue-500 focus:bg-white transition-all resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Right Section: Interactive Drag-Drop Parsing Hub */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Dynamic Course Log Import (JSON)
              </label>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1.5 transition-all outline-none"
              >
                <Download size={11} />
                Get Template
              </button>
            </div>

            {/* Drag Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={handleManualUploadClick}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 min-h-[160px] ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50/40' 
                  : uploadedFileName 
                    ? 'border-emerald-400 bg-emerald-50/10' 
                    : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {uploadedFileName ? (
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                    <CheckCircle size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-700 truncate max-w-[240px] mx-auto">{uploadedFileName}</p>
                    {parsedRecordsCount !== undefined ? (
                      <p className="text-[10px] text-emerald-600 font-bold">
                        Successfully parsed: {parsedRecordsCount} educational reports!
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500">Reading uploaded records...</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border border-blue-100">
                    <UploadCloud size={18} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-700">Drag & drop template file here</p>
                    <p className="text-[10px] text-slate-450 font-medium">or click to browse from folder system (JSON only)</p>
                  </div>
                </div>
              )}
            </div>

            {parseError && (
              <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                <AlertTriangle size={11} />
                {parseError}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold tracking-wide uppercase transition-all shadow-md hover:shadow-blue-100/50 cursor-pointer flex items-center justify-center gap-1.5 mt-4"
          >
            <Sparkles size={14} />
            Submit Credentials for Review
          </button>
        </div>
      </form>
    </div>
  );
}
