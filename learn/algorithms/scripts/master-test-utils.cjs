const programs=require('../assets/master-programs.json');
const complete=(language,code=programs[language])=>language==='cpp'?code.replace('return total; // TODO: 加上自身工作 own','return total + own;'):code.replace('return total  # TODO: 加上自身工作 own','return total + own');
module.exports={complete};
