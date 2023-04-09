/**
 * Welcome to Cloudflare Workers! This is your first scheduled worker.
 *
 * - Run `wrangler dev --local` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/cdn-cgi/mf/scheduled"` to trigger the scheduled event
 * - Go back to the console to see what your worker has logged
 * - Update the Cron trigger in wrangler.toml (see https://developers.cloudflare.com/workers/wrangler/configuration/#triggers)
 * - Run `wrangler publish --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/
 */

export interface Env {
  players: string[]
  apiKey: string
  webhook: string
}

const listApi = "https://itl2023.groovestats.com/api/entrant/leaderboard"

const medals: string[] = ["0", "🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"]

const doIt = async (env: Env) => {
  const players = env.players.map((name) => name.toLocaleLowerCase())

  console.log("Calling ITL API")
  const data = await fetch(listApi)
  console.log(`Api call succesful: ${data.ok}, status: ${data.status}`)
  const leaderboardData = await data.json<LeaderboardResponse>()
  console.log(
    `Leaderboard data succesful: ${leaderboardData.success}, message: ${leaderboardData.message}`
  )

  const interestingPlayers = leaderboardData.data.leaderboard.flatMap<InterestingPlayerData>(
    (player, index) =>
      players.includes(player.name.toLocaleLowerCase()) ? [{ ...player, placement: index + 1 }] : []
  )

  const outputLines: string[] = []
  let idx = 1
  for (const player of interestingPlayers) {
    outputLines.push(
      `${medals[idx] ?? `${idx}.`} #${player.placement} - ${
        player.name
      } - ${player.rankingPoints.toLocaleString()}`
    )
    idx++
  }
  const content = outputLines.join("\n")
  console.log(content)

  console.log("Sending webhook...")
  const webhookResult = await fetch(env.webhook, {
    method: "POST",
    body: JSON.stringify({ content }),
    headers: { "content-type": "application/json;charset=UTF-8" },
  })
  console.log(`Webhook call succesful: ${webhookResult.ok}, status: ${webhookResult.status}`)

  return outputLines
}

export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    await doIt(env)
  },

  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const auth = request.headers.get("authentication")
    if (auth !== env.apiKey) {
      return new Response(null, { status: 403 })
    }

    const result = await doIt(env)

    return new Response(JSON.stringify({ result }), {
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
    })
  },
}
