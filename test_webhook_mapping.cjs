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

async function testMapping(mappingExpr) {
  try {
    // 1. Fetch current blueprint
    const getRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/blueprint`, {
      headers: { "Authorization": `Token ${token}` }
    });
    const getData = await getRes.json();
    const bp = getData.response.blueprint;

    // 2. Modify Module 6 body
    const mod6 = bp.flow.find(m => m.id === 6);
    if (!mod6) throw new Error("Module 6 not found");
    const originalMapper = mod6.mapper;
    mod6.mapper = {
      status: "200",
      body: mappingExpr
    };

    // 3. Patch scenario
    const patchRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ blueprint: JSON.stringify(bp) })
    });
    if (!patchRes.ok) throw new Error(`Patch failed: ${patchRes.status}`);

    // 4. Send POST
    const postRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const bodyText = await postRes.text();
    console.log(`Mapping [${mappingExpr}] -> Webhook Response: "${bodyText}"`);

    // 5. Restore Module 6
    mod6.mapper = originalMapper;
    await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ blueprint: JSON.stringify(bp) })
    });
  } catch (err) {
    console.error(`Error testing ${mappingExpr}:`, err.message);
  }
}

async function runTests() {
  await testMapping('{{1.object}}');
  await testMapping('{{1.entry}}');
  await testMapping('{{1.entry[].changes[].value.messages[].text.body}}');
  await testMapping('{{first(1.entry).changes[].value.messages[].text.body}}');
  await testMapping('{{1.value}}');
}

runTests();
