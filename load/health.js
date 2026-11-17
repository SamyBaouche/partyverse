import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

const BASE = __ENV.BASE_URL || "http://127.0.0.1:3000";

const latency = new Trend("partyverse_health_ms", true);
const failRate = new Rate("partyverse_fail_rate");

export const options = {
  scenarios: {
    smoke: {
      executor: "constant-vus",
      vus: Number(__ENV.VUS || 20),
      duration: __ENV.DURATION || "30s",
    },
  },
  thresholds: {
    partyverse_health_ms: ["p(95)<100"],
    partyverse_fail_rate: ["rate<0.01"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const res = http.get(`${BASE}/health`);
  latency.add(res.timings.duration);
  const ok = check(res, {
    "status is 200": (r) => r.status === 200,
    "body ok": (r) => String(r.body).includes("ok"),
  });
  failRate.add(!ok);
  sleep(0.05);
}

export function handleSummary(data) {
  const p95 = data.metrics.partyverse_health_ms?.values["p(95)"];
  const vus = data.metrics.vus_max?.values.max;
  return {
    stdout: JSON.stringify(
      {
        p95_ms: p95 != null ? Number(p95.toFixed(2)) : null,
        max_vus: vus != null ? Math.round(vus) : null,
        http_reqs: data.metrics.http_reqs?.values.count ?? null,
      },
      null,
      2,
    ),
    "load/results-health.json": JSON.stringify(data, null, 2),
  };
}
