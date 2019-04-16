import Config from "@/config.js";

export default {
  getReputation: function(reputation) {
    var rep = parseInt(reputation);
    if (rep == 0) return 25;
    if (rep > 0) return Math.floor(9 * Math.log10(rep) - 56);
    else return Math.ceil(106 - 9 * Math.log10(-rep));
  },

  getTimestamp: function(created) {
    var t = new Date() - new Date(created + "Z");
    return this.textTimeAgo(t);
  },

  textTimeAgo: function(t) {
    if (t <= 1000) return "1 second ago";
    if (t < 60 * 1000) return (t / 1000).toFixed(0) + " seconds ago";
    if (t < 2 * 60 * 1000) return "1 minute ago";
    if (t < 60 * 60 * 1000) return (t / 1000 / 60).toFixed(0) + " minutes ago";
    if (t < 2 * 60 * 60 * 1000) return "1 hour ago";
    if (t < 24 * 60 * 60 * 1000)
      return (t / 1000 / 60 / 60).toFixed(0) + " hours ago";
    if (t < 2 * 24 * 60 * 60 * 1000) return "yesterday";
    if (t < 30 * 24 * 60 * 60 * 1000)
      return (t / 1000 / 60 / 60 / 24).toFixed(0) + " days ago";
    if (t < 2 * 30 * 24 * 60 * 60 * 1000) return "last month";
    if (t < 12 * 30 * 24 * 60 * 60 * 1000)
      return (t / 1000 / 60 / 60 / 24 / 30).toFixed(0) + " months ago";
    if (t < 2 * 12 * 30 * 24 * 60 * 60 * 1000) return "last year";
    return (t / 1000 / 60 / 60 / 24 / 30 / 12).toFixed(0) + " years ago";
  },

  extractUrlProfileImage: function(metadata) {
    if (
      typeof metadata.profile !== "undefined" &&
      typeof metadata.profile.profile_image !== "undefined"
    ) {
      var url = metadata.profile.profile_image;
      if (url.substring(0, 8) === "![image]") {
        return url.substring(9, url.length - 1);
      }
      return "'" + url + "'";
    }
    return "'https://steemitimages.com/DQmb2HNSGKN3pakguJ4ChCRjgkVuDN9WniFRPmrxoJ4sjR4'";
  },

  getVotingPower: function(account) {
    var voting_power = account.voting_power;
    var last_vote_time = new Date(account.last_vote_time + "Z");
    var elapsed_seconds = (new Date() - last_vote_time) / 1000;
    var regenerated_power = Math.round(
      (10000 * elapsed_seconds) / (5 * 24 * 60 * 60)
    );
    var current_power = Math.min(voting_power + regenerated_power, 10000);
    return current_power;
  },

  getInflationRate: function(block_num) {
    var start_inflation_rate = Config.STEEM_INFLATION_RATE_START_PERCENT;
    var inflation_rate_adjustment =
      block_num / Config.STEEM_INFLATION_NARROWING_PERIOD;
    var inflation_rate_floor = Config.STEEM_INFLATION_RATE_STOP_PERCENT;
    var current_inflation_rate = Math.max(
      start_inflation_rate - inflation_rate_adjustment,
      inflation_rate_floor
    );
    return parseInt(current_inflation_rate);
  },

  extractUrlCoverImage: function(metadata) {
    if (
      typeof metadata.profile !== "undefined" &&
      typeof metadata.profile.cover_image !== "undefined"
    ) {
      var url = metadata.profile.cover_image;
      if (url.substring(0, 8) == "![image]") {
        return url.substring(9, url.length - 1);
      }
      return url;
    }
    return "";
  },

  getQuery: function(p) {
    var path = p.split("?");
    var result = {};
    result.page = path[0];
    if (path.length > 1)
      result.params = JSON.parse(
        '{"' + path[1].replace(/\&/gi, '","').replace(/\=/gi, '":"') + '"}'
      );
    console.log("getQuery");
    console.log(document.location.search);
    console.log(path);
    console.log(result);
    return result;
  },

  dateToString: function(date) {
    return (
      this.pad0(date.getFullYear(), 4) +
      "-" +
      this.pad0(date.getMonth() + 1) +
      "-" +
      this.pad0(date.getDate()) +
      "T" +
      this.pad0(date.getHours()) +
      ":" +
      this.pad0(date.getMinutes()) +
      ":" +
      this.pad0(date.getSeconds())
    );
  },

  pad0: function(num, len) {
    var zeroString = "00000";
    if (!len) len = 2;
    return zeroString.substring((num + "").length, len) + num;
  },

  ddmmyyyytoDate(str) {
    var array = str.split("/");
    if (array.length !== 3) throw new Error("Invalid date format");
    var date = new Date(array[2] + "/" + array[1] + "/" + array[0]);
    if (
      this.pad0(date.getDate()) + "" !== array[0] ||
      this.pad0(date.getMonth() + 1) + "" !== array[1] ||
      this.pad0(date.getFullYear(), 4) + "" !== array[2]
    ) {
      throw new Error("Invalid date format");
    }
    return date;
  },
  datetoddmmyyyy(date) {
    return this.dateFormat(date)
  },
  
  dateFormat(date) {
    return (
      this.pad0(date.getDate()) +
      "/" +
      this.pad0(date.getMonth() + 1) +
      "/" +
      this.pad0(date.getFullYear(), 4)      
    );
  },

  isUpLetter: function(c) {
    var A = "A".charCodeAt(0);
    var Z = "Z".charCodeAt(0);
    var code = c.charCodeAt(0);
    return code >= A && code <= Z;
  },

  hasCountryCode: function(str) {
    return this.isUpLetter(str[0]) && this.isUpLetter(str[1]);
  },

  createPermLink: function(str, addRandom) {
    if (str === "") addRandom = true;
    if (addRandom)
      str =
        Math.random()
          .toString(36)
          .substring(7) +
        "-" +
        str;
    return str
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^0-9a-z-]/gi, "");
  },
  
  prettyFileSize: function(size) {
    if(size < 1024) return size+'Bytes'
    if(size < 1024 * 1024) return Math.round(size/1024)+'KB'
    if(size < 1024 * 1024 * 1024) return Math.round(size/1024/1024)+'MB'
    if(size < 1024 * 1024 * 1024 * 1024) return Math.round(size/1024/1024/1024)+'GB'
    if(size < 1024 * 1024 * 1024 * 1024 * 1024) return Math.round(size/1024/1024/1024)+'TB'
  }
};
