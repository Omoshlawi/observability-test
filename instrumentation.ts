// /*instrumentation.ts*/
// import { NodeSDK } from "@opentelemetry/sdk-node";
// import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
// import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
// import {
//   PeriodicExportingMetricReader,
//   ConsoleMetricExporter,
// } from "@opentelemetry/sdk-metrics";
// import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
// // For troubleshooting, set the log level to DiagLogLevel.DEBUG
// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
// const sdk = new NodeSDK({
//   traceExporter: new ConsoleSpanExporter(),
//   metricReader: new PeriodicExportingMetricReader({
//     exporter: new ConsoleMetricExporter(),
//   }),
//   instrumentations: [getNodeAutoInstrumentations()],
// });

// sdk.start();

/*
// WORKING
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({
    // Adjust this URL if your Jaeger backend is running on a different address/port
    // Ensure the correct port and protocol (http/https) are used
    endpoint: "http://localhost:14268/api/traces", // Default Jaeger port
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
// End working
*/

/*instrumentation.ts*/
/*
// ------------------------Working
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  NodeTracerProvider,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-node";
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
  InMemoryMetricExporter,
  AggregationTemporality,
  MeterProvider,
} from "@opentelemetry/sdk-metrics";
import { Resource } from "@opentelemetry/resources";
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";
import { ZipkinExporter } from "@opentelemetry/exporter-zipkin";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { DiagConsoleLogger } from "@opentelemetry/api";
import opentelemetry from '@opentelemetry/api';


const EXPORTER = process.env.EXPORTER || "";

const resource = new Resource({
  [SEMRESATTRS_SERVICE_NAME]: "observability-service",
  [SEMRESATTRS_SERVICE_VERSION]: "1.0.0",
});

const tracerProvider = new NodeTracerProvider({ resource });
let exporter;
if (EXPORTER.toLowerCase().startsWith("z")) {
  exporter = new ZipkinExporter();
} else {
  exporter = new JaegerExporter();
}
tracerProvider.addSpanProcessor(
  new BatchSpanProcessor(
    exporter,
    // new OTLPTraceExporter({ url: "http://localhost:14268/api/traces" }),
    {
      // The maximum queue size. After the size is reached spans are dropped.
      maxQueueSize: 1000,
      // The interval between two consecutive exports
      scheduledDelayMillis: 30000,
    }
  )
);


const metricReader = new PeriodicExportingMetricReader({
  exporter: new ConsoleMetricExporter(),
  // Default is 60000ms (60 seconds). Set to 10 seconds for demonstrative purposes only.
  exportIntervalMillis: 10000,
});

registerInstrumentations({
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-fs": { enabled: false },
      "@opentelemetry/instrumentation-express": { enabled: true },
      "@opentelemetry/instrumentation-http": { enabled: true },
      "@opentelemetry/instrumentation-amqplib": { enabled: true },
      "@opentelemetry/instrumentation-pg": { enabled: false },
    }),
  ],
  tracerProvider,
  meterProvider: new MeterProvider({
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new InMemoryMetricExporter(AggregationTemporality.DELTA),
      }),
      metricReader,
    ],
  }),
});
//  --------------------End working----------------------
*/

/*instrumentation.ts*/
import * as opentelemetry from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { Resource } from "@opentelemetry/resources";

const resource = new Resource({
  [SEMRESATTRS_SERVICE_NAME]: "observability-test-service",
  [SEMRESATTRS_SERVICE_VERSION]: "1.0.0",
});

const sdk = new opentelemetry.NodeSDK({
  resource,
  traceExporter: new OTLPTraceExporter({
    // optional - default url is http://localhost:4318/v1/traces
    // url: '<your-otlp-endpoint>/v1/traces',
    url: "http://localhost:4318/v1/traces",
    // optional - collection of custom headers to be sent with each request, empty by default
    headers: {},
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      // url: "<your-otlp-endpoint>/v1/metrics", // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
      url: "http://localhost:4318/v1/metrics", // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
      headers: {}, // an optional object containing custom headers to be sent with each request
    }),
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-fs": { enabled: false },
      "@opentelemetry/instrumentation-express": { enabled: true },
      "@opentelemetry/instrumentation-http": { enabled: true },
      "@opentelemetry/instrumentation-amqplib": { enabled: true },
      "@opentelemetry/instrumentation-pg": { enabled: false },
    }),
  ],
});
sdk.start();
