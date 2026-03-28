import { Client, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import {
  buildDiscordChannelContext,
  buildDiscordScraperSlashCommandDefinition,
  parseDiscordChannelIdList,
  runScraperPromptToDiscordMessages,
} from "open-scrapers-toolkit/discord";

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;
const guildId = process.env.DISCORD_GUILD_ID;
const commandName = process.env.DISCORD_COMMAND_NAME ?? "scraper";
const contactEmail = process.env.SCRAPERS_CONTACT_EMAIL;
const allowedNsfwChannelIds = parseDiscordChannelIdList(
  process.env.DISCORD_ALLOWED_NSFW_CHANNEL_IDS,
);

if (!token) {
  throw new Error("Set DISCORD_TOKEN before starting the slash-command example.");
}

if (!applicationId || !guildId) {
  throw new Error(
    "Set DISCORD_APPLICATION_ID and DISCORD_GUILD_ID to register the guild slash command.",
  );
}

const command = buildDiscordScraperSlashCommandDefinition({
  commandName,
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

async function registerCommand() {
  const rest = new REST({ version: "10" }).setToken(token);

  await rest.put(Routes.applicationGuildCommands(applicationId, guildId), {
    body: [command],
  });

  console.log(`Registered /${command.name} for guild ${guildId}.`);
}

client.once(Events.ClientReady, () => {
  console.log(`Discord bot logged in as ${client.user?.tag ?? "unknown-user"}.`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== command.name) {
    return;
  }

  const question = interaction.options.getString("question", true);
  const limit = interaction.options.getInteger("limit") ?? 3;

  await interaction.deferReply();

  try {
    const channel = buildDiscordChannelContext(
      {
        id: interaction.channel?.id,
        name:
          interaction.channel &&
          "name" in interaction.channel &&
          typeof interaction.channel.name === "string"
            ? interaction.channel.name
            : undefined,
        nsfw:
          interaction.channel &&
          "nsfw" in interaction.channel &&
          interaction.channel.nsfw === true,
      },
      {
        nsfwEnabledChannelIds: allowedNsfwChannelIds,
      },
    );
    const execution = await runScraperPromptToDiscordMessages(question, {
      channel,
      contactEmail,
      includeImages: true,
      limit,
      maxEmbedsPerMessage: 3,
      maxRecords: limit,
      style: "auto",
    });
    const [firstMessage, ...extraMessages] = execution.messages;

    await interaction.editReply(firstMessage);

    for (const payload of extraMessages) {
      await interaction.followUp(payload);
    }
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    await interaction.editReply({
      content: `Scraper prompt failed: ${text}`,
      embeds: [],
    });
  }
});

await registerCommand();
await client.login(token);
