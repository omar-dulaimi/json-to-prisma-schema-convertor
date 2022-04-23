import {
  AnyOfType,
  DefinitionsPropertyType,
  JSONSchema7DefinitionCustom,
  Model,
  Property,
} from './types';
import { none } from './utils';

export class Transformer {
  private jsonSchema: JSONSchema7DefinitionCustom;
  private models: Array<Model> = [];
  private modelsNames: Array<string> = [];
  constructor(jsonSchema: JSONSchema7DefinitionCustom) {
    this.jsonSchema = jsonSchema;
  }

  toCamelCase(str: String) {
    return str.replace(/[_.-](\w|$)/g, (_, x) => x.toUpperCase());
  }

  transformPropertyName(name: String) {
    return this.toCamelCase(name);
  }

  prepareModelsNames() {
    for (const [, propValue] of Object.entries(
      this.jsonSchema.properties,
    ).values()) {
      this.modelsNames.push(propValue?.['$ref']?.split('/')?.[2]);
    }
  }

  get getModelsNames(): Array<string> {
    return this.modelsNames;
  }

  get getJsonSchema(): JSONSchema7DefinitionCustom {
    return this.jsonSchema;
  }

  get getModels(): Array<Model> {
    return this.models;
  }

  transformModel(
    modelName: string,
    definitionProperties: DefinitionsPropertyType,
  ) {
    const properties: Array<Property> = [];
    for (let [propName, propValue] of Object.entries(
      definitionProperties,
    ).values()) {
      let isRequired = true;
      let fieldType = null;
      let enumValues: Array<string> = [];
      let defaultValue = propValue?.default;
      let isRelation = false;
      let isList = false;
      if (propValue?.type === 'string' && propValue?.format === 'date-time') {
        fieldType = 'DateTime';
      }
      if (
        Array.isArray(propValue?.type) &&
        propValue?.type.find((type) => type === 'null')
      ) {
        isRequired = false;
      }

      if (
        propValue?.anyOf &&
        Array.isArray(propValue?.anyOf) &&
        propValue?.anyOf?.length > 0
      ) {
        isRequired = none(
          propValue?.anyOf,
          (item: AnyOfType) => item?.type === 'null',
        );
        fieldType = propValue?.anyOf
          ?.find((item: AnyOfType) => item?.['$ref'])
          ?.['$ref']?.split('/')?.[2];
        isRelation = true;
      }

      if (
        propValue?.type === 'string' &&
        Array.isArray(propValue?.enum) &&
        propValue?.enum?.length > 0
      ) {
        enumValues = propValue?.enum;
        defaultValue = propValue?.default;
        fieldType = 'enum';
      }

      if (propValue?.type === 'array') {
        isList = true;
        if (propValue?.items?.type) {
          fieldType = propValue?.items?.type;
        }

        if (propValue?.items?.['$ref']) {
          fieldType = propValue?.items?.['$ref']?.split('/')[2];
          isRelation = true;
        }
      }

      if (typeof fieldType !== 'string') {
        fieldType = propValue?.type;
      }

      properties.push({
        name: this.transformPropertyName(propName),
        type: fieldType,
        ...(Array.isArray(fieldType) &&
          fieldType?.length === 2 && {
            type: fieldType.find((type) => type !== 'null'),
          }),
        isRequired,
        ...(Array.isArray(fieldType) &&
          fieldType?.length === 6 &&
          fieldType.every((type) =>
            ['number', 'string', 'boolean', 'object', 'array', 'null'].includes(
              type,
            ),
          ) && {
            type: 'Json',
          }),
        ...(fieldType === 'enum' && {
          enumValues,
        }),
        ...(defaultValue !== undefined &&
          defaultValue !== null && {
            default: defaultValue,
          }),
        isList,
        isRelation,
      });
    }
    this.models.push({
      name: modelName,
      properties,
    });
  }
}
