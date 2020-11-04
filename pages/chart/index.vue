<template>
<view class="container">
  <van-empty image="/static/images/zaizuole.jpg" description="在做了，在做了"></van-empty>
  <view>
    可以通过可视化图表展示某一科目的多次考试成绩的曲线，也可以展示多次考试整体成绩的曲线。
  </view>
  <view class="title">例图</view>
  <image src="/static/images/example-chart.png"></image>
  <view class="title">联系作者</view>
  <image src="/static/images/qrcode.png"></image>
</view>
</template>

<script>

export default {
  data() {
    return {}
  },

  components: {},
  props: {},

  onLoad() {},

  methods: {},
}
</script>
<style>
/**index.wxss**/
.title{
	text-align: center;
	font-size: 40rpx;
	font-weight: bold;
	padding: 30rpx 0;
	color: #FF6699;
}

image{
	width: 690rpx;
	box-sizing: border-box;
	margin: auto;
}

</style>
