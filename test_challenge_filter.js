const token = '5f587b99-5372-40a0-be38-256e26a7eba0';
const scenarioId = 5260209;
const webhookUrl = 'https://hook.us2.make.com/b428rov524nlileo9bhjpxh3wpxzoynb';

async function testChallengeFilter() {
  try {
    // 1. Fetch current blueprint
    const getRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/blueprint`, {
      headers: { "Authorization": `Token ${token}` }
    });
    if (!getRes.ok) throw new Error(`Fetch blueprint failed: ${getRes.status}`);
    const getData = await getRes.json();
    const bp = getData.response.blueprint;

    // 2. Find Module 2 and update its filter & mapping
    const mod2 = bp.flow.find(m => m.id === 2);
    if (!mod2) throw new Error("Module 2 not found");
    
    // Ensure system_instruction is removed
    delete mod2.mapper.system_instruction;
    
    // Ensure mapped text is using indexed version (since it succeeded)
    if (mod2.mapper.contents && mod2.mapper.contents[0] && mod2.mapper.contents[0].parts && mod2.mapper.contents[0].parts[0]) {
      mod2.mapper.contents[0].parts[0].text = "{{1.entry[1].changes[1].value.messages[1].text.body}}";
    }

    // Set filter to check if hub.challenge does not exist (operator: notExists)
    mod2.filter = {
      label: "Only on message",
      conditions: [
        [
          {
            a: "{{1.`hub.challenge`}}",
            o: "notExists"
          }
        ]
      ]
    };

    // 3. Find Module 5 and ensure its mapping is correct
    const mod5 = bp.flow.find(m => m.id === 5);
    if (!mod5) throw new Error("Module 5 not found");
    mod5.mapper.to = "{{1.entry[1].changes[1].value.messages[1].from}}";

    console.log("Patching scenario with challenge notExists filter...");

    // 4. Patch back
    const patchRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ blueprint: JSON.stringify(bp) })
    });
    if (!patchRes.ok) throw new Error(`Patch failed: ${patchRes.status}`);
    console.log("Scenario patched successfully.");

    // 5. Send mock POST
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
                    text: { body: "Hola, probando con filtro de challenge notExists" },
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

    console.log("Sending mock POST...");
    const postRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    console.log(`Mock POST response: ${postRes.status}`);

    // Wait 5 seconds
    console.log("Waiting 5 seconds for execution...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 6. Get recent runs
    const logsRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/logs`, {
      headers: { "Authorization": `Token ${token}` }
    });
    const logsData = await logsRes.json();
    const latestRun = logsData.scenarioLogs[0];
    console.log(`Latest Run ID: ${latestRun.id} | Status: ${latestRun.status}`);

    // 7. Check module execution
    for (const modId of [1, 6, 2, 5]) {
      const mLogRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/modules/${modId}/logs`, {
        headers: { 'Authorization': 'Token ' + token }
      });
      const mLogData = await mLogRes.json();
      const log = mLogData.moduleLogs.find(l => l.executionId === latestRun.id);
      console.log(`Module ${modId}:`, log ? `Ran (Status: ${log.status}, Bundles: ${log.bundles}) | Error: ${JSON.stringify(log.error)}` : 'Did not run');
    }

  } catch (err) {
    console.error("Error:", err);
  }
}

testChallengeFilter();
