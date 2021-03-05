#!/usr/bin/env node
import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import { Command } from 'commander';
import { createGraph } from './graph';

const program = new Command();

clear();
console.log(chalk.green(figlet.textSync('df-utils', { horizontalLayout: 'full' })));

program.version('0.0.1').description('Utilities for DialogFlow backup files');

program
  .command('graph <agent backup f> <graph.json>')
  .action(async (agentPath: string, graphPath: string) => createGraph(agentPath, graphPath));

program.parse(process.argv);
