import { SocialAccount } from "@/data/social_account";
import { connectDB } from "./db";
export async function findSocial(provider: string, provider_id: string) {
  try {
    await connectDB();
    return await SocialAccount.findOne({
      provider,
      provider_id,
    });
  } catch (err) {
    console.error("findSocial error:", err);
    throw err;
  }
}
export async function createSocial(
  user_id: string,
  provider: string,
  provider_id: string,
  provider_email?: string

) {
  try {
    return await SocialAccount.create({
      user_id,
      provider,
      provider_id,
      provider_email,

      linked_at: new Date(),
    });
  } catch (err) {
    console.error("createSocial error:", err);
    throw err;
  }
}
export async function findSocialByUserId(user_id: string) {
  try {
    await connectDB();
    const result = await SocialAccount.findOne({ user_id });

    return result?.provider || null;
  } catch (err) {
    console.error("findSocialByUserId error:", err);
    throw err;
  }
}

