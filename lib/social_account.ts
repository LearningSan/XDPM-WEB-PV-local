import { SocialAccount } from "@/data/social_account";
export async function findSocial(provider: string, provider_id: string) {
  try {
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
  provider_email?: string,
  token?: string,
  token_expires_at?: Date
) {
  try {
    return await SocialAccount.create({
      user_id,
      provider,
      provider_id,
      provider_email,
      token,
      token_expires_at,
      linked_at: new Date(),
    });
  } catch (err) {
    console.error("createSocial error:", err);
    throw err;
  }
}
export async function findSocialByUserId(user_id: string) {
  try {
    const result = await SocialAccount.findOne({ user_id });

    return result?.provider || null;
  } catch (err) {
    console.error("findSocialByUserId error:", err);
    throw err;
  }
}


export async function upsertSocialAccount({
  user_id,
  provider,
  provider_id,
  provider_email,
  token,
  token_expires_at,
}: {
  user_id: string;
  provider: string;
  provider_id: string;
  provider_email?: string;
  token?: string;
  token_expires_at?: Date;
}) {
  return await SocialAccount.findOneAndUpdate(
    {
      provider,
      provider_id,
    },
    {
      $set: {
        user_id,
        provider,
        provider_id,
        provider_email,
        token,
        token_expires_at,
        linked_at: new Date(),
      },
    },
    {
      upsert: true,
      new: true,
    }
  );
}