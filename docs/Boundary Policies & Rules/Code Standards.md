# Study Streaks Code Standards

## Overview

This document defines code quality standards for the Study Streaks platform. These standards ensure consistency, maintainability, and compliance with UK educational data protection requirements across our multi-tenant homework motivation platform.

**Target**: Solo developer + Cursor AI development workflow  
**Philosophy**: Prescriptive standards with documented exception process  
**Compliance**: UK GDPR, ICO Children's Code, educational safeguarding requirements

**Reference**: See Study Streaks Monorepo Structure document for project organisation patterns

## Rule Categories & Exception Process

### Rule Categories
- **MUST**: Critical requirements - violations block deployment
- **SHOULD**: Strong recommendations - deviations require justification  
- **CONSIDER**: Best practices - team discretion

### Exception Process
1. Document justification in code comments or PR description
2. Get approval from team lead for MUST rules
3. Add ESLint disable comments with explanation
4. Review exceptions in quarterly code review cycles

```typescript
// Exception approved: Performance-critical loop requires var for hoisting
// eslint-disable-next-line no-var
var cachedResult;
```

## Tool Configurations

### ESLint Configuration
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
    'plugin:@typescript-eslint/strict'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint', 'import', 'jsx-a11y'],
  rules: {
    // MUST rules - Critical requirements
    'no-var': 'error',
    'prefer-const': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error',
    'import/no-relative-parent-imports': 'error',
    
    // GDPR/Privacy protection
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    
    // Child safety (ICO Children's Code)
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/form-control-has-label': 'error',
    
    // SHOULD rules - Strong recommendations
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn',
    'import/order': ['warn', {
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling'],
      'alphabetize': { 'order': 'asc' }
    }],
    
    // CONSIDER rules - Best practices
    'max-len': ['off'], // Handled by Prettier
    'complexity': ['warn', 10],
    '@typescript-eslint/prefer-readonly': 'warn'
  },
  
  // Educational platform specific rules
  overrides: [
    {
      files: ['**/student/**/*.ts', '**/student/**/*.tsx'],
      rules: {
        // Extra strictness for student-facing code
        '@typescript-eslint/no-unsafe-assignment': 'error',
        '@typescript-eslint/no-unsafe-call': 'error'
      }
    },
    {
      files: ['**/admin/**/*.ts', '**/admin/**/*.tsx'],
      rules: {
        // Admin interfaces can be more flexible
        '@typescript-eslint/no-unsafe-assignment': 'warn'
      }
    }
  ]
};
```

### Prettier Configuration
```javascript
// .prettierrc.js
module.exports = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  
  // UK English preferences
  quoteProps: 'consistent',
  
  // React/JSX formatting
  jsxSingleQuote: true,
  jsxBracketSameLine: false
};
```

### TypeScript Configuration Standards
```json
// tsconfig.json (shared base)
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    
    // GDPR compliance helpers
    "noImplicitAny": true,
    "strictNullChecks": true,
    
    // Educational platform requirements
    "skipLibCheck": false,
    "forceConsistentCasingInFileNames": true
  }
}
```

## TypeScript Standards

### Type Definitions
**MUST**: Always define explicit types for function parameters and return values
```typescript
// Correct
function calculateStreak(completions: HomeworkCompletion[]): StreakResult {
  return { currentStreak: 0, longestStreak: 0 };
}

// Incorrect
function calculateStreak(completions) {
  return { currentStreak: 0, longestStreak: 0 };
}
```

**MUST**: Use strict typing for student data (GDPR compliance)
```typescript
// Correct - explicit student data types
interface StudentData {
  readonly id: string;
  readonly schoolId: string;
  name: string;
  yearGroup: number;
  currentStreak: number;
}

// Incorrect - any type allows data leakage
const studentData: any = getStudentData();
```

**SHOULD**: Use branded types for sensitive identifiers
```typescript
// Preferred - prevents mixing student/school IDs
type StudentId = string & { readonly __brand: 'StudentId' };
type SchoolId = string & { readonly __brand: 'SchoolId' };

// Acceptable - regular strings with clear naming
type StudentIdString = string;
type SchoolIdString = string;
```

### Union Types and Discriminated Unions
**SHOULD**: Use discriminated unions for complex state management
```typescript
// Preferred
type StreakState = 
  | { status: 'active'; currentStreak: number; lastCompleted: Date }
  | { status: 'broken'; lastStreak: number; brokenAt: Date }
  | { status: 'new'; startedAt: Date };

