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
                text: { body: "Hola, ¿quién eres?" },
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
    // 1. Fetch blueprint
    console.log("Fetching blueprint...");
    const getRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/blueprint`, {
      headers: { "Authorization": `Token ${token}` }
    });
    const getData = await getRes.json();
    const bp = getData.response.blueprint;

    const mod1 = bp.flow.find(m => m.id === 1);
    const mod2 = bp.flow.find(m => m.id === 2);
    const mod5 = bp.flow.find(m => m.id === 5);
    const mod6 = bp.flow.find(m => m.id === 6);

    const originalFlow = bp.flow;
    const originalMod6Mapper = mod6.mapper;
    const originalMod2Filter = mod2.filter;

    // Remove Module 2 filter temporarily
    delete mod2.filter;

    // Route flow: 1 -> 2 -> 6 (Module 5 is bypassed)
    bp.flow = [mod1, mod2, mod6];
    
    // Set Module 6 body to Gemini text output
    mod6.mapper = {
      status: "200",
      body: "{{2.candidates[1].content.parts[1].text}}"
    };

    console.log("Patching scenario to route 1 -> 2 -> 6...");
    const patchRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ blueprint: JSON.stringify(bp) })
    });
    if (!patchRes.ok) throw new Error(`Patch failed: ${patchRes.status}`);

    // Send POST
    console.log("Sending mock POST request...");
    const postRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const responseText = await postRes.text();
    console.log(`Webhook Response: "${responseText}"`);

    // Restore original flow and settings
    console.log("Restoring original scenario structure...");
    mod6.mapper = originalMod6Mapper;
    mod2.filter = originalMod2Filter;
    bp.flow = originalFlow;

    await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ blueprint: JSON.stringify(bp) })
    });
    console.log("Scenario restored.");

  } catch (err) {
    console.error("Error:", err.message);
  }
}

execute();
