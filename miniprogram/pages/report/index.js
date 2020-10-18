import dayjs from 'dayjs'
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast'
import { defaultSubjects, gradeColumn } from '../../utils/enum'

const api = require('../../utils/api.js')

const app = getApp()
const defaultReportData = {
  grade: '初三',
  term: '上学期',
  subjects: defaultSubjects,
  total: 0,
  score: 0,
  rate: 0,
  average: 0,
  examName: '',
  examDate: new Date().getTime(),
  examDateText: dayjs().format('YYYY-MM-DD'),
  rankClass: 0,
  rankGrade: 0,
}

Page({
  data: {
    show: false,
    columns: gradeColumn,
    grade: '初三',
    term: '上学期',
    subjects: defaultSubjects,
    total: 0,
    score: 0,
    rate: 0,
    average: 0,
    examName: '',
    examDate: new Date().getTime(),
    examDateText: dayjs().format('YYYY-MM-DD'),
    rankClass: 0,
    rankGrade: 0,

    popupType: 'subject',
    subjectErrors: [],
    subjectId: '',
    loading: false,
    loadingText: '',
    gradientColor: {
      '0%': '#3fecff',
      '100%': '#6149f6',
    },
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`
      } else if (type === 'month') {
        return `${value}月`
      }
      return value
    },
  },

  showDatePopup() {
    this.setData({ show: true, popupType: 'date' })
  },

  onClose() {
    this.setData({ show: false })
  },
  changeGrade(evt) {
    const [grade, term] = evt.detail
    this.setData({
      grade,
      term,
    }, () => {
      this.getSubject()
    })
  },
  onConfirmDate(event) {
    const value = event.detail
    this.setData({
      examDate: value,
      examDateText: dayjs(value).format('YYYY-MM-DD'),
      show: false,
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
  submit(e) {
    console.log(e)
    let hasEmpty = false
    const { examDate, examName, subjectId } = this.data
    const subjects = [...this.data.subjects]
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
    console.log(subjectId)
    const name = subjectId ? 'update' : 'add'
    const actionName = subjectId ? '更新' : '保存'
    this.setData({
      loading: true,
      loadingText: actionName,
    }, () => {
      const {
        examDateText, rankClass, rankGrade, grade, subjects, average, score, term,
      } = this.data
      const payload = {
        grade,
        subjects,
        examName,
        examDate,
        examDateText,
        rankClass,
        rankGrade,
        average,
        score,
        term,
      }
      if (subjectId) {
        payload._id = subjectId
      }
      api.wxCloudCallFunction(name, {
        collectionName: 'scores',
        ...payload,
      }).then(res => {
        Toast(actionName + '成功')
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
    api.wxCloudCallFunction('findOne', {
      collectionName: 'scores',
      _id: id,
    }).then(({ data }) => {
      app.globalData.recordId = ''
      if (data) {
        const subjects = data.subjects
        this.setData({
          subjectId: id,
          ...data,
        })
        this.computeTotalFull(subjects)
        this.computeTotalScores(subjects)
      }
    }).finally(() => {
      wx.hideLoading()
    })
  },
  getWxSetting() {
  },
  goConfig(){
    wx.navigateTo({ url: '/pages/subjectSetting/index' })
  },

  getUserInfo(e) {
    if (!app.globalData.userInfo) {
      const detail = e.detail
      api.wxCloudCallFunction('addUser', {
        collectionName: 'users',
        ...detail,
      }).then(res => {
        app.globalData.userInfo = detail.userInfo
        console.log(res);
      })
    }
  },
  reset() {
    this.setData({
      ...defaultReportData,
      subjectId: '',
      subjectErrors: [],
    }, () => {
      this.setGradeTerm()
      this.getSubject()
    })
  },
  setGradeTerm(){
    const userInfo = app.globalData.userInfo
    if (userInfo && userInfo.grade) {
      this.setData({
        grade: userInfo.grade,
        term: userInfo.term,
      })
      
    }
  },
  onLoad(e) {
    // const id = e.id || app.globalData.recordId
    // if (id) {
    //   this.getScores(id)
    // }
  },
  onShow(e) {
    const id = (e && e.id) || app.globalData.recordId || this.data.subjectId
    this.setGradeTerm()
    console.log(id)
    if (id) {
      this.getScores(id)
    } else {
      this.getSubject()
    }
  },
  onHide() {
    // this.reset()
  },
})
