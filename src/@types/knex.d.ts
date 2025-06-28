import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      email: string
      age: number
      weight_kg: number
      height_cm: number
      created_at: string
      session_id?: string
    }
  }
}