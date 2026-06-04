const token = '5f587b99-5372-40a0-be38-256e26a7eba0';
const scenarioId = 5260209;

async function patchScenario(mapper) {
  const getRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/blueprint`, {
    headers: { "Authorization": `Token ${token}` }
  });
  if (!getRes.ok) throw new Error(`Fetch blueprint failed: ${getRes.status}`);
  const getData = await getRes.json();
  const bp = getData.response.blueprint;

  const mod6 = bp.flow.find(m => m.id === 6);
  if (!mod6) throw new Error("Module 6 not found in flow");
  mod6.mapper = mapper;

  const patchRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Token ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ blueprint: JSON.stringify(bp) })
  });
  if (!patchRes.ok) throw new Error(`Patch failed: ${patchRes.status}`);
}

async function testWebhook() {
  const challenge = 'CHALLENGE_' + Math.floor(Math.random() * 1000000);
  const url = `https://hook.us2.make.com/b428rov524nlileo9bhjpxh3wpxzoynb?hub.mode=subscribe&hub.challenge=${challenge}&hub.verify_token=tiendadigital`;
  console.log(`Pinging Webhook with challenge: ${challenge}...`);
  try {
    const res = await fetch(url);
    const status = res.status;
    const body = await res.text();
    console.log(`Webhook HTTP Response: ${status} | Body: ${body}`);
    return { status, body, challenge };
  } catch (err) {
    console.log(`Webhook request failed: ${err.message}`);
    return { error: err.message };
  }
}

async function getModuleLogs() {
  const res = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/modules/6/logs`, {
    headers: { "Authorization": `Token ${token}` }
  });
  if (!res.ok) throw new Error(`Logs fetch failed: ${res.status}`);
  const data = await res.json();
  return data.moduleLogs[0];
}

async function runDiagnostics() {
  // Test case 4: Root-level bracket/backtick style, WITH headers
  console.log("\n--- TEST CASE 4: {{1.`hub.challenge`}}, WITH HEADERS (name/value) ---");
  await patchScenario({
    status: "200",
    body: "{{1.`hub.challenge`}}",
    headers: [
      {
        name: "Content-Type",
        "value": "text/plain"
      }
    ]
  });
  await testWebhook();
  let latestLog = await getModuleLogs();
  console.log(`Module 6 Log Status: ${latestLog.status} | Error: ${JSON.stringify(latestLog.error)}`);

  // Test case 5: Root-level bracket/backtick style, WITH headers (key/value)
  console.log("\n--- TEST CASE 5: {{1.`hub.challenge`}}, WITH HEADERS (key/value) ---");
  await patchScenario({
    status: "200",
    body: "{{1.`hub.challenge`}}",
    headers: [
      {
        key: "Content-Type",
        value: "text/plain"
      }
    ]
  });
  await testWebhook();
  latestLog = await getModuleLogs();
  console.log(`Module 6 Log Status: ${latestLog.status} | Error: ${JSON.stringify(latestLog.error)}`);
}

runDiagnostics();
