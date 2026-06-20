const API_KEY = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4MTM0NzMzNzksImlhdCI6MTc4MTkzNzM3OSwicmF5IjoiYmI2YTIzZjc4ZTkyM2QyNTI4NTZmMjQwYzhkMmEwNzAiLCJzdWIiOjQyMjY5MzZ9.b9lOiLM5pdUsQTPk59aNtOSubfqfJkAzL8c2AByJzkJQV0ENyVnDJB7DDe2vXdemglCGUfVkAadtKV_70BpLMuaTVBJbAfOaBUBPL_VG26yTUMD4pfqiuLpoMUQCtAomR2lSy-1yePlKCzWljRSQWnp_M8R5IBrucET4q_Q6RAQif87s9nsCMv08Jb4kPmJuKywOI1Y8qtBXmkReVSOVGzd-8KePPaQByhKFajMyvarxEYBPRVZMLC1KY0uJz8xea8iiLUDfh4sW29CYprprRK6vrnZuFfudjsyFcbSKp8Y-heQueffD4a-6qzG8RTfWGK0psNUbAHagm2FS9ICguQ";
const BASE = "https://5sim.net/v1";

exports.handler = async function(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };
  if (event.httpMethod === "OPTIONS") return { statusCode:200, headers, body:"" };

  const id = event.queryStringParameters && event.queryStringParameters.id;
  if (!id) return { statusCode:400, headers, body: JSON.stringify({error:"id required"}) };

  try {
    const res = await fetch(BASE + "/user/check/" + id, {
      method: "GET",
      headers: { "Authorization": "Bearer " + API_KEY, "Accept": "application/json" }
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) return { statusCode: res.status, headers, body: JSON.stringify({error: data.message || "Error"}) };

    let otp = null, smsText = null;
    if (data.sms && data.sms.length > 0) {
      smsText = data.sms[0].text || data.sms[0].body || "";
      const m = smsText.match(/\b\d{4,8}\b/);
      otp = m ? m[0] : smsText;
    }

    return { statusCode:200, headers, body: JSON.stringify({
      ok: true, id: data.id, phone: data.phone,
      status: data.status, sms: data.sms || [],
      otp: otp, smsText: smsText
    })};
  } catch(e) {
    return { statusCode:502, headers, body: JSON.stringify({error:"Network error."}) };
  }
};
