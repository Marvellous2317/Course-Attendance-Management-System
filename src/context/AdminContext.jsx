import { createContext, useContext, useState } from 'react';
import {
  initialStats,
  initialStudents,
  initialTeachers,
  initialCourses,
  initialSchedules,
  initialInvoices,
  initialAnnouncements,
  initialNotifications,
} from '../data/mockData';
const AdminContext = createContext(void 0);
const defaultAdminUser = {
  name: 'Dean Katherine Sterling',
  email: 'admin@othello.edu',
  role: 'admin',
  title: 'Super Administrator',
  avatar:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};
const defaultTeacherUser = {
  name: 'Dr. Eleanor Vance',
  email: 'e.vance@othello.edu',
  role: 'teacher',
  title: 'Professor & Senior Faculty',
  department: 'Department of Computer Science & Artificial Intelligence',
  avatar:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
};
const defaultStudentUser = {
  name: 'Julian Vance-Hayes',
  email: 'j.vance@student.othello.edu',
  role: 'student',
  title: 'Senior Matriculant \u2022 CS-401',
  avatar:
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
};
export const initialTeacherCourses = [
  {
    id: 'tc-1',
    code: 'CS-401',
    title: 'Advanced Neural Architectures & Systems',
    department: 'School of Computing & Cybernetics',
    enrolled: 312,
    capacity: 320,
    percentFilled: 98,
    tag: 'Peak Demand',
    isFlagship: true,
    schedule: 'Wednesdays & Fridays \u2022 10:00 \u2013 11:30 AM',
    room: 'Amphitheater L-102',
    credits: 4,
    overview:
      'Deep-dive into transformer architectures, tensor parallelism, diffusion pipelines, and hardware acceleration.',
  },
  {
    id: 'tc-2',
    code: 'SWE-210',
    title: 'Full-Stack Enterprise Engineering',
    department: 'School of Computing & Cybernetics',
    enrolled: 245,
    capacity: 300,
    percentFilled: 82,
    schedule: 'Tuesdays & Thursdays \u2022 09:00 \u2013 10:30 AM',
    room: 'Tech Hall B-12',
    credits: 4,
    overview:
      'Event-driven architectures, microservices, containerization, resilient APIs, and continuous delivery.',
  },
  {
    id: 'tc-3',
    code: 'AI-490',
    title: 'Deep Reinforcement Learning Seminar',
    department: 'School of Computing & Cybernetics',
    enrolled: 165,
    capacity: 188,
    percentFilled: 88,
    tag: 'Honors Track',
    schedule: 'Tuesdays & Thursdays \u2022 14:00 \u2013 15:30 PM',
    room: 'Suite A-204 (Research Lab)',
    credits: 3,
    overview:
      'Policy gradient methods, Q-learning, model-based RL, actor-critic frameworks, and multi-agent systems.',
  },
  {
    id: 'tc-4',
    code: 'CS-100',
    title: 'Foundations of Computational Thinking',
    department: 'School of Computing & Cybernetics',
    enrolled: 120,
    capacity: 150,
    percentFilled: 80,
    schedule: 'Fridays \u2022 10:00 AM \u2013 13:00 PM',
    room: 'Hall C-1',
    credits: 3,
    overview:
      'Algorithmic complexity, recursion, discrete mathematical structures, and data representation.',
  },
];
export const initialAttendanceRecords = [
  {
    id: 'att-1',
    studentName: 'Julian Vance-Hayes',
    studentId: 'STU-2023-8841',
    checkInMethod: 'Biometric Gate Check-in',
    checkInTime: '09:54 AM',
    status: 'PRESENT',
  },
  {
    id: 'att-2',
    studentName: 'Priya Sharma',
    studentId: 'STU-2021-9923',
    checkInMethod: 'Smart Card Tap',
    checkInTime: '09:58 AM',
    status: 'PRESENT',
  },
  {
    id: 'att-3',
    studentName: "Liam O'Connor",
    studentId: 'STU-2025-0041',
    checkInMethod: 'Medical Notice on File',
    checkInTime: '09:00 AM',
    status: 'EXCUSED',
    notes: 'Medical clearance verified with campus health',
  },
  {
    id: 'att-4',
    studentName: 'Maya Lin',
    studentId: 'STU-2024-1092',
    checkInMethod: 'RFID Tap',
    checkInTime: '10:01 AM',
    status: 'PRESENT',
  },
  {
    id: 'att-5',
    studentName: 'Sophia Rodriguez',
    studentId: 'STU-2020-4112',
    checkInMethod: 'Biometric Tap',
    checkInTime: '09:52 AM',
    status: 'PRESENT',
  },
  {
    id: 'att-6',
    studentName: 'Marcus Sterling',
    studentId: 'STU-2024-5512',
    checkInMethod: 'Smart Card Tap',
    checkInTime: '09:50 AM',
    status: 'PRESENT',
  },
  {
    id: 'att-7',
    studentName: 'Chen Wei',
    studentId: 'STU-2023-4122',
    checkInMethod: 'Unexcused Absence',
    checkInTime: '\u2014',
    status: 'ABSENT',
  },
  {
    id: 'att-8',
    studentName: 'Devon Thorne',
    studentId: 'STU-2022-7721',
    checkInMethod: 'Biometric Tap',
    checkInTime: '09:56 AM',
    status: 'PRESENT',
  },
];
export const initialSubmissions = [
  {
    id: 'sub-1',
    studentName: 'Marcus Sterling',
    courseCode: 'CS-401',
    assignmentTitle: 'Lab 4: Transformer Fine-Tuning',
    submittedAt: '8m ago',
    status: 'Pending',
  },
  {
    id: 'sub-2',
    studentName: 'Sophia Chen',
    courseCode: 'SWE-210',
    assignmentTitle: 'Milestone 2: Distributed State System',
    submittedAt: '24m ago',
    status: 'Pending',
  },
  {
    id: 'sub-3',
    studentName: 'Devon Thorne',
    courseCode: 'AI-490',
    assignmentTitle: 'Research Proposal: Actor-Critic Policies',
    submittedAt: '1h ago',
    status: 'Pending',
  },
  {
    id: 'sub-4',
    studentName: 'Aria Montgomery',
    courseCode: 'CS-100',
    assignmentTitle: 'Problem Set 3: Recursion Theorems',
    submittedAt: '2h ago',
    status: 'Pending',
  },
];
const getInitialAppView = () => {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/login')) return 'login';
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/teacher')) return 'teacher';
    if (path.startsWith('/student')) return 'student';
  }
  return 'landing';
};

