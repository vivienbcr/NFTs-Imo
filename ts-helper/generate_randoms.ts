
import randomNumber = require("random-number-csprng")

export async function generate_random_array_unique_number(len : number,min:number,max:number): Promise<number[]> {
    let res : number[] = []
    while (res.length < len){
        let r = await randomNumber(min,max)
        if(!res.includes(r)){
            res.push(r)
        }
    }
    return res
    }