// Copy-to-clipboard buttons for highlighted code blocks.
(function () {
  function addCopyButtonToCodeBlocks() {
    // Get all code blocks with a class of "language-*"
    const codeBlocks = document.querySelectorAll('code[class^="language-"]');

    codeBlocks.forEach((codeBlock) => {
      const codeBlockContainer =
        codeBlock.closest(".highlight div") || codeBlock.parentNode;
      const copyButton = document.createElement("button");
      copyButton.classList.add("copy-code-button");
      copyButton.type = "button";
      copyButton.setAttribute("aria-label", "Copy code");
      copyButton.setAttribute("title", "Copy code");
      copyButton.innerHTML =
        '<span class="material-symbols-outlined" aria-hidden="true">content_copy</span>';

      // Add a click event listener to the copy button
      copyButton.addEventListener("click", () => {
        // Copy the code inside the code block to the clipboard
        const elements = codeBlock.querySelectorAll(".cl");
        let codeToCopy = codeBlock.innerText;
        if (elements.length > 0) {
          codeToCopy = "";
          elements.forEach((element) => {
            codeToCopy += element.innerText;
          });
        }
        navigator.clipboard.writeText(codeToCopy);

        // Update the copy button text to indicate that the code has been copied
        copyButton.setAttribute("aria-label", "Code copied");
        copyButton.setAttribute("title", "Code copied");
        copyButton.innerHTML =
          '<span class="material-symbols-outlined" aria-hidden="true">check</span>';
        setTimeout(() => {
          copyButton.setAttribute("aria-label", "Copy code");
          copyButton.setAttribute("title", "Copy code");
          copyButton.innerHTML =
            '<span class="material-symbols-outlined" aria-hidden="true">content_copy</span>';
        }, 1500);
      });

      // Add the copy button to the code block
      codeBlockContainer.append(copyButton);
    });
  }
  setTimeout(addCopyButtonToCodeBlocks, 100);
})();
