<template>
  <!--index.wxml-->
  <view class="container">
    <van-cell title="年级" is-link :value="grade" arrow-direction="down" @click="showPopup"></van-cell>
    <van-popup :show="show" position="bottom" @close="onClose">
      <van-picker :columns="columns" :default-index="gradeIndex" show-toolbar v-if="popupType==='picker'" @cancel="onClose"
        @confirm="onConfirm"></van-picker>
    </van-popup>
    <van-cell-group v-for="(item, gradeIndex) in gradeColumn" :key="gradeIndex" :title="item">
      <van-collapse :value="activeNames" @change="onChange">
        <van-collapse-item v-for="(group, index) in records[item]" :key="index" :title="group.examDateText" :name="gradeIndex+'-'+index"
          :value="group.examName">
          <view class="action">
            <van-button type="primary" size="mini" :data-record="group" @tap="editRecord">前往编辑</van-button>
            <van-button type="danger" size="mini" :data-record="group" @tap="deleteRecord">删除</van-button>
          </view>
          <van-grid column-num="3" class="subject-score">
            <van-grid-item v-for="(subject, index2) in group.subjects" :key="index2" :text="subject.value">
              <view slot="icon">{{subject.name}}</view>
            </van-grid-item>
          </van-grid>
          <van-cell title="总分" :value="group.score"></van-cell>
          <van-cell title="平均分" :value="group.average"></van-cell>
          <van-cell title="班级排名" :value="group.rankClass"></van-cell>
          <van-cell title="年级排名" :value="group.rankGrade"></van-cell>
        </van-collapse-item>
      </van-collapse>
    </van-cell-group>
    <view class="fixed compare-btn" v-if="!records">
      <van-button color="#7232dd" class="padding-btn" block round @tap="goCompare" type="danger">成绩对比</van-button>
    </view>
    <view v-if="records && !gradeColumn.length">
      <van-empty description="暂无成绩记录">
        <van-button color="#7232dd" class="padding-btn" block round @tap="goReport" type="danger">去记录我的成绩吧</van-button>
      </van-empty>
    </view>
  </view>
</template>

<script>
// index.js
import {
  gradeColumn
} from '../../utils/enum'

const app = getApp()
const api = require('../../utils/api.js')

export default {
  data() {
    return {
      show: false,
      columns: ['全部', ...gradeColumn],
      gradeColumn: [],
      grade: '全部',
      gradeIndex: 0,
      popupType: 'subject',
      activeNames: ['1'],
      avatarUrl: '/static/pages/index/user-unlogin.png',
      userInfo: {},
      logged: false,
      takeSession: false,
      requestResult: '',
      records: null,
    }
  },

  components: {},
  props: {},
  onLoad() {
    // 获取用户信息
    this.gradeIndex = this.columns.findIndex(value => value === this.grade) || 0
    if (!app.globalData.openid) {
      this.onGetOpenid()
    }
  },
  onShow() {
    this.getRecordList()
  },

  onPullDownRefresh() {
    this.getRecordList(this.grade)
  },

  methods: {
    showPopup() {
      this.show = true
      this.popupType = 'picker'
    },

    onClose() {
      this.show = false
    },

    onConfirm(event) {
      const {
        value,
      } = event.detail
      this.grade = value
      this.show = false
      this.getRecordList(value)
    },

    onChange(event) {
      this.activeNames = event.detail
    },

    goCompare() {
      uni.navigateTo({
        url: '/pages/compare/index',
      })
    },

    goReport() {
      uni.switchTab({
        url: '/pages/report/index',
      })
    },

    editRecord(evt) {
      const record = evt.target.dataset.record
      const _id = record._id
      app.globalData.recordId = _id
      uni.switchTab({
        url: '/pages/report/index',
      })
      console.log(evt)
    },

    deleteRecord(evt) {
      const record = evt.target.dataset.record
      const id = record._id
      uni.showModal({
        title: '提示',
        content: '确认删除本条记录吗？',
        success: res => {
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
        uni.showToast({
          title: '删除成功',
        })
        this.getRecordList()
      })
    },

    getRecordList(grade) {
      if (grade === '全部') {
        grade = undefined
      }

      uni.showLoading({
        title: '加载中...',
      })
      api.wxCloudCallFunction('findAll', {
        collectionName: 'scores',
        grade,
      }).then(({
        data,
      }) => {
        app.globalData.openid = console.log()
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
        this.records = result
        this.gradeColumn = sortColumn
        console.log(data)
      }).finally(() => {
        uni.stopPullDownRefresh()
        uni.hideLoading()
      })
    },

    getWxSetting() {
      uni.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            uni.getUserInfo({
              success: res => {
                this.avatarUrl = res.userInfo.avatarUrl, this.userInfo = res.userInfo
              },
            })
          }
        },
      })
    },

    onGetUserInfo(id) {
      api.wxCloudCallFunction('findAll', {
        collectionName: 'users',
        open_id: id,
      }).then(({
        data,
      }) => {
        if (data && data.length) {
          app.globalData.userInfo = JSON.parse(data[0].rawData)
        } else {}

        console.log(data) // if ( && data.length) {
        //   console.log(data);
        // }
      }) // if (!this.data.logged && e.detail.userInfo) {
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
          this.onGetUserInfo(openID) // wx.navigateTo({
          //   url: '../userConsole/userConsole',
          // })
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err) // wx.navigateTo({
          //   url: '../deployFunctions/deployFunctions',
          // })
        },
      })
    },

    // 上传图片
    doUpload() {
      // 选择图片
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],

        success(res) {
          uni.showLoading({
            title: '上传中',
          })
          const filePath = res.tempFilePaths[0] // 上传图片

          const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
          uni.cloud.uploadFile({
            cloudPath,
            filePath,
            success: res => {
              console.log('[上传文件] 成功：', res)
              app.globalData.fileID = res.fileID
              app.globalData.cloudPath = cloudPath
              app.globalData.imagePath = filePath
              uni.navigateTo({
                url: '../storageConsole/storageConsole',
              })
            },
            fail: e => {
              console.error('[上传文件] 失败：', e)
              uni.showToast({
                icon: 'none',
                title: '上传失败',
              })
            },
            complete: () => {
              uni.hideLoading()
            },
          })
        },

        fail: e => {
          console.error(e)
        },
      })
    },

  },
}
</script>
<style>
  /**index.wxss**/

  page {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    background: #f6f6f6;
  }

  .subject-score .van-grid-item__text {
    color: hotpink;
    font-size: 40rpx;
  }

  .fixed {
    position: fixed;
  }

  .compare-btn {
    bottom: 60rpx;
    left: 30%;
    right: 30%;
    margin: auto;
  }

  .action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10rpx;
  }
</style>
