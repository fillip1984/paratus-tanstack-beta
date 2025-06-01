import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../init'

export const commentRouter = createTRPCRouter({
  // readAll: publicProcedure.query(async ({ ctx }) => {
  //   return await ctx.db.comment.findMany({
  //     orderBy: {
  //       text: "asc",
  //     },
  //   });
  // }),
  create: publicProcedure
    .input(
      z.object({
        text: z.string().min(1),
        posted: z.date(),
        taskId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.comment.create({
        data: {
          text: input.text,
          posted: input.posted,
          taskId: input.taskId,
        },
      })
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        text: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.comment.update({
        where: {
          id: input.id,
        },
        data: {
          text: input.text,
        },
      })
    }),
  delete: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.comment.delete({
        where: {
          id: input.id,
        },
      })
    }),
})
