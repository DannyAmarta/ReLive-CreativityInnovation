if (process.env.OTEL_EXPORTER_CONSOLE !== 'true') {
  process.env.OTEL_TRACES_EXPORTER = 'none';
  process.env.OTEL_METRICS_EXPORTER = 'none';
  process.env.OTEL_LOGS_EXPORTER = 'none';
}

// Helper to identify Redis connection failures in raw stream writes
function isRedisStackWrite(str: string): boolean {
  const hasConnectionRefused =
    str.includes('ECONNREFUSED') ||
    str.includes('Connection refused') ||
    str.includes('connect ECONNREFUSED');
  const hasRedisContext =
    str.includes('6379') ||
    str.includes('redis') ||
    str.includes('ioredis') ||
    str.includes('bullmq');
  return hasConnectionRefused && hasRedisContext;
}

// Helper to identify BullMQ eviction warnings in raw stream writes
function isEvictionPolicyWarning(str: string): boolean {
  return str.includes('Eviction policy is') && str.includes('noeviction');
}

// Monkey-patch stdout/stderr writes to silently drop verbose connection stack trace dumps and eviction policy spam
const originalStderrWrite = process.stderr.write;
process.stderr.write = function (this: any, chunk: any, ...args: any[]) {
  const str = chunk ? chunk.toString() : '';
  if (isRedisStackWrite(str)) {
    return true; // handled and suppressed
  }
  if (isEvictionPolicyWarning(str)) {
    const now = Date.now();
    const globalObj = global as any;
    if (!globalObj.lastEvictionWarningLoggedAt) {
      globalObj.lastEvictionWarningLoggedAt = 0;
    }
    if (now - globalObj.lastEvictionWarningLoggedAt > 60000) {
      globalObj.lastEvictionWarningLoggedAt = now;
      process.stdout.write(
        `[Redis Warning] Redis eviction policy is not set to "noeviction". BullMQ recommends "noeviction" to prevent database key eviction on full memory.\n`,
      );
    }
    return true; // handled and suppressed
  }
  return originalStderrWrite.apply(this, [chunk, ...args]);
};

const originalStdoutWrite = process.stdout.write;
process.stdout.write = function (this: any, chunk: any, ...args: any[]) {
  const str = chunk ? chunk.toString() : '';
  if (isRedisStackWrite(str)) {
    return true; // handled and suppressed
  }
  if (isEvictionPolicyWarning(str)) {
    const now = Date.now();
    const globalObj = global as any;
    if (!globalObj.lastEvictionWarningLoggedAt) {
      globalObj.lastEvictionWarningLoggedAt = 0;
    }
    if (now - globalObj.lastEvictionWarningLoggedAt > 60000) {
      globalObj.lastEvictionWarningLoggedAt = now;
      originalStdoutWrite.apply(process.stdout, [
        `[Redis Warning] Redis eviction policy is not set to "noeviction". BullMQ recommends "noeviction" to prevent database key eviction on full memory.\n`,
      ]);
    }
    return true; // handled and suppressed
  }
  return originalStdoutWrite.apply(this, [chunk, ...args]);
};

import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import Redis from 'ioredis';
import { Logger, ConsoleLogger } from '@nestjs/common';

// Helper to identify Redis connection failures dynamically in JavaScript objects
function isRedisError(err: any): boolean {
  if (!err) return false;
  if (typeof err === 'string') {
    return (
      err.includes('ECONNREFUSED') ||
      err.includes('Connection refused') ||
      err.includes('Redis connection') ||
      err.includes('Redis error')
    );
  }
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') return true;
  if (
    err.message &&
    (err.message.includes('ECONNREFUSED') ||
      err.message.includes('Connection refused') ||
      err.message.includes('Redis connection') ||
      err.message.includes('Redis error'))
  ) {
    return true;
  }
  if (
    err.stack &&
    (err.stack.includes('ECONNREFUSED') ||
      err.stack.includes('Connection refused') ||
      err.stack.includes('Redis connection') ||
      err.stack.includes('Redis error'))
  ) {
    return true;
  }
  if (err.errors && Array.isArray(err.errors)) {
    return err.errors.some((e: any) => isRedisError(e));
  }
  return false;
}

// Monkey-patch NestJS Logger and ConsoleLogger to catch and throttle ECONNREFUSED/Redis error logs
const globalObj = global as any;
globalObj.lastLoggerRedisErrorLoggedAt = 0;

