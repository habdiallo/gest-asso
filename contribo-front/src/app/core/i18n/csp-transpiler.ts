import {
  DefaultTranspiler,
  provideTranslocoTranspiler,
  type TranspileParams,
} from '@jsverse/transloco';

interface PluralExpression {
  parameter: string;
  options: Readonly<Record<string, string>>;
}

interface RenderContext {
  params: Record<string, unknown>;
  pluralRules: Intl.PluralRules;
}

const PLURAL_TYPE = 'plural';
const DEFAULT_LOCALE = 'fr';

function matchingBrace(value: string, openingIndex: number): number | null {
  let depth = 0;

  for (let index = openingIndex; index < value.length; index += 1) {
    if (value[index] === '{') {
      depth += 1;
    } else if (value[index] === '}') {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return null;
}

function parsePluralOptions(value: string): Readonly<Record<string, string>> | null {
  const options: Record<string, string> = {};
  let index = 0;

  while (index < value.length) {
    while (/\s/.test(value[index] ?? '')) {
      index += 1;
    }

    if (index === value.length) {
      break;
    }

    const keyStart = index;
    while (index < value.length && !/[\s{]/.test(value[index])) {
      index += 1;
    }
    const optionKey = value.slice(keyStart, index);

    while (/\s/.test(value[index] ?? '')) {
      index += 1;
    }

    if (!optionKey || value[index] !== '{') {
      return null;
    }

    const optionEnd = matchingBrace(value, index);
    if (optionEnd === null) {
      return null;
    }

    options[optionKey] = value.slice(index + 1, optionEnd);
    index = optionEnd + 1;
  }

  return options['one'] && options['other'] ? options : null;
}

function parsePluralExpression(value: string): PluralExpression | null {
  const firstComma = value.indexOf(',');
  if (firstComma < 1) {
    return null;
  }

  const secondComma = value.indexOf(',', firstComma + 1);
  if (secondComma < 0 || value.slice(firstComma + 1, secondComma).trim() !== PLURAL_TYPE) {
    return null;
  }

  const parameter = value.slice(0, firstComma).trim();
  if (!/^[\w.-]+$/.test(parameter)) {
    return null;
  }

  const options = parsePluralOptions(value.slice(secondComma + 1));
  return options ? { parameter, options } : null;
}

function renderPluralExpressions(value: string, context: RenderContext): string {
  let rendered = '';
  let index = 0;

  while (index < value.length) {
    if (value[index] !== '{') {
      rendered += value[index];
      index += 1;
      continue;
    }

    const expressionEnd = matchingBrace(value, index);
    if (expressionEnd === null) {
      rendered += value.slice(index);
      break;
    }

    const expression = parsePluralExpression(value.slice(index + 1, expressionEnd));
    if (!expression) {
      rendered += value.slice(index, expressionEnd + 1);
      index = expressionEnd + 1;
      continue;
    }

    const rawParameter = context.params[expression.parameter];
    const numericParameter = Number(rawParameter);
    const category = Number.isFinite(numericParameter)
      ? context.pluralRules.select(numericParameter)
      : 'other';
    const selected = expression.options[category] ?? expression.options['other'];
    const replacement = selected.replaceAll('#', String(rawParameter ?? ''));
    rendered += renderPluralExpressions(replacement, context);
    index = expressionEnd + 1;
  }

  return rendered;
}

function interpolateSingleBraces(value: string, params: Record<string, unknown>): string {
  return value.replace(/\{([\w.-]+)\}/g, (match, parameter: string) => {
    const replacement = params[parameter];
    return replacement === undefined ? match : String(replacement);
  });
}

export class CspTranspiler extends DefaultTranspiler {
  private locale = DEFAULT_LOCALE;
  private pluralRules = new Intl.PluralRules(DEFAULT_LOCALE);

  onLangChanged(lang: string): void {
    this.locale = lang || DEFAULT_LOCALE;
    this.pluralRules = new Intl.PluralRules(this.locale);
  }

  override transpile({ value, params = {}, ...rest }: TranspileParams): unknown {
    if (typeof value !== 'string') {
      return super.transpile({ value, params, ...rest });
    }

    return super.transpile({
      value: interpolateSingleBraces(
        renderPluralExpressions(value, { params, pluralRules: this.pluralRules }),
        params,
      ),
      params,
      ...rest,
    });
  }
}

export function provideCspTranspiler() {
  return provideTranslocoTranspiler(CspTranspiler);
}
