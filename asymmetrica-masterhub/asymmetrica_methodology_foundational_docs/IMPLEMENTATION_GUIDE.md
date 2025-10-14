# Asymm Standards Implementation Guide
## Practical Application Framework

**Version**: 1.0  
**Date**: September 13, 2025  
**Purpose**: Step-by-step implementation of Asymm coding standards

---

## Quick Start Guide

### New Project Setup

```bash
# 1. Initialize project with standard structure
mkdir my-project && cd my-project
npm init -y

# 2. Install standard tooling
npm install -D typescript eslint prettier jest
npm install -D @types/node @types/jest

# 3. Copy standard configurations
cp $ASYMM_STANDARDS/configs/.eslintrc.js .
cp $ASYMM_STANDARDS/configs/tsconfig.json .
cp $ASYMM_STANDARDS/configs/jest.config.js .

# 4. Create standard directory structure
mkdir -p src/{core,features,utils} tests/{unit,integration,performance} docs
```

### Project Structure Template

```
my-project/
├── src/
│   ├── core/
│   │   ├── index.ts         # Core exports
│   │   ├── engine.ts        # Main business logic
│   │   └── types.ts         # Type definitions
│   ├── features/
│   │   ├── feature-a/
│   │   │   ├── index.ts
│   │   │   ├── service.ts
│   │   │   └── service.test.ts
│   │   └── feature-b/
│   └── utils/
│       ├── constants.ts     # Mathematical constants
│       ├── performance.ts   # Performance utilities
│       └── validation.ts    # Input validation
├── tests/
│   ├── unit/
│   ├── integration/
│   └── performance/
│       └── benchmark.ts
├── docs/
│   ├── README.md
│   ├── ARCHITECTURE.md
│   └── API.md
└── package.json
```

---

## Pattern Library

### 1. Service Pattern

**Use Case**: Business logic encapsulation

```typescript
// user-service.ts
interface User {
    id: string;
    name: string;
    email: string;
}

interface UserService {
    getUser(id: string): Promise<User>;
    createUser(data: Omit<User, 'id'>): Promise<User>;
    updateUser(id: string, data: Partial<User>): Promise<User>;
    deleteUser(id: string): Promise<void>;
}

class UserServiceImpl implements UserService {
    private cache = new Map<string, User>();
    
    async getUser(id: string): Promise<User> {
        // Check cache first (performance optimization)
        if (this.cache.has(id)) {
            return this.cache.get(id)!;
        }
        
        // Fetch from database
        const user = await this.fetchFromDB(id);
        this.cache.set(id, user);
        return user;
    }
    
    async createUser(data: Omit<User, 'id'>): Promise<User> {
        const user = {
            id: this.generateId(),
            ...data
        };
        
        await this.saveToDB(user);
        this.cache.set(user.id, user);
        return user;
    }
    
    async updateUser(id: string, data: Partial<User>): Promise<User> {
        const existing = await this.getUser(id);
        const updated = { ...existing, ...data };
        
        await this.saveToDB(updated);
        this.cache.set(id, updated);
        return updated;
    }
    
    async deleteUser(id: string): Promise<void> {
        await this.deleteFromDB(id);
        this.cache.delete(id);
    }
    
    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36);
    }
    
    private async fetchFromDB(id: string): Promise<User> {
        // Database implementation
        throw new Error('Not implemented');
    }
    
    private async saveToDB(user: User): Promise<void> {
        // Database implementation
    }
    
    private async deleteFromDB(id: string): Promise<void> {
        // Database implementation
    }
}

// Export singleton instance
export const userService: UserService = new UserServiceImpl();
```

### 2. Performance Pattern

**Use Case**: High-performance data processing

