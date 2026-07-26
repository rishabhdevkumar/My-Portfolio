-- PostgreSQL Database Schema for Rishabh's Portfolio
-- Database Name: portfolio

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  bio TEXT,
  about TEXT,
  email VARCHAR(150),
  phone VARCHAR(50),
  location VARCHAR(150),
  avatar_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  resume_url TEXT,
  years_experience INT DEFAULT 0,
  completed_projects INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Skills Table
CREATE TABLE IF NOT EXISTS skills (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  level INT NOT NULL DEFAULT 80,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  tags TEXT[],
  image_url TEXT,
  live_url TEXT,
  github_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Internships Table
CREATE TABLE IF NOT EXISTS internships (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(150) NOT NULL,
  company VARCHAR(150) NOT NULL,
  duration VARCHAR(100),
  description TEXT,
  certificate_url TEXT,
  offer_letter_url TEXT,
  technologies TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Seed Data for Rishabh
INSERT INTO users (
  id, name, title, bio, about, email, phone, location, avatar_url, github_url, linkedin_url, twitter_url, resume_url, years_experience, completed_projects
) VALUES (
  'u_rishabh',
  'Rishabh',
  'Full-Stack Software Engineer & Web Architect',
  'Passionate developer creating modern, high-performance web applications with Next.js, React, Node.js, and modern CSS ecosystems.',
  'Hello! I''m Rishabh, a software engineer dedicated to building scalable web applications, beautiful user interfaces, and intuitive digital experiences. With expertise across frontend and backend technologies, I turn complex problems into clean, efficient code.',
  'rishabh@example.com',
  '+91 98765 43210',
  'New Delhi, India',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://github.com',
  'https://linkedin.com',
  'https://twitter.com',
  '#',
  4,
  24
) ON CONFLICT (id) DO NOTHING;

-- Initial Skills Seed
INSERT INTO skills (id, user_id, name, category, level) VALUES
('s1', 'u_rishabh', 'React.js', 'Frontend', 92),
('s2', 'u_rishabh', 'Next.js', 'Frontend', 90),
('s3', 'u_rishabh', 'TypeScript', 'Frontend', 88),
('s4', 'u_rishabh', 'Tailwind CSS', 'Frontend', 95),
('s5', 'u_rishabh', 'Node.js', 'Backend', 85),
('s6', 'u_rishabh', 'Express.js', 'Backend', 85),
('s7', 'u_rishabh', 'REST & GraphQL APIs', 'Backend', 82),
('s8', 'u_rishabh', 'MongoDB', 'Database', 80),
('s9', 'u_rishabh', 'PostgreSQL', 'Database', 78),
('s10', 'u_rishabh', 'Git & GitHub', 'Tools & Other', 90),
('s11', 'u_rishabh', 'Docker', 'Tools & Other', 75),
('s12', 'u_rishabh', 'Vercel & AWS', 'Tools & Other', 80)
ON CONFLICT (id) DO NOTHING;

-- Initial Projects Seed
INSERT INTO projects (id, user_id, title, description, category, tags, image_url, live_url, github_url, featured) VALUES
('p1', 'u_rishabh', 'AI-Powered SaaS Dashboard', 'A real-time analytics and management platform built with Next.js App Router, Tailwind CSS, and AI data processing.', 'Full Stack', ARRAY['Next.js', 'TypeScript', 'Tailwind CSS', 'OpenAI'], 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', 'https://example.com', 'https://github.com', true),
('p2', 'u_rishabh', 'E-Commerce Experience', 'Modern e-commerce platform with fast cart management, Stripe checkout integration, and custom UI components.', 'Frontend', ARRAY['React', 'Tailwind CSS', 'Stripe', 'State Management'], 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', 'https://example.com', 'https://github.com', true),
('p3', 'u_rishabh', 'DevFlow Collaborative Hub', 'Developer platform for sharing code snippets, real-time discussions, and project showcasing.', 'Full Stack', ARRAY['Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS'], 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', 'https://example.com', 'https://github.com', true)
ON CONFLICT (id) DO NOTHING;

-- Initial Internships Seed
INSERT INTO internships (id, user_id, role, company, duration, description, certificate_url, offer_letter_url, technologies) VALUES
('i1', 'u_rishabh', 'Full Stack Web Developer Intern', 'TechCorp Solutions', '6 Months (Jan 2024 - Jun 2024)', 'Developed production-ready Next.js & React dashboards, integrated REST APIs, optimized PostgreSQL database queries, and implemented UI design systems.', 'https://example.com/certificate-techcorp.pdf', 'https://example.com/offer-letter-techcorp.pdf', ARRAY['Next.js', 'React', 'PostgreSQL', 'Tailwind CSS']),
('i2', 'u_rishabh', 'Frontend Engineer Intern', 'WebCraft Innovations', '3 Months (Sep 2023 - Nov 2023)', 'Built responsive client web applications, styled scalable UI components, integrated state management, and optimized web performance across browsers.', 'https://example.com/certificate-webcraft.pdf', 'https://example.com/offer-letter-webcraft.pdf', ARRAY['React', 'TypeScript', 'Redux Toolkit', 'Tailwind CSS'])
ON CONFLICT (id) DO NOTHING;
