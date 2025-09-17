// import React, { useEffect, useMemo, useState } from 'react';
// import { Modal, Button, Table, Form, Alert, Spinner, Badge, Card, Row, Col, InputGroup } from 'react-bootstrap';
// import 'bootstrap/dist/css/bootstrap.min.css';

// // Custom gradient background for header and modals
// const gradientHeader = {
//   background: 'linear-gradient(90deg, #0072ff 0%, #00c6ff 100%)',
//   color: '#fff',
//   borderRadius: '8px 8px 0 0',
//   padding: '24px 24px 12px 24px',
//   boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
// };

// const API_BASE = 'http://localhost:5000/api';
 
// function App() {
//   // ---- Table state
//   const [programs, setPrograms] = useState([]);
//   const [tableLoading, setTableLoading] = useState(false);
//   const [tableError, setTableError] = useState('');

//   // ---- Modal state
//   const [showModal, setShowModal] = useState(false);

//   // ---- Builder state
//   const [current, setCurrent] = useState({ id: null, title: '' });
//   const [weeks, setWeeks] = useState([]);
//   const [moduleDrafts, setModuleDrafts] = useState({});
//   const [building, setBuilding] = useState(false);
//   const [submitting, setSubmitting] = useState(false);

//   // Add a loading state for allProgramWeeks
//   const [allProgramWeeksLoading, setAllProgramWeeksLoading] = useState(true);

//   // Add this new state:
//   const [allProgramWeeks, setAllProgramWeeks] = useState([]);

//   // Fetch all weeks (with modules) for all programs after loading programs
//   useEffect(() => {
//     const fetchAllWeeksAndModules = async () => {
//       setAllProgramWeeksLoading(true);
//       if (programs.length === 0) {
//         setAllProgramWeeks([]);
//         setAllProgramWeeksLoading(false);
//         return;
//       }
//       let allWeeks = [];
//       for (const program of programs) {
//         const res = await fetch(`${API_BASE}/programs/${program.id}/weeks`);
//         if (res.ok) {
//           const ws = await res.json();
//           // For each week, fetch modules
//           const weeksWithModules = await Promise.all(ws.map(async w => {
//             const modRes = await fetch(`${API_BASE}/weeks/${w.id}/modules`);
//             const mods = modRes.ok ? await modRes.json() : [];
//             return { ...w, program_id: program.id, modules: mods };
//           }));
//           allWeeks = allWeeks.concat(weeksWithModules);
//         }
//       }
//       setAllProgramWeeks(allWeeks);
//       setAllProgramWeeksLoading(false);
//     };
//     fetchAllWeeksAndModules();
//   }, [programs]);

//   // ---- Details modal state (not used for inline details anymore)
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [detailsLoading, setDetailsLoading] = useState(false);
//   const [detailsError, setDetailsError] = useState('');
//   const [detailsProgram, setDetailsProgram] = useState(null);

//   // ---- Edit modal state
//   const [showEditModal, setShowEditModal] = useState(false);

//   // ---- Local ack for "Complete Program" (no API call)
//   const [ackMessage, setAckMessage] = useState('');

//   // ---- Schedules state ----
//   const [schedules, setSchedules] = useState([]);
//   const [scheduleLoading, setScheduleLoading] = useState(false);
//   const [showScheduleModal, setShowScheduleModal] = useState(false);
//   const [scheduleForm, setScheduleForm] = useState({ email: '', program_id: '', start_date: '', end_date: '', is_finished: false });
//   const [scheduleError, setScheduleError] = useState('');
//   const [programOptions, setProgramOptions] = useState([]);
//   const [selectedProgramWeeks, setSelectedProgramWeeks] = useState(0); // For auto end date

//   // ---- Multi-schedule modal state ----
//   const [multiSchedules, setMultiSchedules] = useState([]); // Local schedules for modal

//   // New state for program schedule details modal (not used for inline details anymore)
//   const [showProgramScheduleModal, setShowProgramScheduleModal] = useState(false);
//   const [selectedProgramForSchedules, setSelectedProgramForSchedules] = useState(null);
//   const [selectedProgramSchedules, setSelectedProgramSchedules] = useState([]);

//   // Group schedules by program
//   const groupedSchedules = programs.map(program => {
//     const schedulesForProgram = schedules.filter(s => String(s.program_id) === String(program.id));
//     return {
//       program,
//       schedules: schedulesForProgram
//     };
//   }).filter(g => g.schedules.length > 0);

//   // Search state for employee in schedules
//   const [searchEmployee, setSearchEmployee] = useState('');

//   // Filtered schedules by search (live filtering)
//   const filteredGroupedSchedules = useMemo(() => {
//     if (!searchEmployee.trim()) return groupedSchedules;
//     const query = searchEmployee.trim().toLowerCase();
//     return groupedSchedules
//       .map(({ program, schedules }) => ({
//         program,
//         schedules: schedules.filter(s => s.email.toLowerCase().includes(query))
//       }))
//       .filter(g => g.schedules.length > 0);
//   }, [groupedSchedules, searchEmployee]);

//   // Search state for employee in schedules
//   const [searchResults, setSearchResults] = useState([]);

//   // Search handler
//   const handleSearchEmployee = () => {
//     const query = searchEmployee.trim().toLowerCase();
//     if (!query) {
//       setSearchResults([]);
//       return;
//     }
//     // Find all programs where this employee is enrolled
//     const enrolledPrograms = programs.filter(program =>
//       schedules.some(s =>
//         String(s.program_id) === String(program.id) &&
//         s.email.toLowerCase().includes(query)
//       )
//     );
//     setSearchResults(enrolledPrograms);
//   };

