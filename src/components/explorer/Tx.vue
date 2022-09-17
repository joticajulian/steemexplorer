<template>
    <div class="transaction">
      <HeaderEFTG ref="headerEFTG"></HeaderEFTG>
      <div class="container">
        <div v-if="this.exists">
          <div class="row">
            <h1 class="col-12">Transaction</h1>
            <h2 class="col-12">{{ $route.params.tx }}</h2>
            <trx :tx="tx" class="col-12"></trx>
            <h2 class="col-12">Raw</h2>
            <card-data :data="tx"></card-data>
          </div>
        </div>
        <div v-else>
          <div class="loader"></div>
        </div>
        <div v-if="alert.info" class="alert alert-info" role="alert">
          {{ alert.infoText }}
        </div>
        <div
          v-if="alert.success"
          class="alert alert-success"
          role="alert"
          v-html="alert.successText"
        ></div>
        <div v-if="alert.danger" class="alert alert-danger" role="alert">
          {{ alert.dangerText }}
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { Client } from "eftg-dsteem";
  import SteemClient from "@/mixins/SteemClient.js";
  import Config from "@/config.js";
  import CardData from "@/components/explorer/CardData";
  import Trx from "@/components/explorer/Trx";
  import HeaderEFTG from "@/components/HeaderEFTG";
  import ChainProperties from "@/mixins/ChainProperties.js";
  export default {
    name: "Tx",
    data() {
      return {
        tx: {},
        exists: false,
        EXPLORER: Config.EXPLORER,
      };
    },
    components: {
      HeaderEFTG,
      CardData,
      Trx,
    },
    mixins: [ChainProperties, SteemClient],
    created() {
      this.getChainProperties().then(() => {
        this.fetchData();
      });
    },
    watch: {
      $route: "fetchData",
    },
    methods: {
      async fetchData() {
        var result = await this.steem_database_call("get_transaction", [
          this.$route.params.tx,
        ]);
        this.tx = {
          operations: result.operations,
          transaction_id: this.$route.params.tx,
          blockNum:result.block_num,
          expiration:result.expiration
        };
        this.exists = true;
      },
    },
  };
  </script>
  
  <!-- Add "scoped" attribute to limit CSS to this component only -->
  <style scoped>
  </style>