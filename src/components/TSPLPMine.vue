<template>
  <div>
    <div class="delegate">
      <!--TSP LP挖矿-->
      <div class="delegatetext round-box">
        < {{ $t("message.yourdata") }} > <br />
        {{ $t("tsp.tspLPBalance") }}: {{ balanceOfTSPLP }} TSP-LP <br />
        {{ $t("tsp.yourTSPLPAmount") }}： {{ minedTspLP }} TSP-LP<br />
        {{ $t("message.pnutbalance") }}： {{ nutBalanceOf }} PNUT<br />
      </div>

      <!--矿池数据-->
      <div class="delegatetext round-box">
        < {{ $t("message.miningpooldata") }} > <br />
        {{ $t("message.sptotaldelegate") }}： {{ totalDepositedSP }} SP<br />
        {{ $t("message.totalpnut") }}： {{ totalPendingPeanuts }} PNUT<br />
        {{ $t("message.rewardperblock") }}： {{ rewardsPerBlock }} PNUT<br />
        {{ $t("message.apy") }}： {{ apy }} %<br />
      </div>
      <!-- 交易对池数据 -->
      <!-- <div class="delegatetext round-box">
              < {{ $t('tsp.LPData') }} > <br>
              {{ $t('tsp.totalLP') }}：{{ totalLP | formatAmount }} TSP-LP <br>
              {{ $t('tsp.totalTSP') }}：{{ totalTSP | formatAmount }} TSP <br>
            </div> -->
      <hr />
      <!--<div >-->
      <div v-if="minedTspLP2 <= 0">
        <div class="round-box">
          <div class="round-box-title-container">
            <p class="box-title">
              {{ $t("message.input") }}
            </p>
            <p class="box-title">
              {{ $t("tsp.tspLPBalance") }}：{{ balanceOfTSPLP }}
            </p>
          </div>
          <div class="round-box-content-container">
            <input
              class="mb-2 mr-sm-2 mb-sm-0 user input"
              :class="checkFlag ? 'isok' : 'isfalse'"
              placeholder="0.0"
              v-model="mineAmount"
              @keyup="checkMineAmount"
              type="number"
              inputmode="decimal"
              pattern="^[0-9]*[.,]?[0-9]*$"
              spellcheck="false"
              value
            />
            <button id="maxBtn" @click="fillMaxAmount">Max</button>
          </div>
        </div>

        <div class="confirm-box" style="margin-bottom: 10px">
          <button
            class="confirm-btn"
            @click="approve"
            :disabled="!checkApproveFlag"
          >
            {{ $t("tsp.approveNutbox") }}
          </button>
          <button class="confirm-btn" @click="mine" :disabled="!canMineFlag">
            {{ $t("tsp.confirmDeposit") }}
          </button>
        </div>
      </div>

      <!--已代理：-->
      <div v-if="minedTspLP2 > 0">
        <!-- 增加、减少、取消代理 -->
        <div class="confirm-box">
          <button
            class="confirm-btn"
            @click="(delegateOpt = 1), (showDelegateMask = true)"
            style="margin-right: 30px"
            :disabled="isLoading"
          >
            {{ $t("tsp.addTspLPDeposit") }}
          </button>
          <button
            class="confirm-btn"
            @click="(delegateOpt = 2), (showDelegateMask = true)"
            style="margin-right: 30px"
            :disabled="isLoading"
          >
            {{ $t("tsp.minusTspLPDeposit") }}
          </button>
          <button
            class="confirm-btn"
            @click="(delegateOpt = 0), (showDelegateMask = true)"
            :disabled="isLoading"
          >
            {{ $t("tsp.cancelTspLPDeposit") }}
          </button>
        </div>

        <!-- PEANUTS代理收益 -->
        <div class="round-box">
          <div class="round-box-content-container">
            <span>
              {{ $t("message.pnutprofits") }}
            </span>
            <span style="color: darkred">
              <strong>{{ pendingPnut }} </strong>
            </span>
          </div>
        </div>

        <!-- 提现按钮 -->
        <div class="confirm-box">
          <button
            class="confirm-btn"
            @click="withdrawPeanuts"
            :disabled="isLoading"
          >
            {{ $t("message.withdraw") }}
          </button>
        </div>
      </div>
    </div>
    <!-- 增加或减少TSP存放弹窗 -->
    <transition name="fade">
      <ChangeTSPLPDepositMask
        :changeDegate="delegateOpt"
        :balanceOfTSPLP="balanceOfTSPLP"
        :balanceOfTSPLP2="balanceOfTSPLP2"
        :balanceOfDelegate="minedTspLP"
        :balanceOfDelegate2="minedTspLP2"
        :addr="addr"
        v-if="showDelegateMask"
        @hideMask="showDelegateMask = false"
      >
      </ChangeTSPLPDepositMask>
    </transition>

    <!--加载动画-->
    <transition name="fade">
      <SmallLoading v-if="isLoading"></SmallLoading>
    </transition>
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
import SmallLoading from "./SmallLoading";
import ChangeTSPLPDepositMask from "./ChangeTSPLPDepositMask";
import {
  getAbiAndContractAddress,
  getContract,
} from "../utils/chain/contract.js";

