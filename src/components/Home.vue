<template>
  <div>
    <HeaderEFTG :showAuth="false" ref="headerEFTG"></HeaderEFTG>
    <div class="container">
      <h2 class="text-center mb-4">European Financial Transparency Gateway</h2>                            
      <div class="card-deck">
        <div class="card">
          <img class="card-img-top" src="">
          <div class="card-body row">
            <div class="col-4 text-center">
              <router-link to="/faq" class="text-primary"><font-awesome-icon icon="question-circle" size="4x"/></router-link>
            </div>
            <div class="col-8">
              <h5 class="card-title">FAQs</h5>
              <p class="card-text">Find out more about the Blockchain based EFTG project. Get more details about the existing functionalities.</p>
              <router-link to="/faq" class="btn btn-primary">Open</router-link>
            </div>        
          </div>
        </div>
        <div class="card">
          <img class="card-img-top" src="">
          <div class="card-body row">
            <div class="col-4 text-center">
              <router-link to="/oam-portal" class="text-primary"><font-awesome-icon icon="university" size="4x"/></router-link>
            </div>
            <div class="col-8">
              <h5 class="card-title">OAM Portal</h5>
              <p class="card-text">For Official Appointed Mechanism that handle the financial documents received from European companies.</p>
              <router-link to="/oam-portal" class="btn btn-primary">Open</router-link>
            </div>
            <div class="col-12 mt-2">
              <div class="card-body text-center bg-info">
              <font-awesome-icon icon="exclamation-triangle" size="2x" class="mr-2"/>Under development</div>
            </div>
          </div>
        </div>        
        <div class="card">
          <div class="card-body row">
            <div class="col-4 text-center">
              <router-link to="/search.html" class="text-primary"><font-awesome-icon icon="business-time" size="4x"/></router-link>              
            </div>
            <div class="col-8">
              <h5 class="card-title">Investor Portal</h5>
              <p class="card-text">For investor that wants to search details and financial data of the European companies.</p>
              <router-link to="/search.html" class="btn btn-primary">Open</router-link>              
            </div>
            <div class="col-12 mt-2">
              <div class="card-body text-center bg-info">
              <font-awesome-icon icon="exclamation-triangle" size="2x" class="mr-2"/>Under development</div>
            </div>
          </div>
        </div>                
      </div>      
      <p class="mt-4 text-justify">Aim of the EFTG Pilot Project consists in developing a Blockchain platform infrastructure technically enabling citizens and investors by giving them increased accessibility to public regulated information provided by the participating Officially Appointed Mechanisms (OAM). The EFTG Pilot Project also aims to provide search capability among real Member States' data, such as those from the Annual Financial Reports (AFR) in order to contribute to further integrated capital markets. EFTG is based on a new approach to build a distributed and decentralized platform system by interconnecting all the OAMs in Europe into a dedicated platform for sharing data instead of exchanging it, adding also a full traceability and ownership management of the submitted and consumed financial data.</p>      
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
