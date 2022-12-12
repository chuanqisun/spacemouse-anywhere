export function injectIframe(file_path: string) {
  const node = document.getElementsByTagName("body")[0];
  const iframe = document.createElement("iframe");
  iframe.id = "spacemouse-extension";
  iframe.src = file_path;
  iframe.style.cssText = `
  height: 1px;
  overflow: hidden;
  position: fixed;
  top: 0;
  white-space: nowrap; 
  width: 1px;`; // visually hidden to prevent performance throttling
  node.appendChild(iframe);
}
