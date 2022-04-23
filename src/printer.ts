import { writeFile } from 'fs/promises';
import { EOL } from 'os';
import { Transformer } from './transformer';
import { Model, Property } from './types';

const enums: Array<string> = [];
const generateEnum = (property: Property, name: string) => {
  enums.push(
    `enum ${name} {${EOL}${property.enumValues.join(EOL)}${EOL}}${EOL}`,
  );
};

const getModelPropertyType = (property: Property, model: Model) => {
  switch (property.type) {
    case 'integer':
    case 'number':
      return property.isList ? 'Int[]' : 'Int';
    case 'boolean':
      return property.isList ? 'Boolean[]' : 'Boolean';

    case 'string':
      return property.isList ? 'String[]' : 'String';

    case 'enum':
      const enumName =
        model.name + property.name[0].toUpperCase() + property.name.slice(1);
      generateEnum(property, enumName);
      return enumName;

    default:
      return property.isList ? `${property.type}[]` : property.type;
  }
};
export class Printer {
  private transformer: Transformer;
  constructor(transformer: Transformer) {
    this.transformer = transformer;
  }

  printModel(model: Model): string {
    const stringModelLines: Array<String> = model.properties.map((property) => {
      return `${property.name}\t ${getModelPropertyType(property, model)} ${
        property.default !== null && property.default !== undefined
          ? `@default(${property.default})`
          : ''
      }`;
    });

    return `model ${model.name} {${EOL}${stringModelLines.join(
      EOL,
    )}${EOL}}${EOL}`;
  }

  async print() {
    const stringSchema =
      this.transformer.getModels
        .map(this.printModel)
        .concat(enums)
        .filter(Boolean)
        .join(EOL)
        .replace(/(\r?\n\s*){3,}/g, EOL + EOL) + EOL;

    await writeFile('./schema.prisma', stringSchema);
  }
}
