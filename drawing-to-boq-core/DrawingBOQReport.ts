import type { DrawingBOQResult } from './types.js';

function warningLines(warnings: string[]): string[] {
  return warnings.length ? warnings.map((warning) => `- ${warning}`) : ['- None'];
}

export function generateDrawingBOQReport(result: DrawingBOQResult): string {
  return [
    '## Drawing-to-BOQ Summary',
    '',
    '### Source',
    `- Source: ${result.source}`,
    `- Part ID: ${result.partId}`,
    `- Generated At: ${result.generatedAt}`,
    '',
    '### BOQ Lines',
    '| Item | Category | Description | Unit | Quantity | Confidence |',
    '| --- | --- | --- | --- | ---: | --- |',
    ...result.lines.map((line) => `| ${line.itemNo} | ${line.category} | ${line.description} | ${line.unit} | ${line.quantity.toFixed(2).replace(/\.00$/, '')} | ${line.confidence} |`),
    '',
    '### Warnings',
    ...warningLines(result.warnings),
  ].join('\n');
}
