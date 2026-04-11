import { connectDB } from "@/lib/db";
import { User } from "@/data/user";
import bcrypt from "bcrypt";
export async function getUser(email: string) {
  await connectDB();

  const user = await User.findOne({ email }); 

  if (!user) return null;

  return {
    user_id: user._id.toString(),
    username: user.username,
    email: user.email,
    name: user.name,
    passwordHash: user.passwordHash||null, 
  };
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

// chỉ thêm nếu có password
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
    console.error("🔥 FULL ERROR:", err);

  console.dir(err.errInfo?.details, { depth: null }); // 🔥 QUAN TRỌNG
    throw err;
  }
}
export async function updatePassword(
  user_id: string,
  password_hash: string
) {
  return await User.findByIdAndUpdate(user_id, {
    passwordHash: password_hash,
  });
}
export async function getUserById(user_id: string) {
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
}