import { NextResponse } from "next/server";
import { ensureDatabaseTables, pool } from "@/lib/db";
import { ProfileDetails } from "@/lib/portfolio-data";

export async function PUT(request: Request) {
  try {
    const profile: ProfileDetails = await request.json();
    await ensureDatabaseTables();

    const client = await pool.connect();
    try {
      // 1. Ensure columns exist on users table
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

      // 2. Fetch first user ID
      const userCheck = await client.query("SELECT id FROM users ORDER BY id ASC LIMIT 1");

      if (userCheck.rowCount === 0) {
        await client.query(
          `INSERT INTO users (
            name, title, bio, about, email, phone, location, avatar_url, github_url, linkedin_url, twitter_url, resume_url, years_experience, completed_projects
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [
            profile.name,
            profile.title,
            profile.bio,
            profile.about,
            profile.email,
            profile.phone,
            profile.location,
            profile.avatarUrl,
            profile.githubUrl,
            profile.linkedinUrl,
            profile.twitterUrl,
            profile.resumeUrl,
            profile.yearsExperience,
            profile.completedProjects,
          ]
        );
      } else {
        const userId = userCheck.rows[0].id;
        await client.query(
          `UPDATE users SET
            name = $1,
            title = $2,
            bio = $3,
            about = $4,
            email = $5,
            phone = $6,
            location = $7,
            avatar_url = $8,
            github_url = $9,
            linkedin_url = $10,
            twitter_url = $11,
            resume_url = $12,
            years_experience = $13,
            completed_projects = $14,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $15`,
          [
            profile.name,
            profile.title,
            profile.bio,
            profile.about,
            profile.email,
            profile.phone,
            profile.location,
            profile.avatarUrl,
            profile.githubUrl,
            profile.linkedinUrl,
            profile.twitterUrl,
            profile.resumeUrl,
            profile.yearsExperience,
            profile.completedProjects,
            userId,
          ]
        );
      }

      return NextResponse.json({ success: true, message: "Profile updated in PostgreSQL users table." });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("PUT /api/admin/profile error:", error);
    return NextResponse.json(
      { success: false, error: error.message || String(error) },
      { status: 500 }
    );
  }
}
