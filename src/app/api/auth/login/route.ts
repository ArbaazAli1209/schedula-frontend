import { accounts, toPublicUser } from "@/lib/mock-data/users";

type LoginBody = { email?: string; password?: string };

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return Response.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  const account = accounts.find((item) => item.email.toLowerCase() === email);
  if (!account || account.password !== password) {
    return Response.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  const user = toPublicUser(account);
  // Demo-only token: a real backend would issue a signed session/JWT.
  const token = `mock-token.${account.id}.${Date.now()}`;

  return Response.json({ data: { user, token } });
}
