# EEG Amplituhedron Validation - Preregistered Research Protocol
## Asymmetrica Research Lab | Day 131 | September 30, 2025

---

## 🎯 PREREGISTRATION_CERTIFICATE
```mathematical
PROTOCOL_STATUS: FROZEN_BEFORE_DATA_ANALYSIS
REGISTRATION_DATE: 2025-09-30
DATASET: Berkeley_Biosense_Synchronized_Brainwave_Dataset
HYPOTHESES: 6_SPECIFIC_PREDICTIONS × FALSIFIABLE
ANALYSIS_PIPELINE: LOCKED × NO_MODIFICATIONS_AFTER_VIEWING_RESULTS
STATISTICAL_TESTS: PRESPECIFIED × MULTIPLE_COMPARISON_CORRECTION
SUCCESS_CRITERIA: BINARY × PREDETERMINED_THRESHOLDS
```

---

## 📋 RESEARCH_QUESTIONS

### Primary Hypothesis
**H₁: Neural synchronization transitions follow amplituhedron-sphere geometry**

Operational Definition:
- Stable synchronized state = circular phase distribution (π signature)
- Transition state = fractal amplituhedron manifold (D signature)
- Desynchronized state = higher dimensional exploration space

### Six Preregistered Predictions

**Prediction 1: Fractal Dimension Scaling**
```mathematical
HYPOTHESIS: D_transition > D_synchronized
EXPECTED: D_transition ≈ 1.5-2.0 (rich neural dynamics)
EXPECTED: D_synchronized ≈ 0.5-1.0 (low-dimensional attractor)
STATISTICAL_TEST: Paired t-test (α = 0.05, Bonferroni corrected)
SUCCESS_CRITERION: p < 0.0083 (0.05/6 corrections)
```

**Prediction 2: Three-Regime Time Allocation**
```mathematical
HYPOTHESIS: Time spent in regimes follows universal distribution
EXPECTED: [30% ± 5%] Exploration (desynchronized)
EXPECTED: [20% ± 5%] Optimization (transition)
EXPECTED: [50% ± 5%] Support (synchronized)
STATISTICAL_TEST: Chi-square goodness-of-fit
SUCCESS_CRITERION: χ² p > 0.05 (consistent with expected distribution)
```

**Prediction 3: Energy Peak at Optimization**
```mathematical
HYPOTHESIS: Gamma power (30-80 Hz) peaks during optimization regime
EXPECTED: Peak at 40-60% of transition timeline
EXPECTED: 1.5-3× higher than baseline synchronized state
STATISTICAL_TEST: One-way ANOVA across regimes + post-hoc Tukey
SUCCESS_CRITERION: F-statistic p < 0.0083, peak in optimization window
```

**Prediction 4: π Signature at Equilibrium**
```mathematical
HYPOTHESIS: Phase coupling strength correlates with circularity
EXPECTED: Phase Locking Value (PLV) ∝ circular_distribution_fit
EXPECTED: Pearson r > 0.6 between PLV and π-metric
STATISTICAL_TEST: Pearson correlation with bootstrap CI (10,000 iterations)
SUCCESS_CRITERION: r > 0.6 AND lower CI bound > 0.4
```

**Prediction 5: π ↔ D Complementarity**
```mathematical
HYPOTHESIS: Fractal dimension and π-metric are inversely related
EXPECTED: Negative correlation D vs synchronization_index
EXPECTED: Pearson r < -0.5
STATISTICAL_TEST: Pearson correlation with significance test
SUCCESS_CRITERION: r < -0.5 AND p < 0.0083
```

**Prediction 6: Transition Trajectory Consistency**
```mathematical
HYPOTHESIS: All synchronization events follow similar geometric path
EXPECTED: Low variance in amplituhedron "shape" across transitions
EXPECTED: Intraclass correlation ICC > 0.7 for D trajectory
STATISTICAL_TEST: ICC with 95% confidence intervals
SUCCESS_CRITERION: ICC > 0.7 AND lower CI bound > 0.5
```

