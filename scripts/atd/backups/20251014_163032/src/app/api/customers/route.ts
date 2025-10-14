/**
 * @file route.ts
 * @asymmetrica: CustomerPreviewSocket
 * @symbol γ (Customer.Preview)
 * @scope Global customer preview with grade distribution
 * @regime Stabilization (customer relationship management)
 * @cost O(n log n) where n = customers (sorted)
 * @lineage [User → Auth → Customers → GradeAnalysis → Response]
 * @purpose Fetch customer preview (top 5) or full list with grade stats
 * @validation HTX auth required, RBAC for sensitive data
 *
 * @voltage
 *   Input: { limit?: number, grade?: string, search?: string, offset?: number }
 *   Output: SocketResponse<Customer[]>
 *
 * @amperage
 *   Rate: 4.909 Hz base frequency
 *   Limit: 100 requests/minute per user
 *   Burst: 10 requests/second
 *
 * @frequency 4.909 Hz (203.7ms base period)
 *
 * @circuitBreaker
 *   Retry: 3-6-9 harmonic cycle (611ms, 1222ms, 1833ms)
 *   Fallback: Empty array on total failure
 *   Recovery: Database reconnection attempt
 *
 * @groundWire HTX-V1.2 session-based authentication
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { withSocketAuth } from "@/lib/sockets/socket-auth";
import { validateQueryParams } from "@/lib/sockets/socket-validator";
import {
  createSocketResponse,
  createErrorResponse,
  SocketErrorCode,
} from "@/lib/sockets/socket-types";
import { withDatabaseRetry } from "@/lib/sockets/socket-error";
import { withCache } from "@/lib/sockets/socket-cache";
import { CustomerQuery } from "@/lib/sockets/socket-validator";

/**
 * GET /api/customers
 *
 * Fetch customers with optional preview mode (limit=5)
 * Includes grade distribution statistics
 *
 * @query limit - Max results (default: 50, max: 200, preview: 5)
 * @query offset - Pagination offset
 * @query grade - Filter by customer grade (A/B/C/D)
 * @query search - Search by business name or customer code
 * @query currency - Filter by currency
 *
 * @returns SocketResponse<Customer[]>
 */
