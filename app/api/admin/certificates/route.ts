import { NextResponse } from "next/server";
import { ensureDatabaseTables, pool } from "@/lib/db";
import { Certificate } from "@/lib/portfolio-data";

export async function POST(request: Request) {
  try {
    const cert: Certificate = await request.json();
    await ensureDatabaseTables();

    const client = await pool.connect();
    try {
      const userRes = await client.query("SELECT id FROM users ORDER BY id ASC LIMIT 1");
      const userId = userRes.rows[0]?.id || 1;

      await client.query(
        `INSERT INTO certificates (id, user_id, title, issuer, issue_date, credential_id, certificate_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          issuer = EXCLUDED.issuer,
          issue_date = EXCLUDED.issue_date,
          credential_id = EXCLUDED.credential_id,
          certificate_url = EXCLUDED.certificate_url`,
        [
          cert.id,
          userId,
          cert.title,
          cert.issuer,
          cert.issueDate || "",
          cert.credentialId || "",
          cert.certificateUrl || "",
        ]
      );
      return NextResponse.json({ success: true, message: "Certificate saved in PostgreSQL." });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("POST /api/admin/certificates error:", error);
    return NextResponse.json({ success: false, message: "Failed to save certificate." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "Missing certificate id" }, { status: 400 });
    }

    await ensureDatabaseTables();
    const client = await pool.connect();
    try {
      await client.query("DELETE FROM certificates WHERE id = $1", [id]);
      return NextResponse.json({ success: true, message: "Certificate deleted from PostgreSQL." });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("DELETE /api/admin/certificates error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete certificate." }, { status: 500 });
  }
}
