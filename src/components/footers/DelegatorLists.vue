<template>
  <div id="content">
    <div class="checkbox">
      <p
        :class="[delegateSpFlag == 0 ? 'titleSelected' : 'titleUnSelected']"
        @click="delegateSpFlag = 0"
      >
        {{ $t("message.delegatorList") }}
      </p>
      <p
        :class="[delegateSpFlag == 1 ? 'titleSelected' : 'titleUnSelected']"
        @click="delegateSpFlag = 1"
      >
        {{ $t("message.tspDepositList") }}
      </p>
      <p
        :class="[delegateSpFlag == 2 ? 'titleSelected' : 'titleUnSelected']"
        @click="delegateSpFlag = 2"
      >
        {{ $t("message.tspLPDepositList") }}
      </p>
    </div>

    <div class="text" v-show="delegateSpFlag == 0">
      <b-table striped hover :items="items" :fields="fields"></b-table>
    </div>
    <div class="text" v-show="delegateSpFlag == 1">
      <b-table striped hover :items="tspItems" :fields="tspFields"></b-table>
    </div>
    <div class="text" v-show="delegateSpFlag == 2">
      <b-table
        striped
        hover
        :items="tspLPItems"
        :fields="tspLPFields"
      ></b-table>
    </div>

    <!-- 错误提示弹窗 -->
    <transition name="fade">
      <div class="mask" v-if="showMask" @click="hideMask">
        <div class="mask-box">
          <div class="mask-info">
            <div class="mask-info-text">
              {{ maskInfo }}
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import {
  getContractByDefaultAcc,
  getContract,
} from "../../utils/chain/contract";
import { vestsToSteem } from "../../utils/chain/steemOperations";
import { getAddress, intToAmount } from "../../utils/chain/tron";
import axios from 'axios'

export default {
  name: "DelegatorLists",
  data() {
    return {
      fields: ["No.","steemId", "tron", "delegatedSP"],
      tspFields: ["No.","tron", "depositedTsp"],
      tspLPFields: ["No.","tron", "depositedTspLP"],
      showMask: false,
      maskInfo: "",
      vestsToSp: "",
      lists: [],
      delegateSpFlag: 0,
      tspDepositList: [],
      tspLPDepositList: [],
    };
  },
  computed: {
    items() {
      return this.lists;
    },
    tspItems() {
      // return [{isActive: true, id: 1,  tron: 'Macdonald', depositedTsp: 20}]
      return this.tspDepositList;
    },
    tspLPItems() {
      return this.tspLPDepositList;
    },
  },
  methods: {
    async getSteemStates() {
      let a = await this.steem.api.getDynamicGlobalPropertiesAsync();
      this.vestsToSp =
        parseFloat(a.total_vesting_fund_steem) /
        parseFloat(a.total_vesting_shares);
    },
    async getDelegateList() {
      var list = await axios.get('/sp_delegate_list.json')
      if (list && list.data){
        var arr = [...list.data]
        this.lists = arr.sort((a, b) => {
          return parseFloat(b.amount) - parseFloat(a.amount)
        }).map((item, idx) => {
         return {
          'No.':idx+1,
          steemId: item.steemAccount,
          tron: item.tron,
          delegatedSP:item.amount
         }
       })
      }
    },
    async getTspDepositList() {
      var list = await axios.get('/tsp_delegate_list.json')
      if (list && list.data){
        var arr = [...list.data]
        this.tspDepositList = arr.sort((a, b) => {
          return parseFloat(b.amount) - parseFloat(a.amount)
        }).map((item, idx) => {
         return {
          'No.':idx+1,
          tron: item.tron,
          depositedTsp:item.amount
         }
       })
      }
    },
    async getTspLPDepositList() {
     var list = await axios.get('/tsp_lp_delegate_list.json')
      if (list && list.data){
        var arr = [...list.data]
        this.tspLPDepositList = arr.sort((a, b) => {
          return parseFloat(b.amount) - parseFloat(a.amount)
        }).map((item, idx) => {
         return {
          'No.':idx+1,
          tron: item.tron,
          depositedTspLP:item.amount
         }
       })
      }
    },
    hideMask() {
      this.showMask = false;
    },
  },
  mounted() {
    let that = this;
    async function main() {
      try {
        that.getDelegateList();
        that.getTspDepositList();
        that.getTspLPDepositList();
      } catch (e) {
        that.maskInfo = that.$t("error.tryrefreshpage") + "\n" + e;
        that.showMask = true;
      }
    }
    main();
  },
};
</script>

<style scoped>
.checkbox {
  display: flex;
  align-content: center;
  justify-content: space-evenly;
}
.titleSelected {
  color: rgb(30, 30, 30) !important;
  font-weight: 500 !important;
  font-size: 1.5em;
}

.titleUnSelected {
  color: darkgray !important;
  font-weight: 400 !important;
  font-size: 1.5em;
}
h1 {
  font-size: 2rem;
  text-align: center;
  padding-bottom: 1rem;
  /*border-bottom: 1px solid #ddd;*/
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

