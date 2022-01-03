const app = getApp()

Page({
  data: {
    article: '',
    title: '',
    dynasty: '',
    author: '',
    ishow: true,
    id: '',
    audiourl: ''
  },
  onLoad: function (res) {
    var that = this; 
    this.audioCtx = wx.createInnerAudioContext();
    var value = wx.getStorageSync('not_prompt_load');
    if (!value) {
      that.showModal();
    };
    if(res.id){
      that.getContentByID(res.id, that);
    }else{
      wx.showLoading({
        title: '加载中',
      })
      wx.request({
        url: 'https://www.nichuiniu.cn/v1/gushiwen/recommend',
        header: {
          'content-type': 'application/json',
          'dataType': 'json'
        },
        success: function (res) {
          that.setCont(res)
          wx.setNavigationBarTitle({
            title: '今日推荐 - 古诗文'
          })
          wx.hideLoading()
        }
      })
    }
  },
  onPullDownRefresh: function () {
    // 显示顶部刷新图标  
    wx.showNavigationBarLoading();
    var that = this;
    wx.request({
      url: 'https://www.nichuiniu.cn/v1/gushiwen/selectByRandom', 
      method: "GET",
      header: {
        'content-type': 'application/text',
        'dataType': 'json'
      },
      success: function (res) {
        if (typeof res.data === 'string'){
          console.log(typeof res.data),
          wx.stopPullDownRefresh();
          return false
        }
        that.setCont(res)
        wx.hideNavigationBarLoading();
        wx.setNavigationBarTitle({
          title: '古诗文'
        });
        // 停止下拉动作  
        wx.stopPullDownRefresh();
      }
    })
    console.log(this.data)
  },
  setCont: function(res) {
    this.setData({
      title: res.data.title,
      author: res.data.author,
      article: res.data.content,
      dynasty: res.data.dynasty,
      id: res.data.id,
      audiourl: res.data.audiourl
    });
    this.audioCtx.pause()
    if (this.data.audiourl == null || this.data.audiourl === '') {
      this.setData({
        ishow: false,
      });
    } else {
      this.setData({
        ishow: true,
        audiourl:  'https://www.nichuiniu.cn/mp3/' + res.data.audiourl
      });
      this.audioCtx.src = this.data.audiourl;
      this.audioCtx.play()
    }
  },

  showModal: function () {
    wx.showModal({
      content: '下拉刷新，精选推荐',
      showCancel: false,
      confirmText: '知道了',
      success: function (res) {
        if (res.confirm) {
          wx.setStorage({
            key: "not_prompt_load",
            data: "true",
          })
        }
      }
    })
  },
  getContentByID: function (id,that){
    wx.request({
      url: 'https://www.nichuiniu.cn/v1/gushiwen/selectByPrimaryKey?id=' + id,
      header: {
        'content-type': 'application/json',
        'dataType': 'json'
      },
      success: function (res) {
        that.setCont(res)
      }
    })
  },
  onShareAppMessage: function (res) {
    return {
      title: this.data.title,
      path: '/pages/index/index' + '?id=' + this.data.id,
    }
  },
  nextRandom: function (res) {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 1
    })
    var that = this;
    wx.request({
      url: 'https://www.nichuiniu.cn/v1/gushiwen/selectByRandom',
      method: "GET",
      header: {
        'content-type': 'application/text',
        'dataType': 'json'
      },
      success: function (res) {
        if (typeof res.data === 'string') {
          console.log(typeof res.data)
          return false
        }
        that.setData({
          title: res.data.title,
          author: res.data.author,
          article: res.data.content,
          dynasty: res.data.dynasty,
          id: res.data.id,
          audiourl: res.data.audiourl
        }),
        wx.hideNavigationBarLoading();
        wx.setNavigationBarTitle({
          title: '古诗文'
        });
      }
    })
  },
  onUnload: function () {
    this.audioCtx.destroy();
  }
})




