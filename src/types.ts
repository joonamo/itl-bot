type PlayerData = {
  id: number
  membersId: number
  // ISO Timestamp
  dateAdded: string
  // ISO Timestamp
  lastUpdated: string
  status: number
  totalPoints: number
  rankingPoints: number
  totalPass: number
  totalFc: number
  totalFec: number
  totalQuad: number
  totalQuint: number
  crossoverLevel: number
  bracketLevel: number
  footswitchLevel: number
  jackLevel: number
  sideswitchLevel: number
  doublestepLevel: number
  staminaLevel: number
  isBuddy: boolean
  // Actually JSON
  preferences: string
  name: string
  sex: string
  profileImg: string
}

type InterestingPlayerData = PlayerData & {
  placement: number
  localPlacement: number
  emoji: string
}

type LeaderboardResponse = {
  success: boolean
  message: string
  data: {
    leaderboard: PlayerData[]
    rivalMembersIds: []
  }
}
