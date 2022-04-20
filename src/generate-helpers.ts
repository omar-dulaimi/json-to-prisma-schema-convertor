import { SourceFile } from 'ts-morph';

export function generateHelpersIndexFile(sourceFile: SourceFile) {
  sourceFile.addStatements(/* ts */ ``);
}
