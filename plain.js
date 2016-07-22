!function (root, factory) {
  if (typeof module === 'object' && module.exports)
    module.exports = factory(root);
  else
    root.markedInput = factory(root);
}(typeof window !== 'undefined' ? window : this, function (window) {

function $(selector) {
  return document.querySelector(selector);
}
function forEach(list, callback) {
  const length = list.length;
  for (let i = 0; i < length; i ++) callback(list[i], i, list);
}
function debounce(func, time) {
  function run() {
    cancel();
    func();
  }
  function cancel() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }
  var timer;
  return function () {
    cancel();
    timer = setTimeout(run, time);
  };
}
function merge() {
  var result = [];
  forEach(arguments, list => {
    result = result.concat(result.slice.call(list));
  });
  return result;
}
function insertData(dataTransfer) {
  const text = dataTransfer.getData('text/plain');
  text && document.execCommand('insertText', false, text);
}
function findPos(pos) {
  var cur = pos.el;
  var offset = pos.offset;
  while (cur && offset) {
    if (cur.nodeType === 3) {
      if (offset > cur.length) {
        offset -= cur.length;
      } else {
        return {
          el: cur,
          offset,
        };
      };
    } else {
      var children = cur.childNodes;
      for (var i = 0; i < children.length; i ++) {
        var res = findPos({
          el: children[i],
          offset,
        });
        if (res.el) return res;
        offset = res.offset;
      }
    }
    cur = cur.nextSibling;
  }
  return {offset};
}
function splitByLength(length) {
  return function (text) {
    return [text.slice(0, length), text.slice(length)];
  };
}
function markedInput(options) {
  function init() {
    el = options.el;
    splitText = options.splitText;
    // debounced to avoid multiple check at a time
    debouncedCheck = debounce(check, options.debounce);
    el.addEventListener('paste', onPaste);
    el.addEventListener('drop', onDrop);
    el.addEventListener('input', onInput);
    el.addEventListener('compositionstart', onCompositionStart);
    el.addEventListener('compositionend', onCompositionEnd);
    el.contentEditable = true;
    pieces = [];
  }
  function destroy() {
    el.removeEventListener('paste', onPaste);
    el.removeEventListener('drop', onDrop);
    el.removeEventListener('input', onInput);
    el.removeEventListener('compositionstart', onCompositionStart);
    el.removeEventListener('compositionend', onCompositionEnd);
    el.contentEditable = false;
  }
  function onInput(e) {
    if (!composition) {
      debouncedCheck();
    }
  }
  function onPaste(e) {
    e.preventDefault();
    insertData(e.clipboardData);
  }
  function onDrop(e) {
    e.preventDefault();
    insertData(e.dataTransfer);
  }
  function onCompositionStart(e) {
    composition = true;
  }
  function onCompositionEnd(e) {
    composition = false;
  }
  function getValue() {
    return pieces[0] || '';
  }
  function setValue(text) {
    pieces = splitText(text);
    el.textContent = pieces[0] || '';
    if (pieces[1]) {
      const em = document.createElement('em');
      em.textContent = pieces[1];
      el.appendChild(em);
    }
  }
  function check() {
    function walk(node) {
      if (node.nodeType === 3) {
        text += node.textContent;
        if (start.el) {
          if (node === start.el) start.el = null;
          else {
            start.offset += node.length;
            end.offset += node.length;
          }
        }
        if (!start.el && end.el) {
          if (node === end.el) end.el = null;
          else end.offset += node.length;
        }
      } else {
        // unwrap element nodes
        queue = merge(node.childNodes, queue);
      }
    }
    const sel = window.getSelection();
    const rng = sel.getRangeAt(0);
    const start = {
      el: rng.startContainer,
      offset: rng.startOffset,
    };
    const end = {
      el: rng.endContainer,
      offset: rng.endOffset,
    };
    var text = '';
    var queue = merge(el.childNodes);
    while (queue.length) walk(queue.shift());
    setValue(text);
    start.el = end.el = el.firstChild;
    const newStart = findPos(start);
    const newEnd = findPos(end);
    rng.setStart(newStart.el, newStart.offset);
    rng.setEnd(newEnd.el, newEnd.offset);
    sel.removeAllRanges();
    sel.addRange(rng);
    options.onChange && options.onChange(pieces[0] || '');
  }
  var el, splitText, pieces, debouncedCheck, composition;
  init();
  return {
    el,
    getValue,
    setValue,
    destroy,
  };
}
markedInput.init = function (options) {
  if (typeof options === 'string') options = {el: options};
  var el = options.el;
  if (typeof el === 'string') el = $(el);
  var splitText = options.splitText || 10;
  if (typeof splitText !== 'function') splitText = splitByLength(splitText);
  options = Object.assign({}, options, {
    el,
    splitText,
  });
  return markedInput(options);
};

  return markedInput;
});
