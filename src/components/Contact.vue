<template>
  <div>
    <HeaderEFTG ref="headerEFTG"></HeaderEFTG>
    <div class="container">
      <h2 class="mb-4">Contact</h2>
      <p>Feel free to contact us directly using this mailbox/email address: <a href="mailto:FISMA-EFTG-PROJECT@ec.europa.eu">FISMA-EFTG-PROJECT@ec.europa.eu</a></p>
      <p>Also, Slack (<a href="https://eftg.slack.com/">eftg.slack.com</a>)is the collaboration tool of choice to post your questions and engage with the development and business team, either using the existing channels/rooms or with direct messages as appropriate.</p>
    </div>
    <!--<FooterEFTG></FooterEFTG>-->
  </div>
</template>

<script>
import HeaderEFTG from "@/components/HeaderEFTG";
import FooterEFTG from "@/components/FooterEFTG";

export default {
  name: "Contact",
 
  components: {
    HeaderEFTG,
    FooterEFTG
  },
} 
</script>
