const token = '5f587b99-5372-40a0-be38-256e26a7eba0';
const scenarioId = 5260209;

async function applyCleanConfig() {
  try {
    // 1. Fetch current blueprint
    const getRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/blueprint`, {
      headers: { "Authorization": `Token ${token}` }
    });
    if (!getRes.ok) throw new Error(`Fetch blueprint failed: ${getRes.status}`);
    const getData = await getRes.json();
    const bp = getData.response.blueprint;

    // 2. Find Module 6
    const mod6 = bp.flow.find(m => m.id === 6);
    if (!mod6) throw new Error("Module 6 not found in flow");

    // 3. Set clean mapper without headers
    mod6.mapper = {
      status: "200",
      body: "{{1.`hub.challenge`}}"
    };

    console.log("Applying clean config for Module 6...");

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
    console.log("Scenario patched successfully with clean config!");

    // 5. Test webhook
    const challenge = 'FINAL_CHALLENGE_' + Math.floor(Math.random() * 1000000);
    const url = `https://hook.us2.make.com/b428rov524nlileo9bhjpxh3wpxzoynb?hub.mode=subscribe&hub.challenge=${challenge}&hub.verify_token=tiendadigital`;
    const res = await fetch(url);
    const body = await res.text();
    console.log(`Test Webhook HTTP Response: ${res.status} | Body: ${body}`);

  } catch (err) {
    console.error("Error:", err);
  }
}

applyCleanConfig();
