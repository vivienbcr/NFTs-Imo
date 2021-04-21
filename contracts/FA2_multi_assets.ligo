#include "../contracts-src/FA2-NFTimo/fa2_storage.ligo"
#include "../contracts-src/FA2-NFTimo/fa2_interfaces.ligo"
#include "../contracts-src/FA2-NFTimo/fa2_helpers.ligo"
#include "../contracts-src/FA2-NFTimo/fa2_actions.ligo"
#include "../contracts-src/FA2-NFTimo/fa2_hooks.ligo"
#include "../contracts-src/STANDARDS/std_helpers.ligo"
(*
 * FA2-specific entrypoints param.0 %from param.1 %to prams.2 %tokenid params.3 %amount
 *)
function transfer( const transferParams : transfer_params; var store : storage) : entrypoint is 
  block {  

    const n_store : storage = List.fold (make_transfer, transferParams, store);

} with ( (nil : list (operation)), n_store ) //List.fold (make_transfer, transferParams, ((nil : list (operation)), store))


function balance_of ( const parameter : balance_of_params; const store : storage) : entrypoint is 
block { 
  function get_account_balance( const request : balance_of_request) : balance_of_response is 
  block { 
    validate_token_type_exist (request.token_id, store.token_ids);
    const req_account : account = getAccount(request.owner,store);
    const req_sub_acct : sub_account = getSubAccount(request.token_id,req_account);
    const res_balance : amt = req_sub_acct.balance;
    
  } with (request, res_balance);

  const responses : list (balance_of_response) = List.map (get_account_balance, parameter.0);
  const transfer_operation : operation = Tezos.transaction (responses, 0mutez, parameter.1);
} with (list [transfer_operation], store)

(* Entrypoint - Update_operator  
| Add, Remove operations on account 
| Restricted to account owner *)

// Remove operator
function rm_operator(const op_param : operator_param; var acct : account; const token_ids : set(token_id)):account is 
block{
  const owner : address = op_param.0;

  if owner =/= Tezos.source then failwith("FA2_NOT_OWNER") else skip;
  
  const token_id : token_id = op_param.1.1;
  validate_token_type_exist(token_id,token_ids);
  const op_addr : address = op_param.1.0;
  const sub_acct : sub_account = getSubAccount(token_id, acct);

  if Set.mem(op_addr, sub_acct.operators) =/= True then failwith("FA2_OPERATOR_NOT_EXIST") else skip;

  const new_sub_account : sub_account = sub_acct with record [operators = Set.remove(op_addr,sub_acct.operators)]; 
  const updated_acct : account = Map.update((token_id),Some(new_sub_account),acct);

}with updated_acct

// Add operator
function add_operator(const op_param : operator_param; var acct : account; const token_ids : set(token_id)):account is 
block{

  const owner : address = op_param.0;

  if owner =/= Tezos.source then failwith("FA2_NOT_OWNER") else skip;
  const token_id : token_id = op_param.1.1;
  validate_token_type_exist(token_id,token_ids);
  const op_addr : address = op_param.1.0;
  const sub_acct : sub_account = getSubAccount(token_id, acct);

  if Set.mem(op_addr, sub_acct.operators) then failwith("FA2_OPERATOR_EXIST") else skip;
  const new_sub_account : sub_account =  sub_acct with record [operators = Set.add(op_addr,sub_acct.operators)]; 
  const updated_acct : account = Map.update((token_id),Some(new_sub_account),acct);

}with updated_acct

// Update_operator_action :  inter in list of update operator operation (ADD or RM )
function update_operators_action( const parameters : update_operator_params; var store : storage) : entrypoint is 
  block { 
    var owner_acct : account := getAccount(Tezos.source, store);
    function update_operators(var acc_acct:account; const update_op_param : update_operator_param):account is
    block{
        acc_acct := case update_op_param of
          | Add_operator (params)-> add_operator(params, acc_acct, store.token_ids)
          | Remove_operator (params)-> rm_operator(params, acc_acct, store.token_ids) 
          end;
    }with acc_acct;  

    owner_acct := List.fold(update_operators,parameters, owner_acct);
    store := store with record [ ledger = Big_map.update((Tezos.source),Some(owner_acct),store.ledger) ] ;
  } with ( (nil : list (operation)), store )


(* Entrypoint - Mint  
| Mint new Token fungible or non fungible
| Restricted to contract owners *)

function mint(
  const params : mint_params;
  var store: storage)
  :entrypoint is