//   // Delete a schedule from details modal
//   const handleDeleteScheduleFromModal = async (id) => {
//     if (!window.confirm('Delete this employee schedule?')) return;
//     try {
//       const res = await fetch(`${API_BASE}/schedules/${id}`, { method: 'DELETE' });
//       if (!res.ok) throw new Error('Failed to delete schedule');
//       // Remove from modal state immediately
//       setSelectedProgramSchedules(prev => prev.filter(s => s.id !== id));
//       // Also reload all schedules for table
//       await loadSchedules();
//     } catch (err) {
//       window.alert(err.message || 'Failed to delete schedule');
//     }
//   };

//   // ===== Table load =====
//   const loadPrograms = async () => {
//     try {
//       setTableLoading(true);
//       setTableError('');
//       const res = await fetch(`${API_BASE}/programs`);
//       if (!res.ok) throw new Error(`Failed to load programs (${res.status})`);
//       const data = await res.json();
//       setPrograms(Array.isArray(data) ? data : []);
//     } catch (err) {
//       setTableError(err.message || 'Failed to load programs');
//     } finally {
//       setTableLoading(false);
//     }
//   };

//   // ===== Load schedules =====
//   const loadSchedules = async () => {
//     setScheduleLoading(true);
//     setScheduleError('');
//     try {
//       const res = await fetch(`${API_BASE}/schedules`);
//       if (!res.ok) throw new Error('Failed to load schedules');
//       const data = await res.json();
//       setSchedules(Array.isArray(data) ? data : []);
//     } catch (err) {
//       setScheduleError(err.message || 'Failed to load schedules');
//     } finally {
//       setScheduleLoading(false);
//     }
//   };

//   // ===== Load programs for dropdown =====
//   const loadProgramOptions = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/programs`);
//       if (!res.ok) throw new Error('Failed to load programs');
//       const data = await res.json();
//       setProgramOptions(Array.isArray(data) ? data : []);
//     } catch (err) {
//       setProgramOptions([]);
//     }
//   };

//   useEffect(() => {
//     loadPrograms();
//     loadSchedules();
//     loadProgramOptions();
//   }, []);

//   const nextWeekNumber = useMemo(() => {
//     const maxExisting = weeks.reduce((max, w) => Math.max(max, Number(w.week_number) || 0), 0);
//     return maxExisting + 1;
//   }, [weeks]);

//   // ===== Actions =====
//   const startBuilding = async () => {
//     setAckMessage('');
//     if (!current.title.trim()) {
//       alert('Please enter a program title.');
//       return;
//     }
//     try {
//       setSubmitting(true);
//       const res = await fetch(`${API_BASE}/programs`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ title: current.title.trim() })
//       });
//       if (!res.ok) throw new Error(`Failed to create program (${res.status})`);
//       const data = await res.json();
//       setCurrent(prev => ({ ...prev, id: data.program_id }));
//       setWeeks([]);
//       setBuilding(true);
//       setShowModal(false);
//       await loadPrograms();
//     } catch (err) {
//       alert(err.message || 'Failed to create program.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const addWeek = async () => {
//     setAckMessage('');
//     if (!current.id) {
//       alert('No program selected/created.');
//       return;
//     }
//     try {
//       setSubmitting(true);
//       const res = await fetch(`${API_BASE}/programs/${current.id}/weeks`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ week_number: nextWeekNumber }),
//       });
//       if (res.status === 409) {
//         alert(`Week ${nextWeekNumber} already exists.`);
//         return;
//       }
//       if (!res.ok) throw new Error(`Failed to add week (${res.status})`);
//       const data = await res.json();
//       setWeeks(prev => [...prev, { id: data.week_id, hasRealId: true, week_number: nextWeekNumber, modules: [] }]);
//       await loadPrograms();
//     } catch (err) {
//       alert(err.message || 'Failed to add week.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const updateModuleDraft = (weekId, field, value) => {
//     setModuleDrafts(prev => ({
//       ...prev,
//       [weekId]: { ...(prev[weekId] || { title: '', file_link: '' }), [field]: value }
//     }));
//   };

//   const addModule = async (weekId) => {
//     setAckMessage('');
//     const draft = moduleDrafts[weekId] || { title: '', file_link: '' };
//     if (!draft.title.trim() || !draft.file_link.trim()) {
//       alert('Module title and file link are required.');
//       return;
//     }
//     try {
//       setSubmitting(true);
//       const res = await fetch(`${API_BASE}/weeks/${weekId}/modules`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ title: draft.title.trim(), file_link: draft.file_link.trim() }),
//       });
//       if (!res.ok) throw new Error(`Failed to add module (${res.status})`);
//       const data = await res.json();
//       const newMod = {
//         id: data.module_id,
//         title: draft.title.trim(),
//         file_link: draft.file_link.trim(),
//         is_finished: undefined,
//         completed_at: null
//       };
//       setWeeks(prev => prev.map(w => (w.id === weekId ? { ...w, modules: [...(w.modules || []), newMod] } : w)));
//       setModuleDrafts(prev => ({ ...prev, [weekId]: { title: '', file_link: '' } }));
//     } catch (err) {
//       alert(err.message || 'Failed to add module.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const resetForm = () => {
//     setBuilding(false);
//     setCurrent({ id: null, title: '' });
//     setWeeks([]);
//     setModuleDrafts({});
//     setShowModal(false);
//     setShowEditModal(false);
//     setAckMessage('');
//   };

