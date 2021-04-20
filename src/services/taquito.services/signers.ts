import { TezosToolkit } from '@taquito/taquito';
import { importKey , InMemorySigner} from '@taquito/signer';

// const FAUCET_KEY = require("./../../faucet.json")

// export async function getSignerFaucet (rpcUrl : string):Promise<TezosToolkit>{
//     const Tezos = new TezosToolkit(rpcUrl);
//     importKey(
//         Tezos,
//         FAUCET_KEY.email,
//         FAUCET_KEY.password,
//         FAUCET_KEY.mnemonic.join(' '),
//         FAUCET_KEY.secret
//       ).catch((e) => console.error("importKey error",e));
//       return Tezos
// }

export async function getSignerFactory(rpcUrl:string, pk : string):Promise<TezosToolkit>{
    
    const Tezos = new TezosToolkit(rpcUrl);
    await Tezos.setProvider({ signer: await InMemorySigner.fromSecretKey(pk) });
    return Tezos;
}