// logs.js
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
  },

  showPopup() {
    this.setData({ show: true, popupType: 'picker' })
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
  showNewSubjectPopup() {
    this.setData({ show: true, popupType: 'subject' })
  },
  addNewSubject() {
    const subjectName = this.data.subjectName
    if (!subjectName) {
      Toast('科目名称不能为空')
      return
    }
    const _subjects = [...this.data.subjects]
    _subjects.push(
      { name: subjectName, full: '' }
    )
    this.setData({ show: false, subjects: _subjects })
  },
  deleteSubject(evt) {
    const index = evt.target.dataset.index
    const _subjects = [...this.data.subjects]
    _subjects.splice(index, 1)
    this.setData({ subjects: _subjects })
  },
  changeSubjectFullScore(evt) {
    const value = evt.detail
    const index = evt.target.dataset.index
    const _subjects = [...this.data.subjects]
    _subjects[index].full = value
    this.setData({ subjects: _subjects, subjectErrors: [] })
  },
  submit() {
    const subjects = [...this.data.subjects]
    let hasEmpty = false
    const subjectErrors = subjects.map(v => {
      if (!v.full || !v.full > 0) {
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
      api.wxCloudCallFunction(name, {
        collectionName: 'gradeSubject',
        grade: this.data.grade,
        subjects: this.data.subjects,
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
  getSubject() {
    wx.showLoading({
      title: '加载中',
    })
    api.wxCloudCallFunction('findAll', {
      collectionName: 'gradeSubject',
      grade: this.data.grade,
    }).then(({ data }) => {
      if (data && data.length) {
        this.setData({
          subjects: data && data[0].subjects,
          subjectId: data[0]._id,
        })
      } else {
        Toast('未查询到相关信息，使用默认课程信息')
        this.setData({
          subjects: defaultSubjects,
          subjectId: '',
        })
      }
    }).finally(() => {
      wx.hideLoading()
    })
  },
  onLoad() {
    this.getSubject()
  },
})
