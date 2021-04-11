// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { templateId, character, name } = event
  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: wxContext.OPENID,
      templateId,
      miniprogramState: 'developer',
      page: 'index',
      lang: 'zh_CN',
      data: {
        thing1: {
          value: character,
        },
        thing2: {
          value: name,
        },
        date4: {
          value: name,
        },
        thing6: {
          value: name,
        },
      },

    })
    return result
  } catch (err) {
    return err
  }
}
