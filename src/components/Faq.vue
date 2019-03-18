<template>
  <div>
    <HeaderEFTG ref="headerEFTG"></HeaderEFTG>
    <div class="container">
      <div v-html="compiledMarkdown"></div>
    </div>
  </div>
</template>

<script>
import marked from 'marked'
import HeaderEFTG from '@/components/HeaderEFTG'
//import * as faq from '@/i18n/en/faq.md'
import faq from 'raw-loader!@/i18n/en/faq.md'
import fs from 'fs'

export default {
  name: "Faq",
  
  data() {
    return {
      compiledMarkdown: ''
    }
  },

  created() {
    this.compiledMarkdown = marked(faq)
  },
 
  components: {
    HeaderEFTG
  },
} 
</script> 