const API_KEY = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4MTM0NzMzNzksImlhdCI6MTc4MTkzNzM3OSwicmF5IjoiYmI2YTIzZjc4ZTkyM2QyNTI4NTZmMjQwYzhkMmEwNzAiLCJzdWIiOjQyMjY5MzZ9.b9lOiLM5pdUsQTPk59aNtOSubfqfJkAzL8c2AByJzkJQV0ENyVnDJB7DDe2vXdemglCGUfVkAadtKV_70BpLMuaTVBJbAfOaBUBPL_VG26yTUMD4pfqiuLpoMUQCtAomR2lSy-1yePlKCzWljRSQWnp_M8R5IBrucET4q_Q6RAQif87s9nsCMv08Jb4kPmJuKywOI1Y8qtBXmkReVSOVGzd-8KePPaQByhKFajMyvarxEYBPRVZMLC1KY0uJz8xea8iiLUDfh4sW29CYprprRK6vrnZuFfudjsyFcbSKp8Y-heQueffD4a-6qzG8RTfWGK0psNUbAHagm2FS9ICguQ";
const BASE = "https://5sim.net/v1";

exports.handler = async function(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };
  
  console.log("[buy-number] received request:", event.body);
  
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({error:"POST only"}) };

  let body;
  try { 
    body = JSON.parse(event.body || "{}"); 
  } catch(e) { 
    console.error("[buy-number] parse error:", e.message);
    return { statusCode:400, headers, body: JSON.stringify({error:"Invalid JSON"}) }; 
  }

  const { country, product } = body;
  console.log("[buy-number] country=" + country + " product=" + product);
  
  if (!country || !product) return { statusCode:400, headers, body: JSON.stringify({error:"country and product required"}) };

  try {
    // Correct format: query parameters, not path
    const url = BASE + "/user/buy/activation?country=" + encodeURIComponent(country) + "&operator=any&product=" + encodeURIComponent(product);
    console.log("[buy-number] calling 5SIM:", url);
    
    const res = await fetch(url, {
      method: "GET",
      headers: { 
        "Authorization": "Bearer " + API_KEY, 
        "Accept": "application/json",
        "User-Agent": "spencerbm/1.0"
      }
    });
    
    const text = await res.text();
    console.log("[buy-number] 5SIM response status=" + res.status + " body=" + text);
    
    let data = {};
    try { data = JSON.parse(text); } catch(e) { data = {raw: text}; }

    if (!res.ok) {
      console.log("[buy-number] failed:", JSON.stringify(data));
      let msg = "Failed to get number.";
      if (res.status === 401) msg = "Invalid API key.";
      else if (res.status === 400) msg = (data.message || "Bad request");
      else if (res.status === 404) msg = "No numbers available.";
      return { statusCode: res.status, headers, body: JSON.stringify({error: msg, details: data}) };
    }

    console.log("[buy-number] success:", JSON.stringify(data));
    return { statusCode:200, headers, body: JSON.stringify({
      ok: true, id: data.id, phone: data.phone,
      product: data.product, country: data.country, status: data.status
    })};
  } catch(e) {
    console.error("[buy-number] exception:", e.message, e.stack);
    return { statusCode:502, headers, body: JSON.stringify({error: "Exception: " + e.message}) };
  }
};
