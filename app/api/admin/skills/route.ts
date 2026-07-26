import { NextResponse } from "next/server";
import { ensureDatabaseTables, pool } from "@/lib/db";
import { Skill } from "@/lib/portfolio-data";

export async function POST(request: Request) {
  try {
    const skill: Skill = await request.json();
    await ensureDatabaseTables();

    const client = await pool.connect();
    try {
      const userRes = await client.query("SELECT id FROM users ORDER BY id ASC LIMIT 1");
      const userId = userRes.rows[0]?.id || 1;

      await client.query(
        `INSERT INTO skills (id, user_id, name, category, level)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          level = EXCLUDED.level`,
        [skill.id, userId, skill.name, skill.category, skill.level]
      );
      return NextResponse.json({ success: true, message: "Skill saved in PostgreSQL." });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("POST /api/admin/skills error:", error);
    return NextResponse.json({ success: false, message: "Failed to save skill." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "Missing skill id" }, { status: 400 });
    }

    await ensureDatabaseTables();
    const client = await pool.connect();
    try {
      await client.query("DELETE FROM skills WHERE id = $1", [id]);
      return NextResponse.json({ success: true, message: "Skill deleted from PostgreSQL." });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("DELETE /api/admin/skills error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete skill." }, { status: 500 });
  }
}
