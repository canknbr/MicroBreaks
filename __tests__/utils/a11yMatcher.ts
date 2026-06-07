/**
 * Custom Jest matcher: `toBeAccessible`
 *
 * Asserts that a rendered React Native test instance exposes the
 * accessibility contract we expect from every interactive element:
 *  - an accessibility role,
 *  - a non-empty accessibility label,
 *  - optionally, an accessibility hint.
 *
 * Used by the testing-library `getByX` queries that return
 * `ReactTestInstance` nodes. Wire into a suite by calling
 * `import './__tests__/utils/a11yMatcher';` from the test file (or extend
 * `jest.setup.js` globally).
 *
 * Example:
 *
 *   import './__tests__/utils/a11yMatcher';
 *
 *   const button = screen.getByRole('button', { name: 'Start break' });
 *   expect(button).toBeAccessible({ requireHint: true });
 *
 * Audit task C-TEST6.
 */

// The matcher takes anything the testing-library queries hand back. We avoid
// importing `react-test-renderer` directly so we do not pull in types we
// don't otherwise need (audit C-TEST6 stays a leaf-level utility).
type ReactTestInstance = { props: Record<string, unknown> };

interface AccessibleOptions {
  /** When true, also require a non-empty accessibility hint. */
  requireHint?: boolean;
  /** When set, require this exact role string. */
  expectedRole?: string;
}

interface MatcherResult {
  pass: boolean;
  message: () => string;
}

function getAccessibilityRole(instance: ReactTestInstance): string | undefined {
  const props = instance.props as Record<string, unknown>;
  const role = props.accessibilityRole ?? props.role;
  return typeof role === 'string' ? role : undefined;
}

function getAccessibilityLabel(instance: ReactTestInstance): string | undefined {
  const props = instance.props as Record<string, unknown>;
  const label = props.accessibilityLabel ?? props['aria-label'];
  return typeof label === 'string' ? label : undefined;
}

function getAccessibilityHint(instance: ReactTestInstance): string | undefined {
  const props = instance.props as Record<string, unknown>;
  const hint = props.accessibilityHint;
  return typeof hint === 'string' ? hint : undefined;
}

expect.extend({
  toBeAccessible(received: ReactTestInstance, options: AccessibleOptions = {}): MatcherResult {
    if (!received || typeof received !== 'object') {
      return {
        pass: false,
        message: () => `Expected an accessibility test instance, received ${typeof received}`,
      };
    }

    const failures: string[] = [];
    const role = getAccessibilityRole(received);
    const label = getAccessibilityLabel(received);
    const hint = getAccessibilityHint(received);

    if (!role) {
      failures.push('missing accessibilityRole');
    } else if (options.expectedRole && options.expectedRole !== role) {
      failures.push(`expected role "${options.expectedRole}", got "${role}"`);
    }

    if (!label || label.trim().length === 0) {
      failures.push('missing or empty accessibilityLabel');
    }

    if (options.requireHint && (!hint || hint.trim().length === 0)) {
      failures.push('missing or empty accessibilityHint');
    }

    if (failures.length === 0) {
      return {
        pass: true,
        message: () => `Expected element NOT to be accessible, but it satisfied all checks (role=${role}, label="${label}")`,
      };
    }

    return {
      pass: false,
      message: () =>
        `Expected element to be accessible — failed:\n  - ${failures.join('\n  - ')}\n` +
        `Element props: role=${role ?? '<none>'}, label="${label ?? ''}", hint="${hint ?? ''}"`,
    };
  },
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      /**
       * Assert the rendered test instance exposes a non-empty accessibility
       * role + label (and optionally hint). See `__tests__/utils/a11yMatcher.ts`.
       */
      toBeAccessible(options?: AccessibleOptions): R;
    }
  }
}

export {};
