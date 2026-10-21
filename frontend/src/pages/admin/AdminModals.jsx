import { useState, useEffect, useMemo } from "react";
import { Clock, History, Lock, ShieldCheck, Loader2 } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { Modal } from "../../shared/components/Modal";
import { Button } from "../../shared/components/Button";
import { formatCourseDate } from "../../shared/utils/date";

// TanStack Query Hooks
import {
  useCreateTeacher,
  useCreateCourse,
  useUpdateCourse,
  useAdminCourses,
} from "../../shared/hooks/useAdmin";

const INITIAL_TEACHER_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  subjects: "",
};

const INITIAL_COURSE_FORM = {
  code: "",
  title: "",
  description: "",
};

export default function AdminModals() {
  const {
    activeModal,
    closeModal,
    modalData,
    addStudent,
    addAnnouncement,
  } = useAdmin();

  // ---------------------------------------------------------------------------
  // Fetch Existing Courses for Dropdown (calls GET /api/admin/courses)
  // ---------------------------------------------------------------------------
  const { data: coursesData, isLoading: isLoadingCourses } = useAdminCourses({
    enabled: activeModal === "add-teacher", // Only fetch when Add Teacher modal is open
  });

  // Extract and filter active (non-deleted) courses
  const availableCourses = useMemo(() => {
    let list = [];
    if (Array.isArray(coursesData)) list = coursesData;
    else if (Array.isArray(coursesData?.courses)) list = coursesData.courses;
    else if (Array.isArray(coursesData?.data)) list = coursesData.data;

    return list.filter(
      (c) => !c.isDeleted && !c.deletedAt && c.status !== "Deleted"
    );
  }, [coursesData]);

  // ---------------------------------------------------------------------------
  // Teacher Hook & State
  // ---------------------------------------------------------------------------
  const [teacherForm, setTeacherForm] = useState(INITIAL_TEACHER_FORM);

  const {
    mutate: createTeacherMutation,
    isPending: isCreatingTeacher,
    error: teacherError,
    reset: resetTeacherMutation,
  } = useCreateTeacher({
    onSuccess: () => {
      closeModal();
      setTeacherForm(INITIAL_TEACHER_FORM);
      resetTeacherMutation();
    },
  });

  const handleTeacherSubmit = (e) => {
    e.preventDefault();
    if (
      !teacherForm.firstName ||
      !teacherForm.lastName ||
      !teacherForm.email ||
      !teacherForm.password
    )
      return;

    // Convert selected course into an array of subjects as expected by the teacher card
    createTeacherMutation({
      ...teacherForm,
      subjects: teacherForm.subjects ? [teacherForm.subjects] : [],
    });
  };

  // ---------------------------------------------------------------------------
  // Course Hooks & State (TanStack Query Connected)
  // ---------------------------------------------------------------------------
  const [courseForm, setCourseForm] = useState(INITIAL_COURSE_FORM);

  const [editCourseForm, setEditCourseForm] = useState({
    id: "",
    code: "",
    title: "",
    description: "",
    createdAt: "",
    updatedAt: "",
  });

  // Populate edit form when modal opens
  useEffect(() => {
    if (activeModal === "edit-course" && modalData) {
      setEditCourseForm({
        id: modalData._id || modalData.id || "",
        code: modalData.code || "",
        title: modalData.title || "",
        description: modalData.description || "",
        createdAt: modalData.createdAt || "",
        updatedAt: modalData.updatedAt || "",
      });
    }
  }, [activeModal, modalData]);

  // 1. Create Course Mutation
  const {
    mutate: createCourseMutation,
    isPending: isCreatingCourse,
    error: createCourseError,
    reset: resetCreateCourse,
  } = useCreateCourse({
    onSuccess: () => {
      closeModal();
      setCourseForm(INITIAL_COURSE_FORM);
      resetCreateCourse();
    },
  });

  // 2. Update Course Mutation
  const {
    mutate: updateCourseMutation,
    isPending: isUpdatingCourse,
    error: updateCourseError,
    reset: resetUpdateCourse,
  } = useUpdateCourse({
    onSuccess: () => {
      closeModal();
      resetUpdateCourse();
    },
  });

  const handleCourseSubmit = (e) => {
    e.preventDefault();
    if (!courseForm.code || !courseForm.title) return;

    createCourseMutation(courseForm);
  };

  const handleEditCourseSubmit = (e) => {
    e.preventDefault();
    const courseId = editCourseForm.id;
    if (!courseId || !editCourseForm.code || !editCourseForm.title) return;

    updateCourseMutation({
      id: courseId,
      payload: {
        code: editCourseForm.code,
        title: editCourseForm.title,
        description: editCourseForm.description,
      },
    });
  };

  // ---------------------------------------------------------------------------
  // Student & Announcement States
  // ---------------------------------------------------------------------------
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    grade: "Grade 10",
    section: "Section A",
    guardian: "",
    phone: "",
    status: "Active",
    attendanceRate: 98,
    gpa: 3.8,
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    author: "Dean Sterling",
    authorRole: "Administration",
    priority: "Normal",
    targetAudience: "All",
    pinned: false,
  });

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (!studentForm.name || !studentForm.email) return;
    addStudent(studentForm);
    closeModal();
  };

  const handleAnnouncementSubmit = (e) => {
    e.preventDefault();
    if (!announcementForm.title || !announcementForm.content) return;
    addAnnouncement(announcementForm);
    closeModal();
  };

  return (
    <>
      {/* 1. Add Student Modal */}
      <Modal
        isOpen={activeModal === "add-student"}
        onClose={closeModal}
        title="Enroll New Student"
        subtitle="Create an official academic record and assign grade level"
      >
        <form onSubmit={handleStudentSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Liam Parker"
                value={studentForm.name}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, name: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Institutional Email *
              </label>
              <input
                type="email"
                required
                placeholder="liam.p@edupulse.edu"
                value={studentForm.email}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, email: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Enroll Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Add Teacher Modal */}
      <Modal
        isOpen={activeModal === "add-teacher"}
        onClose={closeModal}
        title="Add Teacher"
        subtitle="Register teacher profile and assign active courses"
      >
        <form onSubmit={handleTeacherSubmit} className="space-y-4">
          {teacherError && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {teacherError?.response?.data?.message ||
                teacherError?.message ||
                "Failed to create teacher. Please try again."}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                placeholder="First Name"
                value={teacherForm.firstName}
                onChange={(e) =>
                  setTeacherForm({ ...teacherForm, firstName: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                placeholder="Last Name"
                value={teacherForm.lastName}
                onChange={(e) =>
                  setTeacherForm({ ...teacherForm, lastName: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                placeholder="name@edupulse.edu"
                value={teacherForm.email}
                onChange={(e) =>
                  setTeacherForm({ ...teacherForm, email: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="password..."
                value={teacherForm.password}
                onChange={(e) =>
                  setTeacherForm({ ...teacherForm, password: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Dynamic Courses Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Assign Course
            </label>
            <div className="relative">
              <select
                value={teacherForm.subjects}
                onChange={(e) =>
                  setTeacherForm({ ...teacherForm, subjects: e.target.value })
                }
                disabled={isLoadingCourses}
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">
                  {isLoadingCourses
                    ? "Loading available courses..."
                    : availableCourses.length === 0
                    ? "No courses found (create a course first)"
                    : "Select a course to assign..."}
                </option>
                {availableCourses.map((course) => {
                  const id = course._id || course.id;
                  const label = course.code
                    ? `${course.code} - ${course.title}`
                    : course.title;
                  return (
                    <option key={id} value={course.title}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Select an active academic course from your catalog to assign to this faculty member.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={closeModal}
              disabled={isCreatingTeacher}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isCreatingTeacher}
              iconLeft={
                isCreatingTeacher ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null
              }
            >
              {isCreatingTeacher ? "Creating..." : "Create Teacher"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. Create Course Modal */}
      <Modal
        isOpen={activeModal === "add-course"}
        onClose={closeModal}
        title="Create Academic Course"
        subtitle="Define course code, title, and description"
      >
        <form onSubmit={handleCourseSubmit} className="space-y-4">
          {createCourseError && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {createCourseError?.response?.data?.message ||
                createCourseError?.message ||
                "Failed to create course. Please try again."}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Course Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CSC 400"
                value={courseForm.code}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, code: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Course Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Advanced Data Structures"
                value={courseForm.title}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, title: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Course Description
            </label>
            <textarea
              rows={3}
              placeholder="Comprehensive course overview..."
              value={courseForm.description}
              onChange={(e) =>
                setCourseForm({ ...courseForm, description: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={closeModal}
              disabled={isCreatingCourse}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isCreatingCourse}
              iconLeft={
                isCreatingCourse ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null
              }
            >
              {isCreatingCourse ? "Saving..." : "Save Course"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3b. Edit Course Modal */}
      <Modal
        isOpen={activeModal === "edit-course"}
        onClose={closeModal}
        title="Edit Course Details"
        subtitle={`Update catalog specifications for ${
          editCourseForm.code || "selected course"
        }`}
      >
        <form onSubmit={handleEditCourseSubmit} className="space-y-4">
          {updateCourseError && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {updateCourseError?.response?.data?.message ||
                updateCourseError?.message ||
                "Failed to update course. Please try again."}
            </div>
          )}

          <div className="p-3.5 bg-slate-50/90 border border-slate-200/80 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600 font-medium">
              <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Audit & Tracking Information
              </span>
              <span className="font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200/80">
                Course ID: #{String(editCourseForm.id).slice(-6)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600">
              <div className="flex items-center gap-2 bg-white px-2.5 py-2 rounded-lg border border-slate-200/70">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <div className="truncate">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Created At
                  </span>
                  <span className="font-mono font-medium text-slate-800">
                    {formatCourseDate(editCourseForm.createdAt)}
                  </span>
                </div>
                <Lock className="w-3.5 h-3.5 text-slate-400 ml-auto shrink-0" />
              </div>

              <div className="flex items-center gap-2 bg-white px-2.5 py-2 rounded-lg border border-slate-200/70">
                <History className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <div className="truncate">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Last Updated
                  </span>
                  <span className="font-mono font-medium text-slate-800">
                    {formatCourseDate(editCourseForm.updatedAt)}
                  </span>
                </div>
                <Lock className="w-3.5 h-3.5 text-slate-400 ml-auto shrink-0" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Course Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CSC 400"
                value={editCourseForm.code}
                onChange={(e) =>
                  setEditCourseForm({ ...editCourseForm, code: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none font-mono font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Course Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Computer Graphics"
                value={editCourseForm.title}
                onChange={(e) =>
                  setEditCourseForm({ ...editCourseForm, title: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Course Description
            </label>
            <textarea
              rows={3}
              placeholder="Course overview..."
              value={editCourseForm.description}
              onChange={(e) =>
                setEditCourseForm({
                  ...editCourseForm,
                  description: e.target.value,
                })
              }
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={closeModal}
              disabled={isUpdatingCourse}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isUpdatingCourse}
              iconLeft={
                isUpdatingCourse ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null
              }
            >
              {isUpdatingCourse ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 4. Add Announcement Modal */}
      <Modal
        isOpen={activeModal === "add-announcement"}
        onClose={closeModal}
        title="Broadcast Institutional Notice"
        subtitle="Post announcements across campus bulletin and user channels"
      >
        <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Notice Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Annual Science Fair Guidelines & Dates"
              value={announcementForm.title}
              onChange={(e) =>
                setAnnouncementForm({
                  ...announcementForm,
                  title: e.target.value,
                })
              }
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Publish Notice
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}