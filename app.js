// app.js
App({
  onLaunch() {
    // 小程序初始化时清除缓存的页面ID
    try {
      wx.removeStorageSync('articleID')
    } catch (e) {
      // Do something when catch error
    }
    // 小程序保持屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: true
    })
  },
  onPageNotFound(res) {
    wx.switchTab({
      url: 'pages/index/index'
    })
  },
  globalData: {
  }
})
