import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  Divider,
  IconButton,
  Paper,
  Slide,
  Stack,
  styled,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material"
import { TransitionProps } from "@mui/material/transitions"
import React from "react"
import { Fragment, useState } from "react"
import { DateOnlyValueConverter } from "remult/valueConverters"
import { useRemult } from "../common"
import {
  Group,
  StudentInLesson,
  studentsWithLessonsArrayFilter,
} from "../Courses/Group.entity"
import { User } from "../Users/User.entity"
import { useEntityQuery } from "../Utils/useEntityQuery"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { StyledTable, SummaryView } from "./SummaryView"

export function AllSummaryView() {
  const [month, setMonth] = useState(() =>
    DateOnlyValueConverter.toInput!(new Date(), "date").substring(0, 7)
  )
  return (
    <Box sx={{ position: "relative" }}>
      <Toolbar variant="dense">
        <TextField
          type="month"
          inputProps={{ style: { textAlign: "right" } }}
          sx={{ m: 2 }}
          label="חודש"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </Toolbar>
      <Divider />
      <Info month={month} />
    </Box>
  )
}
function Info({ month }: { month: string }) {
  const remult = useRemult()
  const teachersStats = useEntityQuery(
    () => StudentInLesson.allStatistics(month),
    [month]
  )
  const [zoomTeacher, setZoomTeacher] = useState<User>()
  const titles: string[] = []
  if (teachersStats.data)
    for (const t of teachersStats.data) {
      let prev: string = undefined!
      for (const stat of t.stats) {
        if (!titles.includes(stat.caption)) {
          titles.splice(titles.indexOf(prev) + 1, 0, stat.caption)
        }
        prev = stat.caption
      }
    }

  if (teachersStats.loading || !teachersStats.data)
    return (
      <Stack alignItems="center" spacing={2}>
        <CircularProgress color="primary" />
      </Stack>
    )
  async function exportToExcel() {
    const totals: any = { חודש: month }
    const lines = []
    for (const teacher of teachersStats.data!) {
      let teacherTotal = teacher.stats.reduce(
        (total, s) => total + s.count * s.price,
        0
      )
      let addTeacher = teacherTotal != 0
      for (const students of teacher.studentStats.filter(
        studentsWithLessonsArrayFilter
      )) {
        lines.push({
          תלמיד: students.fullName,
          מדריך: teacher.name,
          שעור: students.type,
          שעורים: students.lessons,
        })
        addTeacher = true
      }

      if (addTeacher) {
        totals[teacher.name] = teacherTotal
      }
    }
    lines.sort(
      (a, b) =>
        a.מדריך.localeCompare(b.מדריך) ||
        a.שעור.localeCompare(b.שעור) ||
        a.תלמיד.localeCompare(b.תלמיד)
    )
    const XLSX = await import("xlsx")
    let wb = XLSX.utils.book_new()
    wb.Workbook = { Views: [{ RTL: true }] }
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([totals], {}),
      "מרצים"
    )
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(lines, {}),
      "שורות"
    )
    XLSX.writeFile(wb, "נוכחות " + month + ".xlsx")
  }
  return (
    <Typography variant="body1" component="div">
      <Paper sx={{ p: 1, m: 1 }}>
        <div style={{ display: "flex", flexDirection: "row", gap: "24px" }}>
          <Typography variant="h6">סה"כ</Typography>
          <Button variant="contained" onClick={exportToExcel}>
            Excel
          </Button>
        </div>
        <StyledTable>
          <thead>
            <tr>
              <th></th>
              <th>סה"כ</th>
              {titles.map((t) => (
                <th key={t}>{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teachersStats
              .data!.filter((x) => x.stats.find((y) => y.count > 0))
              .map((t) => (
                <tr
                  key={t.id}
                  onClick={() =>
                    remult.repo(User).findId(t.id).then(setZoomTeacher)
                  }
                >
                  <td>{t.name}</td>
                  <th>{t.stats.reduce((x, t) => x + t.price * t.count, 0)}</th>
                  {titles.map((total) => (
                    <td key={total}>
                      {t.stats.find((s) => s.caption === total)?.count}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </StyledTable>
      </Paper>
      <SummaryView
        teacher={zoomTeacher!}
        open={!!zoomTeacher}
        onClose={() => setZoomTeacher(undefined)}
        inMonth={month}
      />
    </Typography>
  )
}
