// SPDX-FileCopyrightText: 2020 tqtezos
// SPDX-License-Identifier: MIT


#if !FA2_INTERFACE
#define FA2_INTERFACE

#include "fa2_storage.ligo"

(*
 * This function fail if token_id provided is not in existing token type
 *)

function validate_token_type_exist
  ( const token_id : token_id ; const token_ids : set(token_id)
  ) : unit is
    if Set.mem((token_id),token_ids)
    then unit
    else failwith ("FA2_TOKEN_UNDEFINED")

(* Transfer params *)
type transfer_destination_ is record
  to_      : address
; token_id : token_id
; amount   : nat
end

type transfer_destination is michelson_pair_right_comb(transfer_destination_)

type transfer_param_ is record
  from_ : address
; txs : list (transfer_destination)
end

type transfer_param is michelson_pair_right_comb(transfer_param_)

type transfer_params is list (transfer_param)

type hook_transfer_callback_contract is contract(transfer_params);

type hook_transfer_param_ is record [
  requests : transfer_params;
  callback : hook_transfer_callback_contract
]

type hook_transfert_param is michelson_pair_right_comb(hook_transfer_param_)

(* Balance of params*)
type balance_of_request is record
   owner    :  address
;  token_id : token_id
end

type balance_of_response_ is record
  request : balance_of_request
; balance : nat
end

type balance_of_response is michelson_pair_right_comb(balance_of_response_)

type balance_of_params_ is record
  requests : list (balance_of_request)
; callback : contract (list (balance_of_response))
end

type balance_of_params is michelson_pair_right_comb(balance_of_params_)
(* Token metadata *)
type token_metadata_ is record
  token_id  : token_id
; symbol    : string
; name      : string
; decimals  : nat
; extras    : map (string, string)
end

type token_metadata is michelson_pair_right_comb(token_metadata_)

type token_metadata_registry_params is contract (address)

(* Update operator params *)
type operator_param_act_ is record
  operator : address
; token_id : nat
end

type operator_param_act is michelson_pair_right_comb(operator_param_act_)

type operator_param_ is record
  owner    : address
; operator : operator_param_act
end

type operator_param is michelson_pair_right_comb(operator_param_)

type update_operator_param is
[@layout:comb]
| Add_operator    of operator_param
| Remove_operator of operator_param

type update_operator_params is list (update_operator_param)


(* ------------------------------------------------------------- *)


type mint_param_ is record
  to_    : address
; amount : nat
; token_id : nat
; token_meta : token_info_
end

type burn_params_ is record
  to_ : address
; amount: nat
; token_id : nat
end

type mint_param is michelson_pair_right_comb (mint_param_)
type mint_params is list (mint_param)
type burn_params is burn_params_


type set_operator_contract_params is address

type set_contract_account_params_ is record [
  contract_address : address;
  operator_params : operator_param_act_;
] ;


type create_proposal_params_ is record [
  token_id : nat;
  to_ : address;
  from_ : address;
  nb_signer : nat;
];
type create_proposal_params is michelson_pair_right_comb(create_proposal_params_);

type sign_proposal_params_ is record [
  token_id : nat;
  from_: address;
];
type sign_proposal_params is michelson_pair_right_comb(sign_proposal_params_);

type remove_proposal_params_ is record [
  token_id : nat ;
  from_ : address ;
]

type remove_proposal_params is michelson_pair_right_comb(remove_proposal_params_);
#endif