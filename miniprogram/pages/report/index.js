import dayjs from 'dayjs'
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast'
import { defaultSubjects, gradeColumn } from '../../utils/enum'

const api = require('../../utils/api.js')

Page({
  data: {
    show: false,
    columns: gradeColumn,
    grade: '初三',
    popupType: 'subject',
    subjects: defaultSubjects,
    subjectErrors: [],
    subjectName: '',
    subjectId: '',
    loading: false,
    loadingText: '',
    total: 0,
    score: 0,
    rate: 0,
    average: 0,
    gradientColor: {
      '0%': '#3fecff',
      '100%': '#6149f6',
    },
    examName: '',
    examDate: new Date().getTime(),
    examDateText: dayjs().format('YYYY-MM-DD'),
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`
      } else if (type === 'month') {
        return `${value}月`
      }
      return value
    },
    rankClass: 0,
    rankGrade: 0,
  },

  showPopup() {
    this.setData({ show: true, popupType: 'picker' })
  },
  showDatePopup() {
    this.setData({ show: true, popupType: 'date' })
  },

  onClose() {
    this.setData({ show: false })
  },
  onConfirm(event) {
    const { picker, value, index } = event.detail
    this.setData({
      grade: value,
      show: false,
    }, () => {
      this.getSubject()
    })
  },
  onConfirmDate(event) {
    console.log(event)
    const value = event.detail
    this.setData({
      examDate: value,
      examDateText: dayjs(value).format('YYYY-MM-DD'),
      show: false,
    }, () => {
      this.getSubject()
    })
  },
  onInputDate(event) {
    this.setData({
      examDate: event.detail,
    })
  },
  changeSubjectFullScore(evt) {
    const value = evt.detail
    const index = evt.target.dataset.index
    const _subjects = [...this.data.subjects]
    const full = _subjects[index].full
    if (value > parseInt(full)) {
      Toast('不能超过满分')
    } else {
      _subjects[index].value = value
    }
    this.setData({ subjects: _subjects, subjectErrors: [] })
    this.computeTotalScores(_subjects)
  },
  submit() {
    const subjects = [...this.data.subjects]
    let hasEmpty = false
    const { examDate, examName } = this.data
    if (!examName) {
      hasEmpty = true
      Toast('请输入考试名称')
      return
    }
    if (!examDate) {
      hasEmpty = true
      Toast('请输入考试日期')
      return
    }
    const subjectErrors = subjects.map(v => {
      if (!v.value || !v.value > 0) {
        hasEmpty = true
        return true
      }
      return false
    })
    if (hasEmpty) {
      this.setData({ subjectErrors })
      Toast('存在不合法的输入')
      return
    }
    const name = this.data.subjectId ? 'update' : 'add'
    const actionName = this.data.subjectId ? '更新' : '保存'
    this.setData({
      loading: true,
      loadingText: actionName,
    }, () => {
      const { examDateText, rankClass, rankGrade, grade, subjects, average, score } = this.data
      api.wxCloudCallFunction(name, {
        collectionName: 'scores',
        grade,
        subjects,
        name: examName,
        date: examDateText,
        rankClass,
        rankGrade,
        average,
        score
      }).then(res => {
        Toast(actionName + '成功')
        this.setData({
          subjectId: res._id,
        })
        console.log(res)
      }).finally(() => {
        this.setData({
          loading: false,
        })
      })
    })
  },
  computeTotalFull(subjects) {
    const total = subjects.reduce((pre, cur) => Number(cur.full) + pre, 0)
    this.setData({
      total,
    })
  },
  computeTotalScores(subjects) {
    const score = subjects.reduce((pre, cur) => {
      if (cur.value) {
        return Number(cur.value) + pre
      }
      return pre
    }, 0)
    this.setData({
      score,
      rate: ((score / this.data.total).toFixed(2)) * 100,
      average: (score / subjects.length).toFixed(2),
    })
  },
  getSubject() {
    wx.showLoading({
      title: '加载中',
    })
    api.wxCloudCallFunction('findAll', {
      collectionName: 'gradeSubject',
      grade: this.data.grade,
    }).then(({ data }) => {
      if (data && data.length) {
        const subjects = data[0].subjects
        this.setData({
          subjects,
        })
        this.computeTotalFull(subjects)
      } else {
        Toast('未查询到相关信息，使用默认课程信息')
        this.setData({
          subjects: defaultSubjects,
          subjectId: '',
        })
        this.computeTotalFull(defaultSubjects)
      }
    }).finally(() => {
      wx.hideLoading()
    })
  },
  getScores(id) {
    wx.showLoading({
      title: '加载中',
    })
    api.wxCloudCallFunction('findAll', {
      collectionName: 'scores',
      _id: id,
    }).then(({ data }) => {
      if (data && data.length) {
        const subjects = data[0].subjects
        this.setData({
          subjects,
          subjectId: id,
        })
        this.computeTotalFull(subjects)
      }
    }).finally(() => {
      wx.hideLoading()
    })
  },
  onLoad(e) {
    const id = e.id
    this.getSubject()
    if (id) {
      this.getScores(id)
    }
  },
})
