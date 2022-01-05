const app = getApp()

Page({
  data: {
    article: '',
    title: '',
    dynasty: '',
    author: '',
    ishow: true,
    isplay: false,
    playtext: '暂停',
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
    var that = this;
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
        isplay: false,
      });
    } else {
      this.setData({
        ishow: true,
        isplay: true,
        audiourl:  'https://www.nichuiniu.cn/mp3/' + res.data.audiourl
      });
    }

    this.audioCtx.src = this.data.audiourl;
    this.audioCtx.onTimeUpdate(() => {
      if (!this.data.is_moving_slider) {
        this.setData({
          slider_value: Math.floor(that.audioCtx.currentTime),
          current_process: that.format(that.audioCtx.currentTime),
        });
      }
    })
    this.audioCtx.onCanplay(this.updateTime)
    this.audioCtx.play()
  },

  updateTime: function() {
    let that = this;
    setTimeout(function(){
      let duration = that.audioCtx.duration;
      if (duration == 0 || isNaN(duration)) {
        console.log(duration)
        that.updateTime();
      } else {
        that.setData({
          slider_max: Math.floor(that.audioCtx.duration),
          total_process: that.format(that.audioCtx.duration)
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
  play: function (res) {
    if(this.data.isplay){
      this.audioCtx.pause();
      this.setData({
        isplay: false,
        playtext: "暂停",
      });
    }else{
      this.audioCtx.play();
      
      this.audioCtx.onPlay(()=>{
        console.log(this.audioCtx.duration)//0
      })

      this.setData({
        isplay: true,
        playtext: "播放",
      });
    }
  },

  // 拖动进度条，到指定位置
  hanle_slider_change(e) {
    const position = e.detail.value
    this.audioCtx.seek(position)
  },
  // 拖动进度条控件
  seekCurrentAudio(position) {
    // 更新进度条
    let that = this
    console.log(that.audioCtx.currentTime)
    

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
    this.audioCtx.destroy();
  }
})




