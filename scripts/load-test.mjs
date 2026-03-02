import { createHmac, randomUUID } from 'crypto';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const SECRET = process.env.HMAC_SECRET ?? 'mysecret';
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 100);

function signRawBody(rawBody) {
  return createHmac('sha256', SECRET).update(rawBody).digest('hex');
}

async function sendEvent(eventId, payload) {
  const body = { eventId, payload };
  const rawBody = JSON.stringify(body);
  const signature = signRawBody(rawBody);

  const res = await fetch(`${BASE_URL}/events`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-signature': signature,
    },
    body: rawBody,
  });

  const text = await res.text();
  return { ok: res.ok, status: res.status, body: text };
}

async function main() {
  const start = Date.now();

  const tasks = Array.from({ length: CONCURRENCY }, (_, i) => {
    const eventId = `evt_${i}_${randomUUID()}`;
    return sendEvent(eventId, { orderId: `ord_${i % 10}` });
  });

  const results = await Promise.allSettled(tasks);
  const elapsedMs = Date.now() - start;

  let ok = 0;
  const failures = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.ok) ok++;
    else failures.push(r);
  }

  console.log(
    JSON.stringify(
      {
        baseUrl: BASE_URL,
        concurrency: CONCURRENCY,
        ok,
        failed: failures.length,
        elapsedMs,
      },
      null,
      2,
    ),
  );

  if (failures.length) {
    const sample = failures.slice(0, 5).map((f) => {
      if (f.status === 'rejected') return { error: String(f.reason) };
      return f.value;
    });
    console.log('Sample failures:', JSON.stringify(sample, null, 2));
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

