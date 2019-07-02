<template>
  <div>
    <HeaderEFTG ref="headerEFTG"></HeaderEFTG>
    <div class="container">
      <h2 class="mb-4">{{title}}</h2>
      <div role="tablist">
        <b-card no-body class="mb-1" v-for="(question, index) in questions">
          <b-card-header header-tag="header" role="tab">
            <h5><a v-b-toggle="'accordion'+index">{{question.title}}</a></h5>
          </b-card-header>
          <b-collapse :id="'accordion'+index" accordion="accordion-faq" role="tabpanel">
            <b-card-body class="text-justify" v-html="question.content">
            </b-card-body>
          </b-collapse>
        </b-card>
      </div>
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
      title: 'Frequently Asked Questions - EFTG',
      questions: {}
    }
  },

  created() {
    var compiledMarkdown = '<document>'+ marked(faq) +'</document>'
    var parser = new DOMParser()
    var xmlDoc = parser.parseFromString(compiledMarkdown,'text/xml').children[0]

    var q = -1
    for(var i=0 ; i<xmlDoc.children.length ; i++) {
      var el = xmlDoc.children[i]
      if(this.getType(el) === 'toc') {
        this.title = el.textContent
        continue
      }
      if(this.getType(el) === 'question') {
        q++
        this.questions[q] = {}
        this.questions[q].title = el.textContent
        this.questions[q].content = ''
        continue
      }
      if(q >= 0) {
        this.questions[q].content += (new XMLSerializer()).serializeToString(el)
      }
    }
  },
 
  components: {
    HeaderEFTG
  },

  methods: {
    getType(el) {
      for(var i in el.attributes) {
        var attr = el.attributes[i]
        if(attr.name === 'type') return attr.value
      }
      for(var i in el.children) {
        var type = this.getType( el.children[i] )
        if(type) return type
      }
      return null
    },

    getText(el) {
      
    }
  }
} 
</script> 