const suppressRedisError = (message: any, ...args: any[]) => {
  const isError = isRedisError(message) || args.some((arg) => isRedisError(arg));
  if (isError) {
    const now = Date.now();
    if (now - globalObj.lastLoggerRedisErrorLoggedAt > 30000) {
      globalObj.lastLoggerRedisErrorLoggedAt = now;
      console.error(
        `[Redis Connection Warning] Redis server connection refused (ECONNREFUSED). Retrying in background...`,
      );
    }
    return true; // handled, don't pass to original logger
  }
  return false; // not handled
};

const originalConsoleLoggerError = ConsoleLogger.prototype.error;
ConsoleLogger.prototype.error = function (this: any, message: any, ...args: any[]) {
  if (suppressRedisError(message, ...args)) {
    return;
  }
  return originalConsoleLoggerError.apply(this, [message, ...args]);
};

const originalLoggerError = Logger.prototype.error;
Logger.prototype.error = function (this: any, message: any, ...args: any[]) {
  if (suppressRedisError(message, ...args)) {
    return;
  }
  return originalLoggerError.apply(this, [message, ...args]);
};

// Hook into Redis connection initialization to guarantee that every single Redis client
// instantiated in the application (via NestJS modules, BullMQ workers/queues, etc.) has
// a default error event listener attached immediately. This prevents ECONNREFUSED from
// bubbling up as unhandled events and spamming the console with multi-line stack traces.
const originalConnect = Redis.prototype.connect;
Redis.prototype.connect = function (this: any, ...args: any[]) {
  if (!this._globalErrorListenerAttached) {
    this._globalErrorListenerAttached = true;
    this.on('error', (err: any) => {
      const now = Date.now();
      if (!globalObj.lastGlobalRedisErrorLoggedAt) {
        globalObj.lastGlobalRedisErrorLoggedAt = 0;
      }
      if (now - globalObj.lastGlobalRedisErrorLoggedAt > 30000) {
        globalObj.lastGlobalRedisErrorLoggedAt = now;
        console.error(
          `[Redis Connection Warning] Client failed to connect: ${err.message || 'ECONNREFUSED. Retrying in background...'}`,
        );
      }
    });
  }
  return originalConnect.apply(this, args);
};

// Global process safety handlers to intercept and silence unhandled promise rejections
// and uncaught exceptions related to Redis connection failures (ECONNREFUSED) so they
// do not pollute stderr with raw stack traces.
process.on('unhandledRejection', (reason: any) => {
  if (
    reason &&
    (reason.code === 'ECONNREFUSED' ||
      (reason.message && reason.message.includes('ECONNREFUSED')))
  ) {
    const now = Date.now();
    if (!globalObj.lastGlobalRedisErrorLoggedAt) {
      globalObj.lastGlobalRedisErrorLoggedAt = 0;
    }
    if (now - globalObj.lastGlobalRedisErrorLoggedAt > 30000) {
      globalObj.lastGlobalRedisErrorLoggedAt = now;
      console.error(
        `[Redis Connection Warning] Unhandled connection rejection: ${reason.message || 'ECONNREFUSED. Retrying in background...'}`,
      );
    }
    return;
  }
  // Print other rejections normally
  console.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err: any) => {
  if (
    err &&
    (err.code === 'ECONNREFUSED' ||
      (err.message && err.message.includes('ECONNREFUSED')))
  ) {
    const now = Date.now();
    if (!globalObj.lastGlobalRedisErrorLoggedAt) {
      globalObj.lastGlobalRedisErrorLoggedAt = 0;
    }
    if (now - globalObj.lastGlobalRedisErrorLoggedAt > 30000) {
      globalObj.lastGlobalRedisErrorLoggedAt = now;
      console.error(
        `[Redis Connection Warning] Uncaught connection exception: ${err.message || 'ECONNREFUSED. Retrying in background...'}`,
      );
    }
    return;
  }
  // Log and crash for other actual exceptions to prevent undefined state
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'relive-backend',
  }),
  traceExporter:
    process.env.OTEL_EXPORTER_CONSOLE === 'true'
      ? new ConsoleSpanExporter()
      : undefined, // Silences span logging in console during local dev unless explicitly requested
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

console.log('[Telemetry] OpenTelemetry NodeSDK started successfully.');
