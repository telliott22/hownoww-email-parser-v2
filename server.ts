/*
|--------------------------------------------------------------------------
| AdonisJs Server
|--------------------------------------------------------------------------
|
| The contents in this file is meant to bootstrap the AdonisJs application
| and start the HTTP server to accept incoming connections. You must avoid
| making this file dirty and instead make use of `lifecycle hooks` provided
| by AdonisJs service providers for custom code.
|
*/

import 'reflect-metadata'
import sourceMapSupport from 'source-map-support'
import { Ignitor } from '@adonisjs/core/build/standalone'
// import axios from 'axios'

sourceMapSupport.install({ handleUncaughtExceptions: false })

new Ignitor(__dirname).httpServer().start()

// const notifier = require('mail-notifier')

// const imap = {
//   user: process.env.IMAP_EMAIL,
//   password: process.env.IMAP_PASSWORD,
//   host: process.env.IMAP_HOST,
//   port: 993, // imap port
//   tls: true, // use secure connection
//   tlsOptions: {
//     rejectUnauthorized: false,
//   },
// }

// const n = notifier(imap)

// n.on('end', () => n.start()) // session closed
//   .on('mail', (mail) => {
//     const body: {
//       html: string
//       subject: string
//       from: string
//     } = {
//       html: mail.html,
//       subject: mail.subject,
//       from: mail.from[0].address,
//     }

//     const url = `${process.env.APP_URL}/post-price`

//     axios
//       .post(url, body)
//       .then(function (response) {
//         console.log(response)
//       })
//       .catch(function (error) {
//         console.log(error)
//       })
//   })
//   .start()
