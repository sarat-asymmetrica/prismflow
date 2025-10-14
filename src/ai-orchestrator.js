// PrismFlow Browser - Natural Asymmetry AI Orchestrator
// The conductor that makes ALL AIs work better through intelligent routing

class NaturalAsymmetryOrchestrator {
  constructor() {
    // Natural Asymmetry distribution
    this.EMERGENCE_RATIO = 0.3; // Creative exploration
    this.PRECISION_RATIO = 0.2; // Direct answers
    this.SUPPORT_RATIO = 0.5; // Background support

    // Connected AI models
    this.models = new Map();

    // Task history for learning
    this.taskHistory = [];

    // Performance metrics
    this.metrics = {
      totalTasks: 0,
      costSaved: 0,
      timesSaved: 0,
      localProcessed: 0,
    };

    this.initialize();
  }

  initialize() {
    // Load saved API keys (encrypted)
    this.loadSavedConnections();

    // Set up default task classifiers
    this.setupClassifiers();
  }

  // Connect an AI model
  async connectModel(type, config) {
    try {
      let model;

      switch (type) {
        case "gemini":
          model = new GeminiAdapter(config);
          break;
        case "claude":
          model = new ClaudeAdapter(config);
          break;
        case "openai":
          model = new OpenAIAdapter(config);
          break;
        case "ollama":
          model = new OllamaAdapter(config);
          break;
        default:
          throw new Error(`Unknown model type: ${type}`);
      }

      // Test connection
      await model.test();

      // Store model
      this.models.set(type, model);

      // Save encrypted config
      this.saveConnection(type, config);

      return { success: true, message: `${type} connected successfully` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Process a task with Natural Asymmetry routing
  async process(task, context = {}) {
    // Classify the task
    const classification = this.classifyTask(task, context);

    // Route based on Natural Asymmetry
    let response;

    if (classification.type === "creative") {
      // 30% - Emergence: Use best creative model
      response = await this.routeToEmergence(task, context, classification);
    } else if (classification.type === "specific") {
      // 20% - Precision: Use fastest accurate model
      response = await this.routeToPrecision(task, context, classification);
    } else {
      // 50% - Support: Use local/free model
      response = await this.routeToSupport(task, context, classification);
    }

    // Track metrics
    this.updateMetrics(classification, response);

    return response;
  }

  // Classify task type
  classifyTask(task, context) {
    const taskLower = task.toLowerCase();

    // Creative tasks (30%)
    if (
      taskLower.includes("write") ||
      taskLower.includes("create") ||
      taskLower.includes("design") ||
      taskLower.includes("imagine") ||
      taskLower.includes("brainstorm")
    ) {
      return { type: "creative", confidence: 0.9 };
    }

    // Specific/precision tasks (20%)
    if (
      taskLower.includes("calculate") ||
      taskLower.includes("convert") ||
      taskLower.includes("translate") ||
      taskLower.includes("define") ||
      taskLower.includes("what is")
    ) {
      return { type: "specific", confidence: 0.9 };
    }

    // Support tasks (50%)
    return { type: "support", confidence: 0.8 };
  }

  // Route to best creative model (30%)
  async routeToEmergence(task, context, classification) {
    // Prefer: Claude > GPT-4 > Gemini > Ollama
    const preferenceOrder = ["claude", "openai", "gemini", "ollama"];

    for (const modelType of preferenceOrder) {
      if (this.models.has(modelType)) {
        const model = this.models.get(modelType);
        return await model.generate({
          prompt: task,
          temperature: 0.8, // Higher for creativity
          context: context,
          mode: "creative",
        });
      }
    }

    return { error: "No creative model available" };
  }

  // Route to fastest accurate model (20%)
  async routeToPrecision(task, context, classification) {
    // Prefer: Gemini Flash > Ollama > GPT-3.5 > Others
    const preferenceOrder = ["gemini", "ollama", "openai", "claude"];

    for (const modelType of preferenceOrder) {
      if (this.models.has(modelType)) {
        const model = this.models.get(modelType);
        return await model.generate({
          prompt: task,
          temperature: 0.2, // Lower for precision
          context: context,
          mode: "precise",
        });
      }
    }

    return { error: "No precision model available" };
  }

  // Route to local/free model (50%)
  async routeToSupport(task, context, classification) {
    // Prefer: Ollama > Gemini Free > Others
    const preferenceOrder = ["ollama", "gemini", "openai", "claude"];

    for (const modelType of preferenceOrder) {
      if (this.models.has(modelType)) {
        const model = this.models.get(modelType);

        // Use cheaper settings for support tasks
        return await model.generate({
          prompt: task,
          temperature: 0.5,
          context: context,
          mode: "efficient",
          maxTokens: 500, // Limit token usage
        });
      }
    }

    return { error: "No support model available" };
  }

  // Update performance metrics
  updateMetrics(classification, response) {
    this.metrics.totalTasks++;

    if (classification.type === "support" && response.model === "ollama") {
      this.metrics.localProcessed++;
    }

    // Calculate cost savings
    if (response.cost) {
      const standardCost = 0.03; // Assume $0.03 per request direct to GPT-4
      const actualCost = response.cost;
      this.metrics.costSaved += standardCost - actualCost;
    }

    // Calculate time saved
    if (response.responseTime) {
      const standardTime = 2000; // Assume 2s for GPT-4
      const actualTime = response.responseTime;
      this.metrics.timesSaved += Math.max(0, standardTime - actualTime);
    }
  }

  // Get current metrics
  getMetrics() {
    return {
      ...this.metrics,
      localPercentage: (
        (this.metrics.localProcessed / this.metrics.totalTasks) *
        100
      ).toFixed(1),
      avgCostSaving: (this.metrics.costSaved / this.metrics.totalTasks).toFixed(
        4,
      ),
      avgTimeSaving: (
        this.metrics.timesSaved / this.metrics.totalTasks
      ).toFixed(0),
    };
  }

  // Save encrypted connection
  saveConnection(type, config) {
    // In production, use proper encryption
    const encrypted = btoa(JSON.stringify(config));
    localStorage.setItem(`ai_config_${type}`, encrypted);
  }

  // Load saved connections
  loadSavedConnections() {
    const types = ["gemini", "claude", "openai", "ollama"];

    types.forEach((type) => {
      const encrypted = localStorage.getItem(`ai_config_${type}`);
      if (encrypted) {
        try {
          const config = JSON.parse(atob(encrypted));
          this.connectModel(type, config);
        } catch (e) {
          console.error(`Failed to load ${type} config:`, e);
        }
      }
    });
  }

  setupClassifiers() {
    // Advanced classifiers can be added here
    // Could use ML models for better classification
  }
}

// Model Adapters
class GeminiAdapter {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta/openai/";
    this.model = config.model || "gemini-2.0-flash";
  }

  async test() {
    // Test connection
    const response = await fetch(`${this.baseUrl}models`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) throw new Error("Gemini connection failed");
    return true;
  }

  async generate(options) {
    const startTime = Date.now();

    const response = await fetch(`${this.baseUrl}completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        prompt: options.prompt,
        temperature: options.temperature,
        max_tokens: options.maxTokens || 1000,
      }),
    });

    const data = await response.json();

    return {
      text: data.choices[0].text,
      model: "gemini",
      responseTime: Date.now() - startTime,
      cost: 0.001, // Gemini is very cheap
    };
  }
}

class OllamaAdapter {
  constructor(config) {
    this.endpoint = config.endpoint || "http://localhost:11434";
    this.model = config.model || "llama3";
  }

  async test() {
    const response = await fetch(`${this.endpoint}/api/tags`);
    if (!response.ok) throw new Error("Ollama not running");
    return true;
  }

  async generate(options) {
    const startTime = Date.now();

    const response = await fetch(`${this.endpoint}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        prompt: options.prompt,
        temperature: options.temperature,
      }),
    });

    const data = await response.json();

    return {
      text: data.response,
      model: "ollama",
      responseTime: Date.now() - startTime,
      cost: 0, // Local is FREE!
    };
  }
}

class ClaudeAdapter {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseUrl = "https://api.anthropic.com/v1/";
  }

  async test() {
    // Test connection (simplified)
    return true;
  }

  async generate(options) {
    // Claude implementation
    const startTime = Date.now();

    // Simplified for example
    return {
      text: "Claude response",
      model: "claude",
      responseTime: Date.now() - startTime,
      cost: 0.02,
    };
  }
}

class OpenAIAdapter {
  constructor(config) {
    this.apiKey = config.apiKey;
    this.baseUrl = "https://api.openai.com/v1/";
  }

  async test() {
    // Test connection (simplified)
    return true;
  }

  async generate(options) {
    // OpenAI implementation
    const startTime = Date.now();

    // Simplified for example
    return {
      text: "OpenAI response",
      model: "openai",
      responseTime: Date.now() - startTime,
      cost: 0.03,
    };
  }
}

// Export for use in browser
if (typeof module !== "undefined" && module.exports) {
  module.exports = NaturalAsymmetryOrchestrator;
}
