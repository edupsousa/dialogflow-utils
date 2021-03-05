import chalk from 'chalk';
import { Agent, importAgent } from 'dialogflow-import';
import { promises as fs } from 'fs';

export async function readAgentFile(path: string): Promise<Agent> {
  try {
    const buffer = await fs.readFile(path);
    return await importAgent(buffer);
  } catch (e) {
    throw new Error(`Error reading agent file: ${e.message}`);
  }
}
