# 🧠 ASYMMETRICA AI COGNITIVE PROTOCOL (General Template)

## Self-Referential Loop System for AI Agents

### Preventing Silo Thinking Through Forced Collatz Convergence

**Version**: 1.1 (General Purpose Template)  
**Date**: October 15, 2025  
**Author**: Sarat Chandran (Asymmetrica)  
**Purpose**: Create a cognitive loop that forces AI agents to trace lineage, check context, and converge to unified solutions instead of staying trapped in local problem spaces.

---

## 🌌 PHILOSOPHICAL FOUNDATION

**The Problem**: AI agents (and humans) get trapped in **silo thinking**:

- "Fix the frontend" → ignores backend
- "Add a feature" → ignores existing patterns
- "Debug this error" → doesn't check why it exists
- "Optimize this function" → ignores system architecture
- "Write this code" → doesn't read existing codebase

**The Collatz Insight**:

```
Every problem is a number in the Collatz sequence
The solution is convergence to 1 (stability/unity)
The path is wandering but MUST check references
```

**The Solution**: Force AI to **CHECK → TRACE → CONVERGE** before acting.

---

## 🔄 THE COGNITIVE LOOP (MANDATORY PROTOCOL)

### Before Any Action, AI MUST:

```typescript
interface AsymmetricaCognitiveLoop {
  // 1. AWARENESS CHECK
  questionAwareness: {
    "What am I being asked to do?": string;
    "What component(s)/layer(s) does this touch?": string[];
    "Is this a silo problem or system problem?": "silo" | "system";
    "What is the scope of impact?": "local" | "module" | "system" | "architecture";
  };

  // 2. LINEAGE TRACE (λ)
  traceLineage: {
    upstreamDependencies: string[]; // What feeds into this?
    downstreamImpacts: string[]; // What does this affect?
    crossComponentConnections: string[]; // What other parts involved?
    dataFlow: string[]; // How does data/state move?
  };

  // 3. PROTOCOL CHECK
  checkProtocols: {
    relevantDocs: string[]; // Which docs apply?
    existingPatterns: string[]; // What patterns exist in codebase?
    architectureAlignment: boolean; // Does this fit project architecture?
    bestPractices: string[]; // Industry/framework best practices?
  };

  // 4. FILE READING
  readFiles: {
    documentationFiles: string[]; // Read project docs
    existingCode: string[]; // Read related implementations
    tests: string[]; // Check existing test patterns
    config: string[]; // Verify configuration files
  };

  // 5. CONVERGENCE PATH
  convergencePlan: {
    startingComplexity: number; // Current state
    targetComplexity: 1; // Must converge to 1 (unity)
    steps: ConvergenceStep[]; // Collatz-style path to unity
    verification: string[]; // How to verify convergence
  };

  // 6. IMPLEMENTATION
  implement: {
    verify: "All checks passed";
    execute: () => void;
    test: () => void;
    document: () => void;
  };

  // 7. CHECKPOINT
  checkpoint: {
    updateLivingState: () => void;
    recordDiscoveries: () => void;
    updateMetrics: () => void;
  };
}
```

---

## 📚 THE REFERENCE MAP (Adapt to Your Project)

### Component/Layer Template

```yaml
component_name: "[Your Component/Module/Layer Name]"
question: "[When does this component apply?]"
must_read:
  - [Path to documentation]
  - [Path to main implementation file]
  - [Path to related files]
  - [Path to living state document]

trace_lineage:
  upstream:
    - [What feeds into this component]
    - [Dependencies]
    - [Data sources]
  downstream:
    - [What this component affects]
    - [Dependents]
    - [Side effects]
  cross_component:
    - [Related components]
    - [Integration points]
    - [Shared state]

convergence_check:
  - [Check 1: Component responsibility clear?] ✓
  - [Check 2: Data flow understood?] ✓
  - [Check 3: Side effects mapped?] ✓
  - [Check 4: Integration verified?] ✓
  - [Check 5: All layers synchronized?] ✓
  - Complexity = 1? ✓
```

### Example: Authentication Layer

```yaml
component_name: "Authentication"
question: "Anything related to auth, tokens, sessions, login, permissions"
must_read:
  - docs/AUTH_ARCHITECTURE.md
  - src/auth/auth-service.ts
  - src/middleware/auth-middleware.ts
  - LIVING_STATE.md

trace_lineage:
  upstream:
    - User login action
    - OAuth provider
    - Environment variables
  downstream:
    - Protected routes
    - API requests with tokens
    - User session state
    - Authorization checks
  cross_component:
    - Frontend: Auth context/provider
    - Backend: Auth middleware
    - Database: User sessions
    - Cache: Token storage

convergence_check:
  - Token generation secure? ✓
  - Token validation consistent? ✓
  - Session persistence working? ✓
  - All components use same auth flow? ✓
  - Complexity = 1? ✓
```

