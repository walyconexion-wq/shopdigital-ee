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
    if (!mod2 || !mod5) throw new Error("Modules 2 or 5 not found");

    // 2. Configure Module 2 (Gemini) - REMOVE filter
    console.log("Removing filter on Module 2...");
    delete mod2.filter;

    // Set User Prompt mapping
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

    // Set System Instruction
    mod2.mapper.system_instruction = {
      parts: [
        {
          text: "Sos Luz, el asistente oficial de ShopDigital. Eres un bot de atención al cliente útil, amable y eficiente."
        }
      ]
    };

    // 3. Configure Module 5 (WhatsApp)
    console.log("Configuring Module 5 (WhatsApp)...");
    mod5.mapper = {
      to: "{{1.entry[1].changes[1].value.messages[1].from}}",
      text: {
        body: "{{2.candidates[1].content.parts[1].text}}",
        preview_url: false
      },
      type: "text",
      fromId: "1059176120608663"
    };

    // 4. Patch blueprint to Make.com
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

    // 5. Send mock POST
    console.log("Sending mock POST request...");
    const postRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    console.log(`Webhook POST response status: ${postRes.status}`);

    // 6. Wait for execution
    console.log("Waiting 9 seconds for execution...");
    await new Promise(resolve => setTimeout(resolve, 9000));

    // 7. Get run details
    console.log("Fetching scenario logs...");
    const logsRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/logs`, {
      headers: { "Authorization": `Token ${token}` }
    });
    const logsData = await logsRes.json();
    const latestRun = logsData.scenarioLogs[0];
    console.log(`Latest Run ID: ${latestRun.id} | Timestamp: ${latestRun.timestamp} | Status: ${latestRun.status}`);
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
