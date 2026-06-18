import React, { useState } from 'react';
import { Student, TopicKey, TOPIC_LABELS, PreApprovedRecord } from '../types';
import { 
  Search, 
  UserPlus, 
  SlidersHorizontal, 
  BookOpen, 
  GraduationCap, 
  Trash2, 
  Edit3, 
  Eye, 
  MoreVertical, 
  UserCheck, 
  Shield, 
  Database, 
  UploadCloud,
  FileCheck,
  Smartphone,
  Check,
  UserX,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import StudentBulkImporter from './StudentBulkImporter';

interface StudentListProps {
  students: Student[];
  onSelectStudent: (id: string) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onOpenAddModal: () => void;
  userRole?: 'teacher' | 'student';
  onToggleApproval?: (id: string) => void;
  onImportStudents?: (newStudents: Student[]) => void;
  preApprovedRecords?: PreApprovedRecord[];
  onUpdatePreApprovedRecords?: (records: PreApprovedRecord[]) => void;
}

export default function StudentList({
  students,
  onSelectStudent,
  onEditStudent,
  onDeleteStudent,
  onOpenAddModal,
  userRole = 'teacher',
  onToggleApproval,
  onImportStudents,
  preApprovedRecords = [],
  onUpdatePreApprovedRecords,
}: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showBulkImporter, setShowBulkImporter] = useState(false);
  const [subTab, setSubTab] = useState<'roster' | 'pre-approvals'>('roster');

  // Add and Bulk input temporary states for pre-approvals
  const [newPaId, setNewPaId] = useState('');
  const [newPaPhone, setNewPaPhone] = useState('');
  const [newPaName, setNewPaName] = useState('');
  const [newPaEmail, setNewPaEmail] = useState('');
  const [newPaNotes, setNewPaNotes] = useState('');
  const [bulkPaText, setBulkPaText] = useState('');
  const [paError, setPaError] = useState('');
  const [showBulkPaForm, setShowBulkPaForm] = useState(false);

  // Extract all unique batches for filtering
  const uniqueBatches = Array.from(new Set(students.map((s) => s.batch)));

  // Pre-approval mutations
  const handleCreateSinglePaRecord = (e: React.FormEvent) => {
    e.preventDefault();
    setPaError('');
    const idNum = newPaId.trim().toUpperCase();
    const phone = newPaPhone.trim();
    const name = newPaName.trim();
    let email = newPaEmail.trim();

    if (!idNum || !phone || !name) {
      setPaError('Fields (Student ID Number, Mobile Phone, and Student Name) are mandatory.');
      return;
    }

    if (!email) {
      email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@datascience.edu`;
    }

    if (preApprovedRecords.some(r => r.idNumber.toUpperCase() === idNum)) {
      setPaError('A pre-approved mapping for this Student ID already exists.');
      return;
    }

    const newRec: PreApprovedRecord = {
      id: `pa-${Date.now()}`,
      idNumber: idNum,
      phoneNumber: phone,
      name,
      email,
      notes: newPaNotes.trim() || 'Direct Pre-Approval'
    };

    if (onUpdatePreApprovedRecords) {
      onUpdatePreApprovedRecords([newRec, ...preApprovedRecords]);
    }

    // Reset fields
    setNewPaId('');
    setNewPaPhone('');
    setNewPaName('');
    setNewPaEmail('');
    setNewPaNotes('');
  };

  const handleDeletePaRecord = (id: string) => {
    if (onUpdatePreApprovedRecords) {
      onUpdatePreApprovedRecords(preApprovedRecords.filter(r => r.id !== id));
    }
  };

  const handleBulkImportPaRecords = () => {
    setPaError('');
    if (!bulkPaText.trim()) {
      setPaError('Please enter database entries to parse.');
      return;
    }

    try {
      const lines = bulkPaText.split('\n');
      const newlyParsed: PreApprovedRecord[] = [];
      
      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        
        // Support CSV format: ID, PHONE, NAME, OPT_EMAIL, OPT_NOTES
        const matches = trimmed.match(/(".*?"|[^,\t]+)(?=\s*[,|\t]|\s*$)/g);
        let idNum = '';
        let phone = '';
        let name = '';
        let email = '';
        let notes = '';

        if (!matches || matches.length < 3) {
          const parts = trimmed.split(/[\t,;]/);
          if (parts.length >= 3) {
            idNum = parts[0].trim().replace(/^["']|["']$/g, '').toUpperCase();
            phone = parts[1].trim().replace(/^["']|["']$/g, '');
            name = parts[2].trim().replace(/^["']|["']$/g, '');
            const field4 = parts[3] ? parts[3].trim().replace(/^["']|["']$/g, '') : '';
            const field5 = parts[4] ? parts[4].trim().replace(/^["']|["']$/g, '') : '';
            
            if (field4.includes('@')) {
              email = field4;
              notes = field5 || 'Bulk Importer';
            } else {
              email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@datascience.edu`;
              notes = field4 || field5 || 'Bulk Importer';
            }
          }
        } else {
          const cleanParts = matches.map(m => m.trim().replace(/^["']|["']$/g, ''));
          idNum = cleanParts[0].toUpperCase();
          phone = cleanParts[1];
          name = cleanParts[2];
          
          const field4 = cleanParts[3] || '';
          const field5 = cleanParts[4] || '';
          
          if (field4.includes('@')) {
            email = field4;
            notes = field5 || 'Bulk Importer';
          } else {
            email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@datascience.edu`;
            notes = field4 || field5 || 'Bulk Importer';
          }
        }

        if (idNum && phone && name) {
          newlyParsed.push({
            id: `pa-bulk-${Date.now()}-${index}`,
            idNumber: idNum,
            phoneNumber: phone,
            name,
            email,
            notes
          });
        }
      });

      if (newlyParsed.length === 0) {
        throw new Error('No valid records identified. Format matches: ID, PHONE, NAME, [EMAIL], [NOTES].');
      }

      const uniqueNew = newlyParsed.filter(newR => 
        !preApprovedRecords.some(oldR => oldR.idNumber.toUpperCase() === newR.idNumber.toUpperCase())
      );

      if (onUpdatePreApprovedRecords) {
        onUpdatePreApprovedRecords([...uniqueNew, ...preApprovedRecords]);
      }

      setBulkPaText('');
      setShowBulkPaForm(false);
      alert(`Successfully added ${uniqueNew.length} new matches to the pre-approved database!`);
    } catch (e: any) {
      setPaError(e.message || 'Error occurred while verifying and importing matches.');
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.roleId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBatch = batchFilter === 'all' || s.batch === batchFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'all') {
      matchesStatus = true;
    } else if (statusFilter === 'pending') {
      matchesStatus = s.isApproved === false;
    } else {
      matchesStatus = s.status === statusFilter && s.isApproved !== false;
    }

    return matchesSearch && matchesBatch && matchesStatus;
  });

  // Calculate average for a single student
  const getAverageScore = (student: Student) => {
    const sum = Object.values(student.topics).reduce((a, b) => a + b, 0);
    return Math.round((sum / 7) * 10) / 10;
  };

  return (
    <div id="students-grid-container" className="space-y-6">
      {/* Importer Panel */}
      {showBulkImporter && userRole === 'teacher' && (
        <StudentBulkImporter
          onClose={() => setShowBulkImporter(false)}
          onImportCompleted={(newStudents) => {
            if (onImportStudents) {
              onImportStudents(newStudents);
            }
            setShowBulkImporter(false);
          }}
        />
      )}

      {/* Roster & Pre-Approval dual tab selection for Teacher */}
      {userRole === 'teacher' && (
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setSubTab('roster')}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              subTab === 'roster'
                ? 'border-blue-600 text-blue-600 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            Registered Student Roster ({students.length})
          </button>
          <button
            onClick={() => setSubTab('pre-approvals')}
            id="subtab-pre-approvals"
            className={`px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              subTab === 'pre-approvals'
                ? 'border-blue-600 text-blue-600 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            <Smartphone size={14} className={subTab === 'pre-approvals' ? 'text-blue-500' : 'text-slate-400'} />
            <span>Pre-Approval Database Matches ({preApprovedRecords.length})</span>
          </button>
        </div>
      )}

      {userRole === 'teacher' && subTab === 'pre-approvals' ? (
        <div className="space-y-6 animate-fade-in" id="pre-approvals-management-block">
          {/* Header Description & Explanation */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5 flex-1">
              <h3 className="text-sm font-bold tracking-tight uppercase flex items-center gap-2 text-white">
                <Shield size={16} className="text-blue-500 animate-pulse" />
                <span>Pre-Approved Database (Registrar Match Keys)</span>
              </h3>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed font-medium">
                Add valid student records here with their unique <strong>Student ID Number</strong> and registered <strong>Phone Number</strong>. When those students verify credentials on the logging sidebar, their portal account is automatically approved instantly!
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowBulkPaForm(!showBulkPaForm);
                setPaError('');
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm hover:shadow-blue-500/30 shrink-0 cursor-pointer"
            >
              <Database size={13} />
              {showBulkPaForm ? 'Switch to Single Entry Form' : 'Insert Data from Other Source (Bulk Paste)'}
            </button>
          </div>

          {/* Form Zone */}
          {showBulkPaForm ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm" id="bulk-pa-source-form">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <UploadCloud size={14} className="text-blue-600" />
                  <span>Insert Data From Other Source (Spreadsheet / CSV Grid)</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setBulkPaText("STU-2026-610,9876543610,Rohan Sharma,University Registrar File\nSTU-2026-522,9876543522,Sophia Lin,Google Sheets Export\nSTU-2026-304,9876543304,Michael Peterson,Offline Enrollment Form")}
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                >
                  Load Sample External Source Paste
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Paste spreadsheet cell rows directly. Format: <code className="bg-slate-150 rounded px-1 text-slate-700 font-mono text-[11px] font-bold">Student ID, Mobile Phone, Student Name, Optional Source Notes</code> separated by commas or tabs.
              </p>
              <textarea
                rows={5}
                value={bulkPaText}
                onChange={(e) => setBulkPaText(e.target.value)}
                placeholder="STU-2026-888,9876543888,Deepika Padukone,Excel Registrar export&#13;STU-2026-999,9876543999,Rajesh Koothrappali,IIT registrar DB"
                className="w-full text-xs font-mono border border-slate-205 rounded-xl p-3 outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 bg-slate-50/50"
              />
              {paError && (
                <div className="bg-rose-50 border border-rose-100 px-3.5 py-2.5 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-1.5 matches-error animate-pulse">
                  <span>⚠️</span>
                  <span>{paError}</span>
                </div>
              )}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowBulkPaForm(false); setPaError(''); }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkImportPaRecords}
                  className="px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Verify and Batch Insert Pairs
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateSinglePaRecord} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm" id="single-pa-form">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <PlusCircle size={14} className="text-emerald-600" />
                <span>Add Single Pre-Approved Match Record</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Student ID (Mandatory)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STU-2026-888"
                    value={newPaId}
                    onChange={(e) => setNewPaId(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-slate-850"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Phone (Mandatory)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9876543888"
                    value={newPaPhone}
                    onChange={(e) => setNewPaPhone(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-slate-850"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Student Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deepika Padukone"
                    value={newPaName}
                    onChange={(e) => setNewPaName(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-slate-850"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Email (Mail ID)</label>
                  <input
                    type="email"
                    placeholder="e.g. deepika@stars.com"
                    value={newPaEmail}
                    onChange={(e) => setNewPaEmail(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-slate-850"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Origin / Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Registrar direct entry"
                    value={newPaNotes}
                    onChange={(e) => setNewPaNotes(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-slate-850"
                  />
                </div>
              </div>

              {paError && (
                <div className="bg-rose-50 border border-rose-100 px-3.5 py-2.5 rounded-xl text-xs text-rose-700 font-semibold matches-error">
                  ⚠️ {paError}
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-slate-400 italic flex items-center gap-1">
                  <HelpCircle size={12} className="text-slate-300" />
                  Tip: ID numbers are automatically transformed to uppercase matching keys.
                </span>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-emerald-100 cursor-pointer"
                >
                  + Add Live Match Record
                </button>
              </div>
            </form>
          )}

          {/* Database Matches Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="match-pairs-history-table">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Stored Registrar Match Database Pairs</h4>
                <p className="text-[10px] text-slate-400">Match pairings allowed to self-register and auto-approve instantly.</p>
              </div>
              <span className="text-[10px] font-bold uppercase py-1 px-2.5 rounded-lg bg-white border border-slate-205 text-slate-700 font-mono">
                {preApprovedRecords.length} Match Pairs Configured
              </span>
            </div>

            {preApprovedRecords.length === 0 ? (
              <div className="p-12 text-center text-slate-440 flex flex-col items-center justify-center">
                <Smartphone className="text-slate-300 mb-2 animate-pulse" size={32} />
                <p className="text-xs font-semibold text-slate-600">Pre-Approved database is empty.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Use the forms above or click the sample button helper to verify data.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-3.5">Matched Name</th>
                      <th className="px-6 py-3.5">Student ID (Match Key)</th>
                      <th className="px-6 py-3.5">Registered Email (Mail ID)</th>
                      <th className="px-6 py-3.5">Mandatory Mobile Phone</th>
                      <th className="px-6 py-3.5">Creation Notes / Origin</th>
                      <th className="px-6 py-3.5">Portal Status</th>
                      <th className="px-6 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {preApprovedRecords.map((rec) => {
                      const registeredMatches = students.find(
                        s => s.roleId.toUpperCase().trim() === rec.idNumber.toUpperCase().trim()
                      );
                      const isApprovedUser = registeredMatches && registeredMatches.isApproved !== false;

                      return (
                        <tr key={rec.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-6 py-3.5 font-bold text-slate-755">
                            {rec.name}
                          </td>
                          <td className="px-6 py-3.5 font-mono text-[11px] text-slate-650 font-bold">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded border text-[10px]">
                              {rec.idNumber}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 font-mono text-slate-600 text-[11px]">
                            {rec.email}
                          </td>
                          <td className="px-6 py-3.5 font-mono text-slate-600">
                            {rec.phoneNumber}
                          </td>
                          <td className="px-6 py-3.5 text-slate-450 text-[11px] italic">
                            {rec.notes || 'Direct Pre-Approval'}
                          </td>
                          <td className="px-6 py-3.5">
                            {isApprovedUser ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100">
                                <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                                Registered & Active
                              </span>
                            ) : registeredMatches ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold text-orange-700 bg-orange-50 border border-orange-100">
                                <span className="w-1 h-1 rounded-full bg-orange-500"></span>
                                Awaiting Phone Match
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-150">
                                <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                Awaiting First Verification
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeletePaRecord(rec.id)}
                              className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100/50 text-[10px] font-bold transition-all cursor-pointer"
                            >
                              Delete Pair
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Search and Filters Strip */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search */}
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-800 transition-colors" size={18} />
              <input
                type="text"
                id="students-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search students by name, email, or registry ID (STU-XXX)..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800/10 focus:border-slate-800 text-sm transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
              
              {/* Cohort Selector */}
              <select
                id="filter-batch-selector"
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 cursor-pointer"
              >
                <option value="all">All Cohorts</option>
                {uniqueBatches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch.split(' - ')[0]}
                  </option>
                ))}
              </select>

              {/* Status Selector */}
              <select
                id="filter-status-selector"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="on-leave">On Sabbatical</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Awaiting Approval</option>
              </select>

              {/* Import Button */}
              {userRole === 'teacher' && (
                <button
                  type="button"
                  onClick={() => setShowBulkImporter(true)}
                  id="btn-import-students-trigger"
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ml-auto md:ml-0 shadow-sm"
                  title="Import and verify student academic records from spreadsheet or JSON"
                >
                  <Database size={14} className="text-blue-600" />
                  Import Data
                </button>
              )}

              {/* Create Button */}
              {userRole === 'teacher' && (
                <button
                  onClick={onOpenAddModal}
                  id="btn-add-student-shortcut"
                  className="bg-blue-600 border border-transparent text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-sm hover:shadow-blue-100"
                >
                  <UserPlus size={15} />
                  Register Student
                </button>
              )}
            </div>
          </div>

          {/* Grid List */}
          {filteredStudents.length === 0 ? (
            <div id="empty-state-search" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center animate-fade-in">
              <GraduationCap className="text-slate-300 mb-3 animate-pulse" size={48} />
              <h3 className="text-base font-bold text-slate-700">No Student Records Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                We couldn't match your query to any stored enrollments. Try relaxing your filters or register a new study record.
              </p>
              {userRole === 'teacher' && (
                <button
                  onClick={onOpenAddModal}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Register New Record
                </button>
              )}
            </div>
          ) : (
            <div id="students-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {filteredStudents.map((student) => {
                const avg = getAverageScore(student);
                
                // Setup assessment classifications
                let statusColor = 'bg-emerald-50 text-emerald-700';
                let statusLabel = student.status.toUpperCase();
                if (student.isApproved === false) {
                  statusColor = 'bg-orange-50 text-orange-700 border border-orange-100/60';
                  statusLabel = 'PENDING APPROVAL';
                } else if (student.status === 'on-leave') {
                  statusColor = 'bg-amber-50 text-amber-700';
                } else if (student.status === 'inactive') {
                  statusColor = 'bg-slate-100 text-slate-700';
                }

                return (
                  <div
                    key={student.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
                  >
                    {/* Header Information */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        {/* ID + Avatar */}
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${student.avatarStyle} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                            {student.name.charAt(0)}{student.name.split(' ')[1]?.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                              {student.name}
                            </h3>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{student.roleId}</p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </div>

                      {/* Summary Demographics */}
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500 truncate">{student.email}</p>
                        <p className="text-xs text-slate-400 truncate">{student.batch.split(' - ')[0]}</p>
                        {student.phoneNumber && (
                          <p className="text-[11px] text-slate-450 font-mono flex items-center gap-1">
                            <span className="text-blue-500 font-bold">☏</span>
                            <span>{student.phoneNumber}</span>
                          </p>
                        )}
                      </div>

                      <hr className="border-slate-50" />

                      {/* Skills Grid Mini Display */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
                          <span>Curriculum mastery</span>
                          <span className="font-mono text-slate-700">{avg}% GPA</span>
                        </div>

                        {/* Miniature overall progression bar */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${avg}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Card footer control hub */}
                    <div className="bg-slate-50/70 py-3.5 px-6 rounded-b-2xl border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      {student.isApproved === false && userRole === 'teacher' ? (
                        <button
                          type="button"
                          onClick={() => onToggleApproval && onToggleApproval(student.id)}
                          className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-2.5 py-1 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm shadow-orange-100/50"
                        >
                          <UserCheck size={11} />
                          Approve Access
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelectStudent(student.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          <Eye size={13} />
                          View Reports
                        </button>
                      )}

                      {userRole === 'teacher' && (
                        <div className="flex gap-1.5 items-center">
                          {student.isApproved !== false && onToggleApproval && (
                            <button
                              type="button"
                              onClick={() => onToggleApproval(student.id)}
                              title="Revoke Study Lounge Credentials"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-all cursor-pointer"
                            >
                              <Shield size={13} />
                            </button>
                          )}
                          <button
                            onClick={() => onEditStudent(student)}
                            title="Edit Profile"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => onDeleteStudent(student.id)}
                            title="Remove Student"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
