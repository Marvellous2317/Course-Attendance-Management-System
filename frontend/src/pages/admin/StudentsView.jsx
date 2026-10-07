import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  UserPlus,
  Filter,
  Award,
  CheckCircle2,
  Trash2,
  Eye,
  Download,
  Mail,
  Phone,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { Card } from "../../shared/components/Card";
import { Button } from "../../shared/components/Button";
import { Badge } from "../../shared/components/Badge";
import { ScrollReveal } from "../../shared/components/ScrollReveal";
import { EmptyState } from "../../shared/components/EmptyState";
export const StudentsView = () => {
  const { students, searchQuery, setSearchQuery, deleteStudent, openModal } =
    useAdmin();
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGrade =
        selectedGrade === "All" || student.grade === selectedGrade;
      const matchesStatus =
        selectedStatus === "All" || student.status === selectedStatus;
      return matchesSearch && matchesGrade && matchesStatus;
    });
  }, [students, searchQuery, selectedGrade, selectedStatus]);
  const honorRollCount = students.filter((s) => s.gpa >= 3.8).length;
  const avgAttendance = Math.round(
    students.reduce((acc, s) => acc + s.attendanceRate, 0) /
      (students.length || 1),
  );
  return (
    <div className="space-y-6 pb-12">

      {/* Control Bar: Filters, Search, Export & Add Button */}
      <ScrollReveal delay={0.2}>
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
             
              {["All", "Active", "Probation", "Inactive"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${selectedStatus === status ? "bg-slate-900 text-white shadow-xs font-bold" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
              <Button
                variant="outline"
                size="sm"
                iconLeft={<Download className="w-4 h-4" />}
                onClick={() => {
                  const csvContent =
                    "data:text/csv;charset=utf-8," +
                    ["Name,Student ID,Grade,GPA,Attendance,Status"]
                      .concat(
                        students.map(
                          (s) =>
                            `"${s.name}","${s.studentId}","${s.grade}",${s.gpa},${s.attendanceRate}%,"${s.status}"`,
                        ),
                      )
                      .join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "student_roster.csv");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                Export CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                iconLeft={<UserPlus className="w-4 h-4" />}
                onClick={() => openModal("add-student")}
              >
                Enroll Student
              </Button>
            </div>
          </div>
        </Card>
      </ScrollReveal>

      {/* Main Student Directory Table */}
      <ScrollReveal delay={0.25}>
        <Card className="overflow-hidden">
          {filteredStudents.length === 0 ? (
            <EmptyState
              title="No students matched your criteria"
              description="Try adjusting your grade filters or clearing the search query to view active records."
              actionLabel="Reset Search"
              onAction={() => {
                setSearchQuery("");
                setSelectedGrade("All");
                setSelectedStatus("All");
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-3">Student ID</th>
                    <th className="py-3.5 px-3">Attendance</th>
                    <th className="py-3.5 px-3">Contact</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredStudents.map((std) => (
                    <motion.tr
                      key={std.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={std.avatar}
                            alt={std.name}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors block truncate">
                              {std.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-normal flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {std.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Student ID */}
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">
                        {std.studentId}
                      </td>

                      {/* Attendance */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${std.attendanceRate >= 95 ? "bg-emerald-500" : std.attendanceRate >= 85 ? "bg-indigo-500" : "bg-amber-500"}`}
                              style={{ width: `${std.attendanceRate}%` }}
                            />
                          </div>
                          <span className="text-slate-700 font-semibold text-[11px]">
                            {std.attendanceRate}%
                          </span>
                        </div>
                      </td>

                      {/* Guardian & Phone */}
                      <td className="py-3.5 px-3 text-slate-600">
                        <span className="flex items-center gap-2 text-slate-800 text-xs">
                          <Phone className="w-3 h-3" />
                          {std.phone}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <Badge
                          variant={
                            std.status === "Active"
                              ? "emerald"
                              : std.status === "Probation"
                                ? "amber"
                                : "slate"
                          }
                          size="sm"
                          dot
                        >
                          {std.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => openModal("view-student", std)}
                            title="View student profile"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => deleteStudent(std.id)}
                            className="hover:text-rose-600"
                            title="Remove student"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </ScrollReveal>
    </div>
  );
};
