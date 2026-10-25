const programs=require('../assets/merge-programs.json');
function complete(language, code=programs[language]) {
  return language==='cpp' ? code.replace('throw runtime_error("TODO: 选择较小的队首");', 'if (left[i] <= right[j]) out.push_back(left[i++]);\n        else out.push_back(right[j++]);') : code.replace('raise NotImplementedError("TODO: 选择较小的队首")', 'if left[i] <= right[j]:\n            out.append(left[i])\n            i += 1\n        else:\n            out.append(right[j])\n            j += 1');
}
module.exports={complete};
