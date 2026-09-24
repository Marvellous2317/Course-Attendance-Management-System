import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAdmin } from '../../context/AdminContext';
import {
  studentCoursesInitial,
  studentElectivesInitial,
  studentAuditRecordsInitial,
} from './studentMockData';
import { StudentSidebar } from './StudentSidebar';
import { StudentHeader } from './StudentHeader';
import { StudentDashboardPage } from './StudentDashboardPage';
import { StudentCoursesPage } from './StudentCoursesPage';
import { StudentEnrollmentPage } from './StudentEnrollmentPage';
import { StudentAttendancePage } from './StudentAttendancePage';
import { StudentSettingsPage } from './StudentSettingsPage';
import { StudentModals } from './StudentModals';
export const StudentPortalPage = () => {
  const {
    currentUser,
    switchToAdmin,
    switchToTeacher,
    switchToStudent,
    showToast,
  } = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [courses, setCourses] = useState(studentCoursesInitial);
  const [electives, setElectives] = useState(studentElectivesInitial);
  const [auditRecords, setAuditRecords] = useState(studentAuditRecordsInitial);
  const [enrolledCredits, setEnrolledCredits] = useState(18);
  const maxCredits = 22;
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedElective, setSelectedElective] = useState(null);
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [checkInCourseName, setCheckInCourseName] = useState(
    'CS-401: Advanced Neural Architectures',
  );
  const [isTimetableMatrixOpen, setIsTimetableMatrixOpen] = useState(false);
  const handleOpenCheckIn = (courseName) => {
    setCheckInCourseName(courseName);
    setIsCheckInModalOpen(true);
  };
  const handleEnrollElective = (elective) => {
    if (elective.isEnrolled) {
      showToast(`Already enrolled in ${elective.code}.`, 'info');
      return;
    }
    if (enrolledCredits + elective.credits > maxCredits) {
      showToast(
        `Cannot enroll: Credit limit of ${maxCredits} exceeded.`,
        'error',
      );
      return;
    }
    setElectives((prev) =>
      prev.map((e) =>
        e.id === elective.id
          ? { ...e, isEnrolled: true, seatsOpen: e.seatsOpen - 1 }
          : e,
      ),
    );
    setEnrolledCredits((prev) => prev + elective.credits);
    const newCourse = {
      id: `course-${elective.code.toLowerCase()}`,
      code: elective.code,
      title: elective.title,
      department: elective.department,
      credits: elective.credits,
      section: 'Section 01',
      schedule: elective.schedule,
      room: elective.room,
      instructorName: elective.instructorName,
      instructorTitle: elective.instructorTitle,
      instructorAvatar: elective.instructorAvatar,
      attendanceRate: 100,
      totalSessions: 32,
      presentSessions: 0,
      standing: 'GOOD STANDING',
      threshold: 85,
      isEnrolled: true,
      upcomingNotice: {
        title: `Orientation & Syllabus Handout`,
        time: `Next Session`,
        description: `Welcome to ${elective.code}. Bring lab notebook & SSH keys.`,
      },
    };
    setCourses((prev) => [...prev, newCourse]);
    if (selectedElective?.id === elective.id) {
      setSelectedElective(null);
    }
    showToast(
      `Successfully enrolled in ${elective.code}: ${elective.title}! (+${elective.credits} Credits)`,
      'success',
    );
  };
  const handleVerifyAuditKey = (record) => {
    showToast(
      `Ledger Key Verified: [${record.courseCode}] SHA-256 Hash 0x7a8f...39b2 valid. Ingress device: ${record.ingressDevice}`,
      'success',
    );
  };
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex font-sans selection:bg-secondary-500/30 selection:text-slate-950">
      {/* 1. Student Portal Sidebar */}
      <StudentSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* 2. Main Page Layout (Offset for Sidebar on Large Screens) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Sticky Header */}
        <StudentHeader
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          onOpenQuickScan={() =>
            handleOpenCheckIn('CS-401: Advanced Neural Architectures')
          }
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="student-dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <StudentDashboardPage
                  courses={courses}
                  onNavigateTab={setActiveTab}
                  onOpenCheckIn={handleOpenCheckIn}
                  onOpenTimetable={() => setIsTimetableMatrixOpen(true)}
                  onSelectCourse={setSelectedCourse}
                />
              </motion.div>
            )}

            {activeTab === 'courses' && (
              <motion.div
                key="student-courses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <StudentCoursesPage
                  courses={courses}
                  onSelectCourse={setSelectedCourse}
                  onNavigateTab={setActiveTab}
                />
              </motion.div>
            )}

            {activeTab === 'enrollment' && (
              <motion.div
                key="student-enrollment"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <StudentEnrollmentPage
                  electives={electives}
                  enrolledCredits={enrolledCredits}
                  maxCredits={maxCredits}
                  onOpenElectiveModal={setSelectedElective}
                  onEnrollElective={handleEnrollElective}
                  onOpenTimetableMatrix={() => setIsTimetableMatrixOpen(true)}
                />
              </motion.div>
            )}

            {activeTab === 'attendance' && (
              <motion.div
                key="student-attendance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <StudentAttendancePage
                  auditRecords={auditRecords}
                  onRequestAppeal={() => setIsAppealModalOpen(true)}
                  onVerifyKey={handleVerifyAuditKey}
                />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="student-settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <StudentSettingsPage />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* 3. High-Fidelity Interactive Modals */}
      <StudentModals
        selectedCourse={selectedCourse}
        onCloseCourseModal={() => setSelectedCourse(null)}
        selectedElective={selectedElective}
        onCloseElectiveModal={() => setSelectedElective(null)}
        onEnrollElective={handleEnrollElective}
        isAppealModalOpen={isAppealModalOpen}
        onCloseAppealModal={() => setIsAppealModalOpen(false)}
        isCheckInModalOpen={isCheckInModalOpen}
        onCloseCheckInModal={() => setIsCheckInModalOpen(false)}
        checkInCourseName={checkInCourseName}
        isTimetableMatrixOpen={isTimetableMatrixOpen}
        onCloseTimetableMatrix={() => setIsTimetableMatrixOpen(false)}
      />
    </div>
  );
};
