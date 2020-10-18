const api = require('../../utils/api.js')

const app = getApp()

Page({
  data: {
    grade: '初三',
    term: '上学期',
    show: false,
  },
  onLoad() {
  

  },
  onShow() {

  },
  onClose() {
    this.setData({
      show: false,
    })
  },
  getUserInfo(event) {
    if (!app.globalData.userInfo) {
      const detail = event.detail
      detail.userInfo.grade = this.data.grade
      detail.userInfo.term = this.data.term
      api.wxCloudCallFunction('addUser', {
        collectionName: 'users',
        ...detail,
      }).then(res => {
        app.globalData.userInfo = detail.userInfo
        this.saveCurrentGrade()
        console.log(res)
      })
    }
    console.log(event.detail)
  },
  changeGrade(evt) {
    const [grade, term] = evt.detail
    this.setData({
      grade,
      term,
    }, () => {
      if (!app.globalData.userInfo) {
        this.setData({
          show: true,
        })
      } else {
        this.saveCurrentGrade()
      }
    })
  },
  
  saveCurrentGrade() {
    const { grade, term } = this.data
    api.wxCloudCallFunction('update', {
      collectionName: 'users',
      grade,
      term,
    }).then(res => {
      app.globalData.userInfo.grade = grade
      app.globalData.userInfo.term = term
      wx.showToast({ title: '修改成功' })
    })
  },
  getDetail() {
    this.setData({

    })
  },
})
