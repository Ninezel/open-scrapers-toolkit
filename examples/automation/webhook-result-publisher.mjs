import { postJsonWebhook, runScraperById } from "open-scrapers-toolkit";

const webhookUrl = process.env.RESULT_WEBHOOK_URL;

if (!webhookUrl) {
  throw new Error("Set RESULT_WEBHOOK_URL before running this example.");
}

const result = await runScraperById("bbc-world-news", {
  contactEmail: process.env.SCRAPERS_CONTACT_EMAIL,
  limit: 3,
});

await postJsonWebhook(webhookUrl, result);
console.log(`Published ${result.scraperId} to ${webhookUrl}.`);
