import { readAgentFile } from './readAgentFile';

export async function list(agentPath: string): Promise<void> {
  const agent = await readAgentFile(agentPath);

  const intents = Object.values(agent.intents)
    .map((i) => i.name)
    .sort();
  console.log(intents.join('\n'));

  console.log('\n- Done');
}