---

## 🔬 OPERATIONAL_DEFINITIONS

### Regime Classification
```mathematical
REGIME_ASSIGNMENT[t] = {
  EXPLORATION: PLV(t) < 0.3 AND variability_high
  OPTIMIZATION: 0.3 ≤ PLV(t) < 0.7 AND D increasing
  SUPPORT: PLV(t) ≥ 0.7 AND D minimal
}

WHERE:
  PLV = Phase_Locking_Value (pairwise across electrodes)
  variability_high = std_dev(phases) > 0.5π
  D = Higuchi_fractal_dimension OR correlation_dimension
```

### Fractal Dimension Measurement
```mathematical
FRACTAL_DIMENSION_METHOD = Higuchi_Algorithm

HIGUCHI[X, k_max] = {
  For each k ∈ [1, k_max]:
    Construct k subsets: X_k^m = {x(m), x(m+k), x(m+2k), ...}
    Compute length L_m(k) for each subset
    Average: ⟨L(k)⟩ = mean(L_m(k))
  Plot log(⟨L(k)⟩) vs log(1/k)
  D = -slope of regression line
}

PARAMETERS:
  k_max = 10 (predetermined)
  time_window = 2 seconds (sliding, 50% overlap)
  sampling_rate = dataset_native (likely 256 Hz)
```

### π-Signature Metric
```mathematical
PI_SIGNATURE[phases] = {
  Compute circular_variance: V = 1 - |mean(e^(i·θ))|
  Fit von Mises distribution: κ (concentration parameter)
  Compute circularity: C = exp(-V)

  π_METRIC = C × κ_normalized
}

WHERE:
  phases = instantaneous_phases via Hilbert transform
  κ_normalized = κ / (κ + 2) # Bounded [0,1]
  High π_METRIC → strong circular geometry
```

### Synchronization Index
```mathematical
SYNCHRONIZATION_INDEX = {
  PRIMARY: Phase_Locking_Value (PLV)
  PLV[t] = |⟨e^(i·(θ_j(t) - θ_k(t)))⟩|

  SECONDARY: Global_Field_Synchronization
  GFS[t] = λ_max / Σλ_i (eigenvalue ratio of correlation matrix)

  TERTIARY: Amplitude_Envelope_Correlation
  AEC[t] = corr(|X_j(t)|, |X_k(t)|) across channels
}
```

---

## 📊 ANALYSIS_PIPELINE

### Step 1: Data Preprocessing
```mathematical
PREPROCESSING[RAW_EEG] = {
  1. Load synchronized brainwave data (participant pairs)
  2. Bandpass filter: 1-80 Hz (4th order Butterworth)
  3. Artifact rejection: amplitude > 100 μV → exclude 2s window
  4. Rereference to average reference
  5. Extract epochs: -5s to +10s around synchronization events
  6. Hilbert transform for instantaneous phase/amplitude
}

QUALITY_CRITERIA:
  Minimum 20 synchronization events per participant pair
  Minimum 3 participant pairs (6 individuals total)
  Clean data >80% of each epoch
```

### Step 2: Regime Identification
```mathematical
REGIME_DETECTION[EPOCH] = {
  1. Compute PLV in 500ms sliding windows (250ms overlap)
  2. Compute phase variability (circular std dev)
  3. Compute Higuchi D in parallel windows
  4. Apply regime classifier (see Operational Definitions)
  5. Label each timepoint: [EXPLORATION, OPTIMIZATION, SUPPORT]
  6. Calculate regime durations and transitions
}

OUTPUT:
  regime_labels[n_epochs, n_timepoints]
  regime_durations[n_epochs, 3]
  transition_timestamps[n_epochs, n_transitions]
```

