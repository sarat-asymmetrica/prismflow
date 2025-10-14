# PHASE 1: Fractal Dimension Baseline Analysis
## EEG Amplituhedron Validation - Incremental Testing Approach

---

## 🎯 PHASE_1_OBJECTIVE

**Goal:** Establish baseline fractal dimension measurements across different cognitive task types.

**Why Phase 1:** Build foundation before testing complex transition dynamics. Validate that our fractal dimension measurement works and shows expected differences.

**Expected Result:** Different task types show different fractal complexity (D values).

---

## 📋 JULIUS_AI_QUERY_PHASE_1

Hi Julius! I'm testing a mathematical theory about brain dynamics using fractal geometry. This is **Phase 1** of a multi-phase validation.

### Research Question
Do different cognitive tasks show different levels of fractal complexity in EEG signals?

### Hypothesis
```
Relaxation/Baseline tasks → Lower D (1.0-1.3) - Simple, periodic dynamics
Math/Problem-solving → Higher D (1.5-1.8) - Complex, exploratory search
Sensory tasks (music/video) → Medium D (1.3-1.5) - Moderate complexity
```

### Task Categories
Please group the events into these categories:

**BASELINE/RELAXATION:**
- `relax`
- `relaxInstruction`
- `everyone paired`

**COGNITIVE/MATH:**
- `math1` through `math12`
- `mathInstruction`

**SENSORY:**
- `music`
- `musicInstruction`
- `video-ver1`, `video-ver2`
- `videoInstruction`

**CREATIVE:**
- `thinkOfItems-ver1`, `thinkOfItems-ver2`
- `thinkOfItemsInstruction-ver1`, `thinkOfItemsInstruction-ver2`

**MOTOR:**
- `blink1` through `blink5`
- `blinkInstruction`

**ATTENTION:**
- All `colorRound` events
- `colorInstruction1`, `colorInstruction2`

---

## 🔬 ANALYSIS_STEPS

### Step 1: Compute Higuchi Fractal Dimension

Please use this exact algorithm:

```python
import numpy as np

def higuchi_fractal_dimension(X, k_max=10):
    """
    Compute Higuchi fractal dimension for time series X.

    Parameters:
    -----------
    X : array
        Time series data (1D array)
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
            indices = np.arange(m, N, k)
            if len(indices) < 2:
                continue

            # Compute length
            for i in range(1, len(indices)):
                Lmk += abs(X[indices[i]] - X[indices[i-1]])

            # Normalize
            Lmk = Lmk * (N - 1) / (k * k * len(indices))
            Lk.append(Lmk)

        if len(Lk) > 0:
            L.append(np.mean(Lk))

    # Fit log-log regression
    x = np.log(1 / np.arange(1, k_max + 1))
    y = np.log(L)

    # Linear regression
    coeffs = np.polyfit(x, y, 1)
    D = -coeffs[0]

    return D

# Apply to EEG data:
# 1. For each epoch in normalized_eeg.parquet
# 2. Compute D for the entire epoch window
# 3. Average across all channels if multichannel
# 4. Store: [subject_id, event_name, task_category, D_value]
```

### Step 2: Group by Task Category

Create a dataframe with columns:
```
subject_id | event_name | task_category | D_value
```

Compute summary statistics:
```python
summary = df.groupby('task_category')['D_value'].agg(['mean', 'std', 'count'])
print(summary)
```

### Step 3: Statistical Testing

Run one-way ANOVA to test if D differs significantly across task categories:

```python
from scipy.stats import f_oneway

# Separate D values by category
baseline_D = df[df['task_category'] == 'BASELINE']['D_value']
cognitive_D = df[df['task_category'] == 'COGNITIVE']['D_value']
sensory_D = df[df['task_category'] == 'SENSORY']['D_value']
creative_D = df[df['task_category'] == 'CREATIVE']['D_value']
motor_D = df[df['task_category'] == 'MOTOR']['D_value']
attention_D = df[df['task_category'] == 'ATTENTION']['D_value']

# ANOVA
F_stat, p_value = f_oneway(baseline_D, cognitive_D, sensory_D,
                           creative_D, motor_D, attention_D)

print(f"One-way ANOVA:")
print(f"F-statistic: {F_stat:.3f}")
print(f"p-value: {p_value:.6f}")

if p_value < 0.05:
    print("✓ SIGNIFICANT - Task categories show different fractal complexity")
else:
    print("✗ NOT SIGNIFICANT - No evidence for different complexity")
```

### Step 4: Post-hoc Comparisons (if ANOVA significant)

If ANOVA shows significance, compare specific pairs:

