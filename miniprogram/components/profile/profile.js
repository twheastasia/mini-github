const github = require('../../api/github.js')
const utils = require('../../utils/util.js')

Component({
  properties: {
    user: {
      type: Object,
      value: {},
      observer: function (user = {}) {
        const username = user.login
        if (!username) return
        if (user.type === 'User') {
          this.loadOrganizations()
        }
        const myself = (username === utils.getCurrentUser().login)
        this.setData({ isMyself: myself })
        if (myself) return
        this.checkFollowingState()
      }
    },
    theme: String
  },
  data: {
    isFollowing: false,
    loading: false,
    isMyself: false,
    orgs: []
  },
  methods: {
    onTapEmail: function() {
      this.copyToClipBoard(this.data.user.email)
    },

    onTapBlog: function() {
      this.copyToClipBoard(this.data.user.blog)
    },

    onTapAvatar: function() {
      wx.previewImage({
        urls: [this.data.user.avatar_url]
      })
    },

    copyToClipBoard: function(content) {
      wx.setClipboardData({
        data: content,
        success(res) {
          wx.showToast({
            title: '地址已复制',
          })
        }
      })
    },

    toFollowers: function() {
      const username = this.data.user.login
      wx.navigateTo({
        url: `/pages/user-list/user-list?username=${username}&followers=true`,
      })
    },

    toFollowing: function () {
      const username = this.data.user.login
      wx.navigateTo({
        url: `/pages/user-list/user-list?username=${username}&following=true`,
      })
    },

    toggleFollow: function () {
      const {
        isFollowing,
        user: {
          login: username
        }
      } = this.data
      if (!utils.ensureSignedIn()) return
      this.setData({ loading: true })
      if (isFollowing) {
        github.user().following(username).delete().then(success => {
          this.checkFollowingState()
        }).catch(() => {
          this.checkFollowingState()
        })
      } else {
        github.user().following(username).put().then(success => {
          this.checkFollowingState()
        }).catch(() => {
          this.checkFollowingState()
        })
      }
    },

    checkFollowingState: function () {
      const username = this.data.user.login
      this.setData({ loading: true })
      github.user().following(username).get().then(isFollowing => {
        this.setData({ isFollowing })
        this.setData({ loading: false })
      }).then(error => {
        this.setData({ loading: false })
      })
    },

    loadOrganizations: function () {
      const username = this.data.user.login
      github.users(username).orgs().then(({ orgs }) => {
        this.setData({
          orgs
        })
      }).catch(console.error)
    }
  }
})