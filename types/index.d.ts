export type K6API = "/v1/metrics";
export type MetricsType = "trend" | "counter" | "gauge";
export type MetricsContains = "time" | "default";
export type MetricAttributes<T> = {
  type: MetricsType;
  contains: MetricsContains;
  tainted: any;
  sample: T;
};
export type MetricTrend = {
  avg: number;
  max: number;
  med: number;
  min: number;
  "p(90)": number;
  "p(95)": number;
};
export type MetricCounter = {
  count: number;
  rate: number;
};
export type MetricGauge = {
  value: number;
};
export type Metrics = {
  http_req_duration: MetricAttributes<MetricTrend>;
  http_req_tls_handshaking: MetricAttributes<MetricTrend>;
  http_req_waiting: MetricAttributes<MetricTrend>;
  iterations: MetricAttributes<MetricCounter>;
  vus_max: MetricAttributes<MetricGauge>;
  http_reqs: MetricAttributes<MetricCounter>;
  iteration_duration: MetricAttributes<MetricTrend>;
  vus: MetricAttributes<MetricGauge>;
  http_req_connecting: MetricAttributes<MetricTrend>;
  http_req_receiving: MetricAttributes<MetricTrend>;
  data_received: MetricAttributes<MetricCounter>;
  http_req_blocked: MetricAttributes<MetricTrend>;
  http_req_sending: MetricAttributes<MetricTrend>;
  http_req_failed: MetricAttributes<MetricTrend>;
  data_sent: MetricAttributes<MetricCounter>;
};
export type GetMetricsDataType = {
  metrics: Metrics;
  timestamp: Date;
  api: K6API;
};
export type TestResult = {
  id: string;
  userId: string;
  isFinished: boolean;
  isManuallyStop: boolean;
  isErroneous: boolean;
  createdAt: string;
  errorMessage: string;
};
