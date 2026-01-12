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
          clientSecret: process.env.TODOIST_SECRET as string,
          authorizationUrl: process.env.TODOIST_OAUTH_URL,
          tokenUrl: process.env.TODOIST_TOKEN_URL,
          redirectURI: process.env.TODOIST_REDIRECT_URL,
          scopes: ["data:read_write"],
          getUserInfo: async (token) => {
            try {
              const res = await fetch(
                process.env.TODOIST_USERINFO_URL as string,
                {
                  headers: { Authorization: `Bearer ${token.accessToken}` },
                },
              );

              if (!res.ok) {
                console.error(res);
                return null;
              }

              const profile = await res.json();

              return {
                id: profile.id, // string
                name: profile.full_name || undefined,
                email: profile.email || undefined,
                image: profile.avatar_medium || undefined,
                emailVerified: true, // Todoist doesn’t provide verified, set true
              };
            } catch (err) {
              console.error("Failed to fetch Todoist user info", err);
              return null;
            }
          },
        },
      ],
    }),
  ],
});
