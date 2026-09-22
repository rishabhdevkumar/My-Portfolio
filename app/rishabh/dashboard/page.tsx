"use client";

import { useEffect, useState, useRef } from "react";
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
  Camera,
  Upload,
  X,
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
  const [docModal, setDocModal] = useState<{ title: string; url: string; isPdf: boolean } | null>(null);

  const handleOpenDoc = (title: string, url: string) => {
    if (!url) return;
    if (url.startsWith("data:")) {
      try {
        const arr = url.split(",");
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "application/pdf";
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        setDocModal({ title, url: blobUrl, isPdf: mime.includes("pdf") });
        return;
      } catch (e) {
        console.error(e);
      }
    }
    setDocModal({
      title,
      url,
      isPdf: url.toLowerCase().includes("pdf") || url.startsWith("data:application/pdf"),
    });
  };

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

  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);
  const certFileInputRef = useRef<HTMLInputElement | null>(null);
  const offerLetterFileInputRef = useRef<HTMLInputElement | null>(null);
  const projectImageFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleProjectImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification("Image file size should be less than 5MB.", true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        setEditingProject((prev) => (prev ? { ...prev, imageUrl: base64Url } : null));
        showNotification("Project image attached successfully!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification("Image file size should be less than 5MB.", true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        handleProfileChange("avatarUrl", base64Url);
        showNotification("Image selected successfully! Click 'Save Profile Changes' to update.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showNotification("PDF file size should be less than 10MB.", true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        setEditingInternship((prev) => (prev ? { ...prev, certificateUrl: base64Url } : null));
        showNotification("Certificate file attached successfully!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOfferLetterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showNotification("PDF file size should be less than 10MB.", true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        setEditingInternship((prev) => (prev ? { ...prev, offerLetterUrl: base64Url } : null));
        showNotification("Offer letter file attached successfully!");
      }
    };
    reader.readAsDataURL(file);
  };

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
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-medium text-slate-500">Loading Dashboard...</span>
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
    setIsInternshipModalOpen(true);
  };

  const handleOpenEditInternship = (item: Internship) => {
    setEditingInternship({ ...item });
    setIsInternshipModalOpen(true);
  };

  const handleSaveInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !editingInternship || !editingInternship.role) return;

    const newInternship: Internship = {
      id: editingInternship.id || "intern_" + Date.now(),
      role: editingInternship.role,
      company: editingInternship.company || "",
      duration: editingInternship.duration || "",
      description: editingInternship.description || "",
      certificateUrl: editingInternship.certificateUrl || "",
      offerLetterUrl: editingInternship.offerLetterUrl || "",
      technologies: editingInternship.technologies || [],
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
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (proj: Project) => {
    setEditingProject({ ...proj });
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !editingProject || !editingProject.title) return;

    const newProject: Project = {
      id: editingProject.id || "proj_" + Date.now(),
      title: editingProject.title,
      description: editingProject.description || "",
      category: editingProject.category || "Full Stack",
      tags: editingProject.tags || [],
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl text-white font-medium shadow-2xl animate-bounce text-xs sm:text-sm max-w-xs sm:max-w-md ${
            toastMessage.isError ? "bg-amber-600" : "bg-emerald-600"
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
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900">
                {data.profile.name || "Rishabh Dev Kumar"}
              </h1>
              {data.profile.email && (
                <p className="text-xs text-slate-500 font-medium">
                  {data.profile.email}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
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
        <div className="flex border-b border-[#0d9488]/15 mb-8 overflow-x-auto no-scrollbar space-x-2 pb-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all ${
              activeTab === "profile"
                ? "border-b-2 border-[#0d9488] text-[#0d9488] bg-white shadow-xs"
                : "border-b-2 border-transparent text-[#374151] hover:text-[#0d9488] hover:bg-white/50"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Personal Details</span>
          </button>
          <button
            onClick={() => setActiveTab("skills")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all ${
              activeTab === "skills"
                ? "border-b-2 border-[#0d9488] text-[#0d9488] bg-white shadow-xs"
                : "border-b-2 border-transparent text-[#374151] hover:text-[#0d9488] hover:bg-white/50"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Skills ({data.skills.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("internships")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all ${
              activeTab === "internships"
                ? "border-b-2 border-[#0d9488] text-[#0d9488] bg-white shadow-xs"
                : "border-b-2 border-transparent text-[#374151] hover:text-[#0d9488] hover:bg-white/50"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Internships ({data.internships.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all ${
              activeTab === "projects"
                ? "border-b-2 border-[#0d9488] text-[#0d9488] bg-white shadow-xs"
                : "border-b-2 border-transparent text-[#374151] hover:text-[#0d9488] hover:bg-white/50"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Projects ({data.projects.length})</span>
          </button>
        </div>

        {/* TAB 1: PERSONAL DETAILS */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="bg-white border border-[#0d9488]/15 rounded-2xl p-5 sm:p-8 space-y-6 shadow-sm shadow-[#0d9488]/5">
              <h2 className="text-base sm:text-lg font-bold text-[#111827] flex items-center gap-2 border-b border-[#0d9488]/15 pb-4">
                <Sparkles className="w-5 h-5 text-[#0d9488]" />
                <span>General Profile Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#111827]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={data.profile.name}
                    onChange={(e) => handleProfileChange("name", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#0d9488]/25 text-[#111827] text-sm focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 focus:outline-none shadow-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#111827]">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    required
                    value={data.profile.title}
                    onChange={(e) => handleProfileChange("title", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#0d9488]/25 text-[#111827] text-sm focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 focus:outline-none shadow-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#111827]">
                  Short Hero Bio
                </label>
                <textarea
                  rows={2}
                  value={data.profile.bio}
                  onChange={(e) => handleProfileChange("bio", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#0d9488]/25 text-[#111827] text-sm focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 focus:outline-none resize-none shadow-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#111827]">
                  Detailed About Description
                </label>
                <textarea
                  rows={4}
                  value={data.profile.about}
                  onChange={(e) => handleProfileChange("about", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#0d9488]/25 text-[#111827] text-sm focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 focus:outline-none resize-none shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#111827]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={data.profile.email}
                    onChange={(e) => handleProfileChange("email", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#0d9488]/25 text-[#111827] text-sm focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 focus:outline-none shadow-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#111827]">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={data.profile.phone}
                    onChange={(e) => handleProfileChange("phone", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#0d9488]/25 text-[#111827] text-sm focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 focus:outline-none shadow-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#111827]">
                    Location
                  </label>
                  <input
                    type="text"
                    value={data.profile.location}
                    onChange={(e) => handleProfileChange("location", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#0d9488]/25 text-[#111827] text-sm focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 focus:outline-none shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#111827]">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={data.profile.yearsExperience}
                    onChange={(e) =>
                      handleProfileChange("yearsExperience", Number(e.target.value))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#0d9488]/25 text-[#111827] text-sm focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 focus:outline-none shadow-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#111827]">
                    Completed Projects Count
                  </label>
                  <input
                    type="number"
                    value={data.profile.completedProjects}
                    onChange={(e) =>
                      handleProfileChange("completedProjects", Number(e.target.value))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#0d9488]/25 text-[#111827] text-sm focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 focus:outline-none shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#0d9488]/15">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#111827]">
                      Avatar / Profile Image
                    </label>
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="text-xs text-[#0f766e] flex items-center gap-1 font-semibold bg-[#ccfbf1] border border-[#2dd4bf] px-3 py-1.5 rounded-xl hover:bg-[#2dd4bf]/30 transition-all cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Select File from Device</span>
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={avatarFileInputRef}
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />

                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={data.profile.avatarUrl}
                      placeholder="Paste image URL or click button/avatar to select file"
                      onChange={(e) => handleProfileChange("avatarUrl", e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-[#0d9488]/25 text-[#111827] text-sm focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 focus:outline-none shadow-xs"
                    />

                    <div
                      onClick={() => avatarFileInputRef.current?.click()}
                      title="Click to select image file from device"
                      className="relative w-12 h-12 rounded-full p-0.5 bg-gradient-to-r from-[#2dd4bf] to-[#0d9488] shrink-0 shadow-md shadow-[#0d9488]/20 cursor-pointer group/avatar overflow-hidden"
                    >
                      <div className="w-full h-full rounded-full overflow-hidden bg-white border border-slate-200 flex items-center justify-center relative">
                        {data.profile.avatarUrl ? (
                          <img src={data.profile.avatarUrl} alt="Preview" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <User className="w-6 h-6 text-[#0d9488]" />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                          <Camera className="w-4 h-4 text-[#2dd4bf]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#111827]">
                    GitHub Profile URL
                  </label>
                  <input
                    type="url"
                    value={data.profile.githubUrl}
                    onChange={(e) => handleProfileChange("githubUrl", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#0d9488]/25 text-[#111827] text-sm focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 focus:outline-none shadow-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#111827]">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={data.profile.linkedinUrl}
                    onChange={(e) => handleProfileChange("linkedinUrl", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#0d9488]/25 text-[#111827] text-sm focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 focus:outline-none shadow-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#111827]">
                    Twitter / X Profile URL
                  </label>
                  <input
                    type="url"
                    value={data.profile.twitterUrl}
                    onChange={(e) => handleProfileChange("twitterUrl", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#0d9488]/25 text-[#111827] text-sm focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 focus:outline-none shadow-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold shadow-lg shadow-[#0d9488]/20 flex items-center justify-center gap-2 transition-all text-sm"
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
                <h2 className="text-base sm:text-lg font-bold text-[#111827]">Technical Skills</h2>
                <p className="text-xs text-[#6b7280]">
                  Add, modify or remove skills shown on your portfolio
                </p>
              </div>
              <button
                onClick={handleOpenAddSkill}
                className="px-4 py-2 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-[#0d9488]/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Skill</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-5 rounded-2xl bg-white border border-[#0d9488]/15 flex items-center justify-between group hover:border-[#2dd4bf] shadow-xs hover:shadow-md transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#111827] text-sm">{skill.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ccfbf1] text-[#0f766e] font-semibold border border-[#2dd4bf]/30">
                        {skill.category}
                      </span>
                    </div>
                    <div className="text-xs text-[#0d9488] font-semibold">
                      Proficiency: {skill.level}%
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditSkill(skill)}
                      className="p-2 rounded-lg text-[#6b7280] hover:text-[#0d9488] hover:bg-[#f0fdfa] transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSkill(skill.id, skill.name)}
                      className="p-2 rounded-lg text-[#6b7280] hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
                <h2 className="text-base sm:text-lg font-bold text-[#111827]">
                  Internships & Certifications
                </h2>
                <p className="text-xs text-[#6b7280]">
                  Manage internships, roles, certificates, and offer letters
                </p>
              </div>
              <button
                onClick={handleOpenAddInternship}
                className="px-4 py-2 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-[#0d9488]/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Internship</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.internships.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#0d9488]/15 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#2dd4bf] shadow-xs hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-[#0d9488]">
                          {item.company}
                        </span>
                        <h3 className="text-base font-bold text-[#111827]">
                          {item.role}
                        </h3>
                        <span className="text-xs text-[#6b7280] block mt-0.5">
                          {item.duration}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#374151] leading-relaxed line-clamp-3">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {item.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded bg-[#f0fdfa] text-[#111827] text-[10px] font-semibold border border-[#2dd4bf]/40"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#0d9488]/15">
                    <div className="flex items-center gap-2 text-xs">
                      {item.certificateUrl ? (
                        <button
                          type="button"
                          onClick={() => handleOpenDoc(`${item.role} - Certificate`, item.certificateUrl)}
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-[#ccfbf1] hover:bg-[#2dd4bf]/30 text-[#0f766e] border border-[#2dd4bf]/40 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Award className="w-3 h-3 text-[#0d9488]" /> Certificate
                        </button>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-[#6b7280]">
                          No Certificate
                        </span>
                      )}

                      {item.offerLetterUrl && (
                        <button
                          type="button"
                          onClick={() => handleOpenDoc(`${item.role} - Offer Letter`, item.offerLetterUrl)}
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-white hover:bg-[#f0fdfa] text-[#111827] border border-[#2dd4bf]/40 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <FileText className="w-3 h-3 text-[#0d9488]" /> Offer Letter
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditInternship(item)}
                        className="p-2 rounded-lg text-[#6b7280] hover:text-[#0d9488] hover:bg-[#f0fdfa] transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInternship(item.id, item.role)}
                        className="p-2 rounded-lg text-[#6b7280] hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
                <h2 className="text-base sm:text-lg font-bold text-[#111827]">Projects Showcase</h2>
                <p className="text-xs text-[#6b7280]">
                  Manage the portfolio projects displayed to visitors
                </p>
              </div>
              <button
                onClick={handleOpenAddProject}
                className="px-4 py-2 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-[#0d9488]/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Project</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white border border-[#0d9488]/15 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#2dd4bf] shadow-xs hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-[#0d9488]">
                          {project.category}
                        </span>
                        <h3 className="text-base font-bold text-[#111827]">
                          {project.title}
                        </h3>
                      </div>
                      {project.featured && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-[#0d9488] text-white px-2.5 py-0.5 rounded-full shadow-xs">
                          Featured
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#374151] leading-relaxed line-clamp-2">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded bg-[#ccfbf1]/60 text-[#0f766e] text-[10px] font-semibold border border-[#2dd4bf]/40"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#0d9488]/15">
                    <div className="flex items-center gap-2 text-xs">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#0d9488] hover:underline font-semibold flex items-center gap-1"
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
                          className="text-[#374151] hover:underline flex items-center gap-1"
                        >
                          <GithubIcon className="w-3 h-3" />
                          <span>Repo</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditProject(project)}
                        className="p-2 rounded-lg text-[#6b7280] hover:text-[#0d9488] hover:bg-[#f0fdfa] transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id, project.title)}
                        className="p-2 rounded-lg text-[#6b7280] hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
        <div className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveSkill}
            className="w-full max-w-md bg-white border border-[#0d9488]/20 rounded-2xl p-6 space-y-5 shadow-2xl"
          >
            <h3 className="text-base font-bold text-[#111827]">
              {data.skills.some((s) => s.id === editingSkill.id)
                ? "Edit Skill"
                : "Add New Skill"}
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#111827]">Skill Name</label>
              <input
                type="text"
                required
                value={editingSkill.name || ""}
                onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                placeholder="e.g. Next.js, Docker, Python"
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#0d9488]/25 text-[#111827] text-sm focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 focus:outline-none shadow-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#111827]">Category</label>
              <select
                value={editingSkill.category || "Frontend"}
                onChange={(e) =>
                  setEditingSkill({
                    ...editingSkill,
                    category: e.target.value as Skill["category"],
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#0d9488]/25 text-[#111827] text-sm focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 focus:outline-none shadow-xs"
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
                <option value="Tools & Other">Tools & Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#111827]">
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
                className="w-full accent-[#0d9488]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSkillModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#f0fdfa] border border-[#2dd4bf]/60 hover:bg-[#ccfbf1] text-[#111827] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-semibold shadow-md shadow-[#0d9488]/20"
              >
                Save Skill
              </button>
            </div>
          </form>
        </div>
      )}

      {/* INTERNSHIP MODAL */}
      {isInternshipModalOpen && editingInternship && (
        <div className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveInternship}
            className="w-full max-w-lg bg-white border border-[#0d9488]/20 rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-base font-bold text-[#111827]">
              {data.internships.some((i) => i.id === editingInternship.id)
                ? "Edit Internship"
                : "Add New Internship"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111827]">Role / Position</label>
                <input
                  type="text"
                  required
                  value={editingInternship.role || ""}
                  onChange={(e) =>
                    setEditingInternship({ ...editingInternship, role: e.target.value })
                  }
                  placeholder="e.g. Full Stack Developer Intern"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#0d9488]/25 text-[#111827] text-sm focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 focus:outline-none shadow-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111827]">Company Name</label>
                <input
                  type="text"
                  required
                  value={editingInternship.company || ""}
                  onChange={(e) =>
                    setEditingInternship({ ...editingInternship, company: e.target.value })
                  }
                  placeholder="e.g. TechCorp Solutions"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#0d9488]/25 text-[#111827] text-sm focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 focus:outline-none shadow-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111827]">Duration</label>
              <input
                type="text"
                value={editingInternship.duration || ""}
                onChange={(e) =>
                  setEditingInternship({ ...editingInternship, duration: e.target.value })
                }
                placeholder="e.g. 6 Months (Jan 2024 - Jun 2024)"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#0d9488]/25 text-[#111827] text-sm focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 focus:outline-none shadow-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111827]">Description</label>
              <textarea
                rows={3}
                value={editingInternship.description || ""}
                onChange={(e) =>
                  setEditingInternship({ ...editingInternship, description: e.target.value })
                }
                placeholder="Key responsibilities and achievements during internship..."
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#0d9488]/25 text-[#111827] text-sm focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 focus:outline-none resize-none shadow-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111827]">
                  Certificate PDF File
                </label>
                <input
                  type="file"
                  ref={certFileInputRef}
                  accept=".pdf,application/pdf,image/*"
                  onChange={handleCertFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => certFileInputRef.current?.click()}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#0d9488]/30 hover:border-[#0d9488] text-[#111827] text-xs font-semibold flex items-center justify-between shadow-xs transition-all cursor-pointer group"
                >
                  <span className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-[#0d9488] shrink-0" />
                    <span className="truncate">
                      {editingInternship.certificateUrl ? "Certificate File Attached" : "Select Certificate PDF"}
                    </span>
                  </span>
                  <Upload className="w-4 h-4 text-[#0d9488] group-hover:scale-110 transition-transform shrink-0 ml-1" />
                </button>
                {editingInternship.certificateUrl && (
                  <div className="flex items-center justify-between text-[11px] text-[#0f766e] bg-[#ccfbf1]/50 px-2.5 py-1 rounded-lg border border-[#2dd4bf]/40 mt-1">
                    <span className="truncate font-semibold">PDF Ready to Save</span>
                    <button
                      type="button"
                      onClick={() => setEditingInternship({ ...editingInternship, certificateUrl: "" })}
                      className="text-rose-600 hover:underline font-bold text-[10px] ml-1"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111827]">
                  Offer Letter PDF File
                </label>
                <input
                  type="file"
                  ref={offerLetterFileInputRef}
                  accept=".pdf,application/pdf,image/*"
                  onChange={handleOfferLetterFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => offerLetterFileInputRef.current?.click()}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#0d9488]/30 hover:border-[#0d9488] text-[#111827] text-xs font-semibold flex items-center justify-between shadow-xs transition-all cursor-pointer group"
                >
                  <span className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-[#0d9488] shrink-0" />
                    <span className="truncate">
                      {editingInternship.offerLetterUrl ? "Offer Letter Attached" : "Select Offer Letter PDF"}
                    </span>
                  </span>
                  <Upload className="w-4 h-4 text-[#0d9488] group-hover:scale-110 transition-transform shrink-0 ml-1" />
                </button>
                {editingInternship.offerLetterUrl && (
                  <div className="flex items-center justify-between text-[11px] text-[#0f766e] bg-[#ccfbf1]/50 px-2.5 py-1 rounded-lg border border-[#2dd4bf]/40 mt-1">
                    <span className="truncate font-semibold">PDF Ready to Save</span>
                    <button
                      type="button"
                      onClick={() => setEditingInternship({ ...editingInternship, offerLetterUrl: "" })}
                      className="text-rose-600 hover:underline font-bold text-[10px] ml-1"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsInternshipModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#f0fdfa] border border-[#2dd4bf]/60 hover:bg-[#ccfbf1] text-[#111827] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-semibold shadow-md shadow-[#0d9488]/20"
              >
                Save Internship
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PROJECT MODAL */}
      {isProjectModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 bg-[#111827]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveProject}
            className="w-full max-w-lg bg-white border border-[#0d9488]/20 rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-base font-bold text-[#111827]">
              {data.projects.some((p) => p.id === editingProject.id)
                ? "Edit Project"
                : "Add New Project"}
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111827]">
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
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#0d9488]/25 text-[#111827] text-sm focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 focus:outline-none shadow-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111827]">
                Description
              </label>
              <textarea
                rows={3}
                value={editingProject.description || ""}
                onChange={(e) =>
                  setEditingProject({ ...editingProject, description: e.target.value })
                }
                placeholder="Brief summary of the project..."
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#0d9488]/25 text-[#111827] text-sm focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 focus:outline-none resize-none shadow-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111827]">
                Project Banner Image
              </label>
              <input
                type="file"
                ref={projectImageFileInputRef}
                accept="image/*"
                onChange={handleProjectImageFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => projectImageFileInputRef.current?.click()}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#0d9488]/30 hover:border-[#0d9488] text-[#111827] text-xs font-semibold flex items-center justify-between shadow-xs transition-all cursor-pointer group"
              >
                <span className="flex items-center gap-2 truncate">
                  <Camera className="w-4 h-4 text-[#0d9488] shrink-0" />
                  <span className="truncate">
                    {editingProject.imageUrl ? "Project Image Selected" : "Upload Project Image File"}
                  </span>
                </span>
                <Upload className="w-4 h-4 text-[#0d9488] group-hover:scale-110 transition-transform shrink-0 ml-1" />
              </button>
              {editingProject.imageUrl && (
                <div className="flex items-center justify-between gap-3 text-[11px] text-[#0f766e] bg-[#ccfbf1]/50 p-2 rounded-xl border border-[#2dd4bf]/40 mt-1">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <img
                      src={editingProject.imageUrl}
                      alt="Preview"
                      className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <span className="truncate font-semibold">Image Ready to Save</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingProject({ ...editingProject, imageUrl: "" })}
                    className="text-rose-600 hover:underline font-bold text-[10px] shrink-0"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111827]">
                  Live Demo URL
                </label>
                <input
                  type="url"
                  value={editingProject.liveUrl || ""}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, liveUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#0d9488]/25 text-[#111827] text-sm focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 focus:outline-none shadow-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111827]">
                  GitHub Code URL
                </label>
                <input
                  type="url"
                  value={editingProject.githubUrl || ""}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, githubUrl: e.target.value })
                  }
                  placeholder="https://github.com/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#0d9488]/25 text-[#111827] text-sm focus:border-[#0d9488] focus:ring-2 focus:ring-[#2dd4bf]/30 focus:outline-none shadow-xs"
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
                className="w-4 h-4 rounded accent-[#0d9488]"
              />
              <label htmlFor="featuredCheck" className="text-xs font-semibold text-[#111827]">
                Highlight as Featured Project
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#f0fdfa] border border-[#2dd4bf]/60 hover:bg-[#ccfbf1] text-[#111827] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white text-xs font-semibold shadow-md shadow-[#0d9488]/20"
              >
                Save Project
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Document Viewer Modal */}
      {docModal && (
        <div className="fixed inset-0 z-50 bg-[#111827]/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[#0d9488]/20">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-[#f0fdfa] border-b border-[#0d9488]/15 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#ccfbf1] text-[#0d9488]">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-[#111827] text-sm sm:text-base truncate">
                  {docModal.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={docModal.url}
                  download={`${docModal.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`}
                  className="px-3 py-1.5 rounded-lg bg-[#0d9488] text-white hover:bg-[#0f766e] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setDocModal(null)}
                  className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#111827] hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 p-3 sm:p-4 bg-slate-100/50 overflow-hidden flex items-center justify-center">
              {docModal.isPdf || docModal.url.startsWith("blob:") ? (
                <iframe
                  src={docModal.url}
                  className="w-full h-[70vh] rounded-xl border border-slate-200 bg-white"
                  title={docModal.title}
                />
              ) : (
                <img
                  src={docModal.url}
                  alt={docModal.title}
                  className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-md"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
