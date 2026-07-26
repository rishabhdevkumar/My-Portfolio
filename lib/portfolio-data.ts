export interface ProfileDetails {
  name: string;
  title: string;
  bio: string;
  about: string;
  email: string;
  phone: string;
  location: string;
  avatarUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  resumeUrl: string;
  yearsExperience: number;
  completedProjects: number;
}

export interface Skill {
  id: string;
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'Tools & Other';
  level: number;
  iconName?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  imageUrl: string;
  liveUrl: string;
  githubUrl: string;
  featured: boolean;
}

export interface Internship {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
  certificateUrl: string;
  offerLetterUrl: string;
  technologies: string[];
}

export interface PortfolioData {
  profile: ProfileDetails;
  skills: Skill[];
  projects: Project[];
  internships: Internship[];
}

export const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
  profile: {
    name: "Rishabh",
    title: "Full-Stack Software Engineer & Web Architect",
    bio: "Passionate developer creating modern, high-performance web applications with Next.js, React, Node.js, and modern CSS ecosystems.",
    about: "Hello! I'm Rishabh, a software engineer dedicated to building scalable web applications, beautiful user interfaces, and intuitive digital experiences. With expertise across frontend and backend technologies, I turn complex problems into clean, efficient code.",
    email: "rishabh@example.com",
    phone: "+91 98765 43210",
    location: "New Delhi, India",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
    twitterUrl: "https://twitter.com",
    resumeUrl: "#",
    yearsExperience: 4,
    completedProjects: 24,
  },
  skills: [
    { id: "s1", name: "React.js", category: "Frontend", level: 92 },
    { id: "s2", name: "Next.js", category: "Frontend", level: 90 },
    { id: "s3", name: "TypeScript", category: "Frontend", level: 88 },
    { id: "s4", name: "Tailwind CSS", category: "Frontend", level: 95 },
    { id: "s5", name: "Node.js", category: "Backend", level: 85 },
    { id: "s6", name: "Express.js", category: "Backend", level: 85 },
    { id: "s7", name: "REST & GraphQL APIs", category: "Backend", level: 82 },
    { id: "s8", name: "MongoDB", category: "Database", level: 80 },
    { id: "s9", name: "PostgreSQL", category: "Database", level: 78 },
    { id: "s10", name: "Git & GitHub", category: "Tools & Other", level: 90 },
    { id: "s11", name: "Docker", category: "Tools & Other", level: 75 },
    { id: "s12", name: "Vercel & AWS", category: "Tools & Other", level: 80 },
  ],
  projects: [
    {
      id: "p1",
      title: "AI-Powered SaaS Dashboard",
      description: "A real-time analytics and management platform built with Next.js App Router, Tailwind CSS, and AI data processing.",
      category: "Full Stack",
      tags: ["Next.js", "TypeScript", "Tailwind CSS", "OpenAI"],
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      liveUrl: "https://example.com",
      githubUrl: "https://github.com",
      featured: true,
    },
    {
      id: "p2",
      title: "E-Commerce Experience",
      description: "Modern e-commerce platform with fast cart management, Stripe checkout integration, and custom UI components.",
      category: "Frontend",
      tags: ["React", "Tailwind CSS", "Stripe", "State Management"],
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      liveUrl: "https://example.com",
      githubUrl: "https://github.com",
      featured: true,
    },
    {
      id: "p3",
      title: "DevFlow Collaborative Hub",
      description: "Developer platform for sharing code snippets, real-time discussions, and project showcasing.",
      category: "Full Stack",
      tags: ["Next.js", "Node.js", "PostgreSQL", "Tailwind CSS"],
      imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
      liveUrl: "https://example.com",
      githubUrl: "https://github.com",
      featured: true,
    },
  ],
  internships: [
    {
      id: "i1",
      role: "Full Stack Web Developer Intern",
      company: "TechCorp Solutions",
      duration: "6 Months (Jan 2024 - Jun 2024)",
      description: "Developed production-ready Next.js & React dashboards, integrated REST APIs, optimized PostgreSQL database queries, and implemented UI design systems.",
      certificateUrl: "https://example.com/certificate-techcorp.pdf",
      offerLetterUrl: "https://example.com/offer-letter-techcorp.pdf",
      technologies: ["Next.js", "React", "PostgreSQL", "Tailwind CSS"],
    },
    {
      id: "i2",
      role: "Frontend Engineer Intern",
      company: "WebCraft Innovations",
      duration: "3 Months (Sep 2023 - Nov 2023)",
      description: "Built responsive client web applications, styled scalable UI components, integrated state management, and optimized web performance across browsers.",
      certificateUrl: "https://example.com/certificate-webcraft.pdf",
      offerLetterUrl: "https://example.com/offer-letter-webcraft.pdf",
      technologies: ["React", "TypeScript", "Redux Toolkit", "Tailwind CSS"],
    },
  ],
};

