import { authErrorCodes } from "@/lib/error-codes";
import { AppError } from "@/server/errors";
import { apiRoute } from "@/server/http";
import { findUser } from "@/server/services/users";
import { getRefreshTokenUser, startSession } from "@/server/session";

export const GET = apiRoute(async () => {
  const { id } = await getRefreshTokenUser();

  // Re-read the user so deleted accounts can't keep refreshing their session.
  const user = await findUser(id);
  if (!user) throw new AppError(authErrorCodes.USER_NOT_FOUND, 403);

  await startSession(user);
  return Response.json({ success: true, user });
});
