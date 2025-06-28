import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', checkSessionIdExists)

  app.post('/', async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      mealDateTime: z.string().datetime(),
      isOnDiet: z.boolean(),
    })

    const { name, description, mealDateTime, isOnDiet } =
      createMealBodySchema.parse(request.body)

    const userId = request.user?.id

    if (!userId) {
      return reply.status(401).send({ error: 'User not authenticated.' })
    }

    await knex('meals').insert({
      id: randomUUID(),
      user_id: userId,
      name,
      description,
      meal_date_time: mealDateTime,
      is_on_diet: isOnDiet,
    })

    return reply.status(201).send()
  })

  app.get('/', async (request) => {
    const userId = request.user?.id

    if (!userId) {
      return { meals: [] } 
    }

    const meals = await knex('meals')
      .where({ user_id: userId })
      .select()
      .orderBy('meal_date_time', 'desc') 

    return { meals }
  })

  app.get('/:id', async (request, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)
    const userId = request.user?.id

    if (!userId) {
      return reply.status(401).send({ error: 'User not authenticated.' })
    }

    const meal = await knex('meals')
      .where({
        id,
        user_id: userId,
      })
      .first()

    if (!meal) {
      return reply.status(404).send({ message: 'Meal not found or does not belong to user.' })
    }

    return { meal }
  })

  app.put('/:id', async (request, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const updateMealBodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      mealDateTime: z.string().datetime().optional(),
      isOnDiet: z.boolean().optional(),
    })

    const { id } = getMealParamsSchema.parse(request.params)
    const { name, description, mealDateTime, isOnDiet } =
      updateMealBodySchema.parse(request.body)

    const userId = request.user?.id

    if (!userId) {
      return reply.status(401).send({ error: 'User not authenticated.' })
    }

    const mealToUpdate = await knex('meals')
      .where({
        id,
        user_id: userId,
      })
      .first()

    if (!mealToUpdate) {
      return reply.status(404).send({ message: 'Meal not found or does not belong to user.' })
    }

    await knex('meals')
      .where({ id, user_id: userId })
      .update({
        name,
        description,
        meal_date_time: mealDateTime,
        is_on_diet: isOnDiet,
        updated_at: knex.fn.now(),
      })

    return reply.status(204).send()
  })

  app.delete('/:id', async (request, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)
    const userId = request.user?.id

    if (!userId) {
      return reply.status(401).send({ error: 'User not authenticated.' })
    }

    const mealToDelete = await knex('meals')
      .where({
        id,
        user_id: userId,
      })
      .first()

    if (!mealToDelete) {
      return reply.status(404).send({ message: 'Meal not found or does not belong to user.' })
    }

    await knex('meals')
      .where({ id, user_id: userId })
      .delete()

    return reply.status(204).send()
  })


  app.get('/metrics', async (request, reply) => {
    const userId = request.user?.id

    if (!userId) {
      return reply.status(401).send({ error: 'User not authenticated.' })
    }

    const totalMeals = await knex('meals')
      .where({ user_id: userId })
      .count('id', { as: 'count' })
      .first()

    const totalMealsOnDiet = await knex('meals')
      .where({ user_id: userId, is_on_diet: true })
      .count('id', { as: 'count' })
      .first()

    const totalMealsOffDiet = await knex('meals')
      .where({ user_id: userId, is_on_diet: false })
      .count('id', { as: 'count' })
      .first()

    const meals = await knex('meals')
      .where({ user_id: userId })
      .orderBy('meal_date_time', 'asc') 

    let bestSequence = 0
    let currentSequence = 0

    for (const meal of meals) {
      if (meal.is_on_diet) {
        currentSequence++
      } else {
        currentSequence = 0 
      }
      if (currentSequence > bestSequence) {
        bestSequence = currentSequence
      }
    }

    return {
      totalMeals: Number(totalMeals?.count || 0),
      totalMealsOnDiet: Number(totalMealsOnDiet?.count || 0),
      totalMealsOffDiet: Number(totalMealsOffDiet?.count || 0),
      bestDietSequence: bestSequence,
    }
  })
}