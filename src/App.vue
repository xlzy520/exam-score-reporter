<script>

export default {
  onLaunch() {
    // 在app.js里写下以下代码
    if (uni.canIUse('getUpdateManager')) {
      const updateManager = uni.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        console.log('onCheckForUpdate====', res) // 请求完新版本信息的回调

        if (res.hasUpdate) {
          console.log('res.hasUpdate====')
          updateManager.onUpdateReady(function () {
            uni.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',

              success(res) {
                console.log('success====', res) // res: {errMsg: "showModal: ok", cancel: false, confirm: true}

                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              },

            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            uni.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
            })
          })
        }
      })
    }

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'jiali-mpcuw',
        traceUser: true,
      })
    }

    this.globalData = {}
  },

  methods: {},
}
</script>
<style lang="scss">
//@import "~uview-ui/index.scss";
</style>
