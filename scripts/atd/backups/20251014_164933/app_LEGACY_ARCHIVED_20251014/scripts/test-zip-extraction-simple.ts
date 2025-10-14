import { ZipExtractor } from "../lib/vedic/zip-extractor";
import { existsSync } from "fs";
import path from "path";

const TEST_ZIP_PATH =
  "C:/Projects/AsymmFlow-PH-Trading/docs/Zip_Files_for_OCR/OneDrive_2025-10-09.zip";

async function runTest() {
  console.log("\n🚀 ZIP Extraction Test\n");

  const extractor = new ZipExtractor();
  const result = await extractor.extractExcelFiles(TEST_ZIP_PATH);

  console.log(
    `✅ Extracted ${result.excelFileCount} Excel files in ${result.metadata.processingTimeMs}ms`,
  );
  console.log(
    `📁 Files: ${result.excelFiles
      .slice(0, 5)
      .map((f) => path.basename(f))
      .join(", ")}...\n`,
  );

  await extractor.cleanupExtraction(result.tempDirectory);
  console.log("✅ Test complete!\n");
}

runTest().catch(console.error);
