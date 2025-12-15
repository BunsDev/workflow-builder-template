import { eq } from "drizzle-orm";
import { isAiGatewayManagedKeysEnabled } from "@/lib/ai-gateway/config";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { accounts } from "@/lib/db/schema";

export type VercelTeam = {
  id: string;
  name: string;
  slug: string;
  avatar?: string;
  isPersonal: boolean;
};

type VercelTeamApiResponse = {
  id: string;
  name: string;
  slug: string;
  avatar?: string;
  limited?: boolean;
};

type VercelUserResponse = {
  id: string;
  username: string;
  name?: string;
  avatar?: string;
  defaultTeamId: string | null;
};

type UserInfo = {
  id: string;
  name: string;
  avatar: string;
  defaultTeamId: string | null;
};

/**
 * Fetch user info from Vercel API
 */
async function fetchUserInfo(accessToken: string): Promise<UserInfo | null> {
  const response = await fetch("https://api.vercel.com/v2/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) return null;

  const data = (await response.json()) as { user?: VercelUserResponse };
  if (!data.user) return null;

  return {
    id: data.user.id,
    name: data.user.name || data.user.username,
    // User avatar URL uses their userId
    avatar: `https://vercel.com/api/www/avatar?userId=${data.user.id}&s=64`,
    defaultTeamId: data.user.defaultTeamId,
  };
}

/**
 * Fetch teams from Vercel API and transform to our format
 */
async function fetchTeams(accessToken: string): Promise<VercelTeam[]> {
  const response = await fetch("https://api.vercel.com/v2/teams", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) return [];

  const data = (await response.json()) as { teams?: VercelTeamApiResponse[] };
  const teams: VercelTeam[] = [];

  for (const team of data.teams || []) {
    if (team.limited) continue;
    teams.push({
      id: team.id,
      name: team.name,
      slug: team.slug,
      // Team avatar URL uses teamId
      avatar: `https://vercel.com/api/www/avatar?teamId=${team.id}&s=64`,
      isPersonal: false,
    });
  }

  return teams;
}

/**
 * GET /api/ai-gateway/teams
 * Fetch Vercel teams for the authenticated user
 */
export async function GET(request: Request) {
  if (!isAiGatewayManagedKeysEnabled()) {
    return Response.json({ error: "Feature not enabled" }, { status: 403 });
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const account = await db.query.accounts.findFirst({
    where: eq(accounts.userId, session.user.id),
  });

  if (!account?.accessToken || account.providerId !== "vercel") {
    return Response.json(
      { error: "No Vercel account linked" },
      { status: 400 }
    );
  }

  try {
    // Fetch user info and teams in parallel
    const [userInfo, teams] = await Promise.all([
      fetchUserInfo(account.accessToken),
      fetchTeams(account.accessToken),
    ]);

    // Build final list: personal account first, then teams sorted alphabetically
    const allTeams: VercelTeam[] = [];

    // Add user's personal account (uses their user ID as team ID)
    if (userInfo) {
      allTeams.push({
        id: userInfo.id,
        name: userInfo.name,
        slug: userInfo.name.toLowerCase().replace(/\s+/g, "-"),
        avatar: userInfo.avatar,
        isPersonal: true,
      });
    }

    // Add teams sorted alphabetically
    const sortedTeams = teams.sort((a, b) => a.name.localeCompare(b.name));
    allTeams.push(...sortedTeams);

    return Response.json({ teams: allTeams });
  } catch (e) {
    console.error("[ai-gateway] Error fetching teams:", e);
    return Response.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}
