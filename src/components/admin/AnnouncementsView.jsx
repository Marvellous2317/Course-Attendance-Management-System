import { useState } from 'react';
import { Pin, Calendar, Filter, Plus } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Badge } from '../shared/Badge';
import { ScrollReveal } from '../shared/ScrollReveal';
export const AnnouncementsView = () => {
  const { announcements, openModal } = useAdmin();
  const [selectedAudience, setSelectedAudience] = useState('All');
  const filteredAnnouncements = announcements.filter((anc) => {
    return (
      selectedAudience === 'All' ||
      anc.targetAudience === selectedAudience ||
      anc.targetAudience === 'All'
    );
  });
  return (
    <div className="space-y-6 pb-12">
      {/* Control bar */}
      <ScrollReveal delay={0.05}>
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Audience:
              </span>
              {['All', 'Students', 'Teachers', 'Staff'].map((aud) => (
                <button
                  key={aud}
                  type="button"
                  onClick={() => setSelectedAudience(aud)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${selectedAudience === aud ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {aud}
                </button>
              ))}
            </div>

            <Button
              variant="primary"
              size="sm"
              iconLeft={<Plus className="w-4 h-4" />}
              onClick={() => openModal('add-announcement')}
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
              className={`p-6 ${anc.pinned ? 'border-l-4 border-l-amber-500' : ''}`}
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
                        anc.priority === 'Urgent'
                          ? 'rose'
                          : anc.priority === 'High'
                            ? 'amber'
                            : 'slate'
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
                    Posted by{' '}
                    <strong className="text-slate-800 font-semibold">
                      {anc.author}
                    </strong>{' '}
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
