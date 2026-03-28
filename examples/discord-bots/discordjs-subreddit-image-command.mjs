import { Client, GatewayIntentBits } from "discord.js";
import {
  buildDiscordChannelContext,
  parseDiscordChannelIdList,
  resultToDiscordMessages,
  runScraperById,
} from "open-scrapers-toolkit";

const token = process.env.DISCORD_TOKEN;
const prefix = process.env.DISCORD_PREFIX ?? "!subreddit";
const contactEmail = process.env.SCRAPERS_CONTACT_EMAIL;
const allowedNsfwChannelIds = parseDiscordChannelIdList(
  process.env.DISCORD_ALLOWED_NSFW_CHANNEL_IDS,
);

if (!token) {
  throw new Error("Set DISCORD_TOKEN before starting the bot.");
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith(prefix)) {
    return;
  }

  const subreddit = message.content.slice(prefix.length).trim();

  if (!subreddit) {
    await message.reply("Use `!subreddit <name>`, for example `!subreddit wallpapers`.");
    return;
  }

  await message.channel.sendTyping();

  try {
    const channel = buildDiscordChannelContext(
      {
        id: message.channel?.id,
        name: "name" in message.channel ? message.channel.name : undefined,
        nsfw: message.channel?.nsfw === true,
      },
      {
        nsfwEnabledChannelIds: allowedNsfwChannelIds,
      },
    );
    const result = await runScraperById("reddit-random-subreddit-image", {
      contactEmail,
      limit: 1,
      params: {
        allowNsfw: channel.allowNsfw ? "true" : "false",
        subreddit,
      },
    });

    const messages = resultToDiscordMessages(result, {
      channel,
      includeImages: true,
      maxRecords: 1,
    });

    for (const payload of messages) {
      await message.reply(payload);
    }
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    await message.reply(`Subreddit image lookup failed: ${text}`);
  }
});

await client.login(token);
