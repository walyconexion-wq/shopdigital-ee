const token = '5f587b99-5372-40a0-be38-256e26a7eba0';
const scenarioId = 5260209;
const webhookUrl = 'https://hook.us2.make.com/b428rov524nlileo9bhjpxh3wpxzoynb';

const payload = {
  object: "whatsapp_business_account",
  entry: [
    {
      id: "985257329380015",
      changes: [
        {
          value: {
            messaging_product: "whatsapp",
            metadata: {
              display_phone_number: "15556298662",
              phone_number_id: "11107475491122"
            },
            contacts: [{ profile: { name: "Waly" }, wa_id: "5491140607059" }],
            messages: [
              {
                from: "5491140607059",
                id: "wamid.HBgNNTQ5MTE0MDYwNzA1OQ...",
                timestamp: "1780457635",
                text: { body: "Hola, probando bot desde script" },
                type: "text"
              }
            ]
          },
          field: "messages"
        }
      ]
    }
  ]
};

async function runTest() {
  try {
    console.log("Sending mock WhatsApp message payload...");
    const postRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    console.log(`Webhook POST response status: ${postRes.status}`);

    console.log("Waiting 6 seconds for Make execution to complete...");
    await new Promise(resolve => setTimeout(resolve, 6000));

    console.log("Fetching scenario logs...");
    const logsRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/logs`, {
      headers: { "Authorization": `Token ${token}` }
    });
    if (!logsRes.ok) throw new Error(`Logs fetch failed: ${logsRes.status}`);
    const logsData = await logsRes.json();
    const latestRun = logsData.scenarioLogs[0];
    console.log(`Latest Run ID: ${latestRun.id} | Timestamp: ${latestRun.timestamp} | Type: ${latestRun.type} | Status: ${latestRun.status}`);
    if (latestRun.error) {
      console.log("Run error:", latestRun.error);
    }

    console.log("Checking which modules executed in this run:");
    for (const modId of [1, 6, 2, 5]) {
      const mLogRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/modules/${modId}/logs`, {
        headers: { 'Authorization': 'Token ' + token }
      });
      if (!mLogRes.ok) {
        console.log(`  Module ${modId}: Failed to fetch logs (${mLogRes.status})`);
        continue;
      }
      const mLogData = await mLogRes.json();
      const log = mLogData.moduleLogs.find(l => l.executionId === latestRun.id);
      if (log) {
        console.log(`  Module ${modId} (${modId === 1 ? 'Webhook Trigger' : modId === 6 ? 'Webhook Response' : modId === 2 ? 'Gemini' : 'WhatsApp'}): Ran | Status: ${log.status} | Error: ${JSON.stringify(log.error)}`);
      } else {
        console.log(`  Module ${modId} (${modId === 1 ? 'Webhook Trigger' : modId === 6 ? 'Webhook Response' : modId === 2 ? 'Gemini' : 'WhatsApp'}): Did NOT run`);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

runTest();
