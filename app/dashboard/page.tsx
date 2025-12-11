import { redirect } from "next/navigation";
import { getAuthToken } from "@/lib/auth";
import { sql } from "@/lib/db";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const token = await getAuthToken();

  if (!token) {
    redirect("/");
  }

  // Verify token and get current user
  const currentUser = await sql`SELECT * FROM users WHERE token = ${token}`;

  if (currentUser.length === 0) {
    redirect("/");
  }

  // Get all users except current user
  const users = await sql`
    SELECT id, email, created_at 
    FROM users 
    WHERE id != ${currentUser[0].id} 
    ORDER BY created_at DESC
  `;

  return (
    <DashboardClient
      currentUser={currentUser[0]}
      initialUsers={users}
      key={currentUser[0].id}
    />
  );
}
