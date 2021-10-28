#!/usr/bin/env node
import chalk from 'chalk';
import figlet from 'figlet';
import { Command } from 'commander';
import * as graph from './graph';
import * as contexts from './contexts';
import * as intents from './intents';
import * as userSays from './userSays';

const program = new Command();

console.log(chalk.green(figlet.textSync('df-utils', { horizontalLayout: 'full' })));

program.version('0.0.1').description('Utilities for DialogFlow backup files');

program
  .command('graph <agent.zip> <graph.json>')
  .option('-i, --intents', 'Remove context nodes and link intent directly to intent.')
  .action(async (agentPath: string, graphPath: string, options: { intents?: boolean }) => {
    graph.createGraph(agentPath, graphPath, options.intents);
  });

const ctxCommand = program.command('contexts');
ctxCommand
  .command('toLowerCase <input.zip> <output.zip>')
  .action(async (inputPath, outputPath) => contexts.toLowercase(inputPath, outputPath));

const intentsCmd = program.command('intents');
intentsCmd
  .command('list <agent.zip>')
  .option('-p, --printer <printer>', 'Intent printers: affectedContexts, responseMessageSpeech')
  .option('-f, --filter <filter>', 'Intent filters: moreThanOneAffectedContext')
  .action(async (agentPath, options) => {
    let filter: intents.FilterIntentsFn | undefined;
    if (options.filter) filter = intents.intentFilters[options.filter];
    let printer: intents.PrintIntentFn | undefined;
    if (options.printer) printer = intents.intentPrinters[options.printer];
    intents.list(agentPath, filter, undefined, printer);
  });

const userSaysCmd = program.command('user-says');
userSaysCmd.command('list <agent.zip>').action(async (agentPath) => {
  userSays.list(agentPath);
});

program.parse(process.argv);
