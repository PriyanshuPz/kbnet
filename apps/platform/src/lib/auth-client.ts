import { createAuthClient } from "better-auth/react";
import {
  anonymousClient,
  customSessionClient,
} from "better-auth/client/plugins";
import { auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [anonymousClient(), customSessionClient<typeof auth>()],
});
