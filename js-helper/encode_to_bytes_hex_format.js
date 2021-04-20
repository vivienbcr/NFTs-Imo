const encode_to_bytes_hex_format=(string)=>{
    const stringBuffer = Buffer.from(string,"utf-8")
    const stringHex = stringBuffer.toString("hex");
    return stringHex
  }
module.exports = {encode_to_bytes_hex_format}