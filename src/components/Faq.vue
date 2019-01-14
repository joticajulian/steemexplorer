<template>
  <div>
    <HeaderEFTG ref="headerEFTG"></HeaderEFTG>
    <div class="container">
      <h2 class="mb-4">Frequently Asked Questions - EFTG</h2>              
      <div role="tablist">
        <b-card no-body class="mb-1">
          <b-card-header header-tag="header" role="tab">
            <h5><a v-b-toggle.accordion1>1. What is the "EFTG"Pilot?</a></h5>
          </b-card-header>
          <b-collapse id="accordion1" accordion="accordion-faq" role="tabpanel">
            <b-card-body class="text-justify">
              <p>EFTG Pilot Project Background Information</p>
              <p>In order to promote cross-border investment and provide investors with easy access to regulated information, <strong>there is a need to develop a system that offers a single view of the information published by listed companies in EU</strong>, which is currently stored at different Member States' infrastructures.</p>
              <p>The Transparency Directive 2004/109/EC aims to two major achievements in this regard: a single European format to structure electronic documents, and a European Electronic Access Point (EEAP). Concerning the format, the Commission adopted in December 2018 a Regulation, which will impose (from 2020) the Xhtml format for all the annual financial reports published by companies, and for companies preparing consolidated financial statements, the structuring of around 700 data points using inline XBRL. As regards the EEAP,the Directorate General for Financial Stability, Financial Services and Capital Markets Union of the European Commission (EC/ FISMA) is developing a European Financial Transparency Gateway (EFTG) pilot project.</p>
              <ul>
                <li><strong>Phase I</strong> of the EFTG led to the development of a successful Proof of Concept (PoC) where the feasibility of using blockchain technologies got demonstrated.</li>
                <li><strong>Phase II</strong> of the EFTG Pilot Project consists in developing a blockchain platform infrastructure technically enabling citizens and investors by giving them increased accessibility to public regulated information provided by the participating Officially Appointed Mechanisms (OAM).</li>
              </ul>
              <p>The EFTG Pilot Project also aims to provide search capability among real Member States' data, such as those from the Annual Financial Reports (AFR) in order to help contribute to further integrated capital markets. The Blockchain Competence Centre (BLKCC) of the European Commission (EC Luxembourg) came up with a new approach to build a distributed and decentralized platform system tailored to the EFTG needs using a tailored version of the existing and successful Steem Blockchain by extending its capabilities and functionalities.</p>
              <p>In terms of benefits to end-users, the platform system should demonstrate that it will allow a cooperative approach of players involved, provide easier cross-border access to regulated information, lower the search time and reduce the information access costs while preserving the possibility to propose additional value-added data services.</p>
              <p>It is expected that with the blockchain architecture, investors will obtain faster results for the information searched because they will no longer have to go through 28 different portals but rather to a single entry point from a single distributed framework across the EU, and data ownership will be retained by their rightful data owners. In addition, the new system will be zero-downtime, fault-tolerant as well as DDoS-resistant.</p>
              <p>You can find out more about the scope of this project following this link: <a href="https://steemit.com/utopian-io/@sorin.cristescu/european-financial-transparency-gateway">European Financial Transparency Gateway</a></p>
            </b-card-body>
          </b-collapse>
        </b-card>
    
    
    
        <b-card no-body class="mb-1">
          <b-card-header header-tag="header" role="tab">
            <h5><a v-b-toggle.accordion2>2. What are the prospects of the EFTG to be in use in the future? Will there be any concrete outcomes? Will the project affect my organisation?</a></h5>
          </b-card-header>
          <b-collapse id="accordion2" accordion="accordion-faq" role="tabpanel">
            <b-card-body>
              <p>The Pilot project aims to demonstrate the feasibility and the benefits of using BlockChain for the shared storage and dissemination of regulated information among the OAMs. In the short term, it does not commit any party (OAM, EC, ESMA...) to pursue the construction of the EEAP on this a basis.</p>
              <p>This project could potentially guide the Union towards the implementation of a European Electronic Access Point (EEAP), as per respective legislation (Directive 2004/109/EC, Delegated Regulation (EU) 2016/14374).</p>
              <p>If retained as a viable solution for the EEAP, the EFTG will become a point of reference for the parties developing the EEAP and related legislation.</p>
              <p>Beyond their contribution in terms of data and technical support to the Pilot, the OAMs will be consulted in parallel on the prospects of a future deployment of the EFTG as the EEAP, including on governance issues.</p>
            </b-card-body>
          </b-collapse>
        </b-card>
    
    
    
        <b-card no-body class="mb-1">
          <b-card-header header-tag="header" role="tab">
            <h5><a v-b-toggle.accordion3>3. When will the EFTG Pilot be delivered?</a></h5>
          </b-card-header>
          <b-collapse id="accordion3" accordion="accordion-faq" role="tabpanel">
            <b-card-body>
              <p>The plan is to deliver the EFTG - Pilot by the end of Q1 2019.</p>
              <p>Following from phase 1 in which a Proof of Concept was successfully developed to demonstrate the feasibility of using Distributed Ledger Technologies (DLT) to interconnect (virtually) decentralized Officially Appointed Mechanisms' (OAM) databases, phase 2 of the EFTG project will pilot the integration of OAMs' systems using actual data using close to real life scenarios.</p>
              <p>As such, the EFTG pilot, if it proves successful, could represent the premise of the EEAP to be implemented by the European Securities and Markets Authority (ESMA). After this milestone, participating OAMs will be consulted to gather feedback and a discussion will take place in the presence of FISMA and ESMA whether the EFTG Pilot could be utilised as foundations for implementing the EEAP.</p>
            </b-card-body>
          </b-collapse>
        </b-card>
    
    
    
        <b-card no-body class="mb-1">
          <b-card-header header-tag="header" role="tab">
            <h5><a v-b-toggle.accordion4>4. Does my organisation need to participate in the project? What options are there?</a></h5>
          </b-card-header>
          <b-collapse id="accordion4" accordion="accordion-faq" role="tabpanel">
            <b-card-body>
              <p>OAMs are cordially invited to participate to the EFTG Pilot. Such involvement remains voluntary.</p>
              <p>During the Pilot, there are 4 options:</p>
              <ol>
                <li><strong>Observer:</strong>
                  <ul>
                    <li>This is a read-only role with no actual involvement and participation to the decisions related to theBlockChain-based solution design.
                    </li>
                  </ul>
                </li>
                <li><strong>Basic user level:</strong>
                  <ul>
                    <li>Access to a light client (basic web interface) will be providedto enable your organisation to upload manually some files/data onto the blockchain platform.
                    </li>
                    <li>DIGIT will by default run and maintain the BlockChain platform nodes on your behalf.
                    </li>
                  </ul>
                </li>
                <li><strong>Regular user level:</strong>
                  <ul>
                    <li>Opportunity for you to install and run within your systems one or several virtual machine nodes as part of the blockchain platform.
                    </li>
                    <li>Technical  assistance  will  be  provided  by  DIGIT to  help  your organisation install and run nodes (installation kit supplied by DIGIT to your organisation).
                    </li>
                    <li>A light client (basic interface) will be supplied to enable your organisation  to  upload  data  manually  onto  the  blockchain platform.
                    </li>
                    <li>Opportunity to be involved actively in the blockchain pilot project by  hosting  one  or  several  nodes - hereby  helping  with  the resilience, availability and security of the network.
                    </li>
                  </ul>
                </li>
                <li><strong>Advanced user level:</strong>
                  <ul>
                    <li>Opportunity for your organisation to install and run within your systems one or several virtual machines node as part of the blockchain platform.
                    </li>
                    <li>Such nodes would be of different types, whichwill contribute significantly to the functionality, resilience, availability and security of the network.
                    </li>
                    <li>Technical assistance will be provided by DIGIT to help install and run blockchain platform nodes (installation kit supplied to your organisation).
                    </li>
                    <li>Data integration will be based on provision by DIGIT of relevant programming  libraries  (python/.js).  This  would  enable  your organisationto become independent, hereby writing your own scripts  to  pull  data  from  current  databases,  and  creating blockchain transactions yourself.
                    </li>
                    <li>Beyond an active involvement in the blockchain pilot project by hosting one or several nodes, your organisation would have the additional opportunity to contribute further to shaping the Pilot in certain  areas - hereby helping  with  the  design, resilience, availability and security of the network.
                    </li>
                  </ul>
                </li>
              </ol>
            </b-card-body>
          </b-collapse>
        </b-card>
    
    
    
        <b-card no-body class="mb-1">
          <b-card-header header-tag="header" role="tab">
            <h5><a v-b-toggle.accordion5>5. How does the European Commission envisage that the OAMs collaborate and communicate with each otherwith the Commission or external contractors?</a></h5>
          </b-card-header>
          <b-collapse id="accordion5" accordion="accordion-faq" role="tabpanel">
            <b-card-body>
              <p>The European Commission (EC) envisages all actors (including OAMs) to collaborate using defined communicationchannels within a technology called <a href="https://slack.com">SLACK</a>.</p>
              <p>All active participants have been invited to join Slack (<a href="https://eftg.slack.com/">eftg.slack.com</a>). Three main channels have already been created:</p>
              <ul>
                <li><strong>#general</strong>
                  <p>This channel contains general information about the EFTG Pilot project that will be added iteratively as the project progresses e.g. how to access the EFTG web interface; how to use the pre-alpha EFTG front-end interface etc.</p>
                  <p>This channel will also be used for general communication and discussion about the pilot.</p>
                </li>
                <li><strong>#oam</strong>
                  <p>This channel is tailored for OAMs to dialogue between each other, as well as for communicating with the Commission concerning the conduct of the project.</p>
                </li>
                <li><strong>#random</strong>
                  <p>This channel is created for any other miscellaneous items that do not fall under the other two channels created so far i.e. any other topic, including out of project's scope.</p>
                </li>  
              </ul>
            </b-card-body>
          </b-collapse>
        </b-card>
    
    
    
        <b-card no-body class="mb-1">
          <b-card-header header-tag="header" role="tab">
            <h5><a v-b-toggle.accordion6>6. Should I have any further questions, whom may I contact?</a></h5>
          </b-card-header>
          <b-collapse id="accordion6" accordion="accordion-faq" role="tabpanel">
            <b-card-body>
              <p>Should you have any questions at this stage, please feel free to contact us directly using this functional mailbox/email address:
              <a href="mailto:FISMA-EFTG-PROJECT@ec.europa.eu">FISMA-EFTG-PROJECT@ec.europa.eu</a></p>
              <p>As before, Slack (<a href="https://eftg.slack.com/">eftg.slack.com</a>)is the collaboration tool of choice to post your questions and engage with thedevelopment and business team, either using the existing channels/rooms or with direct messages as appropriate.</p>
            </b-card-body>
          </b-collapse>
        </b-card>        
      </div> 
    </div>
    <!--<FooterEFTG></FooterEFTG>-->   
  </div>
</template>

<script>
import HeaderEFTG from "@/components/HeaderEFTG";
import FooterEFTG from "@/components/FooterEFTG";

export default {
  name: "Faq",
 
  components: {
    HeaderEFTG,
    FooterEFTG
  },
} 
</script> 