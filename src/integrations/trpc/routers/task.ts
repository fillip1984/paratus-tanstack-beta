import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../init'

export const taskRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().nullish(),
        position: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.task.create({
        data: {
          name: input.name,
          description: input.description,

          // position: input.position,
        },
      })

      return result
    }),
  readAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.task.findMany({})
  }),

  // readOne: protectedProcedure
  //   .input(
  //     z.object({
  //       taskId: z.string(),
  //     }),
  //   )
  //   .query(async ({ ctx, input }) => {
  //     const result = await ctx.prisma.task.findUnique({
  //       where: {
  //         id: input.taskId,
  //       },
  //       include: {
  //         checkListItems: true,
  //         tags: {
  //           include: {
  //             tag: true,
  //           },
  //         },
  //         comments: true,
  //         attachments: {
  //           include: {
  //             link: true,
  //           },
  //         },
  //         bucket: {
  //           select: {
  //             name: true,
  //             id: true,
  //           },
  //         },
  //       },
  //     })

  //     return result
  //   }),
  // update: protectedProcedure
  //   .input(taskFormSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     const freshAttachments = await ctx.prisma.attachment.findMany({
  //       where: { taskId: input.id },
  //     })
  //     const freshAttachmentIds = freshAttachments.map((a) => a.id)
  //     const currentAttachmentIds = input.attachments.map(
  //       (a) => a.id,
  //     ) as Array<string>
  //     const attachmentDeletes = freshAttachmentIds.filter(
  //       (a) => !currentAttachmentIds.includes(a),
  //     )
  //     await ctx.prisma.attachment.deleteMany({
  //       where: {
  //         id: {
  //           in: attachmentDeletes,
  //         },
  //       },
  //     })
  //     const attachmentAdds = currentAttachmentIds.filter(
  //       (a) => !freshAttachmentIds.includes(a),
  //     )
  //     for (const attachmentId of attachmentAdds) {
  //       const attachment = input.attachments.find((a) => a.id === attachmentId)
  //       if (!attachment) {
  //         throw new Error('Unable to find attachment by id: ' + attachmentId)
  //       }

  //       const link = await ctx.prisma.s3StoredObject.create({
  //         data: {
  //           url: attachment.link.url,
  //           bucketName: attachment.link.bucketName,
  //           key: attachment.link.key,
  //           userId: ctx.session.user.id,
  //         },
  //       })

  //       await ctx.prisma.attachment.create({
  //         data: {
  //           text: attachment.text,
  //           added: attachment.added,
  //           taskId: input.id,
  //           linkId: link.id,
  //           userId: ctx.session.user.id,
  //         },
  //       })
  //     }

  //     const freshTaskTagList = await ctx.prisma.taskTags.findMany({
  //       where: { taskId: input.id },
  //     })
  //     const freshTagIds = freshTaskTagList.map((t) => t.tagId)
  //     const currentTagIds = input.taskTag.map((t) => t.tag.id) as Array<string>
  //     const tagDeletes = freshTagIds.filter((t) => !currentTagIds.includes(t))
  //     await ctx.prisma.taskTags.deleteMany({
  //       where: {
  //         tagId: {
  //           in: tagDeletes,
  //         },
  //       },
  //     })
  //     const tagAdds = currentTagIds.filter((t) => !freshTagIds.includes(t))
  //     for (const tagId of tagAdds) {
  //       await ctx.prisma.taskTags.create({
  //         data: {
  //           tagId,
  //           taskId: input.id,
  //         },
  //       })
  //     }

  //     const freshComments = await ctx.prisma.comment.findMany({
  //       where: { taskId: input.id },
  //     })
  //     const freshCommentIds = freshComments.map((c) => c.id)
  //     const currentCommentIds = input.comments.map((c) => c.id) as Array<string>
  //     const commentDeletes = freshCommentIds.filter(
  //       (c) => !currentCommentIds.includes(c),
  //     )
  //     await ctx.prisma.comment.deleteMany({
  //       where: {
  //         id: {
  //           in: commentDeletes,
  //         },
  //       },
  //     })
  //     const commentAdds = currentCommentIds.filter(
  //       (c) => !freshCommentIds.includes(c),
  //     )
  //     for (const commentAdd of commentAdds) {
  //       const comment = input.comments.find((c) => c.id === commentAdd)
  //       if (!comment) {
  //         throw new Error('Unable to find comment by id: ' + commentAdd)
  //       }
  //       await ctx.prisma.comment.create({
  //         data: {
  //           text: comment.text,
  //           posted: comment.posted,
  //           taskId: input.id,
  //           userId: ctx.session.user.id,
  //         },
  //       })
  //     }

  //     // shoddy solution but this works to maintain checklist items...should be separated out
  //     const freshChecklist = await ctx.prisma.checkListItem.findMany({
  //       where: { taskId: input.id },
  //     })
  //     const freshIds = freshChecklist.map((i) => i.id)
  //     const currentIds = input.checklistItems.map((i) => i.id)
  //     const deletes = freshIds.filter((i) => !currentIds.includes(i))
  //     await ctx.prisma.checkListItem.deleteMany({
  //       where: {
  //         id: {
  //           in: deletes,
  //         },
  //       },
  //     })
  //     for (const item of input.checklistItems) {
  //       await ctx.prisma.checkListItem.upsert({
  //         where: {
  //           id: item.id ?? '',
  //         },
  //         update: {
  //           text: item.text,
  //           complete: item.complete,
  //         },
  //         create: {
  //           text: item.text,
  //           complete: item.complete,
  //           taskId: input.id,
  //           userId: ctx.session.user.id,
  //         },
  //       })
  //     }

  //     // date time adjustments
  //     if (input.startDate) {
  //       input.startDate = zonedTimeToUtc(input.startDate, 'America/New_York')
  //     } else {
  //       input.startDate = null
  //     }

  //     if (input.dueDate) {
  //       input.dueDate = zonedTimeToUtc(input.dueDate, 'America/New_York')
  //     } else {
  //       input.dueDate = null
  //     }

  //     // TODO: stop hard coding timezone
  //     if (input.startDate || input.dueDate) {
  //       console.warn(
  //         "adjusted to hardcoded timezone! America/New_York, should pull from user's location or preferences",
  //         input.startDate,
  //         input.dueDate,
  //       )
  //     }

  //     let bucketId = input.bucketId

  //     if (input.complete) {
  //       const completeBucket = await ctx.prisma.bucket.findFirst({
  //         where: {
  //           boardId: input.boardId,
  //           userId: ctx.session.user.id,
  //           OR: [
  //             {
  //               name: {
  //                 equals: 'Complete',
  //                 mode: 'insensitive',
  //               },
  //             },
  //             {
  //               name: {
  //                 equals: 'Done',
  //                 mode: 'insensitive',
  //               },
  //             },
  //           ],
  //         },
  //         select: {
  //           id: true,
  //         },
  //       })

  //       if (completeBucket) {
  //         bucketId = completeBucket.id
  //       }
  //     }

  //     const result = ctx.prisma.task.update({
  //       where: {
  //         id: input.id,
  //       },
  //       data: {
  //         text: input.text,
  //         description: input.description,
  //         complete: input.complete,
  //         bucketId,
  //         // status: input.status,
  //         priority: input.priority,
  //         startDate: input.startDate,
  //         dueDate: input.dueDate,
  //       },
  //     })

  //     return result
  //   }),
  // updatePositions: protectedProcedure
  //   .input(z.object({ tasks: z.array(taskPositionUpdate) }))
  //   .mutation(async ({ ctx, input }) => {
  //     const result = await ctx.prisma.$transaction(async (tx) => {
  //       for (const task of input.tasks) {
  //         await tx.task.update({
  //           where: {
  //             id: task.id,
  //           },
  //           data: {
  //             position: task.position,
  //             bucketId: task.bucketId,
  //           },
  //         })
  //       }
  //     })

  //     return result
  //   }),
  // delete: protectedProcedure
  //   .input(
  //     z.object({
  //       taskId: z.string(),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const result = await ctx.prisma.task.delete({
  //       where: {
  //         id: input.taskId,
  //       },
  //     })

  //     return result
  //   }),
})
