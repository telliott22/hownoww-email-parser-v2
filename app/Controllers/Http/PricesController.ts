import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Price from 'App/Models/Price'

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
        ? (latestPrice.yield - yesterdaysPrice.yield).toFixed(2)
        : ''
    })

    return ctx.response.json(latestPrices)
  }
}