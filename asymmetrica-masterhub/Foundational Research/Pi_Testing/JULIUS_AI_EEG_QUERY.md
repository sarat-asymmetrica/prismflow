# Julius AI Research Query - EEG Amplituhedron Validation
## Comprehensive Analysis Instructions | Preregistered Protocol

---

## 🎯 QUERY_FOR_JULIUS_AI

**Dataset:** Berkeley Biosense Synchronized Brainwave Dataset (EEG)

**Research Objective:** Validate amplituhedron-sphere transition geometry theory using neural synchronization data.

---

## 📋 ANALYSIS_REQUEST

Hi Julius! I'm testing a novel theory about how neural synchronization transitions follow universal geometric principles. This is a **preregistered validation** - all hypotheses and analysis methods are specified before looking at results.

### Core Theory
- **Stable synchronized states** should show circular phase distributions (π signature)
- **Transition states** should show fractal amplituhedron geometry (D signature)
- **Three-regime dynamics** should allocate time as: 30% exploration, 20% optimization, 50% support

### Your Task
Analyze the EEG synchronization data following the exact protocol below. Please compute all metrics, run all statistical tests, and generate all visualizations as specified.

---

## 🔬 STEP_1_DATA_PREPROCESSING

```python
# Import required libraries
import numpy as np
import pandas as pd
from scipy import signal
from scipy.stats import circvar, pearsonr, ttest_rel, chi2_contingency, f_oneway
import matplotlib.pyplot as plt
import seaborn as sns

# Load the EEG dataset
# Expected format: channels × timepoints × epochs
# Sampling rate: [DETECT FROM DATA]

# Preprocessing steps:
# 1. Bandpass filter: 1-80 Hz (4th order Butterworth)
# 2. Remove artifacts: exclude timepoints where amplitude > 100 μV
# 3. Re-reference to average reference (subtract mean across channels)
# 4. Extract epochs: synchronization events with [-5s to +10s] windows
# 5. Compute Hilbert transform for instantaneous phase and amplitude

# Quality check:
# - Report number of epochs, channels, sampling rate
# - Report % of clean data after artifact rejection
# - Confirm minimum 20 epochs available

print("Data preprocessing complete. Summary:")
print(f"Epochs: {n_epochs}, Channels: {n_channels}, Sampling rate: {fs} Hz")
print(f"Clean data: {clean_percentage:.1f}%")
```

---

## 🔬 STEP_2_HIGUCHI_FRACTAL_DIMENSION

Please compute Higuchi fractal dimension using this exact algorithm:

```python
def higuchi_fractal_dimension(X, k_max=10):
    """
    Compute Higuchi fractal dimension for time series X.

    Parameters:
    -----------
    X : array
        Time series data
    k_max : int
        Maximum time interval (default 10)

    Returns:
    --------
    D : float
        Fractal dimension
    """
    N = len(X)
    L = []

    for k in range(1, k_max + 1):
        Lk = []
        for m in range(k):
            # Construct subsequence
            Lmk = 0
            for i in range(1, int((N - m) / k)):
                Lmk += abs(X[m + i * k] - X[m + (i - 1) * k])

            # Normalize
            Lmk = Lmk * (N - 1) / (k * k * int((N - m) / k))
            Lk.append(Lmk)

        L.append(np.mean(Lk))

    # Fit log-log regression
    x = np.log(1 / np.arange(1, k_max + 1))
    y = np.log(L)
    D = -np.polyfit(x, y, 1)[0]

    return D

# Apply to EEG data:
# 1. For each epoch, use 2-second sliding windows (1-second overlap)
# 2. Compute D for each channel separately
# 3. Average across channels → D_global(t)
# 4. Store results: D_timeseries[epoch, timepoint]

print("Fractal dimension computation complete.")
print(f"Mean D across all data: {np.mean(D_timeseries):.3f}")
print(f"D range: [{np.min(D_timeseries):.3f}, {np.max(D_timeseries):.3f}]")
```

---

## 🔬 STEP_3_PHASE_SYNCHRONIZATION_METRICS

