import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import algoliasearch from 'algoliasearch'
import sanityClient from '../../../sanity/client'
import { guidePagesQuery } from '../../../sanity/queries'

export default class AlgoliaController {
  public async indexRecords(ctx: HttpContextContract) {
    if (process.env.ALGOLIA_ADMIN_API_KEY) {
      const client = algoliasearch('VCCRZ08L2G', process.env.ALGOLIA_ADMIN_API_KEY)
      const index = client.initIndex('guidePages')

      const guidePages = await sanityClient().fetch(guidePagesQuery)
      const result = index.saveObjects(guidePages, { autoGenerateObjectIDIfNotExist: true })

      return result
    }
  }
}
