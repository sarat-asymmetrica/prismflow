import { useState } from "react";
import { TemplatesSidebar } from "./components/TemplatesSidebar";
import { Toaster } from "./components/ui/sonner";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { UserRole } from "./types/template";

export default function App() {
  const [role, setRole] = useState<UserRole>("ADMIN");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const roles: UserRole[] = ["USER", "ADMIN", "SUPERADMIN"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Demo Controls */}
      <div className="fixed top-6 left-6 z-50 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="mb-4">
          <h3 className="text-[#212529] mb-2">MathAlive Templates Demo</h3>
          <p className="text-sm text-[#6C757D] mb-4">
            Experience the production-ready Templates Sidebar
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-[#6C757D] mb-2">
              User Role
            </label>
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => (
                <Badge
                  key={r}
                  onClick={() => setRole(r)}
                  className={`cursor-pointer transition-all ${
                    role === r
                      ? "bg-[#6C63FF] text-white"
                      : "bg-gray-100 text-[#6C757D] hover:bg-gray-200"
                  }`}
                >
                  {r}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              variant="outline"
              className="w-full"
            >
              {sidebarCollapsed ? "Show" : "Hide"} Sidebar
            </Button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-xs text-[#6C757D] mb-2">Features Included:</h4>
          <ul className="text-xs text-[#6C757D] space-y-1">
            <li>✓ GSAP Animations (400ms slide, stagger)</li>
            <li>✓ Search with 300ms debounce</li>
            <li>✓ 6 Template type filters</li>
            <li>✓ Role-based access control</li>
            <li>✓ Favorites, Recent, Popular sections</li>
            <li>✓ Hover effects & transitions</li>
            <li>✓ Full keyboard navigation</li>
            <li>✓ WCAG 2.1 AA compliant</li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-8 py-12 pr-[380px]">
        <div className="max-w-4xl">
          <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-200">
            <div className="mb-8">
              <div className="inline-block px-4 py-1.5 bg-[#6C63FF]/10 text-[#6C63FF] rounded-full text-sm mb-4">
                MathAlive Format v2.0
              </div>
              <h1
                className="text-[#212529] mb-4"
                style={{
                  background: "linear-gradient(135deg, #6C63FF, #5A52E0)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Templates Sidebar
              </h1>
              <p className="text-[#6C757D] text-lg">
                A production-ready component built from mathematical
                specifications
              </p>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                <h3 className="text-[#212529] mb-3">
                  Component Specifications
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[#6C757D]">Dimensions:</span>
                    <span className="ml-2 text-[#212529]">320×100vh px</span>
                  </div>
                  <div>
                    <span className="text-[#6C757D]">Animation Library:</span>
                    <span className="ml-2 text-[#212529]">GSAP v3.12+</span>
                  </div>
                  <div>
                    <span className="text-[#6C757D]">Base Frequency:</span>
                    <span className="ml-2 text-[#212529]">
                      4.909 Hz (203.7ms)
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6C757D]">Primary Color:</span>
                    <span className="ml-2 text-[#212529]">#6C63FF</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-xl border border-gray-200">
                <h3 className="text-[#212529] mb-3">Interactive Features</h3>
                <ul className="space-y-2 text-[#6C757D]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#6C63FF] mt-1">→</span>
                    <span>Search with 300ms debounce optimization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6C63FF] mt-1">→</span>
                    <span>
                      Filter by 6 template types (WhatsApp, Call, Email,
                      Meeting, Note, Task)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6C63FF] mt-1">→</span>
                    <span>Favorite toggle with optimistic updates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6C63FF] mt-1">→</span>
                    <span>Smart sections: Favorites, Recent, Popular</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#6C63FF] mt-1">→</span>
                    <span>Role-based UI (USER / ADMIN / SUPERADMIN)</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <h3 className="text-[#212529] mb-3">Animation System</h3>
                <ul className="space-y-2 text-[#6C757D]">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Sidebar slide: 400ms with power1.inOut easing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Card stagger: 50ms delay with smooth sequence</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>
                      Hover effects: scale(1.01) + border color + shadow
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>
                      Favorite toggle: rotation + scale with back.out easing
                    </span>
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-white rounded-xl border border-gray-200">
                <h3 className="text-[#212529] mb-3">Try It Out</h3>
                <p className="text-[#6C757D] mb-4">
                  The sidebar is now open on the right. Try these interactions:
                </p>
                <ul className="space-y-2 text-sm text-[#6C757D]">
                  <li>• Search for templates (e.g., "whatsapp", "meeting")</li>
                  <li>• Click filter chips to filter by type</li>
                  <li>• Hover over template cards to see animations</li>
                  <li>• Toggle favorites with the star icon</li>
                  <li>• Click "Apply" to use a template</li>
                  <li>• Switch roles to see different permissions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Sidebar */}
      <TemplatesSidebar
        userId="demo-user"
        role={role}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onApply={(template) => {
          console.log("Applied template:", template);
        }}
        onCreateNew={() => {
          console.log("Create new template");
        }}
      />

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  );
}
