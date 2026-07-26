"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchPortfolioFromAPI,
  getPortfolioData,
  savePortfolioData,
  resetPortfolioData,
  updateProfileAPI,
  saveSkillAPI,
  deleteSkillAPI,
  saveProjectAPI,
  deleteProjectAPI,
  saveInternshipAPI,
  deleteInternshipAPI,
  PortfolioData,
  ProfileDetails,
  Skill,
  Project,
  Internship,
} from "@/lib/portfolio-data";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  User,
  Briefcase,
  Layers,
  Sparkles,
  ExternalLink,
  Globe,
  Database,
  Award,
  FileText,
} from "lucide-react";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export default function RishabhDashboardPage() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [dbConnected, setDbConnected] = useState<boolean>(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "skills" | "internships" | "projects">("profile");
  const [toastMessage, setToastMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Edit / Add Modal state for Skills
  const [editingSkill, setEditingSkill] = useState<Partial<Skill> | null>(null);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);

  // Edit / Add Modal state for Projects
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectTagsInput, setProjectTagsInput] = useState("");

  // Edit / Add Modal state for Internships
  const [editingInternship, setEditingInternship] = useState<Partial<Internship> | null>(null);
  const [isInternshipModalOpen, setIsInternshipModalOpen] = useState(false);
  const [internshipTechInput, setInternshipTechInput] = useState("");

  useEffect(() => {
    fetchPortfolioFromAPI().then((res) => {
      setDbConnected(res.dbConnected);
      if (res.error) setDbError(res.error);
      if (res.data) {
        setData(res.data);
      } else {
        setData(getPortfolioData());
      }
    });
  }, []);

  const showNotification = (text: string, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 4500);
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-medium text-slate-400">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  // Handle Profile Update
  const handleProfileChange = (
    field: keyof ProfileDetails,
    value: string | number
  ) => {
    if (!data) return;
    const updated = {
      ...data,
      profile: {
        ...data.profile,
        [field]: value,
      },
    };
    setData(updated);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    savePortfolioData(data);
    const dbRes = await updateProfileAPI(data.profile);
    if (dbRes.success) {
      showNotification("Personal details saved to PostgreSQL database ('portfolio', 'users' table)!");
    } else {
      showNotification(`Saved locally! PostgreSQL warning: ${dbRes.error}`, true);
    }
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (confirm("Are you sure you want to reset all portfolio data to defaults?")) {
      const reset = resetPortfolioData();
      setData(reset);
      showNotification("Portfolio data reset to initial defaults.");
    }
  };

  // Skill Handlers
  const handleOpenAddSkill = () => {
    setEditingSkill({
      id: "skill_" + Date.now(),
      name: "",
      category: "Frontend",
      level: 80,
    });
    setIsSkillModalOpen(true);
  };

  const handleOpenEditSkill = (skill: Skill) => {
    setEditingSkill({ ...skill });
    setIsSkillModalOpen(true);
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !editingSkill || !editingSkill.name) return;

    const existingIndex = data.skills.findIndex((s) => s.id === editingSkill.id);
    let updatedSkills: Skill[];

    const newSkill: Skill = {
      id: editingSkill.id || "skill_" + Date.now(),
      name: editingSkill.name,
      category: editingSkill.category || "Frontend",
      level: Number(editingSkill.level) || 80,
    };

    if (existingIndex >= 0) {
      updatedSkills = [...data.skills];
      updatedSkills[existingIndex] = newSkill;
    } else {
      updatedSkills = [...data.skills, newSkill];
    }

    const updatedData = { ...data, skills: updatedSkills };
    setData(updatedData);
    savePortfolioData(updatedData);
    const dbRes = await saveSkillAPI(newSkill);

    setIsSkillModalOpen(false);
    setEditingSkill(null);

    if (dbRes.success) {
      showNotification(`Skill "${newSkill.name}" saved to PostgreSQL!`);
    } else {
      showNotification(`Skill "${newSkill.name}" saved locally. DB info: ${dbRes.error}`, true);
    }
  };

  const handleDeleteSkill = async (id: string, name: string) => {
    if (!data) return;
    if (confirm(`Delete skill "${name}"?`)) {
      const updatedSkills = data.skills.filter((s) => s.id !== id);
      const updatedData = { ...data, skills: updatedSkills };
      setData(updatedData);
      savePortfolioData(updatedData);
      const dbRes = await deleteSkillAPI(id);
      showNotification(`Skill "${name}" removed.`);
    }
  };

  // Internship Handlers
  const handleOpenAddInternship = () => {
    setEditingInternship({
      id: "intern_" + Date.now(),
      role: "",
      company: "",
      duration: "",
      description: "",
      certificateUrl: "",
      offerLetterUrl: "",
      technologies: [],
    });
    setInternshipTechInput("");
    setIsInternshipModalOpen(true);
  };

  const handleOpenEditInternship = (item: Internship) => {
    setEditingInternship({ ...item });
    setInternshipTechInput(item.technologies ? item.technologies.join(", ") : "");
    setIsInternshipModalOpen(true);
  };

  const handleSaveInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !editingInternship || !editingInternship.role) return;

    const parsedTech = internshipTechInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newInternship: Internship = {
      id: editingInternship.id || "intern_" + Date.now(),
      role: editingInternship.role,
      company: editingInternship.company || "",
      duration: editingInternship.duration || "",
      description: editingInternship.description || "",
      certificateUrl: editingInternship.certificateUrl || "",
      offerLetterUrl: editingInternship.offerLetterUrl || "",
      technologies: parsedTech,
    };

    const existingIndex = data.internships.findIndex((i) => i.id === newInternship.id);
    let updatedInternships: Internship[];

    if (existingIndex >= 0) {
      updatedInternships = [...data.internships];
      updatedInternships[existingIndex] = newInternship;
    } else {
      updatedInternships = [...data.internships, newInternship];
    }

    const updatedData = { ...data, internships: updatedInternships };
    setData(updatedData);
    savePortfolioData(updatedData);
    const dbRes = await saveInternshipAPI(newInternship);

    setIsInternshipModalOpen(false);
    setEditingInternship(null);

    if (dbRes.success) {
      showNotification(`Internship "${newInternship.role}" saved to PostgreSQL!`);
    } else {
      showNotification(`Internship saved locally. DB info: ${dbRes.error}`, true);
    }
  };

  const handleDeleteInternship = async (id: string, role: string) => {
    if (!data) return;
    if (confirm(`Delete internship "${role}"?`)) {
      const updatedInternships = data.internships.filter((i) => i.id !== id);
      const updatedData = { ...data, internships: updatedInternships };
      setData(updatedData);
      savePortfolioData(updatedData);
      await deleteInternshipAPI(id);
      showNotification(`Internship "${role}" removed.`);
    }
  };

  // Project Handlers
  const handleOpenAddProject = () => {
    setEditingProject({
      id: "proj_" + Date.now(),
      title: "",
      description: "",
      category: "Full Stack",
      tags: [],
      imageUrl: "",
      liveUrl: "",
      githubUrl: "",
      featured: false,
    });
    setProjectTagsInput("");
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (proj: Project) => {
    setEditingProject({ ...proj });
    setProjectTagsInput(proj.tags ? proj.tags.join(", ") : "");
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !editingProject || !editingProject.title) return;

    const parsedTags = projectTagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newProject: Project = {
      id: editingProject.id || "proj_" + Date.now(),
      title: editingProject.title,
      description: editingProject.description || "",
      category: editingProject.category || "Full Stack",
      tags: parsedTags,
      imageUrl: editingProject.imageUrl || "",
      liveUrl: editingProject.liveUrl || "",
      githubUrl: editingProject.githubUrl || "",
      featured: editingProject.featured ?? false,
    };

    const existingIndex = data.projects.findIndex((p) => p.id === newProject.id);
    let updatedProjects: Project[];

    if (existingIndex >= 0) {
      updatedProjects = [...data.projects];
      updatedProjects[existingIndex] = newProject;
    } else {
      updatedProjects = [...data.projects, newProject];
    }

    const updatedData = { ...data, projects: updatedProjects };
    setData(updatedData);
    savePortfolioData(updatedData);
    const dbRes = await saveProjectAPI(newProject);

    setIsProjectModalOpen(false);
    setEditingProject(null);

    if (dbRes.success) {
      showNotification(`Project "${newProject.title}" saved to PostgreSQL!`);
    } else {
      showNotification(`Project saved locally. DB info: ${dbRes.error}`, true);
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!data) return;
    if (confirm(`Delete project "${title}"?`)) {
      const updatedProjects = data.projects.filter((p) => p.id !== id);
      const updatedData = { ...data, projects: updatedProjects };
      setData(updatedData);
      savePortfolioData(updatedData);
      await deleteProjectAPI(id);
      showNotification(`Project "${title}" removed.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl text-white font-medium shadow-2xl animate-bounce text-xs sm:text-sm max-w-xs sm:max-w-md ${
            toastMessage.isError ? "bg-amber-600" : "bg-cyan-500"
          }`}
        >
          {toastMessage.isError ? (
            <AlertCircle className="w-5 h-5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Admin Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Rishabh Admin Dashboard</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30 text-[10px] uppercase font-bold hidden sm:inline-block">
                  /rishabh/dashboard
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Database className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>DB &apos;portfolio&apos; &bull; Table &apos;users&apos; &bull; {dbConnected ? "PostgreSQL Active" : "Local Mode (Check .env.local DB Password)"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>View Portfolio</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Mobile-Friendly Horizontally Scrollable Tabs */}
        <div className="flex border-b border-slate-800 mb-8 overflow-x-auto no-scrollbar space-x-2 pb-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === "profile"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Personal Details</span>
          </button>
          <button
            onClick={() => setActiveTab("skills")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === "skills"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Skills ({data.skills.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("internships")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === "internships"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Internships ({data.internships.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === "projects"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Projects ({data.projects.length})</span>
          </button>
        </div>

        {/* TAB 1: PERSONAL DETAILS */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-8 space-y-6">
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-4">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span>General Profile Information (DB: portfolio, Table: users)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={data.profile.name}
                    onChange={(e) => handleProfileChange("name", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    required
                    value={data.profile.title}
                    onChange={(e) => handleProfileChange("title", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Short Hero Bio
                </label>
                <textarea
                  rows={2}
                  value={data.profile.bio}
                  onChange={(e) => handleProfileChange("bio", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Detailed About Description
                </label>
                <textarea
                  rows={4}
                  value={data.profile.about}
                  onChange={(e) => handleProfileChange("about", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={data.profile.email}
                    onChange={(e) => handleProfileChange("email", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={data.profile.phone}
                    onChange={(e) => handleProfileChange("phone", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Location
                  </label>
                  <input
                    type="text"
                    value={data.profile.location}
                    onChange={(e) => handleProfileChange("location", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={data.profile.yearsExperience}
                    onChange={(e) =>
                      handleProfileChange("yearsExperience", Number(e.target.value))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Completed Projects Count
                  </label>
                  <input
                    type="number"
                    value={data.profile.completedProjects}
                    onChange={(e) =>
                      handleProfileChange("completedProjects", Number(e.target.value))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Avatar Image URL
                  </label>
                  <input
                    type="url"
                    value={data.profile.avatarUrl}
                    onChange={(e) => handleProfileChange("avatarUrl", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    GitHub Profile URL
                  </label>
                  <input
                    type="url"
                    value={data.profile.githubUrl}
                    onChange={(e) => handleProfileChange("githubUrl", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={data.profile.linkedinUrl}
                    onChange={(e) => handleProfileChange("linkedinUrl", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Twitter / X Profile URL
                  </label>
                  <input
                    type="url"
                    value={data.profile.twitterUrl}
                    onChange={(e) => handleProfileChange("twitterUrl", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-semibold shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all text-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: SKILLS MANAGER */}
        {activeTab === "skills" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-100">Technical Skills</h2>
                <p className="text-xs text-slate-400">
                  Add, modify or remove skills shown on your portfolio
                </p>
              </div>
              <button
                onClick={handleOpenAddSkill}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Skill</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100 text-sm">{skill.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                        {skill.category}
                      </span>
                    </div>
                    <div className="text-xs text-cyan-400 font-medium">
                      Proficiency: {skill.level}%
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditSkill(skill)}
                      className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSkill(skill.id, skill.name)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: INTERNSHIPS MANAGER */}
        {activeTab === "internships" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Internships & Certifications
                </h2>
                <p className="text-xs text-slate-400">
                  Manage internships, roles, certificates, and offer letters
                </p>
              </div>
              <button
                onClick={handleOpenAddInternship}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Internship</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.internships.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-semibold text-cyan-400">
                          {item.company}
                        </span>
                        <h3 className="text-base font-bold text-slate-100">
                          {item.role}
                        </h3>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          {item.duration}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {item.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <div className="flex items-center gap-2 text-xs">
                      {item.certificateUrl ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 font-semibold flex items-center gap-1">
                          <Award className="w-3 h-3" /> Certificate
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-500">
                          No Certificate
                        </span>
                      )}

                      {item.offerLetterUrl && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold flex items-center gap-1">
                          <FileText className="w-3 h-3" /> Offer Letter
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditInternship(item)}
                        className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInternship(item.id, item.role)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PROJECTS MANAGER */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-100">Projects Showcase</h2>
                <p className="text-xs text-slate-400">
                  Manage the portfolio projects displayed to visitors
                </p>
              </div>
              <button
                onClick={handleOpenAddProject}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Project</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold text-cyan-400">
                          {project.category}
                        </span>
                        <h3 className="text-base font-bold text-slate-100">
                          {project.title}
                        </h3>
                      </div>
                      {project.featured && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <div className="flex items-center gap-2 text-xs">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Live</span>
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:underline flex items-center gap-1"
                        >
                          <GithubIcon className="w-3 h-3" />
                          <span>Repo</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditProject(project)}
                        className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id, project.title)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* SKILL MODAL */}
      {isSkillModalOpen && editingSkill && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveSkill}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl"
          >
            <h3 className="text-base font-bold text-slate-100">
              {data.skills.some((s) => s.id === editingSkill.id)
                ? "Edit Skill"
                : "Add New Skill"}
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Skill Name</label>
              <input
                type="text"
                required
                value={editingSkill.name || ""}
                onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                placeholder="e.g. Next.js, Docker, Python"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <select
                value={editingSkill.category || "Frontend"}
                onChange={(e) =>
                  setEditingSkill({
                    ...editingSkill,
                    category: e.target.value as Skill["category"],
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
                <option value="Tools & Other">Tools & Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Proficiency Level ({editingSkill.level || 80}%)
              </label>
              <input
                type="range"
                min={10}
                max={100}
                value={editingSkill.level || 80}
                onChange={(e) =>
                  setEditingSkill({ ...editingSkill, level: Number(e.target.value) })
                }
                className="w-full accent-cyan-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSkillModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold shadow-md shadow-cyan-500/20"
              >
                Save Skill
              </button>
            </div>
          </form>
        </div>
      )}

      {/* INTERNSHIP MODAL */}
      {isInternshipModalOpen && editingInternship && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveInternship}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-base font-bold text-slate-100">
              {data.internships.some((i) => i.id === editingInternship.id)
                ? "Edit Internship"
                : "Add New Internship"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Role / Position</label>
                <input
                  type="text"
                  required
                  value={editingInternship.role || ""}
                  onChange={(e) =>
                    setEditingInternship({ ...editingInternship, role: e.target.value })
                  }
                  placeholder="e.g. Full Stack Developer Intern"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Company Name</label>
                <input
                  type="text"
                  required
                  value={editingInternship.company || ""}
                  onChange={(e) =>
                    setEditingInternship({ ...editingInternship, company: e.target.value })
                  }
                  placeholder="e.g. TechCorp Solutions"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Duration</label>
              <input
                type="text"
                value={editingInternship.duration || ""}
                onChange={(e) =>
                  setEditingInternship({ ...editingInternship, duration: e.target.value })
                }
                placeholder="e.g. 6 Months (Jan 2024 - Jun 2024)"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Description</label>
              <textarea
                rows={3}
                value={editingInternship.description || ""}
                onChange={(e) =>
                  setEditingInternship({ ...editingInternship, description: e.target.value })
                }
                placeholder="Key responsibilities and achievements during internship..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Technologies Used (Comma separated)
              </label>
              <input
                type="text"
                value={internshipTechInput}
                onChange={(e) => setInternshipTechInput(e.target.value)}
                placeholder="React, Next.js, PostgreSQL"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Certificate Document URL
                </label>
                <input
                  type="url"
                  value={editingInternship.certificateUrl || ""}
                  onChange={(e) =>
                    setEditingInternship({ ...editingInternship, certificateUrl: e.target.value })
                  }
                  placeholder="https://example.com/certificate.pdf"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Offer Letter Document URL
                </label>
                <input
                  type="url"
                  value={editingInternship.offerLetterUrl || ""}
                  onChange={(e) =>
                    setEditingInternship({ ...editingInternship, offerLetterUrl: e.target.value })
                  }
                  placeholder="https://example.com/offer-letter.pdf"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsInternshipModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold shadow-md shadow-cyan-500/20"
              >
                Save Internship
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PROJECT MODAL */}
      {isProjectModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveProject}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-base font-bold text-slate-100">
              {data.projects.some((p) => p.id === editingProject.id)
                ? "Edit Project"
                : "Add New Project"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={editingProject.title || ""}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, title: e.target.value })
                  }
                  placeholder="e.g. AI SaaS Dashboard"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Category</label>
                <input
                  type="text"
                  value={editingProject.category || "Full Stack"}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, category: e.target.value })
                  }
                  placeholder="e.g. Frontend, Full Stack"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Description
              </label>
              <textarea
                rows={3}
                value={editingProject.description || ""}
                onChange={(e) =>
                  setEditingProject({ ...editingProject, description: e.target.value })
                }
                placeholder="Brief summary of the project..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Tech Stack Tags (Comma separated)
              </label>
              <input
                type="text"
                value={projectTagsInput}
                onChange={(e) => setProjectTagsInput(e.target.value)}
                placeholder="Next.js, TypeScript, Tailwind CSS"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Image Banner URL
              </label>
              <input
                type="url"
                value={editingProject.imageUrl || ""}
                onChange={(e) =>
                  setEditingProject({ ...editingProject, imageUrl: e.target.value })
                }
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Live Demo URL
                </label>
                <input
                  type="url"
                  value={editingProject.liveUrl || ""}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, liveUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  GitHub Code URL
                </label>
                <input
                  type="url"
                  value={editingProject.githubUrl || ""}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, githubUrl: e.target.value })
                  }
                  placeholder="https://github.com/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="featuredCheck"
                checked={editingProject.featured || false}
                onChange={(e) =>
                  setEditingProject({ ...editingProject, featured: e.target.checked })
                }
                className="w-4 h-4 rounded accent-cyan-500"
              />
              <label htmlFor="featuredCheck" className="text-xs font-medium text-slate-300">
                Highlight as Featured Project
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-semibold shadow-md shadow-cyan-500/20"
              >
                Save Project
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
