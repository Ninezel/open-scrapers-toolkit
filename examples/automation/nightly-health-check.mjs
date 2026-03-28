import { buildHealthAlertResult, publishResultSnapshot, runLibraryHealth } from "open-scrapers-toolkit";

const health = await runLibraryHealth({
  limit: 1,
});

await publishResultSnapshot(health, "output/nightly-health-report.json", "all");

const alerts = buildHealthAlertResult(health, "error,skipped");
if (alerts.records.length > 0) {
  await publishResultSnapshot(alerts, "output/nightly-health-alerts.json", "json");
  console.log(`Saved ${alerts.records.length} alert record(s).`);
} else {
  console.log("No nightly health alerts were generated.");
}
