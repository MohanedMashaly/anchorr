import Resolver from '@forge/resolver';
import { storage } from '@forge/api';

const resolver = new Resolver();

resolver.define('getText', async (req) => {
  const issueKey = req.payload?.issueKey;
  if (!issueKey) {
    return null;
  }
  const status = await storage.get(`analysis-${issueKey}`);
  return status;
});

export const handler = resolver.getDefinitions();