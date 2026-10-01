export default defineEventHandler(async () => (await listProposals()).map(summarize))
