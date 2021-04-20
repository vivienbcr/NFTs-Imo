export function getContractAddressFromBuild(contractName:string):string {
    try {
        const build : any = require(`../../build/contracts/${contractName}.json`)
        return build.networks[Object.keys(build.networks)[0]].address;
    } catch (error) {
        console.error("getContractAddressFromBuild ",error)
        throw Error(error)
    }  
}