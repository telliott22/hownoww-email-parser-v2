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

// Route.post('/post-price', 'PriceController.postPrice')

// Route.get('/prices', 'PriceController.getPrices')

// Route.get('/schedule', 'ScheduleController.getSchedule')

// Route.get('/previous-next-coupon', 'ScheduleController.getPreviousNextCoupon')
