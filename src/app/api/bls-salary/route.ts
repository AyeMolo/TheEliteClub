export async function POST(req: Request) {
  try {
    const { socCode } = await req.json()

    if (!socCode || typeof socCode !== "string") {
      return Response.json({ error: "SOC code is required" }, { status: 400 })
    }

    //Remove dash from SOC code: "15-1252" → "151252"
    const cleanCode = socCode.replace("-", "")

    //BLS OEWS series ID format:
    //OE + U(unadjusted) + N(national) + 0000000(area) + 000000(all industries) + OCCUPATION(6) + DATATYPE(2)
    //Data types: 12=annual 10th, 13=annual 25th, 14=annual median, 15=annual 75th, 16=annual 90th
    const base = `OEUN0000000000000${cleanCode}`
    const seriesIds = [
      `${base}12`, //10th
      `${base}13`, //25th
      `${base}14`, //median
      `${base}15`, //75th
      `${base}16`, //90th
      `${base}04`, //mean
    ]

    const response = await fetch("https://api.bls.gov/publicAPI/v1/timeseries/data/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seriesid: seriesIds }),
    })

    const data = await response.json()

    if (data.status !== "REQUEST_SUCCEEDED") {
      return Response.json({ error: "BLS API request failed" }, { status: 502 })
    }

    const salaries: Record<string, string> = {}
    const labels: Record<string, string> = {
      "12": "p10",
      "13": "p25",
      "14": "median",
      "15": "p75",
      "16": "p90",
      "04": "mean",
    }

    for (const series of data.Results?.series || []) {
      const typeCode = series.seriesID.slice(-2)
      const label = labels[typeCode]
      const latestValue = series.data?.[0]?.value
      if (label && latestValue && latestValue !== "-") {
        salaries[label] = latestValue
      }
    }

    if (Object.keys(salaries).length === 0) {
      return Response.json({ error: "No salary data found for this occupation" }, { status: 404 })
    }

    return Response.json({
      result: {
        soc_code: socCode,
        salaries,
        source: "U.S. Bureau of Labor Statistics (OEWS)",
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return Response.json({ error: message }, { status: 500 })
  }
}
