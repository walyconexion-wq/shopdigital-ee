const token = '5f587b99-5372-40a0-be38-256e26a7eba0';
const scenarioId = 5260209;

async function checkFilters() {
  try {
    const getRes = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/blueprint`, {
      headers: { "Authorization": `Token ${token}` }
    });
    const getData = await getRes.json();
    const bp = getData.response.blueprint;

    console.log("=== SCENARIO MODULES & FILTERS ===");
    for (const m of bp.flow) {
      console.log(`Module ${m.id} (${m.module})`);
      if (m.filter) {
        console.log("  Filter:", JSON.stringify(m.filter, null, 2));
      } else {
        console.log("  No filter on this module inlet");
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

checkFilters();
