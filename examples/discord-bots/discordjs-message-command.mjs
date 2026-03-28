import { Client, GatewayIntentBits } from "discord.js";
import {
  buildDiscordChannelContext,
  buildDiscordScheduleProfile,
  buildDiscordScraperChoices,
  parseDiscordChannelIdList,
  resultToDiscordMessages,
  runScraperById,
} from "open-scrapers-toolkit";

const token = process.env.DISCORD_TOKEN;
const prefix = process.env.DISCORD_PREFIX ?? "!scrape";
const contactEmail = process.env.SCRAPERS_CONTACT_EMAIL;
const allowedNsfwChannelIds = parseDiscordChannelIdList(
  process.env.DISCORD_ALLOWED_NSFW_CHANNEL_IDS,
);
const weatherMode =
  process.env.DISCORD_WEATHER_MODE === "hourly"
    ? "hourly"
    : process.env.DISCORD_WEATHER_MODE === "custom"
      ? "custom"
      : "every-3-hours";
const weatherIntervalHours = Number.parseInt(
  process.env.DISCORD_WEATHER_INTERVAL_HOURS ?? "3",
  10,
);

if (!token) {
  throw new Error("Set DISCORD_TOKEN before starting the bot.");
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

function parseParams(parts) {
  return parts.reduce((accumulator, part) => {
    const index = part.indexOf("=");
    if (index === -1) {
      return accumulator;
    }

    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key && value) {
      accumulator[key] = value;
    }

    return accumulator;
  }, {});
}

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith(prefix)) {
    return;
  }

  const body = message.content.slice(prefix.length).trim();
  const [scraperId, ...paramParts] = body.split(/\s+/u);
  if (!scraperId) {
    const suggestions = buildDiscordScraperChoices({
      maxChoices: 5,
    })
      .map((choice) => `- \`${choice.value}\``)
      .join("\n");

    await message.reply(
      `Use \`!scrape <scraper-id> [key=value ...]\`, for example \`!scrape bbc-world-news\` or \`!scrape reddit-random-subreddit-image subreddit=wallpapers\`.\n${suggestions}`,
    );
    return;
  }

  await message.channel.sendTyping();

  try {
    const params = parseParams(paramParts);
    const result = await runScraperById(scraperId, {
      contactEmail,
      limit: scraperId === "open-meteo-city-forecast" ? 4 : 3,
      params,
    });
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
    const weatherProfile =
      scraperId === "open-meteo-city-forecast"
        ? buildDiscordScheduleProfile(weatherMode, {
            intervalHours: weatherIntervalHours,
          })
        : buildDiscordScheduleProfile("on-demand");
    const messages = resultToDiscordMessages(result, {
      channel,
      includeImages: true,
      maxRecords: 3,
      maxEmbedsPerMessage: 3,
      style: "auto",
      weatherCadenceHours: weatherProfile.weatherCadenceHours,
    });

    for (const payload of messages) {
      await message.reply(payload);
    }
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    const choices = buildDiscordScraperChoices({
      maxChoices: 5,
      search: scraperId,
    });
    const help = choices.length
      ? `\nClosest matches:\n${choices.map((choice) => `- \`${choice.value}\``).join("\n")}`
      : "";
    await message.reply(`Scraper run failed: ${text}${help}`);
  }
});

client.once("ready", () => {
  console.log(`Discord bot logged in as ${client.user?.tag ?? "unknown-user"}.`);
});

await client.login(token);