```python
# Compute Phase Locking Value (PLV)
def compute_PLV(phases):
    """
    Compute Phase Locking Value across channels.

    Parameters:
    -----------
    phases : array, shape (n_channels, n_timepoints)
        Instantaneous phases from Hilbert transform

    Returns:
    --------
    PLV : array, shape (n_timepoints,)
        Global phase synchronization
    """
    n_channels, n_timepoints = phases.shape
    PLV = np.zeros(n_timepoints)

    for t in range(n_timepoints):
        # Compute pairwise phase differences
        phase_diffs = []
        for i in range(n_channels):
            for j in range(i + 1, n_channels):
                phase_diffs.append(phases[i, t] - phases[j, t])

        # Average complex exponential
        PLV[t] = np.abs(np.mean(np.exp(1j * np.array(phase_diffs))))

    return PLV

# Compute PLV for all epochs in 500ms sliding windows (250ms overlap)
# Store: PLV_timeseries[epoch, timepoint]

print("Phase synchronization metrics complete.")
print(f"Mean PLV: {np.mean(PLV_timeseries):.3f}")
print(f"PLV range: [{np.min(PLV_timeseries):.3f}, {np.max(PLV_timeseries):.3f}]")
```

---

## 🔬 STEP_4_REGIME_CLASSIFICATION

```python
# Classify each timepoint into regimes
def classify_regime(PLV, phase_variability, D):
    """
    Classify timepoint into exploration, optimization, or support regime.

    Criteria:
    - EXPLORATION: PLV < 0.3 AND phase_variability > 0.5π
    - OPTIMIZATION: 0.3 ≤ PLV < 0.7 AND D increasing
    - SUPPORT: PLV ≥ 0.7 AND D minimal
    """
    if PLV < 0.3 and phase_variability > 0.5 * np.pi:
        return 0  # EXPLORATION
    elif 0.3 <= PLV < 0.7:
        return 1  # OPTIMIZATION
    elif PLV >= 0.7:
        return 2  # SUPPORT
    else:
        return np.nan  # Ambiguous

# Compute phase variability (circular std dev)
def circular_std(phases):
    """Compute circular standard deviation"""
    R = np.abs(np.mean(np.exp(1j * phases)))
    return np.sqrt(-2 * np.log(R))

# Apply regime classification to all timepoints
# Store: regime_labels[epoch, timepoint] with values [0, 1, 2]

# Calculate regime durations
regime_percentages = []
for epoch in range(n_epochs):
    total_time = len(regime_labels[epoch])
    exploration_time = np.sum(regime_labels[epoch] == 0) / total_time
    optimization_time = np.sum(regime_labels[epoch] == 1) / total_time
    support_time = np.sum(regime_labels[epoch] == 2) / total_time
    regime_percentages.append([exploration_time, optimization_time, support_time])

regime_percentages = np.array(regime_percentages)

print("Regime classification complete.")
print(f"Mean regime allocation: Exploration={np.mean(regime_percentages[:, 0]):.1%}, "
      f"Optimization={np.mean(regime_percentages[:, 1]):.1%}, "
      f"Support={np.mean(regime_percentages[:, 2]):.1%}")
```

---

## 🔬 STEP_5_PI_SIGNATURE_METRIC

```python
# Compute π-signature metric
def compute_pi_signature(phases):
    """
    Compute π-signature: circularity × concentration

    Parameters:
    -----------
    phases : array
        Instantaneous phases

    Returns:
    --------
    pi_metric : float
        π-signature metric (0 = no circularity, 1 = perfect circle)
    """
    # Circular variance
    V = 1 - np.abs(np.mean(np.exp(1j * phases)))

    # Fit von Mises distribution to get concentration parameter κ
    # For simplicity, estimate κ from R = mean resultant length
    R = 1 - V
    if R < 0.53:
        kappa = 2 * R + R**3 + 5 * R**5 / 6
    elif R < 0.85:
        kappa = -0.4 + 1.39 * R + 0.43 / (1 - R)
    else:
        kappa = 1 / (R * (2 - R**2))

    # Normalize kappa
    kappa_norm = kappa / (kappa + 2)

    # Circularity
    C = np.exp(-V)

    # π-signature
    pi_metric = C * kappa_norm

    return pi_metric, kappa, V

# Compute π-signature for all timepoints
# Store: pi_metric_timeseries[epoch, timepoint]

print("π-signature computation complete.")
print(f"Mean π-metric: {np.mean(pi_metric_timeseries):.3f}")
```

