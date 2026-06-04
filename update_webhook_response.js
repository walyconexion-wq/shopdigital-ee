import fs from 'fs';

const token = '5f587b99-5372-40a0-be38-256e26a7eba0';
const scenarioId = 5260209;

async function run() {
  try {
    // 1. Fetch current blueprint
    const getRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/blueprint`, {
      headers: {
        "Authorization": `Token ${token}`
      }
    });
    if (!getRes.ok) {
      throw new Error(`Failed to fetch blueprint: ${getRes.status} ${await getRes.text()}`);
    }
    const getData = await getRes.json();
    const bp = getData.response.blueprint;

    // 2. Find Module 6 (Webhook Response)
    const mod6 = bp.flow.find(m => m.id === 6);
    if (!mod6) {
      throw new Error("Could not find Module 6 in the flow.");
    }

    // 3. Update Module 6 mapper
    mod6.mapper = {
      status: "200",
      body: "{{1.`hub.challenge`}}",
      headers: [
        {
          name: "Content-Type",
          value: "text/plain"
        }
      ]
    };

    console.log("Updated Module 6 structure:", JSON.stringify(mod6, null, 2));

    // 4. Patch back
    const payload = {
      blueprint: JSON.stringify(bp)
    };

    const patchRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    console.log(`PATCH Response Status: ${patchRes.status}`);
    const patchBody = await patchRes.text();
    console.log("PATCH Response Body:", patchBody);

  } catch (err) {
    console.error("Error:", err);
  }
}

run();
