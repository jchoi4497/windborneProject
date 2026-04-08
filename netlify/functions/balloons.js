export async function handler() {
  const BALLOON_URL = "https://a.windbornesystems.com/treasure/00.json";
  try {
    const response = await fetch(BALLOON_URL);
    if (!response.ok) throw new Error(`Failed to fetch ${BALLOON_URL}`);

    const data = await response.json();

    // Return only the first 24 items
    const first24 = data.slice(0, 24);

    const formattedBalloons = [];
    const corruptedCount = [];

    for (let i = 0; i < first24.length; i++) {
      const latitude = first24[i][0];
      const longitude = first24[i][1];
      const altitude = first24[i][2];
      const hour = i;

      if (latitude === null || longitude === null || altitude === null) {
        console.warn(`Data for ${i} hours ago corrupted`, first24[i]);
        corruptedCount.push(i);
        continue;
      }

      formattedBalloons.push({
        lat: latitude,
        lng: longitude,
        altitude: altitude / 10000,
        hour,
      });
    }

    // Include metadata about corrupt data
    return {
      statusCode: 200,
      body: JSON.stringify({
        balloons: formattedBalloons,
        metadata: {
          total: first24.length,
          valid: formattedBalloons.length,
          corrupted: corruptedCount.length,
          corruptedHours: corruptedCount,
        },
      }),
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 200,
      body: JSON.stringify({
        balloons: [],
        metadata: {
          total: 0,
          valid: 0,
          corrupted: 0,
          corruptedHours: [],
        },
      }),
    };
  }
}