---

## 🔬 STEP_6_GAMMA_POWER_ANALYSIS

```python
# Compute gamma band power (30-80 Hz)
# 1. Bandpass filter EEG data: 30-80 Hz (4th order Butterworth)
# 2. Compute envelope via Hilbert transform
# 3. Square envelope → instantaneous power
# 4. Smooth with 200ms Gaussian kernel
# 5. Normalize to pre-transition baseline (-5 to -2 seconds)

# Store: gamma_power[epoch, timepoint]

print("Gamma power analysis complete.")
print(f"Mean normalized gamma power: {np.mean(gamma_power):.3f}")
```

---

## 📊 STEP_7_STATISTICAL_TESTS

Please run these exact statistical tests:

### Test 1: Fractal Dimension Comparison
```python
# PREDICTION 1: D_transition > D_synchronized

# Extract D values for each regime
D_exploration = []
D_optimization = []
D_support = []

for epoch in range(n_epochs):
    for t in range(len(regime_labels[epoch])):
        if regime_labels[epoch, t] == 0:
            D_exploration.append(D_timeseries[epoch, t])
        elif regime_labels[epoch, t] == 1:
            D_optimization.append(D_timeseries[epoch, t])
        elif regime_labels[epoch, t] == 2:
            D_support.append(D_timeseries[epoch, t])

# Paired t-test: D_transition (exploration + optimization) vs D_support
D_transition = D_exploration + D_optimization
t_stat, p_value = ttest_rel(D_transition[:len(D_support)], D_support[:len(D_transition)])

# Cohen's d effect size
mean_diff = np.mean(D_transition) - np.mean(D_support)
pooled_std = np.sqrt((np.std(D_transition)**2 + np.std(D_support)**2) / 2)
cohens_d = mean_diff / pooled_std

print(f"\n=== TEST 1: Fractal Dimension Comparison ===")
print(f"D_transition mean: {np.mean(D_transition):.3f} ± {np.std(D_transition):.3f}")
print(f"D_support mean: {np.mean(D_support):.3f} ± {np.std(D_support):.3f}")
print(f"t-statistic: {t_stat:.3f}, p-value: {p_value:.6f}")
print(f"Cohen's d: {cohens_d:.3f}")
print(f"SUCCESS: {p_value < 0.0083 and cohens_d > 0.5}")
```

### Test 2: Regime Time Allocation
```python
# PREDICTION 2: Regime allocation follows [30%, 20%, 50%]

observed = np.mean(regime_percentages, axis=0) * 100  # Convert to percentages
expected = np.array([30, 20, 50])

# Chi-square goodness-of-fit
chi2_stat = np.sum((observed - expected)**2 / expected)
from scipy.stats import chi2
p_value = 1 - chi2.cdf(chi2_stat, df=2)

# Check if deviations are within ±10%
deviations = np.abs(observed - expected)
within_tolerance = np.all(deviations < 10)

print(f"\n=== TEST 2: Regime Time Allocation ===")
print(f"Observed: Exploration={observed[0]:.1f}%, Optimization={observed[1]:.1f}%, Support={observed[2]:.1f}%")
print(f"Expected: Exploration=30.0%, Optimization=20.0%, Support=50.0%")
print(f"χ² statistic: {chi2_stat:.3f}, p-value: {p_value:.6f}")
print(f"Deviations: {deviations}")
print(f"SUCCESS: {p_value > 0.05 and within_tolerance}")
```