//   // ===== Details modal (not used for inline details anymore) =====
//   const openDetailsModal = async (program) => {
//     setShowDetailsModal(true);
//     setDetailsLoading(true);
//     setDetailsError('');
//     setDetailsProgram(program);
//     try {
//       const res = await fetch(`${API_BASE}/programs/${program.id}/weeks`);
//       const ws = res.ok ? await res.json() : [];
//       // Fetch modules for each week
//       const weeksWithModules = await Promise.all(ws.map(async w => {
//         const modRes = await fetch(`${API_BASE}/weeks/${w.id}/modules`);
//         const mods = modRes.ok ? await modRes.json() : [];
//         return { ...w, hasRealId: true, modules: mods };
//       }));
//       setWeeks(weeksWithModules);
//     } catch (e) {
//       setDetailsError(e.message || 'Failed to load details');
//       setWeeks([]);
//     } finally {
//       setDetailsLoading(false);
//     }
//   };

//   // ===== Edit modal =====
//   const openEditModal = async (program) => {
//     setCurrent({ id: program.id, title: program.title });
//     setBuilding(true);
//     setShowEditModal(true);
//     setShowModal(false);
//     try {
//       const res = await fetch(`${API_BASE}/programs/${program.id}/weeks`);
//       const ws = res.ok ? await res.json() : [];
//       const weeksWithModules = await Promise.all(ws.map(async w => {
//         const modRes = await fetch(`${API_BASE}/weeks/${w.id}/modules`);
//         const mods = modRes.ok ? await modRes.json() : [];
//         return { ...w, hasRealId: true, modules: mods };
//       }));
//       setWeeks(weeksWithModules);
//     } catch (e) {
//       setWeeks([]);
//     }
//   };

//   const handleDeleteProgram = async (programId) => {
//     if (!window.confirm('Are you sure you want to delete this program?')) return;
//     try {
//       const res = await fetch(`${API_BASE}/programs/${programId}`, { method: 'DELETE' });
//       if (!res.ok) throw new Error('Failed to delete program');
//       await loadPrograms();
//       window.alert('Program deleted successfully!');
//     } catch (err) {
//       window.alert(err.message || 'Failed to delete program');
//     }
//   };

//   const handleCopyProgram = async (programId) => {
//     const newTitle = window.prompt('Enter new program title to copy this program:');
//     if (!newTitle) return;
//     try {
//       const res = await fetch(`${API_BASE}/programs/${programId}/copy`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ program_title: newTitle })
//       });
//       if (!res.ok) throw new Error('Failed to copy program');
//       await loadPrograms();
//       window.alert('Program copied successfully!');
//     } catch (err) {
//       window.alert(err.message || 'Failed to copy program');
//     }
//   };

//   // ===== Schedules =====
//   const handleScheduleFormChange = (field, value) => {
//     setScheduleForm(prev => ({ ...prev, [field]: value }));

//     // If changing program_id, update selectedProgramWeeks
//     if (field === 'program_id') {
//       const selected = programOptions.find(p => String(p.id) === String(value));
//       setSelectedProgramWeeks(selected?.weeks_count || 0);
//       // Reset end_date if program changes
//       setScheduleForm(prev => ({ ...prev, end_date: '' }));
//     }

//     // If changing start_date and program_id is selected, auto-calculate end_date
//     if (field === 'start_date') {
//       if (scheduleForm.program_id) {
//         const selected = programOptions.find(p => String(p.id) === String(scheduleForm.program_id));
//         const weeksCount = selected?.weeks_count || selectedProgramWeeks || 0;
//         if (value && weeksCount > 0) {
//           const start = new Date(value);
//           // End date is last day of last week (weeksCount * 7 - 1 days after start)
//           const end = new Date(start);
//           end.setDate(start.getDate() + weeksCount * 7 - 1);
//           const endDateStr = end.toISOString().slice(0, 10);
//           setScheduleForm(prev => ({ ...prev, end_date: endDateStr }));
//         }
//       }
//     }
//   };

//   const openScheduleModalForProgram = (program) => {
//     setShowScheduleModal(true);
//     setScheduleForm({
//       email: '',
//       program_id: program.id,
//       start_date: '',
//       end_date: '',
//       is_finished: false
//     });
//     setSelectedProgramWeeks(program.weeks_count || 0);
//     setMultiSchedules([]); // Reset local schedules for modal
//   };

//   // Add schedule locally in modal
//   const addLocalSchedule = () => {
//     setScheduleError('');
//     const { email, program_id, start_date, end_date } = scheduleForm;
//     if (!email.trim() || !program_id || !start_date || !end_date) {
//       setScheduleError('All fields are required.');
//       return;
//     }
//     setMultiSchedules(prev => [
//       ...prev,
//       {
//         email: email.trim(),
//         program_id,
//         start_date,
//         end_date,
//         is_finished: false,
//         temp_id: Date.now() + Math.random() // For rendering
//       }
//     ]);
//     // Reset only email for next entry, keep program/start/end
//     setScheduleForm(prev => ({
//       ...prev,
//       email: ''
//     }));
//   };

//   // Remove local schedule from modal
//   const removeLocalSchedule = (temp_id) => {
//     setMultiSchedules(prev => prev.filter(s => s.temp_id !== temp_id));
//   };

