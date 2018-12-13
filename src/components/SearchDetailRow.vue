<template>
  <div @click="onClick">
    <div class="inline field">
      <label>NamIssuerName: </label>
      <span>{{rowData.issuer_name}}</span>
    </div>
    <div class="inline field">
      <label>HBS: </label>
      <span>{{rowData.home_member_state}}</span>
    </div>
  </div>
</template>