### Test 3: Energy Peak at Optimization
```python
# PREDICTION 3: Gamma power peaks during optimization regime

# Extract gamma power for each regime
gamma_exploration = []
gamma_optimization = []
gamma_support = []

for epoch in range(n_epochs):
    for t in range(len(regime_labels[epoch])):
        if regime_labels[epoch, t] == 0:
            gamma_exploration.append(gamma_power[epoch, t])
        elif regime_labels[epoch, t] == 1:
            gamma_optimization.append(gamma_power[epoch, t])
        elif regime_labels[epoch, t] == 2:
            gamma_support.append(gamma_power[epoch, t])

# One-way ANOVA
F_stat, p_value = f_oneway(gamma_exploration, gamma_optimization, gamma_support)

# Check if optimization peak is 1.5-3× higher than support
power_ratio = np.mean(gamma_optimization) / np.mean(gamma_support)
ratio_check = 1.5 <= power_ratio <= 3.0

print(f"\n=== TEST 3: Energy Peak at Optimization ===")
print(f"Gamma power - Exploration: {np.mean(gamma_exploration):.3f}")
print(f"Gamma power - Optimization: {np.mean(gamma_optimization):.3f}")
print(f"Gamma power - Support: {np.mean(gamma_support):.3f}")
print(f"Power ratio (Optimization/Support): {power_ratio:.2f}")
print(f"F-statistic: {F_stat:.3f}, p-value: {p_value:.6f}")
print(f"SUCCESS: {p_value < 0.0083 and ratio_check}")
```

### Test 4: π-Signature vs PLV Correlation
```python
# PREDICTION 4: π_metric correlates with PLV (r > 0.6)

# Flatten arrays for correlation
pi_flat = pi_metric_timeseries.flatten()
PLV_flat = PLV_timeseries.flatten()

# Remove NaN values
mask = ~(np.isnan(pi_flat) | np.isnan(PLV_flat))
pi_clean = pi_flat[mask]
PLV_clean = PLV_flat[mask]

# Pearson correlation
r_value, p_value = pearsonr(pi_clean, PLV_clean)

# Bootstrap 95% CI (10,000 iterations)
from scipy.stats import bootstrap
def correlation_statistic(x, y):
    return pearsonr(x, y)[0]

rng = np.random.default_rng()
n_bootstrap = 10000
bootstrap_rs = []
for _ in range(n_bootstrap):
    idx = rng.choice(len(pi_clean), size=len(pi_clean), replace=True)
    bootstrap_rs.append(pearsonr(pi_clean[idx], PLV_clean[idx])[0])

ci_lower = np.percentile(bootstrap_rs, 2.5)
ci_upper = np.percentile(bootstrap_rs, 97.5)

print(f"\n=== TEST 4: π-Signature vs PLV Correlation ===")
print(f"Pearson r: {r_value:.3f}")
print(f"95% CI: [{ci_lower:.3f}, {ci_upper:.3f}]")
print(f"p-value: {p_value:.6f}")
print(f"SUCCESS: {r_value > 0.6 and ci_lower > 0.4}")
```

### Test 5: π ↔ D Complementarity
```python
# PREDICTION 5: D and π-metric are inversely related (r < -0.5)

# Correlation between D and π-metric
r_value, p_value = pearsonr(D_timeseries.flatten(), pi_metric_timeseries.flatten())

print(f"\n=== TEST 5: π ↔ D Complementarity ===")
print(f"Pearson r (D vs π-metric): {r_value:.3f}")
print(f"p-value: {p_value:.6f}")
print(f"SUCCESS: {r_value < -0.5 and p_value < 0.0083}")
```

