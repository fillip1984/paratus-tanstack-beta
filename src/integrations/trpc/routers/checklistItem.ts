import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../init'

export const checklistItemRouter = createTRPCRouter({
  // readAll: publicProcedure.query(async ({ ctx }) => {
  //   return await ctx.db.checklistitem.findMany({
  //     orderBy: {
  //       text: "asc",
  //     },
  //   });
  // }),
  create: publicProcedure
    .input(
      z.object({
        text: z.string().min(1),
        complete: z.boolean(),
        position: z.number(),
        taskId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.checklistItem.create({
        data: {
          text: input.text,
          complete: input.complete,
          position: input.position,
          taskId: input.taskId,
        },
      })
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        text: z.string().min(1),
        complete: z.boolean(),
        position: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.checklistItem.update({
        where: {
          id: input.id,
        },
        data: {
          text: input.text,
          complete: input.complete,
          position: input.position,
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
      return await ctx.db.checklistItem.delete({
        where: {
          id: input.id,
        },
      })
    }),
  reoder: publicProcedure
    .input(
      z.array(
        z.object({
          id: z.string().min(1),
          position: z.number(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.$transaction(async (tx) => {
        for (const checklistitem of input) {
          await tx.checklistItem.update({
            where: {
              id: checklistitem.id,
            },
            data: {
              position: checklistitem.position,
            },
          })
        }
      })
    }),
})
