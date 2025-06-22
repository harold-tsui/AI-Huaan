console.log('[JEST_SETUP_TS] TOP_LEVEL_MARKER_A');

import { ConfigManager, AppConfig } from './src/utils/config';
import { Logger, initializeGlobalLogger, LogLevel, getGlobalLogger } from './src/utils/logger';

// It's crucial to get the instance explicitly now that auto-instantiation is removed.
// This should be one of the first things done if config is needed early.
let configManagerInstance: ConfigManager | undefined = undefined; // Initialize to undefined
try {
  configManagerInstance = ConfigManager.getInstance();
} catch (e) {
  console.error("[jest.setup] Failed to get ConfigManager instance during initial setup:", e);
  // Depending on how critical config is at this stage, you might exit or use defaults
  // For now, we'll let it proceed and potentially fail later if config is essential
}

console.log('[JEST_SETUP_TS] Imports supposedly successful. TOP_LEVEL_MARKER_B');

// Initialize logger with default settings before ConfigManager is ready
console.log('[jest.setup] Initializing global logger with default settings...');
initializeGlobalLogger({ level: LogLevel.DEBUG, console: true, file: false }); 
const setupLogger = getGlobalLogger(); // Use the global logger for setup logging
setupLogger.info('[jest.setup] Default global logger initialized.');

// configManagerInstance is already declared and potentially initialized at the top of the file.
let appConfig: AppConfig;

console.log('[jest.setup] Checking ConfigManager instance state...');
if (!configManagerInstance) {
  setupLogger.error('[jest.setup] ConfigManager instance was not successfully created at the top. Tests will likely fail.');
  // Decide on a strategy: throw, exit, or attempt to re-initialize (though re-init might hide the root cause)
  // For now, we log and let it proceed, which will likely lead to test failures if config is needed.
} else {
  setupLogger.info('[jest.setup] ConfigManager instance appears to be available.');
  
  console.log('[jest.setup] Attempting to get application configuration...');
  try {
    // Ensure config is loaded before trying to use it for logger
    appConfig = configManagerInstance.getConfig(); // This might throw if not initialized
    setupLogger.info('[jest.setup] Successfully retrieved application configuration.');

    // Ensure a default filePath if file logging is enabled but no path is specified
    if (appConfig.logging.file && !appConfig.logging.filePath) {
      setupLogger.warn('[jest.setup] File logging is enabled but no filePath is configured. Defaulting to ./logs/jest-test.log');
      appConfig.logging.filePath = './logs/jest-test.log'; // Provide a default path for tests
    }

    // Re-initialize logger with settings from config file
    console.log('[jest.setup] Re-initializing global logger with loaded configuration...');
    initializeGlobalLogger({
      level: appConfig.logging.level as LogLevel,
      console: appConfig.logging.console,
      file: appConfig.logging.file,
      filePath: appConfig.logging.filePath,
      maxSize: appConfig.logging.maxSize,
      maxFiles: appConfig.logging.maxFiles,
      format: appConfig.logging.format,
    });
    setupLogger.info('[jest.setup] Global logger re-initialized with config settings.');

  } catch (error) {
    setupLogger.error('[jest.setup] Error during ConfigManager setup or initial logging config:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      configManagerInstanceExists: !!configManagerInstance,
      configManagerInitialized: configManagerInstance ? configManagerInstance.isInitialized() : 'N/A',
    });
    // If ConfigManager failed, global logger remains with default settings.
  }
}

// Example: Make config available globally for tests if needed, or specific modules
// (global as any).AppConfig = appConfig; // Be cautious with global pollution

// You can also export the initialized configManager instance or appConfig if needed by specific test files,
// though Jest's environment setup typically handles this implicitly or via setupFilesAfterEnv.
export { configManagerInstance, appConfig };

// Clean up resources after all tests if necessary
afterAll(async () => {
  setupLogger.info('[jest.setup] All tests completed. Performing cleanup...');
  
  const loggerToClose = getGlobalLogger();
  if (loggerToClose && typeof loggerToClose.close === 'function') {
    setupLogger.info('[jest.setup] Attempting to close the global logger.');
    // Winston's close() method is synchronous for most transports, but file transports might need a moment.
    // Some versions/transports might return a promise or emit a 'finish' event.
    // For simplicity and common usage, a direct call is often sufficient.
    // If issues persist, investigate specific transport behaviors.
    loggerToClose.close();
    setupLogger.info('[jest.setup] Global logger close method called.');
    // Add a small delay to allow transports to close, if necessary, though ideally close() handles this.
    // await new Promise(resolve => setTimeout(resolve, 500)); // Uncomment if needed
  } else {
    setupLogger.warn('[jest.setup] Global logger not found or does not have a close method.');
  }

  // Example: close database connections, stop mock servers, etc.
  // if (configManagerInstance && typeof (configManagerInstance as any).dispose === 'function') {
  //   await (configManagerInstance as any).dispose();
  //   setupLogger.info('[jest.setup] ConfigManager disposed.');
  // }
  setupLogger.info('[jest.setup] Cleanup process completed.');
});

console.log('[jest.setup] Jest setup script finished.');