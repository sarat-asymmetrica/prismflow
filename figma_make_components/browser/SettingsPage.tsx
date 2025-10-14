import { useState } from 'react';
import { X, Settings, Shield, Palette, Zap, Sliders } from 'lucide-react';
import { UniversalOptimization } from './UniversalOptimization';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';

interface SettingsPageProps {
  onClose: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  glassIntensity: number;
  onGlassIntensityChange: (value: number) => void;
  particleDensity: 'low' | 'medium' | 'high';
  onParticleDensityChange: (value: 'low' | 'medium' | 'high') => void;
  onProtocolInvoke: (protocol: string) => Promise<void>;
}

type SettingsSection = 'general' | 'privacy' | 'appearance' | 'optimization' | 'advanced';

export function SettingsPage({
  onClose,
  isDarkMode,
  onThemeToggle,
  glassIntensity,
  onGlassIntensityChange,
  particleDensity,
  onParticleDensityChange,
  onProtocolInvoke,
}: SettingsPageProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('optimization');

  const sections: { id: SettingsSection; label: string; icon: any }[] = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'optimization', label: 'Universal Optimization', icon: Zap },
    { id: 'advanced', label: 'Advanced', icon: Sliders },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 dark:bg-black/60 backdrop-blur-md animate-slide-up">
      <div className="w-full max-w-5xl h-[80vh] glass-surface rounded-3xl shadow-2xl flex overflow-hidden bg-white/95 dark:bg-transparent">
        {/* Sidebar */}
        <div className="w-64 border-r border-black/8 dark:border-white/8 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-serif tracking-tight text-gray-900 dark:text-gray-100">Settings</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:glass-surface-subtle flex items-center justify-center transition-all duration-200 text-gray-700 dark:text-gray-300"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    w-full px-4 py-3 rounded-xl text-left flex items-center gap-3 transition-all duration-200
                    ${activeSection === section.id
                      ? 'glass-surface-bright text-gray-900 dark:text-gray-100'
                      : 'hover:glass-surface-subtle text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium tracking-wide">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-transparent to-black/3 dark:to-white/5">
          {activeSection === 'general' && <GeneralSettings />}
          {activeSection === 'privacy' && <PrivacySettings />}
          {activeSection === 'appearance' && (
            <AppearanceSettings
              isDarkMode={isDarkMode}
              onThemeToggle={onThemeToggle}
              glassIntensity={glassIntensity}
              onGlassIntensityChange={onGlassIntensityChange}
              particleDensity={particleDensity}
              onParticleDensityChange={onParticleDensityChange}
            />
          )}
          {activeSection === 'optimization' && (
            <UniversalOptimization onProtocolInvoke={onProtocolInvoke} />
          )}
          {activeSection === 'advanced' && <AdvancedSettings />}
        </div>
      </div>
    </div>
  );
}

function GeneralSettings() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">General Settings</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-gray-800 dark:text-gray-200">Default Search Engine</Label>
          <select className="w-full h-10 px-3 rounded-lg glass-surface-subtle border-0 outline-none text-gray-900 dark:text-gray-100">
            <option value="duckduckgo">DuckDuckGo</option>
            <option value="google">Google</option>
            <option value="brave">Brave Search</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-800 dark:text-gray-200">Homepage URL</Label>
          <input
            type="text"
            defaultValue="https://www.google.com"
            className="w-full h-10 px-3 rounded-lg glass-surface-subtle border-0 outline-none text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-800 dark:text-gray-200">New Tab Behavior</Label>
          <select className="w-full h-10 px-3 rounded-lg glass-surface-subtle border-0 outline-none text-gray-900 dark:text-gray-100">
            <option value="blank">Blank Page</option>
            <option value="homepage">Homepage</option>
            <option value="last">Last Session</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function PrivacySettings() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Privacy & Security</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl glass-surface-subtle">
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">Block Trackers</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Prevent tracking scripts from running</div>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl glass-surface-subtle">
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">Block Ads</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Hide advertisements on websites</div>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-800 dark:text-gray-200">Cookie Policy</Label>
          <select className="w-full h-10 px-3 rounded-lg bg-white/90 dark:bg-white/5 glass-surface-subtle border-0 outline-none text-gray-900 dark:text-gray-100">
            <option value="all">Allow All Cookies</option>
            <option value="third-party">Block Third-Party</option>
            <option value="none">Block All Cookies</option>
          </select>
        </div>

        <button className="w-full h-10 px-4 rounded-lg glass-surface hover:glass-surface-bright transition-all text-gray-900 dark:text-gray-100 font-medium">
          Clear Browsing Data
        </button>
      </div>
    </div>
  );
}

interface AppearanceSettingsProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
  glassIntensity: number;
  onGlassIntensityChange: (value: number) => void;
  particleDensity: 'low' | 'medium' | 'high';
  onParticleDensityChange: (value: 'low' | 'medium' | 'high') => void;
}

function AppearanceSettings({
  isDarkMode,
  onThemeToggle,
  glassIntensity,
  onGlassIntensityChange,
  particleDensity,
  onParticleDensityChange,
}: AppearanceSettingsProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Appearance</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl glass-surface-subtle">
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Use dark color scheme</div>
          </div>
          <Switch checked={isDarkMode} onCheckedChange={onThemeToggle} />
        </div>

        <div className="space-y-3 p-4 rounded-xl glass-surface-subtle">
          <div className="flex items-center justify-between">
            <Label className="text-gray-800 dark:text-gray-200">Glass Effect Intensity</Label>
            <span className="text-sm text-gray-600 dark:text-gray-400">{glassIntensity}px</span>
          </div>
          <Slider
            value={[glassIntensity]}
            onValueChange={([value]) => onGlassIntensityChange(value)}
            min={0}
            max={30}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-800 dark:text-gray-200">Particle Density</Label>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as const).map((density) => (
              <button
                key={density}
                onClick={() => onParticleDensityChange(density)}
                className={`
                  h-10 px-4 rounded-lg transition-all capitalize font-medium
                  ${particleDensity === density
                    ? 'glass-surface-bright text-gray-900 dark:text-gray-100'
                    : 'glass-surface-subtle hover:glass-surface text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                {density}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdvancedSettings() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Advanced Settings</h3>
      
      <div className="space-y-4">
        <div className="space-y-3 p-4 rounded-xl glass-surface-subtle">
          <div className="flex items-center justify-between">
            <Label className="text-gray-800 dark:text-gray-200">Memory Limit</Label>
            <span className="text-sm text-gray-600 dark:text-gray-400">512 MB</span>
          </div>
          <Slider defaultValue={[512]} min={256} max={2048} step={256} />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
            <span>256MB</span>
            <span>2GB</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl glass-surface-subtle">
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">Hardware Acceleration</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Use GPU for rendering</div>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl glass-surface-subtle">
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">Enable Dev Tools</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Show developer console</div>
          </div>
          <Switch />
        </div>

        <button className="w-full h-10 px-4 rounded-lg glass-surface hover:glass-surface-bright transition-all text-gray-900 dark:text-gray-100 font-medium">
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}



