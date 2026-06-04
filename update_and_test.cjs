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
                text: { body: "Hola, probando bot corregido" },
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
    if (!getRes.ok) throw new Error(`Fetch blueprint failed: ${getRes.status}`);
    const getData = await getRes.json();
    const bp = getData.response.blueprint;

    // 2. Find modules
    const mod2 = bp.flow.find(m => m.id === 2);
    const mod5 = bp.flow.find(m => m.id === 5);
    const mod6 = bp.flow.find(m => m.id === 6);

    if (!mod2 || !mod5) throw new Error("Module 2 or Module 5 not found in blueprint");

    // 3. Update Module 2 (Gemini) Filter and Mapping
    console.log("Updating Module 2 filter & mapper...");
    mod2.filter = {
      label: "Only on message",
      conditions: [
        [
          {
            a: "{{1.entry}}",
            o: "exists"
          }
        ]
      ]
    };

    // Correct Gemini user prompt mapper
    if (mod2.mapper && mod2.mapper.contents && mod2.mapper.contents[0] && mod2.mapper.contents[0].parts && mod2.mapper.contents[0].parts[0]) {
      mod2.mapper.contents[0].parts[0].text = "{{1.entry[1].changes[1].value.messages[1].text.body}}";
    }

    // Ensure system instruction is clean if present, or delete it
    if (mod2.mapper.system_instruction) {
      delete mod2.mapper.system_instruction;
    }

    // 4. Update Module 5 (WhatsApp) Sender Phone mapping
    console.log("Updating Module 5 phone number mapper...");
    if (mod5.mapper) {
      mod5.mapper.to = "{{1.entry[1].changes[1].value.messages[1].from}}";
    }

    // 5. Patch blueprint back to Make
    console.log("Patching scenario with new blueprint...");
    const patchRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ blueprint: JSON.stringify(bp) })
    });
    if (!patchRes.ok) throw new Error(`Patch failed: ${patchRes.status}`);
    console.log("Scenario successfully patched!");

    // 6. Trigger mock message
    console.log("Sending mock WhatsApp webhook payload to trigger run...");
    const postRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    console.log(`Webhook POST response status: ${postRes.status}`);

    // 7. Wait and check logs
    console.log("Waiting 7 seconds for execution to complete...");
    await new Promise(resolve => setTimeout(resolve, 7000));

    console.log("Fetching logs...");
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
    console.error("Execution error:", err.message);
  }
}

execute();
