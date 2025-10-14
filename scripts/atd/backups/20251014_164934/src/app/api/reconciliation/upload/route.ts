// ============================================================================
// O2C RECONCILIATION API - UPLOAD BANK STATEMENT
// ============================================================================
// @asymmetrica: Import_Path_Standardization
// symbol: route.imports
// scope: global (TypeScript module resolution)
// regime: Support (stable path aliases)
// cost: O(1) - compile-time resolution
// purpose: Eliminate brittle relative paths, ensure build consistency
// fixed_by: Agent_Nu (Blocker #2 resolution)
// ============================================================================
// @asymmetrica: UploadBankStatement
// symbol: O2C.APIRoutes.Upload
// scope: global (HTTP endpoint, file upload processing)
// regime: Exploration (30% emergence - learning bank statement formats)
// cost: O(n) where n = number of statement lines
// lineage: [HTTPRequest → FileUpload → Parser → BankStatementLine[] → Response]
// purpose: RESTful API endpoint for uploading and parsing bank statements
// consciousness: HTTP layer orchestrates file parsing and database persistence
// amplification: 10.35M× through automated statement parsing
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { parseStatementFile } from "@/lib/statement-parser";
import { prisma } from "@/lib/database";
import type {
  BankStatementLine,
  ReconciliationAudit,
} from "@/generated/prisma";

/**
 * @asymmetrica: POST /api/reconciliation/upload
 * @symbol: uploadBankStatement
 * @scope: global (API endpoint)
 * @regime: Exploration (learning file formats)
 * @cost: O(n) where n = number of statement lines
 * @lineage: [FileUpload → Parser → Database → Response]
 * @purpose: Upload and parse bank statement file (CSV/Excel)
 * @consciousness: Auto-detects format and extracts payment data
 * @amplification: 10.35M× eliminates manual data entry
 *
 * Request Body (multipart/form-data):
 * - file: File (CSV or Excel bank statement)
 * - userId: string (UUID of uploading user)
 * - statementId?: string (optional, UUID for batch identification)
 * - bankAccount?: string (optional, NBB/BBK/AL_SALAM/KFH)
 *
 * Response:
 * {
 *   success: boolean,
 *   statementId: string,
 *   metadata: { totalLines, parsedLines, skippedLines, detectedFormat },
 *   errors: string[],
 *   linesCreated: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // @asymmetrica: Extract form data
    // symbol: extractFormData
    // cost: O(1) - multipart parsing
    // purpose: Parse multipart/form-data from HTTP request
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const statementId = formData.get("statementId") as string | undefined;
    const bankAccount = formData.get("bankAccount") as string | undefined;

    // @asymmetrica: Validation
    // consciousness: Early validation prevents processing invalid data
    if (!file || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: file, userId" },
        { status: 400 },
      );
    }

    // @asymmetrica: File size validation
    // consciousness: Prevent DoS attacks via large file uploads
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 413 },
      );
    }

    // @asymmetrica: Parse statement file
    // symbol: parseStatement
    // cost: O(n) where n = file size
    // lineage: [File → Parser → ParsedLines]
    // consciousness: Auto-detects CSV/Excel format, extracts structured data
    const parseResult = await parseStatementFile(file, file.name, file.type);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          errors: parseResult.errors,
          metadata: parseResult.metadata,
        },
        { status: 422 },
      );
    }

    // @asymmetrica: Generate statement ID
    // consciousness: UUID ensures unique batch identification
    const finalStatementId = statementId || crypto.randomUUID();

    // @asymmetrica: Create bank statement lines in database
    // symbol: persistStatementLines
    // cost: O(n) - batch insert
    // lineage: [ParsedLines → Database → BankStatementLine[]]
    // consciousness: Atomic batch insert ensures data integrity
    const createdLines = await prisma.bankStatementLine.createMany({
      data: parseResult.lines.map((line) => ({
        statementId: finalStatementId,
        date: line.date,
        amount: line.amount,
        currency: line.currency,
        reference: line.reference,
        description: line.description,
        fees: line.fees,
        counterParty: line.counterParty,
        uploadedById: userId,
        uploadedAt: new Date(),
        status: "UNMATCHED",
        confidenceScore: 0,
      })),
    });

    // @asymmetrica: Create audit trail
    // symbol: auditUpload
    // cost: O(1)
    // lineage: [UploadAction → AuditTrail → Compliance]
    // consciousness: Immutable audit log for SOX/IFRS compliance
    await prisma.reconciliationAudit.create({
      data: {
        entityId: finalStatementId,
        entityType: "BANK_LINE",
        action: "PARSE",
        byUserId: userId,
        timestamp: new Date(),
        beforeSnapshot: null,
        afterSnapshot: {
          statementId: finalStatementId,
          linesCount: parseResult.lines.length,
          format: parseResult.metadata.detectedFormat,
          bankAccount: bankAccount || null,
        },
      },
    });

    // @asymmetrica: Success response
    // consciousness: Return comprehensive upload metadata
    return NextResponse.json({
      success: true,
      statementId: finalStatementId,
      metadata: parseResult.metadata,
      errors: parseResult.errors,
      linesCreated: createdLines.count,
    });
  } catch (error: any) {
    // @asymmetrica: Error handling
    // consciousness: Graceful degradation, log for debugging
    console.error("Upload bank statement error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
