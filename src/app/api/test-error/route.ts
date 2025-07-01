
import { withSafeHandler } from '@/lib/safeHandler';

const handler = async () => {
  throw new Error('Simulated server error');
};

export const GET = withSafeHandler(handler);
