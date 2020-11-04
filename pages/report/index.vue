<template>
<view class="container">
  <gradePicker title="年级" :grade="grade" :term="term" @change="changeGrade"></gradePicker>

  <!--  <van-cell title="年级" is-link value="{{currentGrade}}" arrow-direction="down" bind:click="showPopup" />-->
  <van-popup :show="show" position="bottom" @close="onClose">
<!--    <van-picker columns="{{ columns }}" show-toolbar-->
<!--                wx:if="{{popupType==='picker'}}"-->
<!--                bind:cancel="onClose"-->
<!--                bind:confirm="onConfirm" />-->
    <van-datetime-picker type="date" v-if="popupType==='date'" :value="examDate" @input="onInputDate" :formatter="formatter" @cancel="onClose" @confirm="onConfirmDate"></van-datetime-picker>
  </van-popup>
  <van-cell-group title="考试信息">
    <van-field :model:value="examName" label="考试名称" auto-focus placeholder="请输入考试名称"></van-field>

    <van-cell title="考试日期" is-link :value="examDateText" arrow-direction="down" @click="showDatePopup"></van-cell>
  </van-cell-group>

  <van-cell-group title="排名信息">
    <van-field :model:value="rankClass" label="班级排名" type="number" placeholder="请输入班级排名"></van-field>
    <van-field :model:value="rankGrade" label="年级排名" type="number" placeholder="请输入年级排名"></van-field>

  </van-cell-group>

  <van-cell-group title="科目信息">
    <van-field v-for="(item, index) in subjects" :key="index" :value="item.value" :label="item.name" :data-index="index" maxlength="5" :placeholder="'本次' + item.name + '得分'" :error="subjectErrors[index]" type="digit" @change="changeSubjectFullScore">
      <view slot="right-icon">({{item.full}}分)</view>
    </van-field>
    <view class="df no-subject">
      <view class="no-subject-text">没有我的课程？</view>
      <view class="no-subject-btn" @tap="goConfig">去配置</view>
    </view>
  </van-cell-group>
  <van-cell-group :title="'总分 (' + total + ')'" class="total-score">
    <van-circle :value="rate" layer-color="#f6f6f6" stroke-width="6" :color="gradientColor">
      得分 {{score}}
    </van-circle>
  </van-cell-group>
  <van-cell-group title="统计">
      <van-cell title="平均分" :value="average"></van-cell>
<!--      <van-cell title="不及格科目" value="{{average}}" />-->
  </van-cell-group>

  <van-button class="padding-btn" block round @tap="submit" @getuserinfo="getUserInfo" open-type="getUserInfo" :loading="loading" loading-type="spinner" :loading-text="loadingText + '中'" type="danger">
    {{subjectId ? '更新': '保存'}}
  </van-button>
  <van-button class="padding-btn" block round @tap="reset" type="info">重置</van-button>

  <van-toast id="van-toast"></van-toast>

</view>
</template>

<script>
import dayjs from 'dayjs'
import Toast from '../../wxcomponents/vant/toast/toast'
import { defaultSubjects, gradeColumn } from '../../utils/enum'
import gradePicker from '../../components/gradePicker/index.vue'

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

export default {
  data() {
    return {
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
    }
  },

  components: {
    gradePicker,
  },
  props: {},

  onLoad(e) { // const id = e.id || app.recordId
    // if (id) {
    //   this.getScores(id)
    // }
  },

  onShow(e) {
    const id = e && e.id || app.globalData.recordId || this.subjectId
    this.setGradeTerm()
    console.log(id)

    if (id) {
      this.getScores(id)
    } else {
      this.getSubject()
    }
  },

  onHide() { // this.reset()
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

    showDatePopup() {
      this.show = true
      this.popupType = 'date'
    },

    onClose() {
      this.show = false
    },

    changeGrade(evt) {
      const [grade, term] = evt.detail
      this.grade = grade
      this.term = term
      this.getSubject()
    },

    onConfirmDate(event) {
      const value = event.detail
      this.examDate = value
      this.examDateText = dayjs(value).format('YYYY-MM-DD')
      this.onClose()
    },

    onInputDate(event) {
      this.examDate = event.detail
    },

    changeSubjectFullScore(evt) {
      const value = evt.detail
      const index = evt.target.dataset.index
      const _subjects = [...this.subjects]
      const full = _subjects[index].full

      if (value > parseInt(full)) {
        Toast('不能超过满分')
      } else {
        _subjects[index].value = value
      }

      this.subjects = _subjects
      this.subjectErrors = []
      this.computeTotalScores(_subjects)
    },

    submit(e) {
      console.log(e)
      let hasEmpty = false
      const {
        examDate,
        examName,
        subjectId,
      } = this
      const subjects = [...this.subjects]

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
        this.setData({
          subjectErrors,
        })
        Toast('存在不合法的输入')
        return
      }

      console.log(subjectId)
      const name = subjectId ? 'update' : 'add'
      const actionName = subjectId ? '更新' : '保存'
      this.loading = true
      this.loadingText = actionName
      const {
        examDateText, rankClass, rankGrade, grade, average, score, term,
      } = this
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
        this.loading = false
      })
    },

    computeTotalFull(subjects) {
      this.total = subjects.reduce((pre, cur) => Number(cur.full) + pre, 0)
    },

    computeTotalScores(subjects) {
      const score = subjects.reduce((pre, cur) => {
        if (cur.value) {
          return Number(cur.value) + pre
        }

        return pre
      }, 0)
      this.score = score
      this.rate = (score / this.total).toFixed(2) * 100
      this.average = (score / subjects.length).toFixed(2)
    },

    getSubject() {
      uni.showLoading({
        title: '加载中',
      })
      api.wxCloudCallFunction('findAll', {
        collectionName: 'gradeSubject',
        grade: this.grade,
      }).then(({
        data,
      }) => {
        if (data && data.length) {
          const subjects = data[0].subjects
          this.subjects = subjects
          this.computeTotalFull(subjects)
        } else {
          Toast('未查询到相关信息，使用默认课程信息')
          this.subjects = defaultSubjects
          this.subjectId = ''
          this.computeTotalFull(defaultSubjects)
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
          for (const dataKey in data) {
            if (data.hasOwnProperty(dataKey)) {
              this[dataKey] = data[dataKey]
            }
          }
          // this.setData({
          //   ...data
          // });
          this.computeTotalFull(subjects)
          this.computeTotalScores(subjects)
        }
      }).finally(() => {
        uni.hideLoading()
      })
    },

    getWxSetting() {},

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
      for (const dataKey in defaultReportData) {
        if (defaultReportData.hasOwnProperty(dataKey)) {
          this[dataKey] = defaultReportData[dataKey]
        }
      }
      this.setGradeTerm()
      this.getSubject()
    },

    setGradeTerm() {
      const userInfo = app.globalData.userInfo
      if (userInfo && userInfo.grade) {
        this.grade = userInfo.grade
        this.term = userInfo.term
      }
    },

  },
}
</script>
<style>
/**index.wxss**/

.total-score{
}

.total-score .van-cell-group{
	padding-top: 30rpx;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background: #fff;
}

.no-subject{
	font-size: 30rpx;
	color: #ccc;
	justify-content: center;
	align-items: center;
	padding: 10rpx;
	background: #fff;
}

.no-subject-text{

}
.no-subject-btn{
	color: #1296db;
}

</style>
