import { fetchArbetsformedlingenJobs } from "./sources/arbetsformedlingen";
import { fetchGreenhouseJobs } from "./sources/greenhouse";
import { fetchLeverJobs } from "./sources/lever";

async function main() {
  const results = [];

  results.push(await fetchArbetsformedlingenJobs());
  results.push(await fetchGreenhouseJobs());
  results.push(await fetchLeverJobs());

  console.log("\nSammanfattning:");
  for (const result of results) {
    console.log(
      `${result.source}: ${result.fetched} hämtade, ${result.written} skrivna till databasen.`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