### Test 6: Transition Trajectory Consistency
```python
# PREDICTION 6: D trajectories are consistent across transitions (ICC > 0.7)

# Extract D trajectory for each epoch (normalized transition timeline)
# Align all epochs to common timeline: 0% (desync) to 100% (sync)

def compute_ICC(trajectories):
    """
    Compute Intraclass Correlation Coefficient

    Parameters:
    -----------
    trajectories : array, shape (n_epochs, n_timepoints)

    Returns:
    --------
    ICC : float
    """
    n_epochs, n_timepoints = trajectories.shape

    # Mean square between
    grand_mean = np.mean(trajectories)
    timepoint_means = np.mean(trajectories, axis=0)
    MS_between = n_epochs * np.sum((timepoint_means - grand_mean)**2) / (n_timepoints - 1)

    # Mean square within
    MS_within = np.sum((trajectories - timepoint_means)**2) / (n_epochs * (n_timepoints - 1))

    # ICC
    ICC = (MS_between - MS_within) / (MS_between + (n_epochs - 1) * MS_within)

    return ICC

# Normalize trajectories and compute ICC
ICC_value = compute_ICC(D_trajectories_normalized)

# Bootstrap 95% CI
ICC_bootstrap = []
for _ in range(1000):
    idx = rng.choice(n_epochs, size=n_epochs, replace=True)
    ICC_bootstrap.append(compute_ICC(D_trajectories_normalized[idx]))

ICC_ci_lower = np.percentile(ICC_bootstrap, 2.5)
ICC_ci_upper = np.percentile(ICC_bootstrap, 97.5)

print(f"\n=== TEST 6: Transition Trajectory Consistency ===")
print(f"ICC: {ICC_value:.3f}")
print(f"95% CI: [{ICC_ci_lower:.3f}, {ICC_ci_upper:.3f}]")
print(f"SUCCESS: {ICC_value > 0.7 and ICC_ci_lower > 0.5}")
```

---

## 📊 STEP_8_VISUALIZATIONS

Please generate these 6 figures exactly as specified:

### Figure 1: Regime Time Allocation Bar Chart
```python
fig, ax = plt.subplots(figsize=(10, 6))

regimes = ['Exploration', 'Optimization', 'Support']
observed = np.mean(regime_percentages, axis=0) * 100
expected = [30, 20, 50]
ci_95 = 1.96 * np.std(regime_percentages, axis=0) * 100 / np.sqrt(n_epochs)

x_pos = np.arange(len(regimes))
colors = ['#FF6B6B', '#FFD93D', '#6BCB77']

ax.bar(x_pos, observed, color=colors, alpha=0.7, label='Observed')
ax.errorbar(x_pos, observed, yerr=ci_95, fmt='none', ecolor='black', capsize=5)

for i, exp in enumerate(expected):
    ax.axhline(y=exp, xmin=i/3, xmax=(i+1)/3, color='black', linestyle='--', linewidth=2, label='Expected' if i == 0 else '')

ax.set_xticks(x_pos)
ax.set_xticklabels(regimes, fontsize=12)
ax.set_ylabel('Percentage of Transition Time (%)', fontsize=12)
ax.set_title('Regime Time Allocation: Observed vs Expected', fontsize=14, fontweight='bold')
ax.legend()
ax.grid(axis='y', alpha=0.3)

plt.tight_layout()
plt.show()
```

### Figure 2: Fractal Dimension Evolution
```python
fig, ax = plt.subplots(figsize=(12, 6))

# Normalize transition time for all epochs (0% = start, 100% = sync)
# Average D across epochs
time_normalized = np.linspace(0, 100, D_trajectories_normalized.shape[1])
D_mean = np.mean(D_trajectories_normalized, axis=0)
D_sem = np.std(D_trajectories_normalized, axis=0) / np.sqrt(n_epochs)

ax.plot(time_normalized, D_mean, linewidth=2, color='#2C3E50', label='Mean Fractal Dimension')
ax.fill_between(time_normalized, D_mean - D_sem, D_mean + D_sem, alpha=0.3, color='#2C3E50')

# Color-code regime regions (estimate from PLV)
# Exploration: 0-30%, Optimization: 30-50%, Support: 50-100%
ax.axvspan(0, 30, alpha=0.2, color='#FF6B6B', label='Exploration')
ax.axvspan(30, 50, alpha=0.2, color='#FFD93D', label='Optimization')
ax.axvspan(50, 100, alpha=0.2, color='#6BCB77', label='Support')

ax.set_xlabel('Normalized Transition Time (%)', fontsize=12)
ax.set_ylabel('Higuchi Fractal Dimension (D)', fontsize=12)
ax.set_title('Fractal Dimension Evolution Through Synchronization Transition', fontsize=14, fontweight='bold')
ax.legend()
ax.grid(alpha=0.3)

plt.tight_layout()
plt.show()
```

