<template>
  <div id="content">
    <h1>{{ $t("message.contractAddr") }}</h1>

    <div class="text">
      <p>
        <strong>NutboxSteem</strong> <br />
        {{ this.tsteem }}
      </p>

      <p>
        <strong>NutboxSbd</strong> <br />
        {{ this.tsbd }}
      </p>

      <p>
        <strong>NutboxPnut</strong> <br />
        {{ this.pnut }}
      </p>

      <p>
        <strong>PnutPool</strong> <br />
        {{ this.peanutsPool }}
      </p>

      <p>
        <strong>NutboxTsp</strong><br />
        {{ this.tsp }}
      </p>

      <p>
        <strong>TspPool</strong><br />
        {{ this.tspPool }}
      </p>

      <p>
        <strong>TspLpPool</strong><br />
        {{ this.tspLPPool }}
      </p>

      <p>
        <strong>{{ $t("message.attention") }}</strong> <br />
        {{ $t("message.attensionInfo") }}
      </p>

      <p>
        <strong>Tronscan：</strong> <br />

        <a target="_blank" href="https://tronscan.org/"
          >https://tronscan.org/</a
        >
      </p>
    </div>
  </div>
</template>

<script>
import { getAbiAndContractAddress } from "../../utils/chain/contract";
export default {
  name: "Contract",
  data() {
    return {
      peanutsPool: "",
      tsbd: "",
      tsteem: "",
      pnut: "",
      tsp: "",
      tspPool: "",
      tspLPPool: "",
    };
  },
  mounted() {
    let that = this;
    async function main() {
      that.peanutsPool = (await getAbiAndContractAddress("PNUT_POOL")).address;
      that.tsbd = (await getAbiAndContractAddress("SBD")).address;
      that.tsteem = (await getAbiAndContractAddress("STEEM")).address;
      that.pnut = (await getAbiAndContractAddress("PNUT")).address;
      that.tsp = (await getAbiAndContractAddress("TSP")).address;
      that.tspPool = (await getAbiAndContractAddress("TSP_POOL")).address;
      that.tspLPPool = (await getAbiAndContractAddress("TSP_LP_POOL")).address;
    }
    main();
  },
};
</script>

<style scoped>
h1 {
  font-size: 2rem;
  text-align: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ddd;
}
#content {
  color: rgba(55, 53, 58, 0.75);
  align: center;
  margin: 1rem auto;
  width: 60%;
  padding-bottom: 0.2rem;
}
.text {
  line-height: 1.8rem;
}

a {
  color: rgba(55, 53, 58, 0.75);
}

a:hover {
  color: darkcyan;
  text-decoration: none;
}

.btn-outline-primary {
  color: rgba(55, 53, 58, 0.75);
  border-color: rgba(55, 53, 58, 0.75);
}
.btn-outline-primary:hover {
  background-color: chocolate;
}
</style>

