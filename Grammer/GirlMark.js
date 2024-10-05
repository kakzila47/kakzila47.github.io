class GirlMark {
  constructor() {
    this.rules = [
      { regex: /''(.*?)''/, replacement: "<strong>$1</strong>" },
      { regex: /''(.*?)''/, replacement: "<em>$1</em>" },
      { regex: /\[(.*?)\]/g, replacement: '<a href="$1.html">$1</a>' },
      { regex: /=== (.*?) ===/g, replacement: "<h3>$1</h3>" },
      { regex: /== (.*?) ==/g, replacement: "<h2>$1</h2>" },
      { regex: /# (.*?)/g, replacement: "<li>$1</li>" },
    ];
  }

  parse(input) {
    let output = input;
    this.rules.forEach((rule) => {
      output = output.replace(rule.regex, rule.replacement);
    });

    return output;
  }
}

const girlMark = new GirlMark();
const inputText =
  "== Title ==\n\n''Bold text'' and ''Italic text''.\n\n[[Link]]\n\n# Item 1\n# Item 2";
const outputHtml = girlMark.parse(inputText);

console.log(outputHtml);
