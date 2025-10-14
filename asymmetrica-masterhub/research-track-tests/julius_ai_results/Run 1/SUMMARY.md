# Project Summary: Collatz x Taal Discovery Probe

## Context and Goals
- Built a synthetic 20k dataset with target proportions (Prime 30%, PowerOf2 20%, Composite 50%).
- Computed Collatz metrics (steps, time_to_peak_ratio).
- Mapped number classes to taals: Prime→Rupak(7), PowerOf2→Teentaal(16), Composite→Jhaptaal(10).
- Probed hypotheses H5–H8 and then pivoted to discovery to learn empirical regimes across domains.

## Pipeline Highlights
- Data construction: sampling primes, powers-of-two, and composites; computing Collatz metrics.
- Consensus placeholder simulated where missing to exercise prereg tests (z-scored).
- Preregistered tests run (ANOVA, Kruskal, pairwise Welch with BH).
- H5–H8 probe with time_to_peak and steps; permutation test for beat_count association.
- Discovery mode: weighted KMeans to derive empirical 3-regime structures for numbers (Collatz-weighted) and music (consensus-weighted).
- Regime alignment quantified via ARI/AMI and confusion matrix; regime centroids saved.

## Key Findings (Probe)
- Teentaal/PowerOf2 shows pure stabilization: time_to_peak_ratio near zero and minimal steps.
- Rupak/Prime shows more exploration than Teentaal; composites sit between (balanced optimization).
- Permutation ANOVA indicates beat_count strongly associates with Collatz metrics in the synthetic set.
- Empirical 3-regime structures differ across domains (low ARI/AMI), suggesting music emphasizes different dynamics than pure Collatz.

## Files Included
- synthetic_20k_dataset.csv, synthetic_counts.csv, synthetic_summaries.csv
- synthetic_global_tests.csv, synthetic_pairwise_tests.csv
- regime_centroids_numbers.csv, regime_centroids_music.csv
- SUMMARY.md (this file), MANIFEST.csv, CHECKSUMS.sha256

## Notes and Next Steps
- Replace simulated consensus with real values to fully validate H5–H8.
- Bootstrap CIs for category proportions and chi-square tests for number vs taal matching.
- Produce a formal HTML report with plots for sharing.

Generated: 2025-10-07T12:38:57.086648Z