import {
  isTransactionSuccess,
  isInsufficientEnerge,
  getBalanceOfToken,
  getSupplyOfToken,
  amountToInt,
  intToAmount,
  getTronLink,
  contractConfig
} from "../utils/chain/tron.js";

import { TSP_LP_TOKEN_ADDRESS, TSP_TRX_CONTRACT_ADDRESS } from "../const.js";

export default {
  name: "TSPLPMine",
  props: [
    "totalDepositedSP",
    "totalDepositedSP2",
    "totalPendingPeanuts",
    "nutBalanceOf",
    "nutBalanceOf2",
    "rewardsPerBlock",
    "addr",
    "apy",
  ],
  data() {
    return {
      tronlinkFlag: true,

      totalLP: "",
      totalTSP: "",

      isLoading: true,

      balanceOfTSPLP: "",
      balanceOfTSPLP2: "",

      minedTspLP: "",
      minedTspLP2: "",

      checkFlag: true,
      checkApproveFlag: false,
      canMineFlag: false,
      mineAmount: "",

      showMask: false,
      maskInfo: "",
      showDelegateMask: false,
      delegateOpt: 1,

      pendingPnut: "",
      pendingPnut2: "",
    };
  },
  methods: {
    checkMineAmount() {
      let reg = /^\d+(\.\d+)?$/;
      let res = reg.test(this.mineAmount);
      let res1 = false;
      if (parseFloat(this.mineAmount) >= 1) {
        res1 = true;
      }
      //代理量应小于TSP量
      let res2 =
        parseFloat(this.mineAmount) <= parseFloat(this.balanceOfTSPLP2);
      this.checkFlag = this.checkApproveFlag = res && res1 && res2;
      this.canMineFlag = false;
    },

    async getTSPTRXPoolInfo() {
      // 获取TSP_LP总量
      let totalTSPLP = await getSupplyOfToken(TSP_LP_TOKEN_ADDRESS);
      this.totalLP = intToAmount(totalTSPLP);
      // 获取池中TSP总量
      let tspAddr = (await getAbiAndContractAddress("TSP")).address;
      let TspInSwapPool = await getBalanceOfToken(
        tspAddr,
        TSP_TRX_CONTRACT_ADDRESS
      );
      this.totalTSP = intToAmount(TspInSwapPool);
    },

    async getTSPLPBalance() {
      let poolInstance = await getContract("TSP_LP_POOL");
      let addr = this.addr;
      if (!poolInstance || !poolInstance.delegators) {
        await this.getTspLPPoolInstance();
      }
      let delegator = await poolInstance.delegators(addr).call();
      let tsplp = intToAmount(delegator.tspLPAmount);
      this.minedTspLP = this.formatData(tsplp);
      this.minedTspLP2 = tsplp;

      let tspAddr = TSP_LP_TOKEN_ADDRESS;
      let tsplpBalance = await getBalanceOfToken(tspAddr, addr);

      this.balanceOfTSPLP2 = intToAmount(tsplpBalance);
      this.balanceOfTSPLP = this.formatData(this.balanceOfTSPLP2);
    },
    fillMaxAmount() {
      this.mineAmount = this.balanceOfTSPLP2;
      this.checkMineAmount();
    },
    async approve() {
      try {
        this.isLoading = true;
        this.checkApproveFlag = false;
        let addr = this.addr;
        let b = parseFloat(this.mineAmount);
        let value = amountToInt(b);
        let tspLPPoolAddr = (await getAbiAndContractAddress("TSP_LP_POOL"))
          .address;
        let tronLink = await getTronLink();
        let params = [
          { type: "address", value: tspLPPoolAddr },
          { type: "uint256", value: value },
        ];
        // 创建交易
        let approve = await tronLink.transactionBuilder.triggerSmartContract(
          TSP_LP_TOKEN_ADDRESS,
          "approve(address,uint256)",
          contractConfig,
          params,
          addr
        );
        if (!approve || approve["result"]["result"] !== true) {
          this.checkMineAmount();
          alert("Approve fail");
          return;
        }
        // 签名交易
        let signedTx = await tronLink.trx.sign(approve["transaction"]);
        // 广播交易
        let broastTx = await tronLink.trx.sendRawTransaction(signedTx);
        if (
          broastTx &&
          broastTx["txid"] &&
          (await isTransactionSuccess(broastTx["txid"]))
        ) {
          this.checkApproveFlag = false;
          this.canMineFlag = true;
        } else {
          if (await isInsufficientEnerge(broastTx["txid"])) {
            alert(
              this.$t("error.error") +
                "\n" +
                this.$t("error.insufficientEnerge")
            );
          } else {
            alert(this.$t("error.error") + "\n" + this.$t("error.approveFail"));
          }
          this.checkMineAmount();
        }
      } catch (e) {
        this.checkMineAmount();
        alert(this.$t("error.error") + "\n" + e);
      } finally {
        this.isLoading = false;
      }
    },
    async mine() {
      try {
        this.isLoading = true;
        this.checkApproveFlag = false;
        this.canMineFlag = false;
        let addr = this.addr;
        //开始挖矿
        let tspLPPool = await getContract("TSP_LP_POOL");
        let b = parseFloat(this.mineAmount);
        let value = amountToInt(b);
        // commit deposit
        let res = await tspLPPool.deposit(value).send(contractConfig);
        if (res && (await isTransactionSuccess(res))) {
          //直接更新数字
          this.minedTspLP2 = parseFloat(this.minedTspLP) + b;
          this.minedTspLP = parseFloat(this.minedTspLP2).toFixed(3);
          this.balanceOfTSPLP2 = parseFloat(this.balanceOfTSPLP2) - b;
          this.balanceOfTSPLP = parseFloat(this.balanceOfTSPLP2).toFixed(3);
        } else {
          if (await isInsufficientEnerge(res)) {
            alert(
              this.$t("error.error") +
                "\n" +
                this.$t("error.insufficientEnerge")
            );
          } else {
            alert(this.$t("error.error") + "\n" + this.$t("error.depositFail"));
          }
          this.checkMineAmount();
        }
      } catch (e) {
        this.checkMineAmount();
        alert(this.$t("error.error") + "\n" + e);
      } finally {
        this.isLoading = false;
      }
    },
    async withdrawPeanuts() {
      try {
        this.isLoading = true;
        let instance = await getContract("TSP_LP_POOL");
        let res = await instance
          .withdrawPeanuts()
          .send(contractConfig);
        if (res && (await isTransactionSuccess(res))) {
          await this.$parent.getOtherBalance();
        } else {
          if (await isInsufficientEnerge(res)) {
            alert(
              this.$t("error.error") +
                "\n" +
                this.$t("error.insufficientEnerge")
            );
          } else {
            alert(
              this.$t("error.error") + "\n" + this.$t("error.withdrawFail")
            );
          }
        }
      } catch (e) {
        alert(this.$t("error.error") + "\n" + e);
      } finally {
        this.isLoading = false;
      }
    },
    hideMask() {
      this.showMask = false;
    },
    async getPendingPnut() {
      let tspLPPool = await getContract("TSP_LP_POOL");
      // console.log(235236,tspPool)
      let s = await tspLPPool.getPendingPeanuts().call();
      this.pendingPnut = intToAmount(s);
      //  console.log("getPendingPnut", this.pendingPnut)
      // let p = await tspLPPool.shareAcc().call()
      // console.log("shareAcc", p*1)

      // let p2 = await tspLPPool.totalDepositedTSPLP().call()
      // console.log("totalDepositedTSPLP", p2*1)  //totalDepositedSP
    },
    async update() {
      try {
        // this.getTSPTRXPoolInfo()
        this.getTSPLPBalance();
        //设置定时器以更新当前时间
        let timer = setInterval(this.getPendingPnut, 3000);
        //通过$once来监听定时器，在beforeDestroy钩子时被清除。
        this.$once("hook:beforeDestroy", () => {
          clearInterval(timer);
        });
      } catch (e) {
        this.maskInfo = this.$t("error.tryrefreshpage") + "\n" + e;
        this.showMask = true;
      } finally {
        this.isLoading = false;
      }
    },
  },
  components: {
    SmallLoading,
    ChangeTSPLPDepositMask,
  },

  async mounted() {},
};
</script>

