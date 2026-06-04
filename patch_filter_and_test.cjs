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
                text: { body: "Hola, probando bot con filtro de entry id" },
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

async function execute() {
  try {
    // 1. Fetch current blueprint
    console.log("Fetching blueprint...");
    const getRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/blueprint`, {
      headers: { "Authorization": `Token ${token}` }
    });
    const getData = await getRes.json();
    const bp = getData.response.blueprint;

    const mod2 = bp.flow.find(m => m.id === 2);
    if (!mod2) throw new Error("Module 2 not found");

    // 2. Configure Module 2 (Gemini) Filter
    console.log("Updating Module 2 filter to entry[1].id exists...");
    mod2.filter = {
      label: "Only on message",
      conditions: [
        [
          {
            "a": "{{1.entry[1].id}}",
            "o": "exists"
          }
        ]
      ]
    };

    // 3. Patch blueprint to Make.com
    console.log("Patching scenario...");
    const patchRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ blueprint: JSON.stringify(bp) })
    });
    if (!patchRes.ok) throw new Error(`Patch failed: ${patchRes.status}`);
    console.log("Scenario patched successfully!");

    // 4. Send mock POST
    console.log("Sending mock POST request...");
    const postRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    console.log(`Webhook POST response status: ${postRes.status}`);

    // 5. Wait for execution
    console.log("Waiting 8 seconds for execution...");
    await new Promise(resolve => setTimeout(resolve, 8000));

    // 6. Get run details
    console.log("Fetching scenario logs...");
    const logsRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/logs`, {
      headers: { "Authorization": `Token ${token}` }
    });
    const logsData = await logsRes.json();
    const latestRun = logsData.scenarioLogs[0];
    console.log(`Latest Run ID: ${latestRun.id} | Status: ${latestRun.status}`);
    if (latestRun.error) {
      console.log("Run error:", latestRun.error);
    }

    console.log("Checking module runs:");
    for (const modId of [1, 6, 2, 5]) {
      const mLogRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/modules/${modId}/logs`, {
        headers: { 'Authorization': 'Token ' + token }
      });
      const mLogData = await mLogRes.json();
      const log = mLogData.moduleLogs.find(l => l.executionId === latestRun.id);
      if (log) {
        console.log(`  Module ${modId} (${modId === 1 ? 'Webhook Trigger' : modId === 6 ? 'Webhook Response' : modId === 2 ? 'Gemini' : 'WhatsApp'}): Ran | Status: ${log.status} | Error: ${JSON.stringify(log.error)}`);
      } else {
        console.log(`  Module ${modId} (${modId === 1 ? 'Webhook Trigger' : modId === 6 ? 'Webhook Response' : modId === 2 ? 'Gemini' : 'WhatsApp'}): Did NOT run`);
      }
    }

  } catch (err) {
    console.error("Error:", err.message);
  }
}

execute();
