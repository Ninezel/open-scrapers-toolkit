import { Client, GatewayIntentBits } from "discord.js";
import { resultToDiscordMessages, runScraperById } from "open-scrapers-toolkit";

const token = process.env.DISCORD_TOKEN;
const prefix = process.env.DISCORD_PREFIX ?? "!scrape";
const contactEmail = process.env.SCRAPER_CONTACT_EMAIL;

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

  const scraperId = message.content.slice(prefix.length).trim();
  if (!scraperId) {
    await message.reply("Use `!scrape <scraper-id>`, for example `!scrape bbc-world-news`.");
    return;
  }

  await message.channel.sendTyping();

  try {
    const result = await runScraperById(scraperId, {
      contactEmail,
      limit: 3,
    });
    const messages = resultToDiscordMessages(result, {
      maxRecords: 3,
      maxEmbedsPerMessage: 3,
    });

    for (const payload of messages) {
      await message.reply(payload);
    }
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    await message.reply(`Scraper run failed: ${text}`);
  }
});

client.once("ready", () => {
  console.log(`Discord bot logged in as ${client.user?.tag ?? "unknown-user"}.`);
});

await client.login(token);
