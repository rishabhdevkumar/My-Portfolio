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

      try {
        await client.query(`ALTER TABLE users ALTER COLUMN profile_image TYPE TEXT USING NULL;`);
      } catch (e) {
        // Ignore if already TEXT
      }

      // 2. Fetch first user ID
      const userCheck = await client.query("SELECT id FROM users ORDER BY id ASC LIMIT 1");

      if (userCheck.rowCount === 0) {
        await client.query(
          `INSERT INTO users (
            name, password, title, bio, about, email, phone, location, avatar_url, profile_image, github_url, linkedin_url, twitter_url, resume_url, years_experience, completed_projects
          ) VALUES ($1, '', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            profile.name || "",
            profile.title || "",
            profile.bio || "",
            profile.about || "",
            profile.email || "",
            profile.phone || "",
            profile.location || "",
            profile.avatarUrl || "",
            profile.avatarUrl || "", // $9: profile_image
            profile.githubUrl || "",
            profile.linkedinUrl || "",
            profile.twitterUrl || "",
            profile.resumeUrl || "",
            profile.yearsExperience || 0,
            profile.completedProjects || 0,
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
            profile_image = $9,
            github_url = $10,
            linkedin_url = $11,
            twitter_url = $12,
            resume_url = $13,
            years_experience = $14,
            completed_projects = $15,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $16`,
          [
            profile.name || "",
            profile.title || "",
            profile.bio || "",
            profile.about || "",
            profile.email || "",
            profile.phone || "",
            profile.location || "",
            profile.avatarUrl || "",
            profile.avatarUrl || "", // $9: profile_image
            profile.githubUrl || "",
            profile.linkedinUrl || "",
            profile.twitterUrl || "",
            profile.resumeUrl || "",
            profile.yearsExperience || 0,
            profile.completedProjects || 0,
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
