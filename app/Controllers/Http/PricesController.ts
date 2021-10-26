import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Price from 'App/Models/Price'
import sanityClient from '../../../sanity/client'
import bondBasicQuery from '../../../sanity/queries'

export type Bond = {
  title: string
}

export default class PricesController {
  public uniquePrices(arr: Price[], predicate: any) {
    const cb = typeof predicate === 'function' ? predicate : (o) => o[predicate]

    return [
      ...arr
        .reduce((map, item) => {
          const key = item === null || item === undefined ? item : cb(item)

          map.has(key) || map.set(key, item)

          return map
        }, new Map())
        .values(),
    ]
  }

  public async getPrices(ctx: HttpContextContract) {
    // const _ = require('lodash')

    //Only get the prices for the last 3 days
    const date = new Date()
    date.setDate(date.getDate() - 7)

    const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ')

    const prices = await Price.query()
      .orderBy('created_at', 'desc')
      .where('created_at', '>', formattedDate)

    const latestPrices = this.uniquePrices(prices, 'title')

    latestPrices.forEach((latestPrice) => {
      const yesterdaysPrice = prices.find((price) => {
        return price.title === latestPrice.title && price.day !== latestPrice.day
      })

      latestPrice.yield_yesterday = yesterdaysPrice ? yesterdaysPrice.yield : ''
      latestPrice.yield_difference = yesterdaysPrice
        ? (latestPrice.yield - parseFloat(yesterdaysPrice.yield)).toFixed(2)
        : ''
    })

    return ctx.response.json(latestPrices)
  }

  public async getPrice(ctx: HttpContextContract) {
    const all = ctx.request.all()

    const slug = all.slug
    const page = all.page
    const perPage = 10

    if (slug) {
      const title = slug.replace(/-/g, ' ')

      if (page) {
        const price = await Price.query()
          .where('title', title)
          .where('eod', 1)
          .forPage(page, perPage)
          .orderBy('created_at', 'desc')

        return ctx.response.json(price)
      }

      const price = await Price.query()
        .where('title', title)
        .where('eod', 1)
        .orderBy('created_at', 'desc')

      return ctx.response.json(price)
    }
  }

  public async postPrice(ctx: HttpContextContract) {
    const cheerio = require('cheerio')

    const all = ctx.request.all()

    const subject: string = all.subject
    const html: string = all.html
    const from: string = all.from
    let bondCount = 1

    if ((from === 'markets@fbnbank.co.uk' || from === 'telliott22@gmail.com') && html.length) {
      const bonds = await sanityClient().fetch(bondBasicQuery)

      const $ = cheerio.load(html)

      const rows = $('tr')

      for (let index = 0; index < rows.length; index++) {
        const row = rows[index]

        const tds = row.childNodes

        let bondData: string[] = []
        let bondRowIndex: number | null = null

        for (let tdIndex = 0; tdIndex < tds.length; tdIndex++) {
          const td = tds[tdIndex]

          const textNode = td.childNodes

          const text = cheerio.text(textNode).trim()

          if (text.length > 0) {
            if (bondRowIndex === null) {
              const bondFound: Bond = bonds.find((bond) => {
                return bond.title.toLowerCase().trim() === text.toLowerCase()
              })

              if (bondFound) {
                bondData = [bondFound.title]

                bondRowIndex = 0
              }
            } else {
              bondData.push(text)
              bondRowIndex++

              //If closing email
              if (
                subject.indexOf('CLOSING') > -1 ||
                subject.indexOf('Close') > -1 ||
                subject.indexOf('close') > -1
              ) {
                //After 9th column in email create price
                if (bondRowIndex === 9) {
                  const price = new Price()

                  price.title = bondData[0]

                  price.bid_price = bondData[4]
                  price.ask_price = bondData[5]
                  price.bid_percentage = bondData[6]
                  price.ask_percentage = bondData[7]
                  price.change = bondData[9]
                  price.eod = true

                  price.save()

                  bondRowIndex = null
                  bondData = []

                  bondCount++
                }

                //If normal
              } else {
                //After 5th column in email create price
                if (bondRowIndex === 5) {
                  const price = new Price()

                  price.title = bondData[0]

                  price.bid_price = bondData[1]
                  price.ask_price = bondData[2]
                  price.bid_percentage = bondData[3]
                  price.ask_percentage = bondData[4]
                  price.change = bondData[5]

                  price.save()

                  bondRowIndex = null
                  bondData = []

                  bondCount++
                }
              }
            }
          }
        }
      }
    }

    const responseMessage = bondCount + ' bonds updated'

    return ctx.response.json(responseMessage)
  }
}
