import {
  buildDiscordScheduleProfile,
  nextDiscordScheduledRunAt,
  resultToDiscordMessages,
  runScraperById,
  shouldRunDiscordSchedule,
} from "open-scrapers-toolkit";

const contactEmail = process.env.SCRAPERS_CONTACT_EMAIL;
const cadenceHours = Number.parseInt(process.env.DISCORD_WEATHER_INTERVAL_HOURS ?? "3", 10);
const lastRunAt = process.env.DISCORD_WEATHER_LAST_RUN_AT;
const weatherMode =
  process.env.DISCORD_WEATHER_MODE === "hourly"
    ? "hourly"
    : process.env.DISCORD_WEATHER_MODE === "custom"
      ? "custom"
      : "every-3-hours";
const scheduleProfile = buildDiscordScheduleProfile(weatherMode, {
  intervalHours: cadenceHours,
});

if (!scheduleProfile.schedule) {
  throw new Error("The scheduler example requires an interval-based weather mode.");
}

if (!shouldRunDiscordSchedule(lastRunAt, scheduleProfile.schedule)) {
  const nextRun = nextDiscordScheduledRunAt(
    scheduleProfile.schedule,
    lastRunAt ? new Date(lastRunAt) : new Date(),
  );
  console.log(`Skip for now. Next weather run: ${nextRun.toISOString()}`);
  process.exit(0);
}

const result = await runScraperById("open-meteo-city-forecast", {
  contactEmail,
  limit: 4,
});

const messages = resultToDiscordMessages(result, {
  includeImages: true,
  maxRecords: 3,
  style: "auto",
  weatherCadenceHours: scheduleProfile.weatherCadenceHours,
});

console.log(JSON.stringify(messages, null, 2));
