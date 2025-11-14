import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class CustomErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    // Filter out browser permissions policy violations from third-party scripts
    const errorMessage = error?.message || error?.toString() || '';
    const errorStack = error?.stack || '';

    // Ignore permissions policy violations (these are warnings, not actual errors)
    if (
      errorMessage.includes('Permissions policy violation') ||
      errorMessage.includes('unload is not allowed') ||
      errorStack.includes('static.licdn.com') ||
      errorStack.includes('Permissions policy violation')
    ) {
      // Silently ignore these browser policy violations from third-party scripts
      return;
    }

    // Log other errors normally
    console.error('Error:', error);
  }
}

