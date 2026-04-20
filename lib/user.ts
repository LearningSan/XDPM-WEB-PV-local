import { connectDB } from "@/lib/db";
import { User } from "@/data/user";
import bcrypt from "bcrypt";

export async function getUser(email: string) {
  try {
    await connectDB();

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) return null;

    return {
      user_id: user._id.toString(),
      username: user.username,
      email: user.email,
      name: user.name,
      passwordHash: user.passwordHash || null,
    };
  } catch (error) {
    console.error("getUser error:", error);
    throw error;
  }
}

export async function createUser({
  email,
  password = null,
  name,
  avatar = "",
}: {
  email: string;
  password?: string | null;
  name: string;
  avatar?: string;
}) {
  try {
    await connectDB();

    if (!email) {
      throw new Error("Email is required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return await getUser(email);

    const userData: any = {
      username: email.split("@")[0],
      email,
      name,
      avatar,
      bio: "",
      location: "",
    };

    if (password) {
      userData.passwordHash = await bcrypt.hash(password, 10);
    }

    const newUser = await User.create(userData);

    return {
      user_id: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      username: newUser.username,
      passwordHash: newUser.passwordHash || null,
    };
  } catch (err: any) {
    console.error("🔥 createUser error:", err);
    console.dir(err.errInfo?.details, { depth: null });
    throw err;
  }
}

export async function updatePassword(user_id: string, password_hash: string) {
  try {
    await connectDB();

    return await User.findByIdAndUpdate(user_id, {
      passwordHash: password_hash,
    });
  } catch (error) {
    console.error("updatePassword error:", error);
    throw error;
  }
}

export async function getUserById(user_id: string) {
  try {
    await connectDB();

    if (!user_id) return null;

    const user = await User.findById(user_id);
    if (!user) return null;

    return {
      user_id: user._id.toString(),
      username: user.username,
      email: user.email,
      name: user.name,
      passwordHash: user.passwordHash || null,
      avatar: user.avatar || "",
      bio: user.bio || "",
      location: user.location || "",
    };
  } catch (error) {
    console.error("getUserById error:", error);
    throw error;
  }
}

export async function activateUser(userId: string): Promise<void> {
  try {
    await connectDB();

    await User.updateOne(
      {
        _id: userId,
        $or: [
          { status: { $ne: "ACTIVE" } },
          { email_verified: { $ne: true } },
        ],
      },
      {
        $set: {
          status: "ACTIVE",
          email_verified: true,
        },
      }
    );
  } catch (error) {
    console.error("activateUser error:", error);
    throw new Error("Failed to activate user");
  }
}