export function AdminProvider({ children }) {
  const [appView, setAppView] = useState(getInitialAppView);
  const [currentUser, setCurrentUser] = useState(defaultTeacherUser);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [teacherTab, setTeacherTab] = useState('dashboard');
  const [teacherCourses, setTeacherCourses] = useState(initialTeacherCourses);
  const [attendanceRecords, setAttendanceRecords] = useState(
    initialAttendanceRecords,
  );
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
  const [submissions] = useState(initialSubmissions);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats] = useState(initialStats);
  const [students, setStudents] = useState(initialStudents);
  const [teachers, setTeachers] = useState(initialTeachers);
  const [courses, setCourses] = useState(initialCourses);
  const [schedules, setSchedules] = useState(initialSchedules);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [toasts, setToasts] = useState([]);
  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };
  const showToast = (message, type = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4e3);
  };
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  const login = (email = 'admin@othello.edu') => {
    if (email.includes('vance') || email.includes('teacher')) {
      setCurrentUser(defaultTeacherUser);
      setAppView('teacher');
      showToast('Welcome to Othello Faculty Portal, Dr. Vance', 'success');
    } else if (email.includes('student') || email.includes('julian')) {
      setCurrentUser(defaultStudentUser);
      setAppView('student');
      showToast('Welcome to Othello Student LMS, Julian', 'success');
    } else {
      setCurrentUser(defaultAdminUser);
      setAppView('admin');
      showToast(
        'Authenticated as Super Administrator. Welcome back to Othello Institute.',
        'success',
      );
    }
  };
  const logout = () => {
    setCurrentUser(null);
    setAppView('login');
    showToast('Signed out of campus session securely.', 'info');
  };
  const switchToAdmin = () => {
    setCurrentUser(defaultAdminUser);
    setAppView('admin');
    showToast('Switched to Admin Console (Dean Katherine Sterling)', 'info');
  };
  const switchToTeacher = () => {
    setCurrentUser(defaultTeacherUser);
    setAppView('teacher');
    showToast('Switched to Teacher UI (Dr. Eleanor Vance)', 'info');
  };
  const switchToStudent = () => {
    setCurrentUser(defaultStudentUser);
    setAppView('student');
    showToast('Switched to Student UI (Julian Vance-Hayes)', 'info');
  };
  const updateAttendanceStatus = (id, status) => {
    setAttendanceRecords((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, status } : rec)),
    );
  };
  const markAllPresent = () => {
    setAttendanceRecords((prev) =>
      prev.map((rec) => ({ ...rec, status: 'PRESENT' })),
    );
    showToast('Marked all 312 students in CS-401 as Present', 'success');
  };
  const addTeacherCourse = (newCourse) => {
    const percentFilled = Math.round(
      (newCourse.enrolled / newCourse.capacity) * 100,
    );
    const item = {
      ...newCourse,
      id: `tc-${Date.now()}`,
      percentFilled,
    };
    setTeacherCourses((prev) => [item, ...prev]);
    showToast(
      `Course ${newCourse.code} provisioned and synced to registrar catalog.`,
      'success',
    );
  };
  const addStudent = (newStudent) => {
    const id = `s-${Date.now()}`;
    const studentId = `STU-2026-${Math.floor(1e3 + Math.random() * 9e3)}`;
    const enrolledDate = /* @__PURE__ */ new Date().toISOString().split('T')[0];
    const fullStudent = {
      ...newStudent,
      id,
      studentId,
      enrolledDate,
    };
    setStudents((prev) => [fullStudent, ...prev]);
    showToast(`Student ${fullStudent.name} enrolled successfully!`, 'success');
  };
  const deleteStudent = (id) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    showToast('Student removed from database', 'info');
  };
  const addTeacher = (newTeacher) => {
    const id = `t-${Date.now()}`;
    const teacherId = `FAC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const joinedDate = /* @__PURE__ */ new Date().toISOString().split('T')[0];
    const fullTeacher = {
      ...newTeacher,
      id,
      teacherId,
      joinedDate,
    };
    setTeachers((prev) => [fullTeacher, ...prev]);
    showToast(`Faculty member ${fullTeacher.name} appointed!`, 'success');
  };
  const deleteTeacher = (id) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    showToast('Faculty record archived', 'info');
  };
  const addCourse = (newCourse) => {
    const id = `c-${Date.now()}`;
    const fullCourse = {
      ...newCourse,
      id,
      enrolledCount: 0,
    };
    setCourses((prev) => [fullCourse, ...prev]);
    showToast(`Course ${fullCourse.code} created!`, 'success');
  };
  const deleteCourse = (id) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    showToast('Course catalog updated', 'info');
  };
  const addAnnouncement = (newAnnouncement) => {
    const id = `a-${Date.now()}`;
    const date = 'Just now';
    const fullAnnouncement = {
      ...newAnnouncement,
      id,
      date,
    };
    setAnnouncements((prev) => [fullAnnouncement, ...prev]);
    showToast('Announcement broadcasted across institution!', 'success');
  };
  const toggleInvoiceStatus = (id) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          const nextStatus = inv.status === 'Paid' ? 'Pending' : 'Paid';
          return {
            ...inv,
            status: nextStatus,
            paidDate:
              nextStatus === 'Paid'
                ? /* @__PURE__ */ new Date().toISOString().split('T')[0]
                : void 0,
          };
        }
        return inv;
      }),
    );
    showToast('Invoice transaction updated', 'info');
  };
  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };
  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All alerts marked as acknowledged', 'info');
  };
  const openModal = (modalId, data) => {
    setActiveModal(modalId);
    setModalData(data || null);
  };
  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };
  return (
    <AdminContext.Provider
      value={{
        appView,
        setAppView,
        currentUser,
        login,
        logout,
        switchToAdmin,
        switchToTeacher,
        switchToStudent,
        activeTab,
        setActiveTab,
        teacherTab,
        setTeacherTab,
        teacherCourses,
        addTeacherCourse,
        attendanceRecords,
        updateAttendanceStatus,
        markAllPresent,
        isAttendanceModalOpen,
        setIsAttendanceModalOpen,
        isNewCourseModalOpen,
        setIsNewCourseModalOpen,
        submissions,
        sidebarCollapsed,
        toggleSidebar,
        setSidebarCollapsed,
        mobileMenuOpen,
        setMobileMenuOpen,
        searchQuery,
        setSearchQuery,
        stats,
        students,
        teachers,
        courses,
        schedules,
        invoices,
        announcements,
        notifications,
        addStudent,
        deleteStudent,
        addTeacher,
        deleteTeacher,
        addCourse,
        deleteCourse,
        addAnnouncement,
        toggleInvoiceStatus,
        markNotificationRead,
        markAllNotificationsRead,
        activeModal,
        modalData,
        openModal,
        closeModal,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
