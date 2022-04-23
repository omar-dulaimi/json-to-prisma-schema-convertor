#!/usr/bin/env node

import meow from 'meow';
import kleur from 'kleur';
import chalk from 'chalk';
import boxen from 'boxen';
import convertor from '../convertor';

const cli = meow(
  `
      Usage
      $ json-to-prisma-schema-convertor [command] [flags]
      Options
        -v Prints out the version number
        ${kleur.bold('convert')}
        --inputPath -ip   Specify the path of the Json schema
        --outputPath -op   Specify the path of where the generated prisma schema will be saved to       
    `,
  {
    flags: {
      inputPath: {
        type: 'string',
        alias: 'ip',
        isRequired: true,
      },
      outputPath: {
        type: 'string',
        alias: 'op',
        isRequired: true,
      },
      version: {
        alias: 'v',
      },
    },
  },
);

async function execute<T extends meow.AnyFlags>(cli: meow.Result<T>) {
  const {
    input,
    flags: { inputPath, outputPath },
  } = cli;
  if (input.length === 0) {
    console.error(kleur.red('No sub command was specified'));
    cli.showHelp();
  }

  const mainSubcommand = input[0];

  switch (mainSubcommand) {
    case 'convert':
      {
        await convertor(inputPath as string, outputPath as string);
        console.log(
          boxen(
            chalk`
  Prisma schema generated successfully to: ${chalk.greenBright(outputPath)}
  `,
            { padding: 1, borderColor: 'blue' },
          ),
        );
      }
      break;

    default: {
      console.error(kleur.red(`Unknown command ${kleur.bold(mainSubcommand)}`));
      cli.showHelp();
    }
  }
}

execute(cli);
