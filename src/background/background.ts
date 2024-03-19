const sendMessageToUser = async (link, message) => {
  console.log("MESSAGE TO : ", link);
  chrome.storage.local.set({ agentMessage: message });
  const messageTabId = await new Promise<number>((resolve) => {
    chrome.tabs.create(
      {
        url: link,
        active: true,
      },
      (tab) => resolve(tab.id)
    );
  });

  chrome.tabs.onUpdated.addListener(function tabUpdateListener(
    tabId,
    changeInfo
  ) {
    if (tabId === messageTabId && changeInfo.status === "complete") {
      chrome.tabs.onUpdated.removeListener(tabUpdateListener);

      setTimeout(() => {
        chrome.tabs.remove(messageTabId, () => {
          console.log("Tab closed.");
        });
      }, 10000);
    }
  });
};

const openOptionsPage = async () => {
  const createdTabId = await new Promise<number>((resolve) => {
    chrome.tabs.create(
      {
        url: chrome.runtime.getURL("options.html"),
        active: true,
      },
      (tab) => resolve(tab.id)
    );
  });

  console.log("HERE IS OPTIONS PAGE : ", createdTabId);
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "OPEN_OPTIONPAGE") {
    openOptionsPage();
  } else if (request.action === "SEND_MESSAGE") {
    const link = `https://mbasic.facebook.com/profile.php?id=${request.user}&eav=AfaOZtP06KtwcohUXMijI7CJmht29uZfQ8kOo4tdX4BnpCTgOb693S77xj6E3dlfv90&paipv=0`;
    const message = request.message;
    sendMessageToUser(link, message);
  }
});