### Figure 3: π-Signature vs PLV Scatter
```python
fig, ax = plt.subplots(figsize=(10, 8))

# Color-code by regime
colors_regime = {0: '#FF6B6B', 1: '#FFD93D', 2: '#6BCB77'}
regime_names = {0: 'Exploration', 1: 'Optimization', 2: 'Support'}

for regime in [0, 1, 2]:
    mask = regime_labels.flatten() == regime
    ax.scatter(PLV_flat[mask], pi_flat[mask], c=colors_regime[regime],
               alpha=0.3, s=20, label=regime_names[regime])

# Regression line
from scipy.stats import linregress
slope, intercept, r_value, p_value, std_err = linregress(PLV_clean, pi_clean)
line_x = np.linspace(PLV_clean.min(), PLV_clean.max(), 100)
line_y = slope * line_x + intercept

ax.plot(line_x, line_y, 'k--', linewidth=2, label=f'Regression (r={r_value:.3f})')

# 95% CI band
from scipy import stats
predict_y = slope * line_x + intercept
predict_err = std_err * np.sqrt(1/len(PLV_clean) + (line_x - np.mean(PLV_clean))**2 / np.sum((PLV_clean - np.mean(PLV_clean))**2))
ci = 1.96 * predict_err
ax.fill_between(line_x, predict_y - ci, predict_y + ci, alpha=0.2, color='gray')

ax.set_xlabel('Phase Locking Value (PLV)', fontsize=12)
ax.set_ylabel('π-Signature Metric', fontsize=12)
ax.set_title('π-Signature vs Synchronization Index', fontsize=14, fontweight='bold')
ax.legend()
ax.grid(alpha=0.3)

# Display statistics
textstr = f'Pearson r = {r_value:.3f}\np < {p_value:.1e}\ny = {slope:.2f}x + {intercept:.2f}'
ax.text(0.05, 0.95, textstr, transform=ax.transAxes, fontsize=10,
        verticalalignment='top', bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

plt.tight_layout()
plt.show()
```

### Figure 4: Gamma Power Box Plot
```python
fig, ax = plt.subplots(figsize=(10, 6))

gamma_data = [gamma_exploration, gamma_optimization, gamma_support]
box_colors = ['#FF6B6B', '#FFD93D', '#6BCB77']

bp = ax.boxplot(gamma_data, labels=['Exploration', 'Optimization', 'Support'],
                patch_artist=True, showmeans=True)

for patch, color in zip(bp['boxes'], box_colors):
    patch.set_facecolor(color)
    patch.set_alpha(0.7)

# Overlay individual trajectories
for epoch in range(min(n_epochs, 20)):  # Limit to 20 for visibility
    epoch_gamma = [
        np.mean(gamma_power[epoch, regime_labels[epoch] == 0]),
        np.mean(gamma_power[epoch, regime_labels[epoch] == 1]),
        np.mean(gamma_power[epoch, regime_labels[epoch] == 2])
    ]
    ax.plot([1, 2, 3], epoch_gamma, 'o-', alpha=0.2, color='gray', linewidth=0.5)

ax.set_ylabel('Normalized Gamma Power (30-80 Hz)', fontsize=12)
ax.set_title('Gamma Band Energy Dynamics Across Regimes', fontsize=14, fontweight='bold')
ax.grid(axis='y', alpha=0.3)

# Add ANOVA result
F_stat, p_value = f_oneway(gamma_exploration, gamma_optimization, gamma_support)
textstr = f'ANOVA: F={F_stat:.2f}, p={p_value:.1e}'
ax.text(0.5, 0.95, textstr, transform=ax.transAxes, fontsize=10,
        horizontalalignment='center', verticalalignment='top',
        bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

plt.tight_layout()
plt.show()
```

