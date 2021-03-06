import { Intent } from 'dialogflow-import';

export type ContextMap = {
  [key: string]: {
    input: string[];
    output: string[];
  };
};

export function createContextMap(intents: Intent[]): ContextMap {
  return intents.reduce((map, intent) => {
    const addContextToMap = (contextName: string) => {
      if (!map[contextName]) map[contextName] = { input: [], output: [] };
    };

    intent.contexts.forEach((inputContext) => {
      const contextName = inputContext.toLowerCase();
      addContextToMap(contextName);
      map[contextName].input.push(intent.name);
    });

    intent.responses.forEach((response) => {
      response.affectedContexts.forEach((outputContext) => {
        if (outputContext.lifespan === 0) return;
        const contextName = outputContext.name.toLowerCase();
        addContextToMap(contextName);
        map[contextName].output.push(intent.name);
      });
    });

    return map;
  }, {} as ContextMap);
}
