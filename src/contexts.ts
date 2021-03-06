import { AgentIntents, updateIntents } from 'dialogflow-import';
import { promises as fs } from 'fs';
import { readAgentFile } from './readAgentFile';

export async function toLowercase(inputPath: string, outputPath: string): Promise<void> {
  const agent = await readAgentFile(inputPath);
  const updatedIntents: AgentIntents = {};
  for (const intentFilename in agent.intents) {
    const intent = agent.intents[intentFilename];
    let updated = false;
    intent.contexts = intent.contexts.map((contextName) => {
      const lowerName = contextName.toLowerCase();
      if (lowerName !== contextName) updated = true;
      return lowerName;
    });
    intent.responses = intent.responses.map((response) => {
      response.affectedContexts = response.affectedContexts.map((context) => {
        const original = context.name;
        context.name = original.toLowerCase();
        if (context.name !== original) updated = true;
        return context;
      });
      return response;
    });
    if (updated) {
      updatedIntents[intentFilename] = intent;
    }
  }
  console.log(`- Saving ${Object.keys(updatedIntents).length} updated intents to ${outputPath}.`);
  const outputBuffer = await updateIntents(await fs.readFile(inputPath), updatedIntents);
  await fs.writeFile(outputPath, outputBuffer);
  console.log('- Done');
}
