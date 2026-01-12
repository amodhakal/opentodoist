import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth } from "better-auth/plugins";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [
    // genericOAuth({
    //   config: [
    //     {
    //       providerId: "instagram",
    //       clientId: process.env.INSTAGRAM_CLIENT_ID as string,
    //       clientSecret: process.env.INSTAGRAM_CLIENT_SECRET as string,
    //       authorizationUrl: "https://api.instagram.com/oauth/authorize",
    //       tokenUrl: "https://api.instagram.com/oauth/access_token",
    //       scopes: ["user_profile", "user_media"],
    //     },
    //   ],
    // }),
  ],
});
