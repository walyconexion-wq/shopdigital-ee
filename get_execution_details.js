const token = '5f587b99-5372-40a0-be38-256e26a7eba0';
const scenarioId = 5260209;
const execId = 'f8bbe33d68b442b39ffb7d4391a4174a';

const endpoints = [
  `https://us2.make.com/api/v2/scenarios/${scenarioId}/executions/${execId}`,
  `https://us2.make.com/api/v2/scenarios/${scenarioId}/runs/${execId}`,
  `https://us2.make.com/api/v2/scenarios/${scenarioId}/logs/${execId}`,
  `https://us2.make.com/api/v2/scenarios/${scenarioId}/executions/${execId}/details`,
  `https://us2.make.com/api/v2/scenarios/${scenarioId}/runs/${execId}/details`,
  `https://us2.make.com/api/v2/scenarios/${scenarioId}/logs?id=${execId}`,
  `https://us2.make.com/api/v2/scenarios/${scenarioId}/modules/1/logs?executionId=${execId}`
];

async function testEndpoints() {
  for (const url of endpoints) {
    console.log(`\nTesting: ${url}`);
    try {
      const res = await fetch(url, {
        headers: { "Authorization": `Token ${token}` }
      });
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const text = await res.text();
        console.log(`Content: ${text.slice(0, 500)}`);
      }
    } catch (err) {
      console.error("Error:", err.message);
    }
  }
}

testEndpoints();
