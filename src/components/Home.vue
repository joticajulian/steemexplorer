<template>
  <div>
    <HeaderEFTG :showAuth="false" ref="headerEFTG"></HeaderEFTG>
    <div class="container">
      <h2 class="text-center mb-4">European Financial Transparency Gateway</h2>                            
      <div class="card-deck">
        <div class="card">
          <img class="card-img-top" src="">
          <div class="card-body2 row">
            <div class="col-4 text-center">
              <router-link to="/faq" class="text-primary"><font-awesome-icon icon="question-circle" size="4x"/></router-link>
            </div>
            <div class="col-8">
              <h5 class="card-title">FAQs</h5>
              <p class="card-text2">Find out more about the Blockchain based EFTG project. Get more details about the existing functionalities.</p>
              <router-link to="/faq" class="btn btn-primary">Open</router-link>
            </div>        
          </div>
        </div>
        <div class="card">
          <img class="card-img-top" src="">
          <div class="card-body2 row">
            <div class="col-4 text-center">
              <router-link to="/oam-portal" class="text-primary"><font-awesome-icon icon="university" size="4x"/></router-link>
            </div>
            <div class="col-8">
              <h5 class="card-title">OAM Portal</h5>
              <p class="card-text2">For Official Appointed Mechanism that handle the financial documents received from European companies.</p>
              <router-link to="/oam-portal" class="btn btn-primary">Open</router-link>
            </div>
          </div>
        </div>        
        <div class="card">
          <div class="card-body2 row">
            <div class="col-4 text-center">
              <router-link to="/search.html" class="text-primary"><font-awesome-icon icon="business-time" size="4x"/></router-link>              
            </div>
            <div class="col-8">
              <h5 class="card-title">Investor Portal</h5>
              <p class="card-text2">For investor that wants to search details and financial data of the European companies.</p>
              <router-link to="/search.html" class="btn btn-primary">Open</router-link>              
            </div>
          </div>
        </div>                
      </div>      
      <p class="mt-4 text-justify">In order to promote cross-border investment and provide investors with easy access to regulated financial information of companies listed on the European Union's (EU) regulated markets, the European Commission (EC) is developing a platform that offers a single view for such information currently stored within different Member States' infrastructures. Following a successful Proof of Concept (PoC) using Blockchain technology, the EC is launching the European Financial Transparency Gateway (EFTG) Pilot Project within the framework of the Capital Market Union and the legal obligations of the Directive 2013/50/EC.</p>
      <p class="text-justify">EFTG Pilot Project is based on a new approach to build a distributed and decentralized system by interconnecting the OAMs (Officially Appointed Mechanisms) in Europe into a dedicated platform for sharing data instead of exchanging it, offering full traceability and ownership management of both submitted and consumed financial data.</p>
      <p class="text-justify">The goal of the EFTG Pilot Project consists of developing a Blockchain platform infrastructure, technically enabling citizens and investors by giving them increased access to public regulated information provided by the participating OAMs.</p>
      <p class="text-justify">The EFTG Project is the first Blockchain-based pilot in Europe, live and publicly available, that on-board real member in the network and shares real financial data from the Member States.</p>
    </div>            
  </div>
</template>

<script>
import HeaderEFTG from "@/components/HeaderEFTG";

export default {
  name: "Home",
  
  components: {
    HeaderEFTG
  },
} 
</script>
