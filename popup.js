document.getElementById("solved").addEventListener("click", () => {
  disableSubmitButton();

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    // chrome.scripting.executeScript({
    //   target: { tabId: tabId },
    //   function: (tabId) => {
    //     document.body.style.backgroundColor = "lightblue";
    //     console.log("Tab ID:", tabId);
    //   },
    //   args: [tabId],
    // });
    // const API_URL = "https://esuejqaspbhebyjoycoi.supabase.co/functions/v1/validate-and-update";
    const API_URL = "http://127.0.0.1:54321/functions/v1/validate-and-update";
    chrome.tabs.get(tabId, (tab) => {
      if (tab.url.includes("https://leetcode.com/problems/")) {
        fetch("https://leetcode.com/graphql/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `{
              userStatus {
                userId
                isSignedIn
                isMockUser
                isPremium
                isVerified
                username
                avatar
                isAdmin
                isSuperuser
                permissions
                isTranslator
                activeSessionId
                checkedInToday
                notificationStatus {
                  lastModified
                  numUnread
                }
              }
            }`,
          }),
        })
          .then((res) => res.json())
          .then(async (data) => {
            log(tabId, data.data.userStatus);

            if (data.data.userStatus.isSignedIn === true) {
              await fetch(API_URL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  userData: data.data.userStatus,
                  problemUrl: tab.url,
                }),
              })
                .then((res) => res.json())
                .then((res) => {
                  serverMessage(res.message);
                  enableSubmitButton();
                  serverMessage(res.message);
                  log(tabId, "Invoked");
                  log(tabId, res);
                })
                .catch(console.error);
            } else {
              enableSubmitButton();
              alert("Please sign in to LeetCode");
            }
          })
          .catch(console.error);
      } else {
        enableSubmitButton();
        alert("This is not a LeetCode problem page.");
      }
    });
  });
});

function log(tabId, userData) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    function: (userData) => {
      console.log("userData:", userData);
    },
    args: [userData],
  });
}

function serverMessage(message) {
  document.getElementById("server-message").innerText = message;
}

function disableSubmitButton() {
  const button = document.getElementById("solved");
  button.disabled = true;
  button.innerText = "Please wait...";
  button.classList.add("loading");
}

function enableSubmitButton() {
  const button = document.getElementById("solved");
  button.disabled = false;
  button.innerText = "Submit";
  button.classList.remove("loading");
}
