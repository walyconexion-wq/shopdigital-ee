const token = '5f587b99-5372-40a0-be38-256e26a7eba0';
const scenarioId = 5260209;
const webhookUrl = 'https://hook.us2.make.com/b428rov524nlileo9bhjpxh3wpxzoynb';

const messagePayload = {
  object: "whatsapp_business_account",
  entry: [
    {
      id: "985257329380015",
      changes: [
        {
          value: {
            messaging_product: "whatsapp",
            metadata: {
              display_phone_number: "5491140607059",
              phone_number_id: "1059176120608663"
            },
            contacts: [{ profile: { name: "Test Customer" }, wa_id: "5491133334444" }],
            messages: [
              {
                from: "5491133334444",
                id: "wamid.HBgNNTQ5MTEzMzMzNDQ0NA...",
                timestamp: "1780457635",
                text: { body: "Hola, ¿cuál es tu horario de atención?" },
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

async function checkRun(execId) {
  const mLogRes = await Promise.all([1, 6, 2, 5].map(async modId => {
    const r = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/modules/${modId}/logs`, {
      headers: { 'Authorization': 'Token ' + token }
    });
    const d = await r.json();
    const log = d.moduleLogs.find(l => l.executionId === execId);
    return { modId, ran: !!log, status: log?.status, error: log?.error };
  }));
  return mLogRes;
}

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

    // 2. Set the object equal to filter on Module 2
    console.log("Setting filter to check if object equals whatsapp_business_account...");
    mod2.filter = {
      label: "Only on message",
      conditions: [
        [
          {
            "a": "{{1.object}}",
            "o": "text:equal",
            "b": "whatsapp_business_account"
          }
        ]
      ]
    };

    // 3. Patch scenario
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

    // --- TEST: Real Message (POST) ---
    console.log("\n--- Sending real message POST payload ---");
    const postRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messagePayload)
    });
    console.log(`POST response status: ${postRes.status}`);

    console.log("Waiting 9 seconds for POST execution...");
    await new Promise(resolve => setTimeout(resolve, 9000));

    const logsRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/logs`, {
      headers: { "Authorization": `Token ${token}` }
    });
    const logsData = await logsRes.json();
    const latestRun = logsData.scenarioLogs[0];
    console.log(`POST Run ID: ${latestRun.id} | Status: ${latestRun.status}`);
    const runModules = await checkRun(latestRun.id);
    runModules.forEach(m => console.log(`  Module ${m.modId}: ${m.ran ? 'Ran (Status: ' + m.status + ')' : 'Did NOT run'}`));

  } catch (err) {
    console.error("Error:", err.message);
  }
}

execute();