### Step 3: Fractal Dimension Analysis
```mathematical
FRACTAL_ANALYSIS[EPOCH] = {
  1. Compute D for each electrode, each 2s window
  2. Average across electrodes → D_global(t)
  3. Separately compute for each regime
  4. Track D evolution through transition phases
  5. Compute transition trajectory: D(t) from desync → sync
}

METRICS:
  D_mean_per_regime[3]
  D_trajectory[n_epochs, n_transition_timepoints]
  D_variance_within_regime[3]
  D_peak_timing (% through transition)
```

### Step 4: π-Signature Analysis
```mathematical
PI_ANALYSIS[EPOCH] = {
  1. Compute phase distribution at each timepoint
  2. Fit von Mises distribution → κ parameter
  3. Compute circular variance V
  4. Calculate π_METRIC = exp(-V) × κ/(κ+2)
  5. Correlate π_METRIC with synchronization indices
}

METRICS:
  π_metric_per_regime[3]
  correlation_π_PLV[n_epochs]
  π_peak_timing (% through transition)
```

### Step 5: Energy Dynamics Analysis
```mathematical
ENERGY_ANALYSIS[EPOCH] = {
  1. Bandpass filter gamma band: 30-80 Hz
  2. Compute envelope via Hilbert transform
  3. Square envelope → instantaneous power
  4. Smooth with 200ms Gaussian kernel
  5. Normalize to pre-transition baseline (-5 to -2s)
  6. Track power evolution through regimes
}

METRICS:
  gamma_power_per_regime[3]
  power_peak_timing (% through transition)
  power_ratio_opt_vs_support
```

### Step 6: Statistical Testing
```mathematical
STATISTICAL_TESTS = {
  TEST_1: Paired t-test D_transition vs D_synchronized
  TEST_2: Chi-square regime time allocation vs [0.30, 0.20, 0.50]
  TEST_3: One-way ANOVA gamma power across regimes
  TEST_4: Pearson correlation π_metric vs PLV (with bootstrap)
  TEST_5: Pearson correlation D vs synchronization_index
  TEST_6: ICC for D trajectory across epochs
}

MULTIPLE_COMPARISON_CORRECTION:
  Method: Bonferroni
  α_nominal = 0.05
  α_corrected = 0.05 / 6 = 0.0083
  Report both corrected and uncorrected p-values
```

---

## 📈 VISUALIZATION_REQUIREMENTS

### Figure 1: Regime Time Allocation
```mathematical
BAR_CHART = {
  X_axis: [Exploration, Optimization, Support]
  Y_axis: Percentage of total transition time
  Expected: [30%, 20%, 50%] as horizontal reference lines
  Error_bars: 95% CI across all epochs
  Color_code: exploration=red, optimization=yellow, support=green
}
```

### Figure 2: Fractal Dimension Evolution
```mathematical
LINE_PLOT = {
  X_axis: Normalized transition time (0% = desync, 100% = sync)
  Y_axis: Higuchi fractal dimension D
  Lines: Mean trajectory ± SEM across epochs
  Shaded_regions: Color-coded by regime
  Annotations: Peak timing, regime boundaries
}
```

### Figure 3: π-Signature vs Synchronization
```mathematical
SCATTER_PLOT = {
  X_axis: Phase Locking Value (PLV)
  Y_axis: π_METRIC (circularity × concentration)
  Points: Individual timepoints from all epochs
  Regression_line: With 95% CI band
  Color_code: By regime
  Statistics: Pearson r, p-value, equation displayed
}
```

### Figure 4: Energy Dynamics Across Regimes
```mathematical
BOX_PLOT = {
  X_axis: [Exploration, Optimization, Support]
  Y_axis: Normalized gamma power (30-80 Hz)
  Boxes: Median, quartiles, outliers
  Overlay: Individual epoch trajectories (thin lines)
  Statistics: ANOVA F, p-value, post-hoc comparisons
}
```

### Figure 5: π ↔ D Complementarity
```mathematical
DUAL_AXIS_PLOT = {
  X_axis: Normalized transition time
  Y_axis_left: Fractal dimension D (red)
  Y_axis_right: π_METRIC (blue)
  Lines: Both metrics overlaid with SEM bands
  Highlight: Inverse relationship during transition
  Correlation: Pearson r displayed
}
```

