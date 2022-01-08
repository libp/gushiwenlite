const audioCtx = wx.createInnerAudioContext();
Page({
  data: {
    page: 1,
    pageSize: 20,
    total:10,
    tableData: [],
    article: '',
    title: '',
    dynasty: '',
    author: '',
    ishow: true,
    isplay: false,
    id: '',
    audiourl: '',
    is_moving_slider: false,
    current_process:"",
    slider_value: "",
    total_process: "",
    slider_max: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.getContentByPage(that)
  },

  getContentByPage: function (that){
    wx.request({
      url: 'https://www.nichuiniu.cn/v1/gushiwen/selectByScores?pageNum=' + that.data.page + '&pageSize=' + that.data.pageSize,
      header: {
        'content-type': 'application/json',
        'dataType': 'json'
      },
      success: function (res) {
        console.log(res)
        that.setData({
          tableData: res.data.list,
          total: res.data.total,
          page: that.data.page + 1
        })
      }
    })
  },
  preview: function(e){
    wx.reLaunch({
      url: '../index/index'+'?id='+e.currentTarget.dataset.field,
    })
  },
  play: function(e){
    console.log('1111')
    console.log(e)
    this.getContentByID(res.id, that);
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
      audioCtx.pause()
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

  updateTime: function() {
    let that = this;
    setTimeout(function(){
      let duration = audioCtx.duration;
      if (duration == 0 || isNaN(duration)) {
        console.log(duration)
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
  // onUnload: function () {
  //   audioCtx.pause();
  // },
  // onHide: function () {
  //   audioCtx.pause();
  // },
  // /**
  //  * 生命周期函数--监听页面显示
  //  */
  // onShow: function () {
  //   audioCtx.play();
  // },
})