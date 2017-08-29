export default function _if(params:Array<any>) {
  let [ bool, a, b ] = params;
  return !!bool ? a : b;
};