```python
from scipy.stats import ttest_ind

# Key comparison: Baseline vs Cognitive
t_stat, p_val = ttest_ind(baseline_D, cognitive_D)
print(f"\nBaseline vs Cognitive: t={t_stat:.3f}, p={p_val:.6f}")

# Baseline vs Sensory
t_stat, p_val = ttest_ind(baseline_D, sensory_D)
print(f"Baseline vs Sensory: t={t_stat:.3f}, p={p_val:.6f}")
```

---

## 📊 VISUALIZATION_REQUESTS

### Figure 1: Box Plot of D by Task Category

```python
import matplotlib.pyplot as plt
import seaborn as sns

fig, ax = plt.subplots(figsize=(12, 6))

categories = ['BASELINE', 'COGNITIVE', 'SENSORY', 'CREATIVE', 'MOTOR', 'ATTENTION']
colors = ['#6BCB77', '#FF6B6B', '#4D96FF', '#FFD93D', '#F49D6E', '#9D84B7']

# Box plot
bp = ax.boxplot([df[df['task_category'] == cat]['D_value'] for cat in categories],
                labels=categories,
                patch_artist=True,
                showmeans=True)

for patch, color in zip(bp['boxes'], colors):
    patch.set_facecolor(color)
    patch.set_alpha(0.7)

ax.set_ylabel('Higuchi Fractal Dimension (D)', fontsize=12)
ax.set_xlabel('Task Category', fontsize=12)
ax.set_title('Fractal Complexity Across Cognitive Task Types', fontsize=14, fontweight='bold')
ax.grid(axis='y', alpha=0.3)

# Add mean values as text
for i, cat in enumerate(categories):
    mean_val = df[df['task_category'] == cat]['D_value'].mean()
    ax.text(i+1, mean_val, f'{mean_val:.2f}',
            ha='center', va='bottom', fontweight='bold')

plt.tight_layout()
plt.show()
```

### Figure 2: Violin Plot (shows distribution shape)

```python
fig, ax = plt.subplots(figsize=(12, 6))

sns.violinplot(data=df, x='task_category', y='D_value',
               palette=colors, ax=ax)

ax.set_ylabel('Fractal Dimension (D)', fontsize=12)
ax.set_xlabel('Task Category', fontsize=12)
ax.set_title('Distribution of Fractal Dimensions by Task Type', fontsize=14, fontweight='bold')
ax.grid(axis='y', alpha=0.3)

plt.tight_layout()
plt.show()
```

### Figure 3: Summary Statistics Table

```python
# Create summary table
summary_stats = df.groupby('task_category')['D_value'].agg([
    ('Mean', 'mean'),
    ('Std Dev', 'std'),
    ('Min', 'min'),
    ('Max', 'max'),
    ('N', 'count')
]).round(3)

print("\n" + "="*70)
print("FRACTAL DIMENSION SUMMARY BY TASK CATEGORY")
print("="*70)
print(summary_stats)
print("="*70)
```

---

## ✅ SUCCESS_CRITERIA_PHASE_1

**Minimum Success:**
- D values computed for all epochs without errors
- Clear numerical differences between task categories (even if not statistically significant)

**Strong Success:**
- ANOVA p < 0.05 (significant difference across categories)
- Cognitive tasks show D > Baseline tasks
- Values fall in plausible range (1.0 < D < 2.0)

**Breakthrough Success:**
- Cognitive tasks: D ≈ 1.5-1.8 (predicted)
- Baseline tasks: D ≈ 1.0-1.3 (predicted)
- Clear ordering: Baseline < Sensory < Creative < Cognitive

---

## 📝 DELIVERABLES_PHASE_1

Please provide:

1. **Summary Statistics Table** showing mean ± std for each task category
2. **Box Plot** comparing D across all 6 categories
3. **ANOVA Results** with F-statistic and p-value
4. **CSV Export** of all computed D values: `fractal_dimensions_phase1.csv`
5. **Key Finding** (1-2 sentences): Do different tasks show different complexity?

---

## 🚀 NEXT_PHASES_PREVIEW

**Phase 2:** Time evolution of D during task transitions (exploration → solution)

**Phase 3:** Phase synchronization metrics (PLV) and circular distributions

**Phase 4:** Three-regime dynamics (exploration/optimization/support time allocation)

**Phase 5:** Full amplituhedron validation (π ↔ D complementarity)

---

## 📌 NOTES

- Use the `normalized_eeg.parquet` file you already created
- If multichannel data, average D across channels for simplicity
- k_max=10 is standard for EEG data at 512 Hz
- Report any computational issues or data quality concerns

Thank you Julius! This Phase 1 will establish our measurement foundation.

🧮⚡ **Asymmetrica Research Lab - Building Understanding Incrementally!** ⚡🧮