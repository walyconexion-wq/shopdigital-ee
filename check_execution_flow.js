const token = '5f587b99-5372-40a0-be38-256e26a7eba0';
const scenarioId = 5260209;
const execId = '0fce277a30dd48acbd4fbf9c1df6eb80';

async function check() {
  try {
    for (const modId of [1, 6, 2, 5]) {
      const res = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}/modules/${modId}/logs`, {
        headers: { 'Authorization': 'Token ' + token }
      });
      if (!res.ok) {
        console.log(`Module ${modId}: Failed to fetch logs (${res.status})`);
        continue;
      }
      const data = await res.json();
      const log = data.moduleLogs.find(l => l.executionId === execId);
      console.log(`Module ${modId}:`, log ? `Ran (Status: ${log.status}, Bundles: ${log.bundles})` : 'Did not run');
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

check();
