import chalk from 'chalk';
import { readFile } from 'fs/promises';
import { Printer } from './printer';
import { Transformer } from './transformer';
import { JSONSchema7DefinitionCustom } from './types';

export default async function convertor(
  jsonSchemaPath: string,
  outputPrismaSchemaPath: string,
) {
  console.log(chalk.green.bold(`Using json schema at: ${jsonSchemaPath}`));
  const schemaFile = await readFile(jsonSchemaPath, {
    encoding: 'utf-8',
  });
  const schema = JSON.parse(schemaFile);
  const transformer = new Transformer(schema as JSONSchema7DefinitionCustom);
  transformer.prepareModelsNames();
  transformer.getModelsNames.forEach((model: string) =>
    transformer.transformModel(
      model,
      transformer.getJsonSchema.definitions?.[model]?.properties,
    ),
  );

  const printer = new Printer(transformer, outputPrismaSchemaPath);
  console.log(chalk.green.bold(`Outputting prisma schema to: ${outputPrismaSchemaPath}`));
  await printer.print();
}
