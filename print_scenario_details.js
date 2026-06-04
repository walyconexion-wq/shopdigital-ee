const token = '5f587b99-5372-40a0-be38-256e26a7eba0';
const scenarioId = 5260209;

async function printDetails() {
  try {
    const res = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/blueprint`, {
      headers: { "Authorization": `Token ${token}` }
    });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const data = await res.json();
    const bp = data.response.blueprint;

    console.log("=== SCENARIO FLOW ===");
    for (const m of bp.flow) {
      console.log(`\n--- Module ${m.id} (${m.module}) ---`);
      console.log("Label:", m.metadata?.label || "None");
      console.log("Filter:", m.filter ? JSON.stringify(m.filter, null, 2) : "None");
      console.log("Mapper:", m.mapper ? JSON.stringify(m.mapper, null, 2) : "None");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

printDetails();
