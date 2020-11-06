export const defaultSubjects = [{
  name: '语文',
  full: 150,
}, {
  name: '数学',
  full: 150,
}, {
  name: '英语',
  full: 150,
}]
export const gradeColumn = ['初一', '初二', '初三', '高一', '高二', '高三', '大一', '大二', '大三', '大四']
export const termColumn = ['上学期', '下学期']
export const gradeAndTermColumn = [{
  values: gradeColumn,
  className: 'column1',
  defaultIndex: 2,
}, {
  values: termColumn,
  className: 'column2',
}]
