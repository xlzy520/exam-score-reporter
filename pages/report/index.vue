<template>
<view class="container">
  <gradePicker title="年级" :grade="reportData.grade" :term="reportData.term" @change="changeGrade"></gradePicker>
  <van-popup :show="show" position="bottom" @close="onClose">
    <van-datetime-picker type="date" :value="reportData.examDate" @input="onInputDate"
                         :formatter="formatter"
                         @cancel="onClose"
                         @confirm="onConfirmDate" />
  </van-popup>
  <van-cell-group title="考试信息">
    <van-field :value="reportData.examName" @change="evt=>changeData(evt, 'examName')"
               label="考试名称" auto-focus placeholder="请输入考试名称" />

    <van-cell title="考试日期" is-link :value="reportData.examDateText"
              arrow-direction="down" @click="showDatePopup"></van-cell>
  </van-cell-group>

  <van-cell-group title="排名信息">
    <van-field :value="reportData.rankClass" @change="evt=>changeData(evt, 'rankClass')"
               label="班级排名" type="number" placeholder="请输入班级排名"></van-field>
    <van-field :value="reportData.rankGrade" @change="evt=>changeData(evt, 'rankGrade')"
               label="年级排名" type="number" placeholder="请输入年级排名"></van-field>

  </van-cell-group>

  <van-cell-group title="科目信息">
    <van-field v-for="(item, index) in reportData.subjects" :key="item.name"
               :value="item.value" :label="item.name" maxlength="5"
               :placeholder="'本次' + item.name + '得分'"
               :error="subjectErrors[index]" type="digit"
               @change="evt=>changeSubjectFullScore(evt, index)">
      <view slot="right-icon">({{item.full}}分)</view>
    </van-field>
    <view class="df no-subject">
      <view class="no-subject-text">没有我的课程？</view>
      <view class="no-subject-btn" @tap="goConfig">去配置</view>
    </view>
  </van-cell-group>
  <van-cell-group :title="'总分 (' + total + ')'" class="total-score">
    <van-circle :value="reportData.rate" layer-color="#f6f6f6"
                stroke-width="6" :color="gradientColor">
      得分 {{reportData.score}}
    </van-circle>
  </van-cell-group>
  <van-cell-group title="统计">
      <van-cell title="平均分" :value="reportData.average"></van-cell>
<!--      <van-cell title="不及格科目" value="{{average}}" />-->
  </van-cell-group>

  <van-button class="padding-btn" block round open-type="getUserInfo"
              :loading="loading" loading-type="spinner"
              :loading-text="loadingText + '中'" type="danger"
              @tap="submit" @getuserinfo="getUserInfo">
    {{subjectId ? '更新': '保存'}}
  </van-button>
  <van-button class="padding-btn" block round
              @tap="reset" type="info">重置</van-button>

  <van-toast id="van-toast" />

</view>
</template>

<script>
import dayjs from 'dayjs'
import Toast from '../../wxcomponents/vant/toast/toast'
import gradePicker from '../../components/gradePicker/index.vue'
import { defaultSubjects, gradeColumn } from '../../utils/enum'

const api = require('../../utils/api.js')

const app = getApp()
const defaultReportData = {
  grade: '初三',
  term: '上学期',
  subjects: defaultSubjects,
  score: 0,
  rate: 0,
  average: 0,
  examName: '',
  examDate: new Date().getTime(),
  examDateText: dayjs().format('YYYY-MM-DD'),
  rankClass: 0,
  rankGrade: 0,
}