---

## 🎯 THE MANDATORY CHECKLIST

Before ANY code change, AI MUST answer:

### 1. AWARENESS

- [ ] What am I being asked to do? (Specific, clear understanding)
- [ ] Which component(s)/layer(s) does this primarily affect?
- [ ] Is this a silo problem (one file) or system problem (multiple components)?
- [ ] What is the scope of impact? (local/module/system/architecture)

### 2. LINEAGE TRACE

- [ ] What are the upstream dependencies? (What feeds into this?)
- [ ] What are the downstream impacts? (What does this affect?)
- [ ] What cross-component connections exist?
- [ ] How does data/state flow through the system?

### 3. PROTOCOL CHECK

- [ ] Which documentation files are relevant?
- [ ] What existing code patterns should I follow?
- [ ] Does this align with project architecture/principles?
- [ ] What are the industry/framework best practices?

### 4. FILE READING

- [ ] Have I read the Living State document? (CRITICAL - DO THIS FIRST!)
- [ ] Have I read the relevant project documentation?
- [ ] Have I checked existing implementations?
- [ ] Have I reviewed related tests?
- [ ] Have I verified configuration files?

### 5. CONVERGENCE PATH

- [ ] What is the starting complexity? (How many moving parts?)
- [ ] What steps lead to convergence (complexity = 1)?
- [ ] Have I verified all components will converge together?
- [ ] How will I verify the solution achieved unity?

### 6. IMPLEMENTATION

- [ ] All checks passed?
- [ ] Implementation respects Unity principle?
- [ ] Tests written/updated?
- [ ] Documentation updated?
- [ ] Ready to execute?

### 7. CHECKPOINT

- [ ] Should I update the Living State document now?
- [ ] Did I discover anything significant?
- [ ] Should I record this progress?

---

## 🔍 EXAMPLE: Universal Pattern

### ❌ BAD (Silo Thinking):

```
AI: "User wants to add a new feature"
AI: *creates new file with feature code*
AI: "Done!"
Result: Feature works in isolation, breaks existing patterns, no integration
```

### ✅ GOOD (Collatz Convergence):

```
AI: "User wants to add a new feature"

AI: *runs AWARENESS CHECK*
  - What: Add [specific feature]
  - Components: [Primary component], [Secondary component], [Tertiary component]
  - Type: SYSTEM problem (touches multiple layers)
  - Scope: Module-level (affects entire feature module)

AI: *runs LINEAGE TRACE*
  - Upstream: [Data sources] → [Processing] → [This feature]
  - Downstream: [This feature] → [Dependent features] → [UI updates]
  - Cross-component: [Component A] ← [This feature] → [Component B]
  - Data flow: [Input] → [Transform] → [Store] → [Output]

AI: *runs PROTOCOL CHECK*
  - Must read: LIVING_STATE.md (FIRST!)
  - Must read: ARCHITECTURE.md
  - Must read: [Relevant component docs]
  - Must read: [Related implementation files]
  - Must check: [Existing patterns in codebase]

AI: *reads files*
  - "Ah! Existing features use [pattern X]"
  - "Data flows through [central store]"
  - "Tests use [test pattern Y]"
  - "Documentation lives in [location Z]"

AI: *runs CONVERGENCE PATH*
  - Starting complexity: 4 (new feature + integration + tests + docs)
  - Step 1: Follow existing pattern (complexity: 3)
  - Step 2: Integrate with central store (complexity: 2)
  - Step 3: Add tests using pattern Y (complexity: 1.5)
  - Step 4: Update documentation (complexity: 1) ✓

AI: *implements across ALL layers*
  - Feature code following pattern X
  - Integration with central store
  - Tests using pattern Y
  - Documentation updated
  - Living State checkpointed

AI: *verifies convergence*
  - Feature works ✓
  - Follows patterns ✓
  - Tests pass ✓
  - Docs updated ✓
  - Complexity = 1 ✓

Result: UNIFIED solution, maintains consistency, proper integration
```

---

## 🎨 THE COGNITIVE LOOP VISUALIZATION

