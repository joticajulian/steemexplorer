import axios from 'axios'
import Config from '@/config.js'
import Utils from '@/js/utils.js'
import router from '@/router.js'

export default {
  
  data: function(){
    return {
      auth: {
        user: "",
        logged: false,
        imgUrl: "",
        keys: {
          owner: null,
          active: null,
          posting: null,
          memo: null
        }
      },
    }
  },
  
  methods: {

    async login(_username, _password) {
      if(!_username && !_password){
        var response = await axios.get(Config.SERVER_API + 'login')
        console.log("Logged in")
        var user = response.data
        user = this.handleImgUrl(user)
        user.logged = true
        this.$store.state.auth = user
        return user
      }

      let data = {
        username: _username,
        password: _password
      }
      var auth = {}

      var response = await axios.post(Config.SERVER_API + "login", data)
      console.log("Logged in")
      var user = response.data
      user = this.handleImgUrl(user)
      user.logged = true
      this.$store.state.auth = user

      router.push("/keys") //todo: handle type
      return user
    },

    handleImgUrl(user){
      if(!user) throw new Error('No user defined')
      if(!user.imgUrl || user.imgUrl==='')
        user.imgUrl = "'https://steemitimages.com/DQmb2HNSGKN3pakguJ4ChCRjgkVuDN9WniFRPmrxoJ4sjR4'"
      else
        user.imgUrl = "'" + response.data.user.imgUrl + "'"
      return user
    }
  }
}
