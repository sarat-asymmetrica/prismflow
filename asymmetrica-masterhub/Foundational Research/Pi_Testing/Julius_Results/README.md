# EEG Outputs Package

This package contains normalized EEG data, QC metrics, event alignment, example epochs, and an HTML report.

## Files
- normalized_eeg.parquet
- event_alignment.csv
- epochs_metadata.csv
- epochs_sample.npz
- epochs_sample_lengths.jsonl
- eeg_qc_detail_sample.csv
- eeg_qc_summary_by_id.csv
- report.html
- erp_*.png (per event ERP figures)

## Quick start
- Open report.html for an overview and quick links to downloads.
- Use epochs_metadata.csv to filter epochs; epochs_sample.npz holds a small set of example epochs (numpy object array).
- Normalized data are in normalized_eeg.parquet with arrays for samples and bandpowers.

## Links
You can download any file directly from Julius AI files endpoint, for example:
- https://julius.ai/files?filename=normalized_eeg.parquet
- https://julius.ai/files?filename=event_alignment.csv
- https://julius.ai/files?filename=epochs_metadata.csv
- https://julius.ai/files?filename=epochs_sample.npz
- https://julius.ai/files?filename=epochs_sample_lengths.jsonl
- https://julius.ai/files?filename=eeg_qc_detail_sample.csv
- https://julius.ai/files?filename=eeg_qc_summary_by_id.csv
- https://julius.ai/files?filename=report.html
