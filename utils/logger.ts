import { Platform } from 'react-native';

/**
 * Logger métier global.
 * Préparé pour intégrer Sentry ou Crashlytics dès que les secrets DSN seront injectés au build.
 * Lot E - Observabilité
 */
export const Logger = {
    init: () => {
        // // import * as Sentry from 'sentry-expo';
        // // Sentry.init({
        // //    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
        // //    enableInExpoDevelopment: true,
        // //    debug: __DEV__,
        // // });
        console.log('[Logger] Initialized on', Platform.OS);
    },
    
    error: (error: Error, context?: Record<string, any>) => {
        console.error('[Logger:Error]', error.message, context || {});
        // if (!__DEV__) {
        //     Sentry.captureException(error, { extra: context });
        // }
    },
    
    info: (message: string, context?: Record<string, any>) => {
        console.log('[Logger:Info]', message, context || {});
    },
    
    warn: (message: string, context?: Record<string, any>) => {
        console.warn('[Logger:Warn]', message, context || {});
    }
};
