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
    const mod5 = bp.flow.find(m => m.id === 5);
    const mod6 = bp.flow.find(m => m.id === 6);

    if (!mod2 || !mod5 || !mod6) throw new Error("Modules not found");

    // 2. Restore Module 6 body
    console.log("Restoring Module 6 body to challenge handshake variable...");
    mod6.mapper = {
      status: "200",
      body: "{{1.`hub.challenge`}}"
    };

    // Ensure all other settings are correct
    mod2.filter = {
      label: "Only on message",
      conditions: [
        [
          {
            "a": "{{1.object}}",
            "b": "whatsapp_business_account",
            "o": "text:equal"
          }
        ]
      ]
    };
    mod2.mapper.contents = [
      {
        role: "user",
        parts: [
          {
            text: "{{1.entry[1].changes[1].value.messages[1].text.body}}",
            type: "text"
          }
        ]
      }
    ];
    mod2.mapper.system_instruction = {
      parts: [
        {
          text: "Sos Luz, el asistente oficial de ShopDigital. Eres un bot de atención al cliente útil, amable y eficiente."
        }
      ]
    };
    mod5.mapper = {
      to: "{{1.entry[1].changes[1].value.messages[1].from}}",
      text: {
        body: "{{2.candidates[1].content.parts[1].text}}",
        preview_url: false
      },
      type: "text",
      fromId: "{{1.entry[1].changes[1].value.metadata.phone_number_id}}"
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

    // --- TEST 1: Real Message (POST) ---
    console.log("\n--- TEST 1: Sending message POST payload ---");
    const postRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messagePayload)
    });
    console.log(`POST response status: ${postRes.status}`);

    console.log("Waiting 9 seconds for POST execution...");
    await new Promise(resolve => setTimeout(resolve, 9000));

    let logsRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/logs`, {
      headers: { "Authorization": `Token ${token}` }
    });
    let logsData = await logsRes.json();
    let latestRun = logsData.scenarioLogs[0];
    console.log(`POST Run ID: ${latestRun.id} | Status: ${latestRun.status}`);
    let runModules = await checkRun(latestRun.id);
    runModules.forEach(m => console.log(`  Module ${m.modId}: ${m.ran ? 'Ran (Status: ' + m.status + ')' : 'Did NOT run'}`));

    // --- TEST 2: Handshake Verification (GET) ---
    console.log("\n--- TEST 2: Sending GET verification payload ---");
    const challenge = "CHALLENGE_TEST_" + Math.floor(Math.random() * 100000);
    const getResVerification = await fetch(`${webhookUrl}?hub.mode=subscribe&hub.challenge=${challenge}&hub.verify_token=tiendadigital`);
    const getBody = await getResVerification.text();
    console.log(`GET response status: ${getResVerification.status} | Body response: "${getBody}"`);

    console.log("Waiting 9 seconds for GET execution...");
    await new Promise(resolve => setTimeout(resolve, 9000));

    logsRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/logs`, {
      headers: { "Authorization": `Token ${token}` }
    });
    logsData = await logsRes.json();
    latestRun = logsData.scenarioLogs[0];
    console.log(`GET Run ID: ${latestRun.id} | Status: ${latestRun.status}`);
    runModules = await checkRun(latestRun.id);
    runModules.forEach(m => console.log(`  Module ${m.modId}: ${m.ran ? 'Ran (Status: ' + m.status + ')' : 'Did NOT run'}`));

  } catch (err) {
    console.error("Error:", err.message);
  }
}

execute();
