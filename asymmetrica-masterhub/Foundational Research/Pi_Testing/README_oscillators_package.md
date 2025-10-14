
# Oscillator Analysis Package

This package contains a simulated dataset of 1000 underdamped oscillators spanning mechanics, electronics, and acoustics, plus derived ratios and plots.

## Files
- oscillators_1000_full_dataset.csv: Full dataset with parameters and derived quantities (ω0, β, ω_d, T_d, f_d, area, Q, bandwidth ratio, and ratios 1–3).
- oscillators_ratios_vs_constants_summary.csv: Median absolute relative error comparing each ratio to constants (π/2, π, 2π, π², 2π², 1).
- ratio1_hist.png, ratio2_hist.png, ratio3_hist.png: Distributions of the three ratios.

## Key identities observed
- Area/(A² f) = 2π² (universal for linear oscillators via phase-space ellipse geometry).
- Q × (bandwidth/center) = 1 (narrowband second-order resonator identity).
- T/(A × damping) is not universal.

## Notes
- Model form: x" + 2β x' + ω₀² x = 0 with lightly damped regimes (ζ ∈ [0, 0.2]).
- Domains tagged: mechanical_spring, pendulum_small_angle, RLC_circuit, acoustic_resonator.