block{
  verifyContractOwner(Tezos.source,store);

  function mint_operation(
    var store_acc: storage;
    const mint_prams : mint_param)
    :storage is

  block{
    const token_id:token_id = mint_prams.1.1.0;

    const to_ : address = mint_prams.0;
    const token_amt : nat = mint_prams.1.0;
    var to_acct : account := getAccount(to_, store_acc);
    const to_sub_acct : sub_account = getSubAccount(token_id,to_acct);

    if token_id = default_token_id then
      block{  
        const n_to_sub_acct : sub_account = to_sub_acct with record [balance = to_sub_acct.balance + token_amt];
        to_acct := Map.update((token_id), Some(n_to_sub_acct), to_acct);
      }
    else 
      block{
        if Set.mem(token_id,store_acc.token_ids) then failwith("FA2_NFT_EXIST") else skip;
        store_acc := store_acc with record [ token_ids = Set.add(token_id,store_acc.token_ids) ];

        // const map_info : info_map = Map.literal(list[(("":string),(mint_prams.1.1.1))]);
        var n_token_info : token_info := record [ token_id = token_id; token_info = mint_prams.1.1.1];

        store_acc := store_acc with record [token_metadata = Big_map.update(token_id,Some(n_token_info),store_acc.token_metadata)];

        const n_to_sub_acct : sub_account = to_sub_acct with record [balance = 1n];
        to_acct := Map.update((token_id), Some(n_to_sub_acct), to_acct);

      };

    var  updated_ledger : ledger := Big_map.update((to_), Some(to_acct), store_acc.ledger);
    store_acc := store_acc with record [ ledger = updated_ledger ] ;

  }with store_acc;
  

  n_store := List.fold(mint_operation,params,store);
  skip;

  
}with ((nil: list(operation)), n_store)

(* Entrypoint - Burn  
| Burn tokens id 0 from contract owner account
| Restricted to contract owners *)
function burn(const params : burn_params; var store: storage):entrypoint is
block{
  // Sender is owner
  verifyContractOwner(Tezos.source,store);
  // Burn address is controlled address
  // verifyContractOwner(params.to_, store);
  var to_acct : account := getAccount(params.to_, store);
  var to_sub_acct : sub_account := getSubAccount(params.token_id,to_acct);
  if to_sub_acct.balance < params.amount then failwith("FA2_INSUFFICIENT_BALANCE") else skip;
  if params.token_id = default_token_id then block{
    to_sub_acct := to_sub_acct with record [balance = abs(to_sub_acct.balance - params.amount)];
  }else{
    to_sub_acct := to_sub_acct with record [balance = abs(to_sub_acct.balance - 1n)];
  };
  to_acct := Map.update(params.token_id, Some(to_sub_acct), to_acct);
  var  updated_ledger : ledger := Big_map.update((params.to_), Some(to_acct), store.ledger);
  store := store with record [ ledger = updated_ledger ] ;
  
}with ((nil: list(operation)), store)

(* Entrypoint - OperatorsContracts  
| Update set of contract operator
| Restricted to contract owners *)
function set_operators_contracts(const params : set_operator_contract_params; var store: storage):entrypoint is
block{
  // Sender is owner
  verifyContractOwner(Tezos.source,store);
  if Set.mem(params,store.operators_contracts) then block{
    store := store with record [ operators_contracts = Set.remove(params,store.operators_contracts) ] ;
  }else block{
    store := store with record [ operators_contracts = Set.add(params,store.operators_contracts) ] ;  
  }
}with ((nil: list(operation)), store)

(* Entrypoint - set_contract_account   
| Init contract account with sender as operator
| Restricted to contract owners *)
function set_contract_account(const params : operator_param; var store: storage):entrypoint is
block{
  // Sender is owner
  verifyContractOwner(Tezos.source,store);
  const acct : account = getAccount(params.0,store);
  const sub_acct : sub_account = getSubAccount(params.1.1,acct);
  if Set.mem(params.1.0, sub_acct.operators) then failwith("FA2_OPERATOR_EXIST") else skip;
  const new_sub_account : sub_account =  sub_acct with record [operators = Set.add(params.1.0,sub_acct.operators)]; 
  const updated_acct : account = Map.update((params.1.1),Some(new_sub_account),acct);
  store := store with record [ ledger = Big_map.update((params.0),Some(updated_acct),store.ledger) ] ;

}with ((nil: list(operation)), store)


