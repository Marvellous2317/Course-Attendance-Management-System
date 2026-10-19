import { useState, useEffect } from "react";
import { Clock, History, Lock, ShieldCheck } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { Modal } from "../../shared/components/Modal";
import { Button } from "../../shared/components/Button";
import { formatCourseDate } from "../../shared/utils/date";

export const AdminModals = () => {
  const {
    activeModal,
    closeModal,
    modalData,
    addStudent,
    addTeacher,
    addCourse,
    updateCourse,
    addAnnouncement,
  } = useAdmin();
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
  const [teacherForm, setTeacherForm] = useState({
    name: "",
    email: "",
    department: "Computer Science",
    subjects: "Data Structures, AI",
    phone: "",
    status: "Active",
    qualification: "M.Sc. in Computer Science",
    classesCount: 4,
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  });
  const [courseForm, setCourseForm] = useState({
    code: "",
    title: "",
    description: "",
    department: "Computer Science",
    instructorId: "tch-1",
    instructorName: "Dr. Evelyn Foster",
    maxCapacity: 35,
    credits: 3,
    room: "Hall B-102",
    schedule: "Mon / Wed 10:00 - 11:30 AM",
    status: "Active",
    color: "indigo",
  });
  const [editCourseForm, setEditCourseForm] = useState({
    id: "",
    code: "",
    title: "",
    description: "",
    department: "Computer Science",
    credits: 3,
    maxCapacity: 35,
    room: "",
    schedule: "",
    createdAt: "",
    updatedAt: "",
  });

  useEffect(() => {
    if (activeModal === "edit-course" && modalData) {
      setEditCourseForm({
        id: modalData.id ?? "",
        code: modalData.code || "",
        title: modalData.title || "",
        description: modalData.description || "",
        department: modalData.department || "Computer Science",
        credits: modalData.credits ?? 3,
        maxCapacity: modalData.maxCapacity ?? 35,
        room: modalData.room || "",
        schedule: modalData.schedule || "",
        createdAt: modalData.createdAt || "",
        updatedAt: modalData.updatedAt || "",
      });
    }
  }, [activeModal, modalData]);

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
    setStudentForm({
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
  };
  const handleTeacherSubmit = (e) => {
    e.preventDefault();
    if (!teacherForm.name || !teacherForm.email) return;
    addTeacher({
      ...teacherForm,
      subjects: teacherForm.subjects.split(",").map((s) => s.trim()),
    });
    closeModal();
  };
  const handleCourseSubmit = (e) => {
    e.preventDefault();
    if (!courseForm.code || !courseForm.title) return;
    addCourse(courseForm);
    closeModal();
    setCourseForm({
      code: "",
      title: "",
      description: "",
      department: "Computer Science",
      instructorId: "tch-1",
      instructorName: "Dr. Evelyn Foster",
      maxCapacity: 35,
      credits: 3,
      room: "Hall B-102",
      schedule: "Mon / Wed 10:00 - 11:30 AM",
      status: "Active",
      color: "indigo",
    });
  };
  const handleEditCourseSubmit = (e) => {
    e.preventDefault();
    if (!editCourseForm.code || !editCourseForm.title) return;
    updateCourse(editCourseForm.id, {
      code: editCourseForm.code,
      title: editCourseForm.title,
      description: editCourseForm.description,
      department: editCourseForm.department,
      credits: Number(editCourseForm.credits) || 3,
      maxCapacity: Number(editCourseForm.maxCapacity) || 30,
      room: editCourseForm.room,
      schedule: editCourseForm.schedule,
    });
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Grade Level
              </label>
              <select
                value={studentForm.grade}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, grade: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              >
                <option>Grade 9</option>
                <option>Grade 10</option>
                <option>Grade 11</option>
                <option>Grade 12</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Section
              </label>
              <select
                value={studentForm.section}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, section: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              >
                <option>Section A</option>
                <option>Section B</option>
                <option>Section C</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Initial GPA
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4.0"
                value={studentForm.gpa}
                onChange={(e) =>
                  setStudentForm({
                    ...studentForm,
                    gpa: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Guardian Name
              </label>
              <input
                type="text"
                placeholder="Parent or Guardian"
                value={studentForm.guardian}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, guardian: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={studentForm.phone}
                onChange={(e) =>
                  setStudentForm({ ...studentForm, phone: e.target.value })
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

      {/* 2. Add Faculty Modal */}
      <Modal
        isOpen={activeModal === "add-teacher"}
        onClose={closeModal}
        title="Add Faculty Member"
        subtitle="Register teacher profile and departmental assignment"
      >
        <form onSubmit={handleTeacherSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Instructor Name *
              </label>
              <input
                type="text"
                required
                placeholder="Prof. or Dr. Full Name"
                value={teacherForm.name}
                onChange={(e) =>
                  setTeacherForm({ ...teacherForm, name: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Faculty Email *
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Academic Department
              </label>
              <select
                value={teacherForm.department}
                onChange={(e) =>
                  setTeacherForm({ ...teacherForm, department: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              >
                <option>Science & Physics</option>
                <option>Mathematics & Computing</option>
                <option>Computer Science</option>
                <option>Humanities & Literature</option>
                <option>Fine Arts & Design</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Highest Qualification
              </label>
              <input
                type="text"
                placeholder="e.g. Ph.D. Harvard, M.Sc. MIT"
                value={teacherForm.qualification}
                onChange={(e) =>
                  setTeacherForm({
                    ...teacherForm,
                    qualification: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Subjects (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Calculus, Linear Algebra, Statistics"
              value={teacherForm.subjects}
              onChange={(e) =>
                setTeacherForm({ ...teacherForm, subjects: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Faculty Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. Create Course Modal */}
      <Modal
        isOpen={activeModal === "add-course"}
        onClose={closeModal}
        title="Create Academic Course"
        subtitle="Define course code, credit weight, and scheduling slot"
      >
        <form onSubmit={handleCourseSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Course Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CS-301"
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
                placeholder="e.g. Advanced Data Structures & Algorithms"
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
              rows={2}
              placeholder="e.g. Comprehensive introduction to foundational algorithms, graphs, and dynamic programming..."
              value={courseForm.description}
              onChange={(e) =>
                setCourseForm({ ...courseForm, description: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                value={courseForm.department}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, department: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              >
                <option>Computer Science</option>
                <option>Science & Physics</option>
                <option>Mathematics & Computing</option>
                <option>Humanities & Literature</option>
                <option>Fine Arts & Design</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Credits
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={courseForm.credits}
                onChange={(e) =>
                  setCourseForm({
                    ...courseForm,
                    credits: parseInt(e.target.value) || 3,
                  })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Max Capacity
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={courseForm.maxCapacity}
                onChange={(e) =>
                  setCourseForm({
                    ...courseForm,
                    maxCapacity: parseInt(e.target.value) || 30,
                  })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Hall / Lab
              </label>
              <input
                type="text"
                placeholder="e.g. Lab B-204"
                value={courseForm.room}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, room: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Schedule Timing
              </label>
              <input
                type="text"
                placeholder="e.g. Tue / Thu 10:00 - 11:30 AM"
                value={courseForm.schedule}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, schedule: e.target.value })
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
              Save Course
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3b. Edit Course Modal */}
      <Modal
        isOpen={activeModal === "edit-course"}
        onClose={closeModal}
        title="Edit Course Details"
        subtitle={`Update catalog specifications for ${editCourseForm.code || "selected course"}`}
      >
        <form onSubmit={handleEditCourseSubmit} className="space-y-4">
          {/* Read-only Tracking & System Info Banner */}
          <div className="p-3.5 bg-slate-50/90 border border-slate-200/80 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600 font-medium">
              <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Audit & Tracking Information
              </span>
              <span className="font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200/80">
                Course ID: #{editCourseForm.id}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600">
              <div className="flex items-center gap-2 bg-white px-2.5 py-2 rounded-lg border border-slate-200/70">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <div className="truncate">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Created At (Read-only)
                  </span>
                  <span
                    className="font-mono font-medium text-slate-800"
                    title={editCourseForm.createdAt}
                  >
                    {formatCourseDate(editCourseForm.createdAt)}
                  </span>
                </div>
                <Lock
                  className="w-3.5 h-3.5 text-slate-400 ml-auto shrink-0"
                  title="System timestamp cannot be edited"
                />
              </div>

              <div className="flex items-center gap-2 bg-white px-2.5 py-2 rounded-lg border border-slate-200/70">
                <History className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <div className="truncate">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Last Updated (Read-only)
                  </span>
                  <span
                    className="font-mono font-medium text-slate-800"
                    title={editCourseForm.updatedAt}
                  >
                    {formatCourseDate(editCourseForm.updatedAt)}
                  </span>
                </div>
                <Lock
                  className="w-3.5 h-3.5 text-slate-400 ml-auto shrink-0"
                  title="Auto-updated upon saving changes"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              * Timestamps are read-only and automatically maintained by the backend audit system.
            </p>
          </div>

          {/* Form fields: Code and Title */}
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
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Course Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Computer graphics"
                value={editCourseForm.title}
                onChange={(e) =>
                  setEditCourseForm({ ...editCourseForm, title: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Course Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Course Description
            </label>
            <textarea
              rows={3}
              placeholder="e.g. This is for computer graphics"
              value={editCourseForm.description}
              onChange={(e) =>
                setEditCourseForm({
                  ...editCourseForm,
                  description: e.target.value,
                })
              }
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          {/* Department, Credits, Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                value={editCourseForm.department}
                onChange={(e) =>
                  setEditCourseForm({
                    ...editCourseForm,
                    department: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              >
                <option>Computer Science</option>
                <option>Science & Physics</option>
                <option>Mathematics & Computing</option>
                <option>Humanities & Literature</option>
                <option>Fine Arts & Design</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Credits
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={editCourseForm.credits}
                onChange={(e) =>
                  setEditCourseForm({
                    ...editCourseForm,
                    credits: parseInt(e.target.value) || 3,
                  })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Max Capacity
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={editCourseForm.maxCapacity}
                onChange={(e) =>
                  setEditCourseForm({
                    ...editCourseForm,
                    maxCapacity: parseInt(e.target.value) || 30,
                  })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Hall & Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Hall / Lab
              </label>
              <input
                type="text"
                placeholder="e.g. Lab G-105"
                value={editCourseForm.room}
                onChange={(e) =>
                  setEditCourseForm({ ...editCourseForm, room: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Schedule Timing
              </label>
              <input
                type="text"
                placeholder="e.g. Mon / Wed 02:00 - 03:30 PM"
                value={editCourseForm.schedule}
                onChange={(e) =>
                  setEditCourseForm({
                    ...editCourseForm,
                    schedule: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={announcementForm.priority}
                onChange={(e) =>
                  setAnnouncementForm({
                    ...announcementForm,
                    priority: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Audience
              </label>
              <select
                value={announcementForm.targetAudience}
                onChange={(e) =>
                  setAnnouncementForm({
                    ...announcementForm,
                    targetAudience: e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none"
              >
                <option value="All">All Campus</option>
                <option value="Teachers">Faculty Only</option>
                <option value="Students">Students Only</option>
                <option value="Staff">Staff Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Notice Body *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Write the full institutional bulletin content here..."
              value={announcementForm.content}
              onChange={(e) =>
                setAnnouncementForm({
                  ...announcementForm,
                  content: e.target.value,
                })
              }
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinnedCheck"
              checked={announcementForm.pinned}
              onChange={(e) =>
                setAnnouncementForm({
                  ...announcementForm,
                  pinned: e.target.checked,
                })
              }
              className="w-4 h-4 text-indigo-600 rounded border-slate-300"
            />
            <label
              htmlFor="pinnedCheck"
              className="text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Pin to top of bulletin board
            </label>
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

      {/* 5. View Student Modal */}
      {modalData && activeModal === "view-student" && (
        <Modal
          isOpen={true}
          onClose={closeModal}
          title="Student Academic Dossier"
          subtitle={`Official Record \u2022 ID: ${modalData.studentId}`}
        >
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <img
                src={modalData.avatar}
                alt={modalData.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/20"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {modalData.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {modalData.grade} • {modalData.section}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    Status: {modalData.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    Enrolled: {modalData.enrolledDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Metric Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                  Cumulative GPA
                </span>
                <span className="text-2xl font-bold text-slate-900 mt-1 block">
                  {modalData.gpa.toFixed(2)}
                </span>
                <span className="text-[11px] text-emerald-600 font-medium">
                  Honor Standing
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                  Attendance Rate
                </span>
                <span className="text-2xl font-bold text-slate-900 mt-1 block">
                  {modalData.attendanceRate}%
                </span>
                <span className="text-[11px] text-indigo-600 font-medium">
                  Verified Regular
                </span>
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Guardian Contact:</span>
                <span className="font-semibold text-slate-800">
                  {modalData.guardian}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Emergency Phone:</span>
                <span className="font-semibold text-slate-800">
                  {modalData.phone}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Student Email:</span>
                <span className="font-semibold text-slate-800">
                  {modalData.email}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button size="sm" variant="secondary" onClick={closeModal}>
                Close Record
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