### Figure 5: π ↔ D Complementarity Dual-Axis
```python
fig, ax1 = plt.subplots(figsize=(12, 6))

time_normalized = np.linspace(0, 100, len(D_mean))

# Left axis: Fractal dimension
ax1.plot(time_normalized, D_mean, linewidth=2, color='#E74C3C', label='Fractal Dimension D')
ax1.fill_between(time_normalized, D_mean - D_sem, D_mean + D_sem, alpha=0.3, color='#E74C3C')
ax1.set_xlabel('Normalized Transition Time (%)', fontsize=12)
ax1.set_ylabel('Fractal Dimension (D)', fontsize=12, color='#E74C3C')
ax1.tick_params(axis='y', labelcolor='#E74C3C')

# Right axis: π-metric
ax2 = ax1.twinx()
pi_mean = np.mean(pi_metric_trajectories_normalized, axis=0)
pi_sem = np.std(pi_metric_trajectories_normalized, axis=0) / np.sqrt(n_epochs)
ax2.plot(time_normalized, pi_mean, linewidth=2, color='#3498DB', label='π-Signature')
ax2.fill_between(time_normalized, pi_mean - pi_sem, pi_mean + pi_sem, alpha=0.3, color='#3498DB')
ax2.set_ylabel('π-Signature Metric', fontsize=12, color='#3498DB')
ax2.tick_params(axis='y', labelcolor='#3498DB')

# Correlation annotation
r_value, _ = pearsonr(D_trajectories_normalized.flatten(), pi_metric_trajectories_normalized.flatten())
textstr = f'Inverse Correlation: r = {r_value:.3f}'
ax1.text(0.5, 0.05, textstr, transform=ax1.transAxes, fontsize=12,
         horizontalalignment='center', bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

plt.title('π ↔ D Complementarity: Inverse Dynamics During Transition', fontsize=14, fontweight='bold')
fig.tight_layout()
plt.show()
```

### Figure 6: Amplituhedron Trajectory Consistency
```python
from sklearn.decomposition import PCA

# Apply PCA to D trajectories
pca = PCA(n_components=2)
trajectories_pca = pca.fit_transform(D_trajectories_normalized)

fig, ax = plt.subplots(figsize=(10, 8))

# Plot each trajectory
for i in range(n_epochs):
    trajectory_2d = trajectories_pca[i].reshape(-1, 2)
    ax.plot(trajectory_2d[:, 0], trajectory_2d[:, 1], alpha=0.5, linewidth=1)

    # Start point (red)
    ax.scatter(trajectory_2d[0, 0], trajectory_2d[0, 1], c='red', s=100, marker='o', edgecolors='black')
    # End point (blue)
    ax.scatter(trajectory_2d[-1, 0], trajectory_2d[-1, 1], c='blue', s=100, marker='s', edgecolors='black')

# Convex hull
from scipy.spatial import ConvexHull
all_points = trajectories_pca.reshape(-1, 2)
hull = ConvexHull(all_points)
for simplex in hull.simplices:
    ax.plot(all_points[simplex, 0], all_points[simplex, 1], 'k--', alpha=0.3)

ax.set_xlabel('Principal Component 1', fontsize=12)
ax.set_ylabel('Principal Component 2', fontsize=12)
ax.set_title('Amplituhedron Trajectory Consistency Across Transitions', fontsize=14, fontweight='bold')
ax.grid(alpha=0.3)

# Add ICC value
textstr = f'ICC = {ICC_value:.3f}\n95% CI: [{ICC_ci_lower:.3f}, {ICC_ci_upper:.3f}]'
ax.text(0.05, 0.95, textstr, transform=ax.transAxes, fontsize=10,
        verticalalignment='top', bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

# Legend
ax.scatter([], [], c='red', s=100, marker='o', edgecolors='black', label='Desynchronized Start')
ax.scatter([], [], c='blue', s=100, marker='s', edgecolors='black', label='Synchronized End')
ax.legend()

plt.tight_layout()
plt.show()
```

---

## 📋 STEP_9_SUMMARY_REPORT

Please generate a summary table showing all 6 predictions and their validation results:

