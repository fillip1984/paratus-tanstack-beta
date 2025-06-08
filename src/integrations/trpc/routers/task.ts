import { PriorityOption } from '@prisma/client'
import { z } from 'zod'
import { endOfDay, startOfDay } from 'date-fns'
import { createTRPCRouter, publicProcedure } from '../init'

export const taskRouter = createTRPCRouter({
  today: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.task.findMany({
      where: {
        dueDate: {
          gte: startOfDay(new Date()),
          lt: endOfDay(new Date()), // up to end of today
        },
      },
      orderBy: {
        text: 'asc',
      },
    })
  }),
  upcoming: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.task.findMany({
      orderBy: {
        text: 'asc',
      },
    })
  }),
  // readOne: publicProcedure
  //   .input(z.object({ id: z.string().min(1) }))
  //   .query(async ({ ctx, input }) => {
  //     return await ctx.db.task.findFirst({
  //       where: {
  //         id: input.id,
  //       },
  //       include: {
  //         checklistItems: {
  //           orderBy: {
  //             position: "asc",
  //           },
  //         },
  //         comments: {
  //           orderBy: {
  //             posted: "desc",
  //           },
  //         },
  //       },
  //     });
  //   }),
  create: publicProcedure
    .input(
      z.object({
        text: z.string().min(1),
        description: z.string().nullish(),
        dueDate: z.date().nullish(),
        priority: z.nativeEnum(PriorityOption).nullish(),
        sectionId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const section = await ctx.db.section.findFirst({
        where: { id: input.sectionId },
        include: {
          _count: {
            select: { tasks: true },
          },
        },
      })
      return await ctx.db.task.create({
        data: {
          text: input.text,
          description: input.description,
          dueDate: input.dueDate,
          priority: input.priority,
          sectionId: input.sectionId,
          position: section?._count.tasks ?? 0,
        },
      })
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        text: z.string().min(1),
        description: z.string().nullish(),
        complete: z.boolean(),
        position: z.number(),
        dueDate: z.date().nullish(),
        priority: z.nativeEnum(PriorityOption).nullish(),
        sectionId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.task.update({
        where: {
          id: input.id,
        },
        data: {
          text: input.text,
          description: input.description,
          complete: input.complete,
          position: input.position,
          dueDate: input.dueDate,
          priority: input.priority,
          sectionId: input.sectionId,
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
      return await ctx.db.task.delete({
        where: {
          id: input.id,
        },
      })
    }),
  // reoder: publicProcedure
  //   .input(
  //     z.array(
  //       z.object({
  //         id: z.string().min(1),
  //         position: z.number(),
  //         sectionId: z.string(),
  //       }),
  //     ),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     await ctx.db.$transaction(async (tx) => {
  //       for (const task of input) {
  //         await tx.task.update({
  //           where: {
  //             id: task.id,
  //           },
  //           data: {
  //             position: task.position,
  //             sectionId: task.sectionId,
  //           },
  //         });
  //       }
  //     });
  //   }),
})