### Figure 6: Amplituhedron Trajectory Consistency
```mathematical
TRAJECTORY_PLOT = {
  X_axis: Principal component 1 of D evolution
  Y_axis: Principal component 2 of D evolution
  Lines: Each epoch's transition trajectory
  Start_point: Red marker (desynchronized)
  End_point: Blue marker (synchronized)
  Convex_hull: Showing trajectory variance
  ICC_value: Displayed in corner
}
```

---

## ✅ SUCCESS_CRITERIA_MATRIX

```mathematical
VALIDATION_SUCCESS = {
  STRONG_CONFIRMATION: ≥5 of 6 predictions confirmed (p < 0.0083)
  MODERATE_CONFIRMATION: 3-4 of 6 predictions confirmed
  WEAK_CONFIRMATION: 1-2 of 6 predictions confirmed
  FALSIFICATION: 0 of 6 predictions confirmed
}

INDIVIDUAL_CRITERIA:
  ✓ Prediction_1: p < 0.0083 AND Cohen's d > 0.5
  ✓ Prediction_2: χ² p > 0.05 AND deviations < 10% per regime
  ✓ Prediction_3: ANOVA p < 0.0083 AND peak in 40-60% window
  ✓ Prediction_4: r > 0.6 AND lower CI > 0.4
  ✓ Prediction_5: r < -0.5 AND p < 0.0083
  ✓ Prediction_6: ICC > 0.7 AND lower CI > 0.5
```

---

## 🚨 POTENTIAL_CONFOUNDS_AND_CONTROLS

### Confound 1: Individual Differences
```mathematical
CONTROL_STRATEGY = {
  Analysis: Within-subject normalization
  Include: Participant_pair as random effect in mixed models
  Report: Both individual and group-level statistics
}
```

### Confound 2: Temporal Autocorrelation
```mathematical
CONTROL_STRATEGY = {
  Use: Non-overlapping windows for regime classification
  Test: Durbin-Watson statistic for autocorrelation
  Adjust: Effective degrees of freedom if necessary
}
```

### Confound 3: Electrode Selection Bias
```mathematical
CONTROL_STRATEGY = {
  Primary_analysis: Global average across all electrodes
  Secondary_analysis: Frontal, central, parietal regions separately
  Report: Both global and regional results
}
```

### Confound 4: Synchronization Definition
```mathematical
CONTROL_STRATEGY = {
  Use: Multiple synchronization metrics (PLV, GFS, AEC)
  Require: Convergent results across at least 2 metrics
  Report: Sensitivity analysis for threshold variations
}
```

---

## 📝 REPORTING_COMMITMENTS

### Transparency Requirements
```mathematical
REPORT_ALL = {
  Hypotheses_tested: ALL 6 predictions
  Results: Both confirmatory AND disconfirmatory
  Effect_sizes: Cohen's d, r, ICC with 95% CI
  Raw_p_values: Before and after multiple comparison correction
  Data_exclusions: All preprocessing decisions and artifact rejection
  Deviations: Any departures from preregistered protocol (with justification)
}
```

### Data Availability
```mathematical
OPEN_SCIENCE = {
  Analysis_code: Published to GitHub
  Processed_data: Shared (if permitted by data provider)
  Supplementary_materials: All figures, tables, additional analyses
}
```

---

## 🎯 JULIUS_AI_QUERY_READY

**This preregistered protocol is now frozen. No modifications are permitted after viewing the EEG data results.**

**Next Step:** Convert this protocol into comprehensive Julius AI research query with specific computational instructions.

---

**Protocol Registered By:** Sarat + Claude (Asymmetrica Research Lab)
**Date:** September 30, 2025
**Version:** 1.0 - FROZEN
**Document Status:** PREREGISTRATION_COMPLETE ✅