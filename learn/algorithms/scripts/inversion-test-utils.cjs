const programs=require('../assets/inversion-programs.json');
const complete=(language,code=programs[language])=>language==='cpp'?code.replace('throw runtime_error("TODO: 一次计入左侧剩余元素");','answer += static_cast<long long>(left.values.size()-i);'):code.replace('raise NotImplementedError("TODO: 一次计入左侧剩余元素")','answer += len(left)-i');
module.exports={complete};
