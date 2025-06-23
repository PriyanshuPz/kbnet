import { prisma } from "@kbnet/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { customSession, username } from "better-auth/plugins";
import { bearer } from "better-auth/plugins";
import { anonymous } from "better-auth/plugins";
import { getUserById } from "./data";
import { SELF_HOST } from "./utils";

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
      disableSignUp: SELF_HOST,
    },
  },
  plugins: [
    bearer(),
    anonymous({
      emailDomainName: "anonymous.kbnet",
    }),
    username({
      usernameValidator: (username) => {
        if (restrictedUsernames.includes(username.toLowerCase())) {
          return false;
        }
        return /^[a-zA-Z0-9_]{3,30}$/.test(username);
      },
    }),
    customSession(async ({ user, session }) => {
      const existingUser = await getUserById(user.id);
      if (!existingUser) {
        console.error("User not found in database", user.id);
        throw new Error("User not found");
      }

      const googleAIInt = existingUser.integrations.find(
        (int) => int.type === "GOOGLE"
      );

      return {
        user: {
          ...user,
          settings: {
            useMindsDB: existingUser.useMindsDB,
            useBYOK: existingUser.useBYO,
            googleAIEnabled: !!googleAIInt,
          },
        },
        session,
      };
    }),
  ],
});