//   // Submit all local schedules to backend
//   const submitAllSchedules = async () => {
//     setScheduleError('');
//     if (multiSchedules.length === 0) {
//       setScheduleError('Add at least one schedule.');
//       return;
//     }
//     try {
//       for (const s of multiSchedules) {
//         await fetch(`${API_BASE}/schedules`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             email: s.email,
//             program_id: s.program_id,
//             start_date: s.start_date,
//             end_date: s.end_date,
//             is_finished: false
//           })
//         });
//       }
//       setShowScheduleModal(false);
//       setScheduleForm({ email: '', program_id: '', start_date: '', end_date: '', is_finished: false });
//       setMultiSchedules([]);
//       await loadSchedules();
//     } catch (err) {
//       setScheduleError('Failed to create schedules');
//     }
//   };

//   const handleDeleteSchedule = async (id) => {
//     if (!window.confirm('Delete this schedule?')) return;
//     try {
//       const res = await fetch(`${API_BASE}/schedules/${id}`, { method: 'DELETE' });
//       if (!res.ok) throw new Error('Failed to delete schedule');
//       await loadSchedules();
//     } catch (err) {
//       window.alert(err.message || 'Failed to delete schedule');
//     }
//   };

//   // ===== Modal scroll lock =====
//   useEffect(() => {
//     const isAnyModalOpen = showDetailsModal || showEditModal || showModal || showScheduleModal;
//     if (isAnyModalOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = '';
//     }
//     return () => {
//       document.body.style.overflow = '';
//     };
//   }, [showDetailsModal, showEditModal, showModal, showScheduleModal]);

//   // --- Inline details state for programs and schedules ---
//   const [openProgramDetailsId, setOpenProgramDetailsId] = useState(null);
//   const [openScheduleDetailsId, setOpenScheduleDetailsId] = useState(null);
//   const [inlineDetailsLoading, setInlineDetailsLoading] = useState(false);
//   const [inlineDetailsWeeks, setInlineDetailsWeeks] = useState([]);
//   const [inlineDetailsError, setInlineDetailsError] = useState('');

//   // For schedule details (list of schedules for a program)
//   const [inlineScheduleList, setInlineScheduleList] = useState([]);
//   const [inlineScheduleLoading, setInlineScheduleLoading] = useState(false);

//   // Handle click on program title in training track
//   const handleProgramTitleClick = async (program) => {
//     if (openProgramDetailsId === program.id) {
//       // Close details if already open
//       setOpenProgramDetailsId(null);
//       setInlineDetailsWeeks([]);
//       setInlineDetailsError('');
//       setInlineDetailsLoading(false);
//       return;
//     }
//     setOpenProgramDetailsId(program.id);
//     setInlineDetailsLoading(true);
//     setInlineDetailsError('');
//     setInlineDetailsWeeks([]);
//     try {
//       const res = await fetch(`${API_BASE}/programs/${program.id}/weeks`);
//       const ws = res.ok ? await res.json() : [];
//       // Fetch modules for each week
//       const weeksWithModules = await Promise.all(ws.map(async w => {
//         const modRes = await fetch(`${API_BASE}/weeks/${w.id}/modules`);
//         const mods = modRes.ok ? await modRes.json() : [];
//         return { ...w, hasRealId: true, modules: mods };
//       }));
//       setInlineDetailsWeeks(weeksWithModules);
//     } catch (e) {
//       setInlineDetailsError(e.message || 'Failed to load details');
//       setInlineDetailsWeeks([]);
//     } finally {
//       setInlineDetailsLoading(false);
//     }
//     // Close schedule details if open
//     setOpenScheduleDetailsId(null);
//   };

//   // Handle click on program title in schedules table
//   const handleScheduleTitleClick = async (program) => {
//     if (openScheduleDetailsId === program.id) {
//       setOpenScheduleDetailsId(null);
//       setInlineScheduleList([]);
//       setInlineScheduleLoading(false);
//       return;
//     }
//     setOpenScheduleDetailsId(program.id);
//     setInlineScheduleLoading(true);
//     setInlineScheduleList([]);
//     // Get all schedules for this program
//     const schedulesForProgram = schedules.filter(s => String(s.program_id) === String(program.id));
//     // Simulate loading
//     setTimeout(() => {
//       setInlineScheduleList(schedulesForProgram);
//       setInlineScheduleLoading(false);
//     }, 200); // Simulate async
//     // Close program details if open
//     setOpenProgramDetailsId(null);
//   };

//   // Delete schedule from inline schedule details
//   const handleDeleteScheduleInline = async (id, programId) => {
//     if (!window.confirm('Delete this employee schedule?')) return;
//     try {
//       const res = await fetch(`${API_BASE}/schedules/${id}`, { method: 'DELETE' });
//       if (!res.ok) throw new Error('Failed to delete schedule');
//       // Remove from inline state immediately
//       setInlineScheduleList(prev => prev.filter(s => s.id !== id));
//       await loadSchedules();
//     } catch (err) {
//       window.alert(err.message || 'Failed to delete schedule');
//     }
//   };

//   // Helper: Calculate progress percentage for a schedule
//   function getScheduleProgress(schedule, programId) {
//     // Find all weeks for this program
//     const programWeeks = allProgramWeeks.filter(w => String(w.program_id) === String(programId));
//     const allModules = programWeeks.flatMap(w => Array.isArray(w.modules) ? w.modules : []);
//     const totalModules = allModules.length;
//     if (totalModules === 0) return 0;
//     // If schedule has completed_modules (array of module ids), use it
//     let completed = 0;
//     if (Array.isArray(schedule.completed_modules)) {
//       completed = schedule.completed_modules.length;
//     } else if (typeof schedule.completed_modules === 'string') {
//       // If backend sends as comma-separated string
//       completed = schedule.completed_modules.split(',').filter(Boolean).length;
//     } else if (typeof schedule.progress === 'number') {
//       // If backend sends progress as number (0-100)
//       return schedule.progress;
//     } else if (typeof schedule.is_finished === 'boolean' && schedule.is_finished) {
//       return 100;
//     }
//     // If backend marks modules as finished per module, you may need to adjust here
//     return Math.round((completed / totalModules) * 100);
//   }