```typescript
// performance-processor.ts
class PerformanceProcessor {
    private readonly BATCH_SIZE = 1000;
    private readonly WORKER_POOL_SIZE = 4;
    private readonly cache = new Map();
    
    /**
     * Process large dataset efficiently
     * Uses batching, caching, and parallel processing
     */
    async processLargeDataset<T, R>(
        data: T[],
        processor: (item: T) => R
    ): Promise<R[]> {
        // Return cached result if available
        const cacheKey = this.getCacheKey(data);
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        // Split into batches for parallel processing
        const batches = this.createBatches(data, this.BATCH_SIZE);
        
        // Process batches in parallel
        const results = await Promise.all(
            batches.map(batch => this.processBatch(batch, processor))
        );
        
        // Flatten results
        const flattened = results.flat();
        
        // Cache for future use
        this.cache.set(cacheKey, flattened);
        
        return flattened;
    }
    
    private createBatches<T>(data: T[], batchSize: number): T[][] {
        const batches: T[][] = [];
        for (let i = 0; i < data.length; i += batchSize) {
            batches.push(data.slice(i, i + batchSize));
        }
        return batches;
    }
    
    private async processBatch<T, R>(
        batch: T[],
        processor: (item: T) => R
    ): Promise<R[]> {
        return batch.map(processor);
    }
    
    private getCacheKey(data: any[]): string {
        // Simple hash for demo - use proper hashing in production
        return `${data.length}_${JSON.stringify(data[0])}`;
    }
}

export const performanceProcessor = new PerformanceProcessor();
```

### 3. Mathematical Optimization Pattern

**Use Case**: Animation and UI calculations

```typescript
// animation-engine.ts
class AnimationEngine {
    private readonly PHI = 1.618033988;  // Golden ratio
    private readonly frameRate = 60;
    private animations = new Map<string, Animation>();
    
    /**
     * Create naturally flowing animation using golden ratio
     */
    createAnimation(
        element: HTMLElement,
        property: string,
        target: number,
        duration: number
    ): string {
        const animationId = this.generateId();
        const startValue = this.getCurrentValue(element, property);
        const startTime = performance.now();
        
        const animation: Animation = {
            element,
            property,
            startValue,
            target,
            duration,
            startTime,
            easing: this.goldenEasing.bind(this)
        };
        
        this.animations.set(animationId, animation);
        this.startAnimationLoop();
        
        return animationId;
    }
    
    /**
     * Golden ratio-based easing function
     * Creates natural, pleasing motion
     */
    private goldenEasing(t: number): number {
        // Use golden ratio for natural deceleration
        const factor = 1 / this.PHI;
        return 1 - Math.pow(1 - t, this.PHI);
    }
    
    private startAnimationLoop(): void {
        const update = (currentTime: number) => {
            let hasActiveAnimations = false;
            
            this.animations.forEach((animation, id) => {
                const elapsed = currentTime - animation.startTime;
                const progress = Math.min(elapsed / animation.duration, 1);
                
                if (progress < 1) {
                    hasActiveAnimations = true;
                    const eased = animation.easing(progress);
                    const value = animation.startValue + 
                        (animation.target - animation.startValue) * eased;
                    
                    this.applyValue(
                        animation.element,
                        animation.property,
                        value
                    );
                } else {
                    // Animation complete
                    this.applyValue(
                        animation.element,
                        animation.property,
                        animation.target
                    );
                    this.animations.delete(id);
                }
            });
            
            if (hasActiveAnimations) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    }
    
    private getCurrentValue(element: HTMLElement, property: string): number {
        const style = getComputedStyle(element);
        return parseFloat(style.getPropertyValue(property)) || 0;
    }
    
    private applyValue(
        element: HTMLElement,
        property: string,
        value: number
    ): void {
        element.style.setProperty(property, `${value}px`);
    }
    
    private generateId(): string {
        return `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

interface Animation {
    element: HTMLElement;
    property: string;
    startValue: number;
    target: number;
    duration: number;
    startTime: number;
    easing: (t: number) => number;
}

export const animationEngine = new AnimationEngine();
```

### 4. Error Handling Pattern

**Use Case**: Robust error management

```typescript
// error-handler.ts
enum ErrorCode {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
    PERMISSION_ERROR = 'PERMISSION_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

class ApplicationError extends Error {
    constructor(
        message: string,
        public code: ErrorCode,
        public statusCode: number,
        public details?: any
    ) {
        super(message);
        this.name = 'ApplicationError';
    }
    
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            details: this.details,
            timestamp: new Date().toISOString()
        };
    }
}

class ErrorHandler {
    private readonly logger = console; // Replace with actual logger
    
    /**
     * Wrap async function with error handling
     */
    wrapAsync<T extends (...args: any[]) => Promise<any>>(
        fn: T,
        context?: string
    ): T {
        return (async (...args: Parameters<T>) => {
            try {
                return await fn(...args);
            } catch (error) {
                return this.handle(error, context);
            }
        }) as T;
    }
    