export const GET = withSocketAuth(async (request: NextRequest) => {
  try {
    // Get authenticated user from socket context
    const socketContext = (request as any).socketContext;
    const user = socketContext.user;

    // Validate query parameters
    const queryParams = validateQueryParams(request, CustomerQuery);

    // Determine if this is a preview request
    const isPreview = queryParams.limit === 5;

    // Build Prisma query
    const where: any = {};

    if (queryParams.grade) {
      where.grade = queryParams.grade;
    }

    if (queryParams.currency) {
      where.currency = queryParams.currency;
    }

    if (queryParams.search) {
      where.OR = [
        { businessName: { contains: queryParams.search, mode: "insensitive" } },
        { customerCode: { contains: queryParams.search, mode: "insensitive" } },
        { email: { contains: queryParams.search, mode: "insensitive" } },
      ];
    }

    // Determine cache strategy
    const cacheKey = isPreview
      ? `customers:preview:${JSON.stringify(queryParams)}`
      : `customers:list:${JSON.stringify(queryParams)}`;

    const shouldCache = isPreview || !queryParams.search; // Cache previews and non-search queries

    // Execute query with retry logic
    const fetchCustomers = async () => {
      return await withDatabaseRetry(async () => {
        const customers = await prisma.customer.findMany({
          where,
          include: {
            _count: {
              select: {
                invoices: true,
                orders: true,
                tasks: true,
                rfqs: true,
                offers: true,
              },
            },
          },
          orderBy: [
            { grade: "asc" }, // A customers first
            { businessName: "asc" }, // Alphabetical
          ],
          take: queryParams.limit || 50,
          skip: queryParams.offset || 0,
        });

        return customers;
      });
    };

    // Fetch with optional caching (5min TTL for previews, 2min for lists)
    const customers = shouldCache
      ? await withCache(cacheKey, fetchCustomers, {
          ttl: isPreview ? 5 * 60 * 1000 : 2 * 60 * 1000,
        })
      : await fetchCustomers();

    // Calculate grade distribution statistics
    const gradeDistribution = await withDatabaseRetry(async () => {
      const gradeStats = await prisma.customer.groupBy({
        by: ["grade"],
        _count: {
          grade: true,
        },
        where: queryParams.search || queryParams.currency ? where : {},
      });

      return gradeStats.reduce(
        (acc, stat) => {
          acc[stat.grade || "ungraded"] = stat._count.grade;
          return acc;
        },
        {} as Record<string, number>,
      );
    });

    // Calculate total count for pagination
    const totalCount = await withDatabaseRetry(async () => {
      return await prisma.customer.count({ where });
    });

    // Calculate aggregate statistics
    const stats = {
      total: totalCount,
      fetched: customers.length,
      gradeDistribution,
      averageCreditLimit:
        customers
          .filter((c) => c.creditLimit)
          .reduce((sum, c) => sum + (c.creditLimit || 0), 0) /
        (customers.filter((c) => c.creditLimit).length || 1),
      byCurrency: customers.reduce(
        (acc, c) => {
          acc[c.currency] = (acc[c.currency] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      topGrades: {
        A: gradeDistribution["A"] || 0,
        B: gradeDistribution["B"] || 0,
        C: gradeDistribution["C"] || 0,
        D: gradeDistribution["D"] || 0,
      },
    };

    // Return success response
    return NextResponse.json(
      createSocketResponse(customers, {
        stats,
        query: queryParams,
        isPreview,
        pagination: {
          offset: queryParams.offset || 0,
          limit: queryParams.limit || 50,
          total: totalCount,
          hasMore: (queryParams.offset || 0) + customers.length < totalCount,
        },
        rbac: {
          role: user.role,
        },
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("[CustomerPreviewSocket] Error fetching customers:", error);

    return NextResponse.json(
      createErrorResponse(
        SocketErrorCode.INTERNAL_ERROR,
        "Failed to fetch customers",
        500,
        process.env.NODE_ENV === "development" ? error : undefined,
      ),
      { status: 500 },
    );
  }
});

/**
 * POST /api/customers
 *
 * Create a new customer with auto-generated customer code
 *
 * @body businessName - Business name (required)
 * @body contactPerson - Contact person name (optional)
 * @body email - Email address (optional)
 * @body phone - Phone number (optional)
 * @body address - Physical address (optional)
 * @body grade - Customer grade A/B/C/D (optional)
 * @body creditLimit - Credit limit (optional)
 * @body currency - Currency (default: BHD)
 *
 * @returns SocketResponse<Customer>
 */
export const POST = withSocketAuth(async (request: NextRequest) => {
  try {
    // Get authenticated user from socket context
    const socketContext = (request as any).socketContext;
    const user = socketContext.user;

    // Parse and validate request body
    const body = await request.json();

    // Validate required fields
    if (
      !body.businessName ||
      typeof body.businessName !== "string" ||
      body.businessName.trim().length === 0
    ) {
      return NextResponse.json(
        createErrorResponse(
          SocketErrorCode.MISSING_REQUIRED_FIELD,
          "Business name is required",
          400,
        ),
        { status: 400 },
      );
    }

    // Generate customer code (auto-incrementing based on existing customers)
    const customerCode = await withDatabaseRetry(async () => {
      // Get the last customer code
      const lastCustomer = await prisma.customer.findFirst({
        where: {
          customerCode: {
            startsWith: "EC", // Default type: End Customer
          },
        },
        orderBy: {
          customerCode: "desc",
        },
      });

      // Extract serial number and increment
      const lastSerial = lastCustomer?.customerCode.match(/\d+$/);
      const nextSerial = lastSerial ? parseInt(lastSerial[0]) + 1 : 1;

      return `EC${nextSerial.toString().padStart(3, "0")}`;
    });

    // Create customer with retry logic
    const customer = await withDatabaseRetry(async () => {
      return await prisma.customer.create({
        data: {
          customerCode,
          businessName: body.businessName.trim(),
          contactPerson: body.contactPerson || null,
          email: body.email || null,
          phone: body.phone || null,
          address: body.address || null,
          grade: body.grade || null,
          creditLimit: body.creditLimit || null,
          currency: body.currency || "BHD",
          confidence: 1.0, // Manual entry = 100% confidence
          source: "manual",
        },
        include: {
          _count: {
            select: {
              invoices: true,
              orders: true,
              tasks: true,
              rfqs: true,
              offers: true,
            },
          },
        },
      });
    });

    // Invalidate customer caches
    // Note: Cache invalidation will be implemented in socket-cache.ts

    // Return success response
    return NextResponse.json(
      createSocketResponse(customer, {
        created: true,
        customerCode,
        timestamp: new Date().toISOString(),
      }),
      { status: 201 },
    );
  } catch (error: any) {
    console.error("[CustomerPreviewSocket] Error creating customer:", error);

    // Handle duplicate customer code (shouldn't happen with auto-generation)
    if (error.code === "P2002") {
      return NextResponse.json(
        createErrorResponse(
          SocketErrorCode.ALREADY_EXISTS,
          "Customer with this code already exists",
          409,
        ),
        { status: 409 },
      );
    }

    return NextResponse.json(
      createErrorResponse(
        SocketErrorCode.INTERNAL_ERROR,
        "Failed to create customer",
        500,
        process.env.NODE_ENV === "development" ? error : undefined,
      ),
      { status: 500 },
    );
  }
});
