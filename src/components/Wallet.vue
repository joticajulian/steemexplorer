<template>
    <div class="container">
        <h2>Wallet page</h2>
        <hr />

        You can access your keys here
 
        <hr />

        <h3>Enter your username and Serey key below</h3>

        <div class="container">
            <div class="row">
                <div class="column">
                    <label>Username</label>
                    <br>
                    <input v-model="username" id="username" type="text">
                </div>
            </div>
            <div class="row">
                <div class="column">
                    <label>Owner Key</label>
                    <br>
                    <input v-model="ownerkey" id="owner_key" type="password">
                </div>  
            </div>
            <br />
            <div class="row">
                <div class="column">
                    <button v-on:click="checkPass">Submit</button>
                </div>
            </div>
        </div>

    </div>
</template>
  
<script>
import Config from '@/config.js'
import Utils from '@/js/utils.js'
import ChainProperties from '@/mixins/ChainProperties.js'

import * as sereyjs from '@sereynetwork/sereyjs';
sereyjs.api.setOptions({ url: 'wss://api.serey.io' }); // assuming websocket is working at ws.golos.io
sereyjs.config.set('address_prefix','SRY');

import { PrivateKey } from 'eftg-dsteem'

export default {
    name: 'wallets',

    data() {
        return {
            username: '',
            ownerkey: '',
            EXPLORER: Config.EXPLORER
        }
    },

    mixins: [
        ChainProperties,
    ],

    // created() {
    //     this.getChainProperties()
    // },

    // computed: {
    //     votes: function () {
    //         if (Config.HARDFORK < 21) return this.votesLinear()
    //         else return this.votesConvergentLinear()
    //     }
    // },
    methods: {
        checkPass: function() {
            // console.log(event);
            console.log(this.username)
            console.log(this.ownerkey);

            // const key2 = PrivateKey.fromString(this.ownerkey).toString();
            // const key = PrivateKey.fromLogin(this.username, this.ownerkey, 'active').toString();
            // console.log(key);
            // console.log(key2);

            const key = sereyjs.auth.toWif(this.username, this.ownerkey, 'active').toString();
            console.log('key', key)

            const key2 = sereyjs.auth.toWif(this.username, this.ownerkey, 'owner').toString();
            console.log('key2', key2)
        },

        v() { return 1},

        //  vote()
    },
}
</script>
  
<style scoped>
.title {
    width: 100%;
    border: solid 1px #8a8a8a;
    color: #a0a0a0;
    background-color: white;
    padding: 6px 10px;
}

.data {
    width: 100%;
    border: solid 1px #8a8a8a;
    border-top-width: 0px;
    background-color: white;
    padding: 6px 10px;
}

.voter {
    width: 25%;
    display: inline-block;
}

.reputation {
    font-size: 0.9rem
}

.weight {
    width: 18.75%;
    display: inline-block;
    text-align: right;
}

.value {
    width: 18.75%;
    display: inline-block;
    text-align: right;
}

.curation {
    width: 18.75%;
    display: inline-block;
    text-align: right;
}

.time {
    width: 18.75%;
    display: inline-block;
    font-size: 0.8rem;
    text-align: right;
}
</style>