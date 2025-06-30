import { NextRequest, NextResponse } from 'next/server';
import { logToFile } from '@/lib/logger';
import { auth } from '@/auth';

export function withSafeHandler(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error: any) {
      // --- Extract file location from stack if available
      const stack = error?.stack || '';
      const locationMatch = stack.match(/\((.*?):(\d+):(\d+)\)/);
      const fileLocation = locationMatch ? `${locationMatch[1]}:${locationMatch[2]}` : 'unknown';

      // --- Log the error with full context
      logToFile('error', error.message || 'Unhandled error', {
        origin: req.url,
        errorStack: stack,
        fileLocation,
        req,
      });

      // --- Redirect silently
      const session = await auth();
      const redirectURL = session ? '/admin?error=1' : '/?error=1';

      return NextResponse.redirect(new URL(redirectURL, req.url));
    }
  };
}
