import React, { useEffect, useMemo, useState } from 'react';
import { Button, Spinner, Badge } from 'react-bootstrap';
import Sidebar from './Sidebar';
import Header from './Header';
import ProgramTable from './ProgramTable';
import SchedulesTable from './SchedulesTable';
import ProgramModal from './ProgramModal';
import EditProgramModal from './EditProgramModal';
import DetailsModal from './DetailsModal';
import SchedulesModal from './SchedulesModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';// --- IDEAL SOFT GREEN THEME ---
const palette = {
  primary: '#28a745', // soft green for highlights and actions
  accent: '#e6fff2', // light green accent for subtle highlights
  background: '#f5f5f5', // subtle light gray for main background
  card: '#fff', // clean white for cards and tables
  text: '#222', // dark gray for text
  border: '#e0e0e0', // lighter border for separation
  header: 'linear-gradient(90deg, #28a745 0%, #e6fff2 100%)', // gradient for headers
  section: '#f0f4f8', // very light blue-gray for section backgrounds
  success: '#28a745',
  danger: '#dc2626',
};

const fontFamily = 'Segoe UI, Roboto, Arial, sans-serif';

const cardStyle = {
  borderRadius: 16,
  border: `1px solid ${palette.border}`,
  boxShadow: '0 2px 16px 0 rgba(40,167,69,0.08)',
  background: palette.card,
  fontFamily,
  color: palette.text,
};
const gradientHeader = {
  background: palette.header,
  color: '#fff',
  borderRadius: '16px 16px 0 0',
  padding: '24px 24px 12px 24px',
  borderBottom: `1px solid ${palette.border}`,
  fontWeight: 700,
  letterSpacing: 1,
  fontFamily,
  fontSize: '1.6rem',
};
const badgeInfo = {
  background: palette.primary,
  color: '#fff',
  fontWeight: 600,
  fontSize: 13,
  borderRadius: 8,
  padding: '2px 10px',
  border: 'none',
  fontFamily,
};
const badgeSecondary = {
  background: palette.section,
  color: palette.primary,
  fontWeight: 600,
  fontSize: 13,
  borderRadius: 8,
  padding: '2px 10px',
  border: 'none',
  fontFamily,
};
const actionBtn = {
  borderRadius: 50,
  background: palette.primary,
  border: 'none',
  color: '#fff',
  marginRight: 6,
  transition: 'background 0.2s',
  fontWeight: 600,
  fontFamily,
  boxShadow: '0 2px 8px rgba(40,167,69,0.10)',
};
const tableRow = {
  background: palette.card,
  borderBottom: `1px solid ${palette.border}`,
  fontFamily,
  color: palette.text,
};
const tableRowAlt = {
  background: palette.section,
  fontFamily,
  color: palette.text,
};

// Custom gradient background for header and modals
// const gradientHeader = {
//   background: 'linear-gradient(90deg, #0072ff 0%, #00c6ff 100%)',
//   color: '#fff',
//   borderRadius: '8px 8px 0 0',
//   // padding: '24px 24px 12px 24px',
//   boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
// };

const API_BASE = 'http://localhost:5000/api';

// Add styles for fixed sidebar and navbar
const SIDEBAR_WIDTH = 180;
const NAVBAR_HEIGHT = 64;
const sidebarStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  height: '100vh',
  width: SIDEBAR_WIDTH + 'px',
  zIndex: 100,
  background: palette.card,
  boxShadow: '0 2px 16px 0 rgba(40,167,69,0.08)',
};
const navbarStyle = {
  position: 'fixed',
  top: 0,
  left: SIDEBAR_WIDTH + 'px',
  right: 0,
  height: NAVBAR_HEIGHT + 'px',
  zIndex: 101,
  background: palette.card,
  boxShadow: '0 2px 16px 0 rgba(40,167,69,0.08)',
};

