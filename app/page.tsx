"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Code2,
  Mail,
  MapPin,
  Phone,
  Send,
  UserCheck,
  Briefcase,
  Layers,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  Terminal,
  Cpu,
  Globe,
  Award,
  FileText,
  Building2,
  Calendar,
  Menu,
  X,
} from "lucide-react";
import {
  fetchPortfolioFromAPI,
  getPortfolioData,
  PORTFOLIO_CHANGE_EVENT,
  PortfolioData,
} from "@/lib/portfolio-data";

function GithubIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedinIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.7a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
    </svg>
  );
}

function TypewriterName({ name }: { name: string }) {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentName = name || "Rishabh";

    if (!isDeleting) {
      if (displayText.length < currentName.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentName.slice(0, displayText.length + 1));
        }, 120);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(currentName.slice(0, displayText.length - 1));
        }, 60);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(false);
        }, 400);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, name]);

  return (
    <span className="inline-flex items-center">
      <span className="bg-gradient-to-r from-[#0d9488] via-[#14b8a6] to-[#0f766e] bg-clip-text text-transparent">
        {displayText}
      </span>
      <span className="inline-block w-[3px] h-[0.8em] ml-1 bg-[#0d9488] animate-pulse rounded-full"></span>
    </span>
  );
}

export default function Home() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [activeSkillCategory, setActiveSkillCategory] = useState<string>("All");
  const [activeProjectCategory, setActiveProjectCategory] = useState<string>("All");
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const refreshPortfolio = () => {
    fetchPortfolioFromAPI().then((res) => {
      if (res.data) setData(res.data);
      else setData(getPortfolioData());
    });
  };

  useEffect(() => {
    refreshPortfolio();

    const handleUpdate = () => {
      refreshPortfolio();
    };

    window.addEventListener(PORTFOLIO_CHANGE_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(PORTFOLIO_CHANGE_EVENT, handleUpdate);
    };
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0fdfa] text-[#111827]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#0d9488] border-t-transparent rounded-full animate-spin"></div>
          <span className="font-medium text-[#374151]">Loading Portfolio...</span>
        </div>
      </div>
    );
  }

  const { profile, skills, projects, internships } = data;

  const skillCategories = ["All", "Frontend", "Backend", "Database", "Tools & Other"];
  const filteredSkills =
    activeSkillCategory === "All"
      ? skills
      : skills.filter((s) => s.category === activeSkillCategory);

  const projectCategories = [
    "All",
    ...Array.from(new Set(projects.map((p) => p.category))),
  ];
  const filteredProjects =
    activeProjectCategory === "All"
      ? projects
      : projects.filter((p) => p.category === activeProjectCategory);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email && contactForm.message) {
      setContactSubmitted(true);
      setContactForm({ name: "", email: "", message: "" });
      setTimeout(() => setContactSubmitted(false), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0fdfa] text-[#111827] flex flex-col font-sans selection:bg-[#0d9488] selection:text-white">
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-80 sm:w-96 h-80 sm:h-96 bg-[#2dd4bf]/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-80 sm:w-96 h-80 sm:h-96 bg-[#0d9488]/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-80 sm:w-96 h-80 sm:h-96 bg-[#2dd4bf]/15 rounded-full blur-3xl"></div>
      </div>

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#f0fdfa]/90 border-b border-[#0d9488]/15 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-center relative">
          {/* Desktop Navigation - Centered with Extra Spacing */}
          <nav className="hidden md:flex items-center gap-10 sm:gap-12 lg:gap-14 text-sm font-semibold text-[#111827]">
            <a href="#about" className="hover:text-[#0d9488] transition-colors py-1 px-2">
              About
            </a>
            <a href="#skills" className="hover:text-[#0d9488] transition-colors py-1 px-2">
              Skills
            </a>
            <a href="#internships" className="hover:text-[#0d9488] transition-colors py-1 px-2">
              Internships
            </a>
            <a href="#projects" className="hover:text-[#0d9488] transition-colors py-1 px-2">
              Projects
            </a>
            <a href="#contact" className="hover:text-[#0d9488] transition-colors py-1 px-2">
              Contact
            </a>
          </nav>

          {/* Mobile Menu Button - Right aligned on mobile */}
          <div className="flex md:hidden w-full justify-between items-center">
            <span className="text-sm font-bold text-[#111827]">Menu</span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white border border-[#0d9488]/20 text-[#111827] hover:text-[#0d9488]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 border-b border-[#0d9488]/20 px-6 py-4 space-y-3 flex flex-col backdrop-blur-lg">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#111827] hover:text-[#0d9488] font-medium py-1"
            >
              About
            </a>
            <a
              href="#skills"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#111827] hover:text-[#0d9488] font-medium py-1"
            >
              Skills
            </a>
            <a
              href="#internships"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#111827] hover:text-[#0d9488] font-medium py-1"
            >
              Internships
            </a>
            <a
              href="#projects"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#111827] hover:text-[#0d9488] font-medium py-1"
            >
              Projects
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#111827] hover:text-[#0d9488] font-medium py-1"
            >
              Contact
            </a>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 z-10">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-16 md:pt-28 md:pb-32 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-[#111827]">
                  Hi, I&apos;m{" "}
                  <TypewriterName name={profile.name} />
                </h1>
                <h2 className="text-lg sm:text-2xl font-semibold text-[#374151]">
                  {profile.title}
                </h2>
              </div>

              <p className="text-[#4b5563] text-sm sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {profile.bio}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#projects"
                  className="px-6 py-3 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold shadow-lg shadow-[#0d9488]/25 hover:shadow-[#0d9488]/40 hover:scale-[1.02] transition-all flex items-center gap-2 text-sm sm:text-base"
                >
                  <span>Explore Projects</span>
                  <ChevronRight className="w-4 h-4" />
                </a>

                <a
                  href="#contact"
                  className="px-6 py-3 rounded-xl bg-white border border-[#2dd4bf] hover:bg-[#ccfbf1]/50 text-[#111827] font-semibold transition-all shadow-xs flex items-center gap-2 text-sm sm:text-base"
                >
                  <span>Contact Me</span>
                  <Mail className="w-4 h-4 text-[#0d9488]" />
                </a>
              </div>

              {/* Social Icons */}
              <div className="flex items-center justify-center lg:justify-start gap-4 pt-4 text-[#374151]">
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-lg bg-white border border-[#2dd4bf]/40 hover:text-[#0d9488] hover:border-[#0d9488] shadow-xs transition-all"
                  >
                    <GithubIcon className="w-5 h-5" />
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-lg bg-white border border-[#2dd4bf]/40 hover:text-[#0d9488] hover:border-[#0d9488] shadow-xs transition-all"
                  >
                    <LinkedinIcon className="w-5 h-5" />
                  </a>
                )}
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="p-2.5 rounded-lg bg-white border border-[#2dd4bf]/40 hover:text-[#0d9488] hover:border-[#0d9488] shadow-xs transition-all"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Hero Image / Circular Avatar */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative group">
                {/* Animated Circular Glowing Ring */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-[#2dd4bf] via-[#0d9488] to-[#14b8a6] rounded-full blur-lg opacity-45 group-hover:opacity-75 transition duration-500 animate-pulse"></div>
                
                {/* Outer Circular Container */}
                <div className="relative w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-full p-1.5 bg-gradient-to-br from-[#2dd4bf]/40 via-[#0d9488]/30 to-[#2dd4bf]/40 border border-[#2dd4bf]/50 shadow-2xl shadow-[#0d9488]/20">
                  {/* Inner Circular Image Container */}
                  <div className="w-full h-full rounded-full overflow-hidden bg-white border border-[#0d9488]/20 flex items-center justify-center relative shadow-inner">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.name || "Profile Avatar"}
                        className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-[#ccfbf1] flex flex-col items-center justify-center text-[#0d9488] gap-2 p-4">
                        <Code2 className="w-20 h-20 sm:w-28 sm:h-28 text-[#0d9488]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS STRIP */}
        <section className="border-y border-[#0d9488]/15 bg-white/70 backdrop-blur-sm py-8 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="p-4 rounded-xl bg-white border border-[#2dd4bf]/40 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0d9488]">
                {profile.yearsExperience}+
              </div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-[#111827] mt-1 font-semibold">
                Years Experience
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#2dd4bf]/40 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0d9488]">
                {profile.completedProjects}+
              </div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-[#111827] mt-1 font-semibold">
                Completed Projects
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#2dd4bf]/40 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0d9488]">
                {internships.length}
              </div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-[#111827] mt-1 font-semibold">
                Internships Done
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#2dd4bf]/40 shadow-xs">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#111827]">
                {skills.length}+
              </div>
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-[#111827] mt-1 font-semibold">
                Core Technologies
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
            <h3 className="text-2xl sm:text-4xl font-bold text-[#111827]">About Me</h3>
            <div className="w-12 h-1 bg-[#2dd4bf] rounded-full mt-3"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white border border-[#0d9488]/15 rounded-2xl p-6 sm:p-10 shadow-lg shadow-[#0d9488]/5">
            <div className="md:col-span-7 space-y-4">
              <h4 className="text-lg sm:text-xl font-bold text-[#111827]">
                Crafting Digital Products with Excellence
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#f0fdfa] border border-[#2dd4bf]/40">
                  <MapPin className="w-4 h-4 text-[#0d9488] shrink-0" />
                  <div className="text-xs">
                    <span className="text-[#6b7280] block">Location</span>
                    <span className="font-semibold text-[#111827]">{profile.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#f0fdfa] border border-[#2dd4bf]/40">
                  <Mail className="w-4 h-4 text-[#0d9488] shrink-0" />
                  <div className="text-xs">
                    <span className="text-[#6b7280] block">Email</span>
                    <span className="font-semibold text-[#111827]">{profile.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 bg-[#f0fdfa] border border-[#2dd4bf]/40 rounded-xl p-6 space-y-4">
              <h5 className="font-bold text-[#111827] text-xs sm:text-sm uppercase tracking-wider">
                What I Do
              </h5>
              <ul className="space-y-3 text-xs sm:text-sm text-[#374151]">
                <li className="flex items-start gap-2.5">
                  <Cpu className="w-4 h-4 text-[#0d9488] mt-1 shrink-0" />
                  <span>Frontend development with React, Next.js & Tailwind CSS</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Globe className="w-4 h-4 text-[#0d9488] mt-1 shrink-0" />
                  <span>Backend REST & GraphQL API design with Node.js & PostgreSQL</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Layers className="w-4 h-4 text-[#0d9488] mt-1 shrink-0" />
                  <span>Database modeling, performance optimization & deployment</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SKILLS SECTION */}
        <section id="skills" className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#0d9488] mb-2">
              Expertise
            </h2>
            <h3 className="text-2xl sm:text-4xl font-bold text-[#111827]">Skills & Technologies</h3>
            <div className="w-12 h-1 bg-[#2dd4bf] rounded-full mt-3"></div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {skillCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveSkillCategory(cat)}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeSkillCategory === cat
                    ? "bg-[#0d9488] text-white shadow-md shadow-[#0d9488]/20"
                    : "bg-white border border-[#0d9488]/20 text-[#111827] hover:bg-[#ccfbf1]/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredSkills.map((skill) => (
              <div
                key={skill.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-[#0d9488]/15 hover:border-[#2dd4bf] shadow-xs hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#ccfbf1] flex items-center justify-center text-[#0d9488] group-hover:bg-[#2dd4bf]/30 transition-colors">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-[#111827] text-sm sm:text-base">
                      {skill.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#0f766e] bg-[#ccfbf1] px-2.5 py-1 rounded-full border border-[#2dd4bf]/40">
                    {skill.level}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#ccfbf1] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#0d9488] h-full rounded-full transition-all duration-700"
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>

                <span className="text-[10px] sm:text-[11px] text-[#6b7280] block mt-2">
                  Category: {skill.category}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* INTERNSHIPS SECTION */}
        <section id="internships" className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#0d9488] mb-2">
              Experience & Credentials
            </h2>
            <h3 className="text-2xl sm:text-4xl font-bold text-[#111827]">Internships & Certificates</h3>
            <div className="w-12 h-1 bg-[#2dd4bf] rounded-full mt-3"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {internships.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#0d9488]/15 hover:border-[#2dd4bf] rounded-2xl p-6 flex flex-col justify-between space-y-5 transition-all shadow-sm hover:shadow-md"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#0d9488] shrink-0" />
                        <span>{item.role}</span>
                      </h4>
                      <span className="text-sm font-semibold text-[#0d9488]">
                        {item.company}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ccfbf1] text-[#0f766e] text-xs font-semibold border border-[#2dd4bf]/40">
                      <Calendar className="w-3 h-3 text-[#0d9488]" />
                      <span>{item.duration}</span>
                    </div>
                  </div>

                  <p className="text-[#374151] text-xs sm:text-sm leading-relaxed">
                    {item.description}
                  </p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-0.5 rounded-md bg-[#f0fdfa] text-[#111827] text-xs font-medium border border-[#2dd4bf]/40"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Certificates and Offer Letter Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#0d9488]/15">
                  {item.certificateUrl && (
                    <a
                      href={item.certificateUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-[#ccfbf1] hover:bg-[#2dd4bf]/30 border border-[#2dd4bf] text-[#0f766e] text-xs font-semibold flex items-center gap-2 transition-colors"
                    >
                      <Award className="w-3.5 h-3.5 text-[#0d9488]" />
                      <span>View Certificate</span>
                    </a>
                  )}

                  {item.offerLetterUrl && (
                    <a
                      href={item.offerLetterUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#f0fdfa] border border-[#2dd4bf]/50 text-[#111827] text-xs font-semibold flex items-center gap-2 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#0d9488]" />
                      <span>Offer Letter</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section id="projects" className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#0d9488] mb-2">
              Portfolio
            </h2>
            <h3 className="text-2xl sm:text-4xl font-bold text-[#111827]">Featured Projects</h3>
            <div className="w-12 h-1 bg-[#2dd4bf] rounded-full mt-3"></div>
          </div>

          {/* Project Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {projectCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveProjectCategory(cat)}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeProjectCategory === cat
                    ? "bg-[#0d9488] text-white shadow-md shadow-[#0d9488]/20"
                    : "bg-white border border-[#0d9488]/20 text-[#111827] hover:bg-[#ccfbf1]/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="flex flex-col rounded-2xl bg-white border border-[#0d9488]/15 overflow-hidden hover:border-[#2dd4bf] transition-all group shadow-sm hover:shadow-lg hover:shadow-[#0d9488]/5"
              >
                <div className="relative h-48 w-full bg-[#f0fdfa] overflow-hidden">
                  {project.imageUrl ? (
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#2dd4bf]">
                      <Briefcase className="w-12 h-12" />
                    </div>
                  )}
                  {project.featured && (
                    <span className="absolute top-3 right-3 bg-[#0d9488] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                      Featured
                    </span>
                  )}
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[#0d9488]">
                      {project.category}
                    </span>
                    <h4 className="text-lg sm:text-xl font-bold text-[#111827] group-hover:text-[#0d9488] transition-colors">
                      {project.title}
                    </h4>
                    <p className="text-[#374151] text-xs sm:text-sm leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-md bg-[#ccfbf1]/60 text-[#0f766e] text-xs font-semibold border border-[#2dd4bf]/40"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex items-center gap-3 pt-3 border-t border-[#0d9488]/15">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold text-[#0d9488] hover:text-[#0f766e] transition-colors"
                      >
                        <span>Live Demo</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#374151] hover:text-[#111827] transition-colors ml-auto"
                      >
                        <GithubIcon className="w-3.5 h-3.5" />
                        <span>Source Code</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#0d9488] mb-2">
              Get In Touch
            </h2>
            <h3 className="text-2xl sm:text-4xl font-bold text-[#111827]">Contact Me</h3>
            <div className="w-12 h-1 bg-[#2dd4bf] rounded-full mt-3"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-[#0d9488]/15 space-y-6 shadow-sm">
                <h4 className="text-lg sm:text-xl font-bold text-[#111827]">
                  Let&apos;s build something great together
                </h4>
                <p className="text-[#374151] text-xs sm:text-sm leading-relaxed">
                  Feel free to reach out for project inquiries, collaborations, or just a quick tech chat!
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-[#f0fdfa] border border-[#2dd4bf]/40">
                    <div className="p-3 rounded-lg bg-[#ccfbf1] text-[#0d9488]">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-[#6b7280] block">Email</span>
                      <a
                        href={`mailto:${profile.email}`}
                        className="font-semibold text-[#111827] hover:text-[#0d9488] transition-colors text-xs sm:text-sm"
                      >
                        {profile.email}
                      </a>
                    </div>
                  </div>

                  {profile.phone && (
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-[#f0fdfa] border border-[#2dd4bf]/40">
                      <div className="p-3 rounded-lg bg-[#ccfbf1] text-[#0d9488]">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs text-[#6b7280] block">Phone</span>
                        <span className="font-semibold text-[#111827] text-xs sm:text-sm">
                          {profile.phone}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 p-3 rounded-xl bg-[#f0fdfa] border border-[#2dd4bf]/40">
                    <div className="p-3 rounded-lg bg-[#ccfbf1] text-[#0d9488]">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-[#6b7280] block">Location</span>
                      <span className="font-semibold text-[#111827] text-xs sm:text-sm">
                        {profile.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-7 bg-white border border-[#0d9488]/15 rounded-2xl p-6 sm:p-8 shadow-sm">
              {contactSubmitted ? (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#ccfbf1] text-[#0d9488] flex items-center justify-center">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-[#111827]">Message Sent!</h4>
                  <p className="text-[#374151] text-sm max-w-sm">
                    Thank you for reaching out. I will get back to you shortly!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#111827]">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, name: e.target.value })
                        }
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#0d9488]/20 text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#111827]">
                        Your Email
                      </label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, email: e.target.value })
                        }
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#0d9488]/20 text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#111827]">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, message: e.target.value })
                      }
                      placeholder="Hi Rishabh, I'd like to discuss a project..."
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#0d9488]/20 text-[#111827] placeholder-[#9ca3af] focus:outline-none focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 text-sm resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold shadow-lg shadow-[#0d9488]/25 hover:shadow-[#0d9488]/40 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <span>Send Message</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#0d9488]/15 bg-white py-8 px-4 sm:px-6 z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#111827]">{profile.name}</span>
            <span className="text-[#6b7280] text-xs sm:text-sm">
              © {new Date().getFullYear()} All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
