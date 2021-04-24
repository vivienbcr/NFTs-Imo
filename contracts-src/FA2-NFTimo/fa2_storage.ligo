#if !FA2_STORAGE
#define FA2_STORAGE

type token_id is nat

type operators_ is set(address)

type sub_account is record [
  balance : nat;
  operators : operators_
]
(*custom ledger *)
type account is map(token_id,sub_account)

type ledger is big_map(address,account)
// type info_map is map(string,bytes)

type token_info_ is map( string, bytes)

type token_info is record[
  token_id : nat;
  token_info : token_info_
]
type proposal is record [
  to_ : address;
  from_ : address;
  signers : set(address);
  nb_signer : nat;
]

type storage is record [
  ledger              : ledger;
  owner               : set(address);
  token_ids           : set(token_id);
  token_metadata      : big_map(nat,token_info);
  // metadata            : big_map(string,bytes);
  operators_contracts : set(address);
  proposals           : big_map(token_id, proposal);
  open_proposals      : set(token_id);


]
type entrypoint is list (operation) * storage;
#endif