function App() {
  // Sidebar tab state
  const [activeTab, setActiveTab] = useState('programs');

  // Listen for sidebar tab change
  useEffect(() => {
    const handler = (e) => setActiveTab(e.detail);
    window.addEventListener('sidebarTabChange', handler);
    return () => window.removeEventListener('sidebarTabChange', handler);
  }, []);
  // ---- Table state
  const [programs, setPrograms] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState('');

  // ---- Modal state
  const [showModal, setShowModal] = useState(false);

  // ---- Builder state
  const [current, setCurrent] = useState({ id: null, title: '' });
  const [weeks, setWeeks] = useState([]);
  const [moduleDrafts, setModuleDrafts] = useState({});
  const [building, setBuilding] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Add a loading state for allProgramWeeks
  const [allProgramWeeksLoading, setAllProgramWeeksLoading] = useState(true);

  // Add this new state:
  const [allProgramWeeks, setAllProgramWeeks] = useState([]);

  // Fetch all weeks (with modules) for all programs after loading programs
  useEffect(() => {
    const fetchAllWeeksAndModules = async () => {
      setAllProgramWeeksLoading(true);
      if (programs.length === 0) {
        setAllProgramWeeks([]);
        setAllProgramWeeksLoading(false);
        return;
      }
      let allWeeks = [];
      for (const program of programs) {
        const res = await fetch(`${API_BASE}/programs/${program.id}/weeks`);
        if (res.ok) {
          const ws = await res.json();
          // For each week, fetch modules
          const weeksWithModules = await Promise.all(ws.map(async w => {
            const modRes = await fetch(`${API_BASE}/weeks/${w.id}/modules`);
            const mods = modRes.ok ? await modRes.json() : [];
            return { ...w, program_id: program.id, modules: mods };
          }));
          allWeeks = allWeeks.concat(weeksWithModules);
        }
      }
      setAllProgramWeeks(allWeeks);
      setAllProgramWeeksLoading(false);
    };
    fetchAllWeeksAndModules();
  }, [programs]);

  // ---- Details modal state (not used for inline details anymore)
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [detailsProgram, setDetailsProgram] = useState(null);

  // ---- Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);

  // ---- Local ack for "Complete Program" (no API call)
  const [ackMessage, setAckMessage] = useState('');

  // ---- Schedules state ----
  const [schedules, setSchedules] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ email: '', program_id: '', start_date: '', end_date: '', is_finished: false });
  const [scheduleError, setScheduleError] = useState('');
  const [programOptions, setProgramOptions] = useState([]);
  const [selectedProgramWeeks, setSelectedProgramWeeks] = useState(0); // For auto end date

  // ---- Multi-schedule modal state ----
  const [multiSchedules, setMultiSchedules] = useState([]); // Local schedules for modal

  // New state for program schedule details modal (not used for inline details anymore)
  const [showProgramScheduleModal, setShowProgramScheduleModal] = useState(false);
  const [selectedProgramForSchedules, setSelectedProgramForSchedules] = useState(null);
  const [selectedProgramSchedules, setSelectedProgramSchedules] = useState([]);

  // Group schedules by program
  const groupedSchedules = programs.map(program => {
    const schedulesForProgram = schedules.filter(s => String(s.program_id) === String(program.id));
    return {
      program,
      schedules: schedulesForProgram
    };
  }).filter(g => g.schedules.length > 0);

  // Search state for employee in schedules
  const [searchEmployee, setSearchEmployee] = useState('');

  // Filtered schedules by search (live filtering)
  const filteredGroupedSchedules = useMemo(() => {
    if (!searchEmployee.trim()) return groupedSchedules;
    const query = searchEmployee.trim().toLowerCase();
    return groupedSchedules
      .map(({ program, schedules }) => ({
        program,
        schedules: schedules.filter(s => s.email.toLowerCase().includes(query))
      }))
      .filter(g => g.schedules.length > 0);
  }, [groupedSchedules, searchEmployee]);

  // Search state for employee in schedules
  const [searchResults, setSearchResults] = useState([]);

  // Search handler
  const handleSearchEmployee = () => {
    const query = searchEmployee.trim().toLowerCase();
    if (!query) {
      setSearchResults([]);
      return;
    }
    // Find all programs where this employee is enrolled
    const enrolledPrograms = programs.filter(program =>
      schedules.some(s =>
        String(s.program_id) === String(program.id) &&
        s.email.toLowerCase().includes(query)
      )
    );
    setSearchResults(enrolledPrograms);
  };

  // Delete a schedule from details modal
  const handleDeleteScheduleFromModal = async (id) => {
    if (!window.confirm('Delete this employee schedule?')) return;
    try {
      const res = await fetch(`${API_BASE}/schedules/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete schedule');
      // Remove from modal state immediately
      setSelectedProgramSchedules(prev => prev.filter(s => s.id !== id));
      // Also reload all schedules for table
      await loadSchedules();
    } catch (err) {
      window.alert(err.message || 'Failed to delete schedule');
    }
  };

  // ===== Table load =====
  const loadPrograms = async () => {
    try {
      setTableLoading(true);
      setTableError('');
      const res = await fetch(`${API_BASE}/programs`);
      if (!res.ok) throw new Error(`Failed to load programs (${res.status})`);
      const data = await res.json();
      setPrograms(Array.isArray(data) ? data : []);
    } catch (err) {
      setTableError(err.message || 'Failed to load programs');
    } finally {
      setTableLoading(false);
    }
  };

  // ===== Load schedules =====
  const loadSchedules = async () => {
    setScheduleLoading(true);
    setScheduleError('');
    try {
      const res = await fetch(`${API_BASE}/schedules`);
      if (!res.ok) throw new Error('Failed to load schedules');
      const data = await res.json();
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      setScheduleError(err.message || 'Failed to load schedules');
    } finally {
      setScheduleLoading(false);
    }
  };

  // ===== Load programs for dropdown =====
  const loadProgramOptions = async () => {
    try {
      const res = await fetch(`${API_BASE}/programs`);
      if (!res.ok) throw new Error('Failed to load programs');
      const data = await res.json();
      setProgramOptions(Array.isArray(data) ? data : []);
    } catch (err) {
      setProgramOptions([]);
    }
  };

  useEffect(() => {
    loadPrograms();
    loadSchedules();
    loadProgramOptions();
  }, []);

  const nextWeekNumber = useMemo(() => {
    const maxExisting = weeks.reduce((max, w) => Math.max(max, Number(w.week_number) || 0), 0);
    return maxExisting + 1;
  }, [weeks]);

  // ===== Actions =====
  const startBuilding = async () => {
    setAckMessage('');
    if (!current.title.trim()) {
      alert('Please enter a program title.');
      return false; // Indicate failure
    }
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/programs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: current.title.trim() })
      });
      if (!res.ok) throw new Error(`Failed to create program (${res.status})`);
      const data = await res.json();
      setCurrent(prev => ({ ...prev, id: data.program_id }));
      setWeeks([]);
      setBuilding(true);
      // Do NOT close modal here; let ProgramModal handle step change
      await loadPrograms();
      return true; // Indicate success
    } catch (err) {
      alert(err.message || 'Failed to create program.');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const addWeek = async () => {
    setAckMessage('');
    if (!current.id) {
      alert('No program selected/created.');
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/programs/${current.id}/weeks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week_number: nextWeekNumber }),
      });
      if (res.status === 409) {
        alert(`Week ${nextWeekNumber} already exists.`);
        return;
      }
      if (!res.ok) throw new Error(`Failed to add week (${res.status})`);
      const data = await res.json();
      setWeeks(prev => [...prev, { id: data.week_id, hasRealId: true, week_number: nextWeekNumber, modules: [] }]);
      await loadPrograms();
    } catch (err) {
      alert(err.message || 'Failed to add week.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateModuleDraft = (weekId, field, value) => {
    setModuleDrafts(prev => ({
      ...prev,
      [weekId]: { ...(prev[weekId] || { title: '', file_link: '' }), [field]: value }
    }));
  };

  const addModule = async (weekId) => {
    setAckMessage('');
    const draft = moduleDrafts[weekId] || { title: '', file_link: '' };
    if (!draft.title.trim() || !draft.file_link.trim()) {
      alert('Module title and file link are required.');
      return;
    }
    // Convert local file path to HTTP URL if needed
    let fileLink = draft.file_link.trim();
    if (fileLink.startsWith('C:\\') || fileLink.startsWith('c:/') || fileLink.startsWith('file:///')) {
      const fileName = fileLink.split(/\\|\//).pop();
      fileLink = `http://localhost:5000/files/${fileName}`;
    }
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/weeks/${weekId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: draft.title.trim(), file_link: fileLink }),
      });
      if (!res.ok) throw new Error(`Failed to add module (${res.status})`);
      const data = await res.json();
      const newMod = {
        id: data.module_id,
        title: draft.title.trim(),
        file_link: draft.file_link.trim(),
        is_finished: undefined,
        completed_at: null
      };
      setWeeks(prev => prev.map(w => (w.id === weekId ? { ...w, modules: [...(w.modules || []), newMod] } : w)));
      setModuleDrafts(prev => ({ ...prev, [weekId]: { title: '', file_link: '' } }));
    } catch (err) {
      alert(err.message || 'Failed to add module.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setBuilding(false);
    setCurrent({ id: null, title: '' });
    setWeeks([]);
    setModuleDrafts({});
    setShowModal(false);
    setShowEditModal(false);
    setAckMessage('');
  };

  // ===== Details modal (not used for inline details anymore) =====
  const openDetailsModal = async (program) => {
    setShowDetailsModal(true);
    setDetailsLoading(true);
    setDetailsError('');
    setDetailsProgram(program);
    try {
      const res = await fetch(`${API_BASE}/programs/${program.id}/weeks`);
      const ws = res.ok ? await res.json() : [];
      // Fetch modules for each week
      const weeksWithModules = await Promise.all(ws.map(async w => {
        const modRes = await fetch(`${API_BASE}/weeks/${w.id}/modules`);
        const mods = modRes.ok ? await modRes.json() : [];
        return { ...w, hasRealId: true, modules: mods };
      }));
      setWeeks(weeksWithModules);
    } catch (e) {
      setDetailsError(e.message || 'Failed to load details');
      setWeeks([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  // ===== Edit modal =====
  const openEditModal = async (program) => {
    setCurrent({ id: program.id, title: program.title });
    setBuilding(true);
    setShowEditModal(true);
    setShowModal(false);
    try {
      const res = await fetch(`${API_BASE}/programs/${program.id}/weeks`);
      const ws = res.ok ? await res.json() : [];
      const weeksWithModules = await Promise.all(ws.map(async w => {
        const modRes = await fetch(`${API_BASE}/weeks/${w.id}/modules`);
        const mods = modRes.ok ? await modRes.json() : [];
        return { ...w, hasRealId: true, modules: mods };
      }));
      setWeeks(weeksWithModules);
    } catch (e) {
      setWeeks([]);
    }
  };

  const handleDeleteProgram = async (programId) => {
    if (!window.confirm('Are you sure you want to delete this program?')) return;
    try {
      const res = await fetch(`${API_BASE}/programs/${programId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete program');
      await loadPrograms();
      window.alert('Program deleted successfully!');
    } catch (err) {
      window.alert(err.message || 'Failed to delete program');
    }
  };

  const handleCopyProgram = async (programId) => {
    const newTitle = window.prompt('Enter new program title to copy this program:');
    if (!newTitle) return;
    try {
      const res = await fetch(`${API_BASE}/programs/${programId}/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ program_title: newTitle })
      });
      if (!res.ok) throw new Error('Failed to copy program');
      await loadPrograms();
      window.alert('Program copied successfully!');
    } catch (err) {
      window.alert(err.message || 'Failed to copy program');
    }
  };

  // ===== Schedules =====
  const handleScheduleFormChange = (field, value) => {
    setScheduleForm(prev => ({ ...prev, [field]: value }));

    // If changing program_id, update selectedProgramWeeks
    if (field === 'program_id') {
      const selected = programOptions.find(p => String(p.id) === String(value));
      setSelectedProgramWeeks(selected?.weeks_count || 0);
      // Reset end_date if program changes
      setScheduleForm(prev => ({ ...prev, end_date: '' }));
    }

    // If changing start_date and program_id is selected, auto-calculate end_date
    if (field === 'start_date') {
      if (scheduleForm.program_id) {
        const selected = programOptions.find(p => String(p.id) === String(scheduleForm.program_id));
        const weeksCount = selected?.weeks_count || selectedProgramWeeks || 0;
        if (value && weeksCount > 0) {
          const start = new Date(value);
          // End date is last day of last week (weeksCount * 7 - 1 days after start)
          const end = new Date(start);
          end.setDate(start.getDate() + weeksCount * 7 - 1);
          const endDateStr = end.toISOString().slice(0, 10);
          setScheduleForm(prev => ({ ...prev, end_date: endDateStr }));
        }
      }
    }
  };

  const openScheduleModalForProgram = (program) => {
    setShowScheduleModal(true);
    setScheduleForm({
      email: '',
      program_id: program.id,
      start_date: '',
      end_date: '',
      is_finished: false
    });
    setSelectedProgramWeeks(program.weeks_count || 0);
    setMultiSchedules([]); // Reset local schedules for modal
  };

  // Add schedule locally in modal
  const addLocalSchedule = () => {
    setScheduleError('');
    const { email, program_id, start_date, end_date } = scheduleForm;
    if (!email.trim() || !program_id || !start_date || !end_date) {
      setScheduleError('All fields are required.');
      return;
    }
    setMultiSchedules(prev => [
      ...prev,
      {
        email: email.trim(),
        program_id,
        start_date,
        end_date,
        is_finished: false,
        temp_id: Date.now() + Math.random() // For rendering
      }
    ]);
    // Reset only email for next entry, keep program/start/end
    setScheduleForm(prev => ({
      ...prev,
      email: ''
    }));
  };

  // Remove local schedule from modal
  const removeLocalSchedule = (temp_id) => {
    setMultiSchedules(prev => prev.filter(s => s.temp_id !== temp_id));
  };

  // Submit all local schedules to backend
  const submitAllSchedules = async () => {
    setScheduleError('');
    if (multiSchedules.length === 0) {
      setScheduleError('Add at least one schedule.');
      return;
    }
    try {
      for (const s of multiSchedules) {
        await fetch(`${API_BASE}/schedules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: s.email,
            program_id: s.program_id,
            start_date: s.start_date,
            end_date: s.end_date,
            is_finished: false
          })
        });
      }
      setShowScheduleModal(false);
      setScheduleForm({ email: '', program_id: '', start_date: '', end_date: '', is_finished: false });
      setMultiSchedules([]);
      await loadSchedules();
    } catch (err) {
      setScheduleError('Failed to create schedules');
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      const res = await fetch(`${API_BASE}/schedules/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete schedule');
      await loadSchedules();
    } catch (err) {
      window.alert(err.message || 'Failed to delete schedule');
    }
  };

  // ===== Modal scroll lock =====
  useEffect(() => {
    const isAnyModalOpen = showDetailsModal || showEditModal || showModal || showScheduleModal;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showDetailsModal, showEditModal, showModal, showScheduleModal]);

  // --- Inline details state for programs and schedules ---
  const [openProgramDetailsId, setOpenProgramDetailsId] = useState(null);
  const [openScheduleDetailsId, setOpenScheduleDetailsId] = useState(null);
  const [inlineDetailsLoading, setInlineDetailsLoading] = useState(false);
  const [inlineDetailsWeeks, setInlineDetailsWeeks] = useState([]);
  const [inlineDetailsError, setInlineDetailsError] = useState('');

  // For schedule details (list of schedules for a program)
  const [inlineScheduleList, setInlineScheduleList] = useState([]);
  const [inlineScheduleLoading, setInlineScheduleLoading] = useState(false);

  // Handle click on program title in training track
  const handleProgramTitleClick = async (program) => {
    if (openProgramDetailsId === program.id) {
      // Close details if already open
      setOpenProgramDetailsId(null);
      setInlineDetailsWeeks([]);
      setInlineDetailsError('');
      setInlineDetailsLoading(false);
      return;
    }
    setOpenProgramDetailsId(program.id);
    setInlineDetailsLoading(true);
    setInlineDetailsError('');
    setInlineDetailsWeeks([]);
    try {
      const res = await fetch(`${API_BASE}/programs/${program.id}/weeks`);
      const ws = res.ok ? await res.json() : [];
      // Fetch modules for each week
      const weeksWithModules = await Promise.all(ws.map(async w => {
        const modRes = await fetch(`${API_BASE}/weeks/${w.id}/modules`);
        const mods = modRes.ok ? await modRes.json() : [];
        return { ...w, hasRealId: true, modules: mods };
      }));
      setInlineDetailsWeeks(weeksWithModules);
    } catch (e) {
      setInlineDetailsError(e.message || 'Failed to load details');
      setInlineDetailsWeeks([]);
    } finally {
      setInlineDetailsLoading(false);
    }
    // Close schedule details if open
    setOpenScheduleDetailsId(null);
  };

  // Handle click on program title in schedules table
  const handleScheduleTitleClick = async (program) => {
    if (openScheduleDetailsId === program.id) {
      setOpenScheduleDetailsId(null);
      setInlineScheduleList([]);
      setInlineScheduleLoading(false);
      return;
    }
    setOpenScheduleDetailsId(program.id);
    setInlineScheduleLoading(true);
    setInlineScheduleList([]);
    // Get all schedules for this program
    const schedulesForProgram = schedules.filter(s => String(s.program_id) === String(program.id));
    // Simulate loading
    setTimeout(() => {
      setInlineScheduleList(schedulesForProgram);
      setInlineScheduleLoading(false);
    }, 200); // Simulate async
    // Close program details if open
    setOpenProgramDetailsId(null);
  };

  // Delete schedule from inline schedule details
  const handleDeleteScheduleInline = async (id, programId) => {
    if (!window.confirm('Delete this employee schedule?')) return;
    try {
      const res = await fetch(`${API_BASE}/schedules/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete schedule');
      // Remove from inline state immediately
      setInlineScheduleList(prev => prev.filter(s => s.id !== id));
      await loadSchedules();
    } catch (err) {
      window.alert(err.message || 'Failed to delete schedule');
    }
  };

  // Helper: Calculate progress percentage for a schedule
  function getScheduleProgress(schedule, programId) {
    // Find all weeks for this program
    const programWeeks = allProgramWeeks.filter(w => String(w.program_id) === String(programId));
    const allModules = programWeeks.flatMap(w => Array.isArray(w.modules) ? w.modules : []);
    const totalModules = allModules.length;
    if (totalModules === 0) return 0;
    // If schedule has completed_modules (array of module ids), use it
    let completed = 0;
    if (Array.isArray(schedule.completed_modules)) {
      completed = schedule.completed_modules.length;
    } else if (typeof schedule.completed_modules === 'string') {
      // If backend sends as comma-separated string
      completed = schedule.completed_modules.split(',').filter(Boolean).length;
    } else if (typeof schedule.progress === 'number') {
      // If backend sends progress as number (0-100)
      return schedule.progress;
    } else if (typeof schedule.is_finished === 'boolean' && schedule.is_finished) {
      return 100;
    }
    // If backend marks modules as finished per module, you may need to adjust here
    return Math.round((completed / totalModules) * 100);
  }

  return (
    <div style={{ minHeight: '100vh', background: palette.background, fontFamily }}>
      <div style={sidebarStyle}>
        <Sidebar userType="admin" />
      </div>
      <div style={navbarStyle}>
        <Header />
      </div>
      <div style={{ position: 'relative', left: SIDEBAR_WIDTH + 'px', top: NAVBAR_HEIGHT + 'px', padding: '32px', background: palette.card, minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px)`, overflowY: 'auto', overflowX: 'hidden', width: 'calc(100vw - ' + SIDEBAR_WIDTH + 'px)' }}>
        <main style={{ flex: 1, padding: '32px', background: palette.card }}>
          {activeTab === 'programs' && (
            <>
              {/* <div className="d-flex align-items-center justify-content-between mb-5">
                <h4 className="mb-0" style={{ fontWeight: 800, color: palette.text, letterSpacing: 1, textShadow: '0 1px 4px #e6fff2' }}>Training Track</h4>
                <Button variant="success" className="px-4 py-2" style={{ fontWeight: 700, borderRadius: 32, boxShadow: '0 2px 12px rgba(40,167,69,0.10)', fontFamily, fontSize: '1.1rem', transition: 'all 0.2s', border: 'none' }} onClick={() => setShowModal(true)}>
                  <i className="bi bi-plus-circle me-2"></i> New Program
                </Button>
              </div> */}
              <ProgramTable
                programs={programs}
                tableLoading={tableLoading}
                tableError={tableError}
                openProgramDetailsId={openProgramDetailsId}
                handleProgramTitleClick={handleProgramTitleClick}
                openEditModal={openEditModal}
                openScheduleModalForProgram={openScheduleModalForProgram}
                handleCopyProgram={handleCopyProgram}
                handleDeleteProgram={handleDeleteProgram}
                inlineDetailsLoading={inlineDetailsLoading}
                inlineDetailsError={inlineDetailsError}
                inlineDetailsWeeks={inlineDetailsWeeks}
                badgeInfo={badgeInfo}
                badgeSecondary={badgeSecondary}
                actionBtn={actionBtn}
                palette={palette}
                cardStyle={cardStyle}
                setShowModal={setShowModal}
              />
              <ProgramModal
                show={showModal}
                onHide={resetForm}
                current={current}
                setCurrent={setCurrent}
                submitting={submitting}
                startBuilding={startBuilding}
                resetForm={resetForm}
                palette={palette}
                gradientHeader={gradientHeader}
                weeks={weeks}
                moduleDrafts={moduleDrafts}
                updateModuleDraft={updateModuleDraft}
                addModule={addModule}
                addWeek={addWeek}
                nextWeekNumber={nextWeekNumber}
                ackMessage={ackMessage}
              />
              <DetailsModal
                show={showDetailsModal}
                onHide={() => setShowDetailsModal(false)}
                detailsProgram={detailsProgram}
                detailsLoading={detailsLoading}
                detailsError={detailsError}
                weeks={weeks}
                palette={palette}
                cardStyle={cardStyle}
              />
              <EditProgramModal
                show={showEditModal && current.id}
                current={current}
                weeks={weeks}
                moduleDrafts={moduleDrafts}
                updateModuleDraft={updateModuleDraft}
                addModule={addModule}
                addWeek={addWeek}
                submitting={submitting}
                nextWeekNumber={nextWeekNumber}
                resetForm={resetForm}
                ackMessage={ackMessage}
                palette={palette}
                fontFamily={fontFamily}
                deleteWeek={async (weekId) => {
                  if (!window.confirm('Delete this week?')) return;
                  try {
                    const res = await fetch(`${API_BASE}/weeks/${weekId}`, { method: 'DELETE' });
                    if (!res.ok) throw new Error('Failed to delete week');
                    setWeeks(prev => prev.filter(week => week.id !== weekId));
                  } catch (err) {
                    window.alert(err.message || 'Failed to delete week');
                  }
                }}
                deleteModule={async (weekId, moduleId) => {
                  if (!window.confirm('Delete this module?')) return;
                  try {
                    const res = await fetch(`${API_BASE}/modules/${moduleId}`, { method: 'DELETE' });
                    if (!res.ok) throw new Error('Failed to delete module');
                    setWeeks(prev => prev.map(week => week.id === weekId ? { ...week, modules: week.modules.filter(mod => mod.id !== moduleId) } : week));
                  } catch (err) {
                    window.alert(err.message || 'Failed to delete module');
                  }
                }}
                moveModuleUp={(weekId, idx) => setWeeks(prev => prev.map(week => {
                  if (week.id !== weekId) return week;
                  const modules = [...week.modules];
                  if (idx > 0) {
                    [modules[idx - 1], modules[idx]] = [modules[idx], modules[idx - 1]];
                  }
                  return { ...week, modules };
                }))}
                moveModuleDown={(weekId, idx) => setWeeks(prev => prev.map(week => {
                  if (week.id !== weekId) return week;
                  const modules = [...week.modules];
                  if (idx < modules.length - 1) {
                    [modules[idx], modules[idx + 1]] = [modules[idx + 1], modules[idx]];
                  }
                  return { ...week, modules };
                }))}
              />
              <SchedulesModal
                show={showScheduleModal}
                onHide={() => setShowScheduleModal(false)}
                scheduleForm={scheduleForm}
                handleScheduleFormChange={handleScheduleFormChange}
                programOptions={programOptions}
                selectedProgramWeeks={selectedProgramWeeks}
                addLocalSchedule={addLocalSchedule}
                submitAllSchedules={submitAllSchedules}
                localSchedules={multiSchedules}
                removeLocalSchedule={removeLocalSchedule}
                scheduleError={scheduleError}
              />
            </>
          )}
          {activeTab === 'schedules' && (
            <>
              {/* <div className="d-flex align-items-center justify-content-between mb-5">
                <h4 className="mb-0" style={{ fontWeight: 800, color: palette.text, letterSpacing: 1, textShadow: '0 1px 4px #e6fff2' }}>Schedules</h4>
              </div> */}
              <SchedulesTable
                filteredGroupedSchedules={filteredGroupedSchedules}
                allProgramWeeks={allProgramWeeks}
                searchEmployee={searchEmployee}
                setSearchEmployee={setSearchEmployee}
                scheduleLoading={scheduleLoading}
                allProgramWeeksLoading={allProgramWeeksLoading}
                scheduleError={scheduleError}
                openScheduleDetailsId={openScheduleDetailsId}
                handleScheduleTitleClick={handleScheduleTitleClick}
                inlineScheduleList={inlineScheduleList}
                inlineScheduleLoading={inlineScheduleLoading}
                getScheduleProgress={getScheduleProgress}
                handleDeleteScheduleInline={handleDeleteScheduleInline}
                showProgramScheduleModal={showProgramScheduleModal}
                setShowProgramScheduleModal={setShowProgramScheduleModal}
                selectedProgramForSchedules={selectedProgramForSchedules}
                selectedProgramSchedules={selectedProgramSchedules}
                handleDeleteScheduleFromModal={handleDeleteScheduleFromModal}
                gradientHeader={gradientHeader}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
