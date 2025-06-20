import { prisma } from "@kbnet/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";
import { bearer } from "better-auth/plugins";

const restrictedUsernames = [
  "admin",
  "administrator",
  "settings",
  "config",
  "profile",
  "login",
  "logout",
  "register",
  "signup",
  "dashboard",
  "home",
  "account",
  "user",
  "users",
  "support",
  "help",
  "contact",
  "about",
  "privacy",
  "terms",
  "legal",
  "policy",
  "docs",
  "documentation",
  "api",
  "developer",
  "developers",
  "team",
  "teams",
  "staff",
  "moderator",
  "moderators",
  "adminpanel",
];

const ENABLE_SIGNUP = process.env.ENABLE_SIGNUP === "true";
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      mapProfileToUser: (profile) => ({
        name: profile.name || profile.login,
        email: profile.email,
        image: profile.avatar_url,
        username: profile.login.replaceAll("-", "_"),
        displayName: profile.name || profile.login,
      }),
      disableSignUp: !ENABLE_SIGNUP,
    },
  },
  plugins: [
    bearer(),
    username({
      usernameValidator: (username) => {
        if (restrictedUsernames.includes(username.toLowerCase())) {
          return false;
        }
        return /^[a-zA-Z0-9_]{3,30}$/.test(username);
      },
    }),
  ],
});