// Consider - simpler but less type-safe
interface StreakState {
  status: 'active' | 'broken' | 'new';
  currentStreak?: number;
  lastCompleted?: Date;
}
```

### Generic Constraints
**SHOULD**: Use generic constraints for reusable components
```typescript
// Preferred - ensures type safety across tenants
interface TenantAwareEntity {
  schoolId: SchoolId;
}

function createTenantService<T extends TenantAwareEntity>(
  entity: T
): TenantService<T> {
  return new TenantService(entity);
}
```

## React Component Standards

### Component Definition Patterns
**MUST**: Use function components with explicit return types
```typescript
// Correct
interface StudentDashboardProps {
  student: StudentData;
  onHomeworkComplete: (completion: HomeworkCompletion) => void;
}

function StudentDashboard({ student, onHomeworkComplete }: StudentDashboardProps): JSX.Element {
  return <div>Dashboard content</div>;
}

// Incorrect - no explicit types
function StudentDashboard({ student, onHomeworkComplete }) {
  return <div>Dashboard content</div>;
}
```

**SHOULD**: Use arrow functions for inline event handlers
```typescript
// Preferred
<button 
  onClick={() => onHomeworkComplete(homework)}
  type="button"
>
  Complete Homework
</button>

// Acceptable but verbose
const handleHomeworkComplete = useCallback(() => {
  onHomeworkComplete(homework);
}, [homework, onHomeworkComplete]);

<button onClick={handleHomeworkComplete} type="button">
  Complete Homework
</button>
```

### Props and State Management
**MUST**: Destructure props at function signature level
```typescript
// Correct
function StreakDisplay({ currentStreak, longestStreak }: StreakDisplayProps): JSX.Element {
  return <span>{currentStreak} days</span>;
}

// Incorrect
function StreakDisplay(props: StreakDisplayProps): JSX.Element {
  return <span>{props.currentStreak} days</span>;
}
```

**SHOULD**: Use compound component patterns for complex UI
```typescript
// Preferred - compound pattern
<HomeworkCard>
  <HomeworkCard.Header>Mathematics</HomeworkCard.Header>
  <HomeworkCard.Status>Completed</HomeworkCard.Status>
  <HomeworkCard.Actions>
    <Button>View Details</Button>
  </HomeworkCard.Actions>
</HomeworkCard>

// Consider - simpler but less flexible
<HomeworkCard 
  subject="Mathematics"
  status="Completed"
  actions={<Button>View Details</Button>}
/>
```

### Accessibility Requirements (ICO Children's Code)
**MUST**: Include proper ARIA labels for all interactive elements
```typescript
// Correct
<button 
  type="button"
  aria-label="Mark Mathematics homework as complete"
  onClick={handleComplete}
>
  Complete
</button>

// Incorrect - no screen reader support
<button onClick={handleComplete}>Complete</button>
```

**MUST**: Use semantic HTML elements
```typescript
// Correct
<main>
  <section aria-labelledby="streak-heading">
    <h2 id="streak-heading">Your Study Streak</h2>
    <p>Current streak: {currentStreak} days</p>
  </section>
</main>

// Incorrect
<div>
  <div>Your Study Streak</div>
  <div>Current streak: {currentStreak} days</div>
</div>
```

## API and Data Handling Standards

### API Route Patterns
**MUST**: Validate all input data with Zod schemas
```typescript
// Correct
const HomeworkCompletionSchema = z.object({
  studentId: z.string().uuid(),
  subject: z.string().min(1).max(50),
  completedAt: z.string().datetime(),
  schoolId: z.string().uuid()
});

export async function POST(request: Request) {
  const body = await request.json();
  const validatedData = HomeworkCompletionSchema.parse(body);
  // Process validated data
}

// Incorrect - no validation
export async function POST(request: Request) {
  const body = await request.json();
  // Direct usage without validation
}
```

**MUST**: Implement tenant isolation in all database queries
```typescript
// Correct
async function getStudentHomework(studentId: string, schoolId: string): Promise<Homework[]> {
  return prisma.homework.findMany({
    where: {
      studentId,
      student: {
        schoolId // Ensures tenant isolation
      }
    }
  });
}

// Incorrect - no tenant checking
async function getStudentHomework(studentId: string): Promise<Homework[]> {
  return prisma.homework.findMany({
    where: { studentId }
  });
}
```

### Error Handling Patterns
**MUST**: Use Result patterns for operations that can fail
```typescript
// Correct
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

