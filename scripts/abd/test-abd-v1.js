/**
 * ABD V1 Test File
 *
 * Contains intentional build errors for testing ABD V1 functionality.
 * DO NOT use in production - for testing only!
 */

// ============================================================================
// ERROR 1: Module not found
// ============================================================================
import { NonExistentComponent } from "./components/DoesNotExist";

// ============================================================================
// ERROR 2: Missing npm dependency
// ============================================================================
import somePackage from "package-that-does-not-exist-in-npm-registry-12345";

// ============================================================================
// ERROR 3: Invalid import - wrong export name
// ============================================================================
import { WrongName } from "@/components/ui/button"; // Should be Button

// ============================================================================
// ERROR 4: Typo in module name
// ============================================================================
import { Custmer } from "@/types/customer"; // Should be Customer

// ============================================================================
// ERROR 5: Missing file extension
// ============================================================================
import { helper } from "./utils/helper"; // Missing .ts/.js extension

// ============================================================================
// ERROR 6: Incorrect relative path
// ============================================================================
import { Config } from "../../../config/wrong-path"; // Wrong relative path

// ============================================================================
// ERROR 7: Path alias issue
// ============================================================================
import { Tool } from "./components/tools/Tool"; // Should use @/ alias

// ============================================================================
// Test Component
// ============================================================================
export default function ABDTestPage() {
  return (
    <div>
      <h1>ABD V1 Test Page</h1>
      <p>This file intentionally contains build errors for testing.</p>

      {/* These components don't exist - intentional errors */}
      <NonExistentComponent />
      <WrongName />
    </div>
  );
}

// ============================================================================
// Expected ABD V1 Behavior:
// ============================================================================
// 1. Detect 7+ build errors
// 2. Classify by type (module_not_found, dependency_missing, etc.)
// 3. Auto-fix where possible:
//    - Install missing dependencies (if they exist in npm)
//    - Fix typos using fuzzy matching
//    - Add missing file extensions
//    - Convert to path aliases
//    - Fix import names
// 4. Report errors that require manual intervention
// 5. Create git checkpoint before fixes
// 6. Detect corruption if fixes introduce new errors
// 7. Rollback automatically if corruption detected
// ============================================================================
