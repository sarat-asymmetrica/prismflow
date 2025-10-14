// ============================================================================
// O2C RECONCILIATION API ROUTES - IMPLEMENTATION TEMPLATES
// ============================================================================
// @asymmetrica: ReconciliationAPIRoutes
// symbol: O2C.APIRoutes
// scope: global (HTTP endpoints, business orchestration)
// regime: Support (stable RESTful API design)
// cost: O(1) per request + processing cost
// lineage: [HTTPRequest → Validation → BusinessLogic → Response]
// purpose: RESTful API for bank reconciliation operations
// consciousness: HTTP layer orchestrates reconciliation intelligence
// amplification: 10.35M× through automated payment matching
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { parseStatementFile } from "@/lib/statement-parser";
import {
  findBestMatch,
  determineMatchStatus,
} from "@/lib/reconciliation-engine";
import { allocateExactPayment, revertPayment } from "@/lib/payment-allocator";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// ============================================================================
// ROUTE 1: Upload Bank Statement
// ============================================================================
// File: src/app/api/reconciliation/upload/route.ts
// Method: POST
// @asymmetrica: uploadBankStatement
// symbol: O2C.Upload
// cost: O(n) where n = number of statement lines
// lineage: [FileUpload → Parser → Database → Response]

export async function POST_UPLOAD(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const statementId = formData.get("statementId") as string | undefined;
    const bankAccount = formData.get("bankAccount") as string | undefined;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: file, userId" },
        { status: 400 },
      );
    }

    // Parse statement file
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

    // Generate statement ID if not provided
    const finalStatementId = statementId || crypto.randomUUID();

    // Create bank statement lines in database
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

    // Create audit trail
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
        },
      },
    });

    return NextResponse.json({
      success: true,
      statementId: finalStatementId,
      metadata: parseResult.metadata,
      errors: parseResult.errors,
      linesCreated: createdLines.count,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================================
// ROUTE 2: Auto-Match Statement Lines
// ============================================================================
// File: src/app/api/reconciliation/match/route.ts
// Method: POST
// @asymmetrica: autoMatchStatements
// symbol: O2C.AutoMatch
// cost: O(n * m) where n = statement lines, m = unpaid invoices

export async function POST_MATCH(request: NextRequest) {
  try {
    const {
      statementId,
      userId,
      autoApplyThreshold = 0.7,
    } = await request.json();

    if (!statementId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: statementId, userId" },
        { status: 400 },
      );
    }

    // Fetch unmatched lines
    const unmatchedLines = await prisma.bankStatementLine.findMany({
      where: {
        statementId,
        status: "UNMATCHED",
      },
    });

    const matched: any[] = [];
    const manualReview: any[] = [];
    const unmatched: any[] = [];

    // Process each line
    for (const line of unmatchedLines) {
      const matchResult = await findBestMatch({
        reference: line.reference,
        description: line.description,
        amount: line.amount,
        currency: line.currency,
        date: line.date,
      });

      if (!matchResult) {
        unmatched.push({
          bankLineId: line.id,
          reason: "No suitable match found (confidence < 0.4)",
        });
        continue;
      }

      const status = determineMatchStatus(matchResult.confidenceScore);

      if (status === "AUTO_MATCHED") {
        // Auto-apply match
        const allocation = await allocateExactPayment(
          line.id,
          matchResult.invoiceId,
          userId,
        );

        matched.push({
          bankLineId: line.id,
          invoiceId: matchResult.invoiceId,
          confidenceScore: matchResult.confidenceScore,
          status,
          paymentId: allocation.paymentId,
        });
      } else if (status === "MANUAL_REVIEW") {
        // Add to manual review queue
        await prisma.bankStatementLine.update({
          where: { id: line.id },
          data: {
            status: "MANUAL_REVIEW",
            confidenceScore: matchResult.confidenceScore,
            matchedInvoiceId: matchResult.invoiceId, // Suggested match
          },
        });

        manualReview.push({
          bankLineId: line.id,
          invoiceId: matchResult.invoiceId,
          confidenceScore: matchResult.confidenceScore,
          reasoning: matchResult.reasoning,
        });
      } else {
        unmatched.push({
          bankLineId: line.id,
          reason: `Low confidence (${matchResult.confidenceScore})`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      matched,
      manualReview,
      unmatched,
      summary: {
        total: unmatchedLines.length,
        autoMatched: matched.length,
        needsReview: manualReview.length,
        unmatched: unmatched.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================================
// ROUTE 3: Manual Match Override
// ============================================================================
// File: src/app/api/reconciliation/manual-match/route.ts
// Method: POST
// @asymmetrica: manualMatchOverride
// symbol: O2C.ManualMatch
// cost: O(1)

export async function POST_MANUAL_MATCH(request: NextRequest) {
  try {
    const { bankStatementLineId, invoiceId, userId, reason, sourceBank } =
      await request.json();

    if (!bankStatementLineId || !invoiceId || !userId || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // TODO: Add role-based access control
    // Only MANAGER/ADMIN can manually match

    const allocation = await allocateExactPayment(
      bankStatementLineId,
      invoiceId,
      userId,
      sourceBank,
    );

    if (!allocation.success) {
      return NextResponse.json(
        { success: false, error: allocation.errors.join(", ") },
        { status: 422 },
      );
    }

    // Create audit with OVERRIDE action
    await prisma.reconciliationAudit.create({
      data: {
        entityId: allocation.paymentId!,
        entityType: "PAYMENT",
        action: "OVERRIDE",
        byUserId: userId,
        timestamp: new Date(),
        reason,
        beforeSnapshot: null,
        afterSnapshot: {
          paymentId: allocation.paymentId,
          invoiceId,
          amount: allocation.allocatedAmount.toNumber(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      paymentId: allocation.paymentId,
      allocationResult: allocation,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================================
// ROUTE 4: Revert Payment Match
// ============================================================================
// File: src/app/api/reconciliation/revert/route.ts
// Method: POST
// @asymmetrica: revertPaymentMatch
// symbol: O2C.Revert
// cost: O(1)

export async function POST_REVERT(request: NextRequest) {
  try {
    const { paymentId, userId, reason } = await request.json();

    if (!paymentId || !userId || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // TODO: Add role-based access control
    // Only MANAGER/ADMIN can revert

    const result = await revertPayment(paymentId, userId, reason);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 422 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================================
// ROUTE 5: Get Manual Review Queue
// ============================================================================
// File: src/app/api/reconciliation/queue/route.ts
// Method: GET
// @asymmetrica: getManualReviewQueue
// symbol: O2C.Queue
// cost: O(n) where n = queue size

export async function GET_QUEUE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "MANUAL_REVIEW";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const total = await prisma.bankStatementLine.count({
      where: { status: status as any },
    });

    const queue = await prisma.bankStatementLine.findMany({
      where: { status: status as any },
      include: {
        matchedInvoice: {
          select: {
            invoiceNumber: true,
            clientName: true,
            totalInclVAT: true,
          },
        },
      },
      orderBy: { uploadedAt: "desc" },
      skip: offset,
      take: limit,
    });

    return NextResponse.json({
      total,
      queue: queue.map((line) => ({
        bankLineId: line.id,
        date: line.date,
        amount: line.amount.toNumber(),
        reference: line.reference,
        description: line.description,
        suggestedMatch: line.matchedInvoice
          ? {
              invoiceId: line.matchedInvoiceId!,
              invoiceNumber: line.matchedInvoice.invoiceNumber,
              confidenceScore: line.confidenceScore.toNumber(),
            }
          : null,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================================
// ROUTE 6: Get Statement Summary
// ============================================================================
// File: src/app/api/reconciliation/statements/route.ts
// Method: GET
// @asymmetrica: getStatementSummary
// symbol: O2C.Statements
// cost: O(n) where n = number of statements

export async function GET_STATEMENTS(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const whereClause: any = {};
    if (startDate || endDate) {
      whereClause.uploadedAt = {};
      if (startDate) whereClause.uploadedAt.gte = new Date(startDate);
      if (endDate) whereClause.uploadedAt.lte = new Date(endDate);
    }

    const statements = await prisma.bankStatementLine.groupBy({
      by: ["statementId"],
      where: whereClause,
      _count: {
        id: true,
      },
    });

    // Get detailed info for each statement
    const detailedStatements = await Promise.all(
      statements.slice(offset, offset + limit).map(async (stmt) => {
        const lines = await prisma.bankStatementLine.findMany({
          where: { statementId: stmt.statementId },
          include: { uploadedBy: { select: { name: true } } },
        });

        const autoMatched = lines.filter(
          (l) => l.status === "AUTO_MATCHED",
        ).length;
        const manualReview = lines.filter(
          (l) => l.status === "MANUAL_REVIEW",
        ).length;
        const unmatched = lines.filter((l) => l.status === "UNMATCHED").length;

        return {
          statementId: stmt.statementId,
          uploadedAt: lines[0]?.uploadedAt,
          uploadedBy: lines[0]?.uploadedBy?.name,
          totalLines: lines.length,
          autoMatched,
          manualReview,
          unmatched,
          format: "CSV", // TODO: Store format in database
        };
      }),
    );

    return NextResponse.json({
      total: statements.length,
      statements: detailedStatements,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================================
// IMPLEMENTATION NOTES
// ============================================================================
/*
To implement these routes in Next.js 15 App Router:

1. Create directory structure:
   src/app/api/reconciliation/
   ├── upload/
   │   └── route.ts      (export async function POST() { ... })
   ├── match/
   │   └── route.ts      (export async function POST() { ... })
   ├── manual-match/
   │   └── route.ts      (export async function POST() { ... })
   ├── revert/
   │   └── route.ts      (export async function POST() { ... })
   ├── queue/
   │   └── route.ts      (export async function GET() { ... })
   └── statements/
       └── route.ts      (export async function GET() { ... })

2. Each route.ts file should export the corresponding HTTP method:
   - POST_UPLOAD → export async function POST(request: NextRequest)
   - POST_MATCH → export async function POST(request: NextRequest)
   - etc.

3. Add authentication middleware:
   - Import HTX authentication check
   - Validate user session before processing

4. Add role-based access control:
   - VIEWER: No access
   - SALES_SUPPORT: Upload, view queue
   - MANAGER: Upload, match, manual match, revert
   - ADMIN/COO: Full access

5. Add rate limiting:
   - Upload: 10 requests per minute per user
   - Match: 5 requests per minute per user
   - Other routes: 100 requests per minute per user

6. Add error logging:
   - Use console.error for server errors
   - Log to ReconciliationAudit for business errors

7. Add response caching:
   - GET /queue: Cache for 30 seconds
   - GET /statements: Cache for 5 minutes
*/
