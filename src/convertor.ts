import { readFile, writeFile } from 'fs/promises';
import path from 'path';
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
  const obj = new Transformer(schema as JSONSchema7DefinitionCustom);
  obj.prepareModelsNames();
  obj.getModelsNames.forEach((model: string) =>
    obj.transformModel(
      model,
      obj.getJsonSchema.definitions?.[model]?.properties,
    ),
  );

  await writeFile('./models.json', JSON.stringify(obj.getModels));
};

exec();
