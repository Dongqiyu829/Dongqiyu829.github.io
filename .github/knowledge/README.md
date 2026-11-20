# Reviewing a Pages index candidate

After a successful production Pages deployment, **Check course index after Pages** compares the allowlisted pages with their source at the deployed commit. A successful check attaches a three-day artifact named for the run ID and attempt. It contains the index, manifest, READY marker and receipt. The PR test uses synthetic responses and creates no Actions artifact.

Before selecting a candidate, check that it comes from the successful production workflow run for this repository. Match the receipt's deployment ID, commit and status ID to the latest successful Pages deployment. Compare the SHA-256 of the exact index and manifest bytes with the run summary, the receipt and the READY marker (manifest hash). Recheck the release immediately before switching. On a mismatch, keep the previously selected package and continue checking source freshness before answering. Selection and publication take place separately from this workflow.
