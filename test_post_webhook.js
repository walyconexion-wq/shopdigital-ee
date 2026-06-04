const webhookUrl = 'https://hook.us2.make.com/b428rov524nlileo9bhjpxh3wpxzoynb';

async function sendMockPost() {
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
              contacts: [
                {
                  profile: {
                    name: "Waly"
                  },
                  wa_id: "5491140607059"
                }
              ],
              messages: [
                {
                  from: "5491140607059",
                  id: "wamid.HBgNNTQ5MTE0MDYwNzA1OQ...",
                  timestamp: "1780457635",
                  text: {
                    body: "Hola desde test mock post"
                  },
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

  console.log("Sending mock POST request to webhook...");
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    console.log(`Response Status: ${res.status}`);
    const body = await res.text();
    console.log(`Response Body: ${body}`);
  } catch (err) {
    console.error("Error:", err);
  }
}

sendMockPost();
