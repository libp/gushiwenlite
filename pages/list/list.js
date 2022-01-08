const audioCtx = wx.createInnerAudioContext();
Page({
  data: {
    page: 1,
    pageSize: 20,
    total:10,
    tableData: [],
    article: '',
    title: '暂无播放',
    dynasty: '',
    author: '',
    ishow: true,
    isplay: false,
    id: '',
    checkid: 0,
    audiourl: '',
    is_moving_slider: false,
    current_process:"00:00",
    slider_value: "0",
    total_process: "--:--",
    slider_max: "100",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this;
    this.getContentByPage(that)
  },

  getContentByPage: function (that){
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: 'https://www.nichuiniu.cn/v1/gushiwen/selectByScores?pageNum=' + that.data.page + '&pageSize=' + that.data.pageSize,
      header: {
        'content-type': 'application/json',
        'dataType': 'json'
      },
      success: function (res) {
        let tableData = res.data.list
        for (let i of tableData) {
          if (i.audiourl == null || i.audiourl === '') {
            i.audiourl = false
          } else {
            i.audiourl = 'https://www.nichuiniu.cn/mp3/' + i.audiourl
          }
          i.playstatus = false
        }
        tableData = that.data.tableData.concat(tableData)
        console.log(tableData)
        that.setData({
          tableData: tableData,
          total: res.data.total,
          page: that.data.page + 1
        })
        wx.hideLoading()
      }
    })
  },
  preview: function(e){
    //relaunch 的问题在于其他页面都会被关闭
    // wx.reLaunch({
    //   url: '../index/index'+'?id='+e.currentTarget.dataset.field,
    // })
    //通过缓存数据在本地的方式解决
    try {
      wx.setStorageSync('articleID', e.currentTarget.dataset.field)
    } catch (e) { }
    wx.switchTab({
      url: '../index/index'
    })
  },

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

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    this.getContentByPage(that)
  },

  play: function (e) {
    let that = this
    let checkid = e.currentTarget.dataset.id
    let title = e.currentTarget.dataset.title
    if (this.data.checkid == checkid){
      this.setData({
        checkid: 0,
      });
    }else{
      this.setData({
        checkid: e.currentTarget.dataset.id,
        title: title
      });
    }
    
    if(this.data.isplay && this.data.checkid != checkid){
      audioCtx.pause();
      this.setData({
        isplay: false,
      });
    }else{
      audioCtx.src = e.currentTarget.dataset.field;
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
    audioCtx.pause();
  },
  onHide: function () {
    audioCtx.pause();
  },
  // /**
  //  * 生命周期函数--监听页面显示
  //  */
  // onShow: function () {
  //   audioCtx.play();
  // },
})