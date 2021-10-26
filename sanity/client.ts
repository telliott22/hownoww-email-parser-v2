export type SanityClient = {
  fetch: (query: string) => Promise<any>
}

export default function sanityClient(): SanityClient {
  const sanityClient = require('@sanity/client')

  const client = sanityClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    token: process.env.SANITY_TOKEN,
  })

  return client
}