//   return (
//     <div className="container py-4" style={{ background: 'linear-gradient(120deg, #ffffffff 0%, #ffffffff 100%)', minHeight: '100vh' }}>
//       <Card className="mb-4 shadow-lg" style={{ borderRadius: 16 }}>
//         <div style={gradientHeader}>
//           <h1 className="mb-0" style={{ fontWeight: 700, letterSpacing: 1 }}>Training dashboard</h1>
//         </div>
//         <Card.Body>
//           {/* Programs Heading and New Program Button in same line */}
//           <div className="d-flex align-items-center justify-content-between mb-3">
//             <h2 className="mb-0 text-secondary" style={{ fontWeight: 700, letterSpacing: 1 }}>Training Track</h2>
//             <Button variant="light" className="px-4 py-2" style={{ fontWeight: 600, borderRadius: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} onClick={() => setShowModal(true)}>
//               <i className="bi bi-plus-circle me-2"></i> New Program
//             </Button>
//           </div>
//           {/* Programs Table */}
//           <section className="mb-4">
//             {tableLoading && <Spinner animation="border" />}
//             {tableError && <Alert variant="danger">{tableError}</Alert>}
//             {!tableLoading && programs.length === 0 && <Alert variant="info">No programs yet.</Alert>}

//             {!tableLoading && programs.length > 0 && (
//               <Table striped bordered hover responsive className="shadow-sm" style={{ borderRadius: 12, overflow: 'hidden' }}>
//                 <thead className="table-dark">
//                   <tr>
//                     <th>ID</th>
//                     <th>Title</th>
//                     <th>Weeks</th>
//                     <th>Created</th>
//                     <th>Updated</th>
//                     <th>Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {programs.map(p => (
//                     <React.Fragment key={p.id}>
//                       <tr>
//                         <td>{p.id}</td>
//                         <td>
//                           <span
//                             style={{
//                               fontWeight: 500,
//                               color: '#0072ff',
//                               cursor: 'pointer',
//                               textDecoration: 'underline'
//                             }}
//                             onClick={() => handleProgramTitleClick(p)}
//                           >
//                             {p.title}
//                           </span>
//                         </td>
//                         <td>
//                           <Badge bg="info" pill>{typeof p.weeks_count === 'number' ? p.weeks_count : '-'}</Badge>
//                         </td>
//                         <td>{p.created_at ? new Date(p.created_at).toLocaleString() : '-'}</td>
//                         <td>{p.updated_at ? new Date(p.updated_at).toLocaleString() : '-'}</td>
//                         <td>
//                           <Button size="sm" variant="outline-warning" className="me-1" onClick={() => openEditModal(p)} title="Edit">
//                             <i className="bi bi-pencil"></i>
//                           </Button>
//                           <Button size="sm" variant="outline-success" onClick={() => openScheduleModalForProgram(p)} title="Schedule">
//                             <i className="bi bi-calendar-plus"></i>
//                           </Button>
//                           <Button size="sm" variant="outline-secondary" className="me-1" onClick={() => handleCopyProgram(p.id)} title="Copy">
//                             <i className="bi bi-files"></i>
//                           </Button>
//                           <Button size="sm" variant="outline-danger" className="me-1" onClick={() => handleDeleteProgram(p.id)} title="Delete">
//                             <i className="bi bi-trash"></i>
//                           </Button>
//                         </td>
//                       </tr>
//                       {openProgramDetailsId === p.id && (
//                         <tr>
//                           <td colSpan={6} style={{ background: '#f8f9fa', padding: 0 }}>
//                             <div style={{ padding: 16 }}>
//                               {inlineDetailsLoading && <Spinner animation="border" />}
//                               {inlineDetailsError && <Alert variant="danger">{inlineDetailsError}</Alert>}
//                               {!inlineDetailsLoading && !inlineDetailsError && inlineDetailsWeeks.length === 0 && (
//                                 <Alert variant="info">No weeks yet.</Alert>
//                               )}
//                               {!inlineDetailsLoading && !inlineDetailsError && inlineDetailsWeeks.length > 0 && (
//                                 <Row>
//                                   {inlineDetailsWeeks.sort((a, b) => a.week_number - b.week_number).map(w => (
//                                     <Col md={6} key={w.id} className="mb-3">
//                                       <Card className="shadow-sm">
//                                         <Card.Header className="bg-info text-white">
//                                           <strong>Week {w.week_number}</strong>
//                                         </Card.Header>
//                                         <Card.Body>
//                                           <ul className="list-group">
//                                             {(w.modules || []).length === 0 && <li className="list-group-item"><em>No modules yet.</em></li>}
//                                             {(w.modules || []).map(m => (
//                                               <li key={m.id} className="list-group-item d-flex align-items-center">
//                                                 <span className="me-2">
//                                                   {typeof m.is_finished === 'boolean'
//                                                     ? (m.is_finished ? '✅' : '⏳')
//                                                     : '•'}
//                                                 </span>
//                                                 <span className="flex-grow-1">{m.title}</span>
//                                                 <a href={m.file_link} target="_blank" rel="noreferrer" className="btn btn-link btn-sm">Open</a>
//                                               </li>
//                                             ))}
//                                           </ul>
//                                         </Card.Body>
//                                       </Card>
//                                     </Col>
//                                   ))}
//                                 </Row>
//                               )}
//                             </div>
//                           </td>
//                         </tr>
//                       )}
//                     </React.Fragment>
//                   ))}
//                 </tbody>
//               </Table>
//             )}
//           </section>
//         </Card.Body>
//       </Card>

