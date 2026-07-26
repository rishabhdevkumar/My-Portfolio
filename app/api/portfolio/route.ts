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
          data: {
            profile: {
              name: "",
              title: "",
              bio: "",
              about: "",
              email: "",
              phone: "",
              location: "",
              avatarUrl: "",
              githubUrl: "",
              linkedinUrl: "",
              twitterUrl: "",
              resumeUrl: "",
              yearsExperience: 0,
              completedProjects: 0,
            },
            skills: [],
            projects: [],
            internships: [],
            certificates: [],
          },
        });
      }

      const userRow = userRes.rows[0];
      const userId = userRow.id;

      // 2. Fetch Skills (supporting both skill_name/category_name/skill_level and name/category/level)
      const skillsRes = await client.query(
        `SELECT id,
                COALESCE(skill_name, name, '') as name,
                COALESCE(category_name, category, 'Other') as category,
                COALESCE(skill_level, level, 80) as level
         FROM skills
         WHERE user_id::text = $1::text OR user_id IS NULL
         ORDER BY created_at ASC`,
        [userId]
      );

      // 3. Fetch Projects (supporting project_image)
      const projectsRes = await client.query(
        `SELECT id,
                title,
                description,
                category,
                tags,
                COALESCE(project_image, image_url, '') as "imageUrl",
                live_url as "liveUrl",
                github_url as "githubUrl",
                featured
         FROM projects
         WHERE user_id::text = $1::text OR user_id IS NULL
         ORDER BY created_at ASC`,
        [userId]
      );

      // 4. Fetch Internships (supporting company_name, start_date, end_date)
      const internshipsRes = await client.query(
        `SELECT id,
                role,
                COALESCE(company_name, company, '') as company,
                CASE
                  WHEN start_date IS NOT NULL AND end_date IS NOT NULL THEN start_date || ' - ' || end_date
                  ELSE COALESCE(duration, '')
                END as duration,
                description,
                COALESCE(certificate_url, '') as "certificateUrl",
                COALESCE(offer_letter_url, '') as "offerLetterUrl",
                technologies
         FROM internships
         WHERE user_id::text = $1::text OR user_id IS NULL
         ORDER BY created_at ASC`,
        [userId]
      );

      // 5. Fetch Certificates (supporting certificate_pdf)
      const certificatesRes = await client.query(
        `SELECT id::text as id,
                title,
                COALESCE(issuer, '') as issuer,
                COALESCE(issue_date, '') as "issueDate",
                COALESCE(credential_id, '') as "credentialId",
                COALESCE(certificate_pdf, certificate_url, '') as "certificateUrl"
         FROM certificates
         WHERE user_id::text = $1::text OR user_id IS NULL
         ORDER BY created_at ASC`,
        [userId]
      );

      const portfolioData: PortfolioData = {
        profile: {
          name: userRow.name || "",
          title: userRow.title || "",
          bio: userRow.bio || "",
          about: userRow.about || "",
          email: userRow.email || "",
          phone: userRow.phone || "",
          location: userRow.location || "",
          avatarUrl: userRow.avatar_url || userRow.profile_image || "",
          githubUrl: userRow.github_url || "",
          linkedinUrl: userRow.linkedin_url || "",
          twitterUrl: userRow.twitter_url || "",
          resumeUrl: userRow.resume_url || "",
          yearsExperience: userRow.years_experience ?? 0,
          completedProjects: userRow.completed_projects ?? 0,
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
        certificates: certificatesRes.rows,
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
