<template>
  <div class="beneficiaries">
    <div class="title"
      ><div class="beneficiary">Beneficiary</div
      ><div class="weight">Weight</div
      ><div class="value">Value</div      
    ></div>
    <div class="data" v-for="(b,key,index) in beneficiaries">
      <div class="row"
        ><div class="beneficiary">
          <a :href="'#/@'+b.account">@{{b.account}}</a>          
        </div
        ><div class="weight">{{b.bene_weight}}</div
        ><div class="value">{{b.bene_value}}</div        
      ></div>
    </div>
  </div>
</template>

<script>
import Config from '@/config.js'

export default {
  name: 'beneficiaries',
  props: {
    data:{
      type: Array,
      required: true
    },
    payout:{
      type: Object,
      required: true
    },    
  },
  data: function(){
    return {
      beneficiaries: []
    }
  },
  created: function(){
    this.computeBeneficiaries(this.data, this.payout);
  },
  
  methods: {
    computeBeneficiaries: function(data,payout){
      this.beneficiaries = this.data;
      var total_payout_sbd = parseFloat(payout.total);
      var total_payout_author_sbd = 0;
      
      if(payout.old_post){
       total_payout_author_sbd = parseFloat(payout.author);       
      }else{
       total_payout_author_sbd = 0.75 * total_payout_sbd;       
      }
      
      for(var i=0; i<this.beneficiaries.length ; i++){
        var b = this.beneficiaries[i];
        b.bene_weight = (b.weight/100).toFixed(2) + '%';
        b.bene_value = (total_payout_author_sbd * parseInt(b.weight) / 10000).toFixed(3) +' '+ Config.SBD;
        this.$set(this.beneficiaries, i, b)
      }
    },    
  },
}
</script>

<style scoped>
.title{
  display: block;
  width: 100%;
  border: solid 1px #8a8a8a;
  color: #a0a0a0;
  background-color: white;
  padding: 6px 10px;
}

.row{
  display: block;
  width: 100%;
  border: solid 1px #8a8a8a;
  border-top-width: 0px;
  background-color: white;
  padding: 6px 10px;
}

.beneficiary{
  width: 40%;
  display: inline-block;
}

.weight{
  width: 30%;
  display: inline-block;
  text-align: right;
}

.value{
  width: 30%;
  display: inline-block;
  text-align: right;
}

</style>