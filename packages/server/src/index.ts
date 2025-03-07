import express from 'express';
import { initApp } from './app';
import { loadConfig } from './config';
import { logger, parseLogLevel } from './logger';

export async function main(configName: string): Promise<void> {
  process.on('unhandledRejection', (err: any) => {
    logger.error('Unhandled promise rejection', err);
  });
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception thrown', err);
    process.exit(1);
  });

  logger.info('Starting Medplum Server...', { configName });
  const config = await loadConfig(configName);
  if (config.logLevel) {
    logger.level = parseLogLevel(config.logLevel);
  }

  const app = await initApp(express(), config);
  const server = app.listen(config.port);
  server.keepAliveTimeout = config.keepAliveTimeout ?? 90000;
  logger.info('Server started', { port: config.port });
}

if (require.main === module) {
  main(process.argv.length === 3 ? process.argv[2] : 'file:medplum.config.json').catch(console.log);
}
