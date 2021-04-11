const wxCloudCallFunction = (name, data) => new Promise((resolve, reject) => {
  wx.cloud.callFunction({
    name,
    data,
  }).then(res => {
    if (res.errMsg === 'cloud.callFunction:ok') {
      resolve(res.result)
    }
  }).catch(err => {
    console.error(err)
    uni.hideLoading()
    uni.showToast({
      icon: 'none',
      title: '操作失败',
    })
    reject(err)
  })
})

module.exports = {
  wxCloudCallFunction,
}
