const { MichelsonMap } = require("@taquito/taquito");
const { alice } = require("../scripts/sandbox/accounts");
const FA2contract = artifacts.require("contracts/FA2_multi_assets");
const accounts = require("../scripts/sandbox/accounts");
const { encode_to_bytes_hex_format } = require("./../js-helper/encode_to_bytes_hex_format")

const tabbie_sub_account = {
  balance: 100,
  operators: [accounts.alice.pkh],
};

const alice_subAccount_fungible = { balance: 10000000000000, operators: [] };
const alice_subAccount_unfungible_spendable = {
  balance: 1,
  operators: [],
};

const tabbie_account = MichelsonMap.fromLiteral({ 0: tabbie_sub_account });
const alice_account = MichelsonMap.fromLiteral({
  0: alice_subAccount_fungible,
  1: alice_subAccount_unfungible_spendable,

});

const ledger = MichelsonMap.fromLiteral({
  [accounts.alice.pkh]: alice_account,
  [accounts.tabbie.pkh]: tabbie_account,
  //biis 
  ["tz1ZDcc6MGxidty2jivtWBjnuo1mcSXf4Mmr"]:alice_account,
  ["tz1Lnssr5mCwgNyEwe5sePkfVmBP3cr3fPoi"]:alice_account
});

// const token_0_meta = "https://tezos-contract-metas.s3-eu-west-1.amazonaws.com/token_0_metadata.json";
// // const token_0_meta = require("./../metadatas/token_0_metadata.json")
// const token_0_meta_ex = encode_to_bytes_hex_format(JSON.stringify(token_0_meta))
// const token_infos_ = MichelsonMap.fromLiteral({"" :token_0_meta_ex})

// const token_1_meta = "https://tezos-contract-metas.s3-eu-west-1.amazonaws.com/token_1_metadata.json";
// // const token_1_meta = require("./../metadatas/token_1_metadata.json")
// const token_1_meta_ex = encode_to_bytes_hex_format(JSON.stringify(token_1_meta))
// const token_infos_1 = MichelsonMap.fromLiteral({"" :token_1_meta_ex})

const token_infos_0 = {
  decimals : encode_to_bytes_hex_format("8"),
  name : encode_to_bytes_hex_format("Imos"),
  symbol : encode_to_bytes_hex_format("iTZ"),
  thumbnailUri : encode_to_bytes_hex_format("https://imostz.s3.eu-west-3.amazonaws.com/logo_simple.png"),
  attributes:encode_to_bytes_hex_format("[]")
}
const token_infos_1 = {
  decimals : encode_to_bytes_hex_format("0"),
  name : encode_to_bytes_hex_format("Ma Maison"),
  symbol : encode_to_bytes_hex_format("HOME"),
  thumbnailUri : encode_to_bytes_hex_format("https://imostz.s3.eu-west-3.amazonaws.com/logo_square.png"),
  attributes: encode_to_bytes_hex_format('[{"name": "Base", "value": "Starfish"},{"name": "Eyes", "value": "Big"},]')
}
const token_meta = MichelsonMap.fromLiteral({
  0: { token_id: 0n, token_info: MichelsonMap.fromLiteral(token_infos_0) },
  1: {token_id:1n,token_info:MichelsonMap.fromLiteral(token_infos_1)}
});
// const meta = "https://tezos-contract-metas.s3-eu-west-1.amazonaws.com/metadata.json"
// const metahex = encode_to_bytes_hex_format(meta)

// const metadata_ = MichelsonMap.fromLiteral({
//   "":metahex
// });

const store = {
  ledger: ledger,
  owner: [accounts.alice.pkh,"tz1Lnssr5mCwgNyEwe5sePkfVmBP3cr3fPoi","tz1ZDcc6MGxidty2jivtWBjnuo1mcSXf4Mmr"],
  token_ids: [0, 1],
  token_metadata: token_meta,
  // metadata: metadata_,
  operators_contracts:[],
  proposals : new MichelsonMap()
};
module.exports = (deployer) => {
  deployer.deploy(FA2contract, store);
};