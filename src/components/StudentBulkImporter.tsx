import React, { useState, useRef } from 'react';
import { Student, TopicScores, StudentImportedData } from '../types';
import { 
  UploadCloud, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Download, 
  Database, 
  UserCheck, 
  Sparkles, 
  FileSpreadsheet, 
  ShieldAlert, 
  UserPlus
} from 'lucide-react';
import { motion } from 'motion/react';

interface StudentBulkImporterProps {
  onClose: () => void;
  onImportCompleted: (newStudents: Student[]) => void;
}

interface TempParsedRecord {
  name: string;
  email: string;
  roleId: string;
  batch: string;
  gpa: string;
  priorCodingHours: number;
  primaryDomain: string;
  experienceSummary: string;
  python?: number;
  pandas?: number;
  numpy?: number;
  machineLearning?: number;
  isCompatible: boolean;
  validationNotes: string[];
  willApprove: boolean;
}

export default function StudentBulkImporter({
  onClose,
  onImportCompleted,
}: StudentBulkImporterProps) {
  const [inputText, setInputText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [parsedRecords, setParsedRecords] = useState<TempParsedRecord[]>([]);
  const [isDoneChecking, setIsDoneChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download Sample templates (JSON or CSV)
  const downloadSampleTemplate = (type: 'json' | 'csv') => {
    let content = '';
    let mimeType = '';
    let fileName = '';

    if (type === 'json') {
      const templateData = [
        {
          "name": "Sarah Jenkins",
          "email": "sarah.j@dsacademy.org",
          "gpa": "3.92",
          "priorCodingHours": 250,
          "primaryDomain": "Deep Learning & NLP",
          "experienceSummary": "Acquired solid experience in data preprocessing, matrix equations, and basic PyTorch transformers during previous university lab work.",
          "pythonMastery": 90,
          "pandasMastery": 85
        },
        {
          "name": "Alex Rivera",
          "email": "arivera@ai-innovations.net",
          "gpa": "3.55",
          "priorCodingHours": 140,
          "primaryDomain": "Computer Science Core",
          "experienceSummary": "Undergrad junior, parsed statistics background, completed automation scripting sequences, looking to write model assessment papers."
        }
      ];
      content = JSON.stringify(templateData, null, 2);
      mimeType = 'application/json';
      fileName = 'student_credential_import_template.json';
    } else {
      content = `name,email,gpa,priorCodingHours,primaryDomain,experienceSummary,pythonMastery,pandasMastery\n"Jane Doe","jane@domain.com",3.85,300,"Machine Learning Research","Completed standard NumPy structures",95,85\n"Mark Smith","mark@server.com",3.20,80,"Frontend Engineering","Wants to pivot to Artificial Intelligence",70,60`;
      mimeType = 'text/csv';
      fileName = 'student_credential_import_template.csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Automated format parsing engine to determine if source structure is correct ("check if data is right or not")
  const runFormatAnalyticsCheck = () => {
    if (!inputText.trim()) {
      setErrorMessage('Please paste student data or upload a file first.');
      return;
    }

    try {
      setErrorMessage('');
      const cleaned = inputText.trim();
      let rawList: any[] = [];

      // 1. Check if JSON list format
      if (cleaned.startsWith('[') || cleaned.startsWith('{')) {
        let parsed = JSON.parse(cleaned);
        rawList = Array.isArray(parsed) ? parsed : [parsed];
      } 
      // 2. Otherwise assume Comma-separated or Tab-separated values (CSV / TSV)
      else {
        const lines = cleaned.split('\n');
        if (lines.length < 2) {
          throw new Error('Incomplete structural lines. Ensure columns correspond to header guides.');
        }

        // Parse headers from the first row
        const headers = lines[0].split(/[,\t]/).map(h => h.trim().replace(/^["']|["']$/g, ''));
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          // Regex to safely split CSV while ignoring commas inside quotations
          const matches = lines[i].match(/(".*?"|[^,\t]+)(?=\s*[,|\t]|\s*$)/g);
          if (!matches) continue;
          
          const values = matches.map(v => v.trim().replace(/^["']|["']$/g, ''));
          const item: Record<string, any> = {};
          
          headers.forEach((hdr, idx) => {
            const val = values[idx] || '';
            if (hdr) {
              item[hdr] = val;
            }
          });
          
          rawList.push(item);
        }
      }

      if (rawList.length === 0) {
        throw new Error('No valid student data rows identified.');
      }

      // Map raw entries to structured pre-approval assessment format
      const validated: TempParsedRecord[] = rawList.map((item, index) => {
        const name = String(item.name || item.fullName || item.studentName || '').trim();
        const email = String(item.email || item.emailAddress || '').trim();
        const gpa = String(item.gpa || item.curGPA || item.GPA || '3.5').trim();
        const hrs = Number(item.priorCodingHours || item.codingHours || item.hours || 100);
        const domain = String(item.primaryDomain || item.specialty || item.interestDomain || 'Machine Learning Research').trim();
        const summary = String(item.experienceSummary || item.backgroundNotes || item.summary || 'Prior academic background logged via source import.').trim();
        
        const python = item.pythonMastery ? Number(item.pythonMastery) : undefined;
        const pandas = item.pandasMastery ? Number(item.pandasMastery) : undefined;

        // Validation rule checking ("checking if data is right or not")
        const notes: string[] = [];
        let isRight = true;

        if (!name) {
          notes.push('⚠️ Missing required name attribute.');
          isRight = false;
        }
        
        if (!email || !email.includes('@')) {
          notes.push('⚠️ Missing or poorly formatted registry email.');
          isRight = false;
        }

        const numericGpa = parseFloat(gpa);
        if (isNaN(numericGpa) || numericGpa < 0 || numericGpa > 5) {
          notes.push('ℹ️ GPA either non-numeric or outside typical limits, defaulting to 3.5');
        }

        if (hrs < 30) {
          notes.push('⚠️ Coding exposure is trace level (<30h); risk-mitigation onboarding suggested.');
        } else {
          notes.push('✅ Competence background verified.');
        }

        // Generate auto ID
        const finalId = `STU-2026-${Math.floor(100 + Math.random() * 900)}-${index}`;

        return {
          name: name || `Imported Candidate #${index + 1}`,
          email: email || `imported_${index + 1}@dsacademy.org`,
          roleId: finalId,
          batch: 'Advanced AI & Data Science - Batch A',
          gpa: isNaN(numericGpa) ? '3.5' : gpa,
          priorCodingHours: hrs,
          primaryDomain: domain,
          experienceSummary: summary,
          python,
          pandas,
          isCompatible: isRight,
          validationNotes: notes,
          willApprove: isRight, // Auto-toggle approve check box if format is verified and right
        };
      });

      setParsedRecords(validated);
      setIsDoneChecking(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Check failed. Verify the formatting schema and try paste again.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setInputText(event.target?.result as string || '');
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setInputText(event.target?.result as string || '');
      };
      reader.readAsText(file);
    }
  };

  // Fire final student addition mutation
  const handleOnboardAction = () => {
    const verifiedList = parsedRecords.filter(r => r.willApprove);
    if (verifiedList.length === 0) {
      alert("No approved candidates selected for registry entry.");
      return;
    }

    const randomAvatars = [
      'from-emerald-500 to-teal-600',
      'from-violet-500 to-fuchsia-600',
      'from-blue-500 to-indigo-600',
      'from-orange-400 to-rose-500',
      'from-cyan-400 to-blue-500',
    ];

    const completedImports: Student[] = verifiedList.map((item, idx) => {
      // Calculate realistic auto scores relative to their imported GPA
      const gpaNum = parseFloat(item.gpa) || 3.0;
      const baseProficiency = Math.min(100, Math.round((gpaNum / 4) * 80 + Math.random() * 15));
      
      const topics: TopicScores = {
        python: item.python || Math.max(50, baseProficiency + 5),
        pandas: item.pandas || Math.max(45, baseProficiency),
        numpy: Math.max(45, baseProficiency - 2),
        machineLearning: Math.max(40, baseProficiency - 8),
        dl: Math.max(30, baseProficiency - 15),
        nlp: Math.max(30, baseProficiency - 18),
        genai: Math.max(40, baseProficiency - 10),
      };

      const importedData: StudentImportedData = {
        gpa: item.gpa,
        priorCodingHours: item.priorCodingHours,
        primaryDomain: item.primaryDomain,
        experienceSummary: item.experienceSummary,
        submittedAt: new Date().toISOString(),
        parsedRecordsCount: 5,
      };

      return {
        id: `student-imported-${Date.now()}-${idx}`,
        name: item.name,
        email: item.email,
        roleId: item.roleId.replace(/-idx$/, ''),
        batch: item.batch,
        avatarStyle: randomAvatars[idx % randomAvatars.length],
        topics,
        weeklyReports: [],
        monthlyReports: [],
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'active',
        isApproved: true, // TEACHER APPROVED DIRECTLY
        importedData,
        dailyQuizScores: {},
      };
    });

    onImportCompleted(completedImports);
  };

  const handleToggleRecordApproval = (idx: number) => {
    setParsedRecords(prev => 
      prev.map((r, i) => i === idx ? { ...r, willApprove: !r.willApprove } : r)
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg p-6 max-w-5xl mx-auto space-y-6 text-left" id="bulk-student-importer-panel">
      
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-100 gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Database size={18} className="text-blue-600 animate-pulse" />
            Adaptive Student Data Import & Auto-Approval
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
            Upload or paste academic candidate portfolios from any spreadsheet or database. Perform structure inspection checks, parse domain specialties, and instantly add verified, pre-approved members.
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-250 cursor-pointer"
        >
          Close Panel
        </button>
      </div>

      {!isDoneChecking ? (
        <div className="grid md:grid-cols-5 gap-6">
          
          {/* File Template download and guide */}
          <div className="md:col-span-2 bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet size={13} className="text-emerald-600" />
                Data Intake Options
              </h4>
              <p className="text-[11px] text-slate-650 leading-relaxed font-medium">
                Our parsing engine automatically isolates format attributes from tabular copy, spreadsheets (CSV/TSV), and formal JSON.
              </p>
              
              <div className="space-y-2 pt-2 bg-white p-3 rounded-xl border border-slate-205/60 text-slate-600 text-[10px] space-y-1 font-semibold leading-relaxed">
                <span className="block font-bold text-slate-800 uppercase tracking-widest text-[9px] mb-1">Required Headers:</span>
                <span className="block"><code>name</code> — Full text identity</span>
                <span className="block"><code>email</code> — Contact address</span>
                <span className="block"><code>gpa</code> — Academic benchmark</span>
                <span className="block"><code>priorCodingHours</code> — Coding exposure</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Download Setup Blueprints</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => downloadSampleTemplate('json')}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-2.5 text-center text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center justify-center gap-1 transition-all"
                >
                  <Download size={12} />
                  JSON Model
                </button>
                <button
                  type="button"
                  onClick={() => downloadSampleTemplate('csv')}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-2.5 text-center text-xs font-bold text-slate-700 hover:text-emerald-600 flex items-center justify-center gap-1 transition-all"
                >
                  <Download size={12} />
                  CSV Model
                </button>
              </div>
            </div>
          </div>

          {/* Large text clipboard input area */}
          <div className="md:col-span-3 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                <span>Raw Data Input Space (paste table / JSON log here)</span>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">Intelligent Mapping Mode</span>
              </label>
              
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative rounded-2xl border-2 transition-all ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50/20' 
                    : 'border-slate-205 focus-within:border-slate-800'
                }`}
              >
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Paste spreadsheet raw csv rows, or drag a CSV/JSON file here. Try pasting:\n\nname,email,gpa,priorCodingHours,primaryDomain\n"Kenji Sato","k.sato@ai-reseacher.jp",3.75,180,"Deep Learning"\n"Yoyo Chen","yoyochen@domain.org",3.91,320,"Computer Vision"`}
                  rows={8}
                  className="w-full bg-slate-50/30 text-slate-700 text-xs rounded-2xl p-4 outline-none font-mono leading-relaxed resize-none"
                />
                
                <div className="absolute right-3.5 bottom-3 text-[10px] text-slate-400 font-semibold pointer-events-none">
                  Drag files to insert
                </div>
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
                <AlertTriangle size={13} />
                {errorMessage}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv,.tsv,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
              >
                Browse File System
              </button>
              <button
                type="button"
                onClick={runFormatAnalyticsCheck}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl px-5 py-2.5 transition-all shadow-md hover:shadow-blue-100 flex items-center gap-1.5 cursor-pointer"
              >
                <Database size={13} />
                Verify Input Structure
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Results dry run list with verification checkers */
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100/85">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-500" />
                Structure Check Analysis Complete
              </h4>
              <p className="text-[10px] text-slate-500 font-medium">
                Pasted content parsed successfully into <strong>{parsedRecords.length} records</strong>. Verify auto-calculated profiles and choose who gets authorized.
              </p>
            </div>
            <button
              onClick={() => setIsDoneChecking(false)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              Reconstruct Paste Input
            </button>
          </div>

          {/* Parsed Cards Array with checklists */}
          <div className="grid md:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-1">
            {parsedRecords.map((item, idx) => {
              // Simple heuristic to evaluate starting compatibility
              const isExcellent = parseFloat(item.gpa) >= 3.6 && item.priorCodingHours >= 150;
              const isCompatible = item.gpa && item.name && item.email.includes('@');

              return (
                <div 
                  key={idx}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-4 ${
                    item.willApprove 
                      ? 'bg-blue-50/10 border-blue-200 shadow-sm' 
                      : 'bg-slate-50/50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <h5 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                          {item.name}
                          {isExcellent && (
                            <span className="p-0.5 px-1.5 bg-yellow-50 text-yellow-700 text-[8px] font-bold rounded border border-yellow-105">
                              GOLD PORTFOLIO
                            </span>
                          )}
                        </h5>
                        <p className="text-[10px] text-slate-450 font-mono">{item.email}</p>
                      </div>
                      
                      {/* Check toggle */}
                      <button
                        onClick={() => handleToggleRecordApproval(idx)}
                        className={`w-5 h-5 rounded flex items-center justify-center transition-all cursor-pointer ${
                          item.willApprove
                            ? 'bg-blue-600 text-white'
                            : 'border-2 border-slate-300 text-transparent'
                        }`}
                      >
                        <UserCheck size={12} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-slate-50 p-1.5 px-2 rounded-lg text-[10px]">
                        <span className="text-slate-400 block font-mono">GPA Score</span>
                        <span className="font-extrabold font-mono text-slate-700 bg-white px-1.5 py-0.2 rounded border border-slate-100">{item.gpa} / 4.0</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 px-2 rounded-lg text-[10px]">
                        <span className="text-slate-400 block font-mono">Coding Hours</span>
                        <span className="font-extrabold font-mono text-slate-700 bg-white px-1.5 py-0.2 rounded border border-slate-100">{item.priorCodingHours}h</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Format Verification Logs</p>
                      <div className="space-y-0.5">
                        {item.validationNotes.map((note, nIdx) => (
                          <div key={nIdx} className="text-[9px] font-medium text-slate-600 flex items-center gap-1">
                            <span className="text-slate-400 select-none">•</span>
                            <span>{note}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] bg-slate-50 -mx-4 -mb-4 p-2 px-4 rounded-b-xl border-t border-slate-150">
                    <span className="text-slate-500 font-mono">Target: {item.primaryDomain.split(' ')[0]}</span>
                    <span className={`font-bold uppercase tracking-wider ${item.isCompatible ? 'text-emerald-600' : 'text-orange-600'}`}>
                      {item.isCompatible ? 'CHECK PASSED' : 'CHECK RE-ROUTED'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action controllers */}
          <div className="pt-4 border-t border-slate-105 flex items-center justify-between gap-4 flex-wrap">
            <div className="text-xs text-slate-500 font-semibold">
              Selected <strong>{parsedRecords.filter(r => r.willApprove).length} of {parsedRecords.length}</strong> checked student records for auto-approval enrollment.
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDoneChecking(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleOnboardAction}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl px-5 py-2.5 transition-all shadow shadow-emerald-100 flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck size={13} />
                Bulk Import & Approve Selected candidates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
