import chalk from 'chalk';
import { Agent, importAgent, Intent } from 'dialogflow-import';
import { promises as fs } from 'fs';
import { readAgentFile } from './readAgentFile';

type ContextMap = {
  [key: string]: {
    input: string[];
    output: string[];
  };
};

function listContexts(intents: Intent[]): ContextMap {
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

type NetworkNode = {
  id: number;
  label: string;
  type: 'intent' | 'context';
};

type NetworkEdge = {
  from: number;
  to: number;
};

function getIntentNodes(intents: Intent[]): NetworkNode[] {
  return intents.map((intent, index) => ({ id: index, label: intent.name, type: 'intent' }));
}

function getContextNodes(contexts: string[], startIndex: number): NetworkNode[] {
  return contexts.map((context, index) => ({ id: startIndex + index, label: context, type: 'context' }));
}

function getNodeId(nodes: NetworkNode[], label: NetworkNode['label'], type: NetworkNode['type']): number {
  const node = nodes.find((node) => node.type === type && node.label === label);
  return node ? node.id : -1;
}

function createEdges(nodes: NetworkNode[], contexts: ContextMap): NetworkEdge[] {
  const edges: NetworkEdge[] = [];

  for (const contextName in contexts) {
    const contextId = getNodeId(nodes, contextName, 'context');
    const { input, output } = contexts[contextName];
    input.forEach((inputIntent) => {
      const intentId = getNodeId(nodes, inputIntent, 'intent');
      edges.push({
        from: contextId,
        to: intentId,
      });
    });
    output.forEach((outputIntent) => {
      const intentId = getNodeId(nodes, outputIntent, 'intent');
      edges.push({
        from: intentId,
        to: contextId,
      });
    });
  }
  return edges;
}

function exportNodes(nodes: NetworkNode[]): any[] {
  return nodes.map(({ id, label, type }) => ({
    id,
    label,
    color: type === 'context' ? '#2a9d8f' : '#e9c46a',
  }));
}

export async function createGraph(agentPath: string, graphPath: string): Promise<void> {
  console.log(`- Creating graph from ${agentPath}...`);
  try {
    const agent = await readAgentFile(agentPath);
    const intents = Object.values(agent.intents);
    console.log(`- Exporting ${intents.length} intents.`);
    const contexts = listContexts(intents);
    console.log(`- Exporting ${Object.keys(contexts).length} contexts.`);
    const nodes = [...getIntentNodes(intents), ...getContextNodes(Object.keys(contexts), intents.length)];
    const edges = createEdges(nodes, contexts);
    console.log(`- Writing ${nodes.length} nodes and ${edges.length} edges to ${graphPath}`);
    console.log('- Done');
    await fs.writeFile(graphPath, JSON.stringify({ nodes: exportNodes(nodes), edges }));
  } catch (e) {
    console.log(chalk.redBright(e.message));
  }
}
