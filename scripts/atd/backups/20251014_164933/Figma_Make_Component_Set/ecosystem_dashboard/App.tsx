/**
 * AsymmFlow Demo Application
 * Showcasing Socket-Driven Figma Handoff Components
 *
 * @asymmetrica: DemoApp
 * symbol: App.Root
 * scope: global
 * regime: Exploration
 */

import { useState } from "react";
import TasksCardAppliance from "./components/TasksCardAppliance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Badge } from "./components/ui/badge";
import { Switch } from "./components/ui/switch";
import { Label } from "./components/ui/label";

export default function App() {
  const [role, setRole] = useState<"sales" | "accountant" | "management">(
    "sales",
  );
  const [enablePulse, setEnablePulse] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-gray-900">
              🔌 AsymmFlow Socket-Driven Components
            </h1>
            <Badge variant="outline" className="text-primary border-primary">
              v1.0 - Prototype
            </Badge>
          </div>
          <p className="text-gray-600">
            Precision UI/UX components generated from real backend socket
            specifications
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <h3 className="text-gray-900 mb-4">Component Configuration</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role Selector */}
            <div>
              <Label className="text-gray-700 mb-3 block">
                User Role (RBAC Testing)
              </Label>
              <Tabs
                value={role}
                onValueChange={(v) => setRole(v as any)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="sales">Sales</TabsTrigger>
                  <TabsTrigger value="accountant">Accountant</TabsTrigger>
                  <TabsTrigger value="management">Management</TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-xs text-gray-500 mt-2">
                Tasks are filtered based on role permissions
              </p>
            </div>

            {/* Pulse Control */}
            <div>
              <Label className="text-gray-700 mb-3 block">
                Auto-Sync Pulse (4.909 Hz)
              </Label>
              <div className="flex items-center space-x-3">
                <Switch
                  checked={enablePulse}
                  onCheckedChange={setEnablePulse}
                  id="pulse-toggle"
                />
                <Label
                  htmlFor="pulse-toggle"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  {enablePulse
                    ? "Enabled - 203.7ms period (5min cache)"
                    : "Disabled - Manual refresh only"}
                </Label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Harmonic 3-6-9 retry cycle: 611ms, 1222ms, 1833ms
              </p>
            </div>
          </div>
        </div>

        {/* Socket Specifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-xs uppercase text-gray-500 mb-2">
              Socket Endpoint
            </div>
            <code className="text-sm text-primary bg-blue-50 px-2 py-1 rounded block">
              GET /api/tasks
            </code>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-xs uppercase text-gray-500 mb-2">
              Authentication
            </div>
            <code className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded block">
              HTX-V1.2 ✓
            </code>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-xs uppercase text-gray-500 mb-2">
              Semantic Annotations
            </div>
            <code className="text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded block">
              σ:TaskRetrieval, ρ:Module, γ:Exploration
            </code>
          </div>
        </div>

        {/* Component Showcase */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 shadow-xl border border-gray-200">
          <div className="mb-6">
            <h2 className="text-gray-900 mb-2">
              ECOSYSTEM 1: CONSCIOUSNESS - Tasks Card
            </h2>
            <p className="text-gray-600 text-sm">
              Real-time task management appliance connected to backend socket
            </p>
          </div>

          {/* The Main Component */}
          <div className="max-w-2xl mx-auto">
            <TasksCardAppliance role={role} enablePulse={enablePulse} />
          </div>

          {/* Technical Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm text-gray-700 mb-4">Component Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-600">Socket Connection</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-600">Motion Animations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-600">Loading States</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-600">Error Handling</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-600">Empty States</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-600">RBAC Filtering</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-600">Type Safety</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-gray-600">Responsive Design</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Components */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-sm border border-dashed border-gray-300">
          <h3 className="text-gray-900 mb-3">🎯 Next Components to Build</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-primary">→</span>
              <span>Goals Gauge (Consciousness)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-primary">→</span>
              <span>Quick Actions (Consciousness)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-primary">→</span>
              <span>Customer Preview (Consciousness)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-primary">→</span>
              <span>Capture Form (Capture Ecosystem)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
