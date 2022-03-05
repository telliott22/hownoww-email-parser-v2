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

      if (bond.customCouponSchedule) {
        const rows = bond.customCouponSchedule.split(',')

        const now = moment().hour(0).minute(0)

        const returnArray: object[] = []

        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
          const row = rows[rowIndex]

          const compareDate = moment(row, 'DD/MM/YY').hour(0).minute(0)

          //If the date is before today,
          if (now.isBefore(compareDate)) {
            let interest = parseFloat(amount) * (parseFloat(bond.coupon) / 2 / 100)
            let principal = rowIndex === rows.length - 1 ? parseInt(amount) : 0
            let total = interest + principal

            const returnObject = {
              date: row,
              interest: interest,
              principal: principal,
              total: total,
            }

            returnArray.push(returnObject)
          }
        }

        return returnArray
      }

      //   const csv = require('csvtojson')

      //   return csv({
      //     noheader: true,
      //     headers: ['date', 'interest', 'principal', 'total'],
      //   })
      //     .fromString(bond.customCouponSchedule)
      //     .then((csvRow) => {
      //       for (let rowIndex = 0; rowIndex < csvRow.length; rowIndex++) {
      //         const row = csvRow[rowIndex]

      //         const compareDate = moment(row.date, 'DD/MM/YY').hour(0).minute(0)

      //         let interest = parseFloat(amount) * (parseFloat(bond.coupon) / 2 / 100)
      //         let principal = rowIndex === csvRow.length - 1 ? parseInt(amount) : 0
      //         let total = (interest + principal).toFixed(2)

      //         row.interest = interest
      //         row.principal = principal
      //         row.total = total

      //         //If the date is after today,
      //         if (now.isAfter(compareDate)) {
      //           returnIndex = rowIndex
      //         }
      //       }

      //       return csvRow.slice(returnIndex + 1)
      //     })
      // }

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
      const moment = require('moment')

      const query = bondScheduleQuery({ slug })

      const bond = await sanityClient().fetch(query)

      const dateToCompare = bond.longShortCouponDate ? bond.longShortCouponDate : bond.maturityDate

      const now = moment().hour(0).minute(0)

      const scheduleArray: string[] = []

      console.log('bond', bond)
      console.log('bond.customCouponSchedule', bond.customCouponSchedule)

      if (bond.customCouponSchedule) {
        const customCouponSchedule = bond.customCouponSchedule.split(',')

        let previousCoupon

        for (let index = 0; index < customCouponSchedule.length; index++) {
          const customCoupon = customCouponSchedule[index]

          const compareDate = moment(customCoupon, 'DD/MM/YY').hour(0).minute(0)

          if (now.isBefore(compareDate)) {
            scheduleArray.push(compareDate.format('DD/MM/YY'))
          } else {
            previousCoupon = compareDate.format('DD/MM/YY')
          }
        }

        const nextCoupon = scheduleArray[0]

        return {
          next: nextCoupon,
          previous: previousCoupon,
        }
      } else {
        const compareDate = moment(dateToCompare, 'YYYY-MM-DD').hour(0).minute(0)

        while (now.isBefore(compareDate)) {
          scheduleArray.push(compareDate.format('DD/MM/YY'))

          compareDate.subtract(6, 'months')
        }

        const nextCoupon = scheduleArray[scheduleArray.length - 1]
        const previousCoupon = compareDate.format('DD/MM/YY')

        let previousBeforeFirst = false

        if (bond.firstCoupon) {
          const firstCoupon = moment(bond.firstCoupon, 'YYYY-MM-DD').hour(0).minute(0)

          previousBeforeFirst = previousCoupon < firstCoupon
        }

        return {
          next: nextCoupon,
          previous: previousCoupon,
          previousBeforeFirst,
        }
      }
    }
  }
}