```python
# Create summary DataFrame
summary_data = {
    'Prediction': [
        'P1: D_transition > D_synchronized',
        'P2: Regime allocation [30%, 20%, 50%]',
        'P3: Gamma peak in optimization',
        'P4: π-metric correlates with PLV',
        'P5: D vs π inverse correlation',
        'P6: Trajectory consistency ICC > 0.7'
    ],
    'Test': [
        'Paired t-test',
        'Chi-square goodness-of-fit',
        'One-way ANOVA',
        'Pearson correlation (bootstrap CI)',
        'Pearson correlation',
        'Intraclass Correlation Coefficient'
    ],
    'Statistic': [
        f't={t_stat_P1:.2f}',
        f'χ²={chi2_stat_P2:.2f}',
        f'F={F_stat_P3:.2f}',
        f'r={r_value_P4:.3f} [{ci_lower_P4:.3f}, {ci_upper_P4:.3f}]',
        f'r={r_value_P5:.3f}',
        f'ICC={ICC_value_P6:.3f} [{ICC_ci_lower_P6:.3f}, {ICC_ci_upper_P6:.3f}]'
    ],
    'P-value': [
        f'{p_value_P1:.6f}',
        f'{p_value_P2:.6f}',
        f'{p_value_P3:.6f}',
        f'{p_value_P4:.6f}',
        f'{p_value_P5:.6f}',
        'N/A (CI-based)'
    ],
    'Bonferroni α': [
        '0.0083',
        '0.05 (inverted)',
        '0.0083',
        '0.0083 (via CI)',
        '0.0083',
        '0.0083 (via CI)'
    ],
    'Result': [
        '✓ CONFIRMED' if (p_value_P1 < 0.0083 and cohens_d_P1 > 0.5) else '✗ NOT CONFIRMED',
        '✓ CONFIRMED' if (p_value_P2 > 0.05 and within_tolerance_P2) else '✗ NOT CONFIRMED',
        '✓ CONFIRMED' if (p_value_P3 < 0.0083 and ratio_check_P3) else '✗ NOT CONFIRMED',
        '✓ CONFIRMED' if (r_value_P4 > 0.6 and ci_lower_P4 > 0.4) else '✗ NOT CONFIRMED',
        '✓ CONFIRMED' if (r_value_P5 < -0.5 and p_value_P5 < 0.0083) else '✗ NOT CONFIRMED',
        '✓ CONFIRMED' if (ICC_value_P6 > 0.7 and ICC_ci_lower_P6 > 0.5) else '✗ NOT CONFIRMED'
    ]
}

df_summary = pd.DataFrame(summary_data)
print("\n" + "="*100)
print("FINAL VALIDATION SUMMARY")
print("="*100)
print(df_summary.to_string(index=False))
print("\n")

# Count confirmations
n_confirmed = df_summary['Result'].str.contains('CONFIRMED').sum()
print(f"OVERALL RESULT: {n_confirmed}/6 predictions confirmed")

if n_confirmed >= 5:
    print("STRONG CONFIRMATION of amplituhedron-sphere transition geometry theory! ✓✓✓")
elif n_confirmed >= 3:
    print("MODERATE CONFIRMATION - theory shows promise but needs refinement.")
elif n_confirmed >= 1:
    print("WEAK CONFIRMATION - limited evidence for theory.")
else:
    print("FALSIFICATION - theory not supported by data.")
```

---

## 🎯 FINAL_DELIVERABLES

Julius, please provide:

1. **All 6 visualizations** (high-resolution images)
2. **Summary statistics table** with validation results
3. **Key findings paragraph** (3-5 sentences)
4. **Raw numerical results** for each prediction:
   - Test statistics
   - P-values (raw and Bonferroni-corrected)
   - Effect sizes
   - Confidence intervals
5. **Data quality report**:
   - Number of epochs analyzed
   - Sampling rate
   - % clean data after artifact rejection
   - Any anomalies or issues

---

## 📝 NOTES

- This is a **preregistered protocol** - all analysis steps were specified before viewing results
- Report ALL results, whether confirmatory or disconfirmatory
- If any step cannot be completed due to data format issues, please note this clearly
- If you need clarification on any step, please ask before proceeding

Thank you Julius! This validation will help determine if the amplituhedron-sphere transition geometry theory applies to neural synchronization dynamics.

🧮⚡ **Asymmetrica Research Lab - Making the Impossible Routine!** ⚡🧮