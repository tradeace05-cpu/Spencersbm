const API_KEY = "896f3e9907ab4910b2aef75e2efe0d0c";
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
    // Correct format: query parameters with API key
    const url = BASE + "/user/buy/activation?country=" + encodeURIComponent(country) + "&operator=any&product=" + encodeURIComponent(product) + "&api_key=" + API_KEY;
    console.log("[buy-number] calling 5SIM:", url);
    
    const res = await fetch(url, {
      method: "GET",
      headers: { 
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
