import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STEAM_API_KEY;
const apiSecret = process.env.STEAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Stream API key or Secret is missing");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
  }
};

export const generateStreamToken = (userId) => {
  if (!apiKey || !apiSecret) {
    throw new Error("Stream API credentials are not configured");
  }
  return streamClient.createToken(userId.toString());
};

export const getStreamUsersOnlineStatus = async (userIds) => {
  const { users } = await streamClient.queryUsers(
    { id: { $in: userIds } },
    [],
    { presence: true, limit: userIds.length }
  );

  return users.map(({ id, online }) => ({ id, online }));
};

export const sendStreamUserEvent = async (userId, event) => {
  return streamClient.sendUserCustomEvent(userId, event);
};
