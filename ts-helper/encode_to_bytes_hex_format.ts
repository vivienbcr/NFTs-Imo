export function encode_to_bytes_hex_format(string: string): string {
  const stringBuffer = Buffer.from(string, "utf-8");
  const stringHex = stringBuffer.toString("hex");
  return stringHex;
}
export function encode_to_bytes_ascii_format(string: string): string {
  const stringBuffer = Buffer.from(string, "ascii");
  const stringHex = stringBuffer.toString("hex");
  return stringHex;
}
export function encode_secret_to_bytes_ascii_michelson_format(
  guess: number[],
  string: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      let pref_str = "0501";
      let len_placeholer = 0
      // len place holder is 00000000
      // find how many bits we will take to set length in this place holder
      while (Math.pow(16,len_placeholer)<= string.length) {
        len_placeholer +=1;
      }
      // set 0 * empty space
      for (let i = 0; i < 8 - len_placeholer; i++) {
        pref_str = pref_str.concat("0");
      }
      let res: string =
        pref_str +
        string.length.toString(16) +
        encode_to_bytes_ascii_format(string);

      for (let i = guess.length; i > 0; i--) {
        let prefix = "0500";

        if (guess[i - 1] <= 15) {
          res = prefix + "0" + guess[i - 1].toString(16) + res;
        } else {
          res = prefix + guess[i - 1].toString(16) + res;
        }
      }

      resolve(res);
    } catch (error) {
      reject(error);
    }
  });
}
//0501000000056162636465

// function getAsciiHex(seq : any):string{
//   const stringBuffer = Buffer.from(seq, "ascii");
//   return stringBuffer.toString("hex");
// }
