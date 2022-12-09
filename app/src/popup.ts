export default async function main() {
  console.log("popup live");

  window.addEventListener("click", (e) => {
    const action = (e.target as HTMLElement)?.closest(`[data-action]`)?.getAttribute("data-action");

    switch (action) {
      case "reload":
        return chrome.runtime.reload();
    }
  });
}

main();
