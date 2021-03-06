#!/usr/bin/env node
import chalk from 'chalk';
import figlet from 'figlet';
import { Command } from 'commander';
import * as graph from './graph';
import * as contexts from './contexts';
import * as intents from './intents';

const program = new Command();

console.log(chalk.green(figlet.textSync('df-utils', { horizontalLayout: 'full' })));

program.version('0.0.1').description('Utilities for DialogFlow backup files');

program
  .command('graph <agent.zip> <graph.json>')
  .action(async (agentPath: string, graphPath: string) => graph.createGraph(agentPath, graphPath));

const ctxCommand = program.command('contexts');
ctxCommand
  .command('toLowerCase <input.zip> <output.zip>')
  .action(async (inputPath, outputPath) => contexts.toLowercase(inputPath, outputPath));

const intentsCmd = program.command('intents');
intentsCmd.command('list <agent.zip>').action(async (agentPath) => intents.list(agentPath));

program.parse(process.argv);
