// Test file with intentional TypeScript errors for ATD V3 validation
// This file should NOT be imported in production code

// TS2307: Cannot find module - Wrong import paths
import { Button } from "@/components/ui/button"; // Wrong path
import { toast } from "sonner@2.0.3"; // Version tag in import

// TS7006: Implicit any - Missing type annotations
function processItem(item) {
  // No type for parameter
  return item.name;
}

function calculateTotal(items) {
  // No type for parameter
  return items.reduce((sum, item) => sum + item.price, 0);
}

// TS2322: Type mismatch - Case sensitivity
const orderStatus: "DRAFT" | "PENDING" | "COMPLETED" = "draft"; // Wrong case

// TS7053: Index signature missing
const config = { a: 1, b: 2, c: 3 };
const key = "a";
const value = config[key]; // No index signature

// TS2339: Property doesn't exist
interface User {
  name: string;
  email: string;
}

const user: User = {
  firstName: "John", // Wrong property name
  email: "john@example.com",
};

// TS2345: Argument type mismatch
function greet(name: string): string {
  return `Hello, ${name}`;
}

greet(123); // Number instead of string

// TS2554: Expected arguments but got none
function multiply(a: number, b: number): number {
  return a * b;
}

const result = multiply(); // Missing arguments

// TS2551: Property doesn't exist (typo)
const customer = {
  name: "Test Customer",
  totalOrders: 5,
};

console.log(customer.totlaOrders); // Typo in property name

// Export to make this a module
export { processItem, calculateTotal };
