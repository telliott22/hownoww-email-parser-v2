import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { bondCouponQuery } from '../../../sanity/queries'
import sanityClient from '../../../sanity/client'
import { formatDate, numberWithCommas } from '../../../lib/utils'
import days360 from 'days360'
import moment from 'moment-timezone'

type Bond = {
  issuer?: string
  maturityDate?: string
  couponDate?: string
  coupon?: string
  customCouponSchedule?: string
}

export default class CouponsController {
  public async getCouponsByMonth(ctx: HttpContextContract) {
    const bonds: Bond[] = await sanityClient().fetch(bondCouponQuery)

    const bondMonths: Bond[] = []

    bonds.forEach((bond: Bond) => {
      console.log('bond', bond)
      const today = new Date()
      const sixMonthsFuture = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate())

      if (bond.customCouponSchedule) {
        const customCouponSchedule = bond.customCouponSchedule.split(',')

        for (let index = 0; index < customCouponSchedule.length; index++) {
          const row = customCouponSchedule[index]

          const bondMonth = parseInt(row.split('/')[1])

          //Have to add 1 to the month because dates are 0 indexed
          const currentMonth = new Date(today).getMonth() + 1
          const sixMonthsFutureMonth = new Date(sixMonthsFuture).getMonth() + 1

          if ((bondMonth && bondMonth === currentMonth) || bondMonth === sixMonthsFutureMonth) {
            bondMonths.push(bond)
          }
        }
      } else {
        //No need to add 1 because maturityDate is a string
        const bondMonth = bond.maturityDate ? parseInt(bond.maturityDate.split('-')[1]) : null

        //Have to add 1 to the month because dates are 0 indexed
        const currentMonth = new Date(today).getMonth() + 1
        const sixMonthsFutureMonth = new Date(sixMonthsFuture).getMonth() + 1

        if ((bondMonth && bondMonth === currentMonth) || bondMonth === sixMonthsFutureMonth) {
          bondMonths.push(bond)
        }
      }
    })

    return ctx.response.json(bondMonths)
  }

  public async getCouponsThisYear(ctx: HttpContextContract) {
    const bonds: Bond[] = await sanityClient().fetch(bondCouponQuery)

    const couponsThisYearArray: object[] = []

    for (let i = 0; i <= 12; i++) {
      bonds.forEach((bond: Bond) => {
        const today = new Date()

        const compareDate = new Date(today.getFullYear(), today.getMonth() + i, today.getDate())
        const sixMonths = new Date(
          compareDate.getFullYear(),
          compareDate.getMonth() + 6,
          compareDate.getDate()
        )

        const monthYear = compareDate.getMonth() + 1 + '/' + compareDate.getFullYear()

        if (!couponsThisYearArray[monthYear]) {
          couponsThisYearArray[monthYear] = {
            date: monthYear,
            coupons: [],
          }
        }

        if (bond.customCouponSchedule) {
          const customCouponSchedule = bond.customCouponSchedule.split(',')

          for (let index = 0; index < customCouponSchedule.length; index++) {
            const customCoupon = customCouponSchedule[index]

            const maturityDateMonth = parseInt(customCoupon.split('/')[1])

            if (
              maturityDateMonth === compareDate.getMonth() + 1 ||
              maturityDateMonth === sixMonths.getMonth() + 1
            ) {
              const customCouponSplit = customCoupon.split('/')
              const formattedBond: Bond = {
                ...bond,
                couponDate: customCouponSplit[0] + '/' + monthYear,
                maturityDate: formatDate(bond.maturityDate),
              }

              couponsThisYearArray[monthYear].coupons.push(formattedBond)
            }
          }
        } else {
          const maturityDate = bond.maturityDate

          if (maturityDate) {
            const maturityDateMonth = parseInt(maturityDate.split('-')[1])

            if (
              bond.maturityDate &&
              (maturityDateMonth === compareDate.getMonth() + 1 ||
                maturityDateMonth === sixMonths.getMonth() + 1)
            ) {
              const formattedBond: Bond = {
                ...bond,
                couponDate: bond.maturityDate.split('-')[2] + '/' + monthYear,
                maturityDate: formatDate(bond.maturityDate),
              }

              couponsThisYearArray[monthYear].coupons.push(formattedBond)
            }
          }
        }
      })
    }

    const couponsThisYearObject = Object.values(couponsThisYearArray)

    return ctx.response.json(couponsThisYearObject)
  }

  public getCashCalculator = (ctx: HttpContextContract) => {
    const { price, amount, coupon, settlementDate, previousCoupon } = ctx.request.all()

    let principalAmount: number = 0
    let accruedInterest: number = 0
    let accrualDays: number = 0
    let total: number = 0

    if (settlementDate) {
      const previousCouponDateParts = previousCoupon.split('/')
      const settlementDateDateParts = settlementDate.split('/')

      console.log('previousCouponDateParts', previousCouponDateParts)
      console.log('settlementDateDateParts', settlementDateDateParts)

      const settlementDateMoment = moment.utc([
        settlementDateDateParts[2],
        settlementDateDateParts[1] - 1,
        settlementDateDateParts[0],
      ])
      const previousCouponDate = moment.utc([
        '20' + previousCouponDateParts[2],
        previousCouponDateParts[1] - 1,
        previousCouponDateParts[0],
      ])

      accrualDays = days360(previousCouponDate.valueOf(), settlementDateMoment.valueOf())
    }

    if (price && amount) {
      principalAmount = (price * amount) / 100
    }

    if (accrualDays && coupon && amount) {
      accruedInterest = (accrualDays / 360) * ((coupon * amount) / 100)
    }

    if (principalAmount && accruedInterest) {
      total = Number(principalAmount) + Number(accruedInterest)
    }

    return {
      principalAmount: numberWithCommas(principalAmount),
      accruedInterest: accruedInterest.toFixed(2),
      accrualDays,
      total: numberWithCommas(parseInt(total.toFixed(2), 10)),
    }
  }
}
