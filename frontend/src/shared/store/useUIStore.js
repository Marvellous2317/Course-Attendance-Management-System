import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // Navigation tabs
  activeTab: 'dashboard',
  setActiveTab: (activeTab) => set({ activeTab }),

  teacherTab: 'dashboard',
  setTeacherTab: (teacherTab) => set({ teacherTab }),

  // Sidebar & Navigation controls
  sidebarCollapsed: false,
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  mobileMenuOpen: false,
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),

  // Search
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  // Modal states
  activeModal: null,
  modalData: null,
  openModal: (activeModal, modalData = null) =>
    set({ activeModal, modalData }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  isAttendanceModalOpen: false,
  setIsAttendanceModalOpen: (isAttendanceModalOpen) =>
    set({ isAttendanceModalOpen }),

  isNewCourseModalOpen: false,
  setIsNewCourseModalOpen: (isNewCourseModalOpen) =>
    set({ isNewCourseModalOpen }),
}));
