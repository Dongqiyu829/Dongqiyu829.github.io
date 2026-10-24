document.addEventListener("DOMContentLoaded", () => {
  const lab = document.querySelector("[data-code-challenge]");
  if (!lab) return;
  const frame = lab.querySelector("[data-compiler-frame]");
  const status = lab.querySelector("[data-editor-status]");
  const fallback = lab.querySelector("[data-fallback-code]");
  const starterButton = lab.querySelector("[data-load-starter]");
  const buttons = [...lab.querySelectorAll("[data-language]")];
  const programs = {
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <stdexcept>
using namespace std;

int lowerBound(const vector<int>& a, int x) {
    int lo = 0, hi = static_cast<int>(a.size());
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] < x) {
            throw runtime_error("TODO 1: 替换为 lo 的更新");
        } else {
            throw runtime_error("TODO 2: 替换为 hi 的更新");
        }
    }
    return lo;
}

int main() {
    struct Test { vector<int> a; int x, expected; string name; };
    vector<Test> tests = {
        {{1,2,2,4,7},2,1,"重复值：找第一个"},
        {{1,2,2,4,7},3,3,"目标不在数组里"},
        {{},3,0,"空数组"},
        {{1,2,2},0,0,"目标更小"},
        {{1,2,2},9,3,"目标更大"},
        {{-2,-2,0,5},-2,0,"重复负数"},
        {{2},2,0,"单元素：满足"},
        {{2},3,1,"单元素：不满足"}
    };
    int passed = 0;
    for (const auto& t : tests) {
        try {
            int actual = lowerBound(t.a, t.x);
            bool ok = actual == t.expected;
            passed += ok;
            cout << (ok ? "PASS " : "FAIL ") << t.name
                 << " | expected=" << t.expected << " got=" << actual << endl;
        } catch (const exception& e) {
            cout << "ERROR " << t.name << " | " << e.what() << endl;
        }
    }
    cout << passed << "/" << tests.size() << " passed" << endl;
}`,
    python: `def lower_bound(a, x):
    lo, hi = 0, len(a)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if a[mid] < x:
            raise NotImplementedError("TODO 1: 替换为 lo 的更新")
        else:
            raise NotImplementedError("TODO 2: 替换为 hi 的更新")
    return lo

tests = [
    ([1, 2, 2, 4, 7], 2, 1, "重复值：找第一个"),
    ([1, 2, 2, 4, 7], 3, 3, "目标不在数组里"),
    ([], 3, 0, "空数组"),
    ([1, 2, 2], 0, 0, "目标更小"),
    ([1, 2, 2], 9, 3, "目标更大"),
    ([-2, -2, 0, 5], -2, 0, "重复负数"),
    ([2], 2, 0, "单元素：满足"),
    ([2], 3, 1, "单元素：不满足"),
]
passed = 0
for a, x, expected, name in tests:
    try:
        actual = lower_bound(a, x)
        ok = actual == expected
        passed += ok
        print(f'{"PASS" if ok else "FAIL"} {name} | expected={expected} got={actual}')
    except Exception as error:
        print(f'ERROR {name} | {error}')
print(f'{passed}/{len(tests)} passed')
`
  };

  let language = "cpp";
  let pending = null;
  let generation = 0;
  function populate() {
    const message = {
      eventType: "populateCode", language,
      files: [{ name: language === "cpp" ? "main.cpp" : "main.py", content: programs[language] }]
    };
    frame.contentWindow?.postMessage(message, "https://onecompiler.com");
    frame.parentElement.classList.remove("is-loading");
    if (starterButton) starterButton.disabled = false;
    status.textContent = (language === "cpp" ? "C++" : "Python") + " 起始代码已发送。补全两个 TODO，再按 Run；若仍显示默认代码，点击“重新填入起始代码”。";
  }
  frame.addEventListener("load", () => {
    window.clearTimeout(pending);
    const current = generation;
    pending = window.setTimeout(() => {
      if (current === generation) populate();
    }, 1000);
  });
  buttons.forEach(button => button.addEventListener("click", () => {
    const next = button.dataset.language;
    if (next === language) return;
    window.clearTimeout(pending);
    generation++;
    language = next;
    frame.parentElement.classList.add("is-loading");
    if (starterButton) starterButton.disabled = true;
    buttons.forEach(item => item.setAttribute("aria-pressed", String(item.dataset.language === language)));
    fallback.textContent = programs[language];
    status.textContent = "正在载入 " + (language === "cpp" ? "C++" : "Python") + " 编辑器…";
    frame.title = (language === "cpp" ? "C++" : "Python") + " 在线代码编辑器";
    frame.src = "https://onecompiler.com/embed/" + language + "?listenToEvents=true&hideLanguageSelection=true&fontSize=16";
  }));
  starterButton?.addEventListener("click", populate);
  if (starterButton) starterButton.disabled = true;
  fallback.textContent = programs.cpp;
});


