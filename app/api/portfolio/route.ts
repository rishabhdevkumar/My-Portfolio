import { NextResponse } from "next/server";
import { ensureDatabaseTables, pool } from "@/lib/db";
import { DEFAULT_PORTFOLIO_DATA, PortfolioData } from "@/lib/portfolio-data";

export async function GET() {
  try {
    await ensureDatabaseTables();

    const client = await pool.connect();
    try {
      // 1. Fetch User details from 'users' table (first row)
      const userRes = await client.query("SELECT * FROM users ORDER BY id ASC LIMIT 1");

      if (userRes.rowCount === 0) {
        return NextResponse.json({
          dbConnected: true,
          data: DEFAULT_PORTFOLIO_DATA,
        });
      }

      const userRow = userRes.rows[0];
      const userId = userRow.id;

      // 2. Fetch Skills
      const skillsRes = await client.query(
        "SELECT id, name, category, level FROM skills WHERE user_id = $1 OR user_id IS NULL ORDER BY created_at ASC",
        [userId]
      );

      // 3. Fetch Projects
      const projectsRes = await client.query(
        "SELECT id, title, description, category, tags, image_url as \"imageUrl\", live_url as \"liveUrl\", github_url as \"githubUrl\", featured FROM projects WHERE user_id = $1 OR user_id IS NULL ORDER BY created_at ASC",
        [userId]
      );

      // 4. Fetch Internships
      const internshipsRes = await client.query(
        "SELECT id, role, company, duration, description, certificate_url as \"certificateUrl\", offer_letter_url as \"offerLetterUrl\", technologies FROM internships WHERE user_id = $1 OR user_id IS NULL ORDER BY created_at ASC",
        [userId]
      );

      const portfolioData: PortfolioData = {
        profile: {
          name: userRow.name || DEFAULT_PORTFOLIO_DATA.profile.name,
          title: userRow.title || DEFAULT_PORTFOLIO_DATA.profile.title,
          bio: userRow.bio || DEFAULT_PORTFOLIO_DATA.profile.bio,
          about: userRow.about || DEFAULT_PORTFOLIO_DATA.profile.about,
          email: userRow.email || DEFAULT_PORTFOLIO_DATA.profile.email,
          phone: userRow.phone || DEFAULT_PORTFOLIO_DATA.profile.phone,
          location: userRow.location || DEFAULT_PORTFOLIO_DATA.profile.location,
          avatarUrl: userRow.avatar_url || DEFAULT_PORTFOLIO_DATA.profile.avatarUrl,
          githubUrl: userRow.github_url || DEFAULT_PORTFOLIO_DATA.profile.githubUrl,
          linkedinUrl: userRow.linkedin_url || DEFAULT_PORTFOLIO_DATA.profile.linkedinUrl,
          twitterUrl: userRow.twitter_url || DEFAULT_PORTFOLIO_DATA.profile.twitterUrl,
          resumeUrl: userRow.resume_url || DEFAULT_PORTFOLIO_DATA.profile.resumeUrl,
          yearsExperience: userRow.years_experience ?? DEFAULT_PORTFOLIO_DATA.profile.yearsExperience,
          completedProjects: userRow.completed_projects ?? DEFAULT_PORTFOLIO_DATA.profile.completedProjects,
        },
        skills: skillsRes.rows,
        projects: projectsRes.rows.map((p) => ({
          ...p,
          tags: p.tags || [],
        })),
        internships: internshipsRes.rows.map((i) => ({
          ...i,
          technologies: i.technologies || [],
        })),
      };

      return NextResponse.json({
        dbConnected: true,
        data: portfolioData,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("GET /api/portfolio database query error:", error);
    return NextResponse.json({
      dbConnected: false,
      data: null,
      message: "Database unreachable, falling back to local storage data.",
    });
  }
}
