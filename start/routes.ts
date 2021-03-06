/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.get('prices', 'PricesController.getPrices')

Route.get('/price', 'PricesController.getPrice')

Route.post('/post-price', 'PricesController.postPrice')

Route.get('/schedule', 'SchedulesController.getSchedule')

Route.get('/previous-next-coupon', 'SchedulesController.getPreviousNextCoupon')

Route.get('/coupons-month', 'CouponsController.getCouponsByMonth')

Route.get('/coupons-this-year', 'CouponsController.getCouponsThisYear')

Route.get('/cash-calculator', 'CouponsController.getCashCalculator')

Route.post('/index-records', 'AlgoliaController.indexRecords')
