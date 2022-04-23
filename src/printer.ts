import chalk from 'chalk';
import { writeFile } from 'fs/promises';
import { EOL } from 'os';
import { sortPrismaSchema } from 'prisma-schema-sorter';
import { Transformer } from './transformer';
import { Model, Property } from './types';

const enums: Array<string> = [];
const generateEnum = (property: Property, name: string) => {
  enums.push(
    `enum ${name} {${EOL}${property.enumValues.join(EOL)}${EOL}}${EOL}`,
  );
};

const withRequiredProperty = (property: Property) => {
  return property.isRequired ? '' : '?';
};

const withListProperty = (property: Property, propertyStr: string) => {
  return property.isList ? `${propertyStr}[]` : propertyStr;
};

const getModelPropertyType = (property: Property, model: Model) => {
  switch (property.type) {
    case 'integer':
    case 'number':
      return `Int${withListProperty(property, withRequiredProperty(property))}`;
    case 'boolean':
      return `Boolean${withListProperty(
        property,
        withRequiredProperty(property),
      )}`;

    case 'string':
      return `String${withListProperty(
        property,
        withRequiredProperty(property),
      )}`;

    case 'enum':
      const enumName =
        model.name + property.name[0].toUpperCase() + property.name.slice(1);
      generateEnum(property, enumName);
      return enumName;

    default:
      return `${property.type}${withListProperty(
        property,
        withRequiredProperty(property),
      )}`;
  }
};
export class Printer {
  private transformer: Transformer;
  private outputPath: string;
  constructor(transformer: Transformer, outputPath: string) {
    this.transformer = transformer;
    this.outputPath = outputPath;
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

    await writeFile(this.outputPath, stringSchema);
    console.log(chalk.green.bold('Sorting generated prisma schema'));
    await sortPrismaSchema(this.outputPath);
  }
}
