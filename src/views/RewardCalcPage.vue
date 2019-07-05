<template>
  <div>
    <HeaderEFTG ref="headerEFTG"></HeaderEFTG>
    <div class="container">
      <div class="row">
        <div class="col-md-3 mt-4" v-for="(param, index) in parameters">
          <div class="row">
            <div class="col-md-3 slidecontainer">
              <input type="range" min="0" :max="SLIDER_RESOLUTION" v-model="param.slider" class="slider" :id="'slider-'+param.name">
            </div>
            <div class="col-md-8">
              <div class="aacol-md-1"><strong>{{param.name}}</strong></div>
              <div v-if="typeof param.rshares    !== 'undefined'" class="aacol-md-2">Rshares: {{param.rshares}}</div>
              <div v-if="typeof param.steempower !== 'undefined'" class="aacol-md-2">Single vote of {{param.steempower}} SP</div>
              <div v-if="typeof param.claims     !== 'undefined'" class="aacol-md-2">Claims: {{param.claims}}</div>
              <div v-if="typeof param.total_wcur !== 'undefined'" class="aacol-md-2">Total cur: {{param.total_wcur}}</div>
              <div v-if="typeof param.payout     !== 'undefined'" class="aacol-md-2">Payout: {{param.payout}} STEEM (${{param.payout_sbd}})</div>
              <div v-if="typeof param.vote_value !== 'undefined'" class="aacol-md-2">Vote: {{param.vote_value}} STEEM (${{param.vote_value_sbd}})</div>
              <div v-if="typeof param.linear     !== 'undefined'" class="aacol-md-2">in rshares: {{param.linear}}</div>
              <div v-if="typeof param.no_linear  !== 'undefined'" class="aacol-md-2">in claims: {{param.no_linear}}</div>
              <div v-if="typeof param.ratio      !== 'undefined'" class="aacol-md-2">ratio: {{param.ratio}}</div>
            </div>
          </div>
          <input type="checkbox" class="form-check-input" v-model="param.fixed" @click="checkboxChange(param.name)">
        </div>
        <div class="col-md-3">
          <div>gain vote:</div><div><strong>{{k.v}}</strong> v</div>
          <div>Low R1 big S:</div><div><strong>{{k.lb}}</strong> v sqrt(sl) sqrt(R1/2e)</div>
          <div>Big R1 big S:</div><div><strong>{{k.bb}}</strong> v sqrt(sl) </div>
          <div>Low R1 low S:</div><div><strong>{{k.ll}}</strong> v </div>
          <div>Big R1 low S:</div><div><strong>{{k.bl}}</strong> v sqrt(sl) </div> 
        </div>
      </div>
      <div v-if="alert.info" class="alert alert-info" role="alert">{{alert.infoText}}</div>
      <div v-if="alert.success" class="alert alert-success" role="alert" v-html="alert.successText"></div>
      <div v-if="alert.danger"  class="alert alert-danger" role="alert">{{alert.dangerText}}</div>
    </div>    
  </div>
</template>

<script>
import HeaderEFTG from '@/components/HeaderEFTG'
import SteemClient from '@/mixins/SteemClient.js'

import Config from '@/config.js'
import Utils from '@/js/utils.js'
import ChainProperties from '@/mixins/ChainProperties.js'


