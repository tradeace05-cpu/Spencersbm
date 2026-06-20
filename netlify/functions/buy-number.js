const API_KEY = "c37c9b608a8e5626057984c5aea3e7b1";
const BASE = "https://oraclelense.com/api/v1";

exports.handler = async function(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };
  
  console.log("[buy-number] OracleLense request:", event.body);
  
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({error:"POST only"}) };

  let body;
  try { 
    body = JSON.parse(event.body || "{}"); 
  } catch(e) { 
    return { statusCode:400, headers, body: JSON.stringify({error:"Invalid JSON"}) }; 
  }

  const { country, product } = body;
  console.log("[buy-number] country=" + country + " product=" + product);
  
  if (!country || !product) return { statusCode:400, headers, body: JSON.stringify({error:"country and product required"}) };

  try {
    const url = BASE + "/numbers/buy";
    console.log("[buy-number] calling OracleLense:", url);
    
    const res = await fetch(url, {
      method: "POST",
      headers: { 
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        country: country,
        service: product
      })
    });
    
    const text = await res.text();
    console.log("[buy-number] response:", res.status, text);
    
    let data = {};
    try { data = JSON.parse(text); } catch(e) { data = {raw: text}; }

    if (!res.ok) {
      console.log("[buy-number] error:", JSON.stringify(data));
      let msg = data.message || "Failed to get number";
      return { statusCode: res.status, headers, body: JSON.stringify({error: msg}) };
    }

    console.log("[buy-number] success:", JSON.stringify(data));
    return { statusCode:200, headers, body: JSON.stringify({
      ok: true, id: data.id, phone: data.phone,
      product: data.product, country: data.country, status: data.status
    })};
  } catch(e) {
    console.error("[buy-number]", e.message);
    return { statusCode:502, headers, body: JSON.stringify({error: e.message}) };
  }
};
