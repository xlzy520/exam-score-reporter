<template>
  <!--index.wxml-->
  <view class="container">
    <ad unit-id="adunit-77c950cb8413c3aa"></ad>
    <u-cell-item title="年级" is-link :value="showGradeText" arrow-direction="down"
                 @click="showGradeVisible"></u-cell-item>
    <u-cell-group v-for="(item, gradeIndex) in gradeDataList" :key="gradeIndex" :title="item"
                  class="lzy-cell-group">
      <u-collapse v-model="activeNames" class="grade-collapse">
        <u-collapse-item v-for="(group, index) in records[item]" :key="index"
                         :name="gradeIndex+'-'+index">
          <template slot="title" class="w-full layout-slide">
            <view class="">{{group.examDateText}}</view>
            <view class="mr-1">{{group.examName}}</view>
          </template>
          <view class="layout-slide mb-1">
            <u-button type="primary" size="mini" @click="editRecord(group)">前往编辑
            </u-button>
            <u-button type="error" size="mini" @click="deleteRecord(group)">删除
            </u-button>
          </view>
          <u-grid :col="3" class="subject-score">
            <u-grid-item v-for="subject in group.subjects" :key="subject.name">
              <view class="text-2xl">{{ subject.name }}</view>
              <view class="text-xl grid-text text-pink-500">{{ subject.value }}</view>
            </u-grid-item>
          </u-grid>
          <u-cell-item v-for="cell in commonCells" :key="cell.name" :title="cell.name"
                       :value="group[cell.value]" :arrow="false" :value-style="valueStyle" />
        </u-collapse-item>
      </u-collapse>
    </u-cell-group>
    <view class="fixed compare-btn" v-if="showCompare">
      <u-button class="padding-btn" @click="goCompare" type="primary">成绩对比</u-button>
    </view>
    <view v-if="!gradeDataList.length">
      <u-empty text="当前条件下暂无成绩记录">
        <u-button slot="bottom" class="padding-btn" @click="goReport" type="primary">去记录我的成绩吧
        </u-button>
      </u-empty>
    </view>
    <u-popup v-model="changeLogVisible" closeable mode="center" width="600">
      <change-log />
    </u-popup>
    <u-popup v-model="gradeVisible" closeable mode="bottom">
      <view class="p-4 pb-10">
        <u-radio-group v-model="showGradeText" :size="40" :label-size="40" width="33%"
                       shape="circle" @change="gradeChange">
          <u-radio v-for="item in gradeColumns" :key="item.name"
                   :name="item.name">{{item.name}}</u-radio>
        </u-radio-group>
        <view class="">
          <u-button ripple class="btn normal-btn" @click="checkedAllGrade">选择全部</u-button>
<!--          <u-button ripple class="btn confirm-btn" @click="changeShowGrade">确认</u-button>-->
        </view>
      </view>

    </u-popup>

  </view>
</template>

<script>
import { gradeColumn } from 'utils/enum'
import ChangeLog from '@/components/changeLog'
import api from 'utils/api'

const app = getApp()

const ALL = '全部'
const gradeColumns = [ALL, ...gradeColumn].map(v => ({ name: v }))

export default {
  name: 'Home',
  components: {
    ChangeLog,
  },
  data() {
    return {
      changeLogVisible: false,
      gradeVisible: false,
      gradeColumns,
      gradeDataList: [],
      showGradeText: ALL,
      activeNames: [],
      userInfo: {},
      records: {},
      valueStyle: {
        fontWeight: 500,
        color: '#1296db',
        fontSize: '36rpx',
      },
      commonCells: [
        { name: '总分', value: 'score' },
        { name: '平均分', value: 'average' },
        { name: '班级排名', value: 'rankClass' },
        { name: '年级排名', value: 'rankGrade' }
      ],
    }
  },

  computed: {
    showCompare() {
      const list = this.records[this.showGradeText]
      return this.gradeDataList.length || (list && list.length > 1)
    },
  },

  methods: {
    getCollapseTitle(item) {
      return `${item.examDateText}——(${item.examName})`
    },
    gradeChange(val) {
      this.showGradeText = val
      this.changeShowGrade()
    },
    checkedAllGrade() {
      this.showGradeText = ALL
      this.changeShowGrade()
    },
    showGradeVisible() {
      this.gradeVisible = true
    },
    changeShowGrade() {
      this.gradeVisible = false
      this.getRecordList()
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

    editRecord(record) {
      app.globalData.recordId = record._id
      uni.switchTab({
        url: '/pages/report/index',
      })
    },

    deleteRecord(record) {
      const id = record._id
      uni.showModal({
        title: '提示',
        content: '确认删除本条记录吗？',
        success: res => {
          if (res.confirm) {
            this.deleteRecordService(id)
          }
        },
      })
    },

    deleteRecordService(id) {
      api.wxCloudCallFunction('removeOne', {
        collectionName: 'scores',
        _id: id,
      }).then(res => {
        uni.showToast({
          title: '删除成功',
        })
        this.getRecordList()
      })
    },

    getRecordList(grade = this.showGradeText) {
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
        // app.globalData.openid = console.log()
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
        this.gradeDataList = sortColumn
        console.log(data)
      }).finally(() => {
        uni.stopPullDownRefresh()
        uni.hideLoading()
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
          app.globalData.userInfo = data[0].userInfo || JSON.parse(data[0].rawData)
          app.globalData.userInfo.grade = data[0].grade
          app.globalData.userInfo.term = data[0].term
        }
        console.log(data)
      })
    },

    onGetOpenid() {
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          const openID = res.result.openid
          app.globalData.openid = openID
          this.onGetUserInfo(openID)
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err)
        },
      })
    },
  },
  onLoad() {
    // 获取用户信息
    // this.gradeIndex = this.gradeColumns.findIndex(value => value === this.grade) || 0
    if (!app.globalData.openid) {
      this.onGetOpenid()
    }
    const version = wx.getStorageSync('version')
    const curVersion = this.$version
    console.log(version)
    if (version !== curVersion) {
      wx.setStorageSync('version', curVersion)
      this.changeLogVisible = true
    }
  },
  onShow() {
    this.getRecordList()
  },

  onPullDownRefresh() {
    this.getRecordList()
  },
}
</script>
<style lang="scss" scoped>
.grade-collapse{
  ::v-deep .u-collapse-item{
    padding: 10upx 30upx;
    border-bottom: 1upx solid #E4E4E4;
  }
}

.subject-score .u-grid-item__text {
  color: hotpink;
  font-size: 40upx;
}

.compare-btn {
  bottom: 60upx;
  left: 30%;
  right: 30%;
  margin: auto;
  z-index: 9999;
}

</style>