    /**
     * Central error handling
     */
    handle(error: unknown, context?: string): never {
        const appError = this.normalize(error);
        
        // Log error with context
        this.logger.error({
            context,
            error: appError.toJSON(),
            stack: appError.stack
        });
        
        // Re-throw for upstream handling
        throw appError;
    }
    
    /**
     * Convert any error to ApplicationError
     */
    private normalize(error: unknown): ApplicationError {
        if (error instanceof ApplicationError) {
            return error;
        }
        
        if (error instanceof Error) {
            // Map known error types
            if (error.message.includes('Network')) {
                return new ApplicationError(
                    error.message,
                    ErrorCode.NETWORK_ERROR,
                    503
                );
            }
            
            if (error.message.includes('Validation')) {
                return new ApplicationError(
                    error.message,
                    ErrorCode.VALIDATION_ERROR,
                    400
                );
            }
            
            // Default error
            return new ApplicationError(
                error.message,
                ErrorCode.UNKNOWN_ERROR,
                500,
                { originalError: error.name }
            );
        }
        
        // Non-Error thrown
        return new ApplicationError(
            'An unknown error occurred',
            ErrorCode.UNKNOWN_ERROR,
            500,
            { originalError: String(error) }
        );
    }
}

export const errorHandler = new ErrorHandler();

// Usage example
const safeFunction = errorHandler.wrapAsync(
    async (data: any) => {
        // Your async logic here
        if (!data) {
            throw new Error('Validation failed: data required');
        }
        return processData(data);
    },
    'DataProcessor'
);
```

---

## Testing Templates

### Unit Test Template

```typescript
// service.test.ts
import { userService } from './user-service';

