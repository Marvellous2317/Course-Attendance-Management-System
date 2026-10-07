import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Calendar,
  Clock,
  Sparkles,
  Lock,
  ChevronDown,
  Code2,
  Check,
  BarChart2,
  Menu,
  X,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { OthelloLogo } from "../shared/components/OthelloLogo";
import { ScrollReveal } from "../shared/components/ScrollReveal";
import Images from "../../public/images/images";

export const LandingPage = () => {
  const { setAppView, login, switchToAdmin, switchToTeacher, switchToStudent } =
    useAdmin();

  const navigate = useNavigate();
  const registrationPage = () => navigate("/register");
  const LoginPage = () => navigate("/login");
  const LandingPage = () => navigate("/");

  const currentYear = new Date().getFullYear();

  const [selectedTrackCategory, setSelectedTrackCategory] =
    useState("All Tracks");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tracks = [
    {
      id: "full-stack",
      category: "Development",
      tag: "Web & Software",
      badge: "CAREER CHANGE",
      badgeColor: "bg-emerald-500 text-white",
      duration: "20 Weeks",
      level: "Beginner",
      title: "Software Development Bootcamp",
      description:
        "Full-stack development training for beginners. Build real-world projects and launch your tech career.",
      bullets: [
        "HTML, CSS, JavaScript",
        "React & Node.js",
        "Portfolio Projects",
      ],
      image:
        "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "data-analytics",
      category: "Data & AI",
      tag: "Business Intelligence",
      badge: "MOST POPULAR",
      badgeColor: "bg-amber-400 text-slate-950",
      duration: "16 Weeks",
      level: "Beginner",
      title: "Data Analysis & Visualization",
      description:
        "Master data analysis with Excel, SQL, Python, and Power BI. Turn data into actionable insights.",
      bullets: ["Excel & Google Sheets", "SQL & Python", "Power BI & Tableau"],
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "cyber-security",
      category: "Development",
      tag: "Security",
      badge: "NEW",
      badgeColor: "bg-amber-500 text-white",
      duration: "18 Weeks",
      level: "Beginner",
      title: "Cyber Security",
      description:
        "Master cybersecurity, ethical hacking, network security, and threat detection with practical training.",
      bullets: ["Ethical Hacking", "Network Security", "Threat Detection"],
      image:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "data-science-ai",
      category: "Data & AI",
      tag: "Advanced AI",
      badge: "HIGH DEMAND",
      badgeColor: "bg-indigo-600 text-white",
      duration: "20 Weeks",
      level: "Intermediate",
      title: "Data Science & AI Engineering",
      description:
        "Deep-dive into supervised learning, neural networks, PyTorch, Large Language Model pipelines, and production inference deployment.",
      bullets: [
        "Python & PyTorch",
        "Machine Learning & LLMs",
        "Model Deployment",
      ],
      image:
        "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "ui-ux-design",
      category: "Design & Systems",
      tag: "Product Design",
      badge: "FEATURED",
      badgeColor: "bg-purple-600 text-white",
      duration: "14 Weeks",
      level: "Beginner",
      title: "UI/UX Product Design",
      description:
        "User research, interactive Figma prototyping, design systems, design sprint methodology, and high-fidelity product handoff.",
      bullets: [
        "Figma & Design Systems",
        "User Research & Wireframing",
        "Interactive Prototyping",
      ],
      image:
        "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "ict-systems",
      category: "Design & Systems",
      tag: "Infrastructure",
      badge: "FOUNDATIONAL",
      badgeColor: "bg-blue-600 text-white",
      duration: "8 Weeks",
      level: "Beginner",
      title: "ICT Fundamentals & Systems",
      description:
        "Computer networking principles, Linux operating systems, cloud storage hygiene, and foundational enterprise IT governance.",
      bullets: [
        "Computer Networking",
        "Linux & Cloud Storage",
        "Enterprise IT Governance",
      ],
      image:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    },
  ];

  const filteredTracks = tracks.filter((t) => {
    if (selectedTrackCategory === "All Tracks") return true;
    return t.category === selectedTrackCategory;
  });

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-primary-100 text-slate-900 selection:bg-secondary-500/20 selection:text-slate-950 font-sans overflow-x-hidden">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              onClick={() => LandingPage()}
              className="cursor-pointer group flex items-center gap-2 shrink-0"
              title="Return to Public Landing Page"
            >
              <img
                src={Images.logo}
                className="object-contain h-12 sm:h-16"
                alt="Othello Logo"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="font-bold text-xs sm:text-base text-slate-950 truncate">
                Othello Institute of Technology
              </p>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                School of Computing & Technology
              </p>
            </div>
          </div>

          {/* Centered Navigation Pills (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/60 text-xs font-semibold text-slate-600">
            <button
              onClick={() => scrollToSection("courses-section")}
              className="px-4 py-1.5 rounded-full hover:text-slate-950 hover:bg-white transition-all cursor-pointer"
            >
              Courses
            </button>
            <button
              onClick={() => scrollToSection("why-us-section")}
              className="px-4 py-1.5 rounded-full hover:text-slate-950 hover:bg-white transition-all cursor-pointer"
            >
              Why Us
            </button>
            <button
              onClick={() => scrollToSection("metrics-section")}
              className="px-4 py-1.5 rounded-full hover:text-slate-950 hover:bg-white transition-all cursor-pointer"
            >
              Metrics
            </button>
          </nav>

          {/* Action Buttons (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={LoginPage}
              className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={registrationPage}
              className="px-4 sm:px-4.5 py-2 text-xs sm:text-sm font-bold bg-secondary-500 hover:bg-secondary-600 text-slate-950 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              Register Now
            </motion.button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-hidden"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Dropdown Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 shadow-lg overflow-hidden"
            >
              <div className="flex flex-col space-y-2 font-semibold text-sm text-slate-700 border-b border-slate-100 pb-3">
                <button
                  onClick={() => scrollToSection("courses-section")}
                  className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Courses
                </button>
                <button
                  onClick={() => scrollToSection("why-us-section")}
                  className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Why Us
                </button>
                <button
                  onClick={() => scrollToSection("metrics-section")}
                  className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Metrics
                </button>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={registrationPage}
                  className="w-full py-3 text-center font-bold text-sm bg-secondary-500 hover:bg-secondary-600 text-slate-950 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Register Now
                </button>
                <button
                  type="button"
                  onClick={LoginPage}
                  className="w-full py-3 text-center font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. Hero Section */}
      <section className="py-10 sm:py-16 lg:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-7 text-center sm:text-left">
              <ScrollReveal delay={0.05}>
                <div className="inline-flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 py-1.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-amber-50 text-amber-800 border border-amber-200/70">
                  <span className="text-secondary-500">★</span>
                  <span>Over 500+ Students Trained</span>
                  <span className="text-amber-400 hidden sm:inline">•</span>
                  <span className="w-full sm:w-auto">Next Cohort Starting Soon</span>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.15]">
                  Learn Tech. <br className="hidden sm:inline" />
                  <span className="relative inline-block text-slate-950">
                    Earn More.
                    <span className="absolute left-0 bottom-1 w-full h-2.5 sm:h-3 bg-secondary-500/30 -z-10 rounded-sm" />
                  </span>{" "}
                  <br className="hidden sm:inline" />
                  Gain Global Recognition.
                </h1>
              </ScrollReveal>

              <ScrollReveal delay={0.15}>
                <p className="text-sm sm:text-lg text-slate-600 max-w-xl mx-auto sm:mx-0 leading-relaxed">
                  Practical, cohort-based curricular engineered for high-growth
                  tech careers. Elevate your portfolio with university-backed
                  certifications and direct faculty guidance.
                </p>
              </ScrollReveal>

              {/* Action Buttons */}
              <ScrollReveal delay={0.2}>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center sm:justify-start gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={registrationPage}
                    className="px-6 py-3.5 bg-secondary-500 hover:bg-secondary-600 text-slate-950 rounded-xl font-bold text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => scrollToSection("courses-section")}
                    className="px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Explore Courses</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Visual Image with Floating Badges */}
            <div className="lg:col-span-5 relative mt-4 lg:mt-0">
              <ScrollReveal delay={0.15}>
                <div className="relative mx-auto max-w-md lg:max-w-none px-2 sm:px-0">
                  {/* Hero Student Photo */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 aspect-[4/3] sm:aspect-[1/1] max-h-[460px]">
                    <img
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1000&auto=format&fit=crop&q=80"
                      alt="Students collaborating in tech cohort"
                      className="w-full h-full object-cover object-center brightness-[0.98]"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Floating Badge 1: Top Right / Left */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="absolute top-2 left-2 sm:top-4 sm:-left-6 bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl shadow-xl border border-slate-100 text-xs font-semibold text-slate-900 flex items-center gap-2"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                        Structured
                      </span>
                      <span className="font-bold text-slate-900 text-[11px] sm:text-xs">
                        16+ Weeks Training
                      </span>
                    </div>
                  </motion.div>

                  {/* Floating Badge 2: Bottom Left */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute bottom-3 left-2 sm:bottom-6 sm:-left-6 bg-primary-800 text-white p-2.5 sm:p-3 rounded-2xl shadow-2xl border border-slate-700/80 text-xs flex items-center gap-2"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-secondary-500 text-slate-950 flex items-center justify-center font-bold">
                      <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">
                        Available
                      </span>
                      <span className="font-bold text-white text-[11px] sm:text-xs">
                        6+ Course Tracks
                      </span>
                    </div>
                  </motion.div>

                  {/* Floating Badge 3: Bottom Right */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="absolute bottom-3 right-2 sm:bottom-4 sm:-right-4 bg-white/95 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl shadow-xl border border-slate-100 text-xs flex items-center gap-2"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                        Placement
                      </span>
                      <span className="font-bold text-emerald-700 text-[11px] sm:text-xs">
                        92% Rate
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              { label: "Graduates Placed", value: "500+" },
              { label: "Course Completion", value: "98%" },
              { label: "Senior Industry Mentors", value: "40+" },
              { label: "Median Starting Salary", value: "$84k" },
            ].map((stat, i) => (
              <ScrollReveal key={stat.label} delay={0.08 * i}>
                <div className="p-4 sm:p-6 rounded-2xl bg-slate-50/70 border border-slate-200/60 text-center hover:bg-slate-100/70 transition-colors">
                  <div className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-[11px] sm:text-sm font-semibold text-slate-500 mt-1">
                    {stat.label}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Academic Catalog (In-Demand Tracks) */}
      <section id="courses-section" className="py-12 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
              Academic Catalog
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Explore Our In-Demand Tracks
            </h2>
            <p className="text-xs sm:text-base text-slate-600 leading-relaxed">
              Practical cohort-based curricular engineered for career mobility.
              Fast-track your mastery with direct faculty mentorship and
              portfolio reviews.
            </p>
          </div>

          {/* 6 Track Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredTracks.map((track, idx) => (
              <ScrollReveal key={track.id} delay={0.06 * idx}>
                <div className="h-full flex flex-col rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden group">
                  {/* Course Image & Overlay Badge */}
                  <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-100">
                    <img
                      src={track.image}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {track.badge && (
                      <span
                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-md ${track.badgeColor}`}
                      >
                        {track.badge}
                      </span>
                    )}
                  </div>

                  {/* Course Card Body */}
                  <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Meta Info Row */}
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                          <span>{track.duration}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                          <span>{track.level}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-950 leading-snug">
                        {track.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                        {track.description}
                      </p>
                    </div>

                    {/* Bullet Points / Included Features */}
                    {track.bullets && track.bullets.length > 0 && (
                      <ul className="space-y-2 sm:space-y-2.5 pt-2 text-xs sm:text-sm font-medium text-slate-700">
                        {track.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
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
        className="py-12 sm:py-20 lg:py-24 bg-slate-50/70 border-t border-slate-200/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/70">
              Institutional Excellence
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Why Learn at Othello Institute?
            </h2>
            <p className="text-xs sm:text-base text-slate-600 leading-relaxed">
              We merge rigorous academic foundations with agile tech industry
              mentorship to ensure day-one job readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScrollReveal delay={0.05}>
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs h-full space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-xs">
                  👨‍🏫
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-950">
                  Direct Faculty Mentorship
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  No generic prerecorded videos. Attend live weekly
                  masterclasses and book 1-on-1 office hours directly with
                  active engineering directors.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs h-full space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shadow-xs">
                  💼
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-950">
                  Career Launchpad & Portfolios
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Every graduate completes three capstone projects vetted by
                  partner tech hiring managers, plus mock interviews and resume
                  reviews.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs h-full space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-xs">
                  🎓
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-950">
                  Accredited Credentials
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Earn digitally verifiable, blockchain-anchored certificates
                  recognized by multinational employers and technical recruiters
                  worldwide.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="bg-primary-950 text-white pt-12 sm:pt-16 pb-10 sm:pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          {/* Top Section: Flex with justify-between for balanced spacing */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 sm:gap-10">
            {/* Brand Column (Left) */}
            <div className="space-y-4 max-w-md">
              <div className="flex items-center gap-2">
                <div
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className="cursor-pointer group flex items-center gap-2"
                  title="Return to top"
                >
                  <img
                    src={Images.logo}
                    alt="Othello Logo"
                    className="object-contain h-12 sm:h-16"
                  />
                </div>
                <div className="flex flex-col">
                  <p className="font-bold text-sm sm:text-base leading-tight">
                    Othello Institute of Technology
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-400">
                    School of Computing & Technology
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                The premier technology academy and course management platform
                equipping aspiring creators, engineers, and data leaders with
                world-class technical capabilities.
              </p>
            </div>

            {/* Academic Tracks Column (Right) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Academic Tracks
              </h4>
              <ul className="space-y-2 sm:space-y-2.5 text-xs text-slate-400">
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
                    Cybersecurity
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
          </div>

          {/* Bottom Bar: Copyright & System info */}
          <div className="pt-6 sm:pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-slate-500">
            <div>
              © {currentYear} Othello Institute of Technology. All
              rights reserved.
            </div>
            <div className="flex flex-wrap justify-center sm:justify-end items-center gap-3 sm:gap-4 text-[11px]">
              <span>Official Course Management System (v4.8.2)</span>
              <span className="hidden sm:inline">•</span>
              <span>Security Audit</span>
              <span className="hidden sm:inline">•</span>
              <span>System Logs</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

