import 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      name: string;
      email: string;
      age: number;
      weight_kg: number;
      height_cm: number;
      created_at: string;
      session_id?: string;
    };
  }
}