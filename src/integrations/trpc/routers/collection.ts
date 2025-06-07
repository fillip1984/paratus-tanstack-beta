import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../init'

export const collectionRouter = createTRPCRouter({
  readAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.collection.findMany({
      select: {
        id: true,
        name: true,
        parentId: true,
        children: {
          select: {
            id: true,
            name: true,
            parentId: true,
          },
        },
        sections: {
          select: {
            id: true,
            name: true,
            position: true,
            tasks: {
              select: {
                text: true,
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
              tasks: {
                orderBy: {
                  position: 'asc',
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
    return await ctx.db.collection.findFirst({
      where: { name: 'Inbox' },
      select: {
        id: true,
        name: true,
        sections: {
          select: {
            id: true,
            name: true,
            position: true,
            tasks: {
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
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.collection.create({
        data: {
          name: input.name,
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
  initializeCollections: publicProcedure.query(async ({ ctx }) => {
    const existingInbox = await ctx.db.collection.findFirst({
      where: { name: 'Inbox' },
    })

    if (!existingInbox) {
      await ctx.db.collection.create({
        data: {
          name: 'Inbox',
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
