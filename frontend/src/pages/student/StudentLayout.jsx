import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  studentCoursesInitial,
  studentElectivesInitial,
  studentAuditRecordsInitial,
} from './studentMockData';
import StudentSidebar from './StudentSidebar';
import StudentModals from './StudentModals';
import useToast from '../../shared/hooks/useToast';

export default function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const outlet = useOutlet();
  const { showToast } = useToast();

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const activeTab = pathSegments[1] || 'dashboard';

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

  const handleNavigateTab = (tab) => {
    navigate(tab === 'dashboard' ? '/student' : `/student/${tab}`);
  };

  const handleEnrollElective = (elective) => {
    if (elective.isEnrolled) {
      showToast?.(`Already enrolled in ${elective.code}.`, 'info');
      return;
    }
    if (enrolledCredits + elective.credits > maxCredits) {
      showToast?.(
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
    showToast?.(
      `Successfully enrolled in ${elective.code}: ${elective.title}! (+${elective.credits} Credits)`,
      'success',
    );
  };

  const handleVerifyAuditKey = (record) => {
    showToast?.(
      `Ledger Key Verified: [${record.courseCode}] SHA-256 Hash 0x7a8f...39b2 valid. Ingress device: ${record.ingressDevice}`,
      'success',
    );
  };

  const outletWithProps = outlet
    ? React.cloneElement(outlet, {
        courses,
        onNavigateTab: handleNavigateTab,
        onOpenTimetable: () => setIsTimetableMatrixOpen(true),
        onSelectCourse: setSelectedCourse,
        electives,
        enrolledCredits,
        maxCredits,
        onOpenElectiveModal: setSelectedElective,
        onEnrollElective: handleEnrollElective,
        onOpenTimetableMatrix: () => setIsTimetableMatrixOpen(true),
        auditRecords,
        onRequestAppeal: () => setIsAppealModalOpen(true),
        onVerifyKey: handleVerifyAuditKey,
      })
    : (
      <Outlet
        context={{
          courses,
          onNavigateTab: handleNavigateTab,
          onOpenTimetable: () => setIsTimetableMatrixOpen(true),
          onSelectCourse: setSelectedCourse,
          electives,
          enrolledCredits,
          maxCredits,
          onOpenElectiveModal: setSelectedElective,
          onEnrollElective: handleEnrollElective,
          onOpenTimetableMatrix: () => setIsTimetableMatrixOpen(true),
          auditRecords,
          onRequestAppeal: () => setIsAppealModalOpen(true),
          onVerifyKey: handleVerifyAuditKey,
        }}
      />
    );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex font-sans selection:bg-secondary-500/30 selection:text-slate-950">
      {/* 1. Student Portal Sidebar */}
      <StudentSidebar
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* 2. Main Page Layout (Offset for Sidebar on Large Screens) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Main Content Area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-16 lg:pt-6 pb-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {outletWithProps}
            </motion.div>
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
}
