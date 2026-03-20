import { fetchArbetsformedlingenJobs } from "./sources/arbetsformedlingen";

fetchArbetsformedlingenJobs().catch((error) => {
  console.error(error);
  process.exit(1);
});