const STORAGE_KEY = "rishabh_portfolio_data_v1";
export const PORTFOLIO_CHANGE_EVENT = "rishabh_portfolio_updated";

export function getPortfolioData(): PortfolioData {
  if (typeof window === "undefined") {
    return DEFAULT_PORTFOLIO_DATA;
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PORTFOLIO_DATA));
      return DEFAULT_PORTFOLIO_DATA;
    }
    const parsed = JSON.parse(data);
    return {
      ...DEFAULT_PORTFOLIO_DATA,
      ...parsed,
      profile: {
        ...DEFAULT_PORTFOLIO_DATA.profile,
        ...(parsed.profile || {}),
      },
      skills: parsed.skills || DEFAULT_PORTFOLIO_DATA.skills,
      projects: parsed.projects || DEFAULT_PORTFOLIO_DATA.projects,
      internships: parsed.internships || DEFAULT_PORTFOLIO_DATA.internships,
    };
  } catch (error) {
    console.error("Error reading portfolio data from localStorage:", error);
    return DEFAULT_PORTFOLIO_DATA;
  }
}

export function savePortfolioData(data: PortfolioData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event(PORTFOLIO_CHANGE_EVENT));
  } catch (error) {
    console.error("Error saving portfolio data to localStorage:", error);
  }
}

export function resetPortfolioData(): PortfolioData {
  savePortfolioData(DEFAULT_PORTFOLIO_DATA);
  return DEFAULT_PORTFOLIO_DATA;
}

// API Call Helpers for PostgreSQL Backend
export async function fetchPortfolioFromAPI(): Promise<{ dbConnected: boolean; data: PortfolioData; error?: string }> {
  try {
    const res = await fetch("/api/portfolio", { cache: "no-store" });
    if (!res.ok) throw new Error("API request failed");
    const json = await res.json();
    if (json.dbConnected && json.data) {
      savePortfolioData(json.data);
      return json;
    }
    return { dbConnected: false, data: getPortfolioData(), error: json.error || json.message };
  } catch (err: any) {
    return { dbConnected: false, data: getPortfolioData(), error: err.message };
  }
}

export async function updateProfileAPI(profile: ProfileDetails): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/admin/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || json.message || "Failed to update profile in PostgreSQL" };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Connection error to PostgreSQL API" };
  }
}

export async function saveSkillAPI(skill: Skill): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/admin/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(skill),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || "Failed to save skill in PostgreSQL" };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteSkillAPI(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/admin/skills?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || "Failed to delete skill in PostgreSQL" };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveProjectAPI(project: Project): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(project),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || "Failed to save project in PostgreSQL" };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteProjectAPI(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/admin/projects?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || "Failed to delete project in PostgreSQL" };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveInternshipAPI(internship: Internship): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/admin/internships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(internship),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || "Failed to save internship in PostgreSQL" };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteInternshipAPI(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/admin/internships?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || "Failed to delete internship in PostgreSQL" };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
