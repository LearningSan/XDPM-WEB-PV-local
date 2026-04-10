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
  await connectDB();

  const existingUser = await User.findOne({ email });
  if (existingUser) return getUser(email);

  let passwordHash = null;

  if (password) {
    passwordHash = await bcrypt.hash(password, 10);
  }

  const newUser = await User.create({
    username: email.split("@")[0],
    email,
    passwordHash,
    name,
    avatar,
    bio: "",
    location: "",
  });

  return {
    user_id: newUser._id.toString(),
    email: newUser.email,
    name: newUser.name,
    username: newUser.username,
    passwordHash: newUser.passwordHash||null,
  };
}
export async function updatePassword(
  user_id: string,
  password_hash: string
) {
  return await User.findByIdAndUpdate(user_id, {
    passwordHash: password_hash,
  });
}