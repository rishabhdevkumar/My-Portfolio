import { Pool, PoolConfig } from "pg";

const hasValidConnectionString =
  process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes("your_password");

const poolConfig: PoolConfig = hasValidConnectionString
  ? {
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  }
  : {
    host: process.env.DB_HOST || process.env.POSTGRES_HOST || "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    user: process.env.DB_USER || process.env.POSTGRES_USER || "postgres",
    password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || "",
    database: process.env.DB_NAME || process.env.POSTGRES_DB || "portfolio",
    connectionTimeoutMillis: 5000,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  };

// Prevent multiple pool instances in development due to Next.js Fast Refresh / Hot Reloading
const globalForPg = globalThis as unknown as { pool: Pool | undefined };

export const pool: Pool =
  globalForPg.pool ?? new Pool(poolConfig);

if (process.env.NODE_ENV !== "production") {
  globalForPg.pool = pool;
}

export default pool;

let isInitialized = false;

export async function ensureDatabaseTables() {
  if (isInitialized) return;

  try {
    const client = await pool.connect();
    try {
      // 1. Ensure Base Users Table exists & migrate columns
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100),
          password VARCHAR(50),
          phone VARCHAR(20),
          location VARCHAR(150) DEFAULT '',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        ALTER TABLE users
        ALTER COLUMN password DROP NOT NULL,
        ALTER COLUMN password SET DEFAULT '',
        ADD COLUMN IF NOT EXISTS title VARCHAR(255) DEFAULT '',
        ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS about TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS location VARCHAR(150) DEFAULT '',
        ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS profile_image TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS github_url TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS linkedin_url TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS twitter_url TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS resume_url TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS years_experience INT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS completed_projects INT DEFAULT 0;
      `);

      // Ensure profile_image column type is TEXT (in case it was previously created as TIMESTAMP in pgAdmin)
      try {
        await client.query(`ALTER TABLE users ALTER COLUMN profile_image TYPE TEXT USING NULL;`);
      } catch (e) {
        // Ignore if already TEXT
      }

      // 2. Skills Table & migrations (supporting skill_name, category_name, skill_level)
      await client.query(`
        CREATE TABLE IF NOT EXISTS skills (
          id VARCHAR(50) PRIMARY KEY,
          user_id INT,
          name VARCHAR(100),
          category VARCHAR(50),
          level INT DEFAULT 80,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        ALTER TABLE skills
        ADD COLUMN IF NOT EXISTS skill_name VARCHAR(100),
        ADD COLUMN IF NOT EXISTS category_name VARCHAR(50),
        ADD COLUMN IF NOT EXISTS skill_level INT DEFAULT 80,
        ADD COLUMN IF NOT EXISTS name VARCHAR(100),
        ADD COLUMN IF NOT EXISTS category VARCHAR(50),
        ADD COLUMN IF NOT EXISTS level INT DEFAULT 80;
      `);

      // 3. Projects Table & migrations (supporting project_image)
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

      await client.query(`
        ALTER TABLE projects
        ADD COLUMN IF NOT EXISTS project_image TEXT,
        ADD COLUMN IF NOT EXISTS image_url TEXT,
        ADD COLUMN IF NOT EXISTS tags TEXT[];
      `);

      // 4. Internships Table & migrations (supporting company_name, start_date, end_date, certificate_id)
      await client.query(`
        CREATE TABLE IF NOT EXISTS internships (
          id VARCHAR(50) PRIMARY KEY,
          user_id INT,
          role VARCHAR(150) NOT NULL,
          company VARCHAR(150),
          duration VARCHAR(100),
          description TEXT,
          certificate_url TEXT,
          offer_letter_url TEXT,
          technologies TEXT[],
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        ALTER TABLE internships
        ADD COLUMN IF NOT EXISTS company_name VARCHAR(150),
        ADD COLUMN IF NOT EXISTS company VARCHAR(150),
        ADD COLUMN IF NOT EXISTS certificate_id VARCHAR(100),
        ADD COLUMN IF NOT EXISTS start_date VARCHAR(50),
        ADD COLUMN IF NOT EXISTS end_date VARCHAR(50),
        ADD COLUMN IF NOT EXISTS duration VARCHAR(100),
        ADD COLUMN IF NOT EXISTS certificate_url TEXT,
        ADD COLUMN IF NOT EXISTS offer_letter_url TEXT,
        ADD COLUMN IF NOT EXISTS technologies TEXT[];
      `);

      // 5. Certificates Table & migrations (supporting certificate_pdf)
      await client.query(`
        CREATE TABLE IF NOT EXISTS certificates (
          id VARCHAR(50) PRIMARY KEY,
          user_id INT,
          title VARCHAR(150),
          issuer VARCHAR(150),
          issue_date VARCHAR(50),
          credential_id VARCHAR(100),
          certificate_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        ALTER TABLE certificates
        ADD COLUMN IF NOT EXISTS issuer VARCHAR(150) DEFAULT '',
        ADD COLUMN IF NOT EXISTS issue_date VARCHAR(50) DEFAULT '',
        ADD COLUMN IF NOT EXISTS credential_id VARCHAR(100) DEFAULT '',
        ADD COLUMN IF NOT EXISTS certificate_pdf TEXT,
        ADD COLUMN IF NOT EXISTS certificate_url TEXT;
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

/**
 * Dynamic Database Fetch Helpers
 * These functions perform live SQL queries against your PostgreSQL database server.
 */

export async function getUsersFromDb() {
  await ensureDatabaseTables();
  const res = await pool.query("SELECT * FROM users ORDER BY id ASC");
  return res.rows;
}

export async function getSkillsFromDb(userId?: number) {
  await ensureDatabaseTables();
  const res = userId
    ? await pool.query("SELECT * FROM skills WHERE user_id = $1 ORDER BY created_at ASC", [userId])
    : await pool.query("SELECT * FROM skills ORDER BY created_at ASC");
  return res.rows;
}

export async function getProjectsFromDb(userId?: number) {
  await ensureDatabaseTables();
  const res = userId
    ? await pool.query("SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at ASC", [userId])
    : await pool.query("SELECT * FROM projects ORDER BY created_at ASC");
  return res.rows;
}

export async function getInternshipsFromDb(userId?: number) {
  await ensureDatabaseTables();
  const res = userId
    ? await pool.query("SELECT * FROM internships WHERE user_id = $1 ORDER BY created_at ASC", [userId])
    : await pool.query("SELECT * FROM internships ORDER BY created_at ASC");
  return res.rows;
}

export async function getCertificatesFromDb(userId?: number) {
  await ensureDatabaseTables();
  const res = userId
    ? await pool.query("SELECT * FROM certificates WHERE user_id = $1 ORDER BY created_at ASC", [userId])
    : await pool.query("SELECT * FROM certificates ORDER BY created_at ASC");
  return res.rows;
}