//       {/* Modal for Create Program */}
//       <Modal show={showModal} onHide={resetForm} centered>
//         <Modal.Header closeButton style={gradientHeader}>
//           <Modal.Title>Create Program</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group className="mb-3">
//             <Form.Label>Program Title</Form.Label>
//             <Form.Control
//               type="text"
//               placeholder="Enter program title"
//               value={current.title}
//               onChange={e => setCurrent(prev => ({ ...prev, title: e.target.value }))}
//             />
//           </Form.Group>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="primary" onClick={startBuilding} disabled={submitting}>
//             <i className="bi bi-check-circle me-2"></i>Create
//           </Button>
//           <Button variant="secondary" onClick={resetForm}>
//             <i className="bi bi-x-circle me-2"></i>Cancel
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Details Modal (still available for eye button) */}
//       <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered size="lg">
//         <Modal.Header closeButton style={gradientHeader}>
//           <Modal.Title>
//             Details for Program #{detailsProgram?.id}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto', background: '#f8f9fa' }}>
//           {detailsLoading && <Spinner animation="border" />}
//           {detailsError && <Alert variant="danger">{detailsError}</Alert>}
//           {!detailsLoading && !detailsError && weeks.length === 0 && (
//             <Alert variant="info">No weeks yet.</Alert>
//           )}
//           {!detailsLoading && !detailsError && weeks.length > 0 && (
//             <Row>
//               {weeks.sort((a, b) => a.week_number - b.week_number).map(w => (
//                 <Col md={6} key={w.id} className="mb-3">
//                   <Card className="shadow-sm">
//                     <Card.Header className="bg-info text-white">
//                       <strong>Week {w.week_number}</strong>
//                     </Card.Header>
//                     <Card.Body>
//                       <ul className="list-group">
//                         {(w.modules || []).length === 0 && <li className="list-group-item"><em>No modules yet.</em></li>}
//                         {(w.modules || []).map(m => (
//                           <li key={m.id} className="list-group-item d-flex align-items-center">
//                             <span className="me-2">
//                               {typeof m.is_finished === 'boolean'
//                                 ? (m.is_finished ? '✅' : '⏳')
//                                 : '•'}
//                             </span>
//                             <span className="flex-grow-1">{m.title}</span>
//                             <a href={m.file_link} target="_blank" rel="noreferrer" className="btn btn-link btn-sm">Open</a>
//                           </li>
//                         ))}
//                       </ul>
//                     </Card.Body>
//                   </Card>
//                 </Col>
//               ))}
//             </Row>
//           )}
//         </Modal.Body>
//       </Modal>

