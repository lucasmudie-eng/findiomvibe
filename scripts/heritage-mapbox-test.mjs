const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (!token) {
  console.error("Missing NEXT_PUBLIC_MAPBOX_TOKEN");
  process.exit(1);
}

const url = new URL("https://api.mapbox.com/geocoding/v5/mapbox.places/Douglas%2C%20Isle%20of%20Man.json");
url.searchParams.set("access_token", token);
url.searchParams.set("limit", "1");
url.searchParams.set("country", "IM");

const res = await fetch(url.toString());
console.log("Status:", res.status);
const text = await res.text();
console.log(text.slice(0, 400));
