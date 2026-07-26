import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'postgres'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/portfolio`;

export const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5000,
});

let isInitialized = false;

export async function ensureDatabaseTables() {
  if (isInitialized) return;

  try {
    const client = await pool.connect();
    try {
      // 1. Ensure Base Users Table exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100),
          password VARCHAR(50),
          phone VARCHAR(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 2. Alter existing users table to add all Portfolio columns if missing
      await client.query(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS title VARCHAR(255) DEFAULT '',
        ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS about TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS github_url TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS linkedin_url TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS twitter_url TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS resume_url TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS years_experience INT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS completed_projects INT DEFAULT 0;
      `);

      // 3. Skills Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS skills (
          id VARCHAR(50) PRIMARY KEY,
          user_id INT,
          name VARCHAR(100) NOT NULL,
          category VARCHAR(50) NOT NULL,
          level INT NOT NULL DEFAULT 80,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 4. Projects Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id VARCHAR(50) PRIMARY KEY,
          user_id INT,
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
      `);

      // 5. Internships Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS internships (
          id VARCHAR(50) PRIMARY KEY,
          user_id INT,
          role VARCHAR(150) NOT NULL,
          company VARCHAR(150) NOT NULL,
          duration VARCHAR(100),
          description TEXT,
          certificate_url TEXT,
          offer_letter_url TEXT,
          technologies TEXT[],
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 6. Check if Rishabh user exists in 'users' table
      const userCheck = await client.query("SELECT id FROM users LIMIT 1");
      let userId = 1;

      if (userCheck.rowCount === 0) {
        const insertRes = await client.query(`
          INSERT INTO users (
            name, email, phone, title, bio, about, avatar_url, github_url, linkedin_url, twitter_url, resume_url, years_experience, completed_projects
          ) VALUES (
            'Rishabh',
            'rishabh@example.com',
            '+91 98765 43210',
            'Full-Stack Software Engineer & Web Architect',
            'Passionate developer creating modern, high-performance web applications with Next.js, React, Node.js, and modern CSS ecosystems.',
            'Hello! I''m Rishabh, a software engineer dedicated to building scalable web applications, beautiful user interfaces, and intuitive digital experiences. With expertise across frontend and backend technologies, I turn complex problems into clean, efficient code.',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            'https://github.com',
            'https://linkedin.com',
            'https://twitter.com',
            '#',
            4,
            24
          ) RETURNING id;
        `);
        userId = insertRes.rows[0].id;
      } else {
        userId = userCheck.rows[0].id;
      }

      // Seed Skills if empty
      const skillsCheck = await client.query("SELECT COUNT(*) FROM skills");
      if (parseInt(skillsCheck.rows[0].count) === 0) {
        await client.query(`
          INSERT INTO skills (id, user_id, name, category, level) VALUES
          ('s1', ${userId}, 'React.js', 'Frontend', 92),
          ('s2', ${userId}, 'Next.js', 'Frontend', 90),
          ('s3', ${userId}, 'TypeScript', 'Frontend', 88),
          ('s4', ${userId}, 'Tailwind CSS', 'Frontend', 95),
          ('s5', ${userId}, 'Node.js', 'Backend', 85),
          ('s6', ${userId}, 'Express.js', 'Backend', 85),
          ('s7', ${userId}, 'REST & GraphQL APIs', 'Backend', 82),
          ('s8', ${userId}, 'MongoDB', 'Database', 80),
          ('s9', ${userId}, 'PostgreSQL', 'Database', 78),
          ('s10', ${userId}, 'Git & GitHub', 'Tools & Other', 90),
          ('s11', ${userId}, 'Docker', 'Tools & Other', 75),
          ('s12', ${userId}, 'Vercel & AWS', 'Tools & Other', 80);
        `);
      }

      // Seed Projects if empty
      const projectsCheck = await client.query("SELECT COUNT(*) FROM projects");
      if (parseInt(projectsCheck.rows[0].count) === 0) {
        await client.query(`
          INSERT INTO projects (id, user_id, title, description, category, tags, image_url, live_url, github_url, featured) VALUES
          ('p1', ${userId}, 'AI-Powered SaaS Dashboard', 'A real-time analytics and management platform built with Next.js App Router, Tailwind CSS, and AI data processing.', 'Full Stack', ARRAY['Next.js', 'TypeScript', 'Tailwind CSS', 'OpenAI'], 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', 'https://example.com', 'https://github.com', true),
          ('p2', ${userId}, 'E-Commerce Experience', 'Modern e-commerce platform with fast cart management, Stripe checkout integration, and custom UI components.', 'Frontend', ARRAY['React', 'Tailwind CSS', 'Stripe', 'State Management'], 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', 'https://example.com', 'https://github.com', true),
          ('p3', ${userId}, 'DevFlow Collaborative Hub', 'Developer platform for sharing code snippets, real-time discussions, and project showcasing.', 'Full Stack', ARRAY['Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS'], 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', 'https://example.com', 'https://github.com', true);
        `);
      }

      // Seed Internships if empty
      const internshipsCheck = await client.query("SELECT COUNT(*) FROM internships");
      if (parseInt(internshipsCheck.rows[0].count) === 0) {
        await client.query(`
          INSERT INTO internships (id, user_id, role, company, duration, description, certificate_url, offer_letter_url, technologies) VALUES
          ('i1', ${userId}, 'Full Stack Web Developer Intern', 'TechCorp Solutions', '6 Months (Jan 2024 - Jun 2024)', 'Developed production-ready Next.js & React dashboards, integrated REST APIs, optimized PostgreSQL database queries, and implemented UI design systems.', 'https://example.com/certificate-techcorp.pdf', 'https://example.com/offer-letter-techcorp.pdf', ARRAY['Next.js', 'React', 'PostgreSQL', 'Tailwind CSS']),
          ('i2', ${userId}, 'Frontend Engineer Intern', 'WebCraft Innovations', '3 Months (Sep 2023 - Nov 2023)', 'Built responsive client web applications, styled scalable UI components, integrated state management, and optimized web performance across browsers.', 'https://example.com/certificate-webcraft.pdf', 'https://example.com/offer-letter-webcraft.pdf', ARRAY['React', 'TypeScript', 'Redux Toolkit', 'Tailwind CSS']);
        `);
      }

      isInitialized = true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.warn("PostgreSQL Connection / Table setup warning:", error);
  }
}