describe('UserService', () => {
    // Setup and teardown
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    describe('getUser', () => {
        it('should return user for valid ID', async () => {
            // Arrange
            const userId = '123';
            const expectedUser = {
                id: userId,
                name: 'Test User',
                email: 'test@example.com'
            };
            
            // Act
            const result = await userService.getUser(userId);
            
            // Assert
            expect(result).toEqual(expectedUser);
        });
        
        it('should throw error for invalid ID', async () => {
            // Arrange
            const invalidId = 'invalid';
            
            // Act & Assert
            await expect(userService.getUser(invalidId))
                .rejects
                .toThrow('User not found');
        });
        
        it('should use cache on second call', async () => {
            // Arrange
            const userId = '123';
            const spy = jest.spyOn(userService as any, 'fetchFromDB');
            
            // Act
            await userService.getUser(userId);
            await userService.getUser(userId);
            
            // Assert
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });
});
```

### Performance Test Template

```typescript
// benchmark.test.ts
import { performanceProcessor } from './performance-processor';

describe('Performance Benchmarks', () => {
    const generateTestData = (size: number) => {
        return Array.from({ length: size }, (_, i) => ({
            id: i,
            value: Math.random()
        }));
    };
    
    it('should process 10,000 items in under 100ms', async () => {
        // Arrange
        const testData = generateTestData(10000);
        const processor = (item: any) => item.value * 2;
        
        // Act
        const start = performance.now();
        await performanceProcessor.processLargeDataset(testData, processor);
        const duration = performance.now() - start;
        
        // Assert
        expect(duration).toBeLessThan(100);
    });
    
    it('should scale linearly with data size', async () => {
        // Test different data sizes
        const sizes = [1000, 5000, 10000, 50000];
        const durations: number[] = [];
        
        for (const size of sizes) {
            const testData = generateTestData(size);
            const processor = (item: any) => item.value * 2;
            
            const start = performance.now();
            await performanceProcessor.processLargeDataset(testData, processor);
            durations.push(performance.now() - start);
        }
        
        // Check linear scaling (roughly)
        const ratio1 = durations[1] / durations[0];
        const ratio2 = durations[2] / durations[1];
        const ratio3 = durations[3] / durations[2];
        
        // Ratios should be similar if scaling is linear
        expect(Math.abs(ratio1 - ratio2)).toBeLessThan(2);
        expect(Math.abs(ratio2 - ratio3)).toBeLessThan(2);
    });
});
```

---

## Migration Guide

### Migrating Existing Projects

#### Step 1: Audit Current Code
```bash
# Generate complexity report
npx complexity-report src/**/*.js > complexity-report.txt

# Check for common issues
npx eslint src --format json > eslint-report.json

# Measure current performance
npm run benchmark > baseline-performance.txt
```

#### Step 2: Incremental Migration
```typescript
// 1. Start with utilities and constants
// OLD: magic numbers scattered
const TIMEOUT = 5000;
const MAX_RETRIES = 3;

// NEW: centralized constants
// utils/constants.ts
export const NETWORK = {
    TIMEOUT: 5000,
    MAX_RETRIES: 3,
    BACKOFF_FACTOR: 1.5
} as const;

// 2. Migrate services one at a time
// OLD: mixed concerns
class UserManager {
    getUser() { /* database + cache + validation */ }
}

// NEW: separated concerns
class UserService {
    constructor(
        private db: DatabaseService,
        private cache: CacheService,
        private validator: ValidationService
    ) {}
    
    async getUser(id: string) {
        this.validator.validateId(id);
        return this.cache.get(id) || this.db.getUser(id);
    }
}
```

#### Step 3: Validate Improvements
```bash
# Compare complexity
npx complexity-report src/**/*.ts > new-complexity-report.txt
diff baseline-performance.txt new-complexity-report.txt

# Run performance benchmarks
npm run benchmark > new-performance.txt
diff baseline-performance.txt new-performance.txt

# Ensure tests still pass
npm test
```

---

## Common Pitfalls and Solutions

### Pitfall 1: Over-Optimization

**Problem**: Spending time optimizing non-critical paths
```typescript
// BAD: Over-optimizing rarely-used function
function calculateRareMetric(data: number[]) {
    // Complex optimization for function called once per day
    // 500 lines of optimized code
}
```

**Solution**: Profile first, optimize hotspots
```typescript
// GOOD: Simple implementation for rare operations
function calculateRareMetric(data: number[]) {
    return data.reduce((sum, n) => sum + n, 0) / data.length;
}

// Optimize only measured bottlenecks
function processHotPath(data: LargeDataset) {
    // This runs 1000x per second - worth optimizing
    return optimizedAlgorithm(data);
}
```

### Pitfall 2: Premature Abstraction

**Problem**: Creating abstractions before understanding the domain
```typescript
// BAD: Generic abstraction without clear use case
class AbstractDataProcessor<T, R, C extends Context> {
    process(data: T, context: C): R {
        // Complex generic implementation
    }
}
```

**Solution**: Start concrete, abstract when patterns emerge
```typescript
// GOOD: Concrete implementation first
class UserDataProcessor {
    processUser(user: User): ProcessedUser {
        // Specific, clear implementation
    }
}

// Abstract only after 3+ similar implementations
interface DataProcessor<T, R> {
    process(data: T): R;
}
```

### Pitfall 3: Ignoring Platform Capabilities

**Problem**: Reimplementing platform features
```typescript
// BAD: Custom animation system
class CustomAnimator {
    animate() {
        // 1000 lines reimplementing requestAnimationFrame
    }
}
```

**Solution**: Use platform APIs
```typescript
// GOOD: Leverage platform capabilities
function animate(element: HTMLElement, keyframes: Keyframe[]) {
    return element.animate(keyframes, {
        duration: 1000,
        easing: 'ease-in-out'
    });
}
```

---

## Tooling Configuration

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### ESLint Configuration
```javascript
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint', 'performance'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:performance/recommended'
  ],
  rules: {
    // Complexity limits
    'complexity': ['error', 10],
    'max-depth': ['error', 3],
    'max-lines': ['error', 500],
    'max-lines-per-function': ['error', 50],
    'max-params': ['error', 4],
    
    // Code quality
    'no-console': 'error',
    'no-debugger': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/explicit-function-return-type': 'warn',
    
    // Performance
    'performance/no-delete': 'error',
    'performance/prefer-optional-chain': 'error'
  }
};
```

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

---

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Lint
      run: npm run lint
    
    - name: Type check
      run: npm run type-check
    
    - name: Test
      run: npm test -- --coverage
    
    - name: Performance benchmarks
      run: npm run benchmark
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
    
    - name: Build
      run: npm run build
```

---

## Conclusion

This implementation guide provides practical templates and patterns for applying Asymm coding standards. Key takeaways:

1. **Start with templates**: Use provided patterns as starting points
2. **Measure improvements**: Always benchmark before and after changes
3. **Incremental adoption**: Migrate gradually, validating at each step
4. **Tool support**: Leverage automated tools for consistency
5. **Continuous improvement**: Standards evolve with project needs

Remember: The goal is not perfection but consistent, measurable improvement in code quality, performance, and maintainability.