export default {
  name: 'RewardCalcPage',
  
  data() {
    return {
      parameters: [
        {
          name: 'Rshares0',
          min: 7, max: 15, log: true, slider: 0, value: 0, fixed: false,
          rshares: 0, steempower: 0, claims: 0, total_wcur: 0, payout: 0, payout_sbd: 0
        },{
          name: 'Vote',
          min: 7, max: 14, log: true, slider: 0, value: 0, fixed: false,
          rshares: 0, steempower: 0, wcur: 0, vote_value: 0, vote_value_sbd: 0
        },{
          name: 'Rshares1',
          min: Math.log10(2e7), max: Math.log10(1.1e15), log: true, slider: 0, value: 0, fixed: false,
          rshares: 0, steempower: 0, claims: 0, total_wcur: 0, payout: 0, payout_sbd: 0
        },{
          name: 'RsharesTotal',
          min: Math.log10(2e7), max: Math.log10(1.1e19), log: true, slider: 0, value: 0, fixed: false,
          rshares: 0, steempower: 0, claims: 0, total_wcur: 0, payout: 0, payout_sbd: 0
        },{
          name: 'Scale',
          min: -2, max: 4, log: true, slider: 0, value: 0, fixed: false,
          linear: 0, no_linear: 0, ratio: 1
        },
      ],
      k: {
        v:  1,
        lb: 1,
        bb: 1,
        ll: 1,
        bl: 1
      },
      link_r1_rt: false,
      SLIDER_RESOLUTION: 1000,
      S: 2e12
    }
  },

  components: {
    HeaderEFTG
  },

  mixins: [
    ChainProperties,
    SteemClient
  ],

  created() {
    this.getChainProperties().then( ()=>{ this.initSliders() })
  },

  watch: {
    
  },

  methods: {
    initSliders() {
      this.parameters.forEach( (param)=>{ 
        this.handleInputSlider(param)
        param.value = param.slider * (param.max - param.min)/this.SLIDER_RESOLUTION + param.min
        if( param.log ) param.value = Math.pow(10, param.value)
      })
      for(var i in this.parameters) this.calcSliderValues(i)
    },
    
    handleInputSlider(p) {
      let self = this
      this.$nextTick( ()=>{            
        var slider = document.getElementById('slider-'+p.name)
        slider.oninput = function() { self.sliderOnChange(this.id, true) }
      })
    },
    
    sliderOnChange(inputId, calculateOthers = false) {
      var name = inputId.substring(7) // 'slider-name' take 'name'
      var index = this.parameters.findIndex(function(p){ return p.name === name })
      var param = this.parameters[index]
      param.value = param.slider * (param.max - param.min)/this.SLIDER_RESOLUTION + param.min
      if( param.log )
        param.value = Math.pow(10, param.value)

      this.calcValues(index)

      if(calculateOthers) this.updateParameters(name)
      this.hideDanger()
    },

    updateParameters(name) {
      var irs0 = this.parameters.findIndex( (p)=>{return p.name === 'Rshares0'     })
      var irs1 = this.parameters.findIndex( (p)=>{return p.name === 'Rshares1'     })
      var irst = this.parameters.findIndex( (p)=>{return p.name === 'RsharesTotal' })
      var iv   = this.parameters.findIndex( (p)=>{return p.name === 'Vote'         })
      var isca = this.parameters.findIndex( (p)=>{return p.name === 'Scale'        })

      var rs0 = this.parameters[irs0]
      var rs1 = this.parameters[irs1]
      var rst = this.parameters[irst]
      var v   = this.parameters[iv]
      var sca = this.parameters[isca]

      var scaleModified = false

      let self = this
      var modifyScale = function (){
        if(sca.fixed) self.showDanger('Scale is fixed')
        sca.value = rst.value / rs1.value
        self.calcSliderValues(isca)
        scaleModified = true
      }

      var modifyVote = function (){
        if(v.fixed) self.showDanger('Vote is fixed')
        v.value = rs1.value - rs0.value
        if(v.value < Math.pow(10,v.min)) {
          rs0.value += v.value - Math.pow(10,v.min)
          v.value   -= v.value - Math.pow(10,v.min)
          if(rs0.fixed) selfshowDanger('Rs0 is fixed')
        }else if(v.value > Math.pow(10,v.max)) {
          rs0.value += v.value - Math.pow(10,v.max)
          v.value   -= v.value - Math.pow(10,v.max)
          if(rs0.fixed) selfshowDanger('Rs0 is fixed')
        }
        self.calcSliderValues(irs0)
        self.calcSliderValues(iv)
      }

      var modifyRs0 = function (){
        if(rs0.fixed) self.showDanger('Rshares0 is fixed')
        rs0.value = rs1.value - v.value
        self.calcSliderValues(irs0)
      }

      var modifyRst = function (){
        if(rst.fixed) self.showDanger('RsharesTotal is fixed')
        rst.value = sca.value * rs1.value
        self.calcSliderValues(irst)
      }

      var modifyRs1 = function(type){
        if(rs1.fixed) self.showDanger('Rshares1 is fixed')
        if(type === 'scale')
          rs1.value = rst.value / sca.value
        else
          rs1.value = rs0.value + v.value
        self.calcSliderValues(irs1)
      }

      var modifyFormula1 = function(name){  // Rs1 = Rs0 + v
        switch(name){
          case 'Rshares0':
            if(rs1.fixed) modifyVote()
            else modifyRs1()
            break
          case 'Rshares1':
            if(v.fixed) modifyRs0()
            else modifyVote()
            break
          case 'Vote':
            if(rs1.fixed) modifyRs0()
            else modifyRs1()
            break
          default:
            break
        }
        self.calcValues(iv)
      }

      var modifyFormula2 = function(name){  // Rst = s * Rs1
        switch(name){
          case 'Rshares1':
            if(rst.fixed) modifyScale()
            else modifyRst()
            break
          case 'RsharesTotal':
            if(sca.fixed) modifyRs1('scale')
            else modifyScale()
            break
          case 'Scale':
            if(rst.fixed) modifyRs1('scale')
            else modifyRst()
            break
          default:
            break
        }
        self.calcValues(isca)
      }

      switch(name) {
        case 'Rshares0':
        case 'Rshares1':
        case 'Vote':
          modifyFormula1(name)
          modifyFormula2('Rshares1')
          break
        case 'RsharesTotal':
        case 'Scale':
          modifyFormula2(name)
          modifyFormula1('Rshares1')
          break
        default:
          break
      }


      /*switch(name) {
        case 'Rshares0':
          this.calcSliderValues(iv)
          if(!scaleModified) modifyScale()
        case 'Vote':
          rs1.value = rs0.value + v.value
          this.calcSliderValues(irs1)

          if(this.link_r1_rt) {
            if(rs1.value > rst.value){
              rst.value = rs1.value
              this.calcSliderValues(irst)
            }
          }
          if(!scaleModified) modifyScale()
 
          break
        case 'Scale':
          rst.value = sca.value * rs1.value
          this.calcSliderValues(irst)
          scaleModified = true
        case 'RsharesTotal':
          if(this.link_r1_rt) {
            if(rs1.value > rst.value){
              rs1.value = rst.value
              this.calcSliderValues(irs1)
            }
          }
          if(!scaleModified) modifyScale()
        case 'Rshares1':
          v.value = rs1.value - rs0.value
          if(v.value < Math.pow(10,v.min)) {
            rs0.value += v.value - Math.pow(10,v.min)
            v.value   -= v.value - Math.pow(10,v.min)
          }else if(v.value > Math.pow(10,v.max)) {
            rs0.value += v.value - Math.pow(10,v.max)
            v.value   -= v.value - Math.pow(10,v.max)
          }
          this.calcSliderValues(irs0)
          this.calcSliderValues(iv)
          if(this.link_r1_rt) {
            if(rs1.value > rst.value){
              rst.value = rs1.value
              this.calcSliderValues(irst)
            }
          }
          if(!scaleModified) modifyScale()
          break
        default:
          break
      }*/
      //if(!scaleModified) modifyScale()
      var curation = ( rs1.total_wcur - rs0.total_wcur ) / rst.total_wcur * rst.claims
      this.k.v = curation / v.rshares
      this.k.lb = this.k.v / Math.sqrt( sca.linear ) / Math.sqrt( rs1.rshares/2/this.S )
      this.k.bb = this.k.v / Math.sqrt( sca.linear ) * 2
      this.k.ll = this.k.v * 2
      this.k.bl = this.k.v / Math.sqrt( sca.linear ) * 4
      for(var i in this.k) this.k[i] = this.k[i].toFixed(4)
    },

    calcSliderValues(index) {
      this.calcSlider(index)
      this.calcValues(index)
    },

    calcSlider(index) {
      var param = this.parameters[index]
      var value = param.log ? Math.log10(param.value) : param.value
      param.slider = this.SLIDER_RESOLUTION * (value - param.min) / (param.max - param.min)      
    },

    calcValues(index) {
      var param = this.parameters[index]

      if(typeof param.rshares !== 'undefined')
        param.rshares = Math.round( param.value )
      if(typeof param.steempower !== 'undefined')
        param.steempower = ( this.steempower(param.rshares) ).toFixed(6)
      if(typeof param.claims !== 'undefined')
        param.claims = this.claims(param.rshares)
      if(typeof param.total_wcur !== 'undefined')
        param.total_wcur = this.weight_curation(param.rshares)
      if(typeof param.payout !== 'undefined')
        param.payout = ( param.claims * this.chain.reward_balance / this.chain.recent_claims ).toFixed(3)
      if(typeof param.payout_sbd !== 'undefined')
        param.payout_sbd = ( param.claims * this.chain.reward_balance / this.chain.recent_claims * this.chain.feed_price ).toFixed(3)
      if(typeof param.vote_value !== 'undefined')
        param.vote_value = ( this.calcVoteValue() ).toFixed(6)
      if(typeof param.vote_value_sbd !== 'undefined')
        param.vote_value_sbd = ( this.calcVoteValue() * this.chain.feed_price ).toFixed(3)
      if(typeof param.linear !== 'undefined')
        param.linear = ( this.calcLinearScale() ).toFixed(6)
      if(typeof param.no_linear !== 'undefined')
        param.no_linear = ( this.calcNoLinearScale() ).toFixed(6)
      if(typeof param.ratio !== 'undefined')
        param.ratio = ( this.calcNoLinearScale() / this.calcLinearScale() ).toFixed(4)

      this.$set(this.parameters, index, param)
    },

    calcVoteValue() {
      var rs0 = this.parameters.find( (p)=>{return p.name === 'Rshares0'     })
      var v   = this.parameters.find( (p)=>{return p.name === 'Vote'         })
      var delta_claims = this.claims(rs0.rshares + v.rshares) - this.claims(rs0.rshares)
      return delta_claims * this.chain.reward_balance / this.chain.recent_claims
    },

    calcLinearScale() {
      var rs1 = this.parameters.find( (p)=>{return p.name === 'Rshares1'     })
      var rst = this.parameters.find( (p)=>{return p.name === 'RsharesTotal' })
      return rst.rshares / rs1.rshares
    },

    calcNoLinearScale() {
      var rs1 = this.parameters.find( (p)=>{return p.name === 'Rshares1'     })
      var rst = this.parameters.find( (p)=>{return p.name === 'RsharesTotal' })
      return rst.claims / rs1.claims
    },

    steempower(rshares) {
      // 1 microvest = 1 rshares
      var steem_per_microvests = this.chain.steem_per_mvests / 1e12
      return steem_per_microvests * rshares / 0.02 
    },

    claims(rshares) {
      return Math.round( rshares*(rshares + 2*this.S)/(rshares + 4*this.S) )
    },

    weight_curation(rshares) {
      return Math.round( rshares / Math.sqrt( rshares + 2*this.S ) )
    },

    checkboxChange(name) {
      var irs0 = this.parameters.findIndex( (p)=>{return p.name === 'Rshares0'     })
      var irs1 = this.parameters.findIndex( (p)=>{return p.name === 'Rshares1'     })
      var irst = this.parameters.findIndex( (p)=>{return p.name === 'RsharesTotal' })
      var iv   = this.parameters.findIndex( (p)=>{return p.name === 'Vote'         })
      var isca = this.parameters.findIndex( (p)=>{return p.name === 'Scale'        })

      var rs0 = this.parameters[irs0]
      var rs1 = this.parameters[irs1]
      var rst = this.parameters[irst]
      var v   = this.parameters[iv]
      var sca = this.parameters[isca]

      switch(name) {
        case 'Rshares0':
          if(!rs0.fixed) return
          if(rs1.fixed && v.fixed)
            rs1.fixed = false
          break
        case 'Rshares1':
          if(!rs1.fixed) return
          if(rs0.fixed && v.fixed)
            v.fixed = false
          if(sca.fixed && rst.fixed)
            rst.fixed = false
          break
        case 'RsharesTotal':
          if(!rst.fixed) return
          if(rs1.fixed && sca.fixed)
            sca.fixed = false
          break
        case 'Vote':
          if(!v.fixed) return
          if(rs1.fixed && rs0.fixed)
            rs0.fixed = false
          break
        case 'Scale':
          if(!sca.fixed) return
          if(rst.fixed && rs1.fixed)
            rs1.fixed = false
          break
        default:
          break
      }
      for(var i in this.parameters) this.$set(this.parameters, i, this.parameters[i])
    }
  }
}
</script>

<style scoped>

.slider {
  -webkit-appearance: button;
  width: 200px;
  height: 6px;
  border-radius: 5px;
  background: #C3C3C3;
  outline: none;
  -webkit-transition: .2s;
  transition: opacity .2s;
  transform: translate(-83px, 90px) rotate(-90deg);
}

.slider:hover {
  opacity: 1;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #3c6fc7;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: #4CAF50;
  cursor: pointer;
}

</style>