<style scoped>
.tsp {
  width: 45%;
  max-width: 520px;
  min-width: 400px;
  margin: 2.5rem auto;
  padding: 1.5rem 1rem 2rem 1rem;
  background-color: white;
  box-shadow: rgba(0, 0, 0, 0.08) 0px 3px 30px, rgba(0, 0, 0, 0.04) 0px 4px 8px,
    rgba(0, 0, 0, 0.04) 3px 16px 24px, rgba(0, 0, 0, 0.01) 3px 24px 32px;
  border-radius: 30px;
  display: block;
  z-index: 1;
  box-sizing: border-box;
  margin-bottom: 2rem;
}

.changebox {
  display: flex;
  justify-content: space-evenly;
  padding: 1em;
  padding-bottom: 0;
}

.changebox p {
  font-weight: 400;
  color: darkgray;
  font-size: 20px;
  cursor: pointer;
}

.titleSelected {
  color: rgb(30, 30, 30) !important;
  font-weight: 500;
  font-size: 1.2rem;
  cursor: pointer;
  text-align: center;
}

.changebox p:hover {
  color: rgb(92, 91, 91) !important;
}

.user {
  margin-top: 1rem;
  width: 30rem;
}

.round-box {
  border-radius: 20px;
  border: 1px solid rgb(247, 248, 250);
  padding: 8px 14px;
  margin-bottom: 1rem;
}

