!function (output) {
  const input = markedInput.init({
    el: '#input',
    onChange: text => {
      const ps = output.querySelectorAll('p');
      [
        `Full text: ${input.el.textContent}`,
        `Significant text: ${text}`,
      ].forEach((line, i) => {
        var p = ps[i];
        if (!p) {
          p = document.createElement('p');
          output.appendChild(p);
        }
        p.textContent = line;
      });
    },
  });
}(document.querySelector('#output'));