async function calculateStreak(studentId: string): Promise<Result<StreakData>> {
  try {
    const streak = await streakService.calculate(studentId);
    return { success: true, data: streak };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

// Incorrect - throwing errors up the chain
async function calculateStreak(studentId: string): Promise<StreakData> {
  return await streakService.calculate(studentId); // Can throw
}
```

**SHOULD**: Log errors with context but never log personal data
```typescript
// Preferred
logger.error('Streak calculation failed', {
  operation: 'calculateStreak',
  schoolId: student.schoolId,
  timestamp: new Date().toISOString(),
  // No student name or personal data
});

// Incorrect - logs personal data
logger.error('Streak calculation failed for ' + student.name);
```

## Database and Prisma Standards

### Schema Design Patterns
**MUST**: Include schoolId in all tenant-aware models
```prisma
// Correct
model Student {
  id        String   @id @default(cuid())
  schoolId  String   // Required for tenant isolation
  name      String
  email     String
  
  school    School   @relation(fields: [schoolId], references: [id])
  homework  Homework[]
  
  @@index([schoolId])
}

// Incorrect - no tenant isolation
model Student {
  id       String   @id @default(cuid())
  name     String
  email    String
  homework Homework[]
}
```

**SHOULD**: Use consistent timestamp patterns
```prisma
// Preferred
model HomeworkCompletion {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  completedAt DateTime
  
  // GDPR compliance tracking
  dataRetentionUntil DateTime?
}
```

### Query Patterns
**MUST**: Always include school context in queries
```typescript
// Correct
const students = await prisma.student.findMany({
  where: {
    schoolId: userSchoolId,
    // Other filters
  }
});

// Incorrect - cross-tenant data leak risk
const students = await prisma.student.findMany({
  // No school filtering
});
```

**SHOULD**: Use transactions for multi-step operations
```typescript
// Preferred
await prisma.$transaction(async (tx) => {
  await tx.homeworkCompletion.create({ data: completion });
  await tx.student.update({
    where: { id: studentId },
    data: { currentStreak: newStreak }
  });
});

// Consider - simpler but less reliable
await prisma.homeworkCompletion.create({ data: completion });
await prisma.student.update({
  where: { id: studentId },
  data: { currentStreak: newStreak }
});
```

## Security and Privacy Standards

### Data Protection (GDPR Compliance)
**MUST**: Never log personal data in plain text
```typescript
// Correct
function logUserAction(action: string, userId: string, schoolId: string) {
  logger.info('User action performed', {
    action,
    userId: hashUserId(userId), // Hashed for privacy
    schoolId,
    timestamp: new Date().toISOString()
  });
}

// Incorrect - logs personal data
function logUserAction(action: string, user: User) {
  logger.info(`${user.name} performed ${action}`);
}
```

**MUST**: Implement data retention policies in code
```typescript
// Correct
interface StudentData {
  id: string;
  name: string;
  dataRetentionUntil: Date | null; // GDPR retention tracking
}

async function cleanupExpiredData(): Promise<void> {
  await prisma.student.deleteMany({
    where: {
      dataRetentionUntil: {
        lt: new Date()
      }
    }
  });
}

// Incorrect - no retention policy
interface StudentData {
  id: string;
  name: string;
}
```

### Input Sanitisation
**MUST**: Sanitise all user inputs before processing
```typescript
// Correct
import DOMPurify from 'dompurify';

function sanitiseStudentName(name: string): string {
  return DOMPurify.sanitize(name.trim()).substring(0, 50);
}

// Incorrect - direct usage of user input
function saveStudent(name: string) {
  return prisma.student.create({
    data: { name } // Unsanitised input
  });
}
```

## Naming Conventions

### File and Directory Naming
**MUST**: Use kebab-case for files and directories
```
Correct:
├── homework-completion.service.ts
├── student-dashboard.component.tsx
├── streak-calculation.util.ts

Incorrect:
├── HomeworkCompletionService.ts
├── student_dashboard.component.tsx
├── streakCalculation.util.ts
```

**SHOULD**: Use descriptive file names that indicate purpose
```
Preferred:
├── calculate-streak.service.ts
├── validate-homework-completion.util.ts
├── send-streak-reminder.email.ts

Consider:
├── streak.service.ts
├── homework.util.ts
├── email.ts
```

### Variable and Function Naming
**MUST**: Use camelCase for variables and functions
```typescript
// Correct
const currentStreakCount = 5;
const longestStreakAchieved = 21;

function calculateStudentStreak(completions: HomeworkCompletion[]): number {
  return completions.length;
}

// Incorrect
const current_streak_count = 5;
const CurrentStreakCount = 5;

function calculate_student_streak() {}
function CalculateStudentStreak() {}
```

**SHOULD**: Use descriptive names for boolean variables
```typescript
// Preferred
const isStreakActive = true;
const hasCompletedHomework = false;
const canSubmitLateWork = student.yearGroup >= 7;

// Consider - shorter but less clear
const active = true;
const completed = false;
const canSubmit = student.yearGroup >= 7;
```

### Type and Interface Naming
**MUST**: Use PascalCase for types and interfaces
```typescript
// Correct
interface StudentDashboardProps {
  student: StudentData;
  homework: HomeworkCompletion[];
}

type StreakCalculationResult = {
  currentStreak: number;
  longestStreak: number;
};

// Incorrect
interface studentDashboardProps {}
type streakCalculationResult = {};
```

**SHOULD**: Prefix interfaces with descriptive context
```typescript
// Preferred
interface StudentStreakData {
  currentStreak: number;
  longestStreak: number;
}

interface TeacherDashboardProps {
  students: StudentData[];
  selectedClass: ClassData;
}

// Consider - shorter but may cause conflicts
interface StreakData {
  currentStreak: number;
  longestStreak: number;
}
```

## Performance Standards

### Component Optimisation
**SHOULD**: Use React.memo for expensive components
```typescript
// Preferred - memoised leaderboard component
const Leaderboard = React.memo<LeaderboardProps>(({ students, schoolId }) => {
  const sortedStudents = useMemo(
    () => students.sort((a, b) => b.currentStreak - a.currentStreak),
    [students]
  );

  return (
    <div>
      {sortedStudents.map(student => (
        <StudentRank key={student.id} student={student} />
      ))}
    </div>
  );
});

// Consider - simpler but may re-render unnecessarily
const Leaderboard = ({ students, schoolId }: LeaderboardProps) => {
  return (
    <div>
      {students
        .sort((a, b) => b.currentStreak - a.currentStreak)
        .map(student => (
          <StudentRank key={student.id} student={student} />
        ))}
    </div>
  );
};
```

**SHOULD**: Debounce user inputs for search and filters
```typescript
// Preferred
import { useDebouncedCallback } from 'use-debounce';

function StudentSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const debouncedSearch = useDebouncedCallback(
    (term: string) => {
      // Perform search
      searchStudents(term);
    },
    500 // 500ms delay
  );

  return (
    <input
      type="text"
      onChange={(e) => {
        setSearchTerm(e.target.value);
        debouncedSearch(e.target.value);
      }}
      placeholder="Search students..."
    />
  );
}
```

### Database Query Optimisation
**SHOULD**: Use select to limit returned fields
```typescript
// Preferred - only select needed fields
const students = await prisma.student.findMany({
  where: { schoolId },
  select: {
    id: true,
    name: true,
    currentStreak: true,
    // Don't select email, phone, etc. for leaderboard
  }
});

// Consider - simpler but returns all fields
const students = await prisma.student.findMany({
  where: { schoolId }
});
```

## Cursor AI Development Guidelines

### Effective Prompting Patterns
**SHOULD**: Use specific, contextual prompts
```typescript
// Good prompt for Cursor:
// "Create a React component for displaying student streaks that:
// - Accepts StudentData props with currentStreak and longestStreak
// - Shows celebration animation when streak > 5 days
// - Meets WCAG 2.1 AA accessibility standards
// - Uses our StudyStreaks design system components"

// Poor prompt:
// "Make a streak component"
```

**SHOULD**: Reference existing patterns in prompts
```typescript
// Good prompt:
// "Follow the same error handling pattern as calculateStreak() but for homework completion validation"

// Consider:
// "Add error handling to this function"
```

### Code Generation Guidelines
**MUST**: Review and test all AI-generated code
```typescript
// AI generates code → Developer must:
// 1. Review for GDPR compliance
// 2. Check tenant isolation
// 3. Verify accessibility requirements
// 4. Test with real data
// 5. Add appropriate comments
```

**SHOULD**: Ask for incremental improvements rather than full rewrites
```typescript
// Preferred approach:
// 1. "Add TypeScript types to this function"
// 2. "Add error handling to the API call"
// 3. "Add accessibility labels to the form"

// Consider but riskier:
// "Rewrite this entire component with TypeScript and accessibility"
```

### Code Review Integration
**SHOULD**: Use specific review prompts
```typescript
// Good review prompt:
// "Review this student data handling code for:
// - GDPR compliance (data minimisation, retention)
// - Multi-tenant isolation
// - TypeScript type safety
// - Performance implications"

// Consider:
// "Review this code"
```

## UK Educational Platform Considerations

### Child Safety (ICO Children's Code)
**MUST**: Age-appropriate data handling
```typescript
// Correct - minimal data collection
interface ChildStudentData {
  id: string;
  schoolId: string;
  yearGroup: number; // Age-appropriate, not actual age
  currentStreak: number;
  // No personal details beyond educational necessity
}

// Incorrect - excessive data
interface ChildStudentData {
  id: string;
  fullName: string;
  dateOfBirth: Date;
  homeAddress: string;
  parentIncome: number; // Not necessary for homework tracking
}
```

**MUST**: Privacy-by-design in features
```typescript
// Correct - no personal data in public features
interface LeaderboardEntry {
  rank: number;
  displayName: string; // "Student A", not real name
  streakCount: number;
  schoolId: string;
}

// Incorrect - personal data exposed
interface LeaderboardEntry {
  rank: number;
  fullName: string;
  yearGroup: number;
  streakCount: number;
}
```

### Safeguarding Requirements
**MUST**: Content moderation for user-generated content
```typescript
// Correct
function validateStudentComment(comment: string): ValidationResult {
  const prohibitedContent = [
    'contact details',
    'meeting arrangements',
    'personal information'
  ];
  
  const containsProhibited = prohibitedContent.some(content => 
    comment.toLowerCase().includes(content)
  );
  
  if (containsProhibited) {
    return { valid: false, reason: 'Contains inappropriate content' };
  }
  
  return { valid: true };
}

// Incorrect - no content validation
function saveStudentComment(comment: string) {
  return prisma.comment.create({ data: { content: comment } });
}
```

## Code Review Checklist

### Pre-Commit Checklist
- TypeScript compilation passes with no errors
- ESLint passes with no errors (warnings acceptable with justification)
- Prettier formatting applied
- All functions have proper type annotations
- No `any` types used (exceptions documented)
- GDPR compliance verified for data handling
- Multi-tenant isolation implemented
- Accessibility requirements met
- No personal data in logs or error messages

### AI Development Checklist
- AI-generated code reviewed by human developer
- Code follows established patterns from existing codebase
- Security implications considered and addressed
- Performance impact assessed
- Documentation updated if needed
- Tests written or updated for new functionality

### Educational Platform Checklist
- Child safety requirements met (ICO Children's Code)
- Age-appropriate content and interactions
- Safeguarding considerations addressed
- UK educational standards compliance
- Data minimisation principles followed

## Tools and Automation

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "streetsidesoftware.code-spell-checker",
    "ms-vscode.vscode-json"
  ]
}
```

### Pre-commit Hooks (Husky)
```bash
#!/bin/sh
# .husky/pre-commit

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run formatting check
npm run format:check

# Run critical tests
npm run test:critical
```

### GitHub Actions Integration
```yaml
# .github/workflows/code-quality.yml
name: Code Quality
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint check
        run: npm run lint
      
      - name: Format check
        run: npm run format:check
      
      - name: Run tests
        run: npm run test:critical
```

## Conclusion

These code standards ensure the Study Streaks platform maintains high quality, security, and compliance while supporting efficient development with Cursor AI assistance.

**Key Principles:**
- **Type Safety First**: Comprehensive TypeScript usage prevents runtime errors
- **GDPR Compliance**: Data protection built into code patterns
- **Educational Focus**: Child safety and safeguarding considerations embedded
- **AI-Friendly**: Clear patterns and examples for Cursor AI assistance
- **Performance Aware**: Standards that scale with our multi-tenant platform

**Remember**: These standards evolve based on real-world usage. Quarterly reviews ensure they remain practical and effective for our development workflow.

## Regular Review Schedule

- **Monthly**: ESLint rule effectiveness review
- **Quarterly**: Full standards review and updates
- **Annually**: Major tool and framework updates
- **As needed**: Compliance requirement changes

**Last Updated**: [Current Date]  
**Next Review**: [Quarterly Review Date]