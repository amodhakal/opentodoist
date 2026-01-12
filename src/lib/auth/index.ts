import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth } from "better-auth/plugins";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "todoist",
          clientId: process.env.TODOIST_ID as string,
          clientSecret: process.env.TODIST_SECRET as string,
          authorizationUrl: process.env.TODOIST_OAUTH_URL,
          tokenUrl: process.env.TODOIST_TOKEN_URL,
          scopes: ["data:read_write"],
        },
      ],
    }),
  ],
});
