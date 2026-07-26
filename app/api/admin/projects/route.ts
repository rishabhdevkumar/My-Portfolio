import { NextResponse } from "next/server";
import { ensureDatabaseTables, pool } from "@/lib/db";
import { Project } from "@/lib/portfolio-data";

export async function POST(request: Request) {
  try {
    const project: Project = await request.json();
    await ensureDatabaseTables();

    const client = await pool.connect();
    try {
      const userRes = await client.query("SELECT id FROM users ORDER BY id ASC LIMIT 1");
      const userId = userRes.rows[0]?.id || 1;

      await client.query(
        `INSERT INTO projects (id, user_id, title, description, category, tags, image_url, live_url, github_url, featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          tags = EXCLUDED.tags,
          image_url = EXCLUDED.image_url,
          live_url = EXCLUDED.live_url,
          github_url = EXCLUDED.github_url,
          featured = EXCLUDED.featured`,
        [
          project.id,
          userId,
          project.title,
          project.description,
          project.category,
          project.tags,
          project.imageUrl,
          project.liveUrl,
          project.githubUrl,
          project.featured,
        ]
      );
      return NextResponse.json({ success: true, message: "Project saved in PostgreSQL." });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("POST /api/admin/projects error:", error);
    return NextResponse.json({ success: false, message: "Failed to save project." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "Missing project id" }, { status: 400 });
    }

    await ensureDatabaseTables();
    const client = await pool.connect();
    try {
      await client.query("DELETE FROM projects WHERE id = $1", [id]);
      return NextResponse.json({ success: true, message: "Project deleted from PostgreSQL." });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("DELETE /api/admin/projects error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete project." }, { status: 500 });
  }
}
