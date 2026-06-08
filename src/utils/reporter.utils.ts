import { test } from "@playwright/test";

export function logStep<This, Args extends any[], Return>(message?: string, paramNames?: string[]) {
  return function actualDecorator(
    target: (this: This, ...args: Args) => Promise<Return>,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<Return>>
  ) {
    function replacementMethod(this: any, ...args: Args) {
      const baseName = message ?? `${this.constructor.name}.${context.name as string}`;
      const params = args
        .map((arg, i) => {
          if (typeof arg !== 'string' && typeof arg !== 'number') return null;
          const key = paramNames?.[i];
          return key ? `${key}: ${arg}` : String(arg);
        })
        .filter(Boolean)
        .join(', ');
      const name = params ? `${baseName} [${params}]` : baseName;
      return test.step(name, async () => target.call(this, ...args), { box: false });
    }
    return replacementMethod;
  };
}