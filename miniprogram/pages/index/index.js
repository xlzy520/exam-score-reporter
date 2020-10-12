// index.js
import { gradeColumn } from '../../utils/enum'

const app = getApp()
const api = require('../../utils/api.js')

Page({
  data: {
    show: false,
    columns: ['全部', ...gradeColumn],
    gradeColumn: [],
    grade: '全部',
    gradeIndex: 0,
    popupType: 'subject',
    activeNames: ['1'],
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    records: null,

  },

  onLoad() {
    // 获取用户信息
    const gradeIndex = this.data.columns.findIndex(value => value === this.data.grade) || 0
    this.setData({
      gradeIndex,
    })

    this.getWxSetting()
  },
  onShow() {
    this.getRecordList()
  },

  showPopup() {
    this.setData({ show: true, popupType: 'picker' })
  },
  onClose() {
    this.setData({ show: false })
  },
  onConfirm(event) {
    const { value } = event.detail
    this.setData({
      grade: value,
      show: false,
    }, () => {
      this.getRecordList(value)
    })
  },
  onChange(event) {
    this.setData({
      activeNames: event.detail,
    })
  },
  getWxSetting() {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo,
              })
            },
          })
        }
      },
    })
  },

  onGetUserInfo(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo,
      })
    }
  },

  onGetOpenid() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      },
    })
  },

  // 上传图片
  doUpload() {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]

        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath

            wx.navigateTo({
              url: '../storageConsole/storageConsole',
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          },
        })
      },
      fail: e => {
        console.error(e)
      },
    })
  },

  getRecordList(grade) {
    if (grade === '全部') {
      grade = ''
    }
    wx.showLoading({ title: '加载中...' })
    api.wxCloudCallFunction('findAll', {
      collectionName: 'scores',
      grade,
    }).then(({ data }) => {
      const result = {}
      data.forEach(v => {
        if (!result[v.grade]) {
          result[v.grade] = []
        }
        result[v.grade].push(v)
      })
      const gradeMap = {}
      gradeColumn.forEach((value, index) => {
        gradeMap[value] = index
      })
      const sortColumn = Object.keys(result).sort((a, b) => gradeMap[a] - gradeMap[b])

      this.setData({
        records: result,
        gradeColumn: sortColumn,
      })

      console.log(data)
    }).finally(() => {
      wx.hideLoading()
    })
  },

})
