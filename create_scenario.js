const token = '5f587b99-5372-40a0-be38-256e26a7eba0';
const teamId = 1251448;

const flow = [
  {
    id: 1,
    module: "gateway:CustomWebHook",
    version: 1,
    parameters: {
      hook: 2395810,
      maxResults: 1
    },
    metadata: {
      designer: { x: 0, y: 0 }
    }
  },
  {
    id: 6,
    module: "gateway:WebhookRespond",
    version: 1,
    parameters: {},
    mapper: {
      status: "200",
      body: '{{1.query."hub.challenge"}}'
    },
    metadata: {
      designer: { x: 250, y: 0 }
    }
  },
  {
    id: 2,
    module: "gemini-ai:createACompletionGeminiPro",
    version: 1,
    parameters: {
      __IMTCONN__: 7290067
    },
    mapper: {
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "{{1.entry[].changes[].value.messages[].text.body}}",
              type: "text"
            }
          ]
        }
      ],
      generationConfig: {},
      system_instruction: {
        parts: [
          {
            text: "Sos Luz, el asistente oficial de ShopDigital. Eres un bot de atención al cliente útil, amable y eficiente."
          }
        ]
      }
    },
    metadata: {
      designer: { x: 500, y: 0 }
    }
  },
  {
    id: 5,
    module: "whatsapp-business-cloud:sendMessage",
    version: 1,
    parameters: {
      __IMTCONN__: 9201390
    },
    mapper: {
      to: "{{1.entry[].changes[].value.messages[].from}}",
      text: {
        body: "{{2.text}}",
        preview_url: false
      },
      type: "text",
      fromId: "1059176120608663"
    },
    metadata: {
      designer: { x: 750, y: 0 }
    }
  }
];

const metadata = {
  instant: true,
  version: 1,
  designer: { orphans: [] },
  scenario: {
    dlq: false,
    slots: null,
    dataloss: false,
    maxErrors: 3,
    autoCommit: true,
    roundtrips: 1,
    sequential: false,
    confidential: false,
    freshVariables: false,
    autoCommitTriggerLast: true
  }
};

const blueprint = {
  flow,
  metadata
};

// Make API v2 expects blueprint and scheduling as strings
const payload = {
  name: "Integration WhatsApp Custom Webhook (Luz)",
  teamId: teamId,
  hookId: 2395810,
  scheduling: JSON.stringify({
    type: "immediately"
  }),
  blueprint: JSON.stringify(blueprint)
};

async function createScenario() {
  console.log("Sending POST request to Make API...");
  try {
    const res = await fetch("https://us2.make.com/api/v2/scenarios", {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const status = res.status;
    const bodyText = await res.text();
    console.log(`Response Status: ${status}`);
    console.log("Response Body:", bodyText);
  } catch (err) {
    console.error("Error in fetch:", err);
  }
}

createScenario();
