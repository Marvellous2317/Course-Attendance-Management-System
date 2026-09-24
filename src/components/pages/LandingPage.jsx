import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Calendar,
  Clock,
  Sparkles,
  Lock,
  ChevronDown,
  Code2,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { OthelloLogo } from '../shared/OthelloLogo';
import { ScrollReveal } from '../shared/ScrollReveal';
export const LandingPage = () => {
  const { setAppView, login, switchToAdmin, switchToTeacher, switchToStudent } =
    useAdmin();
  const [selectedTrackCategory, setSelectedTrackCategory] =
    useState('All Tracks');
  const tracks = [
    {
      id: 'full-stack',
      category: 'Development',
      tag: 'Web & Software',
      duration: '16 Weeks',
      title: 'Full-Stack Development',
      description:
        'Master modern web architecture from responsive frontend frameworks (React, Tailwind) to robust cloud backend services and databases.',
      schedule: 'Saturdays \u2022 10:00 AM \u2013 1:00 PM EST',
      faculty: 'Dr. Maya Lin',
      cohort: 'Oct 2025',
      percentFilled: 85,
    },
    {
      id: 'data-analytics',
      category: 'Data & AI',
      tag: 'Business Intelligence',
      duration: '12 Weeks',
      title: 'Data Analysis & Insights',
      description:
        'Turn complex datasets into actionable executive dashboards using SQL, Tableau, PowerBI, and applied statistical modeling.',
      schedule: 'Tues & Thurs \u2022 6:30 PM EST',
      faculty: 'Prof. Vance',
      cohort: 'Oct 2025',
      percentFilled: 90,
    },
    {
      id: 'python-masterclass',
      category: 'Development',
      tag: 'Foundations',
      duration: '10 Weeks',
      title: 'Python Programming Masterclass',
      description:
        'From core scripting syntax to OOP principles, API integration, algorithmic problem-solving, and workflow automation.',
      schedule: 'Mondays & Weds \u2022 7:00 PM EST',
      faculty: 'Marcus Aurel',
      cohort: 'Nov 2025',
      percentFilled: 70,
    },
    {
      id: 'data-science-ai',
      category: 'Data & AI',
      tag: 'Advanced AI',
      duration: '20 Weeks',
      title: 'Data Science & AI Engineering',
      description:
        'Deep-dive into supervised learning, neural networks, PyTorch, Large Language Model pipelines, and production inference deployment.',
      schedule: 'Saturdays \u2022 2:00 PM \u2013 5:00 PM EST',
      faculty: 'Julian Vance-Hayes',
      cohort: 'Oct 2025',
      percentFilled: 95,
    },
    {
      id: 'ui-ux-design',
      category: 'Design & Systems',
      tag: 'Product Design',
      duration: '14 Weeks',
      title: 'UI/UX Product Design',
      description:
        'User research, interactive Figma prototyping, design systems, design sprint methodology, and high-fidelity product handoff.',
      schedule: 'Wednesdays \u2022 6:00 PM EST',
      faculty: 'Priya Sharma',
      cohort: 'Nov 2025',
      percentFilled: 80,
    },
    {
      id: 'ict-systems',
      category: 'Design & Systems',
      tag: 'Infrastructure',
      duration: '8 Weeks',
      title: 'ICT Fundamentals & Systems',
      description:
        'Computer networking principles, Linux operating systems, cloud storage hygiene, and foundational enterprise IT governance.',
      schedule: 'Tuesdays \u2022 6:00 PM EST',
      faculty: 'Dr. Thorne',
      cohort: 'Dec 2025',
      percentFilled: 65,
    },
  ];
  const filteredTracks = tracks.filter((t) => {
    if (selectedTrackCategory === 'All Tracks') return true;
    return t.category === selectedTrackCategory;
  });
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <div className="min-h-screen bg-primary-100 text-slate-900 selection:bg-secondary-500/20 selection:text-slate-950 font-sans">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <OthelloLogo
            size="md"
            subtitle="Faculty of Computing & Technology"
            className="cursor-pointer"
          />

          {/* Centered Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/60 text-xs font-semibold text-slate-600">
            <button
              onClick={() => scrollToSection('courses-section')}
              className="px-4 py-1.5 rounded-full hover:text-slate-950 hover:bg-white transition-all cursor-pointer"
            >
              Courses
            </button>
            <button
              onClick={() => scrollToSection('why-us-section')}
              className="px-4 py-1.5 rounded-full hover:text-slate-950 hover:bg-white transition-all cursor-pointer"
            >
              Why Us
            </button>
            <button
              onClick={() => scrollToSection('metrics-section')}
              className="px-4 py-1.5 rounded-full hover:text-slate-950 hover:bg-white transition-all cursor-pointer"
            >
              Metrics
            </button>
            <button
              onClick={() => scrollToSection('gateway-section')}
              className="px-4 py-1.5 rounded-full hover:text-slate-950 hover:bg-white transition-all cursor-pointer"
            >
              Gateway
            </button>
          </nav>

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setAppView('login')}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAppView('login')}
              className="px-4.5 py-2 text-xs sm:text-sm font-bold bg-secondary-500 hover:bg-secondary-600 text-slate-950 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              Register Now
            </motion.button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-7">
              <ScrollReveal delay={0.05}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-50 text-amber-800 border border-amber-200/70">
                  <span className="text-secondary-500">★</span>
                  <span>Over 500+ Students Trained</span>
                  <span className="text-amber-400">•</span>
                  <span>Next Cohort Starting Soon</span>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.1]">
                  Learn Tech. <br />
                  <span className="relative inline-block text-slate-950">
                    Earn More.
                    <span className="absolute left-0 bottom-1 w-full h-3 bg-secondary-500/30 -z-10 rounded-sm" />
                  </span>{' '}
                  <br />
                  Gain Global Recognition.
                </h1>
              </ScrollReveal>

              <ScrollReveal delay={0.15}>
                <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                  Practical, cohort-based curricula engineered for high-growth
                  tech careers. Elevate your portfolio with university-backed
                  certifications and direct faculty guidance.
                </p>
              </ScrollReveal>

              {/* Action Buttons */}
              <ScrollReveal delay={0.2}>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAppView('login')}
                    className="px-6 py-3.5 bg-secondary-500 hover:bg-secondary-600 text-slate-950 rounded-xl font-bold text-sm shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => scrollToSection('courses-section')}
                    className="px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Explore Courses</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </ScrollReveal>

              {/* Review & Accreditation Rating */}
              <ScrollReveal delay={0.25}>
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-3 border-t border-slate-200/80">
                  <div className="flex items-center -space-x-2">
                    {['ML', 'JV', 'PS', 'DT'].map((initials, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-white bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold shadow-xs"
                      >
                        {initials}
                      </div>
                    ))}
                  </div>

                  <div className="text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span>4.9/5</span>
                      <div className="flex text-secondary-500">
                        {'\u2605\u2605\u2605\u2605\u2605'
                          .split('')
                          .map((c, idx) => (
                            <span key={idx}>{c}</span>
                          ))}
                      </div>
                      <span className="text-slate-500 font-normal">
                        (850+ Alumni Reviews)
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Accredited Higher Education Partner & Technology Incubator
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Visual Image with Floating Badges */}
            <div className="lg:col-span-5 relative">
              <ScrollReveal delay={0.15}>
                <div className="relative mx-auto max-w-lg lg:max-w-none">
                  {/* Hero Student Photo */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 aspect-[4/3] sm:aspect-[1/1] max-h-[500px]">
                    <img
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1000&auto=format&fit=crop&q=80"
                      alt="Students collaborating in tech cohort"
                      className="w-full h-full object-cover object-center brightness-[0.98]"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Floating Badge 1: Top Right */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="absolute -top-4 -left-4 sm:top-4 sm:-left-6 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-100 text-xs font-semibold text-slate-900 flex items-center gap-2.5"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                        Structured
                      </span>
                      <span className="font-bold text-slate-900">
                        16+ Weeks Training
                      </span>
                    </div>
                  </motion.div>

                  {/* Floating Badge 2: Bottom Left */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute bottom-6 -left-4 sm:-left-6 bg-primary-800 text-white p-3 rounded-2xl shadow-2xl border border-slate-700/80 text-xs flex items-center gap-2.5"
                  >
                    <div className="w-8 h-8 rounded-xl bg-secondary-500 text-slate-950 flex items-center justify-center font-bold">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">
                        Specializations
                      </span>
                      <span className="font-bold text-white">
                        6 Flagship Tracks
                      </span>
                    </div>
                  </motion.div>

                  {/* Floating Badge 3: Bottom Right */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="absolute -bottom-4 -right-2 sm:bottom-4 sm:-right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-100 text-xs flex items-center gap-2.5"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                        Industry Validated
                      </span>
                      <span className="font-bold text-emerald-700">
                        92% Placement Rate
                      </span>
                    </div>
                  </motion.div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Key Metrics Section */}
      <section
        id="metrics-section"
        className="py-10 bg-white border-y border-slate-200/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {[
              { label: 'Graduates Placed', value: '500+' },
              { label: 'Course Completion', value: '98%' },
              { label: 'Senior Industry Mentors', value: '40+' },
              { label: 'Median Starting Salary', value: '$84k' },
            ].map((stat, i) => (
              <ScrollReveal key={stat.label} delay={0.08 * i}>
                <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/60 text-center hover:bg-slate-100/70 transition-colors">
                  <div className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                    {stat.label}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Academic Catalog (In-Demand Tracks) */}
      <section id="courses-section" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
              Academic Catalog
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Explore Our In-Demand Tracks
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Practical cohort-based curricula engineered for career mobility.
              Fast-track your mastery with direct faculty mentorship and
              portfolio reviews.
            </p>

            {/* Filter Pills */}
            <div className="flex flex-wrap justify-center items-center gap-2 pt-4">
              {[
                'All Tracks',
                'Development',
                'Data & AI',
                'Design & Systems',
              ].map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedTrackCategory(category)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedTrackCategory === category ? 'bg-slate-950 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* 6 Track Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTracks.map((track, idx) => (
              <ScrollReveal key={track.id} delay={0.06 * idx}>
                <div className="h-full flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md transition-all">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {track.tag}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {track.duration}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-950 leading-snug">
                        {track.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                        {track.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{track.schedule}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">
                          Faculty:{' '}
                          <strong className="text-slate-800">
                            {track.faculty}
                          </strong>
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Cohort: {track.cohort}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar of Capacity */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">
                          Enrolled Seats
                        </span>
                        <span className="font-bold text-slate-800">
                          {track.percentFilled}% filled
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary-500 rounded-full"
                          style={{ width: `${track.percentFilled}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Enroll button */}
                  <div className="pt-5 mt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setAppView('login')}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Enroll / View Schedule</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Institutional Excellence (Why Us) */}
      <section
        id="why-us-section"
        className="py-16 sm:py-24 bg-slate-50/70 border-t border-slate-200/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/70">
              Institutional Excellence
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Why Learn at Othello Institute?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              We merge rigorous academic foundations with agile tech industry
              mentorship to ensure day-one job readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScrollReveal delay={0.05}>
              <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs h-full space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-xs">
                  👨‍🏫
                </div>
                <h3 className="text-lg font-bold text-slate-950">
                  Direct Faculty Mentorship
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  No generic prerecorded videos. Attend live weekly
                  masterclasses and book 1-on-1 office hours directly with
                  active engineering directors.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs h-full space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shadow-xs">
                  💼
                </div>
                <h3 className="text-lg font-bold text-slate-950">
                  Career Launchpad & Portfolios
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Every graduate completes three capstone projects vetted by
                  partner tech hiring managers, plus mock interviews and resume
                  reviews.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs h-full space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-xs">
                  🎓
                </div>
                <h3 className="text-lg font-bold text-slate-950">
                  Accredited Credentials
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Earn digitally verifiable, blockchain-anchored certificates
                  recognized by multinational employers and technical recruiters
                  worldwide.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 6. Call To Action Banner (One Gateway. Infinite Possibilities.) */}
      <section id="gateway-section" className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal delay={0.1}>
            <div className="rounded-3xl bg-primary-800 text-white p-8 sm:p-12 lg:p-14 relative overflow-hidden shadow-2xl border border-slate-800">
              {/* Subtle background grid */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800/80 text-secondary-500 border border-slate-700">
                    Unified Authentication Engine
                  </span>

                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                    One Gateway. <br />
                    <span className="text-secondary-500">
                      Infinite Possibilities.
                    </span>
                  </h2>

                  <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                    Seamless single entry point. Your role credentials
                    automatically direct you to your tailored dashboard—whether
                    you are an enrolled Student, verified Faculty Member, or
                    Campus Administrator.
                  </p>

                  {/* Role preview buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={switchToAdmin}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      <span>🏛️ Admin UI</span>
                    </button>
                    <button
                      type="button"
                      onClick={switchToTeacher}
                      className="px-3.5 py-2 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-slate-950 font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      <span>👨‍🏫 Teacher UI</span>
                    </button>
                    <button
                      type="button"
                      onClick={switchToStudent}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      <span>🎒 Student UI</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col sm:items-end justify-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setAppView('login')}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Access Campus Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-secondary-500" />
                    256-bit Institutional TLS Encryption
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-primary-950 text-white pt-16 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand column */}
            <div className="lg:col-span-2 space-y-4">
              <OthelloLogo
                size="md"
                theme="dark"
                subtitle="Technology Academy & Campus System"
              />
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                The premier technology academy and course management platform
                equipping aspiring creators, engineers, and data leaders with
                world-class technical capabilities.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All CMS Systems & API Gateways Operational</span>
              </div>
            </div>

            {/* Academic Tracks */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Academic Tracks
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <a
                    href="#courses-section"
                    className="hover:text-white transition-colors"
                  >
                    Full-Stack Development
                  </a>
                </li>
                <li>
                  <a
                    href="#courses-section"
                    className="hover:text-white transition-colors"
                  >
                    Data Science & AI
                  </a>
                </li>
                <li>
                  <a
                    href="#courses-section"
                    className="hover:text-white transition-colors"
                  >
                    UI/UX Product Design
                  </a>
                </li>
                <li>
                  <a
                    href="#courses-section"
                    className="hover:text-white transition-colors"
                  >
                    Python Masterclass
                  </a>
                </li>
                <li>
                  <a
                    href="#courses-section"
                    className="hover:text-white transition-colors"
                  >
                    ICT Infrastructure
                  </a>
                </li>
              </ul>
            </div>

            {/* Campus Gateways */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Campus Gateways
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <button
                    onClick={() => setAppView('login')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Student LMS Portal
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setAppView('login')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Faculty Grading Hub
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setAppView('login')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Registrar & Admissions
                  </button>
                </li>
                <li>
                  <a
                    href="#courses-section"
                    className="hover:text-white transition-colors"
                  >
                    Academic Calendar 2025
                  </a>
                </li>
              </ul>
            </div>

            {/* Institutional */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Institutional
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <span className="text-slate-400">Accreditation Info</span>
                </li>
                <li>
                  <span className="text-slate-400">Privacy Policy</span>
                </li>
                <li>
                  <span className="text-slate-400">Terms of Enrollment</span>
                </li>
                <li>
                  <span className="text-slate-400">Student Honor Code</span>
                </li>
                <li>
                  <span className="text-slate-400">Support & Inquiries</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © 2025 Othello Institute of Technology. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>Official Course Management System (v4.8.2)</span>
              <span>•</span>
              <span>Security Audit</span>
              <span>•</span>
              <span>System Logs</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
