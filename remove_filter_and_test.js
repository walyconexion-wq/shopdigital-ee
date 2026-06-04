const token = '5f587b99-5372-40a0-be38-256e26a7eba0';
const scenarioId = 5260209;
const webhookUrl = 'https://hook.us2.make.com/b428rov524nlileo9bhjpxh3wpxzoynb';

async function removeFilterAndTest() {
  try {
    // 1. Fetch current blueprint
    const getRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/blueprint`, {
      headers: { "Authorization": `Token ${token}` }
    });
    if (!getRes.ok) throw new Error(`Fetch blueprint failed: ${getRes.status}`);
    const getData = await getRes.json();
    const bp = getData.response.blueprint;

    // 2. Find Module 2 and remove filter
    const mod2 = bp.flow.find(m => m.id === 2);
    if (!mod2) throw new Error("Module 2 not found");
    const originalFilter = mod2.filter;
    delete mod2.filter;

    console.log("Removed filter from Module 2. Patching scenario...");

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
    console.log("Scenario patched without filter.");

    // 4. Send mock POST
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
                    text: { body: "Hola desde test mock post" },
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

    console.log("Sending mock POST request...");
    const postRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    console.log(`Mock POST status: ${postRes.status}`);

    // Wait 4 seconds for execution to complete
    console.log("Waiting 4 seconds for execution...");
    await new Promise(resolve => setTimeout(resolve, 4000));

    // 5. Get recent runs
    const logsRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/logs`, {
      headers: { "Authorization": `Token ${token}` }
    });
    const logsData = await logsRes.json();
    const latestRun = logsData.scenarioLogs[0];
    console.log(`Latest Run ID: ${latestRun.id} | Timestamp: ${latestRun.timestamp} | Status: ${latestRun.status}`);

    // 6. Check module execution
    for (const modId of [1, 6, 2, 5]) {
      const mLogRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/modules/${modId}/logs`, {
        headers: { 'Authorization': 'Token ' + token }
      });
      const mLogData = await mLogRes.json();
      const log = mLogData.moduleLogs.find(l => l.executionId === latestRun.id);
      console.log(`Module ${modId}:`, log ? `Ran (Status: ${log.status}, Bundles: ${log.bundles})` : 'Did not run');
    }

    // 7. Restore filter back to scenario to be clean
    console.log("Restoring filter back to Module 2...");
    mod2.filter = originalFilter;
    const restoreRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ blueprint: JSON.stringify(bp) })
    });
    if (restoreRes.ok) console.log("Filter restored successfully.");

  } catch (err) {
    console.error("Error:", err);
  }
}

removeFilterAndTest();
