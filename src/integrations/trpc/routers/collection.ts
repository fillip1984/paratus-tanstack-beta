import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../init'

export const collectionRouter = createTRPCRouter({
  readAll: publicProcedure.query(async ({ ctx }) => {
    const collections = await ctx.db.collection.findMany({
      select: {
        id: true,
        name: true,
        // parentId: true,
        // children: {
        //   select: {
        //     id: true,
        //     name: true,
        //     parentId: true,
        //   },
        // },
        sections: {
          select: {
            id: true,
            name: true,
            position: true,
            tasks: {
              select: {
                text: true,
              },
              where: { complete: { not: true }, parentId: null },
            },
          },
        },
      },
      orderBy: {
        position: 'asc',
      },
    })
    // another idea to sum: collection.sections.map((s) => s.tasks).flat(1).length}
    return collections.map((collection) => {
      return {
        ...collection,
        taskCount: collection.sections
          .map((s) => s.tasks.length)
          .reduce((a, b) => a + b, 0),
      }
    })
  }),
  readOne: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.collection.findFirst({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          sections: {
            orderBy: {
              position: 'asc',
            },
            select: {
              id: true,
              name: true,
              position: true,
              _count: {
                select: { tasks: true },
              },
              tasks: {
                orderBy: {
                  position: 'asc',
                },
                include: {
                  children: {
                    select: {
                      complete: true,
                      id: true,
                      text: true,
                      dueDate: true,
                      priority: true,
                      sectionId: true,
                      position: true,
                      parentId: true,
                    },
                    orderBy: {
                      position: 'asc',
                    },
                  },
                },
                where: { complete: { not: true } },
              },
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      })
    }),
  inbox: publicProcedure.query(async ({ ctx }) => {
    const inbox = await ctx.db.collection.findFirst({
      where: { name: 'Inbox' },
      select: {
        id: true,
        name: true,
        sections: {
          select: {
            id: true,
            name: true,
            position: true,
            _count: {
              select: { tasks: true },
            },
            tasks: {
              select: {
                text: true,
              },
              where: { complete: { not: true }, parentId: null },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })
    return {
      ...inbox,
      taskCount: inbox?.sections
        .map((s) => s.tasks.length)
        .reduce((a, b) => a + b, 0),
    }
  }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const collectionCount = await ctx.db.collection.count()
      return await ctx.db.collection.create({
        data: {
          name: input.name,
          position: collectionCount + 1,
          sections: {
            create: [
              {
                name: 'Uncategorized',
                position: 0,
              },
            ],
          },
        },
      })
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        parentId: z.string().nullish(),
        position: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.collection.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          parentId: input.parentId,
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
      return await ctx.db.collection.delete({
        where: {
          id: input.id,
        },
      })
    }),
  reorder: publicProcedure
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
        for (const collection of input) {
          await tx.collection.update({
            where: {
              id: collection.id,
            },
            data: {
              position: collection.position,
            },
          })
        }
      })
    }),
  initializeCollections: publicProcedure.query(async ({ ctx }) => {
    const existingInbox = await ctx.db.collection.findFirst({
      where: { name: 'Inbox' },
    })

    if (!existingInbox) {
      await ctx.db.collection.create({
        data: {
          name: 'Inbox',
          position: 0,
          sections: {
            create: [
              {
                name: 'Uncategorized',
                position: 0,
              },
            ],
          },
        },
      })
    }

    return { success: true, message: 'Default collections created.' }
  }),
})
