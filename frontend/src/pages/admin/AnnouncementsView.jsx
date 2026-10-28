import { useState } from "react";
import { Pin, Calendar, Filter, Plus } from "lucide-react";
import { useUIStore } from "../../shared/store/useUIStore";
import { initialAnnouncements } from "../../data/mockData";
import { Card } from "../../shared/components/Card";
import { Button } from "../../shared/components/Button";
import { Badge } from "../../shared/components/Badge";
import { ScrollReveal } from "../../shared/components/ScrollReveal";


export default function AnnouncementsView () {
  const { openModal } = useUIStore();
  const announcements = initialAnnouncements;
  const [selectedAudience, setSelectedAudience] = useState("All");
  const filteredAnnouncements = announcements.filter((anc) => {
    return (
      selectedAudience === "All" ||
      anc.targetAudience === selectedAudience ||
      anc.targetAudience === "All"
    );
  });
  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Title with Orange Category Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-50 text-amber-900 border border-amber-200/80 mb-2">
            <span className="w-2 h-2 rounded-full bg-secondary-500 animate-pulse" />
            <span>CAMPUS DISPATCH</span>
            <span className="text-amber-400">•</span>
            <span>INSTITUTIONAL BROADCASTS</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Institutional Notices & Announcements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish bulletins, semester alerts, and departmental notifications to students and faculty.
          </p>
        </div>
      </div>

      {/* 2. Control bar */}
      <ScrollReveal delay={0.05}>
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Audience:
              </span>
              {["All", "Students", "Teachers", "Staff"].map((aud) => (
                <button
                  key={aud}
                  type="button"
                  onClick={() => setSelectedAudience(aud)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    selectedAudience === aud
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {aud}
                </button>
              ))}
            </div>

            <Button
              variant="accent"
              size="sm"
              iconLeft={<Plus className="w-4 h-4 text-slate-950" />}
              onClick={() => openModal("add-announcement")}
            >
              Post New Notice
            </Button>
          </div>
        </Card>
      </ScrollReveal>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((anc, idx) => (
          <ScrollReveal key={anc.id} delay={0.08 + idx * 0.08}>
            <Card
              hoverEffect
              className={`p-6 ${anc.pinned ? "border-l-4 border-l-amber-500" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {anc.pinned && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                        <Pin className="w-3 h-3 text-amber-600" />
                        Pinned Notice
                      </span>
                    )}

                    <Badge
                      variant={
                        anc.priority === "Urgent"
                          ? "rose"
                          : anc.priority === "High"
                            ? "amber"
                            : "slate"
                      }
                      size="sm"
                      dot
                    >
                      {anc.priority} Priority
                    </Badge>

                    <Badge variant="indigo" size="sm">
                      For: {anc.targetAudience}
                    </Badge>

                    <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                      <Calendar className="w-3.5 h-3.5" />
                      {anc.date}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {anc.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
                    {anc.content}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[10px]">
                    {anc.author.charAt(0)}
                  </div>
                  <span>
                    Posted by{" "}
                    <strong className="text-slate-800 font-semibold">
                      {anc.author}
                    </strong>{" "}
                    ({anc.authorRole})
                  </span>
                </div>
              </div>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
};
