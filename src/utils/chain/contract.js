import { getTronLink, getTron } from './tron.js'
import { firstToUpper } from '../helper.js'
import axios from 'axios'
import store from '../../store'

const CONTRACT_JSON_NAME_LIST = {
    PNUT: "NutboxPeanuts.json",
    SBD: "NutboxSbd.json",
    STEEM: "NutboxSteem.json",
    TSP: "NutboxTsp.json",
    PNUT_POOL: "PeanutsPoolV2.json",
    TSP_LP_POOL: "TspLpPool.json",
    TSP_POOL: "TspPooling.json"
}

const CONTRACT_STORE_NAME = {
    PNUT: "pnut",
    SBD: "sbd",
    STEEM: "steem",
    TSP: "tsp",
    PNUT_POOL: "pnutPool",
    TSP_LP_POOL: "tspLpPool",
    TSP_POOL: "tspPool"
}

export const getAbiAndContractAddress = async function (symbol) {
    symbol = symbol.toUpperCase()
    const contract = store.state[CONTRACT_STORE_NAME[symbol] + 'Json']
    let abi = contract && contract.abi
    let address = contract && contract.contract
    if (abi && address) {
        return { abi, address }
    }
    const tronweb = getTron()
    const res = await axios.get('/' + CONTRACT_JSON_NAME_LIST[symbol])
    abi = res.data.abi
    address = tronweb.address.fromHex(res.data.networks["*"].address)
    store.commit('save' + firstToUpper(CONTRACT_STORE_NAME[symbol]) + 'Json', { abi: abi, contract: address })
    return { abi, address }
}

export const getContract = async function (symbol) {
    symbol = symbol.toUpperCase()
    let instance = store.state[CONTRACT_STORE_NAME[symbol] + 'Instance']
    if (Object.keys(instance).length !== 0) {
        return instance
    }
    const tronLink = await getTronLink()
    const { abi, address } = await getAbiAndContractAddress(symbol)
    instance = tronLink.contract(abi, address)
    store.commit('save' + firstToUpper(CONTRACT_STORE_NAME[symbol]) + 'Instance', instance)
    return instance
}

export const getContractByDefaultAcc = async function (symbol) {
    symbol = symbol.toUpperCase()
    let instance = store.state[CONTRACT_STORE_NAME[symbol] + 'Instance2']
    if (Object.keys(instance).length !== 0) {
        return instance
    }
    const tronWeb = getTron()
    const { abi, address } = await getAbiAndContractAddress(symbol)
    instance = tronWeb.contract(abi, address)
    store.commit('save' + firstToUpper(CONTRACT_STORE_NAME[symbol]) + 'Instance2', instance)
    return instance
}