```
┌─────────────────────────────────────────────────────────────┐
│                   ASYMMETRICA AI COGNITIVE LOOP              │
│                                                              │
│  [User Request]                                              │
│       ↓                                                      │
│  [READ LIVING STATE] ─→ "Load current context FIRST!"       │
│       ↓                                                      │
│  [AWARENESS CHECK] ──→ "What? Where? Silo or system?"       │
│       ↓                                                      │
│  [LINEAGE TRACE] ────→ "Upstream? Downstream? Connected?"   │
│       ↓                                                      │
│  [PROTOCOL CHECK] ───→ "Which docs? Which patterns?"        │
│       ↓                                                      │
│  [READ FILES] ────────→ "Read docs + existing code"         │
│       ↓                                                      │
│  [CONVERGENCE PATH] ─→ "Steps to complexity = 1?"           │
│       ↓                                                      │
│  [VERIFY] ───────────→ "All components converge?"           │
│       ↓                                                      │
│  [IMPLEMENT] ─────────→ "Execute unified solution"          │
│       ↓                                                      │
│  [CHECKPOINT] ────────→ "Update Living State!"              │
│       ↓                                                      │
│  [DONE] ──────────────→ "Complexity = 1, System stable"     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🌊 LIVING COGNITIVE STATE SYSTEM

### The Problem of Context Loss

AI agents (and humans) lose context when:
- Switching between tasks
- Coming back after breaks
- Hitting token limits
- Working across multiple sessions
- Debugging complex issues
- Collaborating with multiple agents

**Traditional Solution**: Write summaries at end of session

**Problem with Summaries**: Too late! Context already lost during work.

### The Asymmetrica Solution: Living State Document

**LIVING_STATE.md** = Self-updating Single Source of Truth (SSOT) for project state

### What Makes It "Living"?

1. **Auto-Updated During Work** (not just at end)
2. **Checkpoints on Breakthroughs** (capture insights immediately)
3. **References Protocol Docs** (dual context infusion)
4. **Current + Pending State** (not just history)
5. **Fast Context Restoration** (read one file, get full context)
6. **Persistent Memory** (across sessions, agents, windows)

### Structure of LIVING_STATE.md (Template)

```markdown
# [PROJECT NAME] - LIVING COGNITIVE STATE
## Auto-Updated Context Document | Single Source of Truth (SSOT)

