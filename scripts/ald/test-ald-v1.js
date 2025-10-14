// ALD V1 Test File - Intentional ESLint violations for testing
// [sigma] Semantic: Test suite for ALD V1 fixers
// [rho] Resilience: Covers all major rule types
// [kappa] Knowledge: Representative violation patterns

// Violation 1: unused variable (no-unused-vars)
const unusedVar = 42;

// Violation 2: unused function parameter (no-unused-vars)
function testFunction(usedParam, unusedParam) {
  console.log(usedParam);
  return usedParam * 2;
}

// Violation 3: console statement (no-console)
console.log("Debug statement");
console.error("Error message");
console.warn("Warning message");

// Violation 4: let should be const (prefer-const)
let neverReassigned = "hello";
let alsoNeverReassigned = 123;

// Violation 5: inconsistent quotes (quotes)
const name = "John";
const greeting = 'Hello';
const message = "Welcome";

// Violation 6: missing semicolons (semi - if prefer always)
const x = 1
const y = 2
const z = 3

// Violation 7: var instead of const/let (no-var)
var oldStyle = "legacy";
var anotherOldStyle = 456;

// Violation 8: unused imports (no-unused-vars)
import { usedFunction, unusedFunction, anotherUnused } from './utils';

// Violation 9: multiple unused variables
const unused1 = "test";
const unused2 = "test2";
const unused3 = "test3";

// Violation 10: destructured unused (no-unused-vars)
const { usedProp, unusedProp } = { usedProp: 1, unusedProp: 2 };

// Violation 11: extra semicolons (no-extra-semi)
const extraSemi = 10;;

// Some correct code
function correctFunction(param) {
  const result = param * 2;
  return result;
}

// Use some variables to avoid errors
usedFunction();
console.log(usedProp);

export default function TestALD() {
  return (
    <div>
      <h1>ALD V1 Test Component</h1>
      <p>This file contains intentional ESLint violations</p>
    </div>
  );
}

// More violations for comprehensive testing

// Violation 12: console in component
function ComponentWithConsole() {
  console.log("Component rendered");
  return <div>Test</div>;
}

// Violation 13: unused arrow function
const unusedArrow = () => {
  return "never called";
};

// Violation 14: var in loop (no-var)
for (var i = 0; i < 10; i++) {
  console.log(i);
}

// Violation 15: let that should be const
let constantValue = "never changes";

// End of test file
