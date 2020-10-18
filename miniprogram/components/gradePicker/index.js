import { gradeAndTermColumn } from '../../utils/enum'

const app = getApp()

Component({
  options: {
    styleIsolation: 'apply-shared',
  },
  properties: {
    icon: {
      type: String,
      value: '',
    },
    title: {
      type: String,
      value: '',
    },
    grade: {
      type: String,
      value: '初三',
    },
    term: {
      type: String,
      value: '上学期',
    },
  },
  data: {
    show: false,
    columns: gradeAndTermColumn,
    currentGrade: '初三(上学期)',
  },
  attached() {
    this.setCurrentGrade()
  },
  observers: {
    'grade, term': function (numberA, numberB) {
      // 在 numberA 或者 numberB 被设置时，执行这个函数
      this.setCurrentGrade()
    },
  },
  methods: {
    showPopup() {
      this.setData({ show: true })
    },

    onClose() {
      this.setData({ show: false })
    },
    setCurrentGrade() {
      this.setData({
        currentGrade: this.properties.grade + `(${this.properties.term})`,
      })
    },
    onConfirm(event) {
      const { value } = event.detail
      this.triggerEvent('change', value)
      this.setCurrentGrade()
      this.setData({
        show: false,
      })
    },
  },
})
