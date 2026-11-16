import http from "k6/http";
import { check, sleep } from "k6";
import { Trend } from "k6/metrics";

const BASE = __ENV.BASE_URL || "http://127.0.0.1:3000";
const roomLatency = new Trend("partyverse_room_create_ms", true);

export const options = {
  scenarios: {
    rooms: {
      executor: "constant-vus",
      vus: Number(__ENV.VUS || 8),
      duration: __ENV.DURATION || "20s",
    },
  },
  thresholds: {
    partyverse_room_create_ms: ["p(95)<150"],
    http_req_failed: ["rate<0.05"],
  },
};

export default function () {
  const create = http.post(`${BASE}/api/rooms`, null, {
    headers: { "Content-Type": "application/json" },
  });
  roomLatency.add(create.timings.duration);
  check(create, { "create 200": (r) => r.status === 200 });

  let code = "";
  try {
    code = JSON.parse(String(create.body)).code || "";
  } catch {
    code = "";
  }

  if (code) {
    const activity = http.get(`${BASE}/api/rooms/${code}/activity`);
    check(activity, { "activity 200": (r) => r.status === 200 });
  }
  sleep(0.1);
}

export function handleSummary(data) {
  const p95 = data.metrics.partyverse_room_create_ms?.values["p(95)"];
  return {
    stdout: JSON.stringify(
      {
        room_create_p95_ms: p95 != null ? Number(p95.toFixed(2)) : null,
        max_vus: data.metrics.vus_max?.values.max ?? null,
      },
      null,
      2,
    ),
    "load/results-rooms.json": JSON.stringify(
      {
        room_create_p95_ms: p95 != null ? Number(p95.toFixed(2)) : null,
        max_vus: data.metrics.vus_max?.values.max ?? null,
      },
      null,
      2,
    ),
  };
}
