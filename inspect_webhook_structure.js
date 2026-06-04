const token = '5f587b99-5372-40a0-be38-256e26a7eba0';
const scenarioId = 5260209;
const webhookUrl = 'https://hook.us2.make.com/b428rov524nlileo9bhjpxh3wpxzoynb';

async function inspectWebhookStructure() {
  try {
    // 1. Fetch current blueprint
    const getRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/blueprint`, {
      headers: { "Authorization": `Token ${token}` }
    });
    if (!getRes.ok) throw new Error(`Fetch blueprint failed: ${getRes.status}`);
    const getData = await getRes.json();
    const bp = getData.response.blueprint;

    // 2. Find Module 6 and modify it to return the entire Module 1 bundle
    const mod6 = bp.flow.find(m => m.id === 6);
    if (!mod6) throw new Error("Module 6 not found");
    const originalMapper = mod6.mapper;

    mod6.mapper = {
      status: "200",
      body: "{{1}}"
    };

    console.log("Patching scenario to inspect webhook structure...");

    // 3. Patch back
    const patchRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ blueprint: JSON.stringify(bp) })
    });
    if (!patchRes.ok) throw new Error(`Patch failed: ${patchRes.status}`);
    console.log("Scenario patched.");

    // 4. Send mock POST and print the response body
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
                    text: { body: "Test inspection" },
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

    console.log("Sending mock POST request to inspect output...");
    const postRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    console.log(`Mock POST response: ${postRes.status}`);
    const body = await postRes.text();
    console.log("Parsed Webhook Output Bundle from Make:", body);

    // 5. Restore Module 6 mapper
    console.log("Restoring Module 6 mapper...");
    mod6.mapper = originalMapper;
    await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ blueprint: JSON.stringify(bp) })
    });
    console.log("Blueprint restored.");

  } catch (err) {
    console.error("Error:", err);
  }
}

inspectWebhookStructure();
