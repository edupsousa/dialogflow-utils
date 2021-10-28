import { readAgentFile } from './readAgentFile';

export async function list(agentPath: string): Promise<void> {
  const agent = await readAgentFile(agentPath);

  let out: string[] = [];

  const userSays = Object.values(agent.userSays).flatMap((userSay) => Object.values(userSay));
  userSays.forEach((userSay) => {
    userSay.phrases.forEach((phrase) => {
      out.push(`${phrase.data.map((data) => data.text).join('')}`.trim());
    });
  });
  out = out.filter((phrase) => /^\d+$/.test(phrase) === false);
  out = [...new Set(out)];
  out.sort();
  console.log(out.join('\n'));
}