// 
// type create_proposal_params_ is record [
//   token_id : nat;
//   destination : address;
//   nb_signer : nat;
// ];
// (token_id  * (to_ * ( from_ * nbrsigner)))
  function create_proposal (const params : create_proposal_params; var store : storage): entrypoint is 
  block {
    fail_on(params.0 = 0n,"FA2_TOKEN_ID_0_NOT_SUPPORT_PROPOSAL");
    const acct : account = getAccount(params.1.1.0,store); 
    const sub_acct : sub_account = getSubAccount(params.0,acct);
    fail_on(sub_acct.balance = 0n,"FA2_INSUFISANT_BALANCE_PROPOSAL");

    if Tezos.source =/= params.1.1.0 and not Set.mem(Tezos.source,store.owner) then block{
      if not Set.mem(Tezos.source, sub_acct.operators) then failwith("FA2_FORBIDDEN_PROPOSAL") else skip;
    } else skip;
    
    if Big_map.mem(params.0, store.proposals) then failwith("FA2_EXISTING_PROPOSAL") else skip;

    const proposal : proposal = record [
      from_= params.1.1.0; 
      to_ = params.1.0;
      signers = set [Tezos.source];
      nb_signer = params.1.1.1;
    ];
    store := store with record [ proposals =   Big_map.update(params.0, Some(proposal) , store.proposals) ];

  }with ((nil: list(operation)), store)


function sign_proposal (const params : sign_proposal_params; var store : storage) : entrypoint is 
block {
  validate_token_type_exist (params.0, store.token_ids);

  const acct : account = getAccount(params.1 ,store);
  const sub_acct : sub_account = getSubAccount(params.0,acct);

  if not Set.mem(Tezos.source, sub_acct.operators) then failwith("FA2_NOT_OPERATOR") else skip;

  var myProposal : proposal := case Big_map.find_opt(params.0,store.proposals) of
  | None -> (failwith("FA2_NO_PROPOSAL") : proposal)
  | Some(value) -> value
  end;

  myProposal := myProposal with record [ signers = Set.add(Tezos.source, myProposal.signers) ];

  store := store with record [proposals = Big_map.update(params.0, Some(myProposal), store.proposals)];
}with ((nil: list(operation)), store);

function remove_proposal(const params : remove_proposal_params; var store : storage): entrypoint is
block{
    if  Tezos.source =/= params.1 or (not Set.mem(Tezos.source,store.owner)) then block {
      const acct : account = getAccount(params.1,store); 

      const sub_acct : sub_account = getSubAccount(params.0,acct);

      if not Set.mem(Tezos.source, sub_acct.operators) then failwith("FA2_REMOVE_PROPOSAL_NOT_OPERATOR") else skip;
    } else skip;
  if not Big_map.mem(params.0,store.proposals) then failwith("FA2_NO_PROPOSAL")else skip;
  store := store with record [ proposals  = Big_map.remove(params.0,store.proposals)];
}with ((nil: list(operation)), store);



(* Main *)
function fa2_hooks( const action : fa2_hooks_entry_points; const store  : storage) : entrypoint is
    case action of
    | Transferhook (params)-> transfer_hook           (params,store)
    | Nil->((nil: list(operation)), store)
    end
function fa2_utils( const action : fa2_utils_entry_points; const store  : storage) : entrypoint is 
    case action of
      Mint                      (params) -> mint          (params,store)
    | Burn                      (params) -> burn          (params,store)
    | SetOperatorsContracts     (params) -> set_operators_contracts (params,store)
    | SetContractAccount        (params) -> set_contract_account (params, store)
    | CreateProposal            (params) -> create_proposal (params, store)
    | SignProposal              (params) -> sign_proposal (params, store)
    | RemoveProposal            (params) -> remove_proposal(params,store)
    end

function fa2_main( const action : fa2_entry_points; const store  : storage) : entrypoint is 
    case action of
      | Transfer                (params) -> transfer                (params, store)
      | Balance_of              (params) -> balance_of              (params, store)
      | Update_operators        (params) -> update_operators_action (params, store)
    // | Token_metadata_registry (params) -> token_metadata_registry (params, store)
    // | Permissions_descriptor  (params) -> permission_descriptor   (params, store)
    // | Is_operator             (params) -> is_operator_action      (params, store)
    end

function main( const action : closed_parameter; const store  : storage) : entrypoint is 
block { fail_on (Tezos.amount =/= 0tz, "XTZ_RECEIVED") // Validate whether the contract receives non-zero amount of tokens
} with case action of
    Fa2                   (params) -> fa2_main              (params, store)
  | Asset                 (params) -> fa2_utils           (params, store)
  | Hooks                 (params) -> fa2_hooks           (params,store)
  end