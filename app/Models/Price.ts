import { DateTime } from 'luxon'
import { BaseModel, computed, column } from '@ioc:Adonis/Lucid/Orm'

export default class Price extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public title: string

  @column()
  public bid_price: string

  @column()
  public ask_price: string

  @column()
  public bid_percentage: string

  @column()
  public ask_percentage: string

  @column()
  public change: string

  @column()
  public eod: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed()
  public get yield(): string {
    return ((parseFloat(this.bid_percentage) + parseFloat(this.ask_percentage)) / 2).toFixed(2)
  }

  @computed()
  public get slug(): string {
    return this.title.toLowerCase().replace(/ /g, '-')
  }

  @computed()
  public get formattedDate(): string {
    return this.createdAt.toLocaleString()
  }

  @computed()
  public get day(): string {
    return this.formattedDate.split('/')[0]
  }
}
