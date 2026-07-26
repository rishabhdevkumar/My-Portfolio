import { NextResponse } from "next/server";
import { ensureDatabaseTables, pool } from "@/lib/db";
import { Internship } from "@/lib/portfolio-data";

export async function POST(request: Request) {
  try {
    const internship: Internship = await request.json();
    await ensureDatabaseTables();

    const client = await pool.connect();
    try {
      const userRes = await client.query("SELECT id FROM users ORDER BY id ASC LIMIT 1");
      const userId = userRes.rows[0]?.id || 1;

      await client.query(
        `INSERT INTO internships (id, user_id, role, company, company_name, duration, description, certificate_url, offer_letter_url, technologies)
         VALUES ($1, $2, $3, $4, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE SET
          role = EXCLUDED.role,
          company = EXCLUDED.company,
          company_name = EXCLUDED.company_name,
          duration = EXCLUDED.duration,
          description = EXCLUDED.description,
          certificate_url = EXCLUDED.certificate_url,
          offer_letter_url = EXCLUDED.offer_letter_url,
          technologies = EXCLUDED.technologies`,
        [
          internship.id,
          userId,
          internship.role,
          internship.company,
          internship.duration,
          internship.description,
          internship.certificateUrl,
          internship.offerLetterUrl,
          internship.technologies,
        ]
      );
      return NextResponse.json({ success: true, message: "Internship saved in PostgreSQL." });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("POST /api/admin/internships error:", error);
    return NextResponse.json({ success: false, message: "Failed to save internship." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "Missing internship id" }, { status: 400 });
    }

    await ensureDatabaseTables();
    const client = await pool.connect();
    try {
      await client.query("DELETE FROM internships WHERE id = $1", [id]);
      return NextResponse.json({ success: true, message: "Internship deleted from PostgreSQL." });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("DELETE /api/admin/internships error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete internship." }, { status: 500 });
  }
}
