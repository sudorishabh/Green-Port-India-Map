import { apiRoute, readJson } from "@/server/http";
import { createRateLimiter } from "@/server/rate-limit";
import { authenticateUser, parseCredentials } from "@/server/services/users";
import { startSession } from "@/server/session";

// Far stricter than the API default, to slow down password guessing.
const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
});

export const POST = apiRoute(
  async (request) => {
    const owner = await authenticateUser(
      parseCredentials(await readJson(request)),
    );
    const user = await startSession(owner);

    return Response.json({
      success: true,
      message: "Logged in successfully!",
      user,
    });
  },
  { rateLimiter: loginRateLimiter },
);
