import { Intent } from 'dialogflow-import';
import { readAgentFile } from './readAgentFile';

export type FilterIntentsFn = (intent: Intent) => boolean;
export type PrintIntentFn = (intent: Intent) => string;
export type SortIntentFn = (a: Intent, b: Intent) => -1 | 0 | 1;

export async function list(
  agentPath: string,
  filterIntents?: FilterIntentsFn,
  sortIntents: SortIntentFn = intentSorters.byName,
  printIntent: PrintIntentFn = intentPrinters.name,
): Promise<void> {
  const agent = await readAgentFile(agentPath);

  let intents: Intent[] = Object.values(agent.intents);

  if (filterIntents) intents = intents.filter(filterIntents);
  intents = intents.sort(sortIntents);

  const output: string[] = intents.map(printIntent);
  console.log(output.join('\n'));

  console.log('\n- Done');
}

export const intentPrinters: Record<string, PrintIntentFn> = {
  name: (i) => i.name,
  affectedContexts: (i) => {
    const out: string[] = [];
    out.push(i.name);
    i.responses.forEach((r) => {
      r.affectedContexts.forEach((ctx) => {
        if (ctx.lifespan > 0) out.push(`\t${ctx.name}`);
      });
    });
    return out.join('\n');
  },
  responseMessageSpeech: (i) => {
    const out: string[] = [];
    out.push(i.name);
    i.responses.forEach((r) => {
      r.messages.forEach((m) => {
        if (m.speech) out.push(`\t${m.speech}`);
      });
    });
    return out.join('\n');
  },
};

export const intentSorters: Record<string, SortIntentFn> = {
  byName: (a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0),
};

export const intentFilters: Record<string, FilterIntentsFn> = {
  affectedContexts: (i) => countAffectedContexts(i) > 1,
};

function countAffectedContexts(intent: Intent): number {
  let count = 0;
  intent.responses.forEach((r) => {
    r.affectedContexts.forEach((ctx) => {
      if (ctx.lifespan > 0) count++;
    });
  });
  return count;
}
