const { MichelsonMap } = require("@taquito/taquito");
const { alice } = require("../scripts/sandbox/accounts");
const FA2contract = artifacts.require("contracts/FA2_multi_assets");
const accounts = require("../scripts/sandbox/accounts");
const {
  encode_to_bytes_hex_format,
} = require("./../js-helper/encode_to_bytes_hex_format");

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
  2: alice_subAccount_unfungible_spendable,
  3: alice_subAccount_unfungible_spendable,
});

const ledger = MichelsonMap.fromLiteral({
  [accounts.alice.pkh]: alice_account,
  [accounts.tabbie.pkh]: tabbie_account,
  //biis
  ["tz1ZDcc6MGxidty2jivtWBjnuo1mcSXf4Mmr"]: alice_account,
  ["tz1Lnssr5mCwgNyEwe5sePkfVmBP3cr3fPoi"]: alice_account,
  ["tz1Z3CpJGKiL933zrypBBuUsP7p4LkCYiWKC"]: alice_account,
  ["tz1gVhqLVqUvhpQdufYpY4Cio5diyEVdQKKq"]: alice_account,
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
  decimals: encode_to_bytes_hex_format("8"),
  name: encode_to_bytes_hex_format("Imos"),
  symbol: encode_to_bytes_hex_format("iTZ"),
  thumbnailUri: encode_to_bytes_hex_format(
    "https://imostz.s3.eu-west-3.amazonaws.com/token_grey.png"
  ),
  attributes: encode_to_bytes_hex_format("[]"),
};
const token_infos_1 = {
  decimals: encode_to_bytes_hex_format("0"),
  name: encode_to_bytes_hex_format("CR-0004-75056"),
  symbol: encode_to_bytes_hex_format("IMOS"),
  thumbnailUri: encode_to_bytes_hex_format(
    "https://imostz.s3.eu-west-3.amazonaws.com/logo_token.png"
  ),
  attributes: encode_to_bytes_hex_format(
    '[{"name": "surface","value": "114"},\
      {"name": "jardin","value": "40" },\
      {"name": "address","value": "50 avenue du pump and dump 52000 Pluton" },\
      { "name": "pieces", "value": 9 },\
      { "name": "dpe", "value": 207 },\
     { "name": "ges", "value": 6 },\
     { "name": "price", "value": 183000 }]'
  ),
};
const token_infos_2 = {
  decimals: encode_to_bytes_hex_format("0"),
  name: encode_to_bytes_hex_format("CR-0245-38640"),
  symbol: encode_to_bytes_hex_format("IMOS"),
  thumbnailUri: encode_to_bytes_hex_format(
    "https://imostz.s3.eu-west-3.amazonaws.com/logo_token.png"
  ),
  attributes: encode_to_bytes_hex_format(
    '[{"name": "surface","value": "114"},\
      {"name": "jardin","value": "40" },\
      {"name": "address","value": "9 rue du peuplier 44621 Menthe à la jolie" },\
      { "name": "pieces", "value": 9 },\
      { "name": "dpe", "value": 207 },\
     { "name": "ges", "value": 6 },\
     { "name": "price", "value": 99999999 }]'
  ),
};
const token_infos_3 = {
  decimals: encode_to_bytes_hex_format("0"),
  name: encode_to_bytes_hex_format("CR-7777-91150"),
  symbol: encode_to_bytes_hex_format("IMOS"),
  thumbnailUri: encode_to_bytes_hex_format(
    "https://imostz.s3.eu-west-3.amazonaws.com/logo_token.png"
  ),
  attributes: encode_to_bytes_hex_format(
    '[{"name": "surface","value": "50"},\
      {"name": "jardin","value": "25" },\
      {"name": "address","value": "72 boulevard du conférencier numéro 9 009 teams" },\
      { "name": "pieces", "value": 2 },\
      { "name": "dpe", "value": 60 },\
     { "name": "ges", "value": 6 },\
     { "name": "price", "value": 222222 }]'
  ),
};
const token_meta = MichelsonMap.fromLiteral({
  0: { token_id: 0n, token_info: MichelsonMap.fromLiteral(token_infos_0) },
  1: { token_id: 1n, token_info: MichelsonMap.fromLiteral(token_infos_1) },
  2: { token_id: 2n, token_info: MichelsonMap.fromLiteral(token_infos_2) },
  // 3: { token_id: 3n, token_info: MichelsonMap.fromLiteral(token_infos_3) },
});
// const meta = "https://tezos-contract-metas.s3-eu-west-1.amazonaws.com/metadata.json"
// const metahex = encode_to_bytes_hex_format(meta)

// const metadata_ = MichelsonMap.fromLiteral({
//   "":metahex
// });

const store = {
  ledger: ledger,
  owner: [
    accounts.alice.pkh,
    "tz1Lnssr5mCwgNyEwe5sePkfVmBP3cr3fPoi",
    "tz1ZDcc6MGxidty2jivtWBjnuo1mcSXf4Mmr",
    "tz1Z3CpJGKiL933zrypBBuUsP7p4LkCYiWKC",
    "tz1gVhqLVqUvhpQdufYpY4Cio5diyEVdQKKq",
  ],
  token_ids: [0, 1, 2],
  token_metadata: token_meta,
  // metadata: metadata_,
  operators_contracts: [],
  open_proposals: [],
  proposals: new MichelsonMap(),
};
module.exports = (deployer) => {
  deployer.deploy(FA2contract, store);
};
