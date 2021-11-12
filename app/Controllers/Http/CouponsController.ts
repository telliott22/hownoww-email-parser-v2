import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { bondCouponQuery } from '../../../sanity/queries'
import sanityClient from '../../../sanity/client'

type Bond = {
  issuer?: string
  maturityDate?: string
  couponDate?: string
}

export default class CouponsController {
  public async getCouponsByMonth(ctx: HttpContextContract) {
    const bonds: Bond[] = await sanityClient().fetch(bondCouponQuery)

    const bondMonths: Bond[] = []

    bonds.forEach((bond: Bond) => {
      const today = new Date()
      const sixMonthsFuture = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate())

      //No need to add 1 because maturityDate is a string
      const bondMonth = bond.maturityDate ? parseInt(bond.maturityDate.split('-')[1]) : null

      //Have to add 1 to the month because dates are 0 indexed
      const currentMonth = new Date(today).getMonth() + 1
      const sixMonthsFutureMonth = new Date(sixMonthsFuture).getMonth() + 1

      if ((bondMonth && bondMonth === currentMonth) || bondMonth === sixMonthsFutureMonth) {
        bondMonths.push(bond)
      }
    })

    return ctx.response.json(bondMonths)
  }

  public async getCouponsThisYear(ctx: HttpContextContract) {
    const bonds: Bond[] = await sanityClient().fetch(bondCouponQuery)

    const couponsThisYearArray: object[] = []

    for (let i = 1; i <= 12; i++) {
      bonds.forEach((bond: Bond) => {
        const maturityDate = bond.maturityDate

        if (maturityDate) {
          const maturityDateMonth = parseInt(maturityDate.split('-')[1])

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

          if (
            bond.maturityDate &&
            (maturityDateMonth === compareDate.getMonth() + 1 ||
              maturityDateMonth === sixMonths.getMonth() + 1)
          ) {
            const formattedBond: Bond = {
              couponDate: bond.maturityDate.split('-')[2] + '/' + monthYear,
            }

            couponsThisYearArray[monthYear].coupons.push(formattedBond)
          }
        }
      })
    }

    const couponsThisYearObject = Object.values(couponsThisYearArray)

    return ctx.response.json(couponsThisYearObject)
  }
}
