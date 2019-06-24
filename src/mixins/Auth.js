import axios from 'axios'
import Config from '@/config.js'
import router from '@/router.js'

export default {
  
  data: function(){
    return {
    }
  },
  
  methods: {

    async login(username, password) {
      if(!username && !password){
        var response = await axios.get(Config.SERVER_API + 'login')
        var user = this.setLoginUser(response.data)
        return user
      }

      var response = await axios.post(Config.SERVER_API + "login", {username, password})
      var user = this.setLoginUser(response.data)

      router.push(Config.PAGE_AFTER_LOGIN)
      return user
    },

    async logout() {
      await axios.get(Config.SERVER_API + "logout")
      console.log(this.$store.state.auth.username + " logout");

      this.$store.state.auth = { user: '', logged: false, imgUrl: '' }
      router.push(Config.PAGE_AFTER_LOGOUT)
    },

    setLoginUser(user){
      console.log('Logged in as '+user.username)      
      if(!user.imgUrl || user.imgUrl==='')
        user.imgUrl = "'https://steemitimages.com/DQmb2HNSGKN3pakguJ4ChCRjgkVuDN9WniFRPmrxoJ4sjR4'"
      else
        user.imgUrl = "'" + user.imgUrl + "'"
      user.logged = true
      this.$store.state.auth = user
      return user
    }
  }
}
