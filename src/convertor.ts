import { readFile } from 'fs/promises';
import path from 'path';
import { Printer } from './printer';
import { Transformer } from './transformer';
import { JSONSchema7DefinitionCustom } from './types';

const exec = async () => {
  const schemaFile = await readFile(
    path.join(__dirname, '..', 'schema', 'schema.json'),
    {
      encoding: 'utf-8',
    },
  );
  const schema = JSON.parse(schemaFile);
  const transformer = new Transformer(schema as JSONSchema7DefinitionCustom);
  transformer.prepareModelsNames();
  transformer.getModelsNames.forEach((model: string) =>
    transformer.transformModel(
      model,
      transformer.getJsonSchema.definitions?.[model]?.properties,
    ),
  );

  const printer = new Printer(transformer);
  await printer.print();
};

exec();
