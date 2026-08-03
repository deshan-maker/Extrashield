import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** Get the current session inside a route handler (Node runtime, not edge). */
export async function getSession() {
  return getServerSession(authOptions);
}