.round-box-title-container {
  display: flex;
  flex-flow: row nowrap;
  -webkit-box-align: center;
  align-items: center;
  color: rgb(0, 0, 0);
  font-size: 0.75rem;
  line-height: 1rem;
  box-sizing: border-box;
  justify-content: space-between;
  -webkit-box-pack: justify;
  height: 100%;
}
.round-box-content-container {
  display: flex;
  flex-flow: row nowrap;
  -webkit-box-align: center;
  align-items: center;
  color: rgb(0, 0, 0);
  font-size: 1rem;
  line-height: 1.2rem;
  box-sizing: border-box;
  padding-top: 14px;
  justify-content: space-between;
  -webkit-box-pack: justify;
  height: 100%;
}

.box-title {
  box-sizing: border-box;
  margin: 0px;
  min-width: 0px;
  font-weight: 500;
  font-size: 14px;
  color: rgb(86, 90, 105);
}

.input {
  color: rgb(0, 0, 0);
  width: 100%;
  position: relative;
  font-weight: 500;
  outline: none;
  border: none;
  flex: 1 1 auto;
  background-color: rgb(255, 255, 255);
  font-size: 24px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0px;
  appearance: textfield;
}
#maxBtn {
  height: 100%;
  margin-top: 16px;
  background-color: rgb(253, 234, 241);
  border: 1px solid rgb(253, 234, 241);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  margin-right: 0.5rem;
  color: rgb(255, 0, 122);
  user-select: none;
}

#maxBtn:focus {
  border: 1px solid rgb(255, 0, 122);
  outline: none;
}

#maxBtn:hover {
  border: 1px solid rgb(255, 0, 122);
}
.pink-arrow-box {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  align-content: center;
  width: 100%;
  text-align: center;
}
.coin-icon {
  margin-top: 15px;
  width: 24px;
  height: 24px;
}

.pink-arrow {
  cursor: pointer;
}

.delegatetext {
  line-height: 2rem;
}

.confirm-box {
  margin-top: 1em;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-around;
}

.confirm-btn {
  padding: 12px;
  /* width: 100%; */
  flex: 1;
  text-align: center;
  border-radius: 20px;
  outline: none;
  border: 1px solid transparent;
  text-decoration: none;
  display: flex;
  -webkit-box-pack: center;
  justify-content: center;
  flex-wrap: nowrap;
  -webkit-box-align: center;
  align-items: center;
  cursor: pointer;
  position: relative;
  z-index: 1;
  background-color: rgb(253, 234, 241);
  color: rgb(255, 0, 122);
  font-size: 16px;
  font-weight: 500;
  user-select: none;
  margin-right: 10px;
}
.confirm-btn:last-child {
  margin-right: 0px;
}

.confirm-btn:hover {
  background-color: rgb(251, 220, 230);
}

.confirm-btn:disabled {
  color: rgb(136, 141, 155);
  cursor: auto;
  box-shadow: none;
  outline: none;
  opacity: 1;
  background-color: rgb(237, 238, 242);
}

.mask {
  z-index: 2000;
  overflow: hidden;
  display: flex;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
}

.mask-box {
  position: relative;
  max-width: 280px;
  width: 100%;
  background: rgb(255, 255, 255);
  box-shadow: rgba(0, 0, 0, 0.08) 0px 3px 30px, rgba(0, 0, 0, 0.04) 0px 4px 8px,
    rgba(0, 0, 0, 0.04) 3px 16px 24px, rgba(0, 0, 0, 0.01) 3px 24px 32px;
  border-radius: 10px;
  padding: 1rem;
  display: block;
  z-index: 100;
  box-sizing: border-box;
  margin-top: -50vh;
}

.mask-info {
  display: flex;
  align-content: center;
}

.mask-info-text {
  text-align: center;
  width: 100%;
}

.delegate {
  /* width: 30rem; */
  margin-top: 1rem;
}
.loginbtn {
  margin-top: 0.5rem;
}
.isok {
  /*margin-top: 1.5rem;*/
  /*width: 50%;*/
  /*background-color: chartreuse;*/
}
.isfalse {
  /*margin-top: 1.5rem;*/
  /*width: 50%;*/
  background-color: crimson;
}
</style>
