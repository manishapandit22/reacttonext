interface TippyInstance {
  setContent: (content: string) => void;
  show: () => void;
}

interface ButtonWithTippy extends HTMLElement {
  _tippy: TippyInstance;
  dataset: DOMStringMap;
}

class CopyToClipboard {
  private copyBtn: NodeListOf<Element>;

  constructor() {
    this.copyBtn = document.querySelectorAll(".js-copy-clipboard");
    this.events();
  }

  events(): void {
    this.copyBtn.forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleClick(e));
    });
  }

  handleClick(e: Event): void {
    const btn = e.currentTarget as ButtonWithTippy;
    const tippyLabel = btn.dataset.tippyContent || "";

    if ((document.body as any).createTextRange) {
      const range = (document.body as any).createTextRange();

      range.moveToElementText(btn);
      range.select();
      range.setSelectionRange(0, 99999); /* For mobile devices */
      navigator.clipboard.writeText(range.value);
      btn._tippy.setContent("Copied!");
      btn._tippy.show();
      setTimeout(() => {
        btn._tippy.setContent(tippyLabel);
      }, 1000);
    } else {
      const selection = window.getSelection();
      const range = document.createRange();

      range.selectNodeContents(btn);
      selection?.removeAllRanges();
      selection?.addRange(range);
      if (selection?.focusNode) {
        navigator.clipboard.writeText((selection.focusNode as any).innerText || "");
      }
      btn._tippy.setContent("Copied!");
      btn._tippy.show();
      setTimeout(() => {
        btn._tippy.setContent(tippyLabel);
      }, 1000);
    }
  }
}

export default CopyToClipboard;

