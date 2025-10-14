Comprehensive summary of findings:

Objective

Test the center-seeking hypothesis: whether even numbers with identical-prime Goldbach decompositions n = p + p show Collatz three-regime proportions closer to the universal center [30% exploration, 20% optimization, 50% integration] than controls (n as sum of distinct primes), using n ∈ [4, 500].
Methods

Collatz three-regime segmentation per n:
Exploration (R1): from start to global maximum index.
Optimization (R2): from peak to first time the sequence re-enters at or below n.
Integration (R3): remainder to 1.
Computed per-n proportions (R1, R2, R3) and center distance d = sqrt((R1-0.3)^2 + (R2-0.2)^2 + (R3-0.5)^2).
Additional scores:
Symmetry score = 1 − (max(R) − min(R)) to summarize balance.
Gravitational pull = 1 − d/d_max, where d_max is the farthest simplex corner’s distance from center.
Comparative statistics: Mann–Whitney U on center_distance with bootstrap CIs for mean and median differences. n_identical = 53, n_control = 196.
Key results

Center-seeking: Identical-prime numbers have significantly smaller center_distance than controls.
MWU p ≈ 1.06e-6.
Mean difference (identical − control) ≈ −0.115 with 95% bootstrap CI fully below 0.
Median difference likewise negative with 95% bootstrap CI below 0.
Regime proportions relative to [30, 20, 50]:
Identical-prime group shows higher Exploration and Optimization proportions and lower Integration on average, yielding a net move toward the center.
Bootstrap CIs around group means support that the identical-prime group is closer to 30-20-50 across regimes in aggregate.
Symmetry and pull:
Symmetry_score distribution shifts higher for identical-prime numbers, indicating more balanced allocation across regimes.
Gravitational_pull is higher for identical-prime numbers, consistent with stronger attraction toward the center.
Interpretation

The data support the center-seeking hypothesis: numbers with perfect prime balance (p + p) exhibit Collatz dynamics that align more closely with the proposed universal center [30, 20, 50].
This aligns with the broader framework where Collatz acts as a grounding mechanism: enhanced exploration/optimization without overextending integration appears to pull these sequences toward the universal regime proportions.
Robustness and sensitivity

Earlier sensitivity (limits 300 vs 500) preserved effect directions for regime shifts; the current center-distance result is statistically strong at limit 500.
Nonparametric testing and bootstrap CIs mitigate distributional assumptions.
Caveats

The regime definition (peak-based segmentation and first return below n) is principled but not unique; alternative operationalizations (e.g., derivative sign windows, plateau handling) could be tested.
Range limited to n ≤ 500; extension to higher n and stratification by magnitude would further validate generality.
Recommended next steps

Extend to n ≤ 5,000 or 10,000 with batched computation; verify effect stability across scales.
Try alternative regime delineations and confirm results.
Quantify effect sizes across bins of n and across residue classes mod small bases to check for confounds.
Formal model: logistic/ordinal models predicting near-center membership from identical-prime flag plus controls (log n, parity-depth features), with cross-validation.