export default async function handler(req, res) {
  const {
    query: { userId },
  } = req;

  const client_id = process.env.OSU_CLIENT_ID;
  const client_secret = process.env.OSU_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    return res.status(500).json({ error: "Missing client ID or secret." });
  }

  // Step 1: Get OAuth token
  let token;
  try {
    const authRes = await fetch("https://osu.ppy.sh/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id,
        client_secret,
        grant_type: "client_credentials",
        scope: "public",
      }),
    });
    const authData = await authRes.json();
    token = authData.access_token;
  } catch (err) {
    return res.status(500).json({ error: "Failed to get token" });
  }

  // Step 2: Fetch user data
  try {
    const userRes = await fetch(`https://osu.ppy.sh/api/v2/users/${userId}/osu`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userRes.ok) {
      throw new Error("Failed to fetch user");
    }

    const userData = await userRes.json();
    res.status(200).json(userData);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
}
