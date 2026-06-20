const API_KEY = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4MTM0NzMzNzksImlhdCI6MTc4MTkzNzM3OSwicmF5IjoiYmI2YTIzZjc4ZTkyM2QyNTI4NTZmMjQwYzhkMmEwNzAiLCJzdWIiOjQyMjY5MzZ9.b9lOiLM5pdUsQTPk59aNtOSubfqfJkAzL8c2AByJzkJQV0ENyVnDJB7DDe2vXdemglCGUfVkAadtKV_70BpLMuaTVBJbAfOaBUBPL_VG26yTUMD4pfqiuLpoMUQCtAomR2lSy-1yePlKCzWljRSQWnp_M8R5IBrucET4q_Q6RAQif87s9nsCMv08Jb4kPmJuKywOI1Y8qtBXmkReVSOVGzd-8KePPaQByhKFajMyvarxEYBPRVZMLC1KY0uJz8xea8iiLUDfh4sW29CYprprRK6vrnZuFfudjsyFcbSKp8Y-heQueffD4a-6qzG8RTfWGK0psNUbAHagm2FS9ICguQ";
const BASE = "https://5sim.net/v1";

exports.handler = async function(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };
  if (event.httpMethod === "OPTIONS") return { statusCode:200, headers, body:"" };

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch(e) { return { statusCode:400, headers, body: JSON.stringify({error:"Invalid body"}) }; }

  const { id } = body;
  if (!id) return { statusCode:400, headers, body: JSON.stringify({error:"id required"}) };

  try {
    const res = await fetch(BASE + "/user/cancel/" + id, {
      method: "GET",
      headers: { "Authorization": "Bearer " + API_KEY, "Accept": "application/json" }
    });
    const data = await res.json().catch(() => ({}));
    return { statusCode: res.ok ? 200 : res.status, headers, body: JSON.stringify({ok: res.ok, data}) };
  } catch(e) {
    return { statusCode:502, headers, body: JSON.stringify({error:"Network error."}) };
  }
};
