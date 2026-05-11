export type BootstrapPhase = 'loading' | 'ready' | 'degraded' | 'blocked';

export interface BootstrapIssue {
  step: string;
  critical: boolean;
  message: string;
}

export interface BootstrapStep {
  name: string;
  critical?: boolean;
  run: () => Promise<void> | void;
}

export interface BootstrapResult {
  phase: Exclude<BootstrapPhase, 'loading'>;
  issues: BootstrapIssue[];
}

function getBootstrapMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  return 'Unknown bootstrap failure';
}

export async function runBootstrapSteps(
  steps: BootstrapStep[]
): Promise<BootstrapResult> {
  const issues: BootstrapIssue[] = [];

  for (const step of steps) {
    try {
      await step.run();
    } catch (error) {
      const issue: BootstrapIssue = {
        step: step.name,
        critical: step.critical === true,
        message: getBootstrapMessage(error),
      };
      issues.push(issue);

      if (issue.critical) {
        return {
          phase: 'blocked',
          issues,
        };
      }
    }
  }

  return {
    phase: issues.length > 0 ? 'degraded' : 'ready',
    issues,
  };
}
