import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import sanityClient from '../../../sanity/client'
import { bondScheduleQuery } from '../../../sanity/queries'
export default class SchedulesController {
  public async getSchedule(ctx: HttpContextContract) {
    const { slug, amount } = ctx.request.all()

    if (slug) {
      const moment = require('moment')

      const query = bondScheduleQuery({ slug })

      const bond = await sanityClient().fetch(query)

      if (!bond) {
        return ctx.response.notFound('Bond not found')
      }

      const dateToCompare = bond.longShortCouponDate ? bond.longShortCouponDate : bond.maturityDate

      const compareDate = moment(dateToCompare, 'YYYY-MM-DD').hour(0).minute(0)

      const now = moment().hour(0).minute(0)

      const scheduleArray: object[] = []

      let index = 0

      while (now.isBefore(compareDate)) {
        let interest = parseFloat(amount) * (parseFloat(bond.coupon) / 2 / 100)
        let principal = index === 0 ? parseInt(amount) : 0

        let scheduleRow = {
          date: compareDate.format('DD/MM/YY'),
          interest: interest.toFixed(2),
          principal: principal.toFixed(2),
          total: (interest + principal).toFixed(2),
        }

        scheduleArray.push(scheduleRow)

        compareDate.subtract(6, 'months')
        index++
      }

      return scheduleArray.reverse()
    }
  }

  public async getPreviousNextCoupon(ctx: HttpContextContract) {
    const { slug } = ctx.request.all()

    if (slug) {
      const moment = require('moment') // require

      const query = bondScheduleQuery({ slug })

      const bond = await sanityClient().fetch(query)

      const dateToCompare = bond.longShortCouponDate ? bond.longShortCouponDate : bond.maturityDate

      const compareDate = moment(dateToCompare, 'YYYY-MM-DD').hour(0).minute(0)

      const now = moment().hour(0).minute(0)

      const scheduleArray: string[] = []

      while (now.isBefore(compareDate)) {
        scheduleArray.push(compareDate.format('DD/MM/YY'))

        compareDate.subtract(6, 'months')
      }

      const nextCoupon = scheduleArray[scheduleArray.length - 1]
      const previousCoupon = compareDate.format('DD/MM/YY')

      return {
        next: nextCoupon,
        previous: previousCoupon,
      }
    }
  }
}
