import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "CUSTOMER" | "AGENT" | "ADMIN" | "CALL_CENTER";
    } & DefaultSession["user"];
  }

  interface User {
    role: "CUSTOMER" | "AGENT" | "ADMIN" | "CALL_CENTER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "CUSTOMER" | "AGENT" | "ADMIN" | "CALL_CENTER";
  }
}