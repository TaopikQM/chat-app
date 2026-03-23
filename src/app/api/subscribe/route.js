let subscribers = [];

export async function POST(req) {
  const sub = await req.json();

  subscribers.push(sub);

  console.log("Subscriber masuk:", subscribers.length);

  return Response.json({ success: true });
}

export { subscribers };
