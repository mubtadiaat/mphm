import { POST as authLoginPost } from "@/app/api/auth/login/route";

export async function POST(req: any) {
  return authLoginPost(req);
}
