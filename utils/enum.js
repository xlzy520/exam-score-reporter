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
export const levelColumn = ['小学', '初中', '高中', '大学']
export const levelIndex = [5, 8, 11, 15]
export const levelGradeEnum = {
  小学: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
  初中: ['初一', '初二', '初三'],
  高中: ['高一', '高二', '高三'],
  大学: ['大一', '大二', '大三', '大四'],
}
export const gradeColumn = ['一年级', '二年级', '三年级', '四年级', '五年级',
  '六年级', '初一', '初二', '初三', '高一', '高二', '高三', '大一', '大二', '大三', '大四']
export const termColumn = ['上学期', '下学期']
export const gradeAndTermColumn = [{
  values: levelColumn,
  className: 'column1',
}, {
  values: levelGradeEnum['初中'],
  className: 'column2',
},
{
  values: termColumn,
  className: 'column3',
}
]

export const issueTypeEnum = {
  'req': '需求',
  'bug': 'BUG'
}
