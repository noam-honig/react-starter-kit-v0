import {
  DateOnlyField,
  Entity,
  Field,
  IdEntity,
  OneToMany,
  Remult,
  BackendMethod,
  Allow,
  ValueListFieldType,
} from "remult"
import {
  DateOnlyValueConverter,
  ValueListValueConverter,
} from "remult/valueConverters"
import { LessonLength, Student } from "../Students/Student.entity"
import { Roles } from "../Users/Roles"
import { TeacherRate, User } from "../Users/User.entity"
import {
  MonthStatisticsResult,
  StudentInLessonStatus,
} from "./StudentInLessonStatus"

@ValueListFieldType()
export class GroupType {
  static oneOnOne = new GroupType("oneOnOne", "פרטני", false)
  static band60 = new GroupType("band60", "להקה 60 דק'")
  static band90 = new GroupType("band90", "להקה 90 דק'")
  static special = new GroupType("special", "צרכים מיוחדים")
  constructor(
    public id: string,
    public caption: string,
    public isGroup = true
  ) {}
  static helper = new ValueListValueConverter(GroupType)
}

@Entity<Group>(
  "Groups",
  {
    allowApiCrud: Allow.authenticated,
    caption: "חוג",
  },
  (options, remult) =>
    (options.backendPrefilter = () => {
      if (remult.isAllowed(Roles.admin)) return {}
      return { teacher: { $id: [remult.user.id] } }
    })
)
export class Group extends IdEntity {
  @Field({ caption: "שם הקבוצה" })
  name: string = ""
  @Field({ caption: "ישוב" })
  town: string = ""
  @Field({
    caption: "להקה?",
    valueType: Boolean,
  })
  isBand: boolean = false

  @Field(
    {
      caption: "סוג קבוצה",
    },
    (x) => (x.valueType = GroupType)
  )
  groupType: GroupType = GroupType.oneOnOne
  students = new OneToMany(this.remult.repo(Student), {
    where: {
      group: this,
    },
  })

  @Field(
    {
      caption: "מורה",
    },
    (o) => (o.valueType = User)
  )
  teacher?: User
  constructor(private remult: Remult) {
    super()
  }
}

@Entity<StudentInLesson>(
  "studentsInDate",
  {
    allowApiCrud: true,
    caption: "תלמיד בשיעור",
  },
  (options, remult) =>
    (options.backendPrefilter = async () => {
      if (remult.isAllowed(Roles.admin)) return {}
      return {
        studentId: await remult
          .repo(Student)
          .find()
          .then((r) => r.map((s) => s.id)),
      }
    })
)
export class StudentInLesson extends IdEntity {
  @DateOnlyField()
  date!: Date
  @Field()
  studentId: string = ""
  @Field((o) => (o.valueType = StudentInLessonStatus))
  status: StudentInLessonStatus = StudentInLessonStatus.none
  @Field({ caption: "הערה", inputType: "area" })
  note: string = ""

  @BackendMethod({ allowed: Roles.admin })
  static async allStatistics(month: string, remult?: Remult) {
    const result: TeacherStats[] = []
    for (const teacher of await remult!.repo(User).find()) {
      const stats = await StudentInLesson.monthStatistics(
        teacher.id,
        month,
        remult
      )
      if (!teacher.removed || stats.totals.length > 0) {
        result.push({
          id: teacher.id,
          name: teacher.name,
          removed: teacher.removed,
          stats: stats.totals,
          groupStats: stats.groupStats,
          studentStats: stats.studentStats,
        })
      }
    }
    return result
  }
  @BackendMethod({ allowed: Allow.authenticated })
  static async monthStatistics(
    teacherId: string,
    month: string,
    remult?: Remult
  ) {
    const teacher = await remult!.repo(User).findId(teacherId)
    const teacherRates = await remult!
      .repo(TeacherRate)
      .find({ where: { teacherId } })
    const fromDate = DateOnlyValueConverter.fromInput!(month + "-01", "date")
    const toDate = new Date(fromDate)
    toDate.setMonth(toDate.getMonth() + 1)
    const counters = new Map<LessonLength, number>()
    const bands = new Map<GroupType, number>()
    let totalDates = 0
    const studentStats: MonthStatisticsResult[] = []
    const groupStats: GroupDates[] = []

    for (const g of await remult!
      .repo(Group)
      .find({ where: { teacher: { $id: [teacherId] } } })) {
      const gStats: GroupDates = {
        groupId: g.id,
        name: g.name,
        dates: 0,
      }
      groupStats.push(gStats)
      let dates: { [key: number]: boolean } = {}
      for (const s of await g.students.load()) {
        let stats: MonthStatisticsResult = {
          studentId: s.id,
          fullName: s.fullName,
          lessons: 0,
          canceled: 0,
          missingOk: 0,
          type:
            g.groupType === GroupType.oneOnOne
              ? s.lessonLength?.caption || ""
              : g.groupType?.caption || "",
        }
        studentStats.push(stats)
        for (const l of await remult!.repo(StudentInLesson).find({
          where: { studentId: s.id, date: { ">=": fromDate, "<": toDate } },
        })) {
          l.status.stats(stats)
          if (l.status != StudentInLessonStatus.none)
            if (!dates[l.date.valueOf()]) {
              dates[l.date.valueOf()] = true
              gStats.dates++
            }
        }
        if (!g.groupType.isGroup) {
          let total = counters.get(s.lessonLength) ?? 0
          total += stats.lessons
          counters.set(s.lessonLength, total)
        }
      }
      if (g.groupType.isGroup) {
        var x = bands.get(g.groupType) || 0
        bands.set(g.groupType, x + gStats.dates)
      }
      totalDates += gStats.dates
    }
    const totals: Totals[] = []
    for (const t of new ValueListValueConverter(LessonLength).getOptions()) {
      totals.push({
        caption: t.caption,
        count: counters.get(t) || 0,
        price: t.getPrice(teacher),
      })
    }
    for (const b of bands.keys()) {
      const val = bands.get(b)!
      if (val > 0) {
        totals.push({
          caption: b.caption,
          count: val,
          price: teacherRates.find((g) => g.groupType === b)?.price || 0,
        })
      }
    }

    if (teacher.priceTravel > 0) {
      totals.push({
        caption: "נסיעות",
        count: totalDates,
        price: teacher.priceTravel,
      })
    }
    return {
      groupStats,
      studentStats,
      totals,
    }
  }
}

export interface TeacherStats {
  id: string
  name: string
  removed: boolean
  stats: Totals[]
  studentStats: MonthStatisticsResult[]
  groupStats: GroupDates[]
}

export interface GroupDates {
  groupId: string
  dates: number
  name: string
}
export interface Totals {
  caption: string
  count: number
  price: number
}

export function studentsWithLessonsArrayFilter(
  st: MonthStatisticsResult
): unknown {
  return st.lessons || st.canceled || st.missingOk
}
