import { Fragment, FormEvent, useEffect, useState } from "react";
//import { testExcelData, testStats } from "../../db2/testExcelData";
import { TeacherStats } from "../Courses/Group.entity";
import { MonthStatisticsResult } from "../Courses/StudentInLessonStatus";
import { StyledTable } from "./SummaryView";
import { SelectDialog } from "../Utils/SelectDialog";

export default function CompareMarvelX() {
  const [teacherStats, setTeacherStats] = useState<myTeacherStats[]>([]);

  async function load(event: FormEvent<HTMLInputElement>) {
    if (event.currentTarget.files)
      for (const file of event.currentTarget.files) {
        let f: File = file;
        await new Promise((res) => {
          var fileReader = new FileReader();

          fileReader.onload = async (e: any) => {
            // pre-process data
            var binary = "";
            var bytes = new Uint8Array(e.target.result);
            var length = bytes.byteLength;
            for (var i = 0; i < length; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const xlsx = await import("xlsx");
            // call 'xlsx' to read the file
            var oFile = xlsx.read(binary, {
              type: "binary",
              cellDates: true,
              cellStyles: true,
            });
            let sheets = oFile.SheetNames;
            var dataArray = xlsx.utils.sheet_to_json(oFile.Sheets[sheets[0]], {
              header: 1,
            });
            console.table(dataArray);
          };
          fileReader.readAsArrayBuffer(f);
        });
        return; //to import the first file only
      }
  }

  useEffect(() => {
    const marvelXData = JSON.parse(JSON.stringify([]));
    const teacherStats: myTeacherStats[] = JSON.parse(
      JSON.stringify([])
    );
    //console.clear()
    let data = [...marvelXData];
    data.splice(0, 2);
    // console.table(marvelXData)
    const marvelLines = data.map((marvelLine) => {
      let studentName = marvelLine[0] as string;
      let item = marvelLine[1] as string;
      let minusIndex = item.indexOf("-");
      let teacherName = item.substring(0, minusIndex).trim();
      let courseName = item.substring(minusIndex + 1).trim();
      let amount = marvelLine[2];
      return { studentName, teacherName, courseName, amount } as MarvelLine;
    });
    for (const teacher of teacherStats) {
      for (const st of teacher.studentStats) {
        st.fullName = st.fullName.replaceAll("  ", " ").trim();
      }
    }
    for (const m of marvelLines) {
      m.studentName = m.studentName.replaceAll("  ", " ").trim();
    }
    for (const m of marvelLines) {
      let teacher: myTeacherStats | undefined = teacherStats.find(
        (x) => x.name === m.teacherName
      );
      if (!teacher) {
        teacherStats.splice(
          0,
          0,
          (teacher = {
            groupStats: [],
            id: teacherStats.length.toString(),
            name: m.teacherName,
            removed: false,
            stats: [],
            studentStats: [],
            missing: true,
          })
        );
      }
      let student = teacher.studentStats.find(
        (x) => x.fullName == m.studentName
      );
      if (!student) {
        teacher.studentStats.splice(
          0,
          0,
          (student = {
            fullName: m.studentName,
            lessons: 0,
            canceled: 0,
            missingOk: 0,
            studentId: teacher.studentStats.length.toString(),
            missing: true,
            marvel: [],
          })
        );
      }
      if (!student.marvel) {
        student.marvel = [];
      }
      student.marvel.push(m);
    }

    setTeacherStats(teacherStats);
  }, []);

  return (
    <>
      <StyledTable>
        <thead>
          <tr>
            <th>שם</th>
            <th>מרבל</th>
            <th>הכנסות</th>
            <th>הוצאות</th>
            <th>שיעורים</th>
            <th>חיסורים</th>
            <th>ביטולים</th>
          </tr>
        </thead>
        <tbody>
          {teacherStats
            .filter((s) => s.studentStats.find(studentsWithLessons))
            .map((s) => (
              <Fragment key={s.id}>
                <tr>
                  <th
                    style={{ color: s.missing ? "red" : undefined }}
                    onClick={() => {
                      if (s.missing)
                        SelectDialog({
                          title: "חפש את " + s.name,
                          find: async (search) =>
                            teacherStats.filter(
                              (t) => t.name.includes(search) && !t.missing
                            ),
                          select: (selected) => {
                            for (const student of s.studentStats) {
                              let found = selected.studentStats.find(
                                (x) => x.fullName == student.fullName
                              );
                              if (found) {
                                found.marvel = [
                                  ...(student.marvel || []),
                                  ...(found.marvel || []),
                                ];
                              } else {
                                selected.studentStats.splice(0, 0, student);
                              }
                            }
                            setTeacherStats((x) => x.filter((t) => t !== s));
                          },
                          getCaption: (x: myTeacherStats) => x.name,
                        });
                    }}
                  >
                    {s.name}
                  </th>
                  <th>
                    {s.studentStats.reduce(
                      (total, s) => total + (s.marvel?.length || 0),
                      0
                    )}
                  </th>
                  <th>
                    {s.studentStats.reduce(
                      (total, s) =>
                        total +
                        (s.marvel?.reduce((total, m) => total + m.amount, 0) ||
                          0),
                      0
                    ) || ""}
                  </th>
                  <th>
                    {s.stats.reduce(
                      (total, st) => total + st.price * st.count,
                      0
                    )}
                  </th>
                  <th>
                    {s.studentStats.reduce(
                      (total, s) => total + (s.lessons || 0),
                      0
                    ) || ""}
                  </th>
                  <th>
                    {s.studentStats.reduce(
                      (total, s) => total + (s.canceled || 0),
                      0
                    ) || ""}
                  </th>
                  <th>
                    {s.studentStats.reduce(
                      (total, s) => total + (s.missingOk || 0),
                      0
                    ) || ""}
                  </th>
                </tr>

                {s.studentStats.filter(studentsWithLessons).map((st) => (
                  <tr key={st.studentId}>
                    <td
                      style={{ color: st.missing ? "red" : undefined }}
                      onClick={() => {
                        if (st.missing)
                          SelectDialog({
                            title: "חפש את " + st.fullName,
                            find: async (search) =>
                              s.studentStats.filter(
                                (t) => t.fullName.includes(search) && !t.missing
                              ),
                            select: (selected) => {
                              st.marvel = [
                                ...(st.marvel || []),
                                ...(selected.marvel || []),
                              ];
                              s.studentStats = s.studentStats.filter(
                                (x) => x !== st
                              );

                              setTeacherStats((x) => [...x]);
                            },
                            getCaption: (x: myMonthStatisticsResult) =>
                              x.fullName + " (" + x.lessons + ")",
                          });
                      }}
                    >
                      {st.fullName}
                    </td>
                    <td>{st.marvel?.length}</td>
                    <td>
                      {st.marvel?.reduce((total, m) => total + m.amount, 0) ||
                        ""}
                    </td>
                    <td></td>
                    <td>{st.lessons || ""}</td>
                    <td>{st.canceled || ""}</td>
                    <td>{st.missingOk || ""}</td>
                  </tr>
                ))}
              </Fragment>
            ))}
        </tbody>
      </StyledTable>
      <input type="file" onInput={load} />
    </>
  );

  function studentsWithLessons(st: myMonthStatisticsResult): unknown {
    return st.marvel || st.lessons || st.canceled || st.missingOk;
  }
}
type MarvelLine = {
  studentName: string;
  teacherName: string;
  courseName: string;
  amount: number;
};

interface myTeacherStats extends TeacherStats {
  studentStats: myMonthStatisticsResult[];
  missing?: boolean;
}

interface myMonthStatisticsResult extends MonthStatisticsResult {
  marvel?: MarvelLine[];
  missing?: boolean;
}
