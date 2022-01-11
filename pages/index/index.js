const app = getApp()
const audioCtx = wx.createInnerAudioContext();
Page({
  data: {
    article: '',
    title: '',
    dynasty: '',
    author: '',
    ishow: false,
    isplay: false,
    id: '',
    audiourl: '',
    is_moving_slider: false,
    current_process:"",
    slider_value: "",
    total_process: "",
    slider_max: "",
  },
  onLoad: function (res) {
    var that = this; 
    var value = wx.getStorageSync('not_prompt_load');
    if (!value) {
      that.showModal();
    };
    var articleID = wx.getStorageSync('articleID');

    if(res.id){
      //通过分享的链接直接进入具体的文章页
      that.getContentByID(res.id, that);
    }else if (articleID) {
      //通过本地缓存的链接ID直接进入具体的文章页
      that.getContentByID(articleID, that);
      wx.setNavigationBarTitle({
        title: '古诗文'
      });
    } else {
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
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: 'https://www.nichuiniu.cn/v1/gushiwen/selectByRandom', 
      method: "GET",
      header: {
        'content-type': 'application/text',
        'dataType': 'json'
      },
      success: function (res) {
        if (typeof res.data === 'string'){
          // console.log(typeof res.data),
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
        wx.hideLoading()
      }
    })
    console.log(this.data)
  },
  setCont: function(res) {
    var that = this;
    this.setData({
      title: res.data.title,
      author: res.data.author,
      article: res.data.content,
      dynasty: res.data.dynasty,
      id: res.data.id,
      audiourl: res.data.audiourl
    });
    if (this.data.audiourl == null || this.data.audiourl === '') {
      this.setData({
        ishow: false,
        isplay: false,
      });
      if(!this.data.ishow){
        audioCtx.pause();
      }
    } else {
      this.setData({
        ishow: true,
        isplay: true,
        audiourl:  'https://www.nichuiniu.cn/mp3/' + res.data.audiourl
      });
      audioCtx.src = this.data.audiourl;
      audioCtx.onTimeUpdate(() => {
        if (!this.data.is_moving_slider) {
          this.setData({
            slider_value: Math.floor(audioCtx.currentTime),
            current_process: that.format(audioCtx.currentTime),
            slider_max: Math.floor(audioCtx.duration),
            total_process: that.format(audioCtx.duration)
          });
        }
      })
      audioCtx.onCanplay(this.updateTime)
      audioCtx.play()
      audioCtx.onEnded(() => {
        // 单曲循环
        that.setData({
          slider_value: 0,
          current_process: '00:00',
          isplay: false,
          total_process: that.format(audioCtx.duration)
        })
      })
      }
  },

  // 获取音频时长。
  updateTime: function() {
    let that = this;
    setTimeout(function(){
      let duration = audioCtx.duration;
      if (duration == 0 || isNaN(duration)) {
        // console.log(duration)
        that.updateTime();
      } else {
        that.setData({
          slider_max: Math.floor(audioCtx.duration),
          total_process: that.format(audioCtx.duration)
        });
      }
    },100);
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
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: 'https://www.nichuiniu.cn/v1/gushiwen/selectByPrimaryKey?id=' + id,
      header: {
        'content-type': 'application/json',
        'dataType': 'json'
      },
      success: function (res) {
        that.setCont(res)
        wx.hideLoading()
        wx.setNavigationBarTitle({
          title: '古诗文'
        });
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
        that.setCont(res);
        wx.hideNavigationBarLoading();
        wx.setNavigationBarTitle({
          title: '古诗文'
        });
      }
    })
  },
  play: function (res) {
    if(this.data.isplay){
      audioCtx.pause();
      this.setData({
        isplay: false,
      });
    }else{
      audioCtx.play();
      audioCtx.onPlay(()=>{
        console.log(audioCtx.duration)//0
      })

      this.setData({
        isplay: true,
      });
    }
  },

  // 拖动进度条，到指定位置
  hanle_slider_change(e) {
    const position = e.detail.value
    audioCtx.seek(position)
  },
   // 进度条滑动
   handle_slider_move_start() {
    this.setData({
      is_moving_slider: true
    });
  },
  handle_slider_move_end() {
    this.setData({
      is_moving_slider: false
    });
  },
  // 时间格式化
  format: function(t) {
    let time = Math.floor(t / 60) >= 10 ? Math.floor(t / 60) : '0' + Math.floor(t / 60)
    t = time + ':' + ((t % 60) / 100).toFixed(2).slice(-2)
    return t
  },
  onUnload: function () {
    if(this.data.ishow){
      audioCtx.pause();
    }
  },
  onHide: function () {
    if(this.data.ishow){
      audioCtx.pause();
    }
    // 小程序初始化时清除缓存的页面ID
    try {
      wx.removeStorageSync('articleID')
    } catch (e) {
      // Do something when catch error
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    var articleID = wx.getStorageSync('articleID');
    if (articleID) {
      that.getContentByID(articleID, that);
    };
  
    if(this.data.ishow){
      audioCtx.play();
    }
  },
})




