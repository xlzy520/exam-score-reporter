<template>
  <view class="change-log">
    <view class="title">更新日志</view>
    <view class="version">当前版本: 2.0.2</view>
    <view class="change-log-content">
      <view class="changelog-item">1.修复学期数据不对</view>
      <view class="changelog-item">2.修复成绩登记不能新增的问题</view>
      <view class="changelog-item">3.修复学科配置问题</view>
    </view>
    <view class="version">当前版本: 2.0.0</view>
    <view class="change-log-content">
      <view class="changelog-item">1. 整体代码重构</view>
      <view class="changelog-item">2. 年级、学期选择重构</view>
      <view class="changelog-item">3. 图表插件重构</view>
      <view class="changelog-item">4. 图表增加雷达图</view>
      <view class="changelog-item">5. 反馈列表优化</view>
      <view class="changelog-item">6. 一些其他的优化</view>
      <view class="changelog-item">点击弹窗外关闭</view>
    </view>
    <view class="version">版本: 1.1.2</view>
    <view class="change-log-content">
      <view class="changelog-item">1. 修复一直提示填写考试名称</view>
      <view class="changelog-item">2. 增加小学、大学可选项</view>
      <view class="changelog-item">3. 增加问题反馈列表</view>
      <view class="changelog-item">点击弹窗外关闭</view>
    </view>
    <view class="version">版本: 1.1.1</view>
    <view class="change-log-content">
      <view class="changelog-item">1. 完善可视化页面,增加了三个图表</view>
      <view class="changelog-item">2. 完善成绩对比页面，可以选择任意两次考试</view>
      <view class="changelog-item">3. "我的"页面增加提交反馈入口，可以说出你的意见</view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ChangeLog',
  data() {
    return {

    }
  },
}
</script>

<style lang="scss" scoped>
.change-log{
  height: 65vh;
  padding: 60upx;
  &-content{
    .changelog-item{
      font-size: 40upx;
      line-height: 1.5;
      color: #1296db;
    }
  }
  .title{
    font-size: 60upx;
    font-weight: bold;
    padding: 40upx 40upx 20upx;
    text-align: center;
  }
  .version{
    font-size: 40upx;
    font-weight: bold;
    padding: 20upx;
    text-align: center;
  }
}

</style>