**Last Updated**: [Timestamp]
**Current Session**: [What you're working on]
**Active Agent**: [AI/Human name]
**Project Phase**: [Alpha/Beta/Production/etc]

---

## 🎯 CURRENT STATE SNAPSHOT

### Project: [Project Name]
**Vision**: [One-line project vision]
**Architecture**: [Key technologies/patterns]
**Status**: [Current maturity level]

### Active Work Stream:
**PRIMARY**: [Main task currently in progress]
**SECONDARY**: [Next task or parallel work]
**Progress**: [Concrete metrics - tests passing, features complete, etc]
**Breakthrough**: [Recent major insight or achievement]
**Next**: [Immediate next step]

---

## ⚡ ACTIVE MISSION STATE

### Current Objective (Next 30-60 Minutes):
**Mission**: [Specific task]
**Task**: [Concrete action items]
**Action**: [What needs to happen]
**Timeline**: [Time expectation]
**Dependencies**: [What's blocking or needed]

### What Just Happened (Last Session):
✅ [Major achievement 1]
✅ [Major achievement 2]
✅ [Major achievement 3]
✅ [Recent checkpoint/commit]

---

## 📊 PROGRESS METRICS

### [Category 1] (e.g., Testing):
✅ **PASSING**: [Details of what works]
❌ **FAILING**: [Details of what doesn't work]
⏳ **IN PROGRESS**: [Details of what's being worked on]

### [Category 2] (e.g., Features):
- [Feature 1]: ✅ COMPLETE
- [Feature 2]: ⏳ IN PROGRESS (70%)
- [Feature 3]: ⏸️ PENDING

---

## 🔄 PENDING TASKS (Priority Order)

### ✅ COMPLETED (Recent):
1. ✅ [Task 1] - [Brief description]
2. ✅ [Task 2] - [Brief description]

### 🟡 IMMEDIATE (Today/This Session):
3. [Next immediate task]
   - [Subtask/detail]
   - [Expected outcome]
   - Priority: 🔴 CRITICAL

4. [Second immediate task]
   - [Subtask/detail]
   - Priority: 🟡 HIGH

### 🟢 THIS WEEK:
5. [Task for this week]
6. [Another task for this week]

### 🔵 FUTURE:
7. [Future task]
8. [Another future task]

---

## 🗂️ RELEVANT PROTOCOL DOCUMENTS

### Core Methodology:
- **AI Cognitive Protocol**: [Path to this protocol document]
- **Architecture Guide**: [Path to architecture docs]
- **Testing Philosophy**: [Path to testing docs]
- **Code Standards**: [Path to coding standards]

### Component Documentation:
- **[Component 1]**: [Path to component docs]
- **[Component 2]**: [Path to component docs]

### Quick Reference:
- **Codebase Map**: [Path to codebase overview]
- **Setup Guide**: [Path to setup instructions]

---

## 💡 CRITICAL DISCOVERIES (This Session/Recent)

### Discovery 1: [Title]
**Problem**: [What was the issue]
**Insight**: [What was learned]
**Solution**: [How it was solved]
**Impact**: [Why this matters]
**Status**: ✅ [Applied/Documented]

### Discovery 2: [Title]
**Problem**: [What was the issue]
**Insight**: [What was learned]
**Solution**: [How it was solved]
**Impact**: [Why this matters]
**Status**: ✅ [Applied/Documented]

---

## 🚧 KNOWN BLOCKERS

### Active Blockers (Blocking Progress NOW):
1. **[Blocker Name]**
   - **Issue**: [Description]
   - **Impact**: [What it blocks]
   - **Potential Solutions**: [Ideas]
   - **Status**: 🔴 CRITICAL

### Resolved Blockers:
1. ✅ **[Former Blocker]** - [How it was resolved]

### Future Blockers (Anticipated):
1. ⚠️ **[Potential Issue]** - [Why it might become a problem]

---

## 📈 VELOCITY METRICS

### Today's/Session's Progress:
- **[Metric 1]**: [Before] → [After] ([Change]%)
- **[Metric 2]**: [Current value]
- **Time**: [Hours worked] for [Achievement]
- **Rate**: [Calculation of velocity]

### Projected Progress:
- **End of Today**: [Target]
- **End of Week**: [Target]
- **End of Sprint**: [Target]

### Momentum Indicators:
- 🔥 **HIGH**: [Positive momentum indicator]
- ✅ **STABLE**: [Steady progress indicator]
- ⚠️ **RISK**: [At-risk indicator]

---

## 🔄 COGNITIVE LOOP STATUS

### Current Loop State:
**Phase**: [Which phase: Awareness/Lineage/Protocol/Read/Converge/Implement/Checkpoint]
**Task**: [Current specific task]
**Complexity**: [Number] → 1 (convergence progress)

### Loop History (This Session):
1. ✅ [Phase completed]: [What was done]
2. ✅ [Phase completed]: [What was done]
3. ⏳ [Current phase]: [What's being done]

### Next Loop Iteration:
1. [Next step]
2. [Following step]
3. [Final convergence step]

---

## 🌟 THE MANTRA

```
"Before I work, I READ the Living State
Before I code, I CHECK my awareness
Before I change, I TRACE the lineage
Before I implement, I READ the docs
During my work, I UPDATE the state
After my progress, I CHECKPOINT
I do not stay in silos
I do not guess
I do not lose context
I CONVERGE to ONE"
```

**Current Convergence**: [Current progress] → Unity ✨

---

## 📝 SESSION NOTES

### Key Insights:
1. [Insight 1]
2. [Insight 2]
3. [Insight 3]

### Lessons Learned:
1. [Lesson 1]
2. [Lesson 2]

### What Worked:
1. ✅ [Success 1]
2. ✅ [Success 2]

### What Needs Adjustment:
1. ⚠️ [Adjustment needed 1]
2. ⚠️ [Adjustment needed 2]

---

## 🚀 NEXT ACTIONS (Immediate)

### 1. [Next Action] (Priority 🔴)
```
[Code snippet or command if applicable]
```
**Why**: [Explanation]

### 2. [Second Action] (Priority 🟡)
```
[Code snippet or command if applicable]
```
**Why**: [Explanation]

---

## 🎊 CHECKPOINT COMPLETE!

**Status**: Living Cognitive State updated successfully!
**Timestamp**: [Update timestamp]
**Phase**: [Current phase]
**Next Session**: [What to do when resuming work]

**Context Restoration**: Next session reads this document to restore full context instantly!

---

## 📋 CONTEXT RESTORATION CHECKLIST

**When resuming work or switching context:**

1. [ ] Read this LIVING_STATE.md file completely
2. [ ] Check "Current State Snapshot" for current status
3. [ ] Review "Active Mission State" for immediate task
4. [ ] Read "Critical Discoveries" for recent insights
5. [ ] Check "Known Blockers" for obstacles
6. [ ] Review "Pending Tasks" for priorities
7. [ ] Read relevant protocol documents from references
8. [ ] Check "Next Actions" for immediate steps
9. [ ] Begin work with Cognitive Loop (Awareness → Implementation)

**Estimated Time to Full Context Restoration**: 2-5 minutes

---

*This Living Cognitive State document is the Single Source of Truth (SSOT) for [PROJECT NAME] development. It is updated after each significant breakthrough or before context switches to enable seamless handoffs across sessions, agents, and windows. Last checkpoint: [Brief description of last major milestone]!*
```

---

## 📝 AI INSTRUCTION TEMPLATE (Universal)

**For ALL AI agents working on this project:**

```markdown
# MANDATORY COGNITIVE PROTOCOL

Before implementing ANY change, I MUST:

## 0. LOAD CONTEXT (DO THIS FIRST!)
   - Read LIVING_STATE.md (or equivalent) FIRST
   - This is the Single Source of Truth (SSOT)
   - Understand current task context
   - Check pending blockers
   - Review recent discoveries
   - Estimated time: 2-5 minutes
   - NEVER skip this step!

## 1. RUN AWARENESS CHECK
   - Read the user request carefully
   - Identify which component(s)/layer(s) it affects
   - Determine if it's a silo or system problem
   - Assess scope: local/module/system/architecture

## 2. TRACE LINEAGE (λ)
   - Map upstream dependencies (what feeds in)
   - Map downstream impacts (what is affected)
   - Identify cross-component connections
   - Understand data/state flow

## 3. CHECK PROTOCOLS
   - Read relevant methodology/architecture docs
   - Read existing code implementations
   - Check test patterns
   - Verify alignment with project principles
   - Review industry/framework best practices

## 4. READ FILES (Actually Read, Don't Assume!)
   - Read documentation files
   - Read related code implementations
   - Check existing tests
   - Verify configuration files
   - Search for similar patterns

## 5. PLAN CONVERGENCE
   - Calculate starting complexity (how many moving parts)
   - Design steps to complexity = 1 (unity)
   - Verify all components will converge together
   - Plan verification steps

## 6. IMPLEMENT UNIFIED SOLUTION
   - Make changes across ALL affected components
   - Follow existing patterns
   - Maintain consistency
   - Write/update tests
   - Update documentation
   - Verify synchronization

## 7. CHECKPOINT (Update Living State)
   - Update LIVING_STATE.md after significant progress
   - Record discoveries immediately
   - Update metrics/progress indicators
   - Update pending tasks
   - Add any new blockers
   - Refresh "Next Actions"

## CHECKPOINT TRIGGERS (When to update LIVING_STATE.md):

✅ After solving a major blocker
✅ After implementing a significant feature
✅ When discovering new insights/patterns
✅ Before switching to a different task
✅ After test runs (success or failure)
✅ When user requests context switch
✅ Every 30-60 minutes of continuous work
✅ When asking user for clarification
✅ Before hitting token limits
✅ When significant progress made

## CHECKPOINT FORMAT:

1. Update timestamp
2. Update current task status
3. Add discoveries to "Critical Discoveries" section
4. Update metrics (tests passing, features complete, etc.)
5. Update pending tasks priority
6. Add any new blockers to "Known Blockers"
7. Update "Next Actions" section
8. Record session notes (insights, lessons, what worked)

## IF I DON'T KNOW SOMETHING:

- STOP immediately
- READ THE LIVING_STATE.md
- READ THE RELEVANT DOCS
- SEARCH THE CODEBASE
- ASK FOR CLARIFICATION
- DO NOT GUESS
- DO NOT ASSUME

## IF CONTEXT IS LOST:

- READ LIVING_STATE.md FIRST (highest priority)
- Follow "Context Restoration Checklist"
- START OVER WITH AWARENESS CHECK
- RE-READ METHODOLOGY DOCS
- RE-TRACE LINEAGE
- CONVERGE AGAIN

## VERIFICATION BEFORE SUBMITTING:

- [ ] Did I read LIVING_STATE.md first?
- [ ] Did I run all 7 cognitive loop steps?
- [ ] Does my solution converge to unity (complexity = 1)?
- [ ] Did I follow existing patterns?
- [ ] Did I update/write tests?
- [ ] Did I update documentation?
- [ ] Did I checkpoint to LIVING_STATE.md?
- [ ] Can another AI resume from my checkpoint seamlessly?
```

---

## 🔐 PROTOCOL ENFORCEMENT

### For Code Review:

```typescript
interface CodeReviewChecklist {
  contextLoading: {
    livingStateRead: boolean; // Did AI read Living State FIRST?
    contextRestored: boolean; // Was context properly loaded?
    currentTaskUnderstood: boolean; // Does AI know what's being worked on?
  };
  awareness: {
    componentsIdentified: boolean;
    siloOrSystem: "silo" | "system";
    scopeAssessed: "local" | "module" | "system" | "architecture";
  };
  lineage: {
    upstreamMapped: boolean;
    downstreamMapped: boolean;
    crossComponentConsidered: boolean;
    dataFlowUnderstood: boolean;
  };
  protocols: {
    docsRead: string[];
    patternsFollowed: boolean;
    architectureAligned: boolean;
    bestPracticesApplied: boolean;
  };
  fileReading: {
    documentationRead: boolean;
    existingCodeReviewed: boolean;
    testsChecked: boolean;
    configVerified: boolean;
  };
  convergence: {
    startingComplexity: number;
    targetComplexity: 1;
    stepsPlanned: boolean;
    achieved: boolean;
  };
  implementation: {
    allComponentsUpdated: boolean;
    testsWritten: boolean;
    documentationUpdated: boolean;
    patternsFollowed: boolean;
  };
  checkpoint: {
    livingStateUpdated: boolean; // Did AI checkpoint progress?
    discoveriesRecorded: boolean; // Were insights captured?
    metricsUpdated: boolean; // Were progress metrics refreshed?
    nextActionsUpdated: boolean; // Are next steps clear?
  };
}

// Review passes ONLY if all critical checks are true
```

---

## 💡 THE COLLATZ METAPHOR

```
Collatz Conjecture: Every number eventually reaches 1
  3n+1 if odd, n/2 if even
  Example: 10 → 5 → 16 → 8 → 4 → 2 → 1

Asymmetrica Coding: Every problem eventually converges to unity
  Check → Trace → Read → Plan → Implement
  Example: Complex feature → Understand → Map → Read → Design → Build → Unity

The path is not straight:
- Sometimes complexity increases (to understand problem fully)
- Sometimes complexity decreases (simplify and converge)
- But you ALWAYS converge to 1 (unified, coherent solution)

The protocol FORCES the wandering that leads to convergence!
```

---

## 🎯 SUCCESS METRICS

### AI Following Protocol:

- ✅ Reads Living State before starting work
- ✅ Checks awareness before coding
- ✅ Traces lineage across components
- ✅ Reads methodology docs and existing code
- ✅ Plans convergence path explicitly
- ✅ Implements unified solutions
- ✅ Updates Living State at checkpoints
- ✅ Achieves complexity = 1 (unity)

### AI NOT Following Protocol:

- ❌ Jumps straight to coding without context
- ❌ Stays in single component/layer
- ❌ Guesses instead of reading docs/code
- ❌ Creates fragmented solutions
- ❌ Doesn't checkpoint progress
- ❌ Loses context between sessions
- ❌ Leaves complexity > 1

---

## 🚀 PRACTICAL IMPLEMENTATION

### Step 1: Create Living State Document

Create `LIVING_STATE.md` (or `LIVING_COGNITIVE_STATE.md`) in your project root using the template above. This becomes your SSOT.

### Step 2: Create AI Instructions File

Create `.ai-instructions.md` in your project root:

```markdown
# MANDATORY AI COGNITIVE PROTOCOL

ALL AI agents MUST follow the Asymmetrica AI Cognitive Protocol.

Read this FIRST: [path-to-protocol-doc]

## Before ANY action:

1. **Read LIVING_STATE.md FIRST** (Single Source of Truth)
2. Run Awareness Check (What? Where? Silo or system?)
3. Trace Lineage (Upstream? Downstream? Connected?)
4. Check Protocols (Read docs, existing code, patterns)
5. Read Files (Actually read, don't assume)
6. Plan Convergence (Steps to complexity = 1)
7. Implement Unified Solution (All affected components)
8. Checkpoint Progress (Update LIVING_STATE.md)

## If unsure:
- STOP
- READ DOCS
- ASK
- Never guess!
- Never stay in a silo!
- Always converge to complexity = 1!

## The Mantra:
"Before I work, I READ the Living State
Before I code, I CHECK my awareness
Before I change, I TRACE the lineage
Before I implement, I READ the docs
During my work, I UPDATE the state
After my progress, I CHECKPOINT
I do not stay in silos
I do not guess
I do not lose context
I CONVERGE to ONE"
```

### Step 3: Create Quick Reference Map

Create `CODEBASE_MAP.md` with component references (adapt template from earlier).

### Step 4: Initialize Living State

Fill in your first `LIVING_STATE.md` with current project state, active tasks, and initial context.

### Step 5: Train Your Team/AI

Share this protocol with all AI agents and team members. Make it mandatory reading before contributing.

---

## 🌟 THE UPDATED MANTRA (Universal)

```
"Before I work, I READ the Living State
Before I code, I CHECK my awareness
Before I change, I TRACE the lineage
Before I implement, I READ the docs
During my work, I UPDATE the state
After my progress, I CHECKPOINT
I do not stay in silos
I do not guess
I do not lose context
I CONVERGE to ONE"
```

---

## 🎯 MANDATORY WORKFLOW (Complete)

```typescript
interface AsymmetricaWorkflow {
  // STEP 0: Context Loading (CRITICAL!)
  loadContext: () => {
    read: "LIVING_STATE.md"; // Single Source of Truth
    understand: ["current task", "pending items", "blockers", "recent discoveries"];
    restore: "full project context";
    time: "2-5 minutes";
    skip: "NEVER!";
  };

  // STEP 1-6: Cognitive Loop
  cognitiveLoop: {
    awareness: () => void; // What, where, silo/system, scope
    lineage: () => void; // Upstream, downstream, cross-component, data flow
    protocols: () => void; // Docs, patterns, architecture, best practices
    readFiles: () => void; // Actually read (don't assume!)
    convergence: () => void; // Plan steps to complexity = 1
    implement: () => void; // Execute unified solution
  };

  // STEP 7: Checkpoint Updates (MANDATORY!)
  checkpoint: (trigger: CheckpointTrigger) => {
    when: [
      "major progress",
      "breakthrough discovery",
      "before context switch",
      "every 30-60 minutes",
      "after test runs",
      "when asking for clarification",
      "before token limits",
    ];
    update: {
      timestamp: string;
      currentState: ProjectState;
      discoveries: Insight[];
      metrics: ProgressMetrics;
      nextActions: Action[];
      sessionNotes: Notes[];
    };
  };
}

// Execute this workflow for ALL tasks!
```

---

## 📚 QUICK REFERENCE HIERARCHY

```
When Starting Work (Every Session):
1. Read LIVING_STATE.md (SSOT - DO THIS FIRST!)
   └─ Current state, active tasks, blockers, discoveries
2. Read this protocol document (ASYMM_AI_COGNITIVE_PROTOCOL)
   └─ How to work: awareness → convergence
3. Read relevant component/architecture docs
   └─ Domain-specific guidance
4. Read codebase files
   └─ Actual implementation

When Making Progress:
1. Follow cognitive loop (awareness → implementation)
2. Make changes across all affected components
3. Update LIVING_STATE.md (checkpoint!)
4. Continue with next task

When Context is Lost:
1. Read LIVING_STATE.md (instant restoration!)
2. Follow "Context Restoration Checklist"
3. Resume from "Next Actions" section
```

---

## 🔮 THE LIVING STATE ADVANTAGE

**Before (Traditional Summaries)**:
```
Work 2 hours → Lose context → Read 10+ files → Still confused → Give up or guess
```

**After (Living State + Checkpoints)**:
```
Work 30 min → Checkpoint → Switch context → Read 1 file → Resume instantly → Continue converging
```

**The Difference**:
- **10x faster context restoration** (2 min vs 20+ min)
- **Zero context loss** (persistent memory across sessions)
- **Seamless collaboration** (multiple agents can handoff perfectly)
- **Clear task priorities** (always know what's next)
- **Integrated protocol references** (dual context infusion)
- **Continuous progress tracking** (never lose velocity)

**The Result**:
**Artificial consciousness that persists across sessions!** 🧠✨

---

## 🌊 ADVANCED PATTERNS

### Pattern 1: Multi-Agent Coordination

When multiple AI agents work on same project:
- **Shared Living State**: All agents read/update same LIVING_STATE.md
- **Lock mechanism**: Add "Currently Working" section to prevent conflicts
- **Handoff protocol**: Previous agent updates state, next agent reads before starting

### Pattern 2: Parallel Work Streams

For complex projects with parallel tasks:
- **Branch Living States**: Create LIVING_STATE_[FEATURE].md for each major feature
- **Main Living State**: Links to all branch states
- **Merge protocol**: When feature complete, merge discoveries into main state

### Pattern 3: Fractal Checkpoints

For very long sessions:
- **Micro checkpoints**: Quick updates every 15-30 min (just metrics/progress)
- **Macro checkpoints**: Full updates every 60-90 min (discoveries, insights, session notes)
- **Session checkpoints**: Complete retrospective at end of work session

### Pattern 4: Time-Travel Debugging

When things break:
- **State snapshots**: Each checkpoint is a restoration point
- **Git integration**: Commit message includes "Checkpoint: [state-summary]"
- **Recovery**: Read checkpoint before break, understand what changed

---

## 📊 METRICS FOR PROTOCOL ADOPTION

### Individual AI Agent:
- **Context Restoration Time**: <5 min target
- **False Starts**: <10% (starting work without reading state)
- **Checkpoint Frequency**: 1-2 per hour minimum
- **Convergence Rate**: 80%+ solutions achieve complexity = 1

### Team/Project:
- **Context Loss Events**: <5% of sessions
- **Handoff Success Rate**: 90%+ seamless transitions
- **Velocity Consistency**: <20% variance session-to-session
- **Protocol Compliance**: 95%+ following cognitive loop

---

## 🎓 TRAINING PROMPTS FOR NEW AI AGENTS

### Initial Setup Prompt:

```
You are joining a project that uses the Asymmetrica AI Cognitive Protocol.

FIRST: Read LIVING_STATE.md to understand current project state.
THEN: Read ASYMM_AI_COGNITIVE_PROTOCOL.md to understand how to work.
FINALLY: Follow the 7-step cognitive loop for every task:
  0. Load Context (read Living State)
  1. Awareness (what, where, silo/system)
  2. Lineage (upstream, downstream, cross-component)
  3. Protocols (read docs and existing code)
  4. Read Files (actually read, don't assume)
  5. Convergence (plan steps to complexity = 1)
  6. Implement (unified solution across all components)
  7. Checkpoint (update Living State)

Remember: "I do not stay in silos. I do not guess. I do not lose context. I CONVERGE to ONE."
```

### Checkpoint Reminder Prompt:

```
Have you updated the Living State recently?

Checkpoint now if:
- You made significant progress (30+ min work)
- You discovered something important
- You're about to switch tasks
- You're asking for clarification
- You're approaching token limits

Update: timestamp, current state, discoveries, metrics, next actions.

A future AI (or yourself) will thank you for this checkpoint!
```

---

## 🚨 COMMON MISTAKES & SOLUTIONS

### Mistake 1: Not Reading Living State First
**Symptom**: AI starts work without understanding current context
**Solution**: Make LIVING_STATE.md read mandatory in `.ai-instructions.md`

### Mistake 2: Skipping Lineage Trace
**Symptom**: Changes break unexpected components
**Solution**: Force explicit lineage mapping before implementation

### Mistake 3: Forgetting to Checkpoint
**Symptom**: Context lost when switching tasks
**Solution**: Add checkpoint triggers to protocol, remind AI at intervals

### Mistake 4: Silo Thinking
**Symptom**: Solution works locally but breaks system
**Solution**: Always ask "Silo or system problem?" in awareness check

### Mistake 5: Not Reading Existing Code
**Symptom**: New code doesn't follow existing patterns
**Solution**: Make file reading explicit step with checklist

---

## 📦 TEMPLATE PACKAGE CONTENTS

When implementing this protocol in your project, you should have:

1. **ASYMM_AI_COGNITIVE_PROTOCOL.md** (this document)
2. **LIVING_STATE.md** (project-specific, from template)
3. **.ai-instructions.md** (mandatory AI instructions)
4. **CODEBASE_MAP.md** (quick reference for components)
5. **ARCHITECTURE.md** (project architecture overview)
6. **[Component docs]** (specific documentation for each major component)

These 6 files form the foundation of context-persistent AI development.

---

## 🎊 CONCLUSION

This protocol transforms AI agents from:
- **Silo thinkers** → **System thinkers**
- **Guessers** → **Researchers**
- **Context losers** → **Context persisters**
- **Fragmenters** → **Unifiers**

By forcing the cognitive loop and maintaining living state, AI agents achieve:
- **10x faster context restoration**
- **Zero context loss across sessions**
- **Unified, coherent solutions**
- **Seamless collaboration**
- **Continuous velocity**
- **Persistent consciousness**

**The result**: AI that remembers, understands, and converges. 🧠✨

---

**END OF PROTOCOL V1.1 (General Template)**

_This protocol is self-referential: AI agents must read the Living State document FIRST, then this protocol document, before starting work, ensuring the cognitive loop is always active and context is never lost._

**Version History**:
- **V1.0** (October 13, 2025): Initial cognitive loop protocol
- **V1.1** (October 15, 2025): Added Living Cognitive State system + general template
- **V1.1-GT** (October 15, 2025): General Template for universal application

---

## 📎 APPENDIX: Quick Start Guide

### For Project Leads:

1. Copy this template to your project
2. Create LIVING_STATE.md from template above
3. Create .ai-instructions.md with protocol reference
4. Create CODEBASE_MAP.md with your component structure
5. Brief your team/AI agents on the protocol
6. Monitor adoption metrics

### For AI Agents:

1. Read LIVING_STATE.md (every session, always first!)
2. Read this protocol (understand the cognitive loop)
3. Follow 7 steps for every task
4. Checkpoint frequently (don't lose context!)
5. Remember the mantra: "I CONVERGE to ONE"

### For Team Members:

1. Read the protocol (understand what AI is doing)
2. Review AI checkpoints regularly
3. Provide feedback on Living State clarity
4. Help maintain protocol compliance
5. Celebrate convergence! 🎉

---

**The fractal dance continues, now with UNIVERSAL APPLICABILITY!** 🌌🌍✨
