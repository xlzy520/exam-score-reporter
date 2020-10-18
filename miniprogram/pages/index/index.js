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
    // wx.cloud.callFunction({
    //   name: 'login',
    //   data: {},
    //   success: res => {
    //     const version = wx.getSystemInfoSync().SDKVersion
    //     console.log(version)
    //     console.log('[云函数] [login] user openid: ', res.result)
    //   },
    // })

    // this.getWxSetting()
    if (!app.globalData.openid) {
      this.onGetOpenid()
    }
  },
  onShow() {
    this.getRecordList()
  },
  // getUserInfo(){
  //
  // },

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
  goCompare() {
    wx.navigateTo({ url: '/pages/compare/index' })
  },
  goReport() {
    wx.switchTab({ url: '/pages/report/index' })
  },
  editRecord(evt) {
    const record = evt.target.dataset.record
    const _id = record._id
    app.globalData.recordId = _id
    wx.switchTab({ url: '/pages/report/index' })

    console.log(evt)
  },

  deleteRecord(evt) {
    const record = evt.target.dataset.record
    const id = record._id
    wx.showModal({
      title: '提示',
      content: '确认删除本条记录吗？',
      success: (res) => {
        if (res.confirm) {
          console.log('用户点击确定')
          this.deleteRecordService(id)
        }
      },
    })
    console.log(evt)
  },

  deleteRecordService(id) {
    api.wxCloudCallFunction('removeOne', {
      collectionName: 'scores',
      _id: id,
    }).then(res => {
      console.log(res)
      wx.showToast({
        title: '删除成功'
      })
      this.getRecordList()
    })
  },

  getRecordList(grade) {
    if (grade === '全部') {
      grade = undefined
    }
    wx.showLoading({ title: '加载中...' })
    api.wxCloudCallFunction('findAll', {
      collectionName: 'scores',
      grade,
    }).then(({ data }) => {
      app.globalData.openid =
      console.log();
  
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
      wx.stopPullDownRefresh()
      wx.hideLoading()
    })
  },

  onPullDownRefresh() {
    this.getRecordList(this.data.grade)
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

  onGetUserInfo(id) {
    api.wxCloudCallFunction('findAll',{
      collectionName: 'users',
      open_id: id
    }).then(({data}) => {
      if (data && data.length) {
        app.globalData.userInfo = JSON.parse(data[0].rawData)
      } else {
      
      }
      console.log(data);
      // if ( && data.length) {
      //   console.log(data);
      // }
    })
    // if (!this.data.logged && e.detail.userInfo) {
    //   this.setData({
    //     logged: true,
    //     avatarUrl: e.detail.userInfo.avatarUrl,
    //     userInfo: e.detail.userInfo,
    //   })
    // }
  },

  onGetOpenid() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        const openID = res.result.openid
        app.globalData.openid = openID
        this.onGetUserInfo(openID)
        
        // wx.navigateTo({
        //   url: '../userConsole/userConsole',
        // })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        // wx.navigateTo({
        //   url: '../deployFunctions/deployFunctions',
        // })
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
})
