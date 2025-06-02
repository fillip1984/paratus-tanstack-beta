import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../init'

export const sectionRouter = createTRPCRouter({
  // readAll: publicProcedure
  //   .input(z.object({ boardId: z.string().min(1) }))
  //   .query(async ({ ctx, input }) => {
  //     return await ctx.db.section.findMany({
  //       where: {
  //         boardId: input.boardId,
  //       },
  //       include: {
  //         tasks: {
  //           orderBy: {
  //             position: "asc",
  //           },
  //           include: {
  //             checklistItems: {
  //               orderBy: {
  //                 position: "asc",
  //               },
  //             },
  //             comments: {
  //               orderBy: {
  //                 posted: "desc",
  //               },
  //             },
  //           },
  //         },
  //       },
  //       orderBy: {
  //         position: "asc",
  //       },
  //     });
  //   }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        collectionId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sections = await ctx.db.collection.findFirst({
        where: { id: input.collectionId },
        select: {
          _count: {
            select: { sections: true },
          },
        },
      })
      return await ctx.db.section.create({
        data: {
          name: input.name,
          position: sections?._count.sections ?? 0,
          collectionId: input.collectionId,
        },
      })
    }),
  // update: publicProcedure
  //   .input(
  //     z.object({
  //       id: z.string().min(1),
  //       name: z.string().min(1),
  //       position: z.number(),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     return await ctx.db.section.update({
  //       where: {
  //         id: input.id,
  //       },
  //       data: {
  //         name: input.name,
  //         position: input.position,
  //       },
  //     });
  //   }),
  delete: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.section.delete({
        where: {
          id: input.id,
        },
      })
    }),
  // reoder: publicProcedure
  //   .input(z.array(z.object({ id: z.string().min(1), position: z.number() })))
  //   .mutation(async ({ ctx, input }) => {
  //     await ctx.db.$transaction(async (tx) => {
  //       for (const section of input) {
  //         await tx.section.update({
  //           where: {
  //             id: section.id,
  //           },
  //           data: {
  //             position: section.position,
  //           },
  //         });
  //       }
  //     });
  //   }),
})