export default {
  data() {
    return {
      show: false,
      reportData: defaultReportData,
      columns: gradeColumn,
      popupType: 'subject',
      subjectErrors: [],
      subjectId: '',
      loading: false,
      loadingText: '',
      gradientColor: {
        '0%': '#3fecff',
        '100%': '#6149f6',
      },
    }
  },

  components: {
    gradePicker,
  },
  props: {},

  onLoad() {

  },

  onShow(e) {
    const id = (e && e.id) || app.globalData.recordId || this.subjectId
    this.setGradeTerm()
    if (id) {
      this.getScores(id)
    } else {
      this.getSubject()
    }
  },

  onHide() { // this.reset()
  },

  computed: {
    total() {
      return this.reportData.subjects.reduce((pre, cur) => Number(cur.full) + pre, 0)
    },
  },

  methods: {
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`
      } else if (type === 'month') {
        return `${value}月`
      }

      return value
    },

    changeData({ detail }, key) {
      this.reportData[key] = detail
    },

    showDatePopup() {
      this.show = true
    },

    onClose() {
      this.show = false
    },

    changeGrade(evt) {
      const [grade, term] = evt.detail
      this.reportData.grade = grade
      this.reportData.term = term
      this.getSubject()
    },

    onConfirmDate(event) {
      const value = event.detail
      this.reportData.examDate = value
      this.reportData.examDateText = dayjs(value).format('YYYY-MM-DD')
      this.onClose()
    },

    onInputDate(event) {
      this.reportData.examDate = event.detail
    },

    changeSubjectFullScore(evt, index) {
      const value = evt.detail
      const _subjects = [...this.reportData.subjects]
      const full = _subjects[index].full

      if (value > parseInt(full)) {
        Toast('不能超过满分')
        this.reportData.subjects[index].value = 0
      } else {
        _subjects[index].value = value
      }

      this.reportData.subjects = _subjects
      this.subjectErrors = []
      this.computeTotalScores(_subjects)
    },

    submit(e) {
      let hasEmpty = false
      const {
        examDate,
        examName,
        subjectId,
      } = this
      const subjects = [...this.reportData.subjects]

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
        this.subjectErrors = subjectErrors
        Toast('存在不合法的输入')
        return
      }

      console.log(subjectId)
      const name = subjectId ? 'update' : 'add'
      const actionName = subjectId ? '更新' : '保存'
      this.loading = true
      this.loadingText = actionName
      if (subjectId) {
        this.reportData._id = subjectId
      }

      api.wxCloudCallFunction(name, {
        collectionName: 'scores',
        ...this.reportData,
      }).then(res => {
        Toast(actionName + '成功')
        this.reportData.subjectId = res._id
        console.log(res)
      }).finally(() => {
        this.loading = false
      })
    },

    computeTotalScores(subjects) {
      const score = subjects.reduce((pre, cur) => {
        if (cur.value) {
          return Number(cur.value) + pre
        }

        return pre
      }, 0)
      console.log(score)
      this.reportData.score = score
      this.reportData.rate = (score / this.total).toFixed(2) * 100
      this.reportData.average = (score / subjects.length).toFixed(2)
    },

    getSubject() {
      uni.showLoading({
        title: '加载中',
      })
      api.wxCloudCallFunction('findAll', {
        collectionName: 'gradeSubject',
        grade: this.reportData.grade,
      }).then(({
        data,
      }) => {
        if (data && data.length) {
          const subjects = data[0].subjects
          this.reportData.subjects = subjects
        } else {
          Toast('未查询到相关信息，使用默认课程信息')
          this.reportData.subjects = defaultSubjects
          this.subjectId = ''
        }
      }).finally(() => {
        uni.hideLoading()
      })
    },

    getScores(id) {
      uni.showLoading({
        title: '加载中',
      })
      api.wxCloudCallFunction('findOne', {
        collectionName: 'scores',
        _id: id,
      }).then(({
        data,
      }) => {
        app.globalData.recordId = ''

        if (data) {
          const subjects = data.subjects
          this.subjectId = id
          this.reportData = data
          this.computeTotalScores(subjects)
        }
      }).finally(() => {
        uni.hideLoading()
      })
    },

    goConfig() {
      uni.navigateTo({
        url: '/pages/subjectSetting/index',
      })
    },

    getUserInfo(e) {
      if (!app.globalData.userInfo) {
        const detail = e.detail
        api.wxCloudCallFunction('addUser', {
          collectionName: 'users',
          ...detail,
        }).then(res => {
          app.globalData.userInfo = detail.userInfo
          console.log(res)
        })
      }
    },

    reset() {
      this.subjectId = ''
      this.subjectErrors = []
      this.reportData = defaultReportData
      // for (const dataKey in defaultReportData) {
      //   if (defaultReportData.hasOwnProperty(dataKey)) {
      //     this[dataKey] = defaultReportData[dataKey]
      //   }
      // }
      this.setGradeTerm()
      this.getSubject()
    },

    setGradeTerm() {
      const userInfo = app.globalData.userInfo
      if (userInfo && userInfo.grade) {
        this.reportData.grade = userInfo.grade
        this.reportData.term = userInfo.term
      }
    },

  },
}
</script>

<style lang="scss">
  .total-score{
     .van-cell-group{
      padding-top: 30rpx;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: #fff;
    }
  }
  .no-subject{
    font-size: 30rpx;
    color: #ccc;
    justify-content: center;
    align-items: center;
    padding: 10rpx;
    background: #fff;
    .no-subject-text{

    }
    .no-subject-btn{
      color: #1296db;
    }
  }

</style>
