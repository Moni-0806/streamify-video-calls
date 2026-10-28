import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STEAM_API_KEY;
const apiSecret = process.env.STEAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Stream API key or Secret is missing");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  const streamUser = { ...userData };
  if (typeof streamUser.image === "string" && /^data:/i.test(streamUser.image)) {
    delete streamUser.image;
  }

  await streamClient.upsertUsers([streamUser]);
  return streamUser;
};

export const generateStreamToken = (userId) => {
  if (!apiKey || !apiSecret) {
    throw new Error("Stream API credentials are not configured");
  }
  return streamClient.createToken(userId.toString());
};

export const sendStreamUserEvent = async (userId, event) => {
  return streamClient.sendUserCustomEvent(userId, event);
};