//       {/* Edit Modal */}
//       <Modal show={showEditModal && current.id} onHide={resetForm} centered size="lg">
//         <Modal.Header closeButton style={gradientHeader}>
//           <Modal.Title>Edit Program</Modal.Title>
//         </Modal.Header>
//         <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto', background: '#f8f9fa' }}>
//           <div>
//             <p>
//               <strong>Program ID:</strong> {current.id} &nbsp;|&nbsp;
//               <strong>Title:</strong> {current.title || <em>(untitled)</em>}
//             </p>
//             <Button variant="info" className="mb-3" onClick={addWeek} disabled={submitting}>
//               <i className="bi bi-plus-circle me-2"></i>Add Week {nextWeekNumber}
//             </Button>
//             {weeks.length === 0 && <Alert variant="info">No weeks yet. Click “Add Week {nextWeekNumber}”.</Alert>}
//             {weeks.map(week => (
//               <Card key={week.id} className="mb-3 shadow-sm">
//                 <Card.Header className="bg-info text-white">
//                   <strong>Week {week.week_number}</strong>
//                 </Card.Header>
//                 <Card.Body>
//                   <InputGroup className="mb-2">
//                     <Form.Control
//                       type="text"
//                       placeholder="Module Title"
//                       value={moduleDrafts[week.id]?.title || ''}
//                       onChange={e => updateModuleDraft(week.id, 'title', e.target.value)}
//                       disabled={!week.hasRealId}
//                     />
//                     <Form.Control
//                       type="text"
//                       placeholder="File Link"
//                       value={moduleDrafts[week.id]?.file_link || ''}
//                       onChange={e => updateModuleDraft(week.id, 'file_link', e.target.value)}
//                       disabled={!week.hasRealId}
//                     />
//                     <Button
//                       variant="success"
//                       onClick={() => addModule(week.id)}
//                       disabled={submitting || !week.hasRealId}
//                     >
//                       <i className="bi bi-plus-circle"></i>
//                     </Button>
//                   </InputGroup>
//                   <ul className="list-group">
//                     {(week.modules || []).map(mod => (
//                       <li key={mod.id} className="list-group-item d-flex align-items-center">
//                         <span className="me-2">
//                           {typeof mod.is_finished === 'boolean' ? (mod.is_finished ? '✅' : '⏳') : '•'}
//                         </span>
//                         <a href={mod.file_link} target="_blank" rel="noreferrer" className="flex-grow-1">{mod.title}</a>
//                       </li>
//                     ))}
//                     {(week.modules || []).length === 0 && <li className="list-group-item"><em>No modules yet.</em></li>}
//                   </ul>
//                 </Card.Body>
//               </Card>
//             ))}
//             <div className="d-flex gap-2 align-items-center mt-3">
//               <Button variant="primary" onClick={resetForm}><i className="bi bi-check-circle me-2"></i>Done</Button>
//               <Button variant="secondary" onClick={resetForm}><i className="bi bi-x-circle me-2"></i>Cancel</Button>
//               {ackMessage && <span className="text-success">{ackMessage}</span>}
//             </div>
//           </div>
//         </Modal.Body>
//       </Modal>
//       {/*! Schedules Table */}
//       <Card className="mb-4 shadow-lg" style={{ borderRadius: 16 }}>
//         <Card.Header className="bg-gradient text-dark" style={gradientHeader}>
//           <div className="d-flex align-items-center justify-content-between">
//             <h2 className="mb-0 text-secondary" style={{ fontWeight: 600 }}>Schedules</h2>
//             <div style={{ minWidth: 320 }}>
//               <InputGroup>
//                 <Form.Control
//                   type="email"
//                   placeholder="Search by employee email ID"
//                   value={searchEmployee}
//                   onChange={e => setSearchEmployee(e.target.value)}
//                 />
//                 {searchEmployee && (
//                   <Button
//                     variant="outline-secondary"
//                     onClick={() => setSearchEmployee('')}
//                     title="Clear"
//                   >
//                     <i className="bi bi-x-lg"></i>
//                   </Button>
//                 )}
//               </InputGroup>
//             </div>
//           </div>
//         </Card.Header>
//         <Card.Body>
//           {scheduleLoading || allProgramWeeksLoading ? (
//             <Spinner animation="border" />
//           ) : scheduleError ? (
//             <Alert variant="danger">{scheduleError}</Alert>
//           ) : filteredGroupedSchedules.length === 0 ? (
//             <Alert variant="info">
//               {searchEmployee
//                 ? <>No schedules found for <b>{searchEmployee}</b>.</>
//                 : <>No schedules yet.</>
//               }
//             </Alert>
//           ) : (
//                         <Table striped bordered hover responsive className="shadow-sm" style={{ borderRadius: 12, overflow: 'hidden' }}>
//                           <thead className="table-dark">
//                             <tr>
//                               <th>Program</th>
//                               <th>Weeks</th>
//                               <th>Total Modules</th>
//                               <th>No of trainees</th> {/* Added column */}
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {filteredGroupedSchedules.map(({ program, schedules }) => {
//                               // Use allProgramWeeks for correct calculation
//                               const programWeeks = allProgramWeeks.filter(w => String(w.program_id) === String(program.id));
//                               const modulesCount = programWeeks.reduce(
//                                 (sum, w) => sum + (Array.isArray(w.modules) ? w.modules.length : 0),
//                                 0
//                               );
//                               const weeksCount = programWeeks.length > 0
//                                 ? programWeeks.length
//                                 : (typeof program.weeks_count === 'number' ? program.weeks_count : 0);
//                               const traineesCount = schedules.length; // Number of employees assigned to this program
//                               return (
//                                 <React.Fragment key={program.id}>
//                                   <tr>
//                                     <td>
//                                       <span
//                                         style={{
//                                           fontWeight: 500,
//                                           color: '#0072ff',
//                                           cursor: 'pointer',
//                                           textDecoration: 'underline'
//                                         }}
//                                         onClick={() => handleScheduleTitleClick(program)}
//                                       >
//                                         {program.title}
//                                       </span>
//                                     </td>
//                                     <td>{weeksCount}</td>
//                                     <td>{modulesCount}</td>
//                                     <td>{traineesCount}</td> {/* Show trainees count */}
//                                   </tr>
//                                   {openScheduleDetailsId === program.id && (
//                                     <tr>
//                                       <td colSpan={5} style={{ background: '#f8f9fa', padding: 0 }}>
//                                         <div style={{ padding: 16 }}>
//                                           {inlineScheduleLoading ? (
//                                             <Spinner animation="border" />
//                                           ) : inlineScheduleList.length === 0 ? (
//                                             <Alert variant="info">No schedules for this program.</Alert>
//                                           ) : (
//                                             <Table striped bordered hover responsive>
//                                               <thead>
//                                                 <tr>
//                                                   <th>Email</th>
//                                                   <th>Start Date</th>
//                                                   <th>End Date</th>
//                                                   <th>Progress</th>
//                                                   <th>Action</th>
//                                                 </tr>
//                                               </thead>
//                                               <tbody>
//                                                 {inlineScheduleList.map(s => {
//                                                   const percent = getScheduleProgress(s, program.id);
//                                                   return (
//                                                     <tr key={s.id}>
//                                                       <td>{s.email}</td>
//                                                       <td>{s.start_date}</td>
//                                                       <td>{s.end_date}</td>
//                                                       <td>
//                                                         <Badge bg={percent === 100 ? "success" : "secondary"}>
//                                                           {percent}%
//                                                         </Badge>
//                                                       </td>
//                                                       <td>
//                                                         <Button
//                                                           size="sm"
//                                                           variant="outline-danger"
//                                                           onClick={() => handleDeleteScheduleInline(s.id, program.id)}
//                                                           title="Delete this employee schedule"
//                                                         >
//                                                           <i className="bi bi-trash"></i>
//                                                         </Button>
//                                                       </td>
//                                                     </tr>
//                                                   );
//                                                 })}
//                                               </tbody>
//                                             </Table>
//                                           )}
//                                         </div>
//                                       </td>
//                                     </tr>
//                                   )}
//                                 </React.Fragment>
//                               );
//                             })}
//               </tbody>
//             </Table>
//           )}
//         </Card.Body>
//       </Card>
//       {/* Program Schedules Details Modal (still available for eye button) */}
//       <Modal show={showProgramScheduleModal} onHide={() => setShowProgramScheduleModal(false)} centered size="lg">
//         <Modal.Header closeButton style={gradientHeader}>
//           <Modal.Title>
//             Schedules for Program: {selectedProgramForSchedules?.title}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto', background: '#f8f9fa' }}>
//           {selectedProgramSchedules.length === 0 ? (
//             <Alert variant="info">No schedules for this program.</Alert>
//           ) : (
//             <Table striped bordered hover responsive>
//               <thead>
//                 <tr>
//                   <th>Email</th>
//                   <th>Start Date</th>
//                   <th>End Date</th>
//                   <th>Is Finished</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {selectedProgramSchedules.map(s => (
//                   <tr key={s.id}>
//                     <td>{s.email}</td>
//                     <td>{s.start_date}</td>
//                     <td>{s.end_date}</td>
//                     <td>{s.is_finished ? <Badge bg="success">Yes</Badge> : <Badge bg="secondary">No</Badge>}</td>
//                     <td>
//                       <Button
//                         size="sm"
//                         variant="outline-danger"
//                         onClick={() => handleDeleteScheduleFromModal(s.id)}
//                         title="Delete this employee schedule"
//                       >
//                         <i className="bi bi-trash"></i>
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </Table>
//           )}
//         </Modal.Body>
//       </Modal>

//       {/* Schedule Modal */}
//       <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)} centered size="lg">
//         <Modal.Header closeButton style={gradientHeader}>
//           <Modal.Title>Add Multiple Schedules</Modal.Title>
//         </Modal.Header>
//         <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto', background: '#f8f9fa' }}>
//           <Form>
//             <Row>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Employee Email</Form.Label>
//                   <Form.Control
//                     type="email"
//                     placeholder="Enter employee email"
//                     value={scheduleForm.email}
//                     onChange={e => handleScheduleFormChange('email', e.target.value)}
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Program</Form.Label>
//                   <Form.Select
//                     value={scheduleForm.program_id}
//                     onChange={e => handleScheduleFormChange('program_id', e.target.value)}
//                     disabled={!!scheduleForm.program_id}
//                   >
//                     <option value="">Select Program</option>
//                     {programOptions.map(p => (
//                       <option key={p.id} value={p.id}>{p.title}</option>
//                     ))}
//                   </Form.Select>
//                 </Form.Group>
//               </Col>
//             </Row>
//             <Row>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>Start Date</Form.Label>
//                   <Form.Control
//                     type="date"
//                     value={scheduleForm.start_date}
//                     onChange={e => handleScheduleFormChange('start_date', e.target.value)}
//                   />
//                 </Form.Group>
//               </Col>
//               <Col md={6}>
//                 <Form.Group className="mb-3">
//                   <Form.Label>End Date</Form.Label>
//                   <Form.Control
//                     type="date"
//                     value={scheduleForm.end_date}
//                     onChange={e => handleScheduleFormChange('end_date', e.target.value)}
//                     disabled={selectedProgramWeeks > 0}
//                     title={selectedProgramWeeks > 0 ? "End date is auto-calculated based on program weeks" : ""}
//                   />
//                   {selectedProgramWeeks > 0 && (
//                     <Form.Text className="text-muted">
//                       End date is auto-calculated for {selectedProgramWeeks} week(s).
//                     </Form.Text>
//                   )}
//                 </Form.Group>
//               </Col>
//             </Row>
//             <div className="d-flex gap-2 mb-2">
//               <Button variant="success" onClick={addLocalSchedule}><i className="bi bi-plus-circle me-2"></i>Add</Button>
//               <Button variant="secondary" onClick={() => setShowScheduleModal(false)}><i className="bi bi-x-circle me-2"></i>Cancel</Button>
//               <Button variant="primary" onClick={submitAllSchedules}><i className="bi bi-check-circle me-2"></i>Done</Button>
//             </div>
//             {scheduleError && <Alert variant="danger">{scheduleError}</Alert>}
//           </Form>
//           {/* List of schedules to be added */}
//           {multiSchedules.length > 0 && (
//             <div className="mt-4">
//               <h5>Schedules to be added:</h5>
//               <Table striped bordered hover responsive className="shadow-sm" style={{ borderRadius: 12, overflow: 'hidden' }}>
//                 <thead className="table-dark">
//                   <tr>
//                     <th>Email</th>
//                     <th>Start Date</th>
//                     <th>End Date</th>
//                     <th>Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {multiSchedules.map(s => (
//                     <tr key={s.temp_id}>
//                       <td>{s.email}</td>
//                       <td>{s.start_date}</td>
//                       <td>{s.end_date}</td>
//                       <td>
//                         <Button size="sm" variant="outline-danger" onClick={() => removeLocalSchedule(s.temp_id)}>
//                           <i className="bi bi-trash"></i>
//                         </Button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>
//             </div>
//           )}
//         </Modal.Body>
//       </Modal>
//       {/* Bootstrap Icons */}
//       <link
//         rel="stylesheet"
//         href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css"
//       />
//     </div>
//   );
// }

// export default App;