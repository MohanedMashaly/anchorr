import Resolver from '@forge/resolver';
import { storage } from '@forge/api';

const resolver = new Resolver();

resolver.define('getText', async (req) => {
  const status = await storage.get('analysis-status');
  return status;
});

export const handler = resolver.getDefinitions();