document.addEventListener("DOMContentLoaded", () => {
  const lab = document.querySelector("[data-code-challenge]");
  if (!lab) return;
  const frame = lab.querySelector("[data-compiler-frame]");
  const status = lab.querySelector("[data-editor-status]");
  const fallback = lab.querySelector("[data-fallback-code]");
  const buttons = [...lab.querySelectorAll("[data-language]")];
  const programs = {
    cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int upperBound(const vector<int>& a, int x) {
    int lo = 0, hi = static_cast<int>(a.size());
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        // TODO: 比较 a[mid] 与 x，更新 lo 或 hi。
        break; // 补完 TODO 后删掉这行
    }
    return lo;
}

int main() {
    struct Test { vector<int> a; int x, expected; string name; };
    vector<Test> tests = {
        {{1,2,2,4,7},2,3,"重复目标"},
        {{},3,0,"空数组"},
        {{1,2,2},0,0,"目标更小"},
        {{1,2,2},9,3,"目标更大"},
        {{-2,-2,0,5},-2,2,"重复负数"}
    };
    int passed = 0;
    for (const auto& t : tests) {
        int actual = upperBound(t.a, t.x);
        bool ok = actual == t.expected;
        passed += ok;
        cout << (ok ? "PASS " : "FAIL ") << t.name
             << " | expected=" << t.expected << " got=" << actual << endl;
    }
    cout << passed << "/" << tests.size() << " passed" << endl;
}`,
    python: `def upper_bound(a, x):
    lo, hi = 0, len(a)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        # TODO: 比较 a[mid] 与 x，更新 lo 或 hi。
        break  # 补完 TODO 后删掉这行
    return lo

tests = [
    ([1, 2, 2, 4, 7], 2, 3, "重复目标"),
    ([], 3, 0, "空数组"),
    ([1, 2, 2], 0, 0, "目标更小"),
    ([1, 2, 2], 9, 3, "目标更大"),
    ([-2, -2, 0, 5], -2, 2, "重复负数"),
]
passed = 0
for a, x, expected, name in tests:
    actual = upper_bound(a, x)
    ok = actual == expected
    passed += ok
    print(f'{"PASS" if ok else "FAIL"} {name} | expected={expected} got={actual}')
print(f'{passed}/{len(tests)} passed')
`
  };

  let language = "cpp";
  function populate() {
    const current = language;
    const message = {
      eventType: "populateCode", language: current,
      files: [{ name: current === "cpp" ? "main.cpp" : "main.py", content: programs[current] }]
    };
    frame.contentWindow?.postMessage(message, "https://onecompiler.com");
    status.textContent = `已载入 ${current === "cpp" ? "C++" : "Python"}。补全 TODO，再按编辑器中的 Run。`;
  }
  frame.addEventListener("load", populate);
  buttons.forEach(button => button.addEventListener("click", () => {
    const next = button.dataset.language;
    if (next === language) return;
    language = next;
    buttons.forEach(item => item.setAttribute("aria-pressed", String(item.dataset.language === language)));
    fallback.textContent = programs[language];
    status.textContent = `正在载入 ${language === "cpp" ? "C++" : "Python"} 编辑器…`;
    frame.title = `${language === "cpp" ? "C++" : "Python"} 在线代码编辑器`;
    frame.src = `https://onecompiler.com/embed/${language}?listenToEvents=true&hideLanguageSelection=true`;
  }));
  fallback.textContent = programs.cpp;
});

