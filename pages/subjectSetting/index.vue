<template>
<view class="container">
  <gradePicker title="年级" :grade="grade" :term="term" @change="changeGrade"></gradePicker>
<!--  <van-cell title="年级" is-link value="{{grade}}" arrow-direction="down" bind:click="showPopup" />-->
  <van-popup :show="show" position="bottom" @close="onClose">
<!--    <van-picker columns="{{ columns }}" default-index="2" show-toolbar-->
<!--                wx:if="{{popupType==='picker'}}"-->
<!--                bind:cancel="onClose"-->
<!--                bind:confirm="onConfirm" />-->
    <view>
      <van-field :model:value="subjectName" label="科目名称" auto-focus placeholder="请输入科目名称"></van-field>
      <van-button class="padding-btn" block round @tap="addNewSubject" type="primary">
        提交
      </van-button>

    </view>

  </van-popup>

  <van-cell-group title="科目信息及满分">
    <van-field v-for="(item, index) in subjects" :key="index" :value="item.full" :label="item.name" :data-index="index" maxlength="3" :placeholder="item.name + '满分'" :error="subjectErrors[index]" type="number" @change="changeSubjectFullScore">
      <van-icon slot="right-icon" name="close" @tap="deleteSubject" :data-index="index"></van-icon>
    </van-field>
  </van-cell-group>

  <van-button class="padding-btn" block round @tap="showNewSubjectPopup" color="linear-gradient(to right, #4bb0ff, #6149f6)">
    <view class="df flex-center">
      <van-icon name="plus"></van-icon>
      增加科目信息
    </view>
  </van-button>
  <van-button class="padding-btn" block round @tap="submit" :loading="loading" loading-type="spinner" :loading-text="loadingText + '中'" type="danger">
    {{subjectId ? '更新': '保存'}}
  </van-button>

  <van-toast id="van-toast"></van-toast>

</view>
</template>

<script>
// logs.js
import Toast from '../../wxcomponents/vant/toast/toast'
import { defaultSubjects, gradeColumn } from '../../utils/enum'
import gradePicker from '../../components/gradePicker/index.vue'

const api = require('../../utils/api.js')

const app = getApp()

export default {
  data() {
    return {
      show: false,
      columns: gradeColumn,
      grade: '初三',
      term: '上学期',
      popupType: 'subject',
      subjects: defaultSubjects,
      subjectErrors: [],
      subjectName: '',
      subjectId: '',
      loading: false,
      loadingText: '',
    }
  },

  components: {
    gradePicker,
  },
  props: {},

  onLoad() {
    this.getSubject()
    this.setGradeTerm()
  },

  methods: {
    showPopup() {
      this.show = true
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

    showNewSubjectPopup() {
      this.showPopup()
      this.popupType = 'subject'
    },

    addNewSubject() {
      const subjectName = this.subjectName

      if (!subjectName) {
        Toast('科目名称不能为空')
        return
      }

      const _subjects = [...this.subjects]

      _subjects.push({
        name: subjectName,
        full: '',
      })
      this.onClose()
      this.subjects = _subjects
    },

    deleteSubject(evt) {
      const index = evt.target.dataset.index
      const _subjects = [...this.subjects]

      _subjects.splice(index, 1)
      this.subjects = _subjects
    },

    changeSubjectFullScore(evt) {
      const value = evt.detail
      const index = evt.target.dataset.index
      const _subjects = [...this.subjects]
      _subjects[index].full = value
      this.subjects = _subjects
      this.subjectErrors = []
    },

    submit() {
      const subjects = [...this.subjects]
      let hasEmpty = false
      const subjectErrors = subjects.map(v => {
        if (!v.full || !v.full > 0) {
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

      const name = this.subjectId ? 'update' : 'add'
      const actionName = this.subjectId ? '更新' : '保存'
      this.loading = true
      this.loadingText = actionName
      api.wxCloudCallFunction(name, {
        collectionName: 'gradeSubject',
        grade: this.grade,
        subjects: this.subjects,
        term: this.term,
      }).then(res => {
        Toast(actionName + '成功')
        this.subjectId = res._id
        console.log(res)
      }).finally(() => {
        this.loading = false
      })
    },

    setGradeTerm() {
      const userInfo = app.globalData.userInfo

      if (userInfo && userInfo.grade) {
        this.grade = userInfo.grade
        this.term = userInfo.term
      }
    },

    getSubject() {
      uni.showLoading({
        title: '加载中',
      })
      api.wxCloudCallFunction('findAll', {
        collectionName: 'gradeSubject',
        grade: this.grade,
        term: this.term,
      }).then(({
        data,
      }) => {
        if (data && data.length) {
          this.subjects = data && data[0].subjects
          this.subjectId = data[0]._id
        } else {
          Toast('未查询到相关信息，使用默认课程信息')
          this.subjects = defaultSubjects
          this.subjectId = ''
        }
      }).finally(() => {
        uni.hideLoading()
      })
    },

  },
}
</script>
<style>
.df{
	display: flex;
}
.flex-center{
	align-items: center;
}

.padding-btn{
	display: block;
	padding: 15rpx 30rpx;
}

</style>
