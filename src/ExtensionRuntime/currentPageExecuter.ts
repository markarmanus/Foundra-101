const getCurrentTab = (): Promise<chrome.tabs.Tab> => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(tabs[0]);
      }
    });
  });
};

export { getCurrentTab };
