import { publishDiscordWebhookMessages } from "open-scrapers-toolkit";
import { buildHealthAlertResult, runLibraryHealth } from "open-scrapers-toolkit";

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

if (!webhookUrl) {
  throw new Error("Set DISCORD_WEBHOOK_URL before running this example.");
}

const health = await runLibraryHealth({
  limit: 1,
});
const alerts = buildHealthAlertResult(health, "error,skipped");

if (alerts.records.length === 0) {
  console.log("No health alerts to publish.");
  process.exit(0);
}

await publishDiscordWebhookMessages(webhookUrl, alerts, {
  maxRecords: 5,
  maxEmbedsPerMessage: 5,
  titlePrefix: "[Health Alert]",
});

console.log(`Published ${alerts.records.length} health alert record(s) to Discord.`);
