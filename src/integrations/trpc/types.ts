import type { PriorityOption } from '@prisma/client'

export type CollectionDetailType = {
  id: string
  name: string
  // heading: string
  // taskCount: number
  sections?: Array<SectionDetailType>
  // sections: (SectionDetailType & { sectionNature?: SectionNatureType })[];
}

// export type SectionNatureType = 'overdue' | 'today' | 'upcoming'
export type SectionDetailType = {
  id: string
  name: string
  position: number
  tasks: Array<TaskType>
  _count: {
    tasks: number
  }
  // nature?: SectionNatureType
}
export type TaskType = {
  id: string
  text: string
  description?: string | null
  dueDate: Date | null
  priority: PriorityOption | null
  sectionId: string
  complete: boolean
  position: number
  children: Array<TaskType>

  // dueDate?: Date | null;
  // completedAt?: Date | null;
  // checkcollectionItems: CheckcollectionItemType[];
  // comments: CommentType[];
}
// type structures should be categories as summary or detail
// summary types are used to present cards and links and have bare amount of info
// detail types are full records from database

// export type CollectionSummaryType =
//   RouterOutputs["collection"]["readAll"][number];
// export type CollectionDetailType = RouterOutputs["collection"]["readOne"] & {
//   heading: string;
//   taskCount: number;
// };

// export type SectionDetailType = Extract<
//   CollectionDetailType,
//   { sections: unknown }
// >["sections"][number];

// export type CollectionSectionType = {
//   id: string;
//   heading: string;
//   tasks: TaskType[];
// };

// export type BoardSummaryType = RouterOutputs["board"]["readAll"][number];
// export type BucketType = RouterOutputs["bucket"]["readAll"][number];
// export type CollectionSummaryType =
//   RouterOutputs["collection"]["readAll"][number];
// export type CollectionDetailType = RouterOutputs["collection"]["readOne"];
// export type SectionType = Extract<
//   CollectionDetailType,
//   { sections: unknown }
// >["sections"][number];
// export type TaskType = Extract<
//   SectionType,
//   { tasks: unknown }
// >["tasks"][number];
// export type CheckcollectionItemType = Extract<
//   TaskType,
//   { checkcollectionItems: unknown }
// >["checkcollectionItems"][number];
// export type CommentType = Extract<
//   TaskType,
//   { comments: unknown }
// >["